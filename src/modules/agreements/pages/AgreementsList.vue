<template>
  <div class="financial-workspace space-y-5 pb-16">
    <header class="financial-page-header">
      <div>
        <p class="eyebrow">Document operations</p>
        <h1>Agreements workspace</h1>
        <p>Generate, review, version, execute, and retrieve property agreements without losing document context.</p>
      </div>
      <div class="workspace-action-cluster">
        <router-link to="/app/agreements/templates" class="btn-md btn-secondary"><AppIcon name="file" :size="15" /> Templates</router-link>
        <router-link to="/app/agreements/new" class="btn-md btn-primary"><AppIcon name="add" :size="15" /> Create agreement</router-link>
      </div>
    </header>

    <section v-if="loading && !agreements.length" class="workspace-kpi-grid" aria-label="Loading agreement summary">
      <div class="skeleton h-52 rounded-xl lg:col-span-6"></div>
      <div v-for="item in 3" :key="item" class="skeleton h-52 rounded-xl lg:col-span-2"></div>
    </section>

    <section v-else class="workspace-kpi-grid" aria-label="Agreement summary">
      <article class="financial-hero workspace-hero--agreements">
        <div class="relative z-[1] flex h-full flex-col justify-between">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="financial-hero__label">Agreement portfolio</p>
              <p class="financial-hero__value">{{ summary.totalCount || 0 }}</p>
              <p class="financial-hero__caption">Generated legal document records</p>
            </div>
            <span class="financial-hero__icon"><AppIcon name="agreements" :size="22" weight="duotone" /></span>
          </div>
          <div class="workspace-hero__meta">
            <div><span>Current view</span><strong>{{ activeTabLabel }}</strong></div>
            <div><span>Visible records</span><strong>{{ filteredAgreements.length }}</strong></div>
          </div>
        </div>
      </article>
      <WorkspaceMetric label="Draft" :value="summary.draftCount || 0" caption="Awaiting details or document review" icon="note" tone="warning" />
      <WorkspaceMetric label="Ready for print" :value="summary.readyForPrintCount || 0" caption="Finalized and ready for output" icon="printer" tone="info" />
      <WorkspaceMetric label="Executed" :value="summary.executedCount || 0" caption="Completed and signed agreements" icon="pen" tone="success" />
    </section>

    <section class="financial-panel" aria-label="Agreement states and filters">
      <div class="financial-panel__header">
        <div><p class="eyebrow">Lifecycle</p><h2>Document states</h2></div>
        <span class="financial-panel__meta">{{ summary.totalCount || agreements.length }} total records</span>
      </div>
      <div class="workspace-state-strip">
        <button v-for="tab in tabs" :key="tab.key" type="button" :class="{ 'is-active': activeStatusFilter === tab.key }" @click="activeStatusFilter = tab.key">
          <span>{{ tab.label }}</span><strong>{{ tab.count || 0 }}</strong>
        </button>
      </div>
      <div class="financial-table-toolbar">
        <div>
          <p class="eyebrow">Directory</p>
          <h2>Agreement register</h2>
          <p>Search document numbers, parties, properties, and agreement types.</p>
        </div>
        <div class="financial-filter-row">
          <div class="relative min-w-0 sm:min-w-[290px]">
            <AppIcon name="search" :size="15" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--neutral-400));" />
            <input v-model="searchQuery" class="filter-control !pl-9" type="search" placeholder="Search agreements, parties, property…" @input="handleSearch" />
          </div>
          <button type="button" class="btn-md btn-secondary" :disabled="loading" @click="fetchAgreements"><AppIcon name="refresh" :size="15" :class="{ 'animate-spin': loading }" /> Refresh</button>
        </div>
      </div>
    </section>

    <div v-if="loadError" class="financial-error" role="alert">
      <AppIcon name="warning" :size="18" />
      <div><strong>Agreement register could not be loaded</strong><p>Check the connection and retry without losing your filters.</p></div>
      <button type="button" class="btn-sm btn-secondary" @click="fetchAgreements">Retry</button>
    </div>

    <AppTable
      class="financial-table"
      :rows="filteredAgreements"
      :columns="columns"
      :is-loading="loading"
      :page-size="15"
      empty-title="No agreements in this view"
      empty-subtext="Create an agreement or clear the current lifecycle filter to see more records."
      @row-click="openAgreement"
    >
      <template #cell(agreement)="{ row }">
        <div class="workspace-record"><span class="workspace-code">{{ row.agreementNumber || 'Unnumbered agreement' }}</span><small>Version {{ row.currentVersionNumber || 1 }}.0</small></div>
      </template>
      <template #cell(parties)="{ row }">
        <div class="workspace-record max-w-[190px]"><strong>{{ partyName(row.structuredData?.transferees, 'Buyer not specified') }}</strong><small>Seller: {{ partyName(row.structuredData?.transferors, 'Not specified') }}</small></div>
      </template>
      <template #cell(subject)="{ row }">
        <div class="workspace-record max-w-[180px]"><strong>{{ propertyLabel(row) }}</strong><small>{{ row.structuredData?.property?.buildingName || row.structuredData?.property?.societyName || 'Property details pending' }}</small></div>
      </template>
      <template #cell(type)="{ row }"><span class="text-[11px] font-semibold">{{ row.agreementType || 'Agreement' }}</span></template>
      <template #cell(value)="{ row }"><span class="financial-amount">{{ formatCurrency(row.structuredData?.consideration?.totalAmount) }}</span></template>
      <template #cell(date)="{ row }"><span class="text-[10px] font-medium">{{ formatDate(row.structuredData?.agreement?.agreementDate || row.createdAt) }}</span></template>
      <template #cell(status)="{ row }"><WorkspaceStatusBadge :label="formatStatus(row.status)" :tone="statusTone(row.status)" /></template>
      <template #cell(actions)="{ row }">
        <div class="flex items-center justify-end gap-1" @click.stop>
          <router-link :to="`/app/agreements/${row._id}`" class="financial-action" aria-label="Preview agreement"><AppIcon name="eye" :size="14" /></router-link>
          <router-link :to="`/app/agreements/${row._id}/edit-details`" class="financial-action" aria-label="Edit agreement details"><AppIcon name="note" :size="14" /></router-link>
          <router-link :to="`/app/agreements/${row._id}/editor`" class="financial-action" aria-label="Open full document editor"><AppIcon name="file" :size="14" /></router-link>
          <button type="button" class="financial-action" aria-label="Duplicate agreement" @click="handleDuplicate(row._id)"><PhCopy :size="14" /></button>
          <a :href="`/api/v1/agreements/${row._id}/docx`" download class="financial-action" aria-label="Download agreement document"><AppIcon name="download" :size="14" /></a>
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { PhCopy } from '@phosphor-icons/vue';
import apiClient from '@/api/client';
import AppTable from '@/components/AppTable.vue';
import AppIcon from '@/components/AppIcon.vue';
import WorkspaceMetric from '@/components/WorkspaceMetric.vue';
import WorkspaceStatusBadge from '@/components/WorkspaceStatusBadge.vue';

const router = useRouter();
const loading = ref(false);
const loadError = ref(false);
const agreements = ref([]);
const summary = ref({ totalCount: 0, draftCount: 0, readyForPrintCount: 0, executedCount: 0, cancelledCount: 0 });
const activeStatusFilter = ref('all');
const searchQuery = ref('');

const columns = [
  { key: 'agreement', label: 'Agreement' },
  { key: 'parties', label: 'Parties' },
  { key: 'subject', label: 'Subject property' },
  { key: 'type', label: 'Type' },
  { key: 'value', label: 'Consideration', align: 'right' },
  { key: 'date', label: 'Agreement date' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right' },
];

const tabs = computed(() => [
  { key: 'all', label: 'All agreements', count: summary.value.totalCount },
  { key: 'draft', label: 'Draft', count: summary.value.draftCount },
  { key: 'ready_for_print', label: 'Ready for print', count: summary.value.readyForPrintCount },
  { key: 'executed', label: 'Executed', count: summary.value.executedCount },
]);
const activeTabLabel = computed(() => tabs.value.find(tab => tab.key === activeStatusFilter.value)?.label || 'All agreements');
const filteredAgreements = computed(() => agreements.value.filter(item => activeStatusFilter.value === 'all' || item.status === activeStatusFilter.value));

const fetchAgreements = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    const response = await apiClient.get('/agreements', { params: { search: searchQuery.value.trim() || undefined } });
    agreements.value = response.data?.data || response.data || [];
    if (response.data?.summary) summary.value = response.data.summary;
  } catch (error) {
    loadError.value = true;
    console.error('Failed to load agreements:', error);
  } finally {
    loading.value = false;
  }
};

let searchTimer;
const handleSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(fetchAgreements, 250); };
const handleDuplicate = async (id) => {
  try {
    const response = await apiClient.post(`/agreements/${id}/duplicate`);
    const agreement = response.data?.data || response.data;
    if (agreement?._id) router.push(`/app/agreements/${agreement._id}`);
    else await fetchAgreements();
  } catch (error) { console.error('Failed to duplicate agreement:', error); }
};

const openAgreement = row => router.push(`/app/agreements/${row._id}`);
const partyName = (parties, fallback) => parties?.[0]?.name || fallback;
const propertyLabel = row => row.structuredData?.property?.flatNumber ? `Flat ${row.structuredData.property.flatNumber}` : 'Property details pending';
const formatCurrency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
const formatDate = value => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified';
const formatStatus = value => (value || 'draft').replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const statusTone = status => ({ executed: 'success', ready_for_print: 'info', under_review: 'purple', cancelled: 'danger', draft: 'warning' }[status] || 'neutral');

onMounted(fetchAgreements);
</script>
