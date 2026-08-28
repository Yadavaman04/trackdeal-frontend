<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
    <div class="bg-surface border border-default w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-default flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-950/20">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhCheckCircle :size="22" class="text-emerald-600" weight="duotone" />
            Resolve Bank Query
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">Submit resolution explanation and updated documents</p>
        </div>
        <button @click="$emit('close')" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <PhX :size="18" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div v-if="query" class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-default text-xs space-y-1">
          <div class="font-bold text-slate-900 dark:text-white">Query from {{ query.bankName }}:</div>
          <p class="text-slate-600 dark:text-slate-300 italic">"{{ query.queryDetails }}"</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resolution Summary / Action Taken *</label>
          <textarea v-model="resolution" required rows="3" placeholder="e.g. Uploaded revised 6 months salary account bank statements and employer confirmation..." class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"></textarea>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-default flex items-center justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-2">
            <PhCircleNotch v-if="loading" class="animate-spin" :size="16" />
            Mark Query Resolved
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PhCheckCircle, PhX, PhCircleNotch } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: Boolean,
  query: Object,
  loading: Boolean,
});

const emit = defineEmits(['close', 'submit']);

const resolution = ref('');

const handleSubmit = () => {
  emit('submit', { resolution: resolution.value });
  resolution.value = '';
};
</script>
