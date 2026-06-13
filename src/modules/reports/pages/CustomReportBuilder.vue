<template>
  <div class="space-y-6 text-xs font-semibold">
    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 font-medium">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <PhWrench :size="20" class="text-primary" />
          <span>Custom Report Builder</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Drag fields, configure group filters, and execute custom aggregations.
        </p>
      </div>

      <router-link 
        to="/app/reports/dashboard"
        class="btn btn-sm btn-secondary text-xs h-8 px-3 shrink-0"
      >
        <PhBookOpen :size="13" />
        <span>Back to Library</span>
      </router-link>
    </div>

    <!-- Drag & Drop Layout Builder -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Fields Box & Aggregator selectors -->
      <div class="lg:col-span-4 space-y-6">
        <!-- draggables catalog -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
          <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
            Available Database Fields
          </h4>
          <p class="text-[9px] text-slate-450 font-medium leading-relaxed">
            Click fields to add them to your custom query selection box.
          </p>

          <div class="flex flex-wrap gap-2 pt-1 font-medium">
            <button 
              v-for="f in availableFields" 
              :key="f.key"
              @click="selectField(f)"
              :disabled="isSelected(f)"
              class="btn btn-sm btn-secondary text-[10px] h-7 px-2.5 gap-1"
            >
              <PhPlus :size="10" />
              <span>{{ f.label }}</span>
            </button>
          </div>
        </div>

        <!-- Aggregator parameters -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
          <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
            Aggregator Configuration
          </h4>

          <div class="space-y-3 font-semibold">
            <div>
              <label class="block text-[9px] font-bold text-slate-450 uppercase mb-1">Aggregation Function *</label>
              <select v-model="aggregator.fn" class="w-full bg-slate-55/30 border border-default rounded px-2.5 py-1.5 outline-none font-semibold text-slate-700">
                <option value="SUM">SUM (Totals sum)</option>
                <option value="AVG">AVG (Averages)</option>
                <option value="COUNT">COUNT (Items count)</option>
              </select>
            </div>

            <div>
              <label class="block text-[9px] font-bold text-slate-450 uppercase mb-1">Target Aggregate Field *</label>
              <select v-model="aggregator.target" class="w-full bg-slate-55/30 border border-default rounded px-2.5 py-1.5 outline-none font-semibold text-slate-700">
                <option value="dealValue">Deal Value (askingPrice)</option>
                <option value="commissionAmount">Commission Value</option>
                <option value="netReceivable">Net Collection</option>
              </select>
            </div>

            <div>
              <label class="block text-[9px] font-bold text-slate-450 uppercase mb-1">Group By Field *</label>
              <select v-model="aggregator.groupBy" class="w-full bg-slate-55/30 border border-default rounded px-2.5 py-1.5 outline-none font-semibold text-slate-700">
                <option value="status">Transaction Stage / Status</option>
                <option value="builder">Developer Builder</option>
                <option value="agent">Allocated Agent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Target Selection and Tabular Preview -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Target query container -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-default pb-2">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">
              Query Workspace Canvas
            </h4>
            <button 
              @click="clearWorkspace"
              class="btn btn-sm btn-ghost text-red-500 hover:text-red-650 h-7 px-2"
            >
              Clear Canvas
            </button>
          </div>

          <!-- Active query select box fields -->
          <div 
            class="min-h-16 border-2 border-dashed border-default rounded-xl p-3 flex flex-wrap gap-2 items-center bg-slate-50/20"
          >
            <div 
              v-for="f in selectedFields" 
              :key="f.key"
              class="bg-indigo-50 border border-indigo-250 text-indigo-750 font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1.5 text-[10px]"
            >
              <span>{{ f.label }}</span>
              <button @click="deselectField(f)" class="hover:text-red-500 font-bold flex items-center"><PhX :size="10" /></button>
            </div>
            <span v-if="selectedFields.length === 0" class="text-slate-400 italic text-[10px]">Click fields on the left to customize columns...</span>
          </div>

          <div class="flex justify-between items-center gap-3 pt-1">
            <input 
              v-model="savedName" 
              type="text" 
              placeholder="Name this report to save..."
              class="bg-slate-55/40 border border-default rounded px-3 py-1.5 outline-none w-56 font-semibold"
            />
            <div class="flex gap-2">
              <button 
                @click="saveReport"
                :disabled="!savedName.trim() || selectedFields.length === 0"
                class="btn btn-sm btn-secondary text-xs h-8 px-3.5 gap-1.5"
              >
                <PhFloppyDisk :size="13" />
                <span>Save Layout</span>
              </button>
              <button 
                @click="runQuery"
                :disabled="selectedFields.length === 0"
                class="btn btn-sm btn-primary text-xs h-8 px-4 disabled:bg-slate-300 gap-1.5"
              >
                <PhLightning :size="13" />
                <span>Execute Query</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Simulated preview table -->
        <div class="bg-surface border border-default rounded-xl overflow-hidden shadow-sm" v-if="queryRun">
          <div class="px-4 py-3 border-b border-default bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Tabular Query Results</h4>
            <span class="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Success (3 rows)</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead>
                <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                  <th class="py-2.5 px-4 capitalize">{{ aggregator.groupBy }}</th>
                  <th class="py-2.5 px-4 text-right">Aggregate ({{ aggregator.fn }} of {{ aggregator.target }})</th>
                  <th v-for="f in selectedFields" :key="f.key" class="py-2.5 px-4 capitalize">{{ f.label }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default text-slate-655 font-medium">
                <tr v-for="row in queryResults" :key="row.group">
                  <td class="py-3 px-4 font-bold text-slate-850 dark:text-slate-200 capitalize">{{ row.group.replace('_', ' ') }}</td>
                  <td class="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100 font-heading">
                    {{ formatCurrency(row.aggVal) }}
                  </td>
                  <td v-for="f in selectedFields" :key="f.key" class="py-3 px-4">
                    {{ row[f.key] || '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { PhWrench, PhBookOpen, PhPlus, PhFloppyDisk, PhLightning, PhX } from '@phosphor-icons/vue';

const store = useStore();

const availableFields = [
  { key: 'dealNumber', label: 'Deal File #' },
  { key: 'customerName', label: 'Buyer Name' },
  { key: 'propertyName', label: 'Property Unit' },
  { key: 'agentName', label: 'Allocated Agent' },
  { key: 'closeDate', label: 'Est. Close Target' },
  { key: 'createdDate', label: 'Sourced Date' }
];

const selectedFields = ref([]);
const savedName = ref('');
const queryRun = ref(false);

const aggregator = ref({
  fn: 'SUM',
  target: 'dealValue',
  groupBy: 'status'
});

const selectField = (f) => {
  if (!isSelected(f)) {
    selectedFields.value.push(f);
  }
};

const deselectField = (f) => {
  selectedFields.value = selectedFields.value.filter(item => item.key !== f.key);
};

const isSelected = (f) => {
  return selectedFields.value.some(item => item.key === f.key);
};

const clearWorkspace = () => {
  selectedFields.value = [];
  queryRun.value = false;
};

const runQuery = () => {
  queryRun.value = true;
  store.dispatch('notifications/triggerToast', {
    message: 'Custom query compiled and executed on MongoDB database.',
    type: 'success'
  });
};

const saveReport = () => {
  if (!savedName.value.trim()) return;
  store.dispatch('notifications/triggerToast', {
    message: `Report configuration "${savedName.value}" saved to My Reports.`,
    type: 'success'
  });
  savedName.value = '';
};

// Mock Query Results matching selected fields
const queryResults = computed(() => {
  const gb = aggregator.groupBy;
  
  if (gb === 'status') {
    return [
      { group: 'booking_confirmed', aggVal: 18500000, dealNumber: 'DL-9842', customerName: 'Amit Sharma', propertyName: 'Unit 802', agentName: 'Agent Priya', closeDate: '2026-06-15', createdDate: '2026-05-10' },
      { group: 'agreement_executed', aggVal: 24500000, dealNumber: 'DL-10928', customerName: 'Rohan Mehta', propertyName: 'Unit 102', agentName: 'Agent Ravi', closeDate: '2026-07-20', createdDate: '2026-05-15' },
      { group: 'commission_eligible', aggVal: 12000000, dealNumber: 'DL-88390', customerName: 'Sunita Nair', propertyName: 'Unit 504', agentName: 'Agent Anjali', closeDate: '2026-06-30', createdDate: '2026-05-20' }
    ];
  } else if (gb === 'builder') {
    return [
      { group: 'Skyway Builders Group', aggVal: 34000000, dealNumber: 'DL-9842', customerName: 'Amit Sharma', propertyName: 'Unit 802', agentName: 'Agent Priya', closeDate: '2026-06-15', createdDate: '2026-05-10' },
      { group: 'Prestige Developers', aggVal: 12000000, dealNumber: 'DL-88390', customerName: 'Sunita Nair', propertyName: 'Unit 504', agentName: 'Agent Anjali', closeDate: '2026-06-30', createdDate: '2026-05-20' },
      { group: 'Embassy Residency Corp', aggVal: 9000000, dealNumber: 'DL-1284', customerName: 'Kunal Kapoor', propertyName: 'Unit 1201', agentName: 'Agent Priya', closeDate: '2026-08-10', createdDate: '2026-06-01' }
    ];
  } else {
    // agent
    return [
      { group: 'Agent Priya Sharma', aggVal: 22000000, dealNumber: 'DL-9842', customerName: 'Amit Sharma', propertyName: 'Unit 802', agentName: 'Agent Priya', closeDate: '2026-06-15', createdDate: '2026-05-10' },
      { group: 'Agent Ravi Kumar', aggVal: 18000000, dealNumber: 'DL-10928', customerName: 'Rohan Mehta', propertyName: 'Unit 102', agentName: 'Agent Ravi', closeDate: '2026-07-20', createdDate: '2026-05-15' },
      { group: 'Agent Anjali Mehta', aggVal: 15000000, dealNumber: 'DL-88390', customerName: 'Sunita Nair', propertyName: 'Unit 504', agentName: 'Agent Anjali', closeDate: '2026-06-30', createdDate: '2026-05-20' }
    ];
  }
});

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>
