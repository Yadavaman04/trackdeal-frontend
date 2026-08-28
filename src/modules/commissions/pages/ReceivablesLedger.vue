<template>
  <div class="space-y-6 text-xs">
    <!-- Header Block -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            📊
          </span>
          <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">
            Financials · Receivables Ledger
          </h2>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete "Who Owes Us Money" breakdown by Builder, Seller, Buyer, and Channel Partners with debt aging analysis.
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0 flex-wrap">
        <router-link 
          to="/app/commissions"
          class="px-3.5 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
        >
          <span>← Back to Commissions</span>
        </router-link>
        <button 
          @click="loadData"
          class="px-3.5 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
        >
          <span>⟳ Refresh Ledger</span>
        </button>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Receivables</span>
        <span class="text-lg font-bold text-slate-800 dark:text-slate-100 block">
          ₹{{ Number(summary.totalEarned || 0).toLocaleString('en-IN') }}
        </span>
        <span class="text-[10px] text-slate-400">Gross pipeline value</span>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">Total Collected</span>
        <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 block">
          ₹{{ Number(summary.totalCollected || 0).toLocaleString('en-IN') }}
        </span>
        <span class="text-[10px] text-emerald-500/80 font-semibold">{{ summary.collectionRate || 0 }}% collected</span>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">Total Outstanding</span>
        <span class="text-lg font-bold text-amber-600 dark:text-amber-400 block">
          ₹{{ Number(summary.totalOutstanding || 0).toLocaleString('en-IN') }}
        </span>
        <span class="text-[10px] text-slate-400">Across active debtors</span>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-red-500 block">Overdue Amount</span>
        <span class="text-lg font-bold text-red-600 dark:text-red-400 block">
          ₹{{ Number(summary.totalOverdue || 0).toLocaleString('en-IN') }}
        </span>
        <span class="text-[10px] text-red-400 font-semibold">{{ summary.overdueCount || 0 }} deal(s) past due</span>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Expected This Month</span>
        <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400 block">
          ₹{{ Number(summary.expectedThisMonth || 0).toLocaleString('en-IN') }}
        </span>
        <span class="text-[10px] text-indigo-400">Current calendar cycle</span>
      </div>
    </div>

    <!-- Aging Analysis Breakdown Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 class="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400">
          Receivable Aging Schedule
        </h3>
        <span class="text-[10px] text-slate-400 font-medium">Days Past Invoice Due Date</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 space-y-1">
          <span class="text-[10px] font-semibold text-slate-400 uppercase">Not Due Yet</span>
          <p class="text-sm font-bold text-slate-700 dark:text-slate-200">
            ₹{{ Number(summary.aging?.notDue || 0).toLocaleString('en-IN') }}
          </p>
        </div>
        <div class="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-1">
          <span class="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">1 – 30 Days</span>
          <p class="text-sm font-bold text-amber-700 dark:text-amber-300">
            ₹{{ Number(summary.aging?.days1to30 || 0).toLocaleString('en-IN') }}
          </p>
        </div>
        <div class="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3 space-y-1">
          <span class="text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase">31 – 60 Days</span>
          <p class="text-sm font-bold text-orange-700 dark:text-orange-300">
            ₹{{ Number(summary.aging?.days31to60 || 0).toLocaleString('en-IN') }}
          </p>
        </div>
        <div class="bg-red-500/5 border border-red-500/20 rounded-xl p-3 space-y-1">
          <span class="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase">61 – 90 Days</span>
          <p class="text-sm font-bold text-red-700 dark:text-red-300">
            ₹{{ Number(summary.aging?.days61to90 || 0).toLocaleString('en-IN') }}
          </p>
        </div>
        <div class="bg-rose-950/20 border border-rose-600/30 rounded-xl p-3 space-y-1">
          <span class="text-[10px] font-semibold text-rose-500 uppercase">90+ Days (Critical)</span>
          <p class="text-sm font-bold text-rose-600 dark:text-rose-400">
            ₹{{ Number(summary.aging?.days90Plus || 0).toLocaleString('en-IN') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Paying Parties Ledger Cards -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">
          Debtor Organizations & Paying Entities ({{ receivables.length }})
        </h3>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 gap-4">
        <div v-for="i in 3" :key="i" class="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="receivables.length === 0" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-2">
        <span class="text-3xl">🎉</span>
        <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">No Outstanding Receivables</h4>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          All eligible closed deal commissions have been fully collected or there are no open receivables.
        </p>
      </div>

      <!-- Receivables Cards -->
      <div v-else class="grid grid-cols-1 gap-5">
        <div 
          v-for="party in receivables" 
          :key="party.payablePartyName"
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <!-- Party Card Header -->
          <div class="p-4 bg-slate-50/70 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {{ party.payablePartyName }}
                </h4>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {{ formatPartyType(party.payablePartyType) }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400">
                {{ party.dealsCount }} active transaction(s) pending clearance
              </p>
            </div>

            <!-- Party Balances -->
            <div class="flex items-center gap-4 text-right">
              <div>
                <span class="text-[9px] font-bold uppercase text-slate-400 block">Total Expected</span>
                <span class="font-bold text-slate-700 dark:text-slate-200">
                  ₹{{ Number(party.totalExpected || 0).toLocaleString('en-IN') }}
                </span>
              </div>
              <div>
                <span class="text-[9px] font-bold uppercase text-emerald-500 block">Collected</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{{ Number(party.totalCollected || 0).toLocaleString('en-IN') }}
                </span>
              </div>
              <div class="pl-2 border-l border-slate-200 dark:border-slate-700">
                <span class="text-[9px] font-bold uppercase text-amber-500 block">Outstanding</span>
                <span class="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                  ₹{{ Number(party.totalOutstanding || 0).toLocaleString('en-IN') }}
                </span>
              </div>
              <div v-if="party.totalOverdue > 0" class="pl-2 border-l border-slate-200 dark:border-slate-700">
                <span class="text-[9px] font-bold uppercase text-red-500 block">Overdue</span>
                <span class="text-sm font-extrabold text-red-600 dark:text-red-400">
                  ₹{{ Number(party.totalOverdue || 0).toLocaleString('en-IN') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Underlying Deals Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-[10px] font-bold uppercase text-slate-400 bg-slate-50/40 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th class="py-2.5 px-4">Commission #</th>
                  <th class="py-2.5 px-4">Customer</th>
                  <th class="py-2.5 px-4">Project / Property</th>
                  <th class="py-2.5 px-4">Deal Value</th>
                  <th class="py-2.5 px-4">Expected</th>
                  <th class="py-2.5 px-4">Received</th>
                  <th class="py-2.5 px-4">Outstanding</th>
                  <th class="py-2.5 px-4">Due Date</th>
                  <th class="py-2.5 px-4">Status</th>
                  <th class="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="deal in party.deals" :key="deal.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    <router-link :to="`/app/commissions/${deal.id}`" class="hover:underline">
                      {{ deal.commissionNumber || 'COM-REC' }}
                    </router-link>
                  </td>
                  <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                    {{ deal.customerName }}
                  </td>
                  <td class="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {{ deal.projectOrProperty }}
                  </td>
                  <td class="py-3 px-4 font-medium text-slate-700 dark:text-slate-200">
                    ₹{{ Number(deal.dealValue || 0).toLocaleString('en-IN') }}
                  </td>
                  <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                    ₹{{ Number(deal.expected || 0).toLocaleString('en-IN') }}
                  </td>
                  <td class="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{{ Number(deal.collected || 0).toLocaleString('en-IN') }}
                  </td>
                  <td class="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">
                    ₹{{ Number(deal.outstanding || 0).toLocaleString('en-IN') }}
                  </td>
                  <td class="py-3 px-4">
                    <span :class="deal.isPastDue ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'">
                      {{ formatDate(deal.dueDate) }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span 
                      class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                      :class="getStatusBadgeClass(deal.paymentStatus)"
                    >
                      {{ formatStatusLabel(deal.paymentStatus) }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-1.5">
                    <button 
                      @click="openPaymentModal(deal)"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                    >
                      + Record Payment
                    </button>
                    <router-link 
                      :to="`/app/commissions/${deal.id}`"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors inline-block"
                    >
                      Details
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Record Payment Modal Component -->
    <div v-if="paymentModalOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all text-xs">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>💳</span>
              <span>Record Commission Payment</span>
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {{ activeCommission?.commissionNumber }} · {{ activeCommission?.customerName }}
            </p>
          </div>
          <button @click="paymentModalOpen = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
        </div>

        <form @submit.prevent="submitPayment" class="p-5 space-y-4">
          <div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex justify-between items-center text-amber-700 dark:text-amber-300">
            <div>
              <span class="text-[10px] font-bold uppercase block">Current Outstanding</span>
              <span class="text-base font-extrabold">₹{{ Number(activeCommission?.outstanding || 0).toLocaleString('en-IN') }}</span>
            </div>
            <span class="text-xs font-semibold">Expected: ₹{{ Number(activeCommission?.expected || 0).toLocaleString('en-IN') }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Date *</label>
              <input v-model="paymentForm.paymentDate" type="date" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Received (₹) *</label>
              <input v-model.number="paymentForm.amount" type="number" min="1" :max="activeCommission?.outstanding" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method *</label>
              <select v-model="paymentForm.paymentMethod" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100">
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transaction Ref / UTR *</label>
              <input v-model="paymentForm.referenceNumber" type="text" placeholder="e.g. UTR123456789" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Received From</label>
              <input v-model="paymentForm.receivedFrom" type="text" placeholder="e.g. Builder Accounts" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deposited Bank Account</label>
              <input v-model="paymentForm.bankAccount" type="text" placeholder="e.g. HDFC 00123" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100" />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Remarks</label>
            <textarea v-model="paymentForm.notes" rows="2" placeholder="e.g. Milestone 1 payment cleared" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button type="button" @click="paymentModalOpen = false" class="px-4 py-2 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="submit" :disabled="savingPayment" class="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all">
              <span v-if="savingPayment">Recording...</span>
              <span v-else>Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchCommissionSummary, fetchReceivables, recordCommissionPayment } from '../api/endpoints';

const loading = ref(true);
const receivables = ref([]);
const summary = ref({
  totalEarned: 0,
  totalCollected: 0,
  totalOutstanding: 0,
  totalOverdue: 0,
  expectedThisMonth: 0,
  collectionRate: 0,
  aging: { notDue: 0, days1to30: 0, days31to60: 0, days61to90: 0, days90Plus: 0 },
});

const paymentModalOpen = ref(false);
const activeCommission = ref(null);
const savingPayment = ref(false);
const paymentForm = ref({
  paymentDate: new Date().toISOString().slice(0, 10),
  amount: 0,
  paymentMethod: 'Bank Transfer',
  referenceNumber: '',
  receivedFrom: '',
  bankAccount: '',
  notes: '',
});

async function loadData() {
  loading.value = true;
  try {
    const [sumRes, recRes] = await Promise.all([
      fetchCommissionSummary(),
      fetchReceivables(),
    ]);
    if (sumRes?.data) summary.value = sumRes.data;
    if (recRes?.data) receivables.value = recRes.data;
  } catch (err) {
    console.error('Failed to load receivables:', err);
  } finally {
    loading.value = false;
  }
}

function formatPartyType(t) {
  const map = {
    builder: 'Builder / Developer',
    seller: 'Property Seller',
    customer: 'Customer / Buyer',
    channel_partner: 'Channel Partner',
    broker: 'Broker',
    other: 'Other',
  };
  return map[t] || t || 'Builder';
}

function formatDate(d) {
  if (!d) return 'Not Set';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatStatusLabel(s) {
  const map = {
    unpaid: 'UNPAID',
    partially_paid: 'PARTIALLY PAID',
    fully_paid: 'FULLY PAID',
    overdue: 'OVERDUE',
  };
  return map[s] || String(s).toUpperCase();
}

function getStatusBadgeClass(s) {
  switch (s) {
    case 'fully_paid':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    case 'partially_paid':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    case 'overdue':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
  }
}

function openPaymentModal(deal) {
  activeCommission.value = deal;
  paymentForm.value = {
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: deal.outstanding,
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    receivedFrom: deal.payablePartyName || '',
    bankAccount: '',
    notes: '',
  };
  paymentModalOpen.value = true;
}

async function submitPayment() {
  if (!activeCommission.value) return;
  savingPayment.value = true;
  try {
    await recordCommissionPayment({
      id: activeCommission.value.id,
      ...paymentForm.value,
    });
    paymentModalOpen.value = false;
    await loadData();
  } catch (err) {
    alert(err.response?.data?.error?.message || err.message || 'Failed to record payment.');
  } finally {
    savingPayment.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
