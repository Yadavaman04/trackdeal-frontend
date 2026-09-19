<template>
  <div class="financial-workspace space-y-5 pb-16">
    <header class="financial-page-header">
      <div>
        <p class="eyebrow">Revenue operations</p>
        <h1>Deals workspace</h1>
        <p>Track property transactions from reservation through registration, commission eligibility, and closure.</p>
      </div>
      <div class="workspace-action-cluster">
        <div class="workspace-segmented" aria-label="Deal view">
          <button type="button" :class="{ 'is-active': viewMode === 'table' }" @click="viewMode = 'table'"><PhTable :size="13" /> Table</button>
          <button type="button" :class="{ 'is-active': viewMode === 'kanban' }" @click="viewMode = 'kanban'"><PhColumns :size="13" /> Pipeline</button>
          <button type="button" :class="{ 'is-active': viewMode === 'lifecycle' }" @click="viewMode = 'lifecycle'"><PhTrendUp :size="13" /> Lifecycle</button>
        </div>
        <button type="button" class="btn-md btn-secondary" @click="openConvertReservation"><AppIcon name="key" :size="15" /> Convert hold</button>
        <button type="button" class="btn-md btn-primary" @click="isCreateOpen = true"><AppIcon name="add" :size="15" /> Create deal</button>
      </div>
    </header>

    <section v-if="isLoading && !dealsList.length" class="workspace-kpi-grid" aria-label="Loading deal summary">
      <div class="skeleton h-52 rounded-xl lg:col-span-6"></div>
      <div v-for="item in 3" :key="item" class="skeleton h-52 rounded-xl lg:col-span-2"></div>
    </section>

    <section v-else class="workspace-kpi-grid" aria-label="Deal summary">
      <article class="financial-hero workspace-hero--deals">
        <div class="relative z-[1] flex h-full flex-col justify-between">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="financial-hero__label">Portfolio deal value</p>
              <p class="financial-hero__value">{{ formatCurrency(metrics.totalValue) }}</p>
              <p class="financial-hero__caption">Recorded value across {{ dealsList.length }} transaction files</p>
            </div>
            <span class="financial-hero__icon"><AppIcon name="handshake" :size="22" weight="duotone" /></span>
          </div>
          <div class="workspace-hero__meta">
            <div><span>Current view</span><strong>{{ activeStageLabel }}</strong></div>
            <div><span>Visible files</span><strong>{{ filteredDeals.length }} deals</strong></div>
          </div>
        </div>
      </article>
      <WorkspaceMetric label="Active deals" :value="metrics.activeCount" caption="Open transaction files in the pipeline" icon="target" />
      <WorkspaceMetric label="Booking confirmed" :value="metrics.confirmedCount" caption="Booking-stage transaction records" icon="checkCircle" tone="success" />
      <WorkspaceMetric label="Expected commission" :value="formatCurrency(metrics.expectedCommissions)" caption="Commission recorded on existing deals" icon="currency" tone="warning" />
    </section>

    <section class="financial-panel" aria-label="Deal filters">
      <div class="financial-panel__header"><div><p class="eyebrow">Pipeline</p><h2>Transaction stages</h2></div><span class="financial-panel__meta">{{ dealsList.length }} total records</span></div>
      <div class="workspace-state-strip">
        <button v-for="state in stageStates" :key="state.key" type="button" :class="{ 'is-active': filters.status === state.key }" @click="filters.status = state.key"><span>{{ state.label }}</span><strong>{{ state.count }}</strong></button>
      </div>
      <div class="financial-table-toolbar">
        <div><p class="eyebrow">Deal register</p><h2>Transaction files</h2><p>Search by deal, customer, project, unit, stage, or owner.</p></div>
        <div class="financial-filter-row">
          <div class="relative min-w-0 sm:min-w-[260px]">
            <AppIcon name="search" :size="15" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--neutral-400));" />
            <input v-model="filters.search" class="filter-control !pl-9" type="search" placeholder="Search deals or customers…" />
          </div>
          <select v-model="filters.status" class="filter-control sm:max-w-[190px]" aria-label="Filter by transaction stage">
            <option value="">All stages</option><option v-for="status in dealStages" :key="status" :value="status">{{ formatStageName(status) }}</option>
          </select>
          <select v-model="filters.assignedTo" class="filter-control sm:max-w-[180px]" aria-label="Filter by assigned agent">
            <option value="">All owners</option><option v-for="agent in agents" :key="agent._id" :value="agent._id">{{ [agent.firstName, agent.lastName].filter(Boolean).join(' ') }}</option>
          </select>
          <button v-if="hasFilters" type="button" class="btn-md btn-ghost" @click="resetFilters">Clear</button>
        </div>
      </div>
    </section>

    <div v-if="error" class="financial-error" role="alert">
      <AppIcon name="warning" :size="18" /><div><strong>Deals could not be loaded</strong><p>Retry to restore the transaction workspace.</p></div><button type="button" class="btn-sm btn-secondary" @click="refetch">Retry</button>
    </div>

    <AppTable
      v-if="viewMode === 'table'"
      class="financial-table"
      :rows="filteredDeals"
      :columns="columns"
      :is-loading="isLoading"
      :page-size="15"
      empty-title="No deals in this view"
      empty-subtext="Clear the current filters or create a deal to begin tracking its transaction lifecycle."
      @row-click="openDeal"
    >
      <template #cell(deal)="{ row }"><div class="workspace-record"><span class="workspace-code">{{ row.dealNumber || 'Unnumbered deal' }}</span><small>{{ formatDate(row.createdAt) }}</small></div></template>
      <template #cell(customer)="{ row }"><div class="workspace-record max-w-[180px]"><strong>{{ customerName(row) }}</strong><small>{{ row.customer?.mobile || 'Mobile not available' }}</small></div></template>
      <template #cell(asset)="{ row }"><div class="workspace-record max-w-[190px]"><strong>{{ row.project?.name || row.projectTitle || 'Project not linked' }}</strong><small>{{ row.unit?.unitNumber || row.unitCode ? `Unit ${row.unit?.unitNumber || row.unitCode}` : 'Unit not assigned' }}</small></div></template>
      <template #cell(value)="{ row }"><span class="financial-amount">{{ formatCurrency(row.dealValue ?? row.askingPrice) }}</span></template>
      <template #cell(stage)="{ row }"><WorkspaceStatusBadge :label="formatStageName(row.status)" :tone="stageTone(row.status)" /></template>
      <template #cell(closeDate)="{ row }"><div class="workspace-record"><strong>{{ formatDate(row.closeDate) }}</strong><small>{{ row.closeDate ? 'Expected close' : 'Not scheduled' }}</small></div></template>
      <template #cell(owner)="{ row }"><div class="workspace-record"><strong>{{ ownerName(row) }}</strong><small>Deal owner</small></div></template>
      <template #cell(actions)="{ row }"><router-link :to="`/app/deals/${row._id || row.id}`" class="financial-action financial-action--primary" aria-label="Open deal" @click.stop><AppIcon name="arrowRight" :size="14" /></router-link></template>
    </AppTable>

    <DealPipelineBoard v-else-if="viewMode === 'kanban'" :deals="filteredDeals" @stageChange="handleStageChange" @cancelDeal="triggerCancel" @startWizard="triggerWizard" />

    <section v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Deal lifecycle overview">
      <article v-for="lane in lifecycleLanes" :key="lane.key" class="workspace-lane">
        <header class="workspace-lane__header"><div><h3>{{ lane.label }}</h3><p>{{ lane.description }}</p></div><span class="workspace-lane__total">{{ formatCurrency(lane.total) }}</span></header>
        <div class="workspace-lane__body">
          <button v-for="deal in lane.deals" :key="deal._id || deal.id" type="button" class="workspace-lane-card text-left" @click="openDeal(deal)">
            <div class="flex items-center justify-between gap-2"><span class="workspace-code">{{ deal.dealNumber || 'Unnumbered deal' }}</span><WorkspaceStatusBadge :label="formatStageName(deal.status)" :tone="stageTone(deal.status)" /></div>
            <div class="workspace-record mt-3"><strong>{{ customerName(deal) }}</strong><small>{{ deal.project?.name || deal.projectTitle || 'Project not linked' }}</small></div>
            <div class="mt-3 flex items-center justify-between border-t pt-3" style="border-color: hsl(var(--neutral-100));"><span class="financial-amount">{{ formatCurrency(deal.dealValue ?? deal.askingPrice) }}</span><small style="color: hsl(var(--neutral-400));">{{ ownerName(deal) }}</small></div>
          </button>
          <div v-if="!lane.deals.length" class="workspace-inline-empty">No deals in this lifecycle stage.</div>
        </div>
      </article>
    </section>

    <DealCreationDrawer :isOpen="isCreateOpen" @close="isCreateOpen = false" @success="handleSuccess" />
    <ReservationConversionDrawer v-if="selectedHold" :isOpen="isConvertOpen" :property="selectedHold" @close="isConvertOpen = false; selectedHold = null" @success="handleSuccess" />
    <BookingWizard v-if="wizardTargetDeal" :isOpen="isWizardOpen" :deal="wizardTargetDeal" @close="isWizardOpen = false; wizardTargetDeal = null" @success="handleSuccess" />
    <DealCancellationDrawer v-if="cancelTargetDeal" :isOpen="isCancelOpen" :deal="cancelTargetDeal" @close="isCancelOpen = false; cancelTargetDeal = null" @success="handleSuccess" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { PhColumns, PhTable, PhTrendUp } from '@phosphor-icons/vue';
import apiClient from '@/api/client';
import AppIcon from '@/components/AppIcon.vue';
import AppTable from '@/components/AppTable.vue';
import WorkspaceMetric from '@/components/WorkspaceMetric.vue';
import WorkspaceStatusBadge from '@/components/WorkspaceStatusBadge.vue';
import DealPipelineBoard from '../components/DealPipelineBoard.vue';
import DealCreationDrawer from '../components/DealCreationDrawer.vue';
import ReservationConversionDrawer from '../components/ReservationConversionDrawer.vue';
import BookingWizard from '../components/BookingWizard.vue';
import DealCancellationDrawer from '../components/DealCancellationDrawer.vue';
import { useDealsQuery, useTransitionStageMutation } from '../queries';

const router = useRouter();
const store = useStore();
const filters = ref({ search: '', status: '', assignedTo: '', sort: 'createdAt', order: -1 });
const viewMode = ref('table');
const isCreateOpen = ref(false);
const isConvertOpen = ref(false);
const isWizardOpen = ref(false);
const isCancelOpen = ref(false);
const selectedHold = ref(null);
const wizardTargetDeal = ref(null);
const cancelTargetDeal = ref(null);
const agents = ref([]);
const dealStages = ['draft', 'token_received', 'booking_initiated', 'booking_confirmed', 'agreement_executed', 'registration_completed', 'commission_eligible', 'deal_closed', 'cancelled'];
const columns = [
  { key: 'deal', label: 'Deal' }, { key: 'customer', label: 'Customer' }, { key: 'asset', label: 'Project & unit' },
  { key: 'value', label: 'Deal value', align: 'right' }, { key: 'stage', label: 'Stage' }, { key: 'closeDate', label: 'Expected close' },
  { key: 'owner', label: 'Owner' }, { key: 'actions', label: '', align: 'right' },
];

const { data, isLoading, error, refetch } = useDealsQuery(filters);
const { mutateAsync: transitionStage } = useTransitionStageMutation();
const dealsList = computed(() => data.value?.data || data.value || []);
const filteredDeals = computed(() => dealsList.value.filter(deal => {
  if (filters.value.status && deal.status !== filters.value.status) return false;
  if (filters.value.assignedTo && (deal.assignedTo?._id || deal.assignedTo) !== filters.value.assignedTo) return false;
  if (filters.value.search.trim()) {
    const query = filters.value.search.toLowerCase();
    const haystack = [deal.dealNumber, customerName(deal), deal.customer?.mobile, deal.project?.name, deal.projectTitle, deal.unit?.unitNumber, deal.unitCode].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}));
const metrics = computed(() => ({
  activeCount: dealsList.value.filter(deal => !['cancelled', 'deal_closed', 'commission_received'].includes(deal.status)).length,
  confirmedCount: dealsList.value.filter(deal => ['booking_initiated', 'booking_confirmed'].includes(deal.status)).length,
  totalValue: dealsList.value.reduce((sum, deal) => sum + Number(deal.dealValue ?? deal.askingPrice ?? 0), 0),
  expectedCommissions: dealsList.value.reduce((sum, deal) => sum + Number(deal.commissionAmount || 0), 0),
}));
const stageStates = computed(() => [
  { key: '', label: 'All deals', count: dealsList.value.length },
  { key: 'draft', label: 'Draft', count: countStage(['draft']) },
  { key: 'booking_confirmed', label: 'Booking confirmed', count: countStage(['booking_confirmed']) },
  { key: 'agreement_executed', label: 'Agreement executed', count: countStage(['agreement_executed']) },
  { key: 'registration_completed', label: 'Registered', count: countStage(['registration_completed']) },
  { key: 'deal_closed', label: 'Closed', count: countStage(['deal_closed']) },
  { key: 'cancelled', label: 'Cancelled', count: countStage(['cancelled']) },
]);
const activeStageLabel = computed(() => stageStates.value.find(item => item.key === filters.value.status)?.label || formatStageName(filters.value.status));
const hasFilters = computed(() => Boolean(filters.value.search || filters.value.status || filters.value.assignedTo));
const lifecycleLanes = computed(() => [
  makeLane('opening', 'Opening', 'Reservation, token, and booking preparation', ['draft', 'token_received', 'booking_initiated']),
  makeLane('execution', 'Execution', 'Booking, agreement, and registration', ['booking_confirmed', 'agreement_executed', 'registration_completed']),
  makeLane('revenue', 'Revenue ready', 'Commission eligibility and completed deals', ['commission_eligible', 'deal_closed', 'commission_received']),
  makeLane('attention', 'Attention', 'Transactions marked as cancelled', ['cancelled']),
]);

function countStage(stages) { return dealsList.value.filter(deal => stages.includes(deal.status)).length; }
function makeLane(key, label, description, stages) {
  const laneDeals = filteredDeals.value.filter(deal => stages.includes(deal.status));
  return { key, label, description, deals: laneDeals, total: laneDeals.reduce((sum, deal) => sum + Number(deal.dealValue ?? deal.askingPrice ?? 0), 0) };
}
const resetFilters = () => { filters.value = { search: '', status: '', assignedTo: '', sort: 'createdAt', order: -1 }; };
const openDeal = deal => router.push(`/app/deals/${deal._id || deal.id}`);
const customerName = deal => deal.customer?.name || [deal.customer?.firstName, deal.customer?.lastName].filter(Boolean).join(' ') || 'Customer not linked';
const ownerName = deal => [deal.assignedTo?.firstName, deal.assignedTo?.lastName].filter(Boolean).join(' ') || deal.assignedTo?.name || 'Unassigned';
const formatCurrency = value => value === null || value === undefined ? 'Not set' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
const formatDate = value => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not scheduled';
const formatStageName = stage => ({ draft: 'Reserved / draft', token_received: 'Token received', booking_initiated: 'Booking initiated', booking_confirmed: 'Booking confirmed', agreement_executed: 'Agreement executed', registration_completed: 'Registration completed', commission_eligible: 'Commission eligible', deal_closed: 'Closed won', commission_received: 'Closed won', cancelled: 'Cancelled' }[stage] || (stage ? stage.replace(/_/g, ' ') : 'All deals'));
const stageTone = stage => ({ draft: 'neutral', token_received: 'warning', booking_initiated: 'info', booking_confirmed: 'info', agreement_executed: 'purple', registration_completed: 'purple', commission_eligible: 'success', deal_closed: 'success', commission_received: 'success', cancelled: 'danger' }[stage] || 'neutral');

const openConvertReservation = async () => {
  try {
    const response = await apiClient.get('/properties');
    const reserved = (response.data?.data || []).filter(property => property.status === 'reserved');
    if (reserved.length) { selectedHold.value = reserved[0]; isConvertOpen.value = true; }
    else store.dispatch('notifications/triggerToast', { message: 'No active reservation holds are available for conversion.', type: 'warning' });
  } catch (error) { console.error('Failed to check reserved holds:', error); }
};
const handleStageChange = async ({ deal, oldStage, newStage }) => {
  try {
    await transitionStage({ id: deal._id || deal.id, stage: newStage, notes: `Moved from ${oldStage} to ${newStage}` });
    store.dispatch('notifications/triggerToast', { message: `Deal moved to ${formatStageName(newStage)}.`, type: 'success' });
    refetch();
  } catch (error) { store.dispatch('notifications/triggerToast', { message: error.response?.data?.message || 'Failed to update deal stage.', type: 'error' }); }
};
const triggerCancel = deal => { cancelTargetDeal.value = deal; isCancelOpen.value = true; };
const triggerWizard = deal => { wizardTargetDeal.value = deal; isWizardOpen.value = true; };
const handleSuccess = () => { refetch(); };

onMounted(async () => {
  try { const response = await apiClient.get('/users'); agents.value = response.data?.data || []; }
  catch (error) { console.error('Failed to load deal owners:', error); }
});
</script>
