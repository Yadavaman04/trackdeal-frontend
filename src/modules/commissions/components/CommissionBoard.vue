<template>
  <div class="space-y-4">
    <!-- Board Canvas Scroll Area -->
    <div class="flex space-x-3.5 overflow-x-auto pb-5">
      <div 
        v-for="col in columns" 
        :key="col.stage"
        class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-xl p-3 flex flex-col min-w-[240px] h-[calc(100vh-280px)] shrink-0"
        @dragover.prevent
        @drop="handleDrop($event, col.stage)"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between pb-2 border-b border-default mb-3 shrink-0">
          <div class="flex items-center space-x-1.5">
            <span class="w-2 h-2 rounded-full" :class="col.colorClass"></span>
            <h4 class="font-heading font-bold text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {{ col.label }}
            </h4>
          </div>
          <span class="text-[9px] font-bold bg-slate-200/50 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
            {{ getStageCommissions(col.stage).length }}
          </span>
        </div>

        <!-- Cards List -->
        <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div 
            v-for="comm in getStageCommissions(col.stage)" 
            :key="comm._id || comm.id"
            class="bg-surface border border-default rounded-xl p-3 shadow-xs hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing text-xs space-y-2 group"
            :draggable="true"
            @dragstart="handleDragStart($event, comm)"
          >
            <!-- Card Title -->
            <div class="flex items-start justify-between">
              <router-link 
                :to="`/app/commissions/${comm._id || comm.id}`"
                class="font-heading font-bold text-primary truncate pr-2 hover:underline block"
              >
                {{ comm.commissionNumber || `#COM-${(comm._id || comm.id || '').substring(18).toUpperCase()}` }}
              </router-link>
              <span 
                class="px-1.5 py-0.2 rounded text-[8px] font-bold"
                :class="comm.payoutReleased ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
              >
                {{ comm.payoutReleased ? 'Released' : 'Pending' }}
              </span>
            </div>

            <!-- Linked Deal -->
            <p class="text-[10px] font-semibold text-slate-700 dark:text-slate-350 truncate flex items-center gap-1">
              <PhHandshake :size="12" class="text-slate-400" />
              <span>Deal: {{ comm.deal?.dealNumber || comm.dealNumber || 'DEAL-FILE' }}</span>
            </p>

            <!-- Builder & Project -->
            <div class="text-[9px] text-slate-450 space-y-1 leading-tight border-t border-dashed border-default pt-2 flex flex-col">
              <p class="truncate flex items-center gap-1" v-if="comm.builder?.name || comm.builderName">
                <PhBuilding :size="11" class="text-slate-400" />
                <span>{{ comm.builder?.name || comm.builderName }}</span>
              </p>
              <p class="font-semibold text-slate-655 flex items-center gap-1" v-if="comm.project?.name || comm.projectName">
                <PhKey :size="11" class="text-slate-450" />
                <span>Project: {{ comm.project?.name || comm.projectName }}</span>
              </p>
            </div>

            <!-- Pricing and commission amount -->
            <div class="flex items-center justify-between pt-1 text-[10px]">
              <div>
                <span class="text-slate-400 block text-[8px] uppercase">Net Receivable</span>
                <span class="font-bold text-slate-800 dark:text-slate-100">
                  {{ formatCurrency(comm.netReceivable || comm.grossCommission) }}
                </span>
              </div>
              <div class="text-right">
                <span class="text-slate-400 block text-[8px] uppercase">GST (18%)</span>
                <span class="text-emerald-600 font-bold">
                  {{ formatCurrency(comm.gstAmount || (comm.grossCommission * 0.18)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Empty Column placeholder -->
          <div 
            v-if="getStageCommissions(col.stage).length === 0"
            class="h-28 border border-dashed border-default rounded-xl flex items-center justify-center text-[10px] text-slate-400 text-center p-4 italic"
          >
            No records in this milestone.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PhHandshake, PhBuilding, PhKey } from '@phosphor-icons/vue';

const props = defineProps({
  commissions: { type: Array, required: true }
});

const emit = defineEmits(['stageChange']);

const columns = [
  { stage: 'expected', label: 'Expected', colorClass: 'bg-slate-400' },
  { stage: 'eligible', label: 'Eligible', colorClass: 'bg-amber-500' },
  { stage: 'invoice_raised', label: 'Invoice Raised', colorClass: 'bg-blue-400' },
  { stage: 'invoice_sent', label: 'Invoice Sent', colorClass: 'bg-blue-600' },
  { stage: 'partially_collected', label: 'Partially Collected', colorClass: 'bg-purple-400' },
  { stage: 'fully_collected', label: 'Fully Collected', colorClass: 'bg-purple-600' },
  { stage: 'payout_eligible', label: 'Payout Eligible', colorClass: 'bg-indigo-400' },
  { stage: 'payout_approved', label: 'Payout Approved', colorClass: 'bg-indigo-600' },
  { stage: 'payout_released', label: 'Payout Released', colorClass: 'bg-emerald-500' },
  { stage: 'closed', label: 'Closed', colorClass: 'bg-slate-700' }
];

const getStageCommissions = (stage) => {
  return props.commissions.filter(c => c.stage === stage);
};

const handleDragStart = (evt, comm) => {
  evt.dataTransfer.setData('text/plain', comm._id || comm.id);
  evt.dataTransfer.effectAllowed = 'move';
};

const handleDrop = (evt, targetStage) => {
  const commId = evt.dataTransfer.getData('text/plain');
  const targetComm = props.commissions.find(c => (c._id || c.id) === commId);
  if (!targetComm) return;

  const currentStage = targetComm.stage;
  if (currentStage === targetStage) return;

  emit('stageChange', { commission: targetComm, oldStage: currentStage, newStage: targetStage });
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
