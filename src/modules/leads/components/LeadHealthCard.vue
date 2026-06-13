<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm">
    <div class="flex items-center justify-between mb-3 border-b border-default pb-2">
      <span class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200">Lead Health Profile</span>
      <span class="text-[10px] px-2 py-0.5 rounded font-semibold capitalize" :class="statusColorClass">
        {{ ratingLabel }} Lead
      </span>
    </div>

    <div class="flex items-center space-x-6">
      <!-- Circular Progress SVG -->
      <div class="relative w-20 h-20 shrink-0">
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            class="text-slate-100 dark:text-slate-800"
            stroke-width="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            :class="ringColorClass"
            stroke-width="3.2"
            :stroke-dasharray="`${score}, 100`"
            stroke-linecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-lg font-extrabold font-heading text-slate-800 dark:text-slate-150 leading-none">{{ score }}</span>
          <span class="text-[8px] text-slate-400 dark:text-slate-500 uppercase mt-0.5">Score</span>
        </div>
      </div>

      <!-- Health Factors List -->
      <div class="flex-1 space-y-1.5 text-[10px]">
        <div class="flex items-center justify-between text-slate-500">
          <span>Budget Definition</span>
          <span :class="hasBudget ? 'text-emerald-500 font-bold' : 'text-slate-300'">
            {{ hasBudget ? '+15' : '0' }}
          </span>
        </div>
        <div class="flex items-center justify-between text-slate-500">
          <span>Interaction History</span>
          <span :class="hasOutreach ? 'text-emerald-500 font-bold' : 'text-slate-300'">
            {{ hasOutreach ? '+15' : '0' }}
          </span>
        </div>
        <div class="flex items-center justify-between text-slate-500">
          <span>Scheduled Visit</span>
          <span :class="hasScheduledVisit ? 'text-emerald-500 font-bold' : 'text-slate-300'">
            {{ hasScheduledVisit ? '+30' : '0' }}
          </span>
        </div>
        <div class="flex items-center justify-between text-slate-500">
          <span>Completed Visits</span>
          <span :class="hasCompletedVisit ? 'text-emerald-500 font-bold' : 'text-slate-300'">
            {{ hasCompletedVisit ? '+20' : '0' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  score: { type: Number, default: 0 },
  requirements: { type: Object, default: () => ({}) },
  tasks: { type: Array, default: () => [] }
});

const hasBudget = computed(() => {
  return !!(props.requirements?.budget?.min && props.requirements?.budget?.max);
});

// Since the score itself encodes these properties on the backend, we can infer them or check tasks
const hasOutreach = computed(() => props.score >= 15);
const hasScheduledVisit = computed(() => props.score >= 45 || props.score === 30 || props.score === 35);
const hasCompletedVisit = computed(() => props.score >= 50 || props.score === 35);

const ratingLabel = computed(() => {
  if (props.score >= 70) return 'Hot';
  if (props.score >= 35) return 'Warm';
  return 'Cold';
});

const ringColorClass = computed(() => {
  if (props.score >= 70) return 'text-emerald-500';
  if (props.score >= 35) return 'text-amber-500';
  return 'text-red-500';
});

const statusColorClass = computed(() => {
  if (props.score >= 70) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
  if (props.score >= 35) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
  return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
});
</script>
