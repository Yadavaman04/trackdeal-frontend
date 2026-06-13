<template>
  <div
    class="relative overflow-x-auto border rounded-card"
    style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
  >
    <table class="min-w-full divide-y" style="border-color: hsl(var(--neutral-100));">

      <!-- Sticky Header -->
      <thead style="background-color: hsl(var(--neutral-0));">
        <tr class="h-9">
          <!-- Bulk checkbox -->
          <th v-if="selectable" class="w-10 px-4 text-center">
            <input
              type="checkbox"
              :checked="allSelected"
              :indeterminate="someSelected"
              @change="toggleSelectAll"
              class="w-3.5 h-3.5 rounded accent-accent-600 cursor-pointer"
            />
          </th>

          <!-- Column headers -->
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 text-left select-none"
            :class="col.sortable ? 'cursor-pointer' : ''"
            @click="col.sortable && handleHeaderClick(col)"
          >
            <div class="flex items-center gap-1.5">
              <span class="text-label font-semibold uppercase tracking-wider" style="color: hsl(var(--neutral-400));">
                {{ col.label }}
              </span>
              <!-- Sort indicators -->
              <template v-if="col.sortable">
                <PhArrowUp
                  v-if="sorting?.field === col.key && sorting?.direction === 'asc'"
                  :size="12"
                  weight="bold"
                  style="color: hsl(var(--accent-500));"
                />
                <PhArrowDown
                  v-else-if="sorting?.field === col.key && sorting?.direction === 'desc'"
                  :size="12"
                  weight="bold"
                  style="color: hsl(var(--accent-500));"
                />
                <PhArrowsDownUp
                  v-else
                  :size="12"
                  style="color: hsl(var(--neutral-300));"
                />
              </template>
            </div>
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody class="divide-y" style="border-color: hsl(var(--neutral-100));">

        <!-- Loading: Skeleton rows -->
        <template v-if="isLoading">
          <tr v-for="i in skeletonRows" :key="`sk-${i}`" class="h-10">
            <td v-if="selectable" class="px-4">
              <div class="skeleton w-3.5 h-3.5 rounded mx-auto" />
            </td>
            <td v-for="col in columns" :key="col.key" class="px-4">
              <div class="skeleton h-3.5 rounded" :style="{ width: `${50 + (i * 13) % 40}%` }" />
            </td>
          </tr>
        </template>

        <!-- Empty state -->
        <template v-else-if="rows.length === 0">
          <tr>
            <td
              :colspan="columns.length + (selectable ? 1 : 0)"
              class="text-center py-16"
            >
              <div class="flex flex-col items-center gap-3">
                <PhEmpty :size="40" style="color: hsl(var(--neutral-200));" />
                <div>
                  <p class="text-body font-medium" style="color: hsl(var(--neutral-500));">{{ emptyTitle }}</p>
                  <p v-if="emptySubtext" class="text-body-sm mt-1" style="color: hsl(var(--neutral-400));">{{ emptySubtext }}</p>
                </div>
              </div>
            </td>
          </tr>
        </template>

        <!-- Data rows -->
        <template v-else>
          <tr
            v-for="(row, idx) in rows"
            :key="row.id || idx"
            class="h-10 group transition-colors duration-80 relative"
            :style="{
              backgroundColor: isSelected(row)
                ? 'hsl(var(--accent-50))'
                : 'transparent'
            }"
            @mouseenter="(e) => { if (!isSelected(row)) e.currentTarget.style.backgroundColor = 'hsl(var(--neutral-25))'; }"
            @mouseleave="(e) => { if (!isSelected(row)) e.currentTarget.style.backgroundColor = 'transparent'; }"
            @click="$emit('rowClick', row)"
          >
            <!-- Checkbox -->
            <td v-if="selectable" class="px-4 text-center" @click.stop>
              <input
                type="checkbox"
                :checked="isSelected(row)"
                @change="toggleSelectRow(row)"
                class="w-3.5 h-3.5 rounded accent-accent-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-80"
                :class="{ 'opacity-100': isSelected(row) }"
              />
            </td>

            <!-- Cells -->
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 whitespace-nowrap text-body"
              style="color: hsl(var(--neutral-700));"
            >
              <slot :name="`cell(${col.key})`" :row="row" :value="row[col.key]">
                <span v-if="row[col.key] !== null && row[col.key] !== undefined">{{ row[col.key] }}</span>
                <span v-else style="color: hsl(var(--neutral-300));">—</span>
              </slot>
            </td>

            <!-- Hover row actions (right-aligned) -->
            <td
              v-if="$slots.rowActions"
              class="px-4 w-px"
              @click.stop
            >
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-80">
                <slot name="rowActions" :row="row" />
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { PhArrowUp, PhArrowDown, PhArrowsDownUp, PhEmpty } from '@phosphor-icons/vue';

const props = defineProps({
  rows:         { type: Array,  required: true },
  columns:      { type: Array,  required: true },
  selectable:   { type: Boolean, default: false },
  selectedRows: { type: Array,  default: () => [] },
  sorting:      { type: Object, default: () => ({ field: '', direction: '' }) },
  isLoading:    { type: Boolean, default: false },
  skeletonRows: { type: Number, default: 6 },
  emptyTitle:   { type: String, default: 'No results found' },
  emptySubtext: { type: String, default: '' },
});

const emit = defineEmits(['sort', 'selectionChange', 'rowClick']);

const allSelected  = computed(() => props.rows.length > 0 && props.rows.every(r => isSelected(r)));
const someSelected = computed(() => props.rows.some(r => isSelected(r)) && !allSelected.value);

const isSelected    = (row) => props.selectedRows.some(s => s.id === row.id);
const toggleSelectRow = (row) => {
  const updated = isSelected(row)
    ? props.selectedRows.filter(s => s.id !== row.id)
    : [...props.selectedRows, row];
  emit('selectionChange', updated);
};
const toggleSelectAll = (e) => emit('selectionChange', e.target.checked ? [...props.rows] : []);
const handleHeaderClick = (col) => {
  const direction = props.sorting.field === col.key && props.sorting.direction === 'asc' ? 'desc' : 'asc';
  emit('sort', { field: col.key, direction });
};
</script>
