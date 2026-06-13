<template>
  <div
    class="card-hover flex flex-col gap-3 p-4 cursor-default select-none"
    :style="{ borderLeftColor: accentBorder ? `hsl(var(--accent-500))` : 'transparent', borderLeftWidth: accentBorder ? '2px' : '1px' }"
  >
    <!-- Top row: icon + label -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <!-- Duotone icon tinted background -->
        <div
          v-if="icon"
          class="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
          style="background-color: hsl(var(--accent-100));"
        >
          <component :is="icon" :size="15" weight="duotone" style="color: hsl(var(--accent-600));" />
        </div>
        <span class="text-label font-semibold uppercase tracking-wider" style="color: hsl(var(--neutral-400));">
          {{ title }}
        </span>
      </div>

      <!-- Info tooltip -->
      <div v-if="description" class="relative group">
        <PhInfo :size="14" style="color: hsl(var(--neutral-300)); cursor: default;" />
        <div
          class="absolute right-0 top-6 w-52 rounded-[6px] border p-2.5 text-body-sm leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-120 z-20 shadow-lg"
          style="background-color: hsl(var(--neutral-900)); border-color: hsl(var(--neutral-700)); color: hsl(var(--neutral-300));"
        >
          {{ description }}
        </div>
      </div>
    </div>

    <!-- Value + Delta row -->
    <div class="flex items-end justify-between gap-2">
      <span class="text-h1 font-bold font-mono leading-none" style="color: hsl(var(--neutral-900));">
        {{ value }}
      </span>

      <!-- Trend badge -->
      <div
        v-if="trend"
        class="flex items-center gap-1 text-micro font-semibold px-2 py-1 rounded-chip shrink-0"
        :style="{
          backgroundColor: trendDirection === 'up' ? 'hsl(var(--success-bg))' :
                           trendDirection === 'down' ? 'hsl(var(--danger-bg))' :
                           'hsl(var(--neutral-50))',
          color: trendDirection === 'up' ? 'hsl(var(--success-text))' :
                 trendDirection === 'down' ? 'hsl(var(--danger-text))' :
                 'hsl(var(--neutral-500))',
        }"
      >
        <PhArrowUp    v-if="trendDirection === 'up'"   :size="10" weight="bold" />
        <PhArrowDown  v-if="trendDirection === 'down'" :size="10" weight="bold" />
        <PhMinus      v-if="trendDirection === 'flat'" :size="10" weight="bold" />
        {{ trend }}
      </div>
    </div>

    <!-- Subtext / period -->
    <p v-if="subtext" class="text-caption" style="color: hsl(var(--neutral-400));">{{ subtext }}</p>
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
