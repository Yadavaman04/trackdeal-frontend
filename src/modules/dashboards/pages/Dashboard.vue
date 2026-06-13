<template>
  <div class="space-y-6">
    <!-- Top Dashboard Filter Header Toolbar -->
    <div class="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
      <div>
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center gap-1.5">
          <span>{{ greetingText }}, {{ userName }}</span>
          <component :is="greetingIcon" :class="['w-5 h-5', greetingIcon === PhSun ? 'text-amber-500' : 'text-indigo-400 dark:text-indigo-300']" />
        </h2>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {{ formattedDate }} · {{ displayRoleName }} Workspace
        </p>
      </div>

      <!-- Filters control tools -->
      <div class="flex flex-wrap items-center gap-3 shrink-0">
        <!-- Date range selectors -->
        <DateRangeSelector />

        <!-- Branch Selector (For Manager / Admin / Super Admin roles only) -->
        <AppSelect 
          v-if="showBranchFilter"
          v-model="selectedBranch"
          :options="branchOptions"
          @update:modelValue="handleBranchChange"
          class="w-40"
        />
        
        <button 
          @click="refreshData"
          class="btn btn-secondary h-9 w-9 p-0"
          title="Force refresh metrics"
        >
          <PhArrowClockwise class="w-4 h-4 text-neutral-500" />
        </button>
      </div>
    </div>

    <!-- Active Loading state skeletal widget -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="i in 4" :key="i" class="card p-4 h-28 flex flex-col justify-between">
        <div class="h-4 skeleton rounded w-1/3"></div>
        <div class="h-8 skeleton rounded w-2/3 mt-2"></div>
      </div>
    </div>

    <!-- Layout templates switch by active user role -->
    <div v-else class="space-y-6">
      <!-- 1. AGENT DASHBOARD LAYOUT -->
      <template v-if="dashboardRole === 'agent'">
        <!-- KPIs Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPIWidget title="Active Leads" :value="metrics.activeLeads" description="Total leads currently in your active sales pipeline." trend="12%" trendDirection="up" />
          <KPIWidget title="Deals Closed (MTD)" :value="formatCurrency(metrics.dealsValueMTD)" description="Gross revenue value of deals successfully closed this month." trend="8%" trendDirection="up" />
          <KPIWidget title="Commissions Earned" :value="formatCurrency(metrics.commissionsEarned)" description="Your total approved commission earnings MTD." trend="15%" trendDirection="up" />
          <KPIWidget title="Pending Tasks" :value="metrics.pendingTasks" description="Action items assigned to you due today or overdue." trend="0" trendDirection="flat" />
        </div>

        <!-- Layout grid tables and quick actions -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Active Leads list -->
          <DashboardCard title="My Active Leads" subtitle="Leads currently awaiting action" class="lg:col-span-8 h-80">
            <template #actions>
              <button @click="triggerQuickAction('lead')" class="btn btn-secondary btn-sm h-7 text-xs px-2.5">
                <PhPlus class="w-3.5 h-3.5 text-neutral-550" />
                <span>Quick Lead</span>
              </button>
            </template>
            <DashboardTable 
              :columns="[
                { key: 'name', label: 'Lead Name' },
                { key: 'budget', label: 'Budget' },
                { key: 'stage', label: 'Stage' },
                { key: 'lastContact', label: 'Last Contact' }
              ]"
              :rows="metrics.activeLeadsList || []"
            >
              <template #cell(budget)="{ value }">{{ formatCurrency(value) }}</template>
              <template #cell(stage)="{ value }">
                <span class="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-blue-700 capitalize border border-blue-200/50">
                  {{ value }}
                </span>
              </template>
            </DashboardTable>
          </DashboardCard>

          <!-- Today's Tasks list -->
          <DashboardCard title="My Tasks" subtitle="Due today or overdue" class="lg:col-span-4 h-80">
            <template #actions>
              <button @click="triggerQuickAction('task')" class="btn btn-secondary btn-sm h-7 text-xs px-2.5">
                <PhPlus class="w-3.5 h-3.5 text-neutral-550" />
                <span>New Task</span>
              </button>
            </template>
            <DashboardTable 
              :columns="[
                { key: 'title', label: 'Task' },
                { key: 'due', label: 'Due' }
              ]"
              :rows="metrics.tasksList || []"
            />
          </DashboardCard>
        </div>
      </template>

      <!-- 2. BRANCH MANAGER DASHBOARD LAYOUT -->
      <template v-else-if="dashboardRole === 'branch_manager'">
        <!-- KPIs Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPIWidget title="Branch Gross Sales" :value="formatCurrency(metrics.branchGrossSales)" description="Total value of branch deals closed this month." trend="14%" trendDirection="up" />
          <KPIWidget title="Active Agents" :value="metrics.activeAgents" description="Total registered sales agents in this branch." trend="0" trendDirection="flat" />
          <KPIWidget title="Pending Approvals" :value="metrics.pendingApprovals" description="Deals and payouts waiting for manager audit." trend="2" trendDirection="up" />
          <KPIWidget title="Branch Conversion %" :value="`${metrics.conversionRate}%`" description="Conversion ratio from lead registration to closed-won deals." trend="3.2%" trendDirection="up" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Approvals queue -->
          <DashboardCard title="Approvals Queue" subtitle="Required actions" class="lg:col-span-7 h-80">
            <DashboardTable 
              :columns="[
                { key: 'item', label: 'Item Details' },
                { key: 'agent', label: 'Agent' },
                { key: 'value', label: 'Value' },
                { key: 'date', label: 'Requested Date' }
              ]"
              :rows="metrics.approvalsList || []"
            >
              <template #cell(value)="{ value }">{{ formatCurrency(value) }}</template>
            </DashboardTable>
          </DashboardCard>

          <!-- Agent performance ranking -->
          <DashboardCard title="Agent Leaderboard" subtitle="Top performing branch staff" class="lg:col-span-5 h-80">
            <DashboardTable 
              :columns="[
                { key: 'agent', label: 'Agent' },
                { key: 'leads', label: 'Leads' },
                { key: 'sales', label: 'Gross Sales' }
              ]"
              :rows="metrics.leaderboardList || []"
            >
              <template #cell(sales)="{ value }">{{ formatCurrency(value) }}</template>
            </DashboardTable>
          </DashboardCard>
        </div>
      </template>

      <!-- 3. EXECUTIVE / ORGANIZATIONAL DASHBOARD LAYOUT -->
      <template v-else-if="dashboardRole === 'org_admin' || dashboardRole === 'super_admin'">
        <!-- KPIs Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPIWidget title="Total Org Revenue" :value="formatCurrency(metrics.orgRevenue)" description="Organization-wide gross revenue closed MTD." trend="19%" trendDirection="up" />
          <KPIWidget title="Gross Commission" :value="formatCurrency(metrics.grossCommission)" description="Total company commissions generated." trend="11%" trendDirection="up" />
          <KPIWidget title="Active Leads" :value="metrics.orgLeads" description="Active leads managed across all branches." trend="6%" trendDirection="up" />
          <KPIWidget title="Avg Sales Cycle" :value="`${metrics.avgSalesCycle} Days`" description="Average conversion velocity of closed-won deals." trend="2 days" trendDirection="down" />
        </div>

        <!-- SVG Visual Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Revenue Growth Trend" subtitle="Monthly organization closed-won revenues" type="line" :data="metrics.revenueTrend || []" />
          <ChartContainer title="Lead Conversion Funnel" subtitle="Pipeline drop-offs and stages counts" type="funnel" :data="metrics.funnelData || []" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Branch rankings -->
          <DashboardCard title="Branch Rankings" subtitle="MTD branch volumes comparisons" class="lg:col-span-6 h-80">
            <DashboardTable 
              :columns="[
                { key: 'branch', label: 'Branch Office' },
                { key: 'leads', label: 'Active Leads' },
                { key: 'sales', label: 'Gross Closed' }
              ]"
              :rows="metrics.branchRankingsList || []"
            >
              <template #cell(sales)="{ value }">{{ formatCurrency(value) }}</template>
            </DashboardTable>
          </DashboardCard>

          <!-- Top Projects -->
          <DashboardCard title="Top Performing Projects" subtitle="Developments by sales yield value" class="lg:col-span-6 h-80">
            <DashboardTable 
              :columns="[
                { key: 'project', label: 'Development Project' },
                { key: 'available', label: 'Available Units' },
                { key: 'sales', label: 'Closed Revenue' }
              ]"
              :rows="metrics.topProjectsList || []"
            >
              <template #cell(sales)="{ value }">{{ formatCurrency(value) }}</template>
            </DashboardTable>
          </DashboardCard>
        </div>
      </template>

      <!-- 4. FINANCE DASHBOARD LAYOUT -->
      <template v-else-if="dashboardRole === 'finance'">
        <!-- KPIs Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPIWidget title="Unpaid Commissions" :value="formatCurrency(metrics.unpaidCommissions)" description="Total approved commissions awaiting payout disbursements." trend="4%" trendDirection="up" />
          <KPIWidget title="Disbursed MTD" :value="formatCurrency(metrics.disbursedCommissions)" description="Commissions successfully cleared and paid out." trend="22%" trendDirection="up" />
          <KPIWidget title="Compliance Audits" :value="metrics.complianceReviews" description="Closed-won deals requiring regulatory compliance checks." trend="0" trendDirection="flat" />
          <KPIWidget title="Tax Reserves (MTD)" :value="formatCurrency(metrics.taxReserves)" description="Tax deductions and reserves stored from disbursements." trend="15%" trendDirection="up" />
        </div>

        <!-- Visual chart row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Payout Disbursement History" subtitle="Monthly commissions payouts cleared" type="bar" :data="metrics.collectionsTrend || []" />
          <ChartContainer title="Tax & compliance Reserves" subtitle="Taxes accumulated across regions" type="line" :data="metrics.taxReservesTrend || []" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Pending Payouts -->
          <DashboardCard title="Pending Payouts" subtitle="Commissions approved for disbursement" class="lg:col-span-8 h-80">
            <DashboardTable 
              :columns="[
                { key: 'ref', label: 'Reference Ref' },
                { key: 'agent', label: 'Agent' },
                { key: 'amount', label: 'Amount' },
                { key: 'date', label: 'Approved Date' }
              ]"
              :rows="metrics.pendingPayoutsList || []"
            >
              <template #cell(amount)="{ value }">{{ formatCurrency(value) }}</template>
            </DashboardTable>
          </DashboardCard>

          <!-- Compliance alerts -->
          <DashboardCard title="Compliance Warnings" subtitle="Deal compliance alert flags" class="lg:col-span-4 h-80">
            <DashboardTable 
              :columns="[
                { key: 'deal', label: 'Deal' },
                { key: 'message', label: 'Message' }
              ]"
              :rows="metrics.complianceAlertsList || []"
            />
          </DashboardCard>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { PhArrowClockwise, PhPlus, PhSun, PhMoon } from '@phosphor-icons/vue';
import KPIWidget from '@/components/KPIWidget.vue';
import DashboardCard from '@/components/DashboardCard.vue';
import DashboardTable from '@/components/DashboardTable.vue';
import ChartContainer from '@/components/ChartContainer.vue';
import DateRangeSelector from '@/components/DateRangeSelector.vue';
import AppSelect from '@/components/AppSelect.vue';
import { useDashboardMetricsQuery } from '../queries';
import { useBranchesQuery } from '@/modules/settings/queries';

const store = useStore();
const selectedBranch = ref('all');

const userProfile = computed(() => store.state.auth.currentUser);
const userName = computed(() => {
  if (userProfile.value?.name) return userProfile.value.name;
  if (userProfile.value?.firstName) {
    return `${userProfile.value.firstName} ${userProfile.value.lastName || ""}`.trim();
  }
  return 'Mayank';
});

const greetingText = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
});

const greetingIcon = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 17) {
    return PhSun;
  } else {
    return PhMoon;
  }
});

const formattedDate = computed(() => {
  const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
  return new Date().toLocaleDateString('en-IN', options);
});

const { data: branchesData } = useBranchesQuery();

const branchOptions = computed(() => {
  const list = [{ value: 'all', label: 'All Branches' }];
  const data = branchesData.value?.data || branchesData.value;
  if (Array.isArray(data)) {
    data.forEach(b => {
      list.push({ value: b.id || b._id, label: b.name });
    });
  }
  return list;
});

// Read current user role to trigger dashboard view
const userRoleName = computed(() => store.getters['auth/userRole'] || 'agent');
const displayRoleName = computed(() => userRoleName.value.replace(/_/g, ' '));
const dashboardRole = computed(() => {
  // Normalize roles to match layout targets
  const role = userRoleName.value;
  if (role === 'super_admin') return 'org_admin'; // Super admins see org-wide stats
  return role;
});

const showBranchFilter = computed(() => {
  const role = userRoleName.value;
  return role === 'super_admin' || role === 'org_admin' || role === 'branch_manager';
});

// Watch parameters from Vuex dashboard store
const dateRangeFilters = computed(() => store.state.dashboard.dateRange);
const activeQueryFilters = computed(() => ({
  startDate: dateRangeFilters.value.startDate,
  endDate: dateRangeFilters.value.endDate,
  branchId: selectedBranch.value
}));

// API metrics queries bound to filters
const { data, isLoading, refetch } = useDashboardMetricsQuery(dashboardRole, activeQueryFilters);

const emptyMetrics = {
  agent: {
    activeLeads: 0,
    dealsValueMTD: 0,
    commissionsEarned: 0,
    pendingTasks: 0,
    activeLeadsList: [],
    tasksList: []
  },
  branch_manager: {
    branchGrossSales: 0,
    activeAgents: 0,
    pendingApprovals: 0,
    conversionRate: 0,
    approvalsList: [],
    leaderboardList: []
  },
  org_admin: {
    orgRevenue: 0,
    grossCommission: 0,
    orgLeads: 0,
    avgSalesCycle: 0,
    revenueTrend: [],
    funnelData: [],
    branchRankingsList: [],
    topProjectsList: []
  },
  finance: {
    unpaidCommissions: 0,
    disbursedCommissions: 0,
    complianceReviews: 0,
    taxReserves: 0,
    collectionsTrend: [],
    taxReservesTrend: [],
    pendingPayoutsList: [],
    complianceAlertsList: []
  }
};

const metrics = computed(() => {
  const apiData = data.value?.data;
  if (!apiData) {
    return emptyMetrics[dashboardRole.value] || {};
  }

  const role = dashboardRole.value;

  if (role === 'org_admin') {
    return {
      orgRevenue: apiData.sales?.grossDealValue || 0,
      grossCommission: apiData.commission?.expectedRevenue || 0,
      orgLeads: apiData.leads?.leadCount || 0,
      avgSalesCycle: apiData.sales?.avgSalesCycle || 0,
      revenueTrend: apiData.revenueTrend || [],
      funnelData: apiData.funnelData || [],
      branchRankingsList: apiData.branchRankingsList || [],
      topProjectsList: apiData.topProjectsList || []
    };
  }

  if (role === 'finance') {
    return {
      unpaidCommissions: apiData.totals?.outstandingRevenue || 0,
      disbursedCommissions: apiData.totals?.collectedRevenue || 0,
      complianceReviews: apiData.totals?.complianceReviews || 0,
      taxReserves: apiData.totals?.adjustmentDeductions || 0,
      collectionsTrend: apiData.collectionsTrend || [],
      taxReservesTrend: apiData.taxReservesTrend || [],
      pendingPayoutsList: apiData.pendingPayoutsList || [],
      complianceAlertsList: apiData.complianceAlertsList || []
    };
  }

  if (role === 'branch_manager') {
    return {
      branchGrossSales: apiData.totals?.grossDealValue || 0,
      activeAgents: apiData.totals?.activeAgents || 0,
      pendingApprovals: apiData.totals?.reservationsCount || 0,
      conversionRate: apiData.totals?.dealsClosedCount && apiData.totals?.reservationsCount 
        ? Math.round((apiData.totals.dealsClosedCount / apiData.totals.reservationsCount) * 100) 
        : 0,
      approvalsList: apiData.approvalsList || [],
      leaderboardList: apiData.leaderboardList || []
    };
  }

  if (role === 'agent') {
    const agentStats = apiData.byAgent?.find(a => String(a.agentId) === String(userProfile.value?.id || userProfile.value?._id)) || apiData.byAgent?.[0] || {};
    return {
      activeLeads: agentStats.leadsCreatedCount || 0,
      dealsValueMTD: agentStats.grossDealValue || 0,
      commissionsEarned: agentStats.commissionsEarned || 0,
      pendingTasks: agentStats.tasksPending || 0,
      activeLeadsList: apiData.activeLeadsList || [],
      tasksList: apiData.tasksList || []
    };
  }

  return apiData;
});

const handleBranchChange = () => {
  refetch();
};

const refreshData = () => {
  refetch();
};

const triggerQuickAction = (action) => {
  if (action === 'lead') {
    // Open create lead layout or drawer triggers
    store.dispatch('notifications/triggerToast', {
      message: 'Create Lead Drawer template launched.',
      type: 'info'
    });
  } else if (action === 'task') {
    store.dispatch('notifications/triggerToast', {
      message: 'Create Task Modal template launched.',
      type: 'info'
    });
  }
};

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '$0';
  return '$' + Number(val).toLocaleString();
};
</script>
