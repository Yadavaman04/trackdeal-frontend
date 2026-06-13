<template>
  <div class="card p-4 flex flex-col h-72">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-subtle pb-3 mb-4 shrink-0">
      <div>
        <h3 class="text-xs font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
          {{ subtitle }}
        </p>
      </div>
      <!-- Header actions slot (for inline tabs etc) -->
      <slot name="actions" />
    </div>

    <!-- Chart Canvas Content -->
    <div class="flex-1 relative min-h-0 flex items-center justify-center">
      <div v-if="isLoading" class="flex flex-col space-y-2 w-full h-full justify-end px-2">
        <div class="flex justify-between items-end h-full space-x-4 pb-4 border-b border-subtle">
          <div class="h-28 skeleton w-full"></div>
          <div class="h-40 skeleton w-full"></div>
          <div class="h-20 skeleton w-full"></div>
          <div class="h-32 skeleton w-full"></div>
        </div>
      </div>
      
      <div v-else-if="!data || data.length === 0" class="text-caption text-neutral-400">
        No graphical data available for selected parameters.
      </div>
      
      <!-- Render Custom Premium SVG charts -->
      <div v-else class="w-full h-full flex flex-col justify-between">
        <!-- Funnel Chart Render -->
        <div v-if="type === 'funnel'" class="flex-1 flex flex-col justify-center space-y-2 py-2">
          <div v-for="(item, idx) in sortedData" :key="idx" class="flex items-center space-x-3">
            <span class="w-20 text-[10px] font-bold text-neutral-500 truncate text-right">
              {{ item.label }}
            </span>
            <div class="flex-1 h-6 bg-neutral-25 dark:bg-neutral-900 rounded-md overflow-hidden relative">
              <!-- Visual Funnel Stage Width -->
              <div 
                class="h-full bg-accent-600 opacity-85 transition-all duration-500 flex items-center px-3"
                :style="{ width: `${(item.value / maxVal) * 100}%` }"
              >
                <span class="text-[9px] font-bold text-white z-10 select-none">
                  {{ item.value }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bar / Line Charts Render -->
        <svg v-else class="flex-1 w-full h-full min-h-0" viewBox="0 0 400 160">
          <!-- Grid Lines -->
          <line x1="40" y1="20" x2="380" y2="20" stroke="currentColor" class="text-neutral-50 dark:text-neutral-800" stroke-dasharray="4" />
          <line x1="40" y1="70" x2="380" y2="70" stroke="currentColor" class="text-neutral-50 dark:text-neutral-800" stroke-dasharray="4" />
          <line x1="40" y1="120" x2="380" y2="120" stroke="currentColor" class="text-neutral-50 dark:text-neutral-800" stroke-dasharray="4" />
          <line x1="40" y1="140" x2="380" y2="140" stroke="currentColor" class="text-neutral-100 dark:text-neutral-700" />

          <!-- Bar Chart Type -->
          <g v-if="type === 'bar'">
            <g v-for="(item, idx) in data" :key="idx">
              <!-- Render Rect Bar -->
              <rect 
                :x="calculateX(idx) - 8"
                :y="calculateY(item.value)"
                width="16"
                :height="140 - calculateY(item.value)"
                class="fill-primary hover:opacity-90 transition-all duration-300 cursor-pointer"
                rx="3"
              />
              <!-- Data labels -->
              <text 
                :x="calculateX(idx)" 
                y="155" 
                text-anchor="middle" 
                class="fill-neutral-400 dark:fill-neutral-500 font-sans text-[8px]"
              >
                {{ item.label }}
              </text>
              <text 
                :x="calculateX(idx)" 
                :y="calculateY(item.value) - 4" 
                text-anchor="middle" 
                class="fill-neutral-700 dark:fill-neutral-200 font-sans text-[8px] font-bold"
              >
                {{ formatVal(item.value) }}
              </text>
            </g>
          </g>

          <!-- Line Chart Type -->
          <g v-else-if="type === 'line'">
            <!-- SVG Path Line drawing -->
            <path 
              :d="linePath" 
              fill="none" 
              class="stroke-primary"
              stroke-width="2.5" 
              stroke-linecap="round"
            />
            <!-- Visual Dots on Nodes -->
            <g v-for="(item, idx) in data" :key="idx">
              <circle 
                :cx="calculateX(idx)" 
                :cy="calculateY(item.value)" 
                r="3.5" 
                class="fill-surface stroke-primary"
                stroke-width="2"
              />
              <text 
                :x="calculateX(idx)" 
                y="155" 
                text-anchor="middle" 
                class="fill-neutral-400 dark:fill-neutral-500 font-sans text-[8px]"
              >
                {{ item.label }}
              </text>
              <text 
                :x="calculateX(idx)" 
                :y="calculateY(item.value) - 6" 
                text-anchor="middle" 
                class="fill-neutral-700 dark:fill-neutral-200 font-sans text-[8px] font-bold"
              >
                {{ formatVal(item.value) }}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  type: { type: String, default: 'line' }, // line, bar, funnel
  data: { type: Array, required: true }, // Array of { label, value }
  isLoading: { type: Boolean, default: false }
});

const sortedData = computed(() => {
  if (props.type === 'funnel') {
    return [...props.data].sort((a, b) => b.value - a.value);
  }
  return props.data;
});

const maxVal = computed(() => {
  if (props.data.length === 0) return 1;
  const values = props.data.map(d => Number(d.value));
  return Math.max(...values, 1);
});

const calculateX = (index) => {
  const steps = props.data.length - 1 || 1;
  const graphWidth = 320;
  return 50 + (index * (graphWidth / steps));
};

const calculateY = (value) => {
  const val = Number(value);
  const minGraphY = 25;
  const maxGraphY = 135;
  const heightRatio = (val / maxVal.value);
  return maxGraphY - (heightRatio * (maxGraphY - minGraphY));
};

const linePath = computed(() => {
  if (props.data.length === 0) return '';
  return props.data.reduce((path, item, idx) => {
    const x = calculateX(idx);
    const y = calculateY(item.value);
    return path + (idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');
});

const formatVal = (val) => {
  if (val >= 1000) {
    return (val / 1000).toFixed(0) + 'k';
  }
  return val;
};
</script>
