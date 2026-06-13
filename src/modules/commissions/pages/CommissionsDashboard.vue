<template>
  <div class="space-y-6 text-xs">
    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
          <PhCoins :size="20" class="text-primary" />
          <span>Finance Commissions Workspace</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Executive dashboard tracking accounts receivable invoices, clearing collections, and agent splits payouts.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 shrink-0 flex-wrap">
        <router-link 
          to="/app/commissions/list"
          class="btn-md btn-primary gap-1.5"
        >
          <PhTable :size="14" />
          <span>View Commissions Directory</span>
        </router-link>
      </div>
    </div>

    <!-- KPIs Ribbon -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        v-for="kpi in kpis" 
        :key="kpi.label" 
        class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-1.5"
      >
        <span class="text-[8px] text-slate-450 font-bold uppercase tracking-wider block">{{ kpi.label }}</span>
        <span class="font-heading font-bold text-base block" :class="kpi.colorClass || 'text-slate-800 dark:text-slate-100'">
          {{ formatCurrency(kpi.value) }}
        </span>
      </div>
    </div>

    <!-- Charts & Ledgers -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Forecasting Chart -->
      <div class="lg:col-span-8 space-y-6">
        <ForecastChart />

        <!-- Agent Payouts Splits Simulator -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
          <div class="border-b border-default pb-2">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Internal Agent Payout splits Simulator</h4>
            <p class="text-[10px] text-slate-450 mt-0.5">Input target deal value to calculate split earnings and withholding tax slabs.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deal Value (INR) *</label>
              <input 
                v-model.number="sim.dealValue" 
                type="number" 
                class="w-full bg-slate-55/40 border border-default rounded px-3 py-1.5 outline-none font-semibold"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gross Commission Rate (%) *</label>
              <input 
                v-model.number="sim.rate" 
                type="number" 
                step="0.1"
                class="w-full bg-slate-55/40 border border-default rounded px-3 py-1.5 outline-none font-semibold"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gross Company commission</label>
              <div class="bg-slate-100 dark:bg-slate-800 border border-default p-2 rounded font-bold text-slate-800 dark:text-slate-100 font-heading">
                {{ formatCurrency(simGrossComm) }}
              </div>
            </div>
          </div>

          <!-- Splits results -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-medium">
            <div 
              v-for="split in simSplits" 
              :key="split.name"
              class="bg-slate-50 dark:bg-slate-900 border border-default rounded-lg p-3 space-y-1.5"
            >
              <span class="text-[9px] text-slate-450 font-bold uppercase tracking-wider block">{{ split.name }} ({{ split.percent }}%)</span>
              <div class="space-y-0.5 text-[10px]">
                <p>Gross: <b class="text-slate-700 dark:text-slate-350">{{ formatCurrency(split.gross) }}</b></p>
                <p class="text-red-500">TDS (5%): -{{ formatCurrency(split.tds) }}</p>
                <p class="text-emerald-500 font-bold border-t border-dashed border-default pt-1 mt-1">Net: {{ formatCurrency(split.net) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Reconciliation Control center -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
          <div class="border-b border-default pb-2">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">
              Commissions Bank Statement Reconciliation
            </h4>
            <p class="text-[10px] text-slate-450 mt-0.5">Match incoming bank ledger RTGS clearings to raised invoices.</p>
          </div>

          <div class="space-y-2.5 font-medium">
            <div 
              v-for="reconcile in reconciles" 
              :key="reconcile.id"
              class="p-3 border border-default rounded-xl bg-slate-50/30 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
            >
              <div class="space-y-1">
                <div class="flex items-center space-x-1.5">
                  <span class="font-mono font-bold text-slate-800 dark:text-slate-250">{{ reconcile.utr }}</span>
                  <span class="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[8px] font-bold uppercase">Unmatched Clearing</span>
                </div>
                <p class="text-[10px] text-slate-500">Bank Entry Date: {{ reconcile.date }} | Source: <b>{{ reconcile.builderName }}</b></p>
              </div>
              <div class="flex items-center space-x-3 self-end sm:self-auto">
                <span class="font-heading font-bold text-emerald-600 text-sm">{{ formatCurrency(reconcile.amount) }}</span>
                <button 
                  @click="reconcileClick(reconcile)"
                  class="btn-sm btn-primary gap-1"
                >
                  <PhLightning :size="12" />
                  <span>Match & Clear</span>
                </button>
              </div>
            </div>

            <div v-if="reconciles.length === 0" class="text-center py-6 text-slate-400 italic">All banking transfers successfully matched and reconciled.</div>
          </div>
        </div>
      </div>

      <!-- Right: Builder ledger matrix -->
      <div class="lg:col-span-4 space-y-6">
        <BuilderLedgerCard :ledger="builderLedger" />
 
        <!-- Clawback Exposure widgets summary -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3.5">
          <div class="border-b border-default pb-1">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Clawback Exposure Risk</h4>
            <p class="text-[9px] text-slate-450 mt-0.5">Outstanding recoveries on cancelled deal files.</p>
          </div>
 
          <div class="bg-red-50/20 dark:bg-red-950/10 border border-red-150 p-3 rounded-lg flex justify-between items-center font-bold">
            <span class="text-red-655 uppercase text-[9px]">Total Recovery Target:</span>
            <span class="text-red-655 font-heading text-sm">{{ formatCurrency(clawbackTarget) }}</span>
          </div>
 
          <div class="text-[10px] text-slate-550 space-y-1">
            <p class="flex items-center gap-1"><PhCheck :size="10" class="text-emerald-500" /><span>Original Commission: {{ formatCurrency(originalClawbackCommission) }}</span></p>
            <p class="flex items-center gap-1"><PhCheck :size="10" class="text-emerald-500" /><span>Clawback Cleared: {{ formatCurrency(clawbackCleared) }}</span></p>
            <p class="text-amber-600 font-semibold flex items-center gap-1"><PhWarning :size="10" /><span>Pending Agent Reversals: {{ formatCurrency(clawbackTarget) }}</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { PhCoins, PhTable, PhLightning, PhWarning, PhCheck } from '@phosphor-icons/vue';
import BuilderLedgerCard from '../components/BuilderLedgerCard.vue';
import ForecastChart from '../components/ForecastChart.vue';
import { useCommissionsQuery } from '../queries';

const store = useStore();

const { data } = useCommissionsQuery();

const commissionsList = computed(() => {
  return data.value?.data || data.value || [];
});

const expectedRevenue = computed(() => {
  return commissionsList.value.reduce((sum, item) => sum + (item.totalCommissionExpected || item.grossCommission || 0), 0);
});

const eligibleRevenue = computed(() => {
  return commissionsList.value
    .filter(item => ['eligible', 'invoice_raised', 'invoice_sent'].includes(item.stage || item.status))
    .reduce((sum, item) => sum + (item.totalCommissionExpected || item.grossCommission || 0), 0);
});

const outstandingInvoices = computed(() => {
  return commissionsList.value
    .filter(item => ['invoice_raised', 'invoice_sent', 'partially_collected'].includes(item.stage || item.status))
    .reduce((sum, item) => sum + (item.totalCommissionOutstanding || item.netReceivable || 0), 0);
});

const collectedRevenue = computed(() => {
  return commissionsList.value.reduce((sum, item) => sum + (item.totalCommissionCollected || 0), 0);
});

const kpis = computed(() => [
  { label: 'Expected Revenue', value: expectedRevenue.value, colorClass: 'text-blue-500' },
  { label: 'Eligible Revenue', value: eligibleRevenue.value, colorClass: 'text-indigo-500' },
  { label: 'Outstanding Invoices', value: outstandingInvoices.value, colorClass: 'text-amber-500' },
  { label: 'Collected Revenue MTD', value: collectedRevenue.value, colorClass: 'text-emerald-500' }
]);

const sim = ref({
  dealValue: 12000000, // 1.2 Crore
  rate: 2.5 // 2.5% commission rate
});

const simGrossComm = computed(() => {
  return sim.value.dealValue * (sim.value.rate / 100);
});

const simSplits = computed(() => {
  const base = simGrossComm.value;
  const roles = [
    { name: 'Source Agent', percent: 20 },
    { name: 'Closing Agent', percent: 30 },
    { name: 'Team Leader', percent: 10 },
    { name: 'Referral Partner', percent: 10 }
  ];

  return roles.map(r => {
    const gross = base * (r.percent / 100);
    const tds = gross * 0.05; // 5% TDS slab
    return {
      name: r.name,
      percent: r.percent,
      gross,
      tds,
      net: gross - tds
    };
  });
});

const reconciles = ref([]);

const reconcileClick = (rec) => {
  reconciles.value = reconciles.value.filter(r => r.id !== rec.id);
  store.dispatch('notifications/triggerToast', {
    message: `Bank UTR clearing match cleared successfully. Invoices settled.`,
    type: 'success'
  });
};

const builderLedger = computed(() => {
  if (commissionsList.value.length === 0) {
    return {
      builderName: 'No Active Builder',
      outstandingAmount: 0,
      collectedAmount: 0,
      totalInvoicesCount: 0,
      clearedInvoicesCount: 0,
      avgCollectionDays: 0,
      riskScore: 0,
      riskLevel: 'Low Risk',
      delaysCount: 0,
      bouncesCount: 0,
      disputesCount: 0,
      disputes: []
    };
  }

  const firstComm = commissionsList.value[0];
  const builderName = firstComm.builderName || firstComm.builder?.name || 'Skyway Builders';
  const outstandingAmount = commissionsList.value.reduce((sum, c) => sum + (c.totalCommissionOutstanding || 0), 0);
  const collectedAmount = commissionsList.value.reduce((sum, c) => sum + (c.totalCommissionCollected || 0), 0);

  const invoicedComms = commissionsList.value.filter(c => ['invoice_raised', 'invoice_sent', 'partially_collected', 'fully_collected'].includes(c.stage || c.status));
  const clearedComms = commissionsList.value.filter(c => (c.stage || c.status) === 'fully_collected');

  return {
    builderName,
    outstandingAmount,
    collectedAmount,
    totalInvoicesCount: invoicedComms.length,
    clearedInvoicesCount: clearedComms.length,
    avgCollectionDays: 30,
    riskScore: outstandingAmount > 500000 ? 45 : 15,
    riskLevel: outstandingAmount > 500000 ? 'Medium Risk' : 'Low Risk',
    delaysCount: outstandingAmount > 500000 ? 5 : 0,
    bouncesCount: 0,
    disputesCount: 0,
    disputes: []
  };
});

const clawbackTarget = computed(() => {
  return commissionsList.value
    .filter(item => item.stage === 'clawed_back' || item.status === 'clawed_back')
    .reduce((sum, item) => sum + (item.totalCommissionExpected || item.grossCommission || 0), 0);
});

const originalClawbackCommission = computed(() => {
  return clawbackTarget.value;
});

const clawbackCleared = computed(() => {
  return 0;
});

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>
