<template>
  <div class="space-y-4">
    <!-- Leads List Grid Table -->
    <AppTable 
      :columns="columns"
      :rows="rows"
      :selectable="true"
      :selectedRows="selectedLeads"
      :isLoading="isLoading"
      @selectionChange="handleSelectionChange"
      @sort="handleSort"
      :sorting="sorting"
    >
      <!-- Slot for Lead Name -->
      <template #cell(name)="{ row }">
        <div class="flex items-center space-x-2">
          <!-- Aging Dot Indicator -->
          <span 
            class="w-2 h-2 rounded-full shrink-0" 
            :class="getAgingDotClass(row.createdAt)"
            :title="getAgingTitle(row.createdAt)"
          ></span>
          <router-link 
            :to="`/app/leads/${row._id || row.id}`" 
            class="font-semibold text-primary hover:underline block cursor-pointer"
          >
            {{ row.firstName }} {{ row.lastName || '' }}
          </router-link>
        </div>
      </template>

      <!-- Slot for Contact Stack -->
      <template #cell(contacts)="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-800 dark:text-slate-200">{{ row.mobile }}</span>
          <span v-if="row.email" class="text-[10px] text-slate-400 dark:text-slate-500">{{ row.email }}</span>
        </div>
      </template>

      <!-- Slot for Source Details -->
      <template #cell(source)="{ value }">
        <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-default text-[10px] text-slate-600 dark:text-slate-400 font-semibold capitalize">
          {{ value.replace(/_/g, ' ') }}
        </span>
      </template>

      <!-- Slot for Stage Badge -->
      <template #cell(status)="{ value }">
        <LeadStageBadge :stage="value" />
      </template>

      <!-- Slot for Score Gauge -->
      <template #cell(score)="{ value }">
        <span 
          class="font-bold font-heading text-xs"
          :class="[
            value >= 70 ? 'text-emerald-500' : value >= 35 ? 'text-amber-500' : 'text-red-500'
          ]"
        >
          {{ value }}
        </span>
      </template>

      <!-- Slot for Owner Agent -->
      <template #cell(assignedTo)="{ value }">
        <div v-if="value" class="flex items-center space-x-2">
          <div class="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary capitalize">
            {{ value.firstName?.charAt(0) || 'A' }}
          </div>
          <span class="text-xs text-slate-700 dark:text-slate-350">
            {{ value.firstName }} {{ value.lastName || '' }}
          </span>
        </div>
        <span v-else class="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
      </template>

      <!-- Slot for Created Date -->
      <template #cell(createdAt)="{ value }">
        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          {{ formatDate(value) }}
        </span>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppTable from '@/components/AppTable.vue';
import LeadStageBadge from './LeadStageBadge.vue';

const props = defineProps({
  rows: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  selectedLeads: { type: Array, default: () => [] }
});

const emit = defineEmits(['sort', 'selectionChange']);

const sorting = ref({ field: 'createdAt', direction: 'desc' });

const columns = [
  { key: 'name', label: 'Lead Profile', sortable: true },
  { key: 'contacts', label: 'Contact details' },
  { key: 'source', label: 'Source', sortable: true },
  { key: 'status', label: 'Stage Pipeline', sortable: true },
  { key: 'score', label: 'Health Score', sortable: true },
  { key: 'assignedTo', label: 'Assigned Agent' },
  { key: 'createdAt', label: 'Registered On', sortable: true }
];

const handleSelectionChange = (updatedSelection) => {
  emit('selectionChange', updatedSelection);
};

const handleSort = (sortOption) => {
  sorting.value = sortOption;
  emit('sort', sortOption);
};

const getAgingDotClass = (dateStr) => {
  if (!dateStr) return 'bg-slate-300';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) return 'bg-green-500';
  if (diffDays <= 7) return 'bg-yellow-400';
  if (diffDays <= 14) return 'bg-orange-500';
  return 'bg-red-500';
};

const getAgingTitle = (dateStr) => {
  if (!dateStr) return 'Unknown Age';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return `Registered ${diffDays} days ago`;
};

const formatDate = (val) => {
  if (!val) return '';
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
</script>
