<template>
  <div class="space-y-6 text-xs">
    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
          <PhCoins :size="20" class="text-primary" />
          <span>Commissions Directory</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage B2B invoice clearings, payouts release workflows, and financial milestones.
        </p>
      </div>

      <!-- Action buttons & Views toggle -->
      <div class="flex items-center gap-3 self-end sm:self-auto shrink-0 flex-wrap">
        <!-- View Toggle buttons -->
        <div class="border border-default rounded-lg p-0.5 bg-slate-55/50 dark:bg-slate-900 flex space-x-0.5">
          <button 
            @click="viewMode = 'table'"
            class="px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1"
            :class="viewMode === 'table' ? 'bg-surface text-slate-800 dark:text-slate-200 shadow-xs' : 'text-slate-400 hover:text-slate-650'"
            title="Table View"
          >
            <PhTable :size="12" />
            <span>Table</span>
          </button>
          <button 
            @click="viewMode = 'kanban'"
            class="px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1"
            :class="viewMode === 'kanban' ? 'bg-surface text-slate-800 dark:text-slate-200 shadow-xs' : 'text-slate-400 hover:text-slate-650'"
            title="Finance Board View"
          >
            <PhColumns :size="12" />
            <span>Finance Board</span>
          </button>
        </div>

        <router-link 
          to="/app/commissions/dashboard"
          class="btn-md btn-secondary gap-1.5"
        >
          <PhTrendUp :size="14" />
          <span>Executive Dashboard</span>
        </router-link>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="bg-surface border border-default rounded-xl p-3 shadow-xs flex flex-wrap items-center gap-3">
      <div class="flex-1 min-w-[200px]">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search by Commission #, Deal #, Builder name..."
          class="w-full bg-slate-55/30 border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary font-medium"
        />
      </div>

      <div class="w-40 shrink-0">
        <select v-model="filters.stage" class="w-full bg-slate-55/30 border border-default rounded-lg px-3 py-1.5 outline-none font-medium">
          <option value="">All Stages</option>
          <option value="expected">Expected</option>
          <option value="eligible">Eligible</option>
          <option value="invoice_raised">Invoice Raised</option>
          <option value="invoice_sent">Invoice Sent</option>
          <option value="partially_collected">Partially Collected</option>
          <option value="fully_collected">Fully Collected</option>
          <option value="payout_eligible">Payout Eligible</option>
          <option value="payout_approved">Payout Approved</option>
          <option value="payout_released">Payout Released</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <button 
        @click="resetFilters"
        class="btn-md btn-secondary"
      >
        Clear Filters
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="animate-pulse space-y-4">
      <div class="h-40 bg-slate-200 dark:bg-slate-850 rounded-xl w-full"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-xl flex items-center justify-center gap-1.5">
      <PhWarning :size="16" class="text-red-500" />
      <span>Failed to load commissions list. Please retry.</span>
    </div>

    <!-- Active View Area -->
    <div v-else class="space-y-4">
      <!-- 1. TABLE VIEW -->
      <div v-if="viewMode === 'table'" class="bg-surface border border-default rounded-xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50 dark:bg-slate-900/50">
                <th class="py-3 px-4">Commission #</th>
                <th class="py-3 px-4">Linked Transaction Deal</th>
                <th class="py-3 px-4">Builder Developer</th>
                <th class="py-3 px-4 text-right">Gross Commission</th>
                <th class="py-3 px-4 text-right">Net Receivable</th>
                <th class="py-3 px-4">Finance Stage</th>
                <th class="py-3 px-4 text-center">Payouts status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default text-slate-655 font-medium">
              <tr 
                v-for="comm in filteredCommissions" 
                :key="comm._id || comm.id"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer"
                @click="$router.push(`/app/commissions/${comm._id || comm.id}`)"
              >
                <!-- Commission Number -->
                <td class="py-3.5 px-4 font-bold text-primary font-heading">
                  {{ comm.commissionNumber || `#COM-${(comm._id || comm.id || '').substring(18).toUpperCase()}` }}
                </td>

                <!-- Deal Number -->
                <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                  {{ comm.deal?.dealNumber || comm.dealNumber || 'DEAL-FILE' }}
                </td>

                <!-- Builder Developer -->
                <td class="py-3.5 px-4">
                  {{ comm.builder?.name || comm.builderName || 'Skyway Builders' }}
                </td>

                <!-- Gross Commission -->
                <td class="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                  {{ formatCurrency(comm.grossCommission) }}
                </td>

                <!-- Net Receivable -->
                <td class="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-100 font-heading">
                  {{ formatCurrency(comm.netReceivable || comm.grossCommission * 1.08) }}
                </td>

                <!-- Finance Stage -->
                <td class="py-3.5 px-4">
                  <span 
                    class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                    :class="getStageBadgeClass(comm.stage)"
                  >
                    ● {{ formatStageName(comm.stage) }}
                  </span>
                </td>

                <!-- Payout status -->
                <td class="py-3.5 px-4 text-center">
                  <span 
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold"
                    :class="comm.payoutReleased ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
                  >
                    {{ comm.payoutReleased ? 'Released' : 'Pending' }}
                  </span>
                </td>
              </tr>

              <tr v-if="filteredCommissions.length === 0">
                <td colspan="7" class="text-center py-10 text-slate-400 italic">No commissions records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. FINANCE BOARD VIEW -->
      <div v-else-if="viewMode === 'kanban'">
        <CommissionBoard 
          :commissions="commissionsList"
          @stageChange="handleStageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { PhCoins, PhTable, PhColumns, PhTrendUp, PhWarning } from '@phosphor-icons/vue';
import CommissionBoard from '../components/CommissionBoard.vue';
import { useCommissionsQuery, useTransitionStageMutation } from '../queries';

const store = useStore();
const viewMode = ref('table');

const filters = ref({
  search: '',
  stage: ''
});

const { data, isLoading, error, refetch } = useCommissionsQuery(filters);

const commissionsList = computed(() => {
  const list = data.value?.data || data.value || [];
  
  return list.map(item => ({
    ...item,
    commissionNumber: item.commissionNumber || `#COM-${(item._id || item.id || '').substring(18).toUpperCase()}`,
    dealNumber: item.deal?.dealNumber || item.dealNumber || 'DEAL-FILE',
    builderName: item.builder?.name || item.builderName || 'Skyway Builders',
    grossCommission: item.grossCommission || item.totalCommissionExpected || 0,
    netReceivable: item.netReceivable || (item.grossCommission || item.totalCommissionExpected || 0) * 1.08,
    stage: item.stage || item.status || 'expected'
  }));
});

const filteredCommissions = computed(() => {
  return commissionsList.value.filter(c => {
    if (filters.value.stage && c.stage !== filters.value.stage) return false;
    if (filters.value.search.trim()) {
      const q = filters.value.search.toLowerCase();
      const num = (c.commissionNumber || '').toLowerCase();
      const dl = (c.dealNumber || '').toLowerCase();
      const b = (c.builderName || '').toLowerCase();
      if (!num.includes(q) && !dl.includes(q) && !b.includes(q)) return false;
    }
    return true;
  });
});

const resetFilters = () => {
  filters.value = { search: '', stage: '' };
};

const { mutateAsync: transitionStage } = useTransitionStageMutation();

const handleStageChange = async ({ commission, oldStage, newStage }) => {
  try {
    await transitionStage({
      id: commission._id || commission.id,
      stage: newStage,
      notes: `Dragged finance status from ${oldStage} to ${newStage}`
    });

    store.dispatch('notifications/triggerToast', {
      message: `Commission transitioned to ${formatStageName(newStage)} successfully.`,
      type: 'success'
    });

    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: err.response?.data?.message || 'Failed to update commission stage.',
      type: 'error'
    });
  }
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const formatStageName = (stage) => {
  if (!stage) return '';
  const mapping = {
    'expected': 'Expected',
    'eligible': 'Eligible',
    'invoice_raised': 'Invoice Raised',
    'invoice_sent': 'Invoice Sent',
    'partially_collected': 'Partially Collected',
    'fully_collected': 'Fully Collected',
    'payout_eligible': 'Payout Eligible',
    'payout_approved': 'Payout Approved',
    'payout_released': 'Payout Released',
    'closed': 'Closed'
  };
  return mapping[stage] || stage.replace(/_/g, ' ');
};

const getStageBadgeClass = (stage) => {
  switch (stage) {
    case 'expected': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    case 'eligible': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20';
    case 'invoice_raised':
    case 'invoice_sent': return 'bg-blue-50 text-blue-750 dark:bg-blue-950/20';
    case 'partially_collected':
    case 'fully_collected': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/20';
    case 'payout_eligible':
    case 'payout_approved': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20';
    case 'payout_released': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20';
    case 'closed': return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100';
    default: return 'bg-slate-100 text-slate-600';
  }
};
</script>
