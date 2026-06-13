<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs space-y-4">
    <!-- Header Block -->
    <div class="flex items-start justify-between border-b border-default pb-3">
      <div>
        <router-link 
          :to="`/app/builders/${builder._id || builder.id}`" 
          class="font-heading font-bold text-sm text-slate-800 dark:text-slate-100 hover:underline block"
        >
          {{ builder.name }}
        </router-link>
        <span class="text-[9px] text-slate-400 uppercase tracking-widest font-bold font-mono">
          Code: {{ builder.code }}
        </span>
      </div>
      <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-550 border border-default rounded text-[9px] font-bold">
        Slab: —
      </span>
    </div>

    <!-- Metrics Strip -->
    <div class="grid grid-cols-3 gap-2 text-center bg-slate-50/50 dark:bg-slate-900 border border-default rounded-lg p-2">
      <div>
        <span class="text-[8px] text-slate-400 font-bold block uppercase">Projects</span>
        <span class="font-heading font-bold text-slate-750 dark:text-slate-200">
          {{ projectCount }}
        </span>
      </div>
      <div>
        <span class="text-[8px] text-slate-400 font-bold block uppercase">Holds MTD</span>
        <span class="font-heading font-bold text-slate-750 dark:text-slate-200">
          {{ holdsCount }}
        </span>
      </div>
      <div>
        <span class="text-[8px] text-slate-400 font-bold block uppercase">Receivables</span>
        <span class="font-heading font-bold text-emerald-600 dark:text-emerald-450 truncate block">
          {{ formatCurrency(receivables) }}
        </span>
      </div>
    </div>

    <!-- Contact details -->
    <div class="space-y-1.5 text-[10px] text-slate-655 dark:text-slate-400 border-t border-dashed border-default pt-3">
      <div class="flex items-center space-x-2">
        <PhEnvelope :size="14" class="text-slate-450 shrink-0" />
        <span class="font-medium truncate">{{ builder.email || '—' }}</span>
      </div>
      <div class="flex items-center space-x-2">
        <PhPhone :size="14" class="text-slate-450 shrink-0" />
        <span>{{ builder.phone || '—' }}</span>
      </div>
      <div class="flex items-center space-x-2" v-if="builder.website">
        <PhGlobe :size="14" class="text-slate-450 shrink-0" />
        <a :href="builder.website" target="_blank" class="text-primary hover:underline truncate">
          {{ builder.website }}
        </a>
      </div>
    </div>

    <!-- CTA footer -->
    <div class="flex justify-end pt-1">
      <router-link 
        :to="`/app/builders/${builder._id || builder.id}`"
        class="text-primary font-bold text-[10px] hover:underline"
      >
        View Profile Directory ➔
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { PhEnvelope, PhPhone, PhGlobe } from '@phosphor-icons/vue';

const props = defineProps({
  builder: { type: Object, required: true },
  projectCount: { type: Number, default: 0 },
  holdsCount: { type: Number, default: 0 },
  receivables: { type: Number, default: 0 }
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
