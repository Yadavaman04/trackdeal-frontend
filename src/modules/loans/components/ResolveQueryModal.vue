<template>
  <Teleport to="body">
    <Transition name="drawer-slide">
      <div v-if="isOpen" class="fixed inset-0 z-[1000] flex justify-end overflow-hidden" style="background-color: rgba(9, 14, 26, 0.6); backdrop-filter: blur(3px);" @click.self="$emit('close')">
        <div class="bg-surface border-l border-default w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden text-xs">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-default flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-950/20 shrink-0">
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
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4 flex-1 overflow-y-auto">
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
</Transition>
</Teleport>
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

<style scoped>
.drawer-slide-enter-active { transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-slide-leave-active { transition: transform 180ms cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }
</style>
