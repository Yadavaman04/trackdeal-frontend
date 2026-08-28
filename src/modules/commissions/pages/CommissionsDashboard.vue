<template>
  <div class="space-y-6 text-xs">
    <!-- Header Block -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            💰
          </span>
          <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">
            Financials · Commissions & Collections
          </h2>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Master real estate commission ledger, receivables tracking, partial payments, and debtor clearance status.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-3 shrink-0 flex-wrap">
        <router-link 
          to="/app/commissions/receivables"
          class="px-3.5 py-2 rounded-xl font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1.5"
        >
          <span>📊 View Receivables Ledger ("Who Owes Us")</span>
        </router-link>
        <button 
          @click="loadAllData"
          class="px-3.5 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
        >
          <span>⟳ Refresh</span>
        </button>
      </div>
    </div>

    <!-- Summary KPI Cards Ribbon -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Total Earned -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Earned</span>
          <span class="text-xs">💼</span>
        </div>
        <span class="text-xl font-extrabold text-slate-800 dark:text-slate-100 block">
          ₹{{ Number(summary.totalEarned || 0).toLocaleString('en-IN') }}
        </span>
        <span class="text-[10px] text-slate-400">From all eligible closed deals</span>
      </div>

      <!-- 2. Commission Received -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Commission Received</span>
          <span class="text-xs">✅</span>
        </div>
        <span class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
          ₹{{ Number(summary.totalCollected || 0).toLocaleString('en-IN') }}
        </span>
        <div class="flex items-center gap-2">
          <div class="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div class="bg-emerald-500 h-full rounded-full" :style="`width: ${Math.min(100, summary.collectionRate || 0)}%`"></div>
          </div>
          <span class="text-[10px] text-emerald-500 font-bold">{{ summary.collectionRate || 0 }}%</span>
        </div>
      </div>

      <!-- 3. Outstanding Commission -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-500">Outstanding Commission</span>
          <span class="text-xs">⏳</span>
        </div>
        <span class="text-xl font-extrabold text-amber-600 dark:text-amber-400 block">
          ₹{{ Number(summary.totalOutstanding || 0).toLocaleString('en-IN') }}
        </span>
        <span class="text-[10px] text-slate-400">Expected - Amount Received</span>
      </div>

      <!-- 4. Overdue Amount -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-red-500">Overdue Commission</span>
          <span class="text-xs">⚠️</span>
        </div>
        <span class="text-xl font-extrabold text-red-600 dark:text-red-400 block">
          ₹{{ Number(summary.totalOverdue || 0).toLocaleString('en-IN') }}
        </span>
        <span class="text-[10px] text-red-500 font-semibold">{{ summary.overdueCount || 0 }} payment(s) past expected date</span>
      </div>
    </div>

    <!-- Secondary Metrics Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-slate-400 font-medium block">Expected This Month</span>
          <span class="font-bold text-slate-800 dark:text-slate-100 text-sm">₹{{ Number(summary.expectedThisMonth || 0).toLocaleString('en-IN') }}</span>
        </div>
        <span class="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold">📅</span>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-slate-400 font-medium block">Fully Paid Deals</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{{ summary.fullyPaidCount || 0 }} Deals</span>
        </div>
        <span class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold">🎉</span>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-slate-400 font-medium block">Partially Paid</span>
          <span class="font-bold text-amber-600 dark:text-amber-400 text-sm">{{ summary.partiallyPaidCount || 0 }} Deals</span>
        </div>
        <span class="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 font-bold">⚡</span>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-slate-400 font-medium block">Unpaid / Awaiting</span>
          <span class="font-bold text-slate-600 dark:text-slate-300 text-sm">{{ summary.unpaidCount || 0 }} Deals</span>
        </div>
        <span class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">⏱️</span>
      </div>
    </div>

    <!-- Filters Bar & Search -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex-1 min-w-[240px]">
        <input 
          v-model="filters.search"
          @input="handleSearch"
          type="text"
          placeholder="Search by Commission #, Customer, Builder / Paying party..."
          class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <select 
          v-model="filters.paymentStatus"
          @change="loadCommissions"
          class="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Payment Statuses</option>
          <option value="unpaid">UNPAID</option>
          <option value="partially_paid">PARTIALLY PAID</option>
          <option value="fully_paid">FULLY PAID</option>
          <option value="overdue">OVERDUE</option>
        </select>

        <select 
          v-model="filters.payablePartyType"
          @change="loadCommissions"
          class="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Paying Parties</option>
          <option value="builder">Builder / Developer</option>
          <option value="seller">Property Seller</option>
          <option value="customer">Customer / Buyer</option>
          <option value="channel_partner">Channel Partner</option>
          <option value="broker">Broker</option>
        </select>

        <button 
          v-if="filters.search || filters.paymentStatus || filters.payablePartyType"
          @click="resetFilters"
          class="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Master Commission Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <!-- Loading Skeleton -->
      <div v-if="loadingCommissions" class="p-6 space-y-4 animate-pulse">
        <div v-for="i in 5" :key="i" class="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="commissionsList.length === 0" class="p-12 text-center space-y-2">
        <span class="text-3xl">📭</span>
        <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">No Commission Records Found</h4>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">
          When deals are marked as Closed Won, commission profiles and payment schedules will appear here automatically.
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="text-[10px] font-bold uppercase text-slate-400 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th class="py-3 px-4">Deal / Comm #</th>
              <th class="py-3 px-4">Customer</th>
              <th class="py-3 px-4">Property / Project</th>
              <th class="py-3 px-4">Deal Value</th>
              <th class="py-3 px-4">Comm %</th>
              <th class="py-3 px-4">Expected</th>
              <th class="py-3 px-4">Received</th>
              <th class="py-3 px-4">Outstanding</th>
              <th class="py-3 px-4">Payable By</th>
              <th class="py-3 px-4">Expected Date</th>
              <th class="py-3 px-4">Payment Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="c in commissionsList" :key="c._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                <router-link :to="`/app/commissions/${c._id}`" class="hover:underline">
                  {{ c.commissionNumber || 'COM-' + c._id.slice(-4).toUpperCase() }}
                </router-link>
                <div v-if="c.dealId?.dealNumber" class="text-[10px] text-slate-400 font-normal">
                  {{ c.dealId.dealNumber }}
                </div>
              </td>
              <td class="py-3.5 px-4">
                <div class="font-semibold text-slate-800 dark:text-slate-100">
                  {{ c.customerId?.name || `${c.customerId?.firstName || ''} ${c.customerId?.lastName || ''}`.trim() || 'Customer' }}
                </div>
                <div v-if="c.customerId?.mobile" class="text-[10px] text-slate-400">{{ c.customerId.mobile }}</div>
              </td>
              <td class="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                <div class="font-medium truncate max-w-[160px]">
                  {{ c.projectId?.name || c.propertyId?.title || 'Property Unit' }}
                </div>
                <div v-if="c.unitNumber" class="text-[10px] text-slate-400">Unit: {{ c.unitNumber }}</div>
              </td>
              <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                ₹{{ Number(c.finalDealValue || c.dealId?.dealValue || 0).toLocaleString('en-IN') }}
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                {{ c.commissionRate || c.commissionPercentage || 2 }}%
              </td>
              <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                ₹{{ Number(c.totalCommissionExpected || 0).toLocaleString('en-IN') }}
              </td>
              <td class="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                ₹{{ Number(c.totalCommissionCollected || 0).toLocaleString('en-IN') }}
              </td>
              <td class="py-3.5 px-4 font-extrabold text-amber-600 dark:text-amber-400">
                ₹{{ Number(c.totalCommissionOutstanding || 0).toLocaleString('en-IN') }}
              </td>
              <td class="py-3.5 px-4">
                <div class="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                  {{ c.payablePartyName || 'Developer' }}
                </div>
                <span class="text-[9px] uppercase font-bold text-slate-400">
                  {{ c.payablePartyType || 'builder' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                {{ formatDate(c.expectedPaymentDate) }}
              </td>
              <td class="py-3.5 px-4">
                <span 
                  class="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider"
                  :class="getStatusBadgeClass(c.paymentStatus)"
                >
                  {{ formatStatusLabel(c.paymentStatus) }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                <button 
                  v-if="c.totalCommissionOutstanding > 0"
                  @click="openPaymentModal(c)"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                >
                  + Record Payment
                </button>
                <router-link 
                  :to="`/app/commissions/${c._id}`"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors inline-block"
                >
                  View Details
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="pagination.pages > 1" class="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span class="text-[11px] text-slate-400">
          Showing page {{ pagination.page }} of {{ pagination.pages }} ({{ pagination.total }} records)
        </span>
        <div class="flex items-center gap-1">
          <button 
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
            class="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 font-semibold"
          >
            Previous
          </button>
          <button 
            :disabled="pagination.page >= pagination.pages"
            @click="changePage(pagination.page + 1)"
            class="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 font-semibold"
          >
            Next
          </button>
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
              {{ activeCommission?.commissionNumber }} · {{ activeCommission?.payablePartyName }}
            </p>
          </div>
          <button @click="paymentModalOpen = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
        </div>

        <form @submit.prevent="submitPayment" class="p-5 space-y-4">
          <div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex justify-between items-center text-amber-700 dark:text-amber-300">
            <div>
              <span class="text-[10px] font-bold uppercase block">Current Outstanding</span>
              <span class="text-base font-extrabold">₹{{ Number(activeCommission?.totalCommissionOutstanding || 0).toLocaleString('en-IN') }}</span>
            </div>
            <span class="text-xs font-semibold">Expected: ₹{{ Number(activeCommission?.totalCommissionExpected || 0).toLocaleString('en-IN') }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Date *</label>
              <input v-model="paymentForm.paymentDate" type="date" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Received (₹) *</label>
              <input v-model.number="paymentForm.amount" type="number" min="1" :max="activeCommission?.totalCommissionOutstanding" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400" />
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
              <input v-model="paymentForm.referenceNumber" type="text" placeholder="e.g. UTR987654321" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-mono" />
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

          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
              <input type="checkbox" v-model="paymentForm.tdsDeducted" class="rounded text-indigo-600" />
              <span>TDS Deducted (Section 194H)</span>
            </label>
            <div v-if="paymentForm.tdsDeducted" class="flex-1 flex items-center gap-2">
              <label class="text-slate-400">TDS Amount (₹):</label>
              <input v-model.number="paymentForm.tdsAmount" type="number" class="w-28 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1" />
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
import { fetchCommissionSummary, fetchCommissions, recordCommissionPayment } from '../api/endpoints';

const summary = ref({
  totalEarned: 0,
  totalCollected: 0,
  totalOutstanding: 0,
  totalOverdue: 0,
  expectedThisMonth: 0,
  fullyPaidCount: 0,
  partiallyPaidCount: 0,
  unpaidCount: 0,
  overdueCount: 0,
  collectionRate: 0,
});

const commissionsList = ref([]);
const loadingCommissions = ref(true);
const pagination = ref({ page: 1, limit: 15, total: 0, pages: 1 });

const filters = ref({
  search: '',
  paymentStatus: '',
  payablePartyType: '',
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
  tdsDeducted: false,
  tdsAmount: 0,
  notes: '',
});

let searchTimer = null;
function handleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.value.page = 1;
    loadCommissions();
  }, 300);
}

function resetFilters() {
  filters.value = { search: '', paymentStatus: '', payablePartyType: '' };
  pagination.value.page = 1;
  loadCommissions();
}

async function loadSummary() {
  try {
    const res = await fetchCommissionSummary();
    if (res?.data) summary.value = res.data;
  } catch (err) {
    console.error('Failed to load summary:', err);
  }
}

async function loadCommissions() {
  loadingCommissions.value = true;
  try {
    const res = await fetchCommissions({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: filters.value.search.trim() || undefined,
      paymentStatus: filters.value.paymentStatus || undefined,
      payablePartyType: filters.value.payablePartyType || undefined,
    });
    commissionsList.value = res?.data || [];
    if (res?.pagination) pagination.value = res.pagination;
  } catch (err) {
    console.error('Failed to load commissions:', err);
  } finally {
    loadingCommissions.value = false;
  }
}

async function loadAllData() {
  await Promise.all([loadSummary(), loadCommissions()]);
}

function changePage(p) {
  pagination.value.page = p;
  loadCommissions();
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

function openPaymentModal(c) {
  activeCommission.value = c;
  paymentForm.value = {
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: c.totalCommissionOutstanding,
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    receivedFrom: c.payablePartyName || '',
    bankAccount: '',
    tdsDeducted: false,
    tdsAmount: 0,
    notes: '',
  };
  paymentModalOpen.value = true;
}

async function submitPayment() {
  if (!activeCommission.value) return;
  savingPayment.value = true;
  try {
    await recordCommissionPayment({
      id: activeCommission.value._id,
      ...paymentForm.value,
    });
    paymentModalOpen.value = false;
    await loadAllData();
  } catch (err) {
    alert(err.response?.data?.error?.message || err.message || 'Failed to record payment.');
  } finally {
    savingPayment.value = false;
  }
}

onMounted(() => {
  loadAllData();
});
</script>
