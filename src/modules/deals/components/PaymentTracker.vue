<template>
  <div class="space-y-6">
    <!-- Financial Metric Cards -->
    <div class="grid grid-cols-3 gap-4 text-xs">
      <div class="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3.5 space-y-1">
        <span class="text-[8px] text-emerald-700 dark:text-emerald-400 font-bold block uppercase tracking-wider">Paid Amount</span>
        <span class="font-heading font-bold text-base text-emerald-600 dark:text-emerald-450">{{ formatCurrency(totalPaid) }}</span>
      </div>
      <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3.5 space-y-1">
        <span class="text-[8px] text-blue-700 dark:text-blue-400 font-bold block uppercase tracking-wider">Outstanding</span>
        <span class="font-heading font-bold text-base text-blue-600 dark:text-blue-450">{{ formatCurrency(totalOutstanding) }}</span>
      </div>
      <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 space-y-1">
        <span class="text-[8px] text-red-700 dark:text-red-400 font-bold block uppercase tracking-wider">Overdue</span>
        <span class="font-heading font-bold text-base text-red-655 dark:text-red-400">{{ formatCurrency(totalOverdue) }}</span>
      </div>
    </div>

    <!-- Collection Forecasts -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3.5 text-xs">
      <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">
        Installment Collection Forecasts
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-slate-50/50 dark:bg-slate-900 p-2.5 rounded-lg">
          <span class="text-[8px] text-slate-400 font-bold block uppercase">Next 30 Days expected</span>
          <span class="font-heading font-bold text-slate-850 dark:text-slate-250 mt-1 block">₹15,00,000</span>
        </div>
        <div class="bg-slate-50/50 dark:bg-slate-900 p-2.5 rounded-lg">
          <span class="text-[8px] text-slate-400 font-bold block uppercase">Next 60 Days expected</span>
          <span class="font-heading font-bold text-slate-850 dark:text-slate-250 mt-1 block">₹25,00,000</span>
        </div>
        <div class="bg-red-50/20 dark:bg-red-950/10 border border-red-100 p-2.5 rounded-lg">
          <span class="text-[8px] text-red-655 font-bold block uppercase">Overdue Collections</span>
          <span class="font-heading font-bold text-red-655 mt-1 block">₹2,00,000</span>
        </div>
      </div>
    </div>

    <!-- Payment Schedule / Ledger -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4 text-xs">
      <div class="flex items-center justify-between border-b border-default pb-3">
        <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">
          Payment Milestone Schedule
        </h4>
        <button 
          @click="showLogPaymentModal = true"
          class="bg-primary text-white font-bold px-3 py-1.5 rounded-lg shadow-xs hover:bg-opacity-95 flex items-center gap-1.5"
        >
          <PhReceipt :size="14" />
          <span>Log Payment Transaction</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider pb-2">
              <th class="py-2">Milestone / Type</th>
              <th class="py-2">Scheduled Date</th>
              <th class="py-2 text-right">Amount</th>
              <th class="py-2">Payment Mode</th>
              <th class="py-2">Ref Transaction</th>
              <th class="py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default text-slate-655">
            <tr v-for="pay in ledger" :key="pay.id">
              <td class="py-2.5 font-bold text-slate-800 dark:text-slate-200 capitalize">
                {{ pay.paymentType.replace('_', ' ') }}
              </td>
              <td class="py-2.5 text-slate-450">{{ formatDate(pay.paidAt) }}</td>
              <td class="py-2.5 text-right font-semibold">{{ formatCurrency(pay.amount) }}</td>
              <td class="py-2.5 uppercase font-medium">{{ pay.paymentMode || 'wire' }}</td>
              <td class="py-2.5 font-mono text-[10px]">{{ pay.transactionRef || 'N/A' }}</td>
              <td class="py-2.5 text-center">
                <span 
                  class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                  :class="getStatusBadgeClass(pay.status)"
                >
                  ● {{ pay.status }}
                </span>
              </td>
            </tr>
            <tr v-if="ledger.length === 0">
              <td colspan="6" class="text-center py-6 text-slate-400 italic">No payments logged in the ledger.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Log Payment Modal -->
    <div 
      v-if="showLogPaymentModal"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-surface border border-default w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col animate-fade-in text-xs">
        <div class="px-4 py-3 border-b border-default flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
          <h3 class="font-heading font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
            <PhReceipt :size="15" class="text-slate-450" />
            <span>Log Payment Receipt</span>
          </h3>
          <button @click="showLogPaymentModal = false" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>

        <form @submit.prevent="handleLogPayment" class="p-4 space-y-3.5 flex-1 overflow-y-auto">
          <!-- Type & Mode -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Milestone Type *</label>
              <select v-model="newPay.paymentType" class="w-full bg-surface border border-default rounded px-2.5 py-1.5 outline-none">
                <option value="token">Token Money</option>
                <option value="booking_deposit">Booking Deposit</option>
                <option value="builder_installment">Builder Installment</option>
                <option value="other">Other Charge</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Mode *</label>
              <select v-model="newPay.paymentMode" class="w-full bg-surface border border-default rounded px-2.5 py-1.5 outline-none">
                <option value="wire">Bank Wire / Transfer</option>
                <option value="cheque">Cheque Deposit</option>
                <option value="upi">UPI Link</option>
                <option value="cash">Cash Pay</option>
              </select>
            </div>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transaction Amount (INR) *</label>
            <input 
              v-model.number="newPay.amount" 
              type="number" 
              class="w-full bg-surface border border-default rounded px-2.5 py-1.5 outline-none"
              required
            />
          </div>

          <!-- Tax Details -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">TDS Amount</label>
              <input v-model.number="newPay.tdsAmount" type="number" class="w-full bg-surface border border-default rounded px-2.5 py-1.5 outline-none" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">GST Amount</label>
              <input v-model.number="newPay.gstAmount" type="number" class="w-full bg-surface border border-default rounded px-2.5 py-1.5 outline-none" />
            </div>
          </div>

          <!-- Ref & Date -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transaction Reference *</label>
              <input v-model="newPay.transactionRef" type="text" placeholder="TXN12345" class="w-full bg-surface border border-default rounded px-2.5 py-1.5 outline-none" required />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Paid Date *</label>
              <input v-model="newPay.paidAt" type="date" class="w-full bg-surface border border-default rounded px-2.5 py-1.5 outline-none" required />
            </div>
          </div>

          <!-- Receipt voucher file -->
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Payment Voucher / Receipt</label>
            <input type="file" class="w-full bg-surface border border-default rounded px-2 py-1 text-[11px] outline-none" />
          </div>
        </form>

        <div class="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-default flex justify-end space-x-2 shrink-0">
          <button @click="showLogPaymentModal = false" class="px-4 py-2 border border-default rounded hover:bg-slate-100 font-semibold">Cancel</button>
          <button @click="handleLogPayment" :disabled="isSaving" class="px-4 py-2 bg-primary text-white rounded font-bold">
            {{ isSaving ? 'Logging...' : 'Save Payment' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useAddPaymentMutation } from '../queries';

// Phosphor icons
import { PhReceipt } from '@phosphor-icons/vue';

const props = defineProps({
  dealId: { type: String, required: true },
  payments: { type: Array, default: () => [] }
});

const store = useStore();
const showLogPaymentModal = ref(false);
const isSaving = ref(false);

const newPay = ref({
  paymentType: 'token',
  paymentMode: 'wire',
  amount: 0,
  tdsAmount: 0,
  gstAmount: 0,
  transactionRef: '',
  paidAt: new Date().toISOString().split('T')[0]
});

// Dynamic totals calculations
const totalPaid = computed(() => {
  return props.payments.filter(p => p.status === 'cleared').reduce((acc, curr) => acc + curr.amount, 0);
});

const totalOutstanding = computed(() => {
  return props.payments.filter(p => p.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
});

const totalOverdue = computed(() => {
  // Mocking overdue installment
  return props.payments.filter(p => p.status === 'bounced').reduce((acc, curr) => acc + curr.amount, 0) || 200000;
});

// Build ledger items
const ledger = computed(() => {
  if (props.payments.length === 0) {
    return [
      { id: 'p1', paymentType: 'token', paidAt: '2026-05-10T10:00:00Z', amount: 100000, paymentMode: 'upi', transactionRef: 'TX-9842', status: 'cleared' },
      { id: 'p2', paymentType: 'booking_deposit', paidAt: '2026-05-20T11:00:00Z', amount: 400000, paymentMode: 'wire', transactionRef: 'TX-10928', status: 'cleared' },
      { id: 'p3', paymentType: 'builder_installment', paidAt: '2026-06-15T09:00:00Z', amount: 750000, paymentMode: 'cheque', transactionRef: 'TX-88390', status: 'pending' }
    ];
  }
  return props.payments;
});

const { mutateAsync: addPayment } = useAddPaymentMutation();

const handleLogPayment = async () => {
  if (!newPay.value.amount || !newPay.value.transactionRef) return;
  isSaving.value = true;
  try {
    await addPayment({
      id: props.dealId,
      ...newPay.value,
      netAmount: newPay.value.amount - newPay.value.tdsAmount
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Payment logged in ledger successfully.',
      type: 'success'
    });

    newPay.value = {
      paymentType: 'token',
      paymentMode: 'wire',
      amount: 0,
      tdsAmount: 0,
      gstAmount: 0,
      transactionRef: '',
      paidAt: new Date().toISOString().split('T')[0]
    };
    showLogPaymentModal.value = false;
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to log payment transaction.',
      type: 'error'
    });
  } finally {
    isSaving.value = false;
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'cleared': return 'bg-emerald-50 text-emerald-700 border border-emerald-250';
    case 'pending': return 'bg-blue-50 text-blue-750 border border-blue-200';
    case 'bounced': return 'bg-red-50 text-red-650 border border-red-200';
    default: return 'bg-slate-50 border-slate-200';
  }
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
