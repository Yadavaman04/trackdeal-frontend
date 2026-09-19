<template>
  <Teleport to="body">
    <Transition name="drawer-slide">
      <div v-if="isOpen" class="fixed inset-0 z-[1000] flex justify-end overflow-hidden" style="background-color: rgba(9, 14, 26, 0.6); backdrop-filter: blur(3px);" @click.self="$emit('close')">
        <div class="bg-surface border-l border-default w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden text-xs">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-default flex items-center justify-between bg-amber-500/10 dark:bg-amber-950/20 shrink-0">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PhQuestion :size="22" class="text-amber-600" weight="duotone" />
                Log Bank / Credit Query
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Track queries raised by the bank credit team</p>
            </div>
            <button @click="$emit('close')" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <PhX :size="18" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4 flex-1 overflow-y-auto">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name *</label>
            <input v-model="form.bankName" required type="text" placeholder="e.g. HDFC Bank" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Query Date *</label>
            <input v-model="form.queryDate" required type="date" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Raised By (Designation / Person)</label>
          <input v-model="form.queryRaisedBy" type="text" placeholder="e.g. Senior Credit Manager, CPA Team" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Query Details *</label>
          <textarea v-model="form.queryDetails" required rows="3" placeholder="Describe the bank query, discrepancy, or clarification needed..." class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Document / Proof</label>
            <input v-model="form.requiredDocument" type="text" placeholder="e.g. Form 26AS / Rent Agreement" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resolution Due Date</label>
            <input v-model="form.dueDate" type="date" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-default flex items-center justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-2">
            <PhCircleNotch v-if="loading" class="animate-spin" :size="16" />
            Raise Query
          </button>
        </div>
      </form>
    </div>
  </div>
</Transition>
</Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { PhQuestion, PhX, PhCircleNotch } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: Boolean,
  loanCase: Object,
  loading: Boolean,
});

const emit = defineEmits(['close', 'submit']);

const form = reactive({
  bankName: '',
  queryDate: new Date().toISOString().slice(0, 10),
  queryRaisedBy: '',
  queryDetails: '',
  requiredDocument: '',
  dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
});

watch(
  () => props.loanCase,
  (val) => {
    if (val) {
      form.bankName = val.preferredBank || val.applications?.[0]?.bankName || '';
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>

<style scoped>
.drawer-slide-enter-active { transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-slide-leave-active { transition: transform 180ms cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }
</style>
