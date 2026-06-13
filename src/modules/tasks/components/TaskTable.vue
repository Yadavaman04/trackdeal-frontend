<template>
  <div class="space-y-4">
    <AppTable 
      :columns="columns"
      :rows="rows"
      :selectable="true"
      :selectedRows="selectedTasks"
      :isLoading="isLoading"
      @selectionChange="handleSelectionChange"
      @sort="handleSort"
      :sorting="sorting"
    >
      <!-- Task Title & Related Entity Slot -->
      <template #cell(title)="{ row }">
        <div class="flex flex-col">
          <button 
            type="button"
            @click="$emit('select', row)"
            class="font-bold text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary text-left transition-colors cursor-pointer"
          >
            {{ row.title }}
          </button>
          <span v-if="row.description" class="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[280px]">
            {{ row.description }}
          </span>
          <!-- Associated Lead / Deal Details link badges -->
          <div class="flex items-center space-x-1.5 mt-1" v-if="row.leadId || row.dealId">
            <span v-if="row.leadId" class="inline-flex items-center text-[9px] bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40 px-1.5 py-0.5 rounded font-semibold gap-1">
              <PhUser :size="10" />
              <span>Lead:</span>
              <router-link :to="`/app/leads/${row.leadId._id || row.leadId}`" class="hover:underline ml-0.5">
                {{ getLeadName(row.leadId) }}
              </router-link>
            </span>
            <span v-if="row.dealId" class="inline-flex items-center text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-1.5 py-0.5 rounded font-semibold gap-1">
              <PhHandshake :size="10" />
              <span>Deal:</span>
              <router-link :to="`/app/deals/${row.dealId._id || row.dealId}`" class="hover:underline ml-0.5">
                {{ row.dealId.title || 'View Deal' }}
              </router-link>
            </span>
          </div>
        </div>
      </template>

      <!-- Task Type Slot -->
      <template #cell(type)="{ value }">
        <span :class="['px-2 py-0.5 rounded text-[9px] font-bold border capitalize flex items-center w-fit gap-1', getTypeBadgeClass(value)]">
          <component :is="getTypeIcon(value)" :size="12" class="shrink-0" />
          <span>{{ value.replace('_', ' ') }}</span>
        </span>
      </template>

      <!-- Priority Slot -->
      <template #cell(priority)="{ value }">
        <span :class="['px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase', getPriorityBadgeClass(value)]">
          {{ value }}
        </span>
      </template>

      <!-- Due Date Slot -->
      <template #cell(dueDate)="{ value, row }">
        <div class="flex flex-col">
          <span :class="['font-medium text-[10px]', isOverdue(value, row.status) ? 'text-red-650 font-bold' : 'text-slate-600 dark:text-slate-400']">
            {{ formatTime(value) }}
          </span>
          <span v-if="isOverdue(value, row.status)" class="inline-flex items-center text-[8px] text-red-500 font-semibold animate-pulse leading-none mt-0.5 gap-0.5">
            <PhWarning :size="9" />
            <span>OVERDUE</span>
          </span>
        </div>
      </template>

      <!-- Owner Agent Slot -->
      <template #cell(assignedTo)="{ value }">
        <div v-if="value" class="flex items-center space-x-2">
          <div class="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary capitalize shrink-0">
            {{ value.firstName?.charAt(0) || 'A' }}
          </div>
          <span class="text-xs text-slate-700 dark:text-slate-350">
            {{ value.firstName }} {{ value.lastName || '' }}
          </span>
        </div>
        <span v-else class="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
      </template>

      <!-- Status Slot -->
      <template #cell(status)="{ value }">
        <span :class="['px-2 py-0.5 rounded text-[9px] font-bold border capitalize', getStatusBadgeClass(value)]">
          {{ value.replace('_', ' ') }}
        </span>
      </template>

      <!-- Actions Slot -->
      <template #cell(actions)="{ row }">
        <div class="flex items-center space-x-2 justify-end">
          <!-- Quick Complete button -->
          <button 
            v-if="row.status === 'pending' || row.status === 'in_progress'"
            @click="$emit('complete', row)"
            class="text-[10px] text-emerald-650 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.8 rounded font-semibold transition-colors flex items-center gap-1"
            title="Mark Completed"
          >
            <PhCheck :size="10" />
            <span>Complete</span>
          </button>
          <!-- Quick Cancel button -->
          <button 
            v-if="row.status === 'pending' || row.status === 'in_progress'"
            @click="$emit('cancelTask', row)"
            class="text-[10px] text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900/50 px-2 py-0.8 rounded font-semibold transition-colors flex items-center gap-1"
            title="Cancel Task"
          >
            <PhX :size="10" />
            <span>Cancel</span>
          </button>
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppTable from '@/components/AppTable.vue';
import {
  PhPhone, PhChatCircle, PhEnvelope, PhHouse, PhHandshake,
  PhFileText, PhCreditCard, PhGear, PhUser, PhWarning,
  PhCheck, PhX
} from '@phosphor-icons/vue';

const props = defineProps({
  rows: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  selectedTasks: { type: Array, default: () => [] }
});

const emit = defineEmits(['sort', 'selectionChange', 'select', 'complete', 'cancelTask']);

const sorting = ref({ field: 'dueDate', direction: 'asc' });

const columns = [
  { key: 'title', label: 'Task Detail', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'dueDate', label: 'Due Date', sortable: true },
  { key: 'assignedTo', label: 'Assigned Agent' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: '' }
];

const handleSelectionChange = (updatedSelection) => {
  emit('selectionChange', updatedSelection);
};

const handleSort = (sortOption) => {
  sorting.value = sortOption;
  emit('sort', sortOption);
};

const getLeadName = (lead) => {
  if (!lead) return 'Unknown';
  if (typeof lead === 'string') return 'View Lead';
  return `${lead.firstName} ${lead.lastName || ''}`.trim();
};

const isOverdue = (dateStr, status) => {
  if (!dateStr || ['completed', 'cancelled'].includes(status)) return false;
  return new Date(dateStr).getTime() < Date.now();
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'call': return PhPhone;
    case 'whatsapp': return PhChatCircle;
    case 'email': return PhEnvelope;
    case 'site_visit': return PhHouse;
    case 'meeting': return PhHandshake;
    case 'document': return PhFileText;
    case 'payment': return PhCreditCard;
    default: return PhGear;
  }
};

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'call':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900/40';
    case 'whatsapp':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-450 dark:border-green-900/40';
    case 'email':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-450 dark:border-indigo-900/40';
    case 'site_visit':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-450 dark:border-purple-900/40';
    case 'meeting':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/40';
    case 'document':
      return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-450 dark:border-teal-900/40';
    case 'payment':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/40';
    default:
      return 'bg-slate-50 text-slate-655 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
  }
};

const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'low': return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-455 dark:border-slate-800';
    case 'medium': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-455 dark:border-sky-900/40';
    case 'high': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-455 dark:border-orange-900/40';
    case 'urgent': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-455 dark:border-red-900/40 font-bold';
    default: return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:border-slate-800';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-sky-50 text-sky-700 border-sky-250 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/50';
    case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
    case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-405 dark:border-emerald-900/50';
    case 'missed': return 'bg-red-50 text-red-700 border-red-250 dark:bg-red-950/20 dark:text-red-405 dark:border-red-900/50';
    case 'cancelled': return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-450 dark:border-slate-700';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
