<template>
  <div
    class="card-hover flex flex-col gap-4 p-5 cursor-default select-none rounded-[16px] transition-all bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800"
    :style="{ borderLeftColor: accentBorder ? 'hsl(var(--accent-500))' : undefined, borderLeftWidth: accentBorder ? '2px' : '1px' }"
  >
    <!-- Top row: icon + label -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-3">
        <!-- KokonutUI style: larger soft tinted icon box -->
        <div
          v-if="icon"
          class="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
          style="background-color: hsl(var(--accent-50));"
        >
          <component :is="icon" :size="20" weight="duotone" style="color: hsl(var(--accent-600));" />
        </div>
        <span class="text-micro" style="color: hsl(var(--neutral-400));">
          {{ title }}
        </span>
      </div>

      <!-- Info tooltip -->
      <div v-if="description" class="relative group">
        <PhInfo :size="16" style="color: hsl(var(--neutral-300)); cursor: default;" />
        <div
          class="absolute right-0 top-6 w-52 rounded-xl border p-3 text-body leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-20 shadow-2xl premium-backdrop"
          style="border-color: hsl(var(--neutral-700)); color: hsl(var(--neutral-100));"
        >
          {{ description }}
        </div>
      </div>
    </div>

    <!-- Value + Delta row -->
    <div class="flex items-end justify-between gap-2 mt-1">
      <span class="text-display text-tabular" style="color: hsl(var(--neutral-900)); font-size: 1.75rem;">
        {{ value }}
      </span>

      <!-- Trend badge -->
      <div
        v-if="trend"
        class="flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0"
        :style="{
          backgroundColor: trendDirection === 'up' ? 'hsl(var(--success-bg))' :
                           trendDirection === 'down' ? 'hsl(var(--danger-bg))' :
                           'hsl(var(--neutral-50))',
          color: trendDirection === 'up' ? 'hsl(var(--success-text))' :
                 trendDirection === 'down' ? 'hsl(var(--danger-text))' :
                 'hsl(var(--neutral-500))',
        }"
      >
        <PhArrowUp    v-if="trendDirection === 'up'"   :size="12" weight="bold" />
        <PhArrowDown  v-if="trendDirection === 'down'" :size="12" weight="bold" />
        <PhMinus      v-if="trendDirection === 'flat'" :size="12" weight="bold" />
        <span class="text-micro font-bold">{{ trend }}</span>
      </div>
    </div>

    <!-- Subtext / period -->
    <p v-if="subtext" class="text-label mt-1" style="color: hsl(var(--neutral-400)); font-size: 10px;">{{ subtext }}</p>
  </div>
</template>

<script setup>
import { PhInfo, PhArrowUp, PhArrowDown, PhMinus } from '@phosphor-icons/vue';

defineProps({
  title:       { type: String,  required: true },
  value:       { type: [String, Number], required: true },
  description: { type: String,  default: '' },
  trend:       { type: String,  default: '' },
  trendDirection: { type: String, default: 'up' },  // up | down | flat
  subtext:     { type: String,  default: '' },       // e.g. "vs last 30 days"
  icon:        { type: Object,  default: null },     // Phosphor component
  accentBorder:{ type: Boolean, default: false },    // left-border accent for primary KPI
});
</script>
