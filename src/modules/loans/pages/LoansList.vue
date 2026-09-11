<template>
  <div class="financial-workspace space-y-5 pb-16">
    <header class="financial-page-header">
      <div>
        <p class="eyebrow">Credit operations</p>
        <h1>Loan lifecycle</h1>
        <p>Manage applications, document readiness, bank submissions, sanctions, disbursements, and commission outcomes.</p>
      </div>
      <div class="workspace-action-cluster">
        <router-link to="/app/loans/banks-dsa" class="btn-md btn-secondary"><AppIcon name="buildings" :size="15" /> Banks & DSAs</router-link>
        <button type="button" class="btn-md btn-primary" @click="isCreateModalOpen = true"><AppIcon name="add" :size="15" /> Create loan case</button>
      </div>
    </header>

    <section v-if="loading && !loans.length" class="workspace-kpi-grid" aria-label="Loading loan summary">
      <div class="skeleton h-52 rounded-xl lg:col-span-6"></div>
      <div v-for="item in 3" :key="item" class="skeleton h-52 rounded-xl lg:col-span-2"></div>
    </section>

    <section v-else class="workspace-kpi-grid" aria-label="Loan summary">
      <article class="financial-hero workspace-hero--loans">
        <div class="relative z-[1] flex h-full flex-col justify-between">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="financial-hero__label">Total sanctioned value</p>
              <p class="financial-hero__value">{{ formatCurrency(summary.totalSanctionedAmount) }}</p>
              <p class="financial-hero__caption">{{ summary.sanctionedCount || 0 }} sanctioned cases ready for or progressing through disbursement</p>
            </div>
            <span class="financial-hero__icon"><AppIcon name="bank" :size="22" weight="duotone" /></span>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between text-[10px]"><span style="color: rgb(255 255 255 / 0.78);">Portfolio disbursed</span><strong>{{ portfolioDisbursementRate }}%</strong></div>
            <div class="workspace-hero__meta"><div><span>Total disbursed</span><strong>{{ formatCurrency(summary.totalDisbursedAmount) }}</strong></div><div><span>Pending documents</span><strong>{{ summary.pendingDocumentsCount || 0 }} cases</strong></div></div>
          </div>
        </div>
      </article>
      <WorkspaceMetric label="Active cases" :value="summary.activeCases || 0" :caption="`${summary.pendingDocumentsCount || 0} awaiting documents`" icon="file" />
      <WorkspaceMetric label="Disbursed this month" :value="formatCurrency(summary.disbursedThisMonth)" caption="Recorded in the current month" icon="currency" tone="success" />
      <WorkspaceMetric label="Commission receivable" :value="formatCurrency(summary.commissionReceivable)" caption="Synced with financial operations" icon="payment" tone="warning" />
    </section>

    <section class="financial-panel" aria-label="Loan filters">
      <div class="financial-panel__header">
        <div><p class="eyebrow">Lifecycle</p><h2>Case states</h2></div>
        <div class="workspace-segmented" aria-label="Loan view">
          <button type="button" :class="{ 'is-active': viewMode === 'list' }" @click="viewMode = 'list'"><PhTable :size="13" /> Table</button>
          <button type="button" :class="{ 'is-active': viewMode === 'pipeline' }" @click="viewMode = 'pipeline'"><PhKanban :size="13" /> Pipeline</button>
        </div>
      </div>
      <div class="workspace-state-strip">
        <button v-for="tab in filterTabs" :key="tab.id" type="button" :class="{ 'is-active': activeTab === tab.id }" @click="activeTab = tab.id"><span>{{ tab.label }}</span><strong>{{ tab.count }}</strong></button>
      </div>
      <div class="financial-table-toolbar">
        <div><p class="eyebrow">Case register</p><h2>Loan files</h2><p>Filter by borrower, bank, case number, or exact lifecycle stage.</p></div>
        <div class="financial-filter-row">
          <div class="relative min-w-0 sm:min-w-[260px]">
            <AppIcon name="search" :size="15" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--neutral-400));" />
            <input v-model="searchQuery" class="filter-control !pl-9" type="search" placeholder="Search case, borrower, bank…" />
          </div>
          <select v-model="selectedStage" class="filter-control sm:max-w-[190px]" aria-label="Filter by loan stage">
            <option value="">All stages</option><option v-for="stage in stageOptions" :key="stage" :value="stage">{{ formatStage(stage) }}</option>
          </select>
          <input v-model="bankFilter" class="filter-control sm:max-w-[150px]" type="search" placeholder="Bank or DSA" />
          <button v-if="hasFilters" type="button" class="btn-md btn-ghost" @click="clearFilters">Clear</button>
        </div>
      </div>
    </section>

    <div v-if="loadError" class="financial-error" role="alert">
      <AppIcon name="warning" :size="18" /><div><strong>Loan cases could not be loaded</strong><p>Retry to restore the current portfolio view.</p></div><button type="button" class="btn-sm btn-secondary" @click="fetchLoans">Retry</button>
    </div>

    <AppTable
      v-if="viewMode === 'list'"
      class="financial-table"
      :rows="filteredLoans"
      :columns="columns"
      :is-loading="loading"
      :page-size="15"
      empty-title="No loan cases in this view"
      empty-subtext="Clear the current filters or create a loan case to begin tracking its lifecycle."
      @row-click="openLoan"
    >
      <template #cell(case)="{ row }"><div class="workspace-record"><span class="workspace-code">{{ row.loanCaseNumber || 'Unnumbered case' }}</span><small>{{ formatStage(row.loanType || 'home_loan') }}</small></div></template>
      <template #cell(borrower)="{ row }"><div class="workspace-record max-w-[180px]"><strong>{{ customerName(row) }}</strong><small>{{ row.customerId?.mobile || 'Mobile not available' }}</small></div></template>
      <template #cell(property)="{ row }"><div class="workspace-record max-w-[170px]"><strong>{{ row.propertyId?.title || (row.leadId ? 'Lead requirement' : 'Direct loan') }}</strong><small>{{ row.preferredBank || row.applications?.[0]?.bankName || 'Bank not assigned' }}</small></div></template>
      <template #cell(required)="{ row }"><span class="financial-amount">{{ formatCurrency(row.requiredAmount) }}</span></template>
      <template #cell(sanctioned)="{ row }"><span class="financial-amount" :class="{ 'financial-amount--positive': row.sanctionedAmount > 0 }">{{ row.sanctionedAmount > 0 ? formatCurrency(row.sanctionedAmount) : 'Not sanctioned' }}</span></template>
      <template #cell(disbursed)="{ row }"><div class="min-w-[120px]"><span class="financial-amount">{{ formatCurrency(row.disbursedAmount) }}</span><div v-if="row.sanctionedAmount" class="financial-row-progress"><span :style="{ width: `${disbursementRate(row)}%` }"></span></div><small>{{ disbursementRate(row) }}% of sanctioned</small></div></template>
      <template #cell(stage)="{ row }"><WorkspaceStatusBadge :label="formatStage(row.stage)" :tone="stageTone(row.stage)" /></template>
      <template #cell(nextAction)="{ row }"><div class="workspace-record"><strong>{{ formatDate(row.nextFollowupDate) }}</strong><small>{{ row.nextFollowupDate ? 'Next follow-up' : 'No follow-up scheduled' }}</small></div></template>
      <template #cell(actions)="{ row }"><router-link :to="`/app/loans/${row._id}`" class="financial-action financial-action--primary" aria-label="Open loan case" @click.stop><AppIcon name="arrowRight" :size="14" /></router-link></template>
    </AppTable>

    <section v-else class="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 overflow-x-auto pb-3" aria-label="Loan pipeline">
      <article v-for="column in kanbanColumns" :key="column.id" class="workspace-lane">
        <header class="workspace-lane__header"><div><h3>{{ column.title }}</h3><p>{{ column.description }}</p></div><span class="workspace-lane__total">{{ getLoansByColumn(column.stages).length }} cases</span></header>
        <div class="workspace-lane__body">
          <button v-for="loan in getLoansByColumn(column.stages)" :key="loan._id" type="button" class="workspace-lane-card text-left" @click="openLoan(loan)">
            <div class="flex items-center justify-between gap-2"><span class="workspace-code">{{ loan.loanCaseNumber }}</span><WorkspaceStatusBadge :label="formatStage(loan.stage)" :tone="stageTone(loan.stage)" /></div>
            <div class="workspace-record mt-3"><strong>{{ customerName(loan) }}</strong><small>{{ loan.preferredBank || 'Bank not assigned' }}</small></div>
            <div class="mt-3 flex items-center justify-between border-t pt-3" style="border-color: hsl(var(--neutral-100));"><span class="financial-amount">{{ formatCurrency(loan.sanctionedAmount || loan.requiredAmount) }}</span><small style="color: hsl(var(--neutral-400));">{{ formatDate(loan.nextFollowupDate) }}</small></div>
          </button>
          <div v-if="!getLoansByColumn(column.stages).length" class="workspace-inline-empty">No cases in this lifecycle stage.</div>
        </div>
      </article>
    </section>

    <CreateLoanModal :is-open="isCreateModalOpen" :loading="isSubmitting" @close="isCreateModalOpen = false" @submit="handleCreateLoan" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { PhKanban, PhTable } from '@phosphor-icons/vue';
import apiClient from '@/api/client';
import AppIcon from '@/components/AppIcon.vue';
import AppTable from '@/components/AppTable.vue';
import WorkspaceMetric from '@/components/WorkspaceMetric.vue';
import WorkspaceStatusBadge from '@/components/WorkspaceStatusBadge.vue';
import CreateLoanModal from '../components/CreateLoanModal.vue';

const loans = ref([]);
const router = useRouter();
const summary = ref({ activeCases: 0, sanctionedCount: 0, disbursedThisMonth: 0, totalSanctionedAmount: 0, totalDisbursedAmount: 0, commissionReceivable: 0, pendingDocumentsCount: 0, rejectedCount: 0 });
const activeTab = ref('all');
const searchQuery = ref('');
const selectedStage = ref('');
const bankFilter = ref('');
const viewMode = ref('list');
const loading = ref(false);
const loadError = ref(false);
const isCreateModalOpen = ref(false);
const isSubmitting = ref(false);

const stageOptions = ['new', 'documents_pending', 'documents_collected', 'submitted_to_bank', 'under_review', 'query_raised', 'sanctioned', 'partially_disbursed', 'fully_disbursed'];
const columns = [
  { key: 'case', label: 'Loan case' }, { key: 'borrower', label: 'Borrower' }, { key: 'property', label: 'Property / bank' },
  { key: 'required', label: 'Required', align: 'right' }, { key: 'sanctioned', label: 'Sanctioned', align: 'right' },
  { key: 'disbursed', label: 'Disbursed', align: 'right' }, { key: 'stage', label: 'Stage' }, { key: 'nextAction', label: 'Next action' }, { key: 'actions', label: '', align: 'right' },
];
const filterTabs = computed(() => [
  { id: 'all', label: 'All loans', count: loans.value.length },
  { id: 'new', label: 'New files', count: loans.value.filter(item => item.stage === 'new').length },
  { id: 'submitted', label: 'Submitted', count: loans.value.filter(item => ['submitted_to_bank', 'under_review', 'login_completed'].includes(item.stage)).length },
  { id: 'queries', label: 'Queries raised', count: loans.value.filter(item => item.stage === 'query_raised').length },
  { id: 'sanctioned', label: 'Sanctioned', count: loans.value.filter(item => item.stage === 'sanctioned').length },
  { id: 'disbursed', label: 'Disbursed', count: loans.value.filter(item => ['partially_disbursed', 'fully_disbursed'].includes(item.stage)).length },
]);
const kanbanColumns = [
  { id: 'new', title: 'New / KYC', description: 'Intake and document collection', stages: ['new', 'documents_pending', 'documents_collected'] },
  { id: 'submitted', title: 'Submitted', description: 'Bank login and submission', stages: ['submitted_to_bank', 'login_completed'] },
  { id: 'review', title: 'Review / query', description: 'Underwriting and open queries', stages: ['under_review', 'query_raised', 'query_resolved'] },
  { id: 'sanctioned', title: 'Sanctioned', description: 'Approved and awaiting release', stages: ['sanctioned', 'disbursement_pending'] },
  { id: 'disbursed', title: 'Disbursed', description: 'Partial and full disbursement', stages: ['partially_disbursed', 'fully_disbursed'] },
];

const portfolioDisbursementRate = computed(() => summary.value.totalSanctionedAmount ? Math.min(100, Math.round((summary.value.totalDisbursedAmount / summary.value.totalSanctionedAmount) * 100)) : 0);
const hasFilters = computed(() => Boolean(searchQuery.value || selectedStage.value || bankFilter.value || activeTab.value !== 'all'));
const filteredLoans = computed(() => loans.value.filter(item => {
  if (activeTab.value === 'new' && item.stage !== 'new') return false;
  if (activeTab.value === 'submitted' && !['submitted_to_bank', 'under_review', 'login_completed'].includes(item.stage)) return false;
  if (activeTab.value === 'queries' && item.stage !== 'query_raised') return false;
  if (activeTab.value === 'sanctioned' && item.stage !== 'sanctioned') return false;
  if (activeTab.value === 'disbursed' && !['partially_disbursed', 'fully_disbursed'].includes(item.stage)) return false;
  if (selectedStage.value && item.stage !== selectedStage.value) return false;
  const bank = (item.preferredBank || item.applications?.[0]?.bankName || '').toLowerCase();
  if (bankFilter.value && !bank.includes(bankFilter.value.toLowerCase())) return false;
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    const haystack = [item.loanCaseNumber, customerName(item), item.customerId?.mobile, bank].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}));

const fetchLoans = async () => {
  loading.value = true; loadError.value = false;
  try {
    const [listResponse, summaryResponse] = await Promise.all([apiClient.get('/loans?limit=100'), apiClient.get('/loans/summary')]);
    loans.value = listResponse.data?.data || listResponse.data || [];
    summary.value = summaryResponse.data?.data || summaryResponse.data || summary.value;
  } catch (error) { loadError.value = true; console.error('Error fetching loan directory:', error); }
  finally { loading.value = false; }
};
const handleCreateLoan = async payload => {
  isSubmitting.value = true;
  try { await apiClient.post('/loans', payload); isCreateModalOpen.value = false; await fetchLoans(); }
  catch (error) { console.error('Error creating loan case:', error); }
  finally { isSubmitting.value = false; }
};
const clearFilters = () => { searchQuery.value = ''; selectedStage.value = ''; bankFilter.value = ''; activeTab.value = 'all'; };
const getLoansByColumn = stages => filteredLoans.value.filter(item => stages.includes(item.stage));
const openLoan = loan => router.push(`/app/loans/${loan._id}`);
const customerName = loan => [loan.customerId?.firstName, loan.customerId?.lastName].filter(Boolean).join(' ') || 'Borrower not specified';
const disbursementRate = loan => loan.sanctionedAmount ? Math.min(100, Math.round(((Number(loan.disbursedAmount) || 0) / loan.sanctionedAmount) * 100)) : 0;
const formatCurrency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
const formatDate = value => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not scheduled';
const formatStage = value => (value || 'new').replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const stageTone = stage => ({ sanctioned: 'success', fully_disbursed: 'success', partially_disbursed: 'info', query_raised: 'warning', rejected: 'danger', under_review: 'purple' }[stage] || 'neutral');

onMounted(fetchLoans);
</script>
