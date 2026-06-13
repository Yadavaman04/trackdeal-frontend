<template>
  <div class="space-y-6 text-xs font-medium">
    <!-- Metrics: Outstanding & Aging Buckets -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-4 bg-red-50/20 dark:bg-red-950/10 border border-red-150 p-3.5 rounded-xl space-y-1">
        <span class="text-[8px] text-red-655 font-bold uppercase tracking-wider block">Outstanding Collections</span>
        <span class="font-bold text-slate-800 dark:text-slate-100 text-sm font-heading">{{ formatCurrency(outstandingBalance) }}</span>
      </div>

      <!-- Aging Buckets -->
      <div class="md:col-span-8 bg-surface border border-default rounded-xl p-3.5 space-y-2">
        <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Receivables Aging Buckets</span>
        <div class="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div class="bg-emerald-50/30 p-1.5 rounded border border-emerald-100">
            <span class="text-[8px] text-emerald-600 font-bold block">0 - 30 Days</span>
            <span class="font-bold text-slate-700 dark:text-slate-350">{{ formatCurrency(aging.d30) }}</span>
          </div>
          <div class="bg-blue-50/30 p-1.5 rounded border border-blue-100">
            <span class="text-[8px] text-blue-600 font-bold block">31 - 60 Days</span>
            <span class="font-bold text-slate-700 dark:text-slate-350">{{ formatCurrency(aging.d60) }}</span>
          </div>
          <div class="bg-amber-50/30 p-1.5 rounded border border-amber-100">
            <span class="text-[8px] text-amber-600 font-bold block">61 - 90 Days</span>
            <span class="font-bold text-slate-700 dark:text-slate-350">{{ formatCurrency(aging.d90) }}</span>
          </div>
          <div class="bg-red-50/30 p-1.5 rounded border border-red-100">
            <span class="text-[8px] text-red-600 font-bold block">90+ Days</span>
            <span class="font-bold text-slate-700 dark:text-slate-350">{{ formatCurrency(aging.dOver) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Collection Ledger table -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-default pb-3">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
          Collection Clearing Ledger
        </h4>
        <button 
          @click="$emit('logCollection')"
          class="btn btn-sm btn-primary text-[10px] h-7 px-2.5"
        >
          <PhReceipt :size="13" />
          <span>Log Clearing Receipt</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider pb-2">
              <th class="py-2">Receipt Ref</th>
              <th class="py-2">Transaction Details</th>
              <th class="py-2 text-right">Gross Received</th>
              <th class="py-2 text-right">TDS Withheld</th>
              <th class="py-2 text-right">Net Cleared</th>
              <th class="py-2 text-center">Status</th>
              <th class="py-2 text-right">Action Checks</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default text-slate-655 font-medium">
            <tr v-for="col in collections" :key="col._id || col.id">
              <td class="py-2.5 font-bold text-slate-800 dark:text-slate-200 font-mono">
                {{ col.receiptNumber || col.transactionRef || 'N/A' }}
              </td>
              <td class="py-2.5">
                <p class="font-semibold text-slate-700 dark:text-slate-350 capitalize">{{ col.paymentMode }} Transfer</p>
                <p class="text-[9px] text-slate-450 mt-0.5">Logged: {{ formatDate(col.receivedAt) }}</p>
              </td>
              <td class="py-2.5 text-right font-semibold">{{ formatCurrency(col.amountReceived) }}</td>
              <td class="py-2.5 text-right text-red-500 font-semibold">{{ formatCurrency(col.tdsDeducted) }}</td>
              <td class="py-2.5 text-right font-bold text-slate-800 dark:text-slate-100 font-heading">
                {{ formatCurrency(col.amountReceived - col.tdsDeducted) }}
              </td>
              <td class="py-2.5 text-center">
                <span 
                  class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                  :class="getStatusBadgeClass(col.status)"
                >
                  ● {{ col.status }}
                </span>
              </td>
              <td class="py-2.5 text-right space-x-1.5 shrink-0">
                <template v-if="col.status === 'pending'">
                  <button 
                    @click="clearReceipt(col)"
                    class="btn btn-sm btn-success-outline text-[10px] h-6 px-2"
                  >
                    <PhCheck :size="11" />
                    <span>Clear</span>
                  </button>
                  <button 
                    @click="bounceReceipt(col)"
                    class="btn btn-sm btn-danger-outline text-[10px] h-6 px-2"
                  >
                    <PhMinusCircle :size="11" />
                    <span>Bounce</span>
                  </button>
                </template>
                <span v-else class="text-slate-400 italic text-[10px]">Reconciled</span>
              </td>
            </tr>

            <tr v-if="collections.length === 0">
              <td colspan="7" class="text-center py-6 text-slate-400 italic">No payments logged in the ledger.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PhReceipt, PhCheck, PhMinusCircle } from '@phosphor-icons/vue';

const props = defineProps({
  collections: { type: Array, default: () => [] },
  outstandingBalance: { type: Number, default: 0 },
  aging: {
    type: Object,
    default: () => ({ d30: 1500000, d60: 750000, d90: 0, dOver: 0 })
  }
});

const emit = defineEmits(['logCollection', 'clearReceipt', 'bounceReceipt']);

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'cleared': return 'bg-emerald-50 text-emerald-700 border border-emerald-250';
    case 'bounced': return 'bg-red-50 text-red-655 border border-red-250';
    case 'pending': return 'bg-blue-50 text-blue-750 border border-blue-200';
    default: return 'bg-slate-50 text-slate-500';
  }
};

const clearReceipt = (col) => {
  emit('clearReceipt', col._id || col.id);
};

const bounceReceipt = (col) => {
  emit('bounceReceipt', col._id || col.id);
};

const formatDate = (val) => {
  if (!val) return '';
  return new Date(val).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
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
