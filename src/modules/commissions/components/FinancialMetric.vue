<template>
  <article class="financial-metric" :class="[`financial-metric--${tone}`, { 'financial-metric--dominant': dominant }]">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="financial-metric__label">{{ label }}</p>
        <p class="financial-metric__value">{{ value }}</p>
      </div>
      <span class="financial-metric__icon" aria-hidden="true">
        <AppIcon :name="icon" :size="18" weight="duotone" />
      </span>
    </div>
    <div v-if="progress !== null" class="financial-metric__progress" :aria-label="`${progress}% complete`">
      <span :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"></span>
    </div>
    <p v-if="caption" class="financial-metric__caption">{{ caption }}</p>
  </article>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  caption: { type: String, default: '' },
  icon: { type: String, default: 'currency' },
  tone: { type: String, default: 'neutral' },
  dominant: { type: Boolean, default: false },
  progress: { type: Number, default: null },
});
</script>
