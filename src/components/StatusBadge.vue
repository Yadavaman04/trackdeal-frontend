<template>
  <span
    class="inline-flex items-center gap-1.5 text-micro font-semibold tracking-wide shrink-0 px-2 py-0.5 rounded-chip"
    :style="badgeStyle"
  >
    <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: dotColor }" />
    <slot>{{ status }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status:  { type: String, required: true },
  variant: { type: String, default: 'neutral' }, // success | warning | danger | info | purple | neutral
});

const palette = {
  success: {
    bg:     'hsl(var(--success-bg))',
    text:   'hsl(var(--success-text))',
    border: 'hsl(var(--success-border))',
    dot:    'hsl(var(--success-dot))',
  },
  warning: {
    bg:     'hsl(var(--warning-bg))',
    text:   'hsl(var(--warning-text))',
    border: 'hsl(var(--warning-border))',
    dot:    'hsl(var(--warning-dot))',
  },
  danger: {
    bg:     'hsl(var(--danger-bg))',
    text:   'hsl(var(--danger-text))',
    border: 'hsl(var(--danger-border))',
    dot:    'hsl(var(--danger-dot))',
  },
  info: {
    bg:     'hsl(var(--info-bg))',
    text:   'hsl(var(--info-text))',
    border: 'hsl(var(--info-border))',
    dot:    'hsl(var(--info-dot))',
  },
  purple: {
    bg:     'hsl(var(--purple-bg))',
    text:   'hsl(var(--purple-text))',
    border: 'hsl(var(--purple-border))',
    dot:    'hsl(var(--purple-dot))',
  },
  neutral: {
    bg:     'hsl(var(--neutral-50))',
    text:   'hsl(var(--neutral-500))',
    border: 'hsl(var(--neutral-200))',
    dot:    'hsl(var(--neutral-400))',
  },
};

const colors = computed(() => palette[props.variant] ?? palette.neutral);
const badgeStyle = computed(() => ({
  backgroundColor: colors.value.bg,
  color:           colors.value.text,
  border:          `1px solid ${colors.value.border}`,
}));
const dotColor = computed(() => colors.value.dot);
</script>
