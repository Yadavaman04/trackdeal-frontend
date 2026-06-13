<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-1.5 text-xs font-semibold">
    <div class="flex justify-between items-center text-slate-450 text-[8px] uppercase tracking-wider">
      <span>{{ title }}</span>
      <span 
        v-if="trend" 
        class="font-bold flex items-center gap-0.5 text-[9px]"
        :class="trendDirection === 'up' ? 'text-emerald-500' : 'text-red-500'"
      >
        <component :is="trendDirection === 'up' ? PhCaretUp : PhCaretDown" :size="10" />
        <span>{{ trend }}</span>
      </span>
    </div>
    <div class="flex items-baseline space-x-2">
      <span class="font-heading font-extrabold text-base text-slate-800 dark:text-slate-100">
        {{ value }}
      </span>
    </div>
    <p class="text-[10px] text-slate-450 font-medium" v-if="description">{{ description }}</p>
  </div>
</template>

<script setup>
import { PhCaretUp, PhCaretDown } from '@phosphor-icons/vue';

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  description: { type: String, default: '' },
  trend: { type: String, default: '' },
  trendDirection: { type: String, default: 'up' } // up, down
});
</script>
