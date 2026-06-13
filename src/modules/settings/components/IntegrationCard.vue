<template>
  <div class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-600 transition-colors">
    <div class="space-y-3">
      <!-- Card Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-default flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-xs">
            <component v-if="typeof icon !== 'string'" :is="icon" :size="20" />
            <span v-else class="text-xl">{{ icon }}</span>
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ title }}</h4>
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border mt-0.5 capitalize"
              :class="statusClasses"
            >
              <span class="w-1 h-1 rounded-full mr-1" :class="statusDot"></span>
              {{ status }}
            </span>
          </div>
        </div>
      </div>
 
      <!-- Description -->
      <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{{ description }}</p>
 
      <!-- Sync Status & Details -->
      <div class="pt-2 border-t border-dashed border-default flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500">
        <span>Last Sync: <strong>{{ lastSync || 'Never' }}</strong></span>
        <span>Type: <strong>{{ type }}</strong></span>
      </div>
 
      <!-- Settings Subform Toggle -->
      <div class="pt-2">
        <button
          type="button"
          @click="showConfig = !showConfig"
          class="text-[9px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
        >
          <PhGear :size="12" />
          <span>{{ showConfig ? 'Hide Configuration' : 'Configure Credentials' }}</span>
        </button>
 
        <div v-if="showConfig" class="mt-3 space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-default">
          <div v-for="field in configFields" :key="field.key" class="space-y-1">
            <label class="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ field.label }}</label>
            <input
              v-model="configValues[field.key]"
              :type="field.type || 'text'"
              :placeholder="field.placeholder"
              class="w-full bg-surface border border-default rounded-md px-2 py-1.5 text-[10px] outline-none focus:border-primary text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center space-x-2 pt-4 border-t border-default mt-auto">
      <button
        @click="$emit('save', { name, config: configValues })"
        class="flex-1 btn-sm btn-secondary text-[10px]"
      >
        Save Config
      </button>
      <button
        @click="testConnection"
        class="btn-sm btn-primary gap-1 text-[10px]"
        :disabled="isTesting"
      >
        <PhLightning :size="12" />
        <span v-if="isTesting">Testing...</span>
        <span v-else>Test Connection</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { PhGear, PhLightning } from '@phosphor-icons/vue';

const props = defineProps({
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: [String, Object], default: '🔗' },
  status: { type: String, default: 'disconnected' }, // connected, disconnected, degraded
  lastSync: { type: String, default: '' },
  type: { type: String, default: 'API Integration' },
  configFields: { type: Array, default: () => [] },
  isTesting: { type: Boolean, default: false }
});

const emit = defineEmits(['test', 'save']);

const showConfig = ref(false);
const configValues = ref({});

watch(() => props.configFields, (fields) => {
  const vals = {};
  fields.forEach(f => {
    vals[f.key] = f.defaultValue || '';
  });
  configValues.value = vals;
}, { immediate: true });

const statusClasses = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40';
    case 'degraded':
      return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40';
    case 'disconnected':
    default:
      return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-default';
  }
});

const statusDot = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'bg-emerald-500';
    case 'degraded':
      return 'bg-amber-500';
    case 'disconnected':
    default:
      return 'bg-slate-400';
  }
});

function testConnection() {
  emit('test', props.name);
}
</script>
