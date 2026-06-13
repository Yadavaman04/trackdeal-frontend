<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-4">
    <!-- Health Score Header -->
    <div class="space-y-1.5 border-b border-default pb-3">
      <div class="flex justify-between items-baseline">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
          Deal Health Score
        </h4>
        <span class="font-heading font-bold text-lg" :class="getScoreColorClass">
          {{ score }}/100
        </span>
      </div>
      
      <!-- Progress Bar -->
      <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <div 
          class="h-full rounded-full transition-all duration-300"
          :class="getScoreBgClass"
          :style="{ width: `${score}%` }"
        ></div>
      </div>

      <div class="flex justify-between items-center text-[9px] font-bold uppercase text-slate-450 pt-1">
        <span>Risk Index: <b :class="getRiskColorClass">{{ riskLevel }} ({{ riskPercent }}%)</b></span>
        <span>Status: <b class="text-emerald-500">● Stable</b></span>
      </div>
    </div>

    <!-- Health Factors -->
    <div class="space-y-2">
      <h5 class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Health Factors</h5>
      <ul class="space-y-1.5 text-[10px]">
        <li class="flex items-center space-x-1.5 text-slate-650 dark:text-slate-400">
          <span class="text-emerald-500 font-bold">✓</span>
          <span>Payments On Time (Token cleared)</span>
        </li>
        <li class="flex items-center space-x-1.5 text-slate-650 dark:text-slate-400">
          <span class="text-emerald-500 font-bold">✓</span>
          <span>Documents Complete (KYC verified)</span>
        </li>
        <li class="flex items-center space-x-1.5 text-slate-650 dark:text-slate-400">
          <span class="text-emerald-500 font-bold">✓</span>
          <span>Registration Slot Confirmed</span>
        </li>
        <li class="flex items-center space-x-1.5 text-slate-450">
          <span class="text-amber-500 font-bold">⚠️</span>
          <span>Builder Confirmation Pending check</span>
        </li>
      </ul>
    </div>

    <!-- Risk Indicators -->
    <div class="space-y-2 border-t border-dashed border-default pt-3">
      <h5 class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Risk Indicators</h5>
      <div class="space-y-1 text-[10px] font-medium">
        <div class="flex justify-between py-0.5">
          <span class="text-slate-500">No Activity 14 Days:</span>
          <span class="text-emerald-500 font-bold">None</span>
        </div>
        <div class="flex justify-between py-0.5">
          <span class="text-slate-500">Installment Overdue:</span>
          <span class="text-emerald-500 font-bold">None</span>
        </div>
        <div class="flex justify-between py-0.5">
          <span class="text-slate-500">Missing Documents:</span>
          <span class="text-amber-500 font-bold">Agreement Copy</span>
        </div>
        <div class="flex justify-between py-0.5">
          <span class="text-slate-500">Builder Delay:</span>
          <span class="text-amber-500 font-bold">Allotment letter pending</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  score: { type: Number, default: 92 },
  riskPercent: { type: Number, default: 15 }
});

const riskLevel = computed(() => {
  if (props.riskPercent >= 50) return 'High';
  if (props.riskPercent >= 25) return 'Medium';
  return 'Low';
});

const getScoreColorClass = computed(() => {
  if (props.score >= 80) return 'text-emerald-600 dark:text-emerald-450';
  if (props.score >= 60) return 'text-amber-500';
  return 'text-red-500';
});

const getScoreBgClass = computed(() => {
  if (props.score >= 80) return 'bg-emerald-500';
  if (props.score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
});

const getRiskColorClass = computed(() => {
  if (props.riskPercent >= 50) return 'text-red-500';
  if (props.riskPercent >= 25) return 'text-amber-500';
  return 'text-emerald-500';
});
</script>
