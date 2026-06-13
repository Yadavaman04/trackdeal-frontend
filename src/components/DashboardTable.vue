<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-subtle text-left">
      <thead>
        <tr class="text-[11px] font-medium text-neutral-500 uppercase tracking-wider h-10 border-b border-subtle">
          <th v-for="col in columns" :key="col.key" class="px-3 py-2 font-medium">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-subtle text-caption text-neutral-700 dark:text-neutral-300">
        <template v-if="isLoading">
          <tr v-for="i in 3" :key="i" class="h-10">
            <td v-for="col in columns" :key="col.key" class="px-3 py-2">
              <div class="h-3 skeleton rounded w-2/3"></div>
            </td>
          </tr>
        </template>
        <template v-else-if="rows.length === 0">
          <tr>
            <td :colspan="columns.length" class="text-center py-8 text-neutral-400">
              {{ emptyText }}
            </td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="(row, idx) in rows" :key="row.id || idx" class="hover:bg-neutral-25 dark:hover:bg-neutral-25/5 transition-colors h-10">
            <td v-for="col in columns" :key="col.key" class="px-3 py-2 whitespace-nowrap">
              <slot :name="`cell(${col.key})`" :row="row" :value="row[col.key]">
                {{ row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '—' }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  emptyText: { type: String, default: 'No matching records found.' }
});
</script>
