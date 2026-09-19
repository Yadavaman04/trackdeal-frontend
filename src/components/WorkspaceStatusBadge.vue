<template>
  <span class="workspace-status" :class="`workspace-status--${tone}`">{{ label }}</span>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  tone: { type: String, default: 'neutral' },
});
</script>
