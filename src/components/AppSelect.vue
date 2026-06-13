<template>
  <div class="relative space-y-1">
    <label v-if="label" class="label-text" :class="{ 'label-required': required }">
      {{ label }}
    </label>
    <div class="relative">
      <select
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        class="input-field appearance-none pr-8 text-caption text-neutral-900"
        :class="{ 'input-field-error': error }"
        :disabled="disabled"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option 
          v-for="opt in options" 
          :key="opt.value || opt" 
          :value="opt.value !== undefined ? opt.value : opt"
        >
          {{ opt.label !== undefined ? opt.label : opt }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-neutral-400">
        <PhCaretDown class="w-3.5 h-3.5" weight="bold" />
      </div>
    </div>
    <span v-if="error" class="text-[10px] text-danger-text block mt-1">{{ error }}</span>
  </div>
</template>

<script setup>
import { PhCaretDown } from '@phosphor-icons/vue';

defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
});

defineEmits(['update:modelValue']);
</script>
