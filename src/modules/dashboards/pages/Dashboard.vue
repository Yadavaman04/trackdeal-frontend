<template>
  <div class="dashboard-view mx-auto max-w-[1600px] space-y-5">
    <header class="page-header">
      <div class="max-w-2xl">
        <p class="eyebrow">Business command center</p>
        <h1 class="mt-1 font-heading text-2xl font-extrabold tracking-[-0.04em] text-text-primary sm:text-3xl">
          {{ greeting }}, {{ userName }}
        </h1>
        <p class="mt-1.5 text-body-sm text-text-muted">A focused view of pipeline movement, client commitments and revenue risk for {{ formattedToday }}.</p>
      </div>

      <div class="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
        <router-link to="/app/leads" class="btn-md btn-primary self-end">
          <AppIcon name="add" :size="15" weight="bold" />
          New lead
        </router-link>
        <div class="period-control max-w-full overflow-x-auto" aria-label="Dashboard reporting period">
          <button
            v-for="period in periods"
            :key="period"
            type="button"
            :aria-pressed="selectedPeriod === period"
            :class="{ active: selectedPeriod === period }"
            @click="setPeriod(period)"
          >
            {{ formatPeriodLabel(period) }}
          </button>
        </div>
      </div>
    </header>

    <div v-if="loading" class="dashboard-skeleton grid gap-4 lg:grid-cols-12" aria-label="Loading dashboard">
      <div class="skeleton h-72 lg:col-span-8"></div>
      <div class="skeleton h-72 lg:col-span-4"></div>
    </div>

    <template v-else>
      <section class="grid gap-4 lg:grid-cols-12">
        <div class="pulse-panel relative overflow-hidden p-5 sm:p-7 lg:col-span-8">
          <div class="relative z-10 flex h-full min-h-[260px] flex-col justify-between">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">Active pipeline value</p>
                <p class="mt-2 font-heading text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-5xl">₹{{ formatCompact(kpis.activePipelineValue || 0) }}</p>
                <p class="mt-2 max-w-md text-caption leading-5 text-stone-400">{{ kpis.activeDeals || 0 }} live deals moving across {{ pipelineStages.length }} commercial stages.</p>
              </div>
              <span class="pulse-icon"><AppIcon name="trend" :size="22" weight="duotone" /></span>
            </div>

            <div>
              <div class="mb-2 flex items-center justify-between text-[10px] font-semibold text-stone-400">
                <span>Pipeline distribution</span>
                <router-link to="/app/leads" class="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200">
                  Open pipeline <AppIcon name="arrowRight" :size="12" />
                </router-link>
              </div>
              <div class="pipeline-signal" aria-label="Pipeline distribution by stage">
                <div
                  v-for="(stage, index) in pipelineStages"
                  :key="stage.key"
                  class="signal-bar group"
                  :style="{ height: `${Math.max(12, Math.min(100, getStageCount(stage.key) * 8 + 18 + index * 2))}%` }"
                  :title="`${stage.label}: ${getStageCount(stage.key)}`"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <aside class="section-panel p-4 sm:p-5 lg:col-span-4">
          <div class="flex items-center justify-between border-b border-default pb-3">
            <div>
              <p class="eyebrow">Action queue</p>
              <h2 class="mt-0.5 font-heading text-h3 font-bold text-text-primary">Today’s priorities</h2>
            </div>
            <span class="flex h-8 w-8 items-center justify-center rounded-[9px] bg-warning-bg text-warning-text">
              <AppIcon name="lightning" :size="16" weight="duotone" />
            </span>
          </div>
          <div class="divide-y divide-border-default">
            <router-link v-for="item in priorityItems" :key="item.label" :to="item.to" class="priority-row group">
              <span class="priority-icon" :class="item.tone"><AppIcon :name="item.icon" :size="15" weight="duotone" /></span>
              <span class="min-w-0 flex-1">
                <span class="block text-caption font-semibold text-text-primary">{{ item.label }}</span>
                <span class="block truncate text-[10px] text-text-muted">{{ item.detail }}</span>
              </span>
              <span class="font-mono text-body font-semibold text-text-primary">{{ item.value }}</span>
              <AppIcon name="arrowRight" :size="13" class="text-text-muted transition-transform group-hover:translate-x-0.5" />
            </router-link>
          </div>
        </aside>
      </section>

      <section class="metrics-strip section-panel" aria-label="Key performance indicators">
        <router-link v-for="metric in headlineMetrics" :key="metric.label" :to="metric.to" class="metric-cell group">
          <div class="flex items-center justify-between gap-3">
            <span class="metric-icon"><AppIcon :name="metric.icon" :size="16" weight="duotone" /></span>
            <AppIcon name="arrowRight" :size="13" class="text-text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
          </div>
          <p class="mt-4 font-heading text-2xl font-extrabold tracking-[-0.04em] text-text-primary">{{ metric.value }}</p>
          <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.11em] text-text-muted">{{ metric.label }}</p>
          <p class="mt-0.5 text-[10px] text-text-muted">{{ metric.detail }}</p>
        </router-link>
      </section>

      <section class="section-panel overflow-hidden">
        <header class="flex flex-col gap-3 border-b border-default px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="eyebrow">Conversion architecture</p>
            <h2 class="mt-0.5 font-heading text-h3 font-bold text-text-primary">Sales pipeline</h2>
          </div>
          <p class="text-caption text-text-muted">Live opportunity volume and estimated stage value</p>
        </header>
        <div class="pipeline-grid">
          <router-link v-for="(stage, index) in pipelineStages" :key="stage.key" to="/app/leads" class="pipeline-stage group">
            <div class="flex items-center justify-between">
              <span class="stage-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <AppIcon name="arrowRight" :size="13" class="text-text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </div>
            <p class="mt-6 font-heading text-2xl font-extrabold text-text-primary">{{ getStageCount(stage.key) }}</p>
            <p class="mt-1 text-caption font-semibold text-text-primary">{{ stage.label }}</p>
            <p class="mt-0.5 font-mono text-[10px] text-accent-600">₹{{ formatCompact(getStageValue(stage.key)) }}</p>
          </router-link>
        </div>
      </section>

      <section class="grid gap-4 xl:grid-cols-12">
        <div class="section-panel overflow-hidden xl:col-span-7">
          <header class="flex items-center justify-between border-b border-default px-5 py-4">
            <div>
              <p class="eyebrow">Client commitments</p>
              <h2 class="mt-0.5 font-heading text-h3 font-bold text-text-primary">Follow-ups</h2>
            </div>
            <router-link to="/app/tasks" class="btn-sm btn-secondary">View all</router-link>
          </header>
          <div v-if="followupItems.length" class="divide-y divide-border-default">
            <div v-for="task in followupItems.slice(0, 6)" :key="task.id" class="followup-row">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-600"><AppIcon name="phone" :size="14" weight="duotone" /></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-body-sm font-semibold text-text-primary">{{ task.leadName || task.title }}</p>
                  <span v-if="task.temperature === 'hot'" class="status-hot">High intent</span>
                </div>
                <p class="truncate text-caption text-text-muted">{{ task.title || task.type }}</p>
              </div>
              <div class="text-right">
                <p class="font-mono text-caption font-semibold text-text-primary">{{ task.dueTime || '11:00 AM' }}</p>
                <p class="text-[10px] text-text-muted">{{ task.type || 'Follow-up' }}</p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon"><AppIcon name="checkCircle" :size="24" weight="duotone" /></span>
            <p class="font-heading text-body font-bold text-text-primary">Queue cleared</p>
            <p class="text-caption text-text-muted">No pending calls or visits for today.</p>
          </div>
        </div>

        <div class="space-y-4 xl:col-span-5">
          <div class="section-panel p-5">
            <div class="flex items-start justify-between">
              <div>
                <p class="eyebrow">Collections</p>
                <h2 class="mt-0.5 font-heading text-h3 font-bold text-text-primary">Revenue realization</h2>
              </div>
              <span class="metric-icon"><AppIcon name="currency" :size="16" weight="duotone" /></span>
            </div>
            <div class="mt-5 grid grid-cols-2 gap-4">
              <div><p class="metric-label">Receivable</p><p class="metric-value">₹{{ formatCompact(kpis.commissionReceivable || 0) }}</p></div>
              <div><p class="metric-label">Received</p><p class="metric-value text-success-text">₹{{ formatCompact(kpis.commissionReceived || 0) }}</p></div>
            </div>
            <div class="mt-5">
              <div class="mb-2 flex justify-between text-caption"><span class="text-text-muted">Collection progress</span><span class="font-mono font-semibold text-success-text">{{ kpis.collectionRate || 0 }}%</span></div>
              <div class="h-1.5 overflow-hidden rounded-full bg-neutral-100"><div class="h-full rounded-full bg-accent-500 transition-all duration-500" :style="{ width: `${Math.min(100, kpis.collectionRate || 0)}%` }"></div></div>
            </div>
          </div>

          <router-link to="/app/loans" class="loan-panel group block p-5">
            <div class="flex items-start justify-between">
              <div><p class="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300">Financing desk</p><h2 class="mt-1 font-heading text-h3 font-bold text-white">Home-loan pipeline</h2></div>
              <span class="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/10 text-sky-200"><AppIcon name="bank" :size="18" weight="duotone" /></span>
            </div>
            <div class="mt-6 grid grid-cols-3 gap-3">
              <div><p class="loan-value">{{ loanSummary.activeCases || 0 }}</p><p class="loan-label">Active</p></div>
              <div><p class="loan-value">{{ loanSummary.sanctionedCount || 0 }}</p><p class="loan-label">Sanctioned</p></div>
              <div><p class="loan-value">₹{{ formatCompact(loanSummary.disbursedThisMonth || 0) }}</p><p class="loan-label">Disbursed</p></div>
            </div>
          </router-link>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { fetchBrokerDashboard } from '../api/endpoints';
import apiClient from '@/api/client';

const store = useStore();
const periods = ['today', 'this_week', 'this_month', 'this_quarter', 'this_year'];
const selectedPeriod = ref('this_month');
const loading = ref(true);

const kpis = ref({
  activeLeads: 0, activeProperties: 0, activeDeals: 0, activePipelineValue: 0,
  closedDealsPeriodCount: 0, closedDealsPeriodValue: 0, commissionReceivable: 0,
  commissionReceived: 0, commissionEarned: 0, commissionOverdue: 0,
  expectedThisMonth: 0, collectionRate: 0, followupsDueTodayCount: 0,
  overdueFollowupsCount: 0, siteVisitsScheduledCount: 0, newLeadsThisMonth: 0,
  hotLeads: 0,
});
const salesPipeline = ref({});
const leadSources = ref({});
const leadTemperatures = ref({ hot: 0, warm: 0, cold: 0 });
const todayFollowups = ref([]);
const overdueFollowups = ref([]);
const expectedCollections = ref([]);
const recentLeads = ref([]);
const loanSummary = ref({ activeCases: 0, sanctionedCount: 0, disbursedThisMonth: 0, totalSanctionedAmount: 0, totalDisbursedAmount: 0, commissionReceivable: 0 });

const userName = computed(() => {
  const user = store.state.auth.currentUser;
  return user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'there';
});
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
});
const formattedToday = computed(() => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }));
const pipelineStages = [
  { key: 'new', label: 'New' }, { key: 'qualified', label: 'Qualified' },
  { key: 'property_shared', label: 'Property shared' }, { key: 'site_visit', label: 'Site visit' },
  { key: 'negotiation', label: 'Negotiation' }, { key: 'booking', label: 'Booking' },
  { key: 'closed_won', label: 'Closed' },
];

const headlineMetrics = computed(() => [
  { label: 'Active leads', value: kpis.value.activeLeads || 0, detail: `${kpis.value.newLeadsThisMonth || 0} new this month`, to: '/app/leads', icon: 'users' },
  { label: 'Live deals', value: kpis.value.activeDeals || 0, detail: `₹${formatCompact(kpis.value.activePipelineValue || 0)} in motion`, to: '/app/deals', icon: 'handshake' },
  { label: 'Available inventory', value: kpis.value.activeProperties || 0, detail: 'Units ready to match', to: '/app/properties', icon: 'buildings' },
  { label: 'Receivable', value: `₹${formatCompact(kpis.value.commissionReceivable || 0)}`, detail: kpis.value.commissionOverdue ? `₹${formatCompact(kpis.value.commissionOverdue)} overdue` : 'Accounts on track', to: '/app/commissions/receivables', icon: 'currency' },
]);
const priorityItems = computed(() => [
  { label: 'Follow-ups due', detail: 'Client calls and commitments', value: kpis.value.followupsDueTodayCount || 0, to: '/app/tasks', icon: 'phone', tone: 'tone-accent' },
  { label: 'Site visits', detail: 'Scheduled property visits', value: kpis.value.siteVisitsScheduledCount || 0, to: '/app/tasks', icon: 'house', tone: 'tone-info' },
  { label: 'High-intent leads', detail: 'Require immediate attention', value: kpis.value.hotLeads || leadTemperatures.value.hot || 0, to: '/app/leads', icon: 'flame', tone: 'tone-danger' },
  { label: 'Overdue actions', detail: 'Past service commitment', value: kpis.value.overdueFollowupsCount || 0, to: '/app/tasks', icon: 'warning', tone: 'tone-warning' },
]);
const followupItems = computed(() => [...overdueFollowups.value, ...todayFollowups.value]);

function formatPeriodLabel(period) {
  return ({ today: 'Today', this_week: 'Week', this_month: 'Month', this_quarter: 'Quarter', this_year: 'Year' })[period] || period;
}
function setPeriod(period) { selectedPeriod.value = period; loadDashboardData(); }
function getPeriodDates() {
  const now = new Date();
  let start = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  if (selectedPeriod.value === 'today') start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  else if (selectedPeriod.value === 'this_week') { const day = now.getDay(); start = new Date(now.setDate(now.getDate() - day + (day === 0 ? -6 : 1))); start.setHours(0, 0, 0, 0); }
  else if (selectedPeriod.value === 'this_month') start = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (selectedPeriod.value === 'this_quarter') start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  else if (selectedPeriod.value === 'this_year') start = new Date(now.getFullYear(), 0, 1);
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}
async function loadDashboardData() {
  loading.value = true;
  try {
    const [res, loanRes] = await Promise.allSettled([fetchBrokerDashboard(getPeriodDates()), apiClient.get('/loans/summary')]);
    if (res.status === 'fulfilled') {
      const data = res.value?.data || res.value;
      if (data) {
        if (data.kpis) kpis.value = { ...kpis.value, ...data.kpis };
        if (data.salesPipeline) salesPipeline.value = data.salesPipeline;
        if (data.leadSources) leadSources.value = data.leadSources;
        if (data.leadTemperatures) leadTemperatures.value = data.leadTemperatures;
        if (data.todayFollowups) todayFollowups.value = data.todayFollowups;
        if (data.overdueFollowups) overdueFollowups.value = data.overdueFollowups;
        if (data.expectedCollections) expectedCollections.value = data.expectedCollections;
        if (data.recentLeads) recentLeads.value = data.recentLeads;
      }
    }
    if (loanRes.status === 'fulfilled') loanSummary.value = loanRes.value?.data?.data || loanRes.value?.data || loanSummary.value;
  } catch (error) {
    console.error('Failed to load broker dashboard:', error);
  } finally { loading.value = false; }
}
const getStageCount = (key) => salesPipeline.value[key]?.count || 0;
const getStageValue = (key) => salesPipeline.value[key]?.value || 0;
function formatCompact(value) {
  const number = Number(value) || 0;
  if (number >= 10000000) return `${(number / 10000000).toFixed(2)} Cr`;
  if (number >= 100000) return `${(number / 100000).toFixed(2)} L`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)} K`;
  return number.toLocaleString('en-IN');
}
onMounted(loadDashboardData);
</script>

<style scoped>
.period-control { display: flex; gap: 2px; padding: 3px; border: 1px solid hsl(var(--neutral-100)); border-radius: 9px; background: hsl(var(--bg-surface)); }
.period-control button { flex: none; padding: 6px 10px; border-radius: 6px; color: hsl(var(--neutral-400)); font-size: 10px; font-weight: 700; transition: all 150ms ease; }
.period-control button:hover { color: hsl(var(--neutral-900)); }
.period-control button.active { color: hsl(var(--accent-700)); background: hsl(var(--accent-100)); box-shadow: inset 0 0 0 1px hsl(var(--accent-200) / 0.6); }
.pulse-panel { border-radius: 16px; color: white; background: radial-gradient(circle at 85% 5%, hsl(var(--accent-500) / 0.3), transparent 18rem), linear-gradient(135deg, hsl(18 20% 7%), hsl(166 22% 11%)); box-shadow: 0 20px 45px rgb(17 24 20 / 0.18); }
.pulse-panel::after { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px); background-size: 28px 28px; mask-image: linear-gradient(to left, black, transparent 80%); pointer-events: none; }
.pulse-icon { display: flex; height: 44px; width: 44px; align-items: center; justify-content: center; border-radius: 12px; color: hsl(160 65% 70%); background: rgb(255 255 255 / 0.08); border: 1px solid rgb(255 255 255 / 0.08); }
.pipeline-signal { display: flex; height: 70px; align-items: flex-end; gap: 5px; }
.signal-bar { flex: 1; min-height: 10px; border-radius: 3px 3px 1px 1px; background: linear-gradient(to top, hsl(var(--accent-600)), hsl(var(--accent-500))); opacity: 0.42; transition: opacity 160ms ease, transform 160ms ease; transform-origin: bottom; }
.signal-bar:hover { opacity: 1; transform: scaleY(1.04); }
.priority-row { display: flex; min-height: 58px; align-items: center; gap: 10px; padding: 8px 2px; }
.priority-row:hover .priority-icon { transform: scale(1.06); }
.priority-icon, .metric-icon { display: inline-flex; height: 32px; width: 32px; flex: none; align-items: center; justify-content: center; border-radius: 9px; transition: transform 160ms ease; color: hsl(var(--accent-600)); background: hsl(var(--accent-100)); }
.tone-info { color: hsl(var(--info-text)); background: hsl(var(--info-bg)); }.tone-danger { color: hsl(var(--danger-text)); background: hsl(var(--danger-bg)); }.tone-warning { color: hsl(var(--warning-text)); background: hsl(var(--warning-bg)); }
.metrics-strip { display: grid; overflow: hidden; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.metric-cell { min-height: 150px; padding: 18px; border-right: 1px solid hsl(var(--neutral-100)); transition: background-color 160ms ease; }
.metric-cell:last-child { border-right: 0; }.metric-cell:hover { background: hsl(var(--accent-50) / 0.45); }
.pipeline-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.pipeline-stage { min-height: 155px; padding: 16px; border-right: 1px solid hsl(var(--neutral-100)); transition: background-color 160ms ease; }.pipeline-stage:last-child { border-right: 0; }.pipeline-stage:hover { background: hsl(var(--bg-elevated)); }
.stage-index { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: hsl(var(--neutral-300)); }
.followup-row { display: flex; align-items: center; gap: 12px; min-height: 68px; padding: 10px 20px; transition: background-color 150ms ease; }.followup-row:hover { background: hsl(var(--bg-elevated)); }
.status-hot { padding: 2px 6px; border-radius: 4px; background: hsl(var(--danger-bg)); color: hsl(var(--danger-text)); font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.empty-state { display: flex; min-height: 260px; flex-direction: column; align-items: center; justify-content: center; gap: 5px; text-align: center; }.empty-icon { display: flex; width: 48px; height: 48px; align-items: center; justify-content: center; border-radius: 50%; color: hsl(var(--success-text)); background: hsl(var(--success-bg)); margin-bottom: 6px; }
.metric-label { color: hsl(var(--neutral-400)); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; }.metric-value { margin-top: 4px; color: hsl(var(--neutral-900)); font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 800; letter-spacing: -.03em; }
.loan-panel { border-radius: 14px; background: radial-gradient(circle at 100% 0%, rgb(56 189 248 / .18), transparent 16rem), linear-gradient(135deg, hsl(204 35% 12%), hsl(188 28% 10%)); box-shadow: 0 16px 36px rgb(15 35 38 / .14); transition: transform 180ms cubic-bezier(.16,1,.3,1); }.loan-panel:hover { transform: translateY(-2px); }.loan-value { color: white; font-family: 'Manrope', sans-serif; font-size: 17px; font-weight: 800; }.loan-label { margin-top: 2px; color: rgb(148 163 184); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
@media (max-width: 1023px) { .pipeline-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }.pipeline-stage { border-bottom: 1px solid hsl(var(--neutral-100)); }.metrics-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }.metric-cell:nth-child(2) { border-right: 0; }.metric-cell:nth-child(-n+2) { border-bottom: 1px solid hsl(var(--neutral-100)); } }
@media (max-width: 639px) { .pipeline-grid { display: flex; overflow-x: auto; }.pipeline-stage { min-width: 145px; }.metrics-strip { grid-template-columns: 1fr; }.metric-cell { border-right: 0; border-bottom: 1px solid hsl(var(--neutral-100)); min-height: 132px; }.metric-cell:last-child { border-bottom: 0; } }
</style>
