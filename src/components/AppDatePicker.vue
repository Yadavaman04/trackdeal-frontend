<template>
  <div class="relative space-y-1">
    <label v-if="label" class="label-text" :class="{ 'label-required': required }">
      {{ label }}
    </label>
    <div class="relative flex items-center">
      <input
        type="date"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="input-field text-caption text-neutral-900 pr-10"
        :class="{ 'input-field-error': error }"
        :disabled="disabled"
      />
      <div class="absolute right-3 pointer-events-none text-neutral-400">
        <PhCalendar class="w-4 h-4" />
      </div>
    </div>
    <span v-if="error" class="text-[10px] text-danger-text block mt-1">{{ error }}</span>
  </div>
</template>

<script setup>
import { PhCalendar } from '@phosphor-icons/vue';

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
});

defineEmits(['update:modelValue']);
</script>
