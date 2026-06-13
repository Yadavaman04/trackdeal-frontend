<template>
  <div class="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-220px)] items-start select-none">
    <!-- Kanban Column Wrapper -->
    <div 
      v-for="col in columns" 
      :key="col.stage"
      @dragover.prevent
      @drop="handleDrop($event, col.stage)"
      class="w-72 bg-slate-50 dark:bg-slate-900/50 border border-default rounded-xl p-3 flex flex-col h-full shrink-0"
    >
      <!-- Column Header -->
      <div class="flex items-center justify-between mb-3 shrink-0">
        <div class="flex items-center space-x-1.5">
          <span class="w-2.5 h-2.5 rounded-full" :class="col.color"></span>
          <span class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200">{{ col.label }}</span>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {{ getColumnLeads(col.stage).length }}
        </span>
      </div>

      <!-- Scrollable Cards area -->
      <div class="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[150px]">
        <div 
          v-for="lead in getColumnLeads(col.stage)" 
          :key="lead._id || lead.id"
          draggable="true"
          @dragstart="handleDragStart($event, lead)"
          class="bg-surface border border-default hover:border-primary rounded-lg p-3 shadow-xs hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing group relative"
        >
          <!-- Score Indicator -->
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
              {{ lead.source?.replace(/_/g, ' ') || 'Manual' }}
            </span>
            <span 
              class="font-heading text-[10px] font-bold"
              :class="[
                lead.score >= 70 ? 'text-emerald-500' : lead.score >= 35 ? 'text-amber-500' : 'text-red-500'
              ]"
            >
              ★ {{ lead.score }}
            </span>
          </div>

          <!-- Name -->
          <router-link 
            :to="`/app/leads/${lead._id || lead.id}`" 
            class="font-heading text-xs font-bold text-slate-800 dark:text-slate-100 block group-hover:text-primary transition-colors mb-2"
          >
            {{ lead.firstName }} {{ lead.lastName || '' }}
          </router-link>

          <!-- Requirements Summary -->
          <div v-if="lead.requirements" class="space-y-1 mb-2 border-t border-slate-50 dark:border-slate-850 pt-2 text-[10px] text-slate-500 dark:text-slate-400">
            <div v-if="lead.requirements.propertyType?.length > 0" class="flex items-center justify-between">
              <span>Type:</span>
              <span class="font-semibold capitalize text-slate-700 dark:text-slate-350">
                {{ lead.requirements.propertyType.join(', ') }}
              </span>
            </div>
            <div v-if="lead.requirements.budget?.min || lead.requirements.budget?.max" class="flex items-center justify-between">
              <span>Budget:</span>
              <span class="font-semibold text-slate-700 dark:text-slate-350">
                {{ formatBudget(lead.requirements.budget) }}
              </span>
            </div>
          </div>

          <!-- Footer Stack -->
          <div class="flex items-center justify-between border-t border-slate-50 dark:border-slate-850 pt-2 mt-2">
            <div v-if="lead.assignedTo" class="flex items-center space-x-1">
              <div class="w-4 h-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[8px] font-bold text-primary capitalize">
                {{ lead.assignedTo.firstName?.charAt(0) }}
              </div>
              <span class="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
                {{ lead.assignedTo.firstName }}
              </span>
            </div>
            <span v-else class="text-[9px] text-slate-400 italic">Unassigned</span>
            
            <span class="text-[8px] text-slate-400 dark:text-slate-500">
              {{ formatTimeAgo(lead.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  leads: { type: Array, required: true }
});

const emit = defineEmits(['stageChange']);

const columns = [
  { stage: 'new', label: 'New Lead', color: 'bg-blue-500' },
  { stage: 'contacted', label: 'Contacted', color: 'bg-sky-500' },
  { stage: 'qualified', label: 'Qualified', color: 'bg-teal-500' },
  { stage: 'site_visit_scheduled', label: 'Site Visit', color: 'bg-purple-500' },
  { stage: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { stage: 'booked', label: 'Booking', color: 'bg-emerald-500' },
  { stage: 'won', label: 'Won', color: 'bg-green-500' },
  { stage: 'lost', label: 'Lost', color: 'bg-red-500' }
];

const getColumnLeads = (stage) => {
  return props.leads.filter(lead => {
    // Normalizations for Kanban columns matching database status strings
    const current = lead.status;
    if (stage === 'booked') {
      return current === 'booked' || current === 'booking_initiated';
    }
    if (stage === 'site_visit_scheduled') {
      return current === 'site_visit_scheduled' || current === 'site_visit_completed';
    }
    return current === stage;
  });
};

const handleDragStart = (e, lead) => {
  e.dataTransfer.setData('text/plain', lead._id || lead.id);
  e.dataTransfer.effectAllowed = 'move';
};

const handleDrop = (e, targetStage) => {
  const id = e.dataTransfer.getData('text/plain');
  if (!id) return;
  
  // Find lead to double check if stage is changing
  const lead = props.leads.find(l => (l._id || l.id) === id);
  if (lead && lead.status !== targetStage) {
    emit('stageChange', { id, status: targetStage });
  }
};

const formatBudget = (budget) => {
  if (!budget) return '—';
  const formatNum = (num) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)} L`;
    return `$${num.toLocaleString()}`;
  };
  return `${formatNum(budget.min || 0)} - ${formatNum(budget.max || 0)}`;
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};
</script>
