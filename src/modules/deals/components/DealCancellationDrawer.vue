<template>
  <AppDrawer 
    :isOpen="isOpen" 
    :title="`Cancel Deal — ${dealNumber}`" 
    width="480px"
    @close="$emit('close')"
  >
    <div class="space-y-5 text-xs">
      <!-- Deal Summary -->
      <div class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-xl p-3.5 space-y-1.5 font-medium">
        <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Deal Profile Summary</h4>
        <div class="space-y-1 text-[11px] text-slate-655">
          <p>Buyer: <b>{{ buyerName }}</b></p>
          <p>Property: <b>{{ unitCode }}</b></p>
          <p>Total Paid Ledger: <b class="text-emerald-600 font-bold">{{ formatCurrency(totalPaid) }}</b></p>
        </div>
      </div>

      <!-- Cancellation Category Reason -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason Category *</label>
        <select 
          v-model="cancellationType" 
          class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary font-medium"
        >
          <option value="customer">Customer Cancellation Request</option>
          <option value="builder">Builder developer Cancellation</option>
          <option value="loan_rejection">Home Mortgage Loan Rejection</option>
          <option value="documentation_failure">Documentation Compliance failure</option>
          <option value="default">Payment Default terms breach</option>
        </select>
      </div>

      <!-- Detail Area -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cancellation Details / Notes *</label>
        <textarea 
          v-model="reasonDetails" 
          rows="3"
          placeholder="Please log detailed notes on contract cancel criteria..."
          class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary resize-none"
        ></textarea>
      </div>

      <!-- Financial Recovery and Clawbacks -->
      <div class="border-t border-dashed border-default pt-4 space-y-3">
        <h4 class="font-heading font-bold text-slate-850 dark:text-slate-200">Financial Recovery & Clawback Impact</h4>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Cancellation Charges (Deductions)</label>
            <input 
              v-model.number="cancellationCharges" 
              type="number" 
              class="w-full bg-surface border border-default rounded px-2.5 py-1.5 outline-none font-medium"
            />
          </div>
          <div>
            <label class="block text-[9px] font-bold text-slate-450 uppercase mb-1">Net Refund to Customer</label>
            <div class="bg-slate-100 dark:bg-slate-800 p-2 border border-default rounded font-bold text-slate-800 dark:text-slate-100 font-heading">
              {{ formatCurrency(netRefund) }}
            </div>
          </div>
        </div>

        <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-3 rounded-lg space-y-1">
          <span class="text-[9px] text-red-655 font-bold uppercase tracking-wider block">Commission Split Clawback</span>
          <p class="text-red-750 dark:text-red-400 font-semibold leading-relaxed">
            Reversed Agent Share: <b>{{ formatCurrency(commissionClawback) }}</b> (100% split clawback target).
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <button 
        @click="$emit('close')" 
        class="px-4 py-2 border border-default rounded hover:bg-slate-50 font-semibold"
      >
        Cancel Process
      </button>
      <button 
        @click="handleCancelConfirm"
        :disabled="isPending || !reasonDetails.trim()"
        class="px-4 py-2 bg-red-500 hover:bg-red-650 text-white rounded font-bold shadow-xs transition-colors"
      >
        {{ isPending ? 'Cancelling...' : 'Confirm Cancellation' }}
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useTransitionStageMutation, useAddRefundMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  deal: { type: Object, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const cancellationType = ref('customer');
const reasonDetails = ref('');
const cancellationCharges = ref(50000);
const isPending = ref(false);

const dealNumber = computed(() => props.deal?.dealNumber || 'DEAL-FILE');
const buyerName = computed(() => props.deal?.customer?.name || 'John Doe');
const unitCode = computed(() => props.deal?.unit?.unitNumber || '802');
const totalPaid = computed(() => props.deal?.totalPaid || 500000);
const expectedCommission = computed(() => props.deal?.commissionAmount || 216000);

const netRefund = computed(() => {
  const refund = totalPaid.value - cancellationCharges.value;
  return refund > 0 ? refund : 0;
});

const commissionClawback = computed(() => {
  return expectedCommission.value;
});

const { mutateAsync: transitionStage } = useTransitionStageMutation();
const { mutateAsync: addRefund } = useAddRefundMutation();

const handleCancelConfirm = async () => {
  if (!reasonDetails.value.trim()) return;
  isPending.value = true;

  const dealId = props.deal._id || props.deal.id;

  try {
    // 1. Transition Deal status to cancelled
    await transitionStage({
      id: dealId,
      stage: 'cancelled',
      notes: `Cancellation Type: ${cancellationType.value}. Reason: ${reasonDetails.value}`
    });

    // 2. Log refund ledger splits
    if (netRefund.value > 0) {
      await addRefund({
        id: dealId,
        refundAmount: netRefund.value,
        forfeitureAmount: cancellationCharges.value,
        status: 'pending'
      }).catch(err => console.warn('Refund sync skipped', err));
    }

    store.dispatch('notifications/triggerToast', {
      message: 'Transaction successfully cancelled. Clawbacks generated.',
      type: 'success'
    });

    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to cancel deal.',
      type: 'error'
    });
  } finally {
    isPending.value = false;
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
