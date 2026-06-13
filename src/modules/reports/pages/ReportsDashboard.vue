<template>
  <div class="space-y-6 text-xs">
    <!-- Main catalog dashboard grids -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Reports Catalog directories -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Search and catalog headers -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-default pb-3 gap-2">
            <h3 class="font-heading font-bold text-slate-800 dark:text-slate-200">
              Enterprise Report Library
            </h3>
            <!-- Switch directories tabs -->
            <div class="flex items-center space-x-1 shrink-0">
              <button 
                v-for="cat in categories" 
                :key="cat"
                @click="activeCategory = cat"
                class="btn btn-sm text-[9px] h-6 px-2 font-bold uppercase"
                :class="activeCategory === cat ? 'btn-primary' : 'btn-ghost text-slate-450'"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- Catalog List Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReportCard 
              v-for="rep in filteredReports" 
              :key="rep.name" 
              :report="rep" 
            />
          </div>
        </div>

        <!-- Quick navigation shortcuts -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <router-link 
            to="/app/reports/builder"
            class="bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200 p-4 rounded-xl shadow-xs transition-colors flex flex-col justify-between h-28 text-xs font-semibold text-indigo-750 group"
          >
            <span class="flex items-center gap-1.5 font-bold">
              <PhWrench :size="14" class="text-indigo-600" />
              <span>Custom Report Builder</span>
            </span>
            <span class="text-[9px] text-slate-450 mt-1 block">Drag, drop, aggregate, and save custom configurations.</span>
          </router-link>

          <router-link 
            to="/app/reports/export"
            class="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-xs transition-colors flex flex-col justify-between h-28 text-xs font-semibold text-emerald-750 group"
          >
            <span class="flex items-center gap-1.5 font-bold">
              <PhDownload :size="14" class="text-emerald-600" />
              <span>Export & Extraction Center</span>
            </span>
            <span class="text-[9px] text-slate-450 mt-1 block">Extract tabular reports to CSV, PDF, or Excel sheets.</span>
          </router-link>

          <div 
            @click="showKpiDictionary = true"
            class="bg-slate-50/50 hover:bg-slate-50 border border-default p-4 rounded-xl shadow-xs transition-colors flex flex-col justify-between h-28 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <span class="flex items-center gap-1.5 font-bold">
              <PhBookOpen :size="14" class="text-slate-500" />
              <span>Financial KPI Dictionary</span>
            </span>
            <span class="text-[9px] text-slate-450 mt-1 block">View mathematical formulas and SLA compliance rules.</span>
          </div>
        </div>
      </div>

      <!-- Right: Data Governance, Freshness & Shared queues -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Data Freshness Widget -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3.5">
          <div class="border-b border-default pb-1">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Data Pipeline Freshness</h4>
            <p class="text-[9px] text-slate-450 mt-0.5">Details on database replication synchronizations.</p>
          </div>
          <div class="space-y-2 font-medium">
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-slate-450">Last Refreshed:</span>
              <span class="font-bold text-slate-850 dark:text-slate-200">Just Now (Realtime)</span>
            </div>
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-slate-450">Data Source:</span>
              <span class="font-semibold text-slate-700">MongoDB Replica-Set</span>
            </div>
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-slate-450">Refresh Status:</span>
              <span class="text-emerald-500 font-bold">● Active Syncing</span>
            </div>
          </div>
        </div>

        <!-- Scheduled & Shared Reports -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3.5">
          <div class="border-b border-default pb-1">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Scheduled extractions</h4>
            <p class="text-[9px] text-slate-450 mt-0.5">Scheduled automated email dispatch logs.</p>
          </div>
          <div class="space-y-2.5 font-medium">
            <div class="flex justify-between items-center text-[10px] py-1 border-b border-default border-dashed">
              <div>
                <span class="font-bold text-slate-700 dark:text-slate-350 block">Monthly Payout Ledger</span>
                <span class="text-[9px] text-slate-450 mt-0.5">Recipients: Finance Team</span>
              </div>
              <span class="text-indigo-600 font-bold bg-indigo-50 px-1 rounded dark:bg-indigo-950/20">Cron Monthly</span>
            </div>
            <div class="flex justify-between items-center text-[10px] py-1 border-b border-default border-dashed">
              <div>
                <span class="font-bold text-slate-700 dark:text-slate-350 block">SLA Compliance Audit</span>
                <span class="text-[9px] text-slate-450 mt-0.5">Recipients: Branch Managers</span>
              </div>
              <span class="text-indigo-600 font-bold bg-indigo-50 px-1 rounded dark:bg-indigo-950/20">Cron Weekly</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Dictionary modal -->
    <div 
      v-if="showKpiDictionary"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-surface border border-default w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fade-in text-xs font-semibold">
        <div class="px-4 py-3 border-b border-default flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
          <h3 class="font-heading font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <PhBookOpen :size="16" class="text-slate-500" />
            <span>CRM Financial KPI Dictionary</span>
          </h3>
          <button 
            @click="showKpiDictionary = false" 
            class="btn btn-sm btn-ghost p-1 h-7 w-7 text-slate-400 hover:text-slate-600"
          >
            <PhX :size="14" />
          </button>
        </div>

        <div class="p-4 space-y-3.5 overflow-y-auto flex-1 font-medium">
          <div v-for="kpi in kpiDictionary" :key="kpi.name" class="border-b border-default pb-2.5 last:border-b-0 space-y-1">
            <h5 class="font-bold text-slate-800 dark:text-slate-200">{{ kpi.name }}</h5>
            <div class="bg-slate-50 dark:bg-slate-900 p-2 rounded border font-mono text-[9px] text-primary">
              Formula: {{ kpi.formula }}
            </div>
            <p class="text-[10px] text-slate-500 mt-1 leading-normal">{{ kpi.description }}</p>
          </div>
        </div>

        <div class="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-default flex justify-end shrink-0">
          <button 
            @click="showKpiDictionary = false" 
            class="btn btn-md btn-secondary"
          >
            Close Dictionary
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PhWrench, PhDownload, PhBookOpen, PhX } from '@phosphor-icons/vue';
import ReportCard from '../components/ReportCard.vue';

const activeCategory = ref('All Reports');
const showKpiDictionary = ref(false);

const categories = ['All Reports', 'leads', 'sales', 'properties', 'commissions', 'performance'];

const reports = [
  { name: 'Lead Funnel & Sources', description: 'Monitor leads pipeline conversions, channel sources performance, and lost reasons.', category: 'leads', to: '/app/reports/viewer/leads', favorite: true },
  { name: 'Sales Deals Pipeline', description: 'Analyze deal transaction cycles, close ratios, and win-rate trends.', category: 'sales', to: '/app/reports/viewer/sales', favorite: true },
  { name: 'Inventory & Projects Aging', description: 'Displays tower block availability matrix, reservations SLA delay metrics, and builder performance.', category: 'properties', to: '/app/reports/viewer/properties', favorite: false },
  { name: 'Expected vs Collected Revenues', description: 'Invoicing schedules, banking collections ledger, and clawback management exposures.', category: 'commissions', to: '/app/reports/viewer/commissions', favorite: true },
  { name: 'Agent SLA & Compliance', description: 'Analyze agents follow-up productivity, SLA compliance speeds, and outreach channels.', category: 'performance', to: '/app/reports/viewer/performance', favorite: false },
  { name: 'Branch Performance Metrics', description: 'Compares gross sales volume, active agent counts, and conversions across branches.', category: 'performance', to: '/app/reports/viewer/branch', favorite: false },
  { name: 'Revenue Closing Forecasts', description: '30/60/90 days expected weighted payout forecasts.', category: 'commissions', to: '/app/reports/viewer/forecast', favorite: true }
];

const filteredReports = computed(() => {
  if (activeCategory.value === 'All Reports') return reports;
  return reports.filter(r => r.category === activeCategory.value);
});

const kpiDictionary = [
  { name: 'Lead Conversion Rate', formula: '(Leads Marked Won / Total Sourced Leads) * 100', description: 'Percentage of leads successfully converted to confirmed bookings.' },
  { name: 'Average Sales Cycle Days', formula: 'Sum(Deal Close Date - Lead Sourced Date) / Count(Deals)', description: 'Average calendar days required to close a transaction from lead creation.' },
  { name: 'Receivable Collection Ratio', formula: '(Gross Amount Collected / Net Invoice Receivable) * 100', description: 'Percentage of cleared bank collections relative to B2B invoices raised.' },
  { name: 'SLA Follow-up Compliance', formula: '(Follow-ups Met within target SLA / Total Follow-ups) * 100', description: 'Percentage of customer follow-ups and WhatsApp replies completed within 2 hours.' }
];
</script>
