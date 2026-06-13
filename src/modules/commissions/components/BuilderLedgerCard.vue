<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-default pb-2">
      <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
        Builder Ledger Account
      </h4>
      <span class="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">
        {{ ledger.builderName }}
      </span>
    </div>

    <!-- Metrics -->
    <div class="grid grid-cols-2 gap-3.5">
      <div class="bg-slate-50 dark:bg-slate-900 border border-default rounded-lg p-2.5">
        <span class="text-slate-400 block text-[8px] uppercase font-bold">Outstanding Balance</span>
        <span class="font-bold text-slate-800 dark:text-slate-100 font-heading text-sm">{{ formatCurrency(ledger.outstandingAmount) }}</span>
      </div>
      <div class="bg-slate-50 dark:bg-slate-900 border border-default rounded-lg p-2.5">
        <span class="text-slate-400 block text-[8px] uppercase font-bold">Total Collections</span>
        <span class="font-bold text-emerald-600 font-heading text-sm">{{ formatCurrency(ledger.collectedAmount) }}</span>
      </div>
    </div>

    <!-- Collection Performance -->
    <div class="space-y-2">
      <h5 class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Performance Parameters</h5>
      <div class="grid grid-cols-2 gap-3">
        <div class="flex justify-between items-center py-1 border-b border-default border-dashed">
          <span class="text-slate-550">Average Collection Period:</span>
          <span class="font-bold text-slate-700 dark:text-slate-350">{{ ledger.avgCollectionDays || 42 }} Days</span>
        </div>
        <div class="flex justify-between items-center py-1 border-b border-default border-dashed">
          <span class="text-slate-555">Cleared Invoices:</span>
          <span class="font-bold text-slate-700 dark:text-slate-350">{{ ledger.clearedInvoicesCount }}/{{ ledger.totalInvoicesCount }}</span>
        </div>
      </div>
    </div>

    <!-- Builder Risk Score Index Widget -->
    <div class="bg-slate-55/30 border border-default p-3 rounded-lg space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-[9px] font-bold text-slate-500 uppercase">Builder Risk Score Index</span>
        <span 
          class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
          :class="getRiskBadgeClass(ledger.riskScore)"
        >
          ● {{ ledger.riskLevel }} ({{ ledger.riskScore }}/100)
        </span>
      </div>

      <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div 
          class="h-full rounded-full transition-all duration-300"
          :class="getRiskBgClass(ledger.riskScore)"
          :style="{ width: `${ledger.riskScore}%` }"
        ></div>
      </div>

      <div class="grid grid-cols-3 gap-2 text-[9px] pt-1 leading-tight text-slate-500 font-medium">
        <div>
          <span class="block text-slate-400 font-bold uppercase">Payment Delays</span>
          <span class="font-semibold text-slate-700 dark:text-slate-350">{{ ledger.delaysCount }} Days avg</span>
        </div>
        <div>
          <span class="block text-slate-400 font-bold uppercase">Bounce History</span>
          <span class="font-semibold text-slate-700 dark:text-slate-350">{{ ledger.bouncesCount }} Bounces</span>
        </div>
        <div>
          <span class="block text-slate-400 font-bold uppercase">Disputes Raised</span>
          <span class="font-semibold text-slate-700 dark:text-slate-350">{{ ledger.disputesCount }} Active</span>
        </div>
      </div>
    </div>

    <!-- Active Disputes List -->
    <div class="space-y-2" v-if="ledger.disputes?.length > 0">
      <h5 class="text-[9px] font-bold text-red-500 uppercase tracking-wider">Active Billing Disputes</h5>
      <div class="space-y-1.5">
        <div 
          v-for="disp in ledger.disputes" 
          :key="disp.id" 
          class="p-2 border border-red-200 dark:border-red-950 bg-red-50/20 dark:bg-red-950/10 rounded-lg text-[10px]"
        >
          <div class="flex justify-between font-bold text-red-700 dark:text-red-400">
            <span>{{ disp.invoiceNumber }}</span>
            <span>{{ formatCurrency(disp.amount) }}</span>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-[9px] mt-0.5">{{ disp.reason }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  ledger: {
    type: Object,
    default: () => ({
      builderName: 'Skyway Builders Group',
      outstandingAmount: 2250000,
      collectedAmount: 4500000,
      totalInvoicesCount: 6,
      clearedInvoicesCount: 4,
      avgCollectionDays: 38,
      riskScore: 28,
      riskLevel: 'Low Risk',
      delaysCount: 8,
      bouncesCount: 0,
      disputesCount: 1,
      disputes: [
        { id: 'd-1', invoiceNumber: 'INV-SK-2948', amount: 450000, reason: 'Milestone certification document discrepancy.' }
      ]
    })
  }
});

const getRiskBadgeClass = (score) => {
  if (score >= 60) return 'bg-red-50 text-red-655 border border-red-250';
  if (score >= 30) return 'bg-amber-50 text-amber-700 border border-amber-250';
  return 'bg-emerald-50 text-emerald-700 border border-emerald-250';
};

const getRiskBgClass = (score) => {
  if (score >= 60) return 'bg-red-500';
  if (score >= 30) return 'bg-amber-500';
  return 'bg-emerald-500';
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
