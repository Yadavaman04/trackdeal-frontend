<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-default pb-3 gap-2">
      <div>
        <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">
          Receivable Revenue Forecasting
        </h4>
        <p class="text-[9px] text-slate-450 mt-0.5">Weighted analysis of estimated billing clearings.</p>
      </div>

      <!-- Forecast Options -->
      <div class="flex items-center space-x-1 shrink-0">
        <button 
          v-for="mode in ['probability', 'builder', 'branch']"
          :key="mode"
          @click="forecastMode = mode"
          class="btn btn-sm text-[9px] h-6 px-2 font-bold uppercase"
          :class="forecastMode === mode ? 'btn-primary' : 'btn-ghost text-slate-450'"
        >
          {{ mode }}
        </button>
      </div>
    </div>

    <!-- Forecast metrics grid -->
    <div class="grid grid-cols-3 gap-4 text-center font-bold">
      <div class="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-default">
        <span class="text-slate-400 block text-[8px] uppercase">30 Day Forecast</span>
        <span class="font-heading text-slate-800 dark:text-slate-100 text-xs block mt-1">
          {{ formatCurrency(getForecastValue('d30')) }}
        </span>
      </div>
      <div class="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-default">
        <span class="text-slate-400 block text-[8px] uppercase">60 Day Forecast</span>
        <span class="font-heading text-slate-800 dark:text-slate-100 text-xs block mt-1">
          {{ formatCurrency(getForecastValue('d60')) }}
        </span>
      </div>
      <div class="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-default">
        <span class="text-slate-400 block text-[8px] uppercase">90 Day Forecast</span>
        <span class="font-heading text-slate-850 dark:text-slate-200 text-xs block mt-1">
          {{ formatCurrency(getForecastValue('d90')) }}
        </span>
      </div>
    </div>

    <!-- Chart Canvas -->
    <div class="pt-2">
      <!-- Probability weighted graph chart -->
      <svg viewBox="0 0 400 120" class="w-full h-28 overflow-visible" v-if="forecastMode === 'probability'">
        <!-- Curves -->
        <path 
          d="M 20,100 Q 140,80 200,40 T 380,20" 
          fill="none" 
          stroke="var(--color-primary, #6366f1)" 
          stroke-width="3" 
          stroke-linecap="round"
        />
        <path 
          d="M 20,100 Q 140,80 200,40 T 380,20 L 380,100 L 20,100 Z" 
          fill="url(#forecastGrad)" 
          opacity="0.1" 
        />

        <!-- Node markers -->
        <circle cx="140" cy="80" r="4" fill="#6366f1" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="260" cy="30" r="4" fill="#6366f1" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="380" cy="20" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />

        <text x="130" y="70" font-size="8" font-weight="bold" fill="#6366f1">30 Days (80%)</text>
        <text x="250" y="20" font-size="8" font-weight="bold" fill="#3b82f6">60 Days (60%)</text>
        <text x="350" y="10" font-size="8" font-weight="bold" fill="#10b981">90 Days (90%)</text>

        <!-- Base line -->
        <line x1="10" y1="100" x2="390" y2="100" stroke="#cbd5e1" stroke-dasharray="3 3" />
        
        <defs>
          <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <!-- Builder distribution list progress bars -->
      <div class="space-y-2.5 pt-1" v-else-if="forecastMode === 'builder'">
        <div v-for="b in builderForecasts" :key="b.name" class="space-y-1">
          <div class="flex justify-between font-bold text-[10px] text-slate-700 dark:text-slate-350 items-center">
            <span class="flex items-center gap-1">
              <PhBuilding :size="11" class="text-slate-400" />
              <span>{{ b.name }}</span>
            </span>
            <span>{{ formatCurrency(b.value) }}</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div class="bg-indigo-500 h-full rounded-full" :style="{ width: `${b.percent}%` }"></div>
          </div>
        </div>
        <div v-if="builderForecasts.length === 0" class="text-center py-6 text-slate-400 italic">
          No builder distribution data.
        </div>
      </div>

      <!-- Branch distribution list progress bars -->
      <div class="space-y-2.5 pt-1" v-else-if="forecastMode === 'branch'">
        <div v-for="br in branchForecasts" :key="br.name" class="space-y-1">
          <div class="flex justify-between font-bold text-[10px] text-slate-700 dark:text-slate-350 items-center">
            <span class="flex items-center gap-1">
              <PhMapPin :size="11" class="text-slate-400" />
              <span>{{ br.name }}</span>
            </span>
            <span>{{ formatCurrency(br.value) }}</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div class="bg-blue-500 h-full rounded-full" :style="{ width: `${br.percent}%` }"></div>
          </div>
        </div>
        <div v-if="branchForecasts.length === 0" class="text-center py-6 text-slate-400 italic">
          No branch distribution data.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PhBuilding, PhMapPin } from '@phosphor-icons/vue';
import { useCommissionsQuery } from '../queries';

const forecastMode = ref('probability');

const { data } = useCommissionsQuery();

const commissionsList = computed(() => {
  return data.value?.data || data.value || [];
});

const getForecastValue = (bucket) => {
  if (commissionsList.value.length === 0) return 0;

  const values = {
    d30: commissionsList.value.filter(c => (c.stage || c.status) === 'expected').reduce((sum, c) => sum + (c.totalCommissionExpected || c.grossCommission || 0), 0),
    d60: commissionsList.value.filter(c => (c.stage || c.status) === 'eligible').reduce((sum, c) => sum + (c.totalCommissionExpected || c.grossCommission || 0), 0),
    d90: commissionsList.value.filter(c => ['invoice_raised', 'invoice_sent'].includes(c.stage || c.status)).reduce((sum, c) => sum + (c.totalCommissionOutstanding || c.netReceivable || 0), 0)
  };
  return values[bucket] || 0;
};

const builderForecasts = computed(() => {
  const map = {};
  commissionsList.value.forEach(c => {
    const builder = c.builderName || c.builder?.name || 'Unknown Builder';
    const val = c.totalCommissionExpected || c.grossCommission || 0;
    if (val > 0) {
      map[builder] = (map[builder] || 0) + val;
    }
  });
  const total = Object.values(map).reduce((sum, val) => sum + val, 0) || 1;
  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    percent: Math.round((value / total) * 100)
  })).sort((a, b) => b.value - a.value);
});

const branchForecasts = computed(() => {
  const map = {};
  commissionsList.value.forEach(c => {
    const branch = c.branchName || c.branchId?.name || 'Main Branch';
    const val = c.totalCommissionExpected || c.grossCommission || 0;
    if (val > 0) {
      map[branch] = (map[branch] || 0) + val;
    }
  });
  const total = Object.values(map).reduce((sum, val) => sum + val, 0) || 1;
  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    percent: Math.round((value / total) * 100)
  })).sort((a, b) => b.value - a.value);
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
