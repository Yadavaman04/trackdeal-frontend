<template>
  <article class="financial-metric" :class="tone ? `financial-metric--${tone}` : ''">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="financial-metric__label">{{ label }}</p>
        <p class="financial-metric__value">{{ value }}</p>
      </div>
      <span class="financial-metric__icon"><AppIcon :name="icon" :size="17" weight="duotone" /></span>
    </div>
    <div>
      <div v-if="progress !== null" class="financial-metric__progress mb-3"><span :style="{ width: `${safeProgress}%` }"></span></div>
      <p class="financial-metric__caption">{{ caption }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import AppIcon from './AppIcon.vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  caption: { type: String, default: '' },
  icon: { type: String, default: 'chart' },
  tone: { type: String, default: '' },
  progress: { type: Number, default: null },
});

const safeProgress = computed(() => Math.max(0, Math.min(100, Number(props.progress) || 0)));
</script>
