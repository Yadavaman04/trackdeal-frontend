<template>
  <div class="space-y-6 pb-12">
    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 shadow-sm">
            <PhBank :size="22" weight="duotone" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Loans Management</h1>
            <p class="text-xs text-slate-500 mt-0.5">Manage customer loan applications, bank submissions, sanctions, disbursements, and loan commissions</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <router-link
          to="/app/loans/banks-dsa"
          class="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-surface border border-default hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-sm transition flex items-center gap-2"
        >
          <PhBuildings :size="16" />
          Banks & DSAs
        </router-link>

        <button
          @click="isCreateModalOpen = true"
          class="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 rounded-xl shadow-md transition flex items-center gap-2"
        >
          <PhPlus :size="16" weight="bold" />
          Create Loan Case
        </button>
      </div>
    </div>

    <!-- ── 4 Primary KPI Summary Cards ────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Active Cases -->
      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-primary-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Active Cases</span>
          <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600">
            <PhFiles :size="16" weight="duotone" />
          </div>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">{{ summary.activeCases }}</span>
          <span class="text-[11px] text-slate-400 font-medium">in pipeline</span>
        </div>
        <div class="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          {{ summary.pendingDocumentsCount }} cases awaiting documents
        </div>
      </div>

      <!-- Sanctioned Cases -->
      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Sanctioned</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600">
            <PhCertificate :size="16" weight="duotone" />
          </div>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ summary.sanctionedCount }}</span>
          <span class="text-[11px] text-slate-400 font-medium">worth ₹{{ formatLakhs(summary.totalSanctionedAmount) }}</span>
        </div>
        <div class="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400/80 font-medium">
          Ready for disbursement
        </div>
      </div>

      <!-- Disbursed This Month -->
      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-purple-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Disbursed This Month</span>
          <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 flex items-center justify-center text-purple-600">
            <PhMoney :size="16" weight="duotone" />
          </div>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">₹{{ formatLakhs(summary.disbursedThisMonth) }}</span>
        </div>
        <div class="mt-2 text-[11px] text-slate-500">
          Total Disbursed: ₹{{ formatLakhs(summary.totalDisbursedAmount) }}
        </div>
      </div>

      <!-- Commission Receivable -->
      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Commission Receivable</span>
          <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600">
            <PhHandCoins :size="16" weight="duotone" />
          </div>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">₹{{ formatLakhs(summary.commissionReceivable) }}</span>
        </div>
        <div class="mt-2 text-[11px] text-amber-700 dark:text-amber-400/80 font-medium">
          Auto-synced with Financials
        </div>
      </div>
    </div>

    <!-- ── Filter & Navigation Strip ──────────────────────────────────────── -->
    <div class="bg-surface border border-default rounded-2xl p-3.5 shadow-sm space-y-3">
      <!-- Metric Pill Tabs -->
      <div class="flex flex-wrap items-center gap-1.5 border-b border-default pb-3">
        <button
          v-for="tab in filterTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2"
          :class="activeTab === tab.id
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          {{ tab.label }}
          <span
            class="px-1.5 py-0.2 rounded-full text-[10px]"
            :class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Controls Row: Search + Filters + View Toggle -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <!-- Search -->
          <div class="relative flex-1 max-w-sm">
            <PhMagnifyingGlass :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search case no, customer name, mobile, bank..."
              class="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-default rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
            />
          </div>

          <!-- Stage Dropdown -->
          <select
            v-model="selectedStage"
            class="bg-slate-50 dark:bg-slate-800/80 border border-default rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary-500"
          >
            <option value="">All Stages</option>
            <option value="new">New File</option>
            <option value="documents_pending">Documents Pending</option>
            <option value="documents_collected">Documents Collected</option>
            <option value="submitted_to_bank">Submitted to Bank</option>
            <option value="under_review">Under Review</option>
            <option value="query_raised">Query Raised</option>
            <option value="sanctioned">Sanctioned</option>
            <option value="partially_disbursed">Partially Disbursed</option>
            <option value="fully_disbursed">Fully Disbursed</option>
          </select>

          <!-- Bank Filter -->
          <input
            v-model="bankFilter"
            type="text"
            placeholder="Filter Bank..."
            class="w-32 bg-slate-50 dark:bg-slate-800/80 border border-default rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary-500"
          />

          <button
            v-if="searchQuery || selectedStage || bankFilter"
            @click="clearFilters"
            class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white transition px-2 py-1"
          >
            Clear
          </button>
        </div>

        <!-- View Switcher: List | Pipeline -->
        <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-default">
          <button
            @click="viewMode = 'list'"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            :class="viewMode === 'list' ? 'bg-surface text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          >
            <PhTable :size="14" />
            Table
          </button>
          <button
            @click="viewMode = 'pipeline'"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            :class="viewMode === 'pipeline' ? 'bg-surface text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          >
            <PhKanban :size="14" />
            Pipeline
          </button>
        </div>
      </div>
    </div>

    <!-- ── TABLE VIEW ──────────────────────────────────────────────────────── -->
    <div v-if="viewMode === 'list'" class="bg-surface border border-default rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-default text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th class="py-3 px-4">Loan Case</th>
              <th class="py-3 px-4">Customer</th>
              <th class="py-3 px-4">Property / Lead</th>
              <th class="py-3 px-4">Required</th>
              <th class="py-3 px-4">Bank / DSA</th>
              <th class="py-3 px-4">Stage</th>
              <th class="py-3 px-4">Sanctioned</th>
              <th class="py-3 px-4">Disbursed</th>
              <th class="py-3 px-4">Est. Comm.</th>
              <th class="py-3 px-4">Next Action</th>
              <th class="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr
              v-for="item in filteredLoans"
              :key="item._id"
              class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group cursor-pointer"
              @click="$router.push(`/app/loans/${item._id}`)"
            >
              <!-- Case No -->
              <td class="py-3.5 px-4">
                <div class="font-mono font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                  <PhBank :size="14" weight="duotone" />
                  {{ item.loanCaseNumber }}
                </div>
                <div class="text-[10px] text-slate-400 capitalize mt-0.5">{{ (item.loanType || 'home_loan').replace(/_/g, ' ') }}</div>
              </td>

              <!-- Customer -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {{ item.customerId?.firstName }} {{ item.customerId?.lastName }}
                </div>
                <div class="text-[11px] text-slate-500 font-mono">{{ item.customerId?.mobile }}</div>
              </td>

              <!-- Property / Lead -->
              <td class="py-3.5 px-4">
                <div v-if="item.propertyId?.title" class="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {{ item.propertyId.title }}
                </div>
                <div v-else-if="item.leadId" class="text-slate-600 dark:text-slate-300">
                  Lead Requirement
                </div>
                <div v-else class="text-slate-400 italic">Direct Loan</div>
              </td>

              <!-- Required Amount -->
              <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono">
                ₹{{ formatLakhs(item.requiredAmount) }}
              </td>

              <!-- Bank / DSA -->
              <td class="py-3.5 px-4">
                <div class="font-medium text-slate-800 dark:text-slate-200">
                  {{ item.preferredBank || item.applications?.[0]?.bankName || 'Not Assigned' }}
                </div>
                <div v-if="item.applications?.[0]?.dsaName" class="text-[10px] text-slate-400">
                  via {{ item.applications[0].dsaName }}
                </div>
              </td>

              <!-- Stage Badge -->
              <td class="py-3.5 px-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold" :class="getStageBadgeClass(item.stage)">
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStageDotClass(item.stage)"></span>
                  {{ formatStage(item.stage) }}
                </span>
              </td>

              <!-- Sanctioned -->
              <td class="py-3.5 px-4 font-mono font-bold" :class="item.sanctionedAmount > 0 ? 'text-emerald-600' : 'text-slate-400'">
                {{ item.sanctionedAmount > 0 ? `₹${formatLakhs(item.sanctionedAmount)}` : '—' }}
              </td>

              <!-- Disbursed -->
              <td class="py-3.5 px-4 font-mono font-bold" :class="item.disbursedAmount > 0 ? 'text-blue-600' : 'text-slate-400'">
                {{ item.disbursedAmount > 0 ? `₹${formatLakhs(item.disbursedAmount)}` : '—' }}
              </td>

              <!-- Commission -->
              <td class="py-3.5 px-4 font-mono font-bold text-amber-600">
                ₹{{ formatLakhs(item.commissionTerms?.expectedAmount || 0) }}
              </td>

              <!-- Next Action -->
              <td class="py-3.5 px-4">
                <div v-if="item.nextFollowupDate" class="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {{ formatDate(item.nextFollowupDate) }}
                </div>
                <div v-else class="text-[11px] text-slate-400 italic">No task set</div>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right" @click.stop>
                <router-link
                  :to="`/app/loans/${item._id}`"
                  class="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-lg inline-flex transition"
                  title="View Loan 360"
                >
                  <PhArrowRight :size="16" weight="bold" />
                </router-link>
              </td>
            </tr>

            <tr v-if="filteredLoans.length === 0">
              <td colspan="11" class="text-center py-12 text-slate-400">
                <PhBank :size="36" class="mx-auto mb-2 opacity-40" />
                <p class="text-sm font-medium">No loan cases found</p>
                <p class="text-xs text-slate-500 mt-0.5">Loan cases are automatically created when leads request a home loan.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── KANBAN PIPELINE VIEW ────────────────────────────────────────────── -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      <div
        v-for="col in kanbanColumns"
        :key="col.id"
        class="bg-slate-50/70 dark:bg-slate-900/40 border border-default rounded-2xl p-3 flex flex-col min-w-[260px]"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between pb-3 border-b border-default mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="col.dotColor"></span>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ col.title }}</span>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white dark:bg-slate-800 border border-default text-slate-600 dark:text-slate-300">
            {{ getLoansByColumn(col.stages).length }}
          </span>
        </div>

        <!-- Cards Container -->
        <div class="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-360px)]">
          <div
            v-for="card in getLoansByColumn(col.stages)"
            :key="card._id"
            @click="$router.push(`/app/loans/${card._id}`)"
            class="bg-surface border border-default hover:border-primary-400 rounded-xl p-3.5 shadow-sm hover:shadow-md transition cursor-pointer space-y-2 group"
          >
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-mono font-bold text-primary-600">{{ card.loanCaseNumber }}</span>
              <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded text-slate-500 bg-slate-100 dark:bg-slate-800">
                {{ (card.loanType || 'HL').replace('home_loan', 'Home Loan') }}
              </span>
            </div>

            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition">
                {{ card.customerId?.firstName }} {{ card.customerId?.lastName }}
              </div>
              <div class="text-[11px] font-mono font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                ₹{{ formatLakhs(card.sanctionedAmount || card.requiredAmount) }}
              </div>
            </div>

            <div class="pt-2 border-t border-default text-[11px] text-slate-500 flex items-center justify-between">
              <span class="truncate max-w-[120px]">{{ card.preferredBank || 'Bank Pending' }}</span>
              <span v-if="card.nextFollowupDate" class="text-primary-600 font-semibold flex items-center gap-1">
                <PhClock :size="12" />
                {{ formatDate(card.nextFollowupDate) }}
              </span>
            </div>
          </div>

          <div v-if="getLoansByColumn(col.stages).length === 0" class="text-center py-8 text-xs text-slate-400 italic">
            No files in this stage
          </div>
        </div>
      </div>
    </div>

    <!-- Create Loan Modal -->
    <CreateLoanModal
      :is-open="isCreateModalOpen"
      :loading="isSubmitting"
      @close="isCreateModalOpen = false"
      @submit="handleCreateLoan"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import {
  PhBank,
  PhPlus,
  PhBuildings,
  PhFiles,
  PhCertificate,
  PhMoney,
  PhHandCoins,
  PhMagnifyingGlass,
  PhTable,
  PhKanban,
  PhArrowRight,
  PhClock,
} from '@phosphor-icons/vue';
import apiClient from '@/api/client';
import CreateLoanModal from '../components/CreateLoanModal.vue';

const loans = ref([]);
const summary = ref({
  activeCases: 0,
  sanctionedCount: 0,
  disbursedThisMonth: 0,
  totalSanctionedAmount: 0,
  totalDisbursedAmount: 0,
  commissionReceivable: 0,
  pendingDocumentsCount: 0,
  rejectedCount: 0,
});

const activeTab = ref('all');
const searchQuery = ref('');
const selectedStage = ref('');
const bankFilter = ref('');
const viewMode = ref('list');
const isCreateModalOpen = ref(false);
const isSubmitting = ref(false);

const filterTabs = computed(() => [
  { id: 'all', label: 'All Loans', count: loans.value.length },
  { id: 'new', label: 'New Files', count: loans.value.filter((l) => l.stage === 'new').length },
  { id: 'submitted', label: 'Submitted', count: loans.value.filter((l) => ['submitted_to_bank', 'under_review', 'login_completed'].includes(l.stage)).length },
  { id: 'queries', label: 'Queries Raised', count: loans.value.filter((l) => l.stage === 'query_raised').length },
  { id: 'sanctioned', label: 'Sanctioned', count: loans.value.filter((l) => l.stage === 'sanctioned').length },
  { id: 'disbursed', label: 'Disbursed', count: loans.value.filter((l) => ['partially_disbursed', 'fully_disbursed'].includes(l.stage)).length },
]);

const kanbanColumns = [
  { id: 'new', title: 'New / KYC', stages: ['new', 'documents_pending', 'documents_collected'], dotColor: 'bg-blue-500' },
  { id: 'submitted', title: 'Submitted to Bank', stages: ['submitted_to_bank', 'login_completed'], dotColor: 'bg-purple-500' },
  { id: 'review', title: 'Under Review / Query', stages: ['under_review', 'query_raised', 'query_resolved'], dotColor: 'bg-amber-500' },
  { id: 'sanctioned', title: 'Sanctioned 🎉', stages: ['sanctioned', 'disbursement_pending'], dotColor: 'bg-emerald-500' },
  { id: 'disbursed', title: 'Disbursed & Commission', stages: ['partially_disbursed', 'fully_disbursed'], dotColor: 'bg-primary-600' },
];

const fetchLoans = async () => {
  try {
    const [listRes, sumRes] = await Promise.all([
      apiClient.get('/loans?limit=100'),
      apiClient.get('/loans/summary'),
    ]);
    loans.value = listRes.data?.data || listRes.data || [];
    summary.value = sumRes.data?.data || sumRes.data || summary.value;
  } catch (err) {
    console.error('Error fetching loan directory:', err);
  }
};

onMounted(() => {
  fetchLoans();
});

const filteredLoans = computed(() => {
  return loans.value.filter((item) => {
    // Tab filter
    if (activeTab.value === 'new' && item.stage !== 'new') return false;
    if (activeTab.value === 'submitted' && !['submitted_to_bank', 'under_review', 'login_completed'].includes(item.stage)) return false;
    if (activeTab.value === 'queries' && item.stage !== 'query_raised') return false;
    if (activeTab.value === 'sanctioned' && item.stage !== 'sanctioned') return false;
    if (activeTab.value === 'disbursed' && !['partially_disbursed', 'fully_disbursed'].includes(item.stage)) return false;

    // Stage select filter
    if (selectedStage.value && item.stage !== selectedStage.value) return false;

    // Bank filter
    if (bankFilter.value && !item.preferredBank?.toLowerCase().includes(bankFilter.value.toLowerCase())) return false;

    // Search query
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      const matchNumber = item.loanCaseNumber?.toLowerCase().includes(q);
      const matchCustomer = `${item.customerId?.firstName} ${item.customerId?.lastName}`.toLowerCase().includes(q);
      const matchMobile = item.customerId?.mobile?.includes(q);
      const matchBank = item.preferredBank?.toLowerCase().includes(q);
      if (!matchNumber && !matchCustomer && !matchMobile && !matchBank) return false;
    }

    return true;
  });
});

const getLoansByColumn = (stages) => {
  return loans.value.filter((l) => stages.includes(l.stage));
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedStage.value = '';
  bankFilter.value = '';
  activeTab.value = 'all';
};

const handleCreateLoan = async (payload) => {
  isSubmitting.value = true;
  try {
    await apiClient.post('/loans', payload);
    isCreateModalOpen.value = false;
    await fetchLoans();
  } catch (err) {
    console.error('Error creating loan case:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const formatLakhs = (val) => {
  const n = Number(val) || 0;
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
  return n.toLocaleString('en-IN');
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const formatStage = (s) => {
  if (!s) return 'New';
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const getStageBadgeClass = (stage) => {
  switch (stage) {
    case 'sanctioned':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    case 'fully_disbursed':
      return 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800';
    case 'partially_disbursed':
      return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    case 'query_raised':
      return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

const getStageDotClass = (stage) => {
  switch (stage) {
    case 'sanctioned':
      return 'bg-emerald-500';
    case 'fully_disbursed':
    case 'partially_disbursed':
      return 'bg-primary-500';
    case 'query_raised':
      return 'bg-amber-500';
    case 'rejected':
      return 'bg-rose-500';
    default:
      return 'bg-slate-400';
  }
};
</script>
