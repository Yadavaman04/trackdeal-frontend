<template>
  <div class="space-y-6 text-xs font-medium">
    <!-- GST & TDS Panel (Slab-based calculations) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
        <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
          B2B Invoice Tax Breakdown (GST & TDS)
        </h4>

        <div class="space-y-2">
          <div class="flex justify-between items-center text-[10px]">
            <span class="text-slate-500 font-semibold">Gross Commission Base:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">{{ formatCurrency(grossCommission) }}</span>
          </div>

          <div class="flex justify-between items-center text-[10px]">
            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-semibold">B2B GST Addition:</span>
              <span class="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded">18% Standard</span>
            </div>
            <span class="font-bold text-emerald-600 font-heading">+ {{ formatCurrency(calculatedGst) }}</span>
          </div>

          <!-- TDS Slab Choice -->
          <div class="flex justify-between items-center text-[10px]">
            <div class="flex items-center space-x-2">
              <span class="text-slate-500 font-semibold">Corporate TDS Deduction:</span>
              <select 
                v-model="tdsSlab" 
                class="bg-slate-55/40 border border-default rounded text-[9px] px-1 py-0.5 outline-none font-semibold text-slate-700"
              >
                <option :value="10">10% Corporate</option>
                <option :value="5">5% Individual</option>
                <option :value="2">2% Technical</option>
              </select>
            </div>
            <span class="font-bold text-red-500 font-heading">- {{ formatCurrency(calculatedTds) }}</span>
          </div>

          <div class="border-t border-dashed border-default pt-2.5 flex justify-between items-center text-[11px] font-bold text-emerald-500">
            <span>Net Corporate Receivable:</span>
            <span>{{ formatCurrency(netReceivable) }}</span>
          </div>
        </div>
      </div>

      <!-- Approval Matrix Flow -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
        <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
          Finance Approval Hierarchy Matrix
        </h4>

        <!-- Workflow Visual diagram -->
        <div class="flex flex-col space-y-2">
          <div 
            class="flex items-center justify-between p-2 rounded-lg border font-bold"
            :class="payoutValue < 50000 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 dark:bg-slate-800 border-default text-slate-400'"
          >
            <span>1. Manager Approval (&lt; ₹50k)</span>
            <span class="text-[9px] uppercase font-bold">{{ payoutValue < 50000 ? '✓ Active Trigger' : 'Muted' }}</span>
          </div>
          <div 
            class="flex items-center justify-between p-2 rounded-lg border font-bold"
            :class="payoutValue >= 50000 && payoutValue <= 200000 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 dark:bg-slate-800 border-default text-slate-400'"
          >
            <span>2. Finance Approval (₹50k – ₹2L)</span>
            <span class="text-[9px] uppercase font-bold">{{ payoutValue >= 50000 && payoutValue <= 200000 ? '✓ Active Trigger' : 'Muted' }}</span>
          </div>
          <div 
            class="flex items-center justify-between p-2 rounded-lg border font-bold"
            :class="payoutValue > 200000 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 dark:bg-slate-800 border-default text-slate-400'"
          >
            <span>3. Org Admin Approval (&gt; ₹2L)</span>
            <span class="text-[9px] uppercase font-bold">{{ payoutValue > 200000 ? '✓ Active Trigger' : 'Muted' }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center text-[10px] pt-1">
          <span class="text-slate-450 font-bold">Payout Status:</span>
          <span class="font-bold text-indigo-600 uppercase">● Awaiting Finance Clears</span>
        </div>
      </div>
    </div>

    <!-- Agent splits payouts Ledger list -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
      <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
        Internal Agent commission Payout Splits
      </h4>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider pb-2">
              <th class="py-2">Stakeholder Share Type</th>
              <th class="py-2">Allocated split</th>
              <th class="py-2 text-right">Gross payout</th>
              <th class="py-2 text-right">TDS (5%)</th>
              <th class="py-2 text-right">Net payout</th>
              <th class="py-2 text-center">Status</th>
              <th class="py-2 text-right">Payout Release</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default text-slate-655 font-medium">
            <tr v-for="pay in payouts" :key="pay.type">
              <td class="py-2.5 font-bold text-slate-800 dark:text-slate-200 capitalize">
                {{ pay.type.replace('_', ' ') }}
              </td>
              <td class="py-2.5 font-bold text-primary">{{ pay.splitPercent }}%</td>
              <td class="py-2.5 text-right font-semibold">{{ formatCurrency(pay.grossShare) }}</td>
              <td class="py-2.5 text-right text-red-500 font-semibold">{{ formatCurrency(pay.tdsWithheld) }}</td>
              <td class="py-2.5 text-right font-bold text-slate-800 dark:text-slate-100 font-heading">
                {{ formatCurrency(pay.grossShare - pay.tdsWithheld) }}
              </td>
              <td class="py-2.5 text-center">
                <span 
                  class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                  :class="pay.released ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                >
                  ● {{ pay.released ? 'Released' : 'Pending' }}
                </span>
              </td>
              <td class="py-2.5 text-right shrink-0">
                <button 
                  v-if="!pay.released"
                  @click="releasePayoutClick(pay)"
                  class="btn btn-sm btn-success text-[10px] h-6 px-2.5"
                >
                  Release Payout
                </button>
                <span v-else class="text-slate-400 italic text-[10px]">Settled</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  grossCommission: { type: Number, required: true },
  payoutsList: { type: Array, default: null }
});

const emit = defineEmits(['releasePayout']);

const tdsSlab = ref(10); // 10% standard corporate

const calculatedGst = computed(() => {
  return props.grossCommission * 0.18;
});

const calculatedTds = computed(() => {
  return props.grossCommission * (tdsSlab.value / 100);
});

const netReceivable = computed(() => {
  return props.grossCommission + calculatedGst.value - calculatedTds.value;
});

const payoutValue = computed(() => {
  return props.grossCommission;
});

const payouts = computed(() => {
  if (props.payoutsList) return props.payoutsList;
  
  // Standard split simulator values
  const shares = [
    { type: 'source_agent', splitPercent: 20 },
    { type: 'closing_agent', splitPercent: 30 },
    { type: 'team_leader', splitPercent: 10 },
    { type: 'referral_partner', splitPercent: 10 }
  ];

  return shares.map(s => {
    const gross = props.grossCommission * (s.splitPercent / 100);
    const tds = gross * 0.05; // 5% TDS for agents
    return {
      type: s.type,
      splitPercent: s.splitPercent,
      grossShare: gross,
      tdsWithheld: tds,
      released: false
    };
  });
});

const releasePayoutClick = (pay) => {
  emit('releasePayout', pay);
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
