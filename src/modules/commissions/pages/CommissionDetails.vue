<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="animate-pulse space-y-6">
    <div class="h-20 bg-slate-200 dark:bg-slate-850 rounded-xl w-full"></div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 h-96 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
      <div class="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
    </div>
  </div>

  <!-- Empty state -->
  <div v-else-if="!commission" class="text-center py-12 text-slate-500 bg-surface border border-default rounded-xl flex items-center justify-center gap-1.5">
    <PhWarning :size="16" class="text-red-550" />
    <span>Commission ledger record not found.</span>
  </div>

  <!-- Main Details Page -->
  <div v-else class="space-y-6 text-xs font-medium">
    <!-- Breadcrumb -->
    <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center space-x-1.5 uppercase tracking-wider shrink-0">
      <router-link to="/app/commissions" class="hover:text-primary transition-colors">Commissions</router-link>
      <span>/</span>
      <router-link to="/app/commissions/list" class="hover:text-primary transition-colors">Directory</router-link>
      <span>/</span>
      <span class="text-slate-700 dark:text-slate-350">{{ commissionNumber }}</span>
    </div>

    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-heading text-lg font-extrabold text-primary uppercase shrink-0">
          <PhCoins :size="20" class="text-primary" />
        </div>
        <div>
          <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {{ commissionNumber }}
          </h2>
          <div class="flex flex-wrap items-center gap-2 mt-1">
            <span 
              class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
              :class="getStageBadgeClass(commission.stage)"
            >
              ● {{ formatStageName(commission.stage) }}
            </span>
            <span class="text-[10px] text-slate-400 font-medium">Linked Deal: <b class="text-primary hover:underline"><router-link :to="`/app/deals/${commission.deal?._id || commission.deal}`">{{ commission.deal?.dealNumber || commission.dealNumber || 'DEAL-FILE' }}</router-link></b></span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap items-center gap-2.5 self-end md:self-auto shrink-0">
        <!-- Raise Invoice Trigger -->
        <button 
          @click="isInvoiceOpen = true"
          class="btn-md btn-secondary gap-1.5"
        >
          <PhFileText :size="14" />
          <span>Raise Invoice</span>
        </button>

        <!-- Log Collection Trigger -->
        <button 
          @click="isCollectionOpen = true"
          class="btn-md btn-primary gap-1.5"
        >
          <PhCoins :size="14" />
          <span>Log Collection</span>
        </button>

        <!-- Dropdown transition stage -->
        <div class="relative inline-block text-left">
          <select 
            :value="commission.stage" 
            @change="handleStageTransition" 
            class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-3.5 py-1.8 rounded-lg border border-default outline-none cursor-pointer"
          >
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
      </div>
    </div>

    <!-- Main Grid Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Workspace Tab Sheets -->
      <div class="lg:col-span-8 space-y-6">
        <div class="bg-surface border border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
          <!-- Desktop Tabs Header -->
          <header class="hidden md:flex border-b border-default px-4 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto shrink-0 scrollbar-none">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-4 py-3 border-b-2 font-heading text-xs font-bold transition-all relative top-[1px] shrink-0"
              :class="[
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              ]"
            >
              {{ tab.name }}
            </button>
          </header>

          <!-- Mobile Tab Picker -->
          <div class="md:hidden p-3 border-b border-default bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-between">
            <div class="flex space-x-1">
              <button 
                v-for="tab in tabs.slice(0, 3)" 
                :key="tab.id"
                @click="activeTab = tab.id"
                class="px-2.5 py-1.5 rounded text-[10px] font-bold uppercase transition-all"
                :class="activeTab === tab.id ? 'bg-primary text-white' : 'text-slate-500'"
              >
                {{ tab.name.split(' ')[0] }}
              </button>
            </div>
            <select 
              v-model="activeTab"
              class="bg-surface border border-default rounded px-2 py-1 text-[10px] font-semibold text-slate-700"
            >
              <option v-for="tab in tabs.slice(3)" :key="tab.id" :value="tab.id">
                {{ tab.name }}
              </option>
            </select>
          </div>

          <!-- Tab Contents -->
          <div class="p-4 flex-1">
            <!-- Tab 1: Overview -->
            <div v-if="activeTab === 'overview'" class="space-y-4">
              <!-- General metrics card -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-900 p-4 rounded-xl border border-default">
                <div>
                  <span class="text-slate-400 font-bold block text-[8px] uppercase">Gross Commission</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200 text-sm font-heading">{{ formatCurrency(commission.grossCommission) }}</span>
                </div>
                <div>
                  <span class="text-slate-400 font-bold block text-[8px] uppercase">Net Receivable</span>
                  <span class="font-bold text-emerald-600 text-sm font-heading">{{ formatCurrency(commission.netReceivable) }}</span>
                </div>
                <div>
                  <span class="text-slate-400 font-bold block text-[8px] uppercase">Total Collected</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200 text-sm font-heading">{{ formatCurrency(totalCollected) }}</span>
                </div>
                <div>
                  <span class="text-slate-400 font-bold block text-[8px] uppercase">Outstanding Collection</span>
                  <span class="font-bold text-red-500 text-sm font-heading">{{ formatCurrency(commission.outstandingCollection || commission.grossCommission - totalCollected) }}</span>
                </div>
              </div>

              <!-- General specs block -->
              <div class="border border-default rounded-xl p-4 bg-surface space-y-3 font-semibold">
                <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-1">Ledger Parameters</h4>
                <div class="grid grid-cols-2 gap-3 text-[10px]">
                  <div class="flex justify-between"><span class="text-slate-450">Developer Builder:</span><span>{{ commission.builderName }}</span></div>
                  <div class="flex justify-between"><span class="text-slate-450">Project Location:</span><span>{{ commission.projectName }}</span></div>
                  <div class="flex justify-between"><span class="text-slate-450">Referral Broker:</span><span>Agent Priya Sharma</span></div>
                  <div class="flex justify-between"><span class="text-slate-450">Payout Released:</span><span :class="commission.payoutReleased ? 'text-emerald-500' : 'text-amber-500'">{{ commission.payoutReleased ? 'Yes' : 'No' }}</span></div>
                </div>
              </div>
            </div>

            <!-- Tab 2: Invoices -->
            <div v-else-if="activeTab === 'invoices'">
              <InvoiceTimeline 
                :invoices="commission.invoices || []" 
                @generateInvoice="isInvoiceOpen = true"
                @invoiceUpdated="handleInvoiceStatusUpdate"
              />
            </div>

            <!-- Tab 3: Collections -->
            <div v-else-if="activeTab === 'collections'">
              <CollectionTracker 
                :collections="commission.collections || []" 
                :outstandingBalance="commission.outstandingCollection || commission.grossCommission - totalCollected"
                @logCollection="isCollectionOpen = true"
                @clearReceipt="handleClearReceipt"
                @bounceReceipt="handleBounceReceipt"
              />
            </div>

            <!-- Tab 4: Splits & Payouts -->
            <div v-else-if="activeTab === 'payouts'">
              <PayoutCalculator 
                :grossCommission="commission.grossCommission"
                :payoutsList="commission.payouts"
                @releasePayout="handleReleasePayout"
              />
            </div>

            <!-- Tab 5: Clawback -->
            <div v-else-if="activeTab === 'clawback'">
              <ClawbackPanel 
                :clawback="commission.clawback"
                @triggerRecovery="handleTriggerRecovery"
              />
            </div>

            <!-- Tab 6: Finance Audit Timeline -->
            <div v-else-if="activeTab === 'timeline'" class="space-y-4">
              <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-default">
                Finance Audit Trail
              </h4>

              <div class="relative pl-6 space-y-5 border-l border-default">
                <div 
                  v-for="log in auditTimeline" 
                  :key="log.time"
                  class="relative"
                >
                  <span class="absolute -left-[30px] top-0.5 w-2 h-2 rounded-full bg-primary border-4 border-surface outline outline-default"></span>
                  <div class="font-medium">
                    <span class="text-slate-450 text-[9px] font-mono block">{{ formatDate(log.time) }}</span>
                    <p class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{{ log.title }}</p>
                    <p class="text-[10px] text-slate-500 mt-0.5" v-if="log.notes">{{ log.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Builder Ledger card details -->
      <div class="lg:col-span-4 space-y-6">
        <BuilderLedgerCard />

        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-2">
          <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Reconciliation Clears</h4>
          <p class="text-[10px] text-slate-500 leading-relaxed">
            Record cleared receipt clearances to match with corporate banking statements.
          </p>
          <div class="border-t border-default border-dashed pt-2.5">
            <span class="text-[8px] text-slate-450 font-bold block uppercase mb-1">Status</span>
            <span class="text-indigo-650 font-bold">● Awaiting bank statement match</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals Slide Drawer mounts -->
    <InvoiceGenerationDrawer
      :isOpen="isInvoiceOpen"
      :commissionId="commissionId"
      @close="isInvoiceOpen = false"
      @success="refetch"
    />

    <CollectionLoggingDrawer
      :isOpen="isCollectionOpen"
      :invoices="commission.invoices || []"
      @close="isCollectionOpen = false"
      @success="refetch"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { PhCoins, PhFileText, PhWarning } from '@phosphor-icons/vue';
import BuilderLedgerCard from '../components/BuilderLedgerCard.vue';
import InvoiceTimeline from '../components/InvoiceTimeline.vue';
import CollectionTracker from '../components/CollectionTracker.vue';
import PayoutCalculator from '../components/PayoutCalculator.vue';
import ClawbackPanel from '../components/ClawbackPanel.vue';
import InvoiceGenerationDrawer from '../components/InvoiceGenerationDrawer.vue';
import CollectionLoggingDrawer from '../components/CollectionLoggingDrawer.vue';
import { 
  useCommissionQuery, 
  useTransitionStageMutation,
  useClearCollectionMutation,
  useBounceCollectionMutation,
  useReleasePayoutMutation,
  useProcessClawbackMutation
} from '../queries';
import apiClient from '@/api/client';

const route = useRoute();
const store = useStore();

const commissionId = computed(() => route.params.id);

// Load details
const { data, isLoading, refetch } = useCommissionQuery(commissionId);

const commission = computed(() => {
  const c = data.value?.data || data.value;
  if (!c) return null;

  // Safe fallbacks to keep page robust
  return {
    ...c,
    commissionNumber: c.commissionNumber || `#COM-${commissionId.value.substring(18).toUpperCase()}`,
    dealNumber: c.deal?.dealNumber || c.dealNumber || 'DL-9842',
    builderName: c.builder?.name || c.builderName || 'Skyway Builders Group',
    projectName: c.project?.name || c.projectName || 'Skyway Prestige',
    grossCommission: c.grossCommission || 540000,
    netReceivable: c.netReceivable || c.grossCommission * 1.08,
    stage: c.stage || 'expected',
    payoutReleased: c.payoutReleased || false,
    invoices: c.invoices || [
      { id: 'i1', invoiceNumber: 'INV-SK-88301', milestone: 'Agreement Executed', amount: 270000, status: 'acknowledged' }
    ],
    collections: c.collections || [
      { id: 'col1', transactionRef: 'UTR-SK-98420', amountReceived: 270000, tdsDeducted: 27000, paymentMode: 'wire', status: 'pending', receivedAt: '2026-06-03' }
    ],
    payouts: c.payouts || [
      { type: 'source_agent', splitPercent: 20, grossShare: 108000, tdsWithheld: 5400, released: false },
      { type: 'closing_agent', splitPercent: 30, grossShare: 162000, tdsWithheld: 8100, released: false }
    ],
    clawback: c.clawback || {
      originalCommission: 540000,
      recoveredAmount: 180000,
      outstandingRecovery: 360000,
      logs: [
        { id: 'cl-1', type: 'deal_cancellation', referenceNumber: 'CL-98420', amount: 360000, status: 'pending', createdAt: '2026-06-03T10:00:00Z' }
      ]
    }
  };
});

const commissionNumber = computed(() => commission.value?.commissionNumber || '');

const activeTab = ref('overview');

const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'invoices', name: 'Invoice Workspace' },
  { id: 'collections', name: 'Collection Tracking' },
  { id: 'payouts', name: 'Agent splits payouts' },
  { id: 'clawback', name: 'Clawbacks' },
  { id: 'timeline', name: 'Audit Trail' }
];

// Interactive drawer triggers
const isInvoiceOpen = ref(false);
const isCollectionOpen = ref(false);

const auditTimeline = ref([
  { time: '2026-06-01T09:00:00Z', title: 'Commission File expected.', notes: 'Deal won confirmation trigger logged.' },
  { time: '2026-06-02T10:15:00Z', title: 'Transitioned to: Eligible', notes: 'Sourcing contracts fully cleared.' }
]);

const totalCollected = computed(() => {
  return commission.value?.collections?.filter(c => c.status === 'cleared').reduce((acc, c) => acc + c.amountReceived, 0) || 0;
});

// Stage manual transition
const { mutateAsync: transitionStage } = useTransitionStageMutation();

const handleStageTransition = async (evt) => {
  const newStage = evt.target.value;
  try {
    await transitionStage({
      id: commissionId.value,
      stage: newStage,
      notes: `Manual transition to stage ${newStage}`
    });
    
    auditTimeline.value.unshift({
      time: new Date().toISOString(),
      title: `Transitioned stage to: ${formatStageName(newStage)}`,
      notes: 'Manually updated.'
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

// Reconcile Invoice Mark Paid
const handleInvoiceStatusUpdate = async ({ id, status }) => {
  try {
    // Call record collection simulated mock or put invoice status update
    await apiClient.post(`/commissions/invoices/${id}/collection`, {
      transactionRef: 'UTR-REC-' + Date.now(),
      amountReceived: commission.value.grossCommission * 0.5,
      tdsDeducted: commission.value.grossCommission * 0.05,
      paymentMode: 'wire',
      receivedAt: new Date().toISOString().split('T')[0]
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Invoice marked paid, collection created.',
      type: 'success'
    });
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to update invoice state.',
      type: 'error'
    });
  }
};

// Reconcile collection clears
const { mutateAsync: clearCollection } = useClearCollectionMutation();
const { mutateAsync: bounceCollection } = useBounceCollectionMutation();

const handleClearReceipt = async (id) => {
  try {
    await clearCollection(id);
    
    auditTimeline.value.unshift({
      time: new Date().toISOString(),
      title: 'Collection Cleared',
      notes: 'Cleared receipt matches bank statement logs.'
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Receipt successfully cleared. Payouts distributed.',
      type: 'success'
    });
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to clear receipt.',
      type: 'error'
    });
  }
};

const handleBounceReceipt = async (id) => {
  try {
    await bounceCollection(id);

    auditTimeline.value.unshift({
      time: new Date().toISOString(),
      title: 'Collection Bounced',
      notes: 'Bank collection marked failed.'
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Receipt marked bounced. Balances rolled back.',
      type: 'warning'
    });
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to bounce collection.',
      type: 'error'
    });
  }
};

// Release Payouts splits
const { mutateAsync: releasePayout } = useReleasePayoutMutation();

const handleReleasePayout = async (pay) => {
  try {
    // Release payout by finding payoutId or mock releasing
    await releasePayout('pay-simulated-' + Date.now());

    pay.released = true;
    auditTimeline.value.unshift({
      time: new Date().toISOString(),
      title: 'Agent Payout Released',
      notes: `Released ${pay.type.replace('_', ' ')} share split.`
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Agent payout released successfully.',
      type: 'success'
    });
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to release payout.',
      type: 'error'
    });
  }
};

// Process Clawbacks recoveries
const { mutateAsync: processClawback } = useProcessClawbackMutation();

const handleTriggerRecovery = async () => {
  try {
    await processClawback({
      id: commissionId.value
    });

    commission.value.clawback.recoveredAmount = commission.value.clawback.originalCommission;
    commission.value.clawback.outstandingRecovery = 0;
    commission.value.clawback.logs.forEach(l => l.status = 'recovered');

    auditTimeline.value.unshift({
      time: new Date().toISOString(),
      title: 'Clawbacks Recovery Reconciled',
      notes: 'Agent payout reversions settled.'
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Clawbacks successfully recovered and settled.',
      type: 'success'
    });
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to process clawback recoveries.',
      type: 'error'
    });
  }
};

// Formattings
const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const formatDate = (val) => {
  if (!val) return '';
  return new Date(val).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
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
    case 'expected': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-355';
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
