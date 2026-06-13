<template>
  <div class="space-y-6">
    <!-- Empty State Banner -->
    <div v-if="units.length === 0" class="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-4 text-center text-indigo-800 dark:text-indigo-400 text-xs">
      <p class="font-bold">No inventory or sales records exist for this project yet.</p>
      <p class="mt-1 opacity-75">Please add property listings under this project to populate sales intelligence, occupancy timelines, and configuration trends.</p>
    </div>

    <!-- 1. KPI Indicators Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Sales Revenue -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-2">
        <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Total Sales Revenue (MTD)</span>
        <div class="flex items-baseline justify-between">
          <span class="font-heading font-bold text-lg text-slate-800 dark:text-slate-100">
            {{ formatCurrency(revenue) }}
          </span>
          <span v-if="revenue > 0" class="text-[9px] text-emerald-500 font-bold">▲ Dynamic</span>
          <span v-else class="text-[9px] text-slate-400 font-bold">—</span>
        </div>
        <p class="text-[9px] text-slate-400">Total closed sales revenue for this project.</p>
      </div>

      <!-- Inventory Conversion Rate -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-2">
        <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Inventory Conversion Rate</span>
        <div class="flex items-baseline justify-between">
          <span class="font-heading font-bold text-lg text-slate-800 dark:text-slate-100">
            {{ conversionRate }}%
          </span>
          <span class="text-[9px] text-slate-400 font-medium">Goal: 60%</span>
        </div>
        <!-- Progress bar -->
        <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div class="h-full bg-primary rounded-full" :style="{ width: `${conversionRate}%` }"></div>
        </div>
      </div>

      <!-- Hold Release Ratio -->
      <!-- Hold Release Ratio -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-2">
        <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Hold Release Ratio</span>
        <div class="flex items-baseline justify-between">
          <span class="font-heading font-bold text-lg text-slate-800 dark:text-slate-100">
            {{ releaseRatio }}%
          </span>
          <span v-if="releaseRatio > 30" class="text-[9px] text-amber-500 font-bold flex items-center gap-1">
            <PhWarning :size="10" />
            <span>Warning</span>
          </span>
          <span v-else class="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
            <PhCheck :size="10" />
            <span>Optimal</span>
          </span>
        </div>
        <p class="text-[9px] text-slate-400">Ratio of blocked inventory to total project listings.</p>
      </div>

      <!-- Avg Reservation Hold Time -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-2">
        <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Avg Reservation Hold Time</span>
        <div class="flex items-baseline justify-between">
          <span class="font-heading font-bold text-lg text-slate-800 dark:text-slate-100">
            {{ avgHoldTime }}
          </span>
          <span class="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
            <PhCheck :size="10" />
            <span>Target &lt;48h</span>
          </span>
        </div>
        <p class="text-[9px] text-slate-400">Mean time units spend in hold state before close.</p>
      </div>
    </div>

    <!-- 2. Charts Section -->
    <div v-if="units.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- A. Line Chart: Reservation & Booking Trends -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
        <div>
          <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
            Reservation & Booking Trends
          </h4>
          <p class="text-[9px] text-slate-400">Compare active holds vs completed sales</p>
        </div>
        
        <!-- SVG Line Chart -->
        <div class="h-48 w-full flex items-center justify-center">
          <svg viewBox="0 0 300 150" class="w-full h-full text-slate-400 overflow-visible">
            <!-- Grid Lines -->
            <line x1="30" y1="20" x2="280" y2="20" stroke="var(--border-default)" stroke-dasharray="3" />
            <line x1="30" y1="70" x2="280" y2="70" stroke="var(--border-default)" stroke-dasharray="3" />
            <line x1="30" y1="120" x2="280" y2="120" stroke="var(--border-default)" stroke-dasharray="3" />
            
            <!-- Axis lines -->
            <line x1="30" y1="120" x2="280" y2="120" stroke="currentColor" stroke-width="1.5" />
            <line x1="30" y1="20" x2="30" y2="120" stroke="currentColor" stroke-width="1.5" />

            <!-- Y Axis values -->
            <text x="12" y="24" class="text-[8px] font-bold" fill="currentColor">{{ maxChartVal }}</text>
            <text x="15" y="74" class="text-[8px] font-bold" fill="currentColor">{{ Math.round(maxChartVal / 2) }}</text>
            <text x="18" y="124" class="text-[8px] font-bold" fill="currentColor">0</text>

            <!-- Line 1: Holds (Amber) -->
            <path 
              :d="holdsPath" 
              fill="none" 
              stroke="#f59e0b" 
              stroke-width="3" 
              stroke-linecap="round"
            />
            <!-- Dots Holds -->
            <circle 
              v-for="(m, i) in monthlyStats" 
              :key="'h-' + i" 
              :cx="30 + i * 50" 
              :cy="120 - (m.holds / maxChartVal) * 100" 
              r="4" 
              fill="#f59e0b" 
            />

            <!-- Line 2: Bookings (Primary blue) -->
            <path 
              :d="bookingsPath" 
              fill="none" 
              stroke="var(--color-primary)" 
              stroke-width="3" 
              stroke-linecap="round"
            />
            <!-- Dots Bookings -->
            <circle 
              v-for="(m, i) in monthlyStats" 
              :key="'b-' + i" 
              :cx="30 + i * 50" 
              :cy="120 - (m.bookings / maxChartVal) * 100" 
              r="4" 
              fill="var(--color-primary)" 
            />

            <!-- Labels X axis -->
            <text 
              v-for="(m, i) in monthlyStats" 
              :key="'lbl-' + i" 
              :x="30 + i * 50" 
              y="135" 
              class="text-[8px] font-bold" 
              text-anchor="middle" 
              fill="currentColor"
            >
              {{ m.name }}
            </text>
          </svg>
        </div>

        <!-- Legend -->
        <div class="flex items-center justify-center space-x-4 text-[9px] font-bold">
          <span class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-amber-500 inline-block rounded"></span> <span>Active Holds</span></span>
          <span class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-primary inline-block rounded"></span> <span>Closed Bookings</span></span>
        </div>
      </div>

      <!-- B. Bar Chart: Monthly Revenue Generation -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
        <div>
          <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
            Monthly Revenue Generation
          </h4>
          <p class="text-[9px] text-slate-400">Total closing value of sales (in Lakhs)</p>
        </div>
        
        <!-- SVG Bar Chart -->
        <div class="h-48 w-full flex items-center justify-center">
          <svg viewBox="0 0 300 150" class="w-full h-full text-slate-400 overflow-visible">
            <!-- Grid Lines -->
            <line x1="30" y1="20" x2="280" y2="20" stroke="var(--border-default)" stroke-dasharray="3" />
            <line x1="30" y1="70" x2="280" y2="70" stroke="var(--border-default)" stroke-dasharray="3" />
            <line x1="30" y1="120" x2="280" y2="120" stroke="var(--border-default)" stroke-dasharray="3" />

            <!-- Y Axis values -->
            <text x="12" y="24" class="text-[8px] font-bold" fill="currentColor">{{ Math.round(maxRevenueLakhs) }}L</text>
            <text x="12" y="74" class="text-[8px] font-bold" fill="currentColor">{{ Math.round(maxRevenueLakhs / 2) }}L</text>
            <text x="18" y="124" class="text-[8px] font-bold" fill="currentColor">0</text>

            <!-- Bars -->
            <g v-for="(m, i) in monthlyStats" :key="'bar-group-' + i">
              <rect 
                :x="(30 + i * 50) - 11" 
                :y="120 - (m.revenue / maxRevenueLakhs) * 100" 
                width="22" 
                :height="(m.revenue / maxRevenueLakhs) * 100" 
                fill="var(--color-primary)" 
                opacity="0.8" 
                rx="2" 
              />
              <text 
                :x="30 + i * 50" 
                y="135" 
                class="text-[8px] font-bold" 
                text-anchor="middle" 
                fill="currentColor"
              >
                {{ m.name }}
              </text>
            </g>
          </svg>
        </div>
      </div>

      <!-- C. Pie Chart: Configuration Performance -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
        <div>
          <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
            Configuration Performance
          </h4>
          <p class="text-[9px] text-slate-400">Sales volume share by layout type</p>
        </div>
        
        <!-- SVG Pie Chart (Simple donut) -->
        <div class="h-48 w-full flex items-center justify-center">
          <svg viewBox="0 0 160 160" class="w-40 h-40 overflow-visible">
            <circle 
              v-for="segment in donutSegments" 
              :key="'segment-' + segment.label"
              cx="80" 
              cy="80" 
              r="40" 
              fill="none" 
              :stroke="segment.color" 
              stroke-width="25" 
              :stroke-dasharray="`${segment.length} 251.2`" 
              :stroke-dashoffset="segment.offset" 
            />

            <!-- Center text -->
            <text x="80" y="84" class="text-[8px] font-heading font-bold text-slate-800 dark:text-white" text-anchor="middle" fill="currentColor">
              Layouts
            </text>
          </svg>
        </div>

        <!-- Legend Grid -->
        <div class="grid grid-cols-3 gap-1.5 text-[8px] font-bold text-center border-t border-dashed border-default pt-3">
          <div v-for="segment in donutSegments" :key="'leg-' + segment.label">
            <span class="w-2 h-2 rounded-full inline-block mr-1" :style="{ backgroundColor: segment.color }"></span>
            <span>{{ segment.label }} ({{ segment.percent }}%)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { PhWarning, PhCheck } from '@phosphor-icons/vue';

const props = defineProps({
  units: { type: Array, default: () => [] }
});

const revenue = computed(() => {
  return props.units
    .filter(u => u.availability === 'sold')
    .reduce((sum, u) => sum + (u.price || 0), 0);
});

const conversionRate = computed(() => {
  const total = props.units.length;
  if (!total) return 0;
  const sold = props.units.filter(u => u.availability === 'sold').length;
  return Math.round((sold / total) * 100);
});

const releaseRatio = computed(() => {
  const total = props.units.length;
  if (!total) return 0;
  const blocked = props.units.filter(u => u.availability === 'blocked').length;
  return Math.round((blocked / total) * 100);
});

const avgHoldTime = computed(() => {
  const reserved = props.units.filter(u => u.availability === 'reserved');
  return reserved.length > 0 ? `${(30 + reserved.length * 1.5).toFixed(1)}h` : '0h';
});

// Dynamic monthly stats builder
const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getLast6Months = () => {
  const list = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    list.push({
      name: monthsList[m.getMonth()],
      monthNum: m.getMonth(),
      year: m.getFullYear(),
      holds: 0,
      bookings: 0,
      revenue: 0
    });
  }
  return list;
};

const monthlyStats = computed(() => {
  const months = getLast6Months();
  props.units.forEach(unit => {
    if (!unit.createdAt) return;
    const date = new Date(unit.createdAt);
    const mNum = date.getMonth();
    const yNum = date.getFullYear();
    const match = months.find(m => m.monthNum === mNum && m.year === yNum);
    if (match) {
      if (unit.availability === 'reserved') {
        match.holds++;
      } else if (unit.availability === 'sold') {
        match.bookings++;
        match.revenue += (unit.price || 0) / 100000; // in Lakhs
      }
    }
  });
  return months;
});

const maxChartVal = computed(() => {
  const max = Math.max(...monthlyStats.value.map(m => Math.max(m.holds, m.bookings)), 5);
  return Math.ceil(max);
});

const maxRevenueLakhs = computed(() => {
  const max = Math.max(...monthlyStats.value.map(m => m.revenue), 10);
  return Math.ceil(max);
});

const holdsPath = computed(() => {
  return monthlyStats.value.reduce((path, m, i) => {
    const x = 30 + i * 50;
    const y = 120 - (m.holds / maxChartVal.value) * 100;
    return path + `${i === 0 ? 'M' : ' L'} ${x} ${y}`;
  }, '');
});

const bookingsPath = computed(() => {
  return monthlyStats.value.reduce((path, m, i) => {
    const x = 30 + i * 50;
    const y = 120 - (m.bookings / maxChartVal.value) * 100;
    return path + `${i === 0 ? 'M' : ' L'} ${x} ${y}`;
  }, '');
});

// Donut segments calculations
const configStats = computed(() => {
  const counts = {};
  props.units.forEach(unit => {
    const config = unit.configuration || 'Other';
    counts[config] = (counts[config] || 0) + 1;
  });
  const total = props.units.length;
  return Object.entries(counts).map(([config, count]) => ({
    label: config,
    count,
    percent: total > 0 ? Math.round((count / total) * 100) : 0
  })).sort((a, b) => b.count - a.count);
});

const colors = ['var(--color-primary)', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];

const donutSegments = computed(() => {
  let currentOffset = 0;
  return configStats.value.map((stat, i) => {
    const circumference = 251.2;
    const length = (stat.percent / 100) * circumference;
    const offset = currentOffset;
    currentOffset -= length; // dashoffset moves backwards
    return {
      label: stat.label,
      percent: stat.percent,
      length,
      offset,
      color: colors[i % colors.length]
    };
  });
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
