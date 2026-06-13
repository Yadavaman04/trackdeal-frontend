<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-default pb-2">
      <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
        Milestone Invoicing Ledgers
      </h4>
      <button 
        @click="$emit('generateInvoice')"
        class="btn btn-sm btn-primary text-[10px] h-7 px-2.5"
      >
        <PhFileText :size="13" />
        <span>Raise Invoice</span>
      </button>
    </div>

    <!-- Active Invoices List -->
    <div class="space-y-3.5">
      <div 
        v-for="inv in invoices" 
        :key="inv._id || inv.id"
        class="border border-default rounded-xl p-3.5 space-y-3 bg-slate-50/20 dark:bg-slate-900/30 font-medium"
      >
        <div class="flex justify-between items-start">
          <div>
            <span class="font-mono font-bold text-slate-800 dark:text-slate-200">{{ inv.invoiceNumber }}</span>
            <p class="text-[9px] text-slate-450 mt-0.5">Milestone: <b class="text-slate-655 font-semibold">{{ inv.milestone }}</b></p>
          </div>
          <span 
            class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
            :class="getStatusBadgeClass(inv.status)"
          >
            ● {{ inv.status }}
          </span>
        </div>

        <div class="flex justify-between items-center text-[10px] border-t border-dashed border-default pt-2.5">
          <div>
            <span class="text-slate-400 block text-[8px] uppercase">Invoice Value</span>
            <span class="font-bold text-slate-800 dark:text-slate-100 font-heading">{{ formatCurrency(inv.amount) }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[8px] uppercase">GST Addition</span>
            <span class="font-semibold text-slate-700 dark:text-slate-250">{{ formatCurrency(inv.gstAmount || (inv.amount * 0.18)) }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[8px] uppercase">Net Billing</span>
            <span class="font-bold text-emerald-600 font-heading">{{ formatCurrency((inv.amount) + (inv.gstAmount || inv.amount * 0.18)) }}</span>
          </div>
        </div>

        <!-- Action triggers -->
        <div class="flex justify-end gap-2 pt-1">
          <button 
            @click="shareInvoice(inv)"
            class="btn btn-sm btn-secondary text-[10px] h-6 px-2"
          >
            <PhShare :size="12" />
            <span>Share Invoice</span>
          </button>
          <button 
            v-if="inv.status !== 'paid'"
            @click="markPaid(inv)"
            class="btn btn-sm btn-success text-[10px] h-6 px-2"
          >
            <PhCheck :size="12" />
            <span>Mark Paid</span>
          </button>
        </div>

        <!-- Timeline steps audit -->
        <div class="border-t border-default border-dashed pt-2.5 space-y-2">
          <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">B2B Workflow Timeline</span>
          <div class="flex justify-between text-[8px] font-bold text-slate-400">
            <span :class="inv.status === 'draft' ? 'text-primary' : 'text-emerald-500'">1. Draft</span>
            <span :class="inv.status === 'raised' ? 'text-primary' : isStepDone(inv.status, 2) ? 'text-emerald-500' : ''">2. Raised</span>
            <span :class="inv.status === 'sent' ? 'text-primary' : isStepDone(inv.status, 3) ? 'text-emerald-500' : ''">3. Sent</span>
            <span :class="inv.status === 'acknowledged' ? 'text-primary' : isStepDone(inv.status, 4) ? 'text-emerald-500' : ''">4. Acknowledged</span>
            <span :class="inv.status === 'paid' ? 'text-emerald-500 font-extrabold' : ''">5. Paid</span>
          </div>
        </div>
      </div>

      <div v-if="invoices.length === 0" class="text-center py-6 text-slate-400 italic">No invoices raised for this commission record.</div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { PhFileText, PhShare, PhCheck } from '@phosphor-icons/vue';

const props = defineProps({
  invoices: { type: Array, default: () => [] }
});

const emit = defineEmits(['generateInvoice', 'invoiceUpdated']);
const store = useStore();

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'paid': return 'bg-emerald-50 text-emerald-700 border border-emerald-250';
    case 'disputed': return 'bg-red-50 text-red-655 border border-red-250';
    case 'acknowledged': return 'bg-purple-50 text-purple-700 border border-purple-250';
    case 'sent': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'raised': return 'bg-blue-50 text-blue-750 border border-blue-150';
    default: return 'bg-slate-50 text-slate-500 border border-slate-200';
  }
};

const isStepDone = (status, stepNum) => {
  const steps = ['draft', 'raised', 'sent', 'acknowledged', 'paid'];
  const currentIndex = steps.indexOf(status);
  return currentIndex >= stepNum - 1;
};

const shareInvoice = (inv) => {
  store.dispatch('notifications/triggerToast', {
    message: `B2B Invoice link copied. Ready to share via Whatsapp/Email.`,
    type: 'success'
  });
};

const markPaid = (inv) => {
  emit('invoiceUpdated', { id: inv._id || inv.id, status: 'paid' });
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
