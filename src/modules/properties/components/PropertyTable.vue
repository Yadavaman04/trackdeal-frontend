<template>
  <div class="space-y-4">
    <AppTable 
      :columns="columns"
      :rows="rows"
      :selectable="true"
      :selectedRows="selectedProperties"
      :isLoading="isLoading"
      @selectionChange="handleSelectionChange"
      @sort="handleSort"
      :sorting="sorting"
    >
      <!-- Slot for Unit Code -->
      <template #cell(unitCode)="{ row }">
        <router-link 
          :to="`/app/properties/${row._id || row.id}`" 
          class="font-semibold text-primary hover:underline block cursor-pointer"
        >
          {{ row.title }}
        </router-link>
        <span class="text-[9px] text-slate-400 font-mono">{{ row._id || row.id }}</span>
      </template>

      <!-- Slot for Project -->
      <template #cell(project)="{ row }">
        <span v-if="row.project && typeof row.project === 'object'">
          <router-link 
            :to="`/app/projects/${row.project._id || row.project.id}`" 
            class="text-slate-800 dark:text-slate-200 hover:underline font-medium"
          >
            {{ row.project.name }}
          </router-link>
        </span>
        <span v-else-if="row.project" class="text-slate-800 dark:text-slate-200 font-medium">
          Linked Project
        </span>
        <span v-else class="text-slate-400 dark:text-slate-500 italic">Independent listing</span>
      </template>

      <!-- Slot for Builder -->
      <template #cell(builder)="{ row }">
        <span v-if="row.project?.builderId" class="text-slate-700 dark:text-slate-350">
          {{ row.project.builderId.name || 'Builder' }}
        </span>
        <span v-else class="text-slate-400 dark:text-slate-500 italic">—</span>
      </template>

      <!-- Slot for Configuration -->
      <template #cell(configuration)="{ row }">
        <span class="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-[10px] font-bold uppercase">
          {{ row.bhk ? `${row.bhk} BHK` : row.type }}
        </span>
      </template>

      <!-- Slot for Price -->
      <template #cell(price)="{ value }">
        <span class="font-bold text-slate-800 dark:text-slate-100 font-heading">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <!-- Slot for Floor / Facing -->
      <template #cell(floorDetails)="{ row }">
        <div class="text-slate-600 dark:text-slate-400 text-xs">
          <span>Floor {{ row.floors || 0 }} of {{ row.totalFloors || 0 }}</span>
          <span v-if="row.facing" class="capitalize block text-[10px] text-slate-400">Facing: {{ row.facing }}</span>
        </div>
      </template>

      <!-- Slot for Area -->
      <template #cell(carpetArea)="{ row }">
        <span class="font-medium text-slate-700 dark:text-slate-300">
          {{ row.area?.carpet || row.area?.superBuiltUp || 0 }} {{ row.area?.unit || 'sqft' }}
        </span>
      </template>

      <!-- Slot for Status Badge -->
      <template #cell(status)="{ value }">
        <span 
          class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase"
          :class="getStatusBadgeClass(value)"
        >
          ● {{ value }}
        </span>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppTable from '@/components/AppTable.vue';

const props = defineProps({
  rows: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  selectedProperties: { type: Array, default: () => [] }
});

const emit = defineEmits(['sort', 'selectionChange']);

const sorting = ref({ field: 'createdAt', direction: 'desc' });

const columns = [
  { key: 'unitCode', label: 'Unit Code', sortable: true },
  { key: 'project', label: 'Project' },
  { key: 'builder', label: 'Builder' },
  { key: 'configuration', label: 'Config' },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'floorDetails', label: 'Floor / Facing' },
  { key: 'carpetArea', label: 'Carpet Area' },
  { key: 'status', label: 'Status', sortable: true }
];

const handleSelectionChange = (updatedSelection) => {
  emit('selectionChange', updatedSelection);
};

const handleSort = (sortOption) => {
  sorting.value = sortOption;
  emit('sort', sortOption);
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'available':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
    case 'reserved':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
    case 'blocked':
      return 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
    case 'sold':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50';
    default:
      return 'bg-slate-50 text-slate-550 border-slate-200 dark:bg-slate-900 dark:border-slate-800';
  }
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>
