<template>
  <div class="segmented-control" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="modelValue === option.value"
      :class="{ 'is-selected': modelValue === option.value }"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label
      }}<span v-if="option.count !== undefined" class="segment-count">{{
        option.count
      }}</span>
    </button>
  </div>
</template>

<script setup>
// Vue implementation of the restrained segmented navigation seen in Kokonut UI.
defineProps({
  modelValue: String,
  label: { type: String, required: true },
  options: { type: Array, required: true },
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.segmented-control {
  display: flex;
  gap: 4px;
  padding: 4px;
  max-width: 100%;
  border: 1px solid hsl(var(--neutral-100));
  border-radius: 10px;
  background: hsl(var(--neutral-25));
}
button {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 6px 12px;
  border-radius: 7px;
  color: hsl(var(--neutral-500));
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  transition:
    background 180ms,
    color 180ms,
    box-shadow 180ms;
}
button:hover {
  color: hsl(var(--neutral-900));
}
button.is-selected {
  background: hsl(var(--bg-surface));
  color: hsl(var(--neutral-900));
  box-shadow: 0 1px 4px #0000000d;
}
.segment-count {
  font-size: 10px;
  color: hsl(var(--neutral-500));
  font-variant-numeric: tabular-nums;
}
@media (pointer: coarse) {
  button {
    min-height: 44px;
  }
}
</style>
