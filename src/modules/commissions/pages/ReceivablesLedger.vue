<template>
  <main class="financial-workspace space-y-6">
    <header class="financial-page-header">
      <div>
        <p class="eyebrow">Collections command center</p>
        <h1>Receivables</h1>
        <p>Prioritize outstanding commission, overdue exposure, debtor ownership, and the next collection action.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <router-link to="/app/commissions" class="btn-md btn-secondary"><AppIcon name="arrowRight" :size="15" class="rotate-180" /> Commissions</router-link>
        <button type="button" class="btn-md btn-primary" :disabled="loading" @click="loadData"><AppIcon name="refresh" :size="16" :class="{ 'animate-spin': loading }" /> Refresh</button>
      </div>
    </header>

    <section v-if="loading" class="grid grid-cols-1 gap-4 lg:grid-cols-12" aria-label="Loading receivables summary">
      <div class="skeleton h-52 rounded-xl lg:col-span-6"></div>
      <div v-for="item in 3" :key="item" class="skeleton h-52 rounded-xl lg:col-span-2"></div>
    </section>

    <template v-else-if="!loadError">
      <section class="grid grid-cols-1 gap-4 lg:grid-cols-12" aria-label="Receivables summary">
        <article class="financial-hero financial-hero--receivables lg:col-span-6">
          <div class="relative z-10 flex h-full flex-col justify-between gap-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="financial-hero__label">Total outstanding</p>
                <p class="financial-hero__value">{{ formatCurrency(summary.totalOutstanding) }}</p>
                <p class="financial-hero__caption">{{ formatCurrency(summary.totalOverdue) }} overdue · {{ summary.overdueCount || 0 }} past-due records</p>
              </div>
              <span class="financial-hero__icon"><AppIcon name="chart" :size="22" weight="duotone" /></span>
            </div>
            <div>
              <div class="mb-2 flex items-center justify-between text-xs"><span>Overall collection rate</span><strong>{{ summary.collectionRate || 0 }}%</strong></div>
              <div class="financial-hero__progress"><span :style="{ width: `${Math.min(100, summary.collectionRate || 0)}%` }"></span></div>
              <p class="mt-3 text-[11px] text-white/65">{{ formatCurrency(summary.totalCollected) }} collected from {{ formatCurrency(summary.totalEarned) }} earned</p>
            </div>
          </div>
        </article>
        <FinancialMetric class="lg:col-span-2" label="Collected" :value="formatCurrency(summary.totalCollected)" :caption="`${summary.collectionRate || 0}% of earned value`" icon="checkCircle" tone="success" />
        <FinancialMetric class="lg:col-span-2" label="Overdue" :value="formatCurrency(summary.totalOverdue)" :caption="`${summary.overdueCount || 0} records need attention`" icon="warning" tone="danger" />
        <FinancialMetric class="lg:col-span-2" label="Expected this month" :value="formatCurrency(summary.expectedThisMonth)" caption="Current collection cycle" icon="calendar" tone="info" />
      </section>

      <section class="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <article class="financial-panel xl:col-span-8">
          <div class="financial-panel__header">
            <div><p class="eyebrow">Exposure by age</p><h2>Receivable aging</h2></div>
            <span class="financial-panel__meta">Based on expected payment date</span>
          </div>
          <div class="aging-track" role="img" aria-label="Receivable aging distribution">
            <span v-for="bucket in agingBuckets" :key="bucket.key" :class="`aging-track__${bucket.tone}`" :style="{ width: `${bucket.percentage}%` }"></span>
          </div>
          <div class="aging-grid">
            <button v-for="bucket in agingBuckets" :key="bucket.key" type="button" :class="[`aging-item--${bucket.tone}`, { 'is-active': filters.aging === bucket.key }]" @click="toggleAging(bucket.key)">
              <span>{{ bucket.label }}</span>
              <strong>{{ formatCurrency(bucket.value) }}</strong>
              <small>{{ bucket.percentage }}% of outstanding</small>
            </button>
          </div>
        </article>

        <article class="financial-panel xl:col-span-4">
          <div class="financial-panel__header">
            <div><p class="eyebrow">Debtor concentration</p><h2>Top paying parties</h2></div>
            <span class="financial-panel__meta">{{ receivables.length }} entities</span>
          </div>
          <div v-if="topParties.length" class="party-ranking">
            <button v-for="(party, index) in topParties" :key="party.payablePartyName" type="button" @click="selectParty(party)">
              <span class="party-ranking__index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="min-w-0 flex-1"><strong>{{ party.payablePartyName }}</strong><small>{{ formatPartyType(party.payablePartyType) }} · {{ party.dealsCount }} records</small></span>
              <span class="text-right"><strong>{{ formatCurrency(party.totalOutstanding) }}</strong><small v-if="party.totalOverdue">{{ formatCurrency(party.totalOverdue) }} overdue</small></span>
            </button>
          </div>
          <div v-else class="financial-inline-empty"><AppIcon name="checkCircle" :size="20" /><span>No debtor exposure.</span></div>
        </article>
      </section>
    </template>

    <section v-if="loadError" class="financial-error">
      <AppIcon name="warning" :size="22" />
      <div><strong>Receivables could not be loaded</strong><p>The financial data is unchanged. Retry the request to continue.</p></div>
      <button class="btn-md btn-secondary" @click="loadData">Retry</button>
    </section>

    <section v-else class="financial-panel overflow-hidden">
      <div class="financial-table-toolbar">
        <div>
          <p class="eyebrow">Collection queue</p>
          <h2>Outstanding receivables</h2>
          <p>{{ filteredReceivables.length }} records across {{ filteredPartyCount }} paying parties</p>
        </div>
        <div class="financial-filter-row">
          <label class="relative min-w-0 flex-1 sm:min-w-[260px]">
            <span class="sr-only">Search receivables</span>
            <AppIcon name="search" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--neutral-300));" />
            <input v-model="filters.search" class="filter-control !pl-9" type="search" placeholder="Search commission, customer or party" />
          </label>
          <label class="min-w-[180px]">
            <span class="sr-only">Paying party type</span>
            <select v-model="filters.partyType" class="filter-control">
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

      <AppTable
        class="financial-table"
        :columns="columns"
        :rows="filteredReceivables"
        :is-loading="loading"
        :page-size="15"
        empty-title="No outstanding receivables in this view"
        empty-subtext="All matching commission has been collected, or the active filters exclude the remaining queue."
        @row-click="openDetails"
      >
        <template #cell(commission)="{ row }">
          <div><router-link :to="`/app/commissions/${row.id}`" class="financial-primary-link" @click.stop>{{ row.commissionNumber || 'Commission' }}</router-link><small>{{ row.projectOrProperty }}</small></div>
        </template>
        <template #cell(party)="{ row }">
          <div><strong>{{ row.payablePartyName }}</strong><small>{{ formatPartyType(row.payablePartyType) }}</small></div>
        </template>
        <template #cell(customer)="{ row }"><div><strong>{{ row.customerName || 'Customer not linked' }}</strong><small>{{ formatCurrency(row.dealValue) }} deal value</small></div></template>
        <template #cell(progress)="{ row }">
          <div class="min-w-[130px]"><div class="flex justify-between gap-3"><span class="financial-amount financial-amount--positive">{{ formatCurrency(row.collected) }}</span><small>{{ getCollectionPercentage(row.collected, row.expected) }}%</small></div><div class="financial-row-progress"><span :style="{ width: `${getCollectionPercentage(row.collected, row.expected)}%` }"></span></div><small>of {{ formatCurrency(row.expected) }}</small></div>
        </template>
        <template #cell(outstanding)="{ row }"><span class="financial-amount" :class="row.isPastDue ? 'financial-amount--risk' : 'financial-amount--warning'">{{ formatCurrency(row.outstanding) }}</span><small>{{ row.isPastDue ? `${getDaysPastDue(row.dueDate)} days overdue` : 'Current balance' }}</small></template>
        <template #cell(due)="{ row }"><div><strong :class="{ 'text-red-600 dark:text-red-400': row.isPastDue }">{{ formatDate(row.dueDate) }}</strong><small>{{ agingLabel(row) }}</small></div></template>
        <template #cell(status)="{ row }"><FinancialStatusBadge :status="row.paymentStatus" /></template>
        <template #cell(actions)="{ row }">
          <div class="flex justify-end gap-1.5">
            <button type="button" class="financial-action financial-action--primary" @click.stop="openPayment(row)"><AppIcon name="payment" :size="14" /> Record</button>
            <router-link :to="`/app/commissions/${row.id}`" class="financial-action" @click.stop><AppIcon name="eye" :size="14" /> View</router-link>
          </div>
        </template>
      </AppTable>
    </section>

    <RecordPaymentModal :is-open="paymentModalOpen" :record="activePaymentRecord" :saving="savingPayment" @close="closePayment" @submit="submitPayment" />
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppTable from '@/components/AppTable.vue';
import FinancialMetric from '../components/FinancialMetric.vue';
import FinancialStatusBadge from '../components/FinancialStatusBadge.vue';
import RecordPaymentModal from '../components/RecordPaymentModal.vue';
import { fetchCommissionSummary, fetchReceivables, recordCommissionPayment } from '../api/endpoints';
import { formatCurrency, formatDate, getCollectionPercentage, getDaysPastDue } from '../utils/financialFormat';
import Swal from 'sweetalert2';

const router = useRouter();
const loading = ref(true);
const loadError = ref(false);
const receivables = ref([]);
const summary = ref({ totalEarned: 0, totalCollected: 0, totalOutstanding: 0, totalOverdue: 0, expectedThisMonth: 0, overdueCount: 0, collectionRate: 0, aging: { notDue: 0, days1to30: 0, days31to60: 0, days61to90: 0, days90Plus: 0 } });
const filters = ref({ search: '', partyType: '', partyName: '', aging: '' });
const paymentModalOpen = ref(false);
const activeReceivable = ref(null);
const savingPayment = ref(false);

const columns = [
  { key: 'commission', label: 'Commission / Asset' },
  { key: 'party', label: 'Payable by' },
  { key: 'customer', label: 'Customer' },
  { key: 'progress', label: 'Collected', align: 'right' },
  { key: 'outstanding', label: 'Outstanding', align: 'right' },
  { key: 'due', label: 'Due / Aging' },
  { key: 'status', label: 'Risk status' },
  { key: 'actions', label: 'Actions', align: 'right' },
];

const allReceivables = computed(() => receivables.value.flatMap(party => party.deals.map(deal => ({ ...deal, payablePartyName: party.payablePartyName, payablePartyType: party.payablePartyType }))));
const filteredReceivables = computed(() => allReceivables.value.filter(item => {
  if (filters.value.partyType && item.payablePartyType !== filters.value.partyType) return false;
  if (filters.value.partyName && item.payablePartyName !== filters.value.partyName) return false;
  if (filters.value.aging && getAgingKey(item) !== filters.value.aging) return false;
  if (filters.value.search.trim()) {
    const query = filters.value.search.toLowerCase();
    const haystack = [item.commissionNumber, item.customerName, item.payablePartyName, item.projectOrProperty].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}));
const filteredPartyCount = computed(() => new Set(filteredReceivables.value.map(item => item.payablePartyName)).size);
const hasFilters = computed(() => Object.values(filters.value).some(Boolean));
const topParties = computed(() => [...receivables.value].sort((a, b) => Number(b.totalOutstanding) - Number(a.totalOutstanding)).slice(0, 4));
const agingBuckets = computed(() => {
  const total = Number(summary.value.totalOutstanding) || 0;
  const source = summary.value.aging || {};
  return [
    { key: 'notDue', label: 'Current', value: Number(source.notDue) || 0, tone: 'current' },
    { key: 'days1to30', label: '1–30 days', value: Number(source.days1to30) || 0, tone: 'watch' },
    { key: 'days31to60', label: '31–60 days', value: Number(source.days31to60) || 0, tone: 'elevated' },
    { key: 'days61to90', label: '61–90 days', value: Number(source.days61to90) || 0, tone: 'high' },
    { key: 'days90Plus', label: '90+ days', value: Number(source.days90Plus) || 0, tone: 'critical' },
  ].map(bucket => ({ ...bucket, percentage: total > 0 ? Math.round((bucket.value / total) * 100) : 0 }));
});
const activePaymentRecord = computed(() => activeReceivable.value ? ({ id: activeReceivable.value.id, commissionNumber: activeReceivable.value.commissionNumber, partyName: activeReceivable.value.payablePartyName, expected: activeReceivable.value.expected, outstanding: activeReceivable.value.outstanding }) : null);

const loadData = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    const [summaryResponse, receivablesResponse] = await Promise.all([fetchCommissionSummary(), fetchReceivables()]);
    summary.value = summaryResponse?.data || summary.value;
    receivables.value = receivablesResponse?.data || [];
  } catch (error) { loadError.value = true; console.error('Failed to load receivables:', error); }
  finally { loading.value = false; }
};
const getAgingKey = item => {
  if (!item.dueDate || !item.isPastDue) return 'notDue';
  const days = getDaysPastDue(item.dueDate);
  if (days <= 30) return 'days1to30';
  if (days <= 60) return 'days31to60';
  if (days <= 90) return 'days61to90';
  return 'days90Plus';
};
const agingLabel = item => agingBuckets.value.find(bucket => bucket.key === getAgingKey(item))?.label || 'Current';
const toggleAging = key => { filters.value.aging = filters.value.aging === key ? '' : key; };
const selectParty = party => { filters.value.partyName = filters.value.partyName === party.payablePartyName ? '' : party.payablePartyName; };
const resetFilters = () => { filters.value = { search: '', partyType: '', partyName: '', aging: '' }; };
const openDetails = row => router.push(`/app/commissions/${row.id}`);
const openPayment = row => { activeReceivable.value = row; paymentModalOpen.value = true; };
const closePayment = () => { paymentModalOpen.value = false; activeReceivable.value = null; };
const submitPayment = async form => {
  if (!activeReceivable.value) return;
  savingPayment.value = true;
  try { await recordCommissionPayment({ id: activeReceivable.value.id, ...form }); closePayment(); await loadData(); }
  catch (error) { Swal.fire({ text: error.response?.data?.error?.message || error.message || 'Failed to record payment.', icon: 'error' }); }
  finally { savingPayment.value = false; }
};
const formatPartyType = type => ({ builder: 'Builder / Developer', seller: 'Property Seller', customer: 'Customer / Buyer', channel_partner: 'Channel Partner', broker: 'Broker', bank: 'Bank', dsa: 'DSA', financial_institution: 'Financial Institution' }[type] || type || 'Other');

onMounted(loadData);
</script>
