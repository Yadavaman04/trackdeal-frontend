<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-4">
    <!-- Header -->
    <div class="border-b border-default pb-2">
      <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">
        {{ title }}
      </h4>
      <p class="text-[9px] text-slate-450 mt-0.5" v-if="subtitle">{{ subtitle }}</p>
    </div>

    <!-- Funnel Chart -->
    <div v-if="type === 'funnel'" class="space-y-3.5">
      <div 
        v-for="(item, idx) in chartData" 
        :key="item.label" 
        class="space-y-1"
      >
        <div class="flex justify-between items-center text-[10px] font-bold text-slate-700 dark:text-slate-350">
          <span>{{ item.label }}</span>
          <span>{{ item.value }} ({{ item.percent }}%)</span>
        </div>
        <!-- Funnel bar trapezoid or relative width block -->
        <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-lg h-5 overflow-hidden relative flex items-center px-3 border border-default">
          <div 
            class="h-full rounded-l transition-all duration-500"
            :class="getFunnelColorClass(idx)"
            :style="{ width: `${item.percent}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Donut Distribution Chart -->
    <div v-else-if="type === 'donut'" class="flex flex-col sm:flex-row items-center justify-around gap-4">
      <!-- Donut SVG -->
      <div class="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
          <!-- Background circle -->
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-default, #e2e8f0)" stroke-width="3" />
          
          <!-- Colored segments -->
          <circle 
            v-for="(seg, idx) in donutSegments" 
            :key="seg.label"
            cx="18" 
            cy="18" 
            r="15.915" 
            fill="none" 
            :stroke="seg.color" 
            stroke-width="3" 
            :stroke-dasharray="`${seg.percent} ${100 - seg.percent}`"
            :stroke-dashoffset="seg.offset"
            class="transition-all duration-500"
          />
        </svg>
        <!-- Inner text count -->
        <div class="absolute inset-0 flex flex-col items-center justify-center font-bold text-slate-850 dark:text-slate-150">
          <span class="text-sm">{{ totalCount }}</span>
          <span class="text-[8px] text-slate-400 uppercase tracking-wider">Total</span>
        </div>
      </div>

      <!-- Donut Legend -->
      <div class="space-y-2 flex-1">
        <div 
          v-for="item in chartData" 
          :key="item.label" 
          class="flex items-center justify-between text-[10px] font-semibold"
        >
          <div class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color || '#6366f1' }"></span>
            <span class="text-slate-655">{{ item.label }}</span>
          </div>
          <span class="font-bold text-slate-800 dark:text-slate-200">{{ item.value }} ({{ item.percent }}%)</span>
        </div>
      </div>
    </div>

    <!-- Line Trend Chart -->
    <div v-else-if="type === 'line'">
      <svg viewBox="0 0 400 120" class="w-full h-28 overflow-visible">
        <!-- Grid lines -->
        <line x1="20" y1="100" x2="380" y2="100" stroke="var(--border-default, #e2e8f0)" stroke-dasharray="3 3" />
        <line x1="20" y1="60" x2="380" y2="60" stroke="var(--border-default, #e2e8f0)" stroke-dasharray="3 3" />
        <line x1="20" y1="20" x2="380" y2="20" stroke="var(--border-default, #e2e8f0)" stroke-dasharray="3 3" />

        <!-- Line curve -->
        <path 
          :d="linePath" 
          fill="none" 
          stroke="var(--color-primary, #6366f1)" 
          stroke-width="2.5" 
          stroke-linecap="round"
          class="transition-all duration-500"
        />
        <path 
          :d="`${linePath} L 380,100 L 20,100 Z`" 
          fill="url(#lineGrad)" 
          opacity="0.1" 
          class="transition-all duration-500"
        />

        <!-- Markers and tooltips -->
        <g v-for="(pt, idx) in linePoints" :key="idx">
          <circle :cx="pt.x" :cy="pt.y" r="3.5" fill="#6366f1" stroke="#ffffff" stroke-width="1.5" />
          <text :x="pt.x - 10" :y="pt.y - 8" font-size="8" font-weight="bold" fill="#6366f1">{{ pt.label }}</text>
          <!-- X labels -->
          <text :x="pt.x - 12" y="112" font-size="7" font-weight="bold" fill="#94a3b8">{{ pt.name }}</text>
        </g>

        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  type: { type: String, default: 'funnel' }, // funnel, donut, line
  chartData: { type: Array, required: true }
});

// Funnel colors
const getFunnelColorClass = (idx) => {
  const colors = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-emerald-500'
  ];
  return colors[idx % colors.length];
};

// Donut segments calculation
const totalCount = computed(() => {
  return props.chartData.reduce((acc, curr) => acc + curr.value, 0);
});

const donutSegments = computed(() => {
  let accumOffset = 0;
  return props.chartData.map(item => {
    const percent = item.percent || (totalCount.value > 0 ? (item.value / totalCount.value) * 100 : 0);
    const offset = 100 - accumOffset;
    accumOffset += percent;
    return {
      label: item.label,
      percent,
      offset,
      color: item.color || '#6366f1'
    };
  });
});

// Line path calculation
const linePoints = computed(() => {
  if (props.type !== 'line') return [];
  // Fit 4-6 points dynamically across 400x120 SVG box
  // x goes from 20 to 380. y goes from 100 to 20.
  const size = props.chartData.length;
  const xStep = size > 1 ? 360 / (size - 1) : 360;
  const minVal = Math.min(...props.chartData.map(item => item.value));
  const maxVal = Math.max(...props.chartData.map(item => item.value)) || 1;
  const valRange = maxVal - minVal || 1;

  return props.chartData.map((item, idx) => {
    const x = 20 + idx * xStep;
    // Map value to y coordinates: 100 (minVal) to 20 (maxVal)
    const y = 100 - ((item.value - minVal) / valRange) * 80;
    return {
      x,
      y,
      label: item.value,
      name: item.label
    };
  });
});

const linePath = computed(() => {
  const pts = linePoints.value;
  if (pts.length === 0) return '';
  return pts.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x},${curr.y}`;
    return `${acc} L ${curr.x},${curr.y}`;
  }, '');
});
</script>
