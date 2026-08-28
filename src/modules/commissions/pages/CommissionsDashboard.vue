<template>
  <main class="financial-workspace space-y-6">
    <header class="financial-page-header">
      <div>
        <p class="eyebrow">Financial operations</p>
        <h1>Commissions</h1>
        <p>Monitor earned revenue, collection progress, outstanding balances, and payment exceptions.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <router-link to="/app/commissions/receivables" class="btn-md btn-secondary">
          <AppIcon name="chart" :size="16" /> Receivables
        </router-link>
        <button type="button" class="btn-md btn-primary" :disabled="loadingSummary || loadingCommissions" @click="loadAllData">
          <AppIcon name="refresh" :size="16" :class="{ 'animate-spin': loadingSummary || loadingCommissions }" /> Refresh
        </button>
      </div>
    </header>

    <section v-if="loadingSummary" class="grid grid-cols-1 gap-4 lg:grid-cols-12" aria-label="Loading commission summary">
      <div class="skeleton h-52 rounded-xl lg:col-span-6"></div>
      <div v-for="item in 3" :key="item" class="skeleton h-52 rounded-xl lg:col-span-2"></div>
    </section>

    <template v-else>
      <section class="grid grid-cols-1 gap-4 lg:grid-cols-12" aria-label="Commission summary">
        <article class="financial-hero lg:col-span-6">
          <div class="relative z-10 flex h-full flex-col justify-between gap-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="financial-hero__label">Outstanding commission</p>
                <p class="financial-hero__value">{{ formatCurrency(summary.totalOutstanding) }}</p>
                <p class="financial-hero__caption">
                  {{ formatCurrency(summary.totalOverdue) }} overdue across {{ summary.overdueCount || 0 }} records
                </p>
              </div>
              <span class="financial-hero__icon"><AppIcon name="currency" :size="22" weight="duotone" /></span>
            </div>
            <div>
              <div class="mb-2 flex items-center justify-between text-xs">
                <span>Collection progress</span>
                <strong>{{ summary.collectionRate || 0 }}%</strong>
              </div>
              <div class="financial-hero__progress"><span :style="{ width: `${Math.min(100, summary.collectionRate || 0)}%` }"></span></div>
              <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-white/65">
                <span>{{ formatCurrency(summary.totalCollected) }} collected</span>
                <span>{{ formatCurrency(summary.totalEarned) }} earned</span>
              </div>
            </div>
          </div>
        </article>

        <FinancialMetric class="lg:col-span-2" label="Earned" :value="formatCurrency(summary.totalEarned)" :caption="`${summary.totalDeals || 0} commission records`" icon="handshake" />
        <FinancialMetric class="lg:col-span-2" label="Collected" :value="formatCurrency(summary.totalCollected)" :caption="`${summary.fullyPaidCount || 0} fully paid`" icon="checkCircle" tone="success" />
        <FinancialMetric class="lg:col-span-2" label="Due this month" :value="formatCurrency(summary.expectedThisMonth)" caption="Expected in current cycle" icon="calendar" tone="info" />
      </section>

      <section class="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <article class="financial-panel xl:col-span-7">
          <div class="financial-panel__header">
            <div>
              <p class="eyebrow">Lifecycle position</p>
              <h2>Collection state</h2>
            </div>
            <span class="financial-panel__meta">{{ summary.totalDeals || 0 }} total records</span>
          </div>
          <div class="financial-state-grid">
            <button type="button" :class="{ 'is-active': filters.paymentStatus === '' }" @click="setPaymentStatus('')">
              <span>All</span><strong>{{ summary.totalDeals || 0 }}</strong>
            </button>
            <button type="button" :class="{ 'is-active': filters.paymentStatus === 'unpaid' }" @click="setPaymentStatus('unpaid')">
              <span>Unpaid</span><strong>{{ summary.unpaidCount || 0 }}</strong>
            </button>
            <button type="button" :class="{ 'is-active': filters.paymentStatus === 'partially_paid' }" @click="setPaymentStatus('partially_paid')">
              <span>Partially paid</span><strong>{{ summary.partiallyPaidCount || 0 }}</strong>
            </button>
            <button type="button" :class="{ 'is-active': filters.paymentStatus === 'fully_paid' }" @click="setPaymentStatus('fully_paid')">
              <span>Fully paid</span><strong>{{ summary.fullyPaidCount || 0 }}</strong>
            </button>
            <button type="button" class="is-risk" :class="{ 'is-active': filters.paymentStatus === 'overdue' }" @click="setPaymentStatus('overdue')">
              <span>Overdue</span><strong>{{ summary.overdueCount || 0 }}</strong>
            </button>
          </div>
        </article>

        <article class="financial-panel xl:col-span-5">
          <div class="financial-panel__header">
            <div><p class="eyebrow">Cash calendar</p><h2>Upcoming collections</h2></div>
            <router-link to="/app/commissions/receivables" class="financial-link">View ledger <AppIcon name="arrowRight" :size="13" /></router-link>
          </div>
          <div v-if="summary.upcomingCollections?.length" class="financial-queue">
            <router-link v-for="item in summary.upcomingCollections.slice(0, 4)" :key="item.id" :to="`/app/commissions/${item.id}`">
              <span class="financial-queue__date"><strong>{{ dayOfMonth(item.dueDate) }}</strong>{{ monthName(item.dueDate) }}</span>
              <span class="min-w-0 flex-1"><strong>{{ item.payablePartyName }}</strong><small>{{ item.commissionNumber }} · {{ item.projectName }}</small></span>
              <span class="financial-queue__amount">{{ formatCurrency(item.amount) }}</span>
            </router-link>
          </div>
          <div v-else class="financial-inline-empty"><AppIcon name="calendar" :size="20" /><span>No upcoming dated collections.</span></div>
        </article>
      </section>
    </template>

    <section class="financial-panel overflow-hidden">
      <div class="financial-table-toolbar">
        <div>
          <p class="eyebrow">Commission ledger</p>
          <h2>All commission records</h2>
        </div>
        <div class="financial-filter-row">
          <label class="relative min-w-0 flex-1 sm:min-w-[260px]">
            <span class="sr-only">Search commissions</span>
            <AppIcon name="search" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--neutral-300));" />
            <input v-model="filters.search" class="filter-control !pl-9" type="search" placeholder="Search commission, party or unit" @input="handleSearch" />
          </label>
          <label class="min-w-[180px]">
            <span class="sr-only">Paying party type</span>
            <select v-model="filters.payablePartyType" class="filter-control" @change="applyFilters">
              <option value="">All paying parties</option>
              <option value="builder">Builder / Developer</option>
              <option value="seller">Property Seller</option>
              <option value="customer">Customer / Buyer</option>
              <option value="channel_partner">Channel Partner</option>
              <option value="broker">Broker</option>
              <option value="bank">Bank</option>
              <option value="dsa">DSA</option>
            </select>
          </label>
          <button v-if="hasFilters" type="button" class="btn-md btn-secondary" @click="resetFilters"><AppIcon name="close" :size="14" /> Clear</button>
        </div>
      </div>

      <div v-if="listError" class="financial-error">
        <AppIcon name="warning" :size="20" />
        <div><strong>Commission ledger could not be loaded</strong><p>Retry the request without losing your current filters.</p></div>
        <button class="btn-md btn-secondary" @click="loadCommissions">Retry</button>
      </div>

      <AppTable
        v-else
        class="financial-table"
        :columns="columns"
        :rows="commissionsList"
        :pagination="pagination"
        :is-loading="loadingCommissions"
        empty-title="No commission records match this view"
        empty-subtext="Adjust the status, paying-party, or search filters to broaden the ledger."
        @row-click="openDetails"
        @page-change="changePage"
        @page-size-change="changePageSize"
      >
        <template #cell(commission)="{ row }">
          <div><router-link :to="`/app/commissions/${row._id}`" class="financial-primary-link" @click.stop>{{ row.commissionNumber || fallbackNumber(row) }}</router-link><small>{{ row.dealId?.dealNumber || formatSource(row.sourceType) }}</small></div>
        </template>
        <template #cell(context)="{ row }">
          <div><strong>{{ customerName(row) }}</strong><small>{{ row.projectId?.name || row.propertyId?.title || row.unitNumber || 'No property context' }}</small></div>
        </template>
        <template #cell(party)="{ row }">
          <div><strong>{{ row.payablePartyName || 'Paying party not set' }}</strong><small>{{ formatPartyType(row.payablePartyType) }}</small></div>
        </template>
        <template #cell(expected)="{ row }"><span class="financial-amount">{{ formatCurrency(row.totalCommissionExpected) }}</span><small>{{ Number(row.commissionRate || 0) }}% rate</small></template>
        <template #cell(collected)="{ row }"><span class="financial-amount financial-amount--positive">{{ formatCurrency(row.totalCommissionCollected) }}</span><small>{{ getCollectionPercentage(row.totalCommissionCollected, row.totalCommissionExpected) }}% collected</small></template>
        <template #cell(outstanding)="{ row }"><span class="financial-amount" :class="row.paymentStatus === 'overdue' ? 'financial-amount--risk' : 'financial-amount--warning'">{{ formatCurrency(row.totalCommissionOutstanding) }}</span><small>{{ formatDate(row.expectedPaymentDate) }}</small></template>
        <template #cell(status)="{ row }"><FinancialStatusBadge :status="row.paymentStatus" /></template>
        <template #cell(actions)="{ row }">
          <div class="flex justify-end gap-1.5">
            <button v-if="Number(row.totalCommissionOutstanding) > 0" type="button" class="financial-action financial-action--primary" @click.stop="openPayment(row)"><AppIcon name="payment" :size="14" /> Record</button>
            <router-link :to="`/app/commissions/${row._id}`" class="financial-action" @click.stop><AppIcon name="eye" :size="14" /> View</router-link>
          </div>
        </template>
      </AppTable>
    </section>

    <RecordPaymentModal :is-open="paymentModalOpen" :record="activePaymentRecord" :saving="savingPayment" @close="closePayment" @submit="submitPayment" />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTable from '@/components/AppTable.vue';
import FinancialMetric from '../components/FinancialMetric.vue';
import FinancialStatusBadge from '../components/FinancialStatusBadge.vue';
import RecordPaymentModal from '../components/RecordPaymentModal.vue';
import { fetchCommissionSummary, fetchCommissions, recordCommissionPayment } from '../api/endpoints';
import { formatCurrency, formatDate, getCollectionPercentage } from '../utils/financialFormat';

const router = useRouter();
const summary = ref({ totalEarned: 0, totalCollected: 0, totalOutstanding: 0, totalOverdue: 0, expectedThisMonth: 0, fullyPaidCount: 0, partiallyPaidCount: 0, unpaidCount: 0, overdueCount: 0, totalDeals: 0, collectionRate: 0, upcomingCollections: [] });
const commissionsList = ref([]);
const pagination = ref({ page: 1, limit: 15, total: 0, pages: 1 });
const filters = ref({ search: '', paymentStatus: '', payablePartyType: '' });
const loadingSummary = ref(true);
const loadingCommissions = ref(true);
const listError = ref(false);
const paymentModalOpen = ref(false);
const activeCommission = ref(null);
const savingPayment = ref(false);
let searchTimer;

const columns = [
  { key: 'commission', label: 'Commission' },
  { key: 'context', label: 'Customer / Asset' },
  { key: 'party', label: 'Payable by' },
  { key: 'expected', label: 'Expected', align: 'right' },
  { key: 'collected', label: 'Collected', align: 'right' },
  { key: 'outstanding', label: 'Outstanding / Due', align: 'right' },
  { key: 'status', label: 'Payment status' },
  { key: 'actions', label: 'Actions', align: 'right' },
];

const hasFilters = computed(() => Boolean(filters.value.search || filters.value.paymentStatus || filters.value.payablePartyType));
const activePaymentRecord = computed(() => activeCommission.value ? ({
  id: activeCommission.value._id,
  commissionNumber: activeCommission.value.commissionNumber,
  partyName: activeCommission.value.payablePartyName,
  expected: activeCommission.value.totalCommissionExpected,
  outstanding: activeCommission.value.totalCommissionOutstanding,
}) : null);

const loadSummary = async () => {
  loadingSummary.value = true;
  try { const response = await fetchCommissionSummary(); summary.value = response?.data || summary.value; }
  catch (error) { console.error('Failed to load commission summary:', error); }
  finally { loadingSummary.value = false; }
};
const loadCommissions = async () => {
  loadingCommissions.value = true;
  listError.value = false;
  try {
    const response = await fetchCommissions({ page: pagination.value.page, limit: pagination.value.limit, search: filters.value.search.trim() || undefined, paymentStatus: filters.value.paymentStatus || undefined, payablePartyType: filters.value.payablePartyType || undefined });
    commissionsList.value = response?.data || [];
    if (response?.pagination) pagination.value = response.pagination;
  } catch (error) { listError.value = true; console.error('Failed to load commissions:', error); }
  finally { loadingCommissions.value = false; }
};
const loadAllData = () => Promise.all([loadSummary(), loadCommissions()]);
const applyFilters = () => { pagination.value.page = 1; loadCommissions(); };
const setPaymentStatus = (status) => { filters.value.paymentStatus = status; applyFilters(); };
const handleSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(applyFilters, 300); };
const resetFilters = () => { filters.value = { search: '', paymentStatus: '', payablePartyType: '' }; applyFilters(); };
const changePage = (page) => { pagination.value.page = page; loadCommissions(); };
const changePageSize = (limit) => { pagination.value = { ...pagination.value, page: 1, limit }; loadCommissions(); };
const openDetails = row => router.push(`/app/commissions/${row._id}`);
const openPayment = row => { activeCommission.value = row; paymentModalOpen.value = true; };
const closePayment = () => { paymentModalOpen.value = false; activeCommission.value = null; };
const submitPayment = async (form) => {
  if (!activeCommission.value) return;
  savingPayment.value = true;
  try { await recordCommissionPayment({ id: activeCommission.value._id, ...form }); closePayment(); await loadAllData(); }
  catch (error) { window.alert(error.response?.data?.error?.message || error.message || 'Failed to record payment.'); }
  finally { savingPayment.value = false; }
};

const customerName = row => row.customerId?.name || [row.customerId?.firstName, row.customerId?.lastName].filter(Boolean).join(' ') || 'Customer not linked';
const formatPartyType = type => ({ builder: 'Builder / Developer', seller: 'Property Seller', customer: 'Customer / Buyer', channel_partner: 'Channel Partner', broker: 'Broker', bank: 'Bank', dsa: 'DSA', financial_institution: 'Financial Institution' }[type] || type || 'Other');
const formatSource = source => ({ PROPERTY_DEAL: 'Property deal', LOAN: 'Loan case', CHANNEL_PARTNER: 'Channel partner' }[source] || 'Commission source');
const fallbackNumber = row => `COM-${String(row._id || '').slice(-4).toUpperCase()}`;
const dayOfMonth = date => new Date(date).toLocaleDateString('en-IN', { day: '2-digit' });
const monthName = date => new Date(date).toLocaleDateString('en-IN', { month: 'short' });

onMounted(loadAllData);
onBeforeUnmount(() => clearTimeout(searchTimer));
</script>
