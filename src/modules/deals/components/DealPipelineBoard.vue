<template>
  <div class="space-y-4">
    <!-- Pipeline Canvas Scroll Area -->
    <div class="flex space-x-3.5 overflow-x-auto pb-5">
      <div 
        v-for="col in columns" 
        :key="col.stage"
        class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-xl p-3 flex flex-col min-w-[260px] h-[calc(100vh-280px)] shrink-0"
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
            {{ getStageDeals(col.stage).length }}
          </span>
        </div>

        <!-- Cards List -->
        <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div 
            v-for="deal in getStageDeals(col.stage)" 
            :key="deal._id || deal.id"
            class="bg-surface border border-default rounded-xl p-3 shadow-xs hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing text-xs space-y-2 group"
            :draggable="true"
            @dragstart="handleDragStart($event, deal)"
          >
            <!-- Card Details -->
            <div class="flex items-start justify-between">
              <router-link 
                :to="`/app/deals/${deal._id || deal.id}`"
                class="font-heading font-bold text-slate-850 dark:text-slate-100 truncate pr-2 hover:text-primary transition-colors block"
              >
                {{ deal.dealNumber || 'DEAL-FILE' }}
              </router-link>
              <span class="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 text-[8px] font-bold">
                {{ deal.healthScore || 90 }}%
              </span>
            </div>

            <!-- Customer -->
            <div class="text-[10px] font-semibold text-slate-700 dark:text-slate-350 truncate flex items-center gap-1.5">
              <PhUser :size="10" class="text-slate-400" />
              <span>{{ deal.customer?.name || 'Client' }}</span>
            </div>

            <!-- Unit & Project -->
            <div class="text-[9px] text-slate-450 space-y-0.5 leading-tight border-t border-dashed border-default pt-2">
              <p class="truncate flex items-center gap-1" v-if="deal.project?.name">
                <PhBuildings :size="10" class="text-slate-400" />
                <span>{{ deal.project.name }}</span>
              </p>
              <p class="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <PhKey :size="10" class="text-slate-400" />
                <span>Unit: {{ deal.unit?.unitNumber || 'Listing unit' }}</span>
              </p>
            </div>

            <!-- Pricing and expected commission -->
            <div class="flex items-center justify-between pt-1 text-[10px]">
              <span class="font-bold text-slate-800 dark:text-slate-100">
                {{ formatCurrency(deal.dealValue || deal.askingPrice) }}
              </span>
              <span class="text-emerald-600 font-bold">
                {{ formatCurrency(deal.commissionAmount || 15000) }}
              </span>
            </div>
          </div>

          <!-- Empty display -->
          <div 
            v-if="getStageDeals(col.stage).length === 0"
            class="h-28 border border-dashed border-default rounded-xl flex items-center justify-center text-[10px] text-slate-400 text-center p-4 italic"
          >
            No deal files in this milestone.
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Cancellation Zone -->
    <div 
      class="border-2 border-dashed border-red-200 dark:border-red-900 bg-red-50/20 dark:bg-red-950/10 rounded-xl p-3 flex items-center justify-center space-x-2 text-xs font-bold text-red-655 hover:bg-red-55/30 transition-colors py-4"
      @dragover.prevent
      @drop="handleCancelDrop($event)"
    >
      <PhWarning :size="14" class="text-red-500" />
      <span>Drag cards here to initiate Deal Cancellation Workflow</span>
    </div>
  </div>
</template>

<script setup>
// Phosphor icons
import { PhUser, PhBuildings, PhKey, PhWarning } from '@phosphor-icons/vue';

const props = defineProps({
  deals: { type: Array, required: true }
});

const emit = defineEmits(['stageChange', 'cancelDeal', 'startWizard']);

const columns = [
  { stage: 'draft', label: 'Reserved', colorClass: 'bg-slate-450' },
  { stage: 'token_received', label: 'Token Received', colorClass: 'bg-amber-500' },
  { stage: 'booking_confirmed', label: 'Booking', colorClass: 'bg-blue-500' },
  { stage: 'agreement_executed', label: 'Agreement', colorClass: 'bg-purple-500' },
  { stage: 'registration_completed', label: 'Registration', colorClass: 'bg-indigo-500' },
  { stage: 'commission_eligible', label: 'Eligible', colorClass: 'bg-emerald-500' },
  { stage: 'deal_closed', label: 'Closed Won', colorClass: 'bg-red-500' }
];

const getStageDeals = (stage) => {
  return props.deals.filter(d => {
    // Map booking_initiated to booking_confirmed for pipeline columns visual alignment
    let currentStage = d.status;
    if (currentStage === 'booking_initiated') currentStage = 'booking_confirmed';
    if (currentStage === 'commission_received') currentStage = 'deal_closed';
    return currentStage === stage;
  });
};

const handleDragStart = (evt, deal) => {
  evt.dataTransfer.setData('text/plain', deal._id || deal.id);
  evt.dataTransfer.effectAllowed = 'move';
};

const handleDrop = (evt, targetStage) => {
  const dealId = evt.dataTransfer.getData('text/plain');
  const targetDeal = props.deals.find(d => (d._id || d.id) === dealId);
  if (!targetDeal) return;

  const currentStage = targetDeal.status;
  if (currentStage === targetStage) return;

  // 1. Intercept drag to Booking stage and launch booking wizard
  if (targetStage === 'booking_confirmed' && currentStage !== 'booking_confirmed') {
    emit('startWizard', targetDeal);
    return;
  }

  // 2. Intercept drag to Commission Eligible and verify required documents
  if (targetStage === 'commission_eligible') {
    // We expect signed agreement and registration certificates
    const isDocVerified = targetDeal.documentsVerified || false; // simulated flag
    if (!isDocVerified) {
      alert('Slab Verification Failed: Both "Signed Agreement" and "Registration Certificate" must be uploaded and verified before eligibility.');
      return;
    }
  }

  // 3. Intercept Closed stage and check outstanding invoice balance
  if (targetStage === 'deal_closed') {
    const outstanding = targetDeal.outstandingAmount || 0; // simulated
    if (outstanding > 0) {
      alert('Closing Locked: Total outstanding invoices must be paid before deal closure.');
      return;
    }
  }

  emit('stageChange', { deal: targetDeal, oldStage: currentStage, newStage: targetStage });
};

const handleCancelDrop = (evt) => {
  const dealId = evt.dataTransfer.getData('text/plain');
  const targetDeal = props.deals.find(d => (d._id || d.id) === dealId);
  if (!targetDeal) return;

  emit('cancelDeal', targetDeal);
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
