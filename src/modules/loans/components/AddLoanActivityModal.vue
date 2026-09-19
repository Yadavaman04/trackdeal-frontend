<template>
  <Teleport to="body">
    <Transition name="drawer-slide">
      <div v-if="isOpen" class="fixed inset-0 z-[1000] flex justify-end overflow-hidden" style="background-color: rgba(9, 14, 26, 0.6); backdrop-filter: blur(3px);" @click.self="$emit('close')">
        <div class="bg-surface border-l border-default w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden text-xs">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-default flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PhClockCounterClockwise :size="20" class="text-primary-600" weight="duotone" />
                Add Loan Activity / Touchpoint
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Log bank call, customer update, or set a next follow-up</p>
            </div>
            <button @click="$emit('close')" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <PhX :size="18" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4 flex-1 overflow-y-auto">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Activity Type *</label>
            <select v-model="form.activityType" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500">
              <option value="bank_followup">Bank Follow-up Call</option>
              <option value="customer_call">Customer Discussion</option>
              <option value="dsa_followup">DSA Coordination</option>
              <option value="doc_requested">Documents Requested</option>
              <option value="doc_received">Documents Received</option>
              <option value="sanction_discussion">Sanction Terms Discussion</option>
              <option value="disbursement_followup">Disbursement Follow-up</option>
              <option value="note">Internal Note</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
            <input v-model="form.date" required type="date" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Activity Summary / Title</label>
          <input v-model="form.title" type="text" placeholder="e.g. Call with HDFC Credit Underwriter" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Outcome / Conversation Details *</label>
          <textarea v-model="form.description" required rows="3" placeholder="Summary of discussion, bank remarks, next action items..." class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"></textarea>
        </div>

        <!-- Schedule Next Followup -->
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-default space-y-3">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <PhCalendar :size="14" class="text-primary-600" />
            Next Follow-up Schedule (Optional)
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">Follow-up Date</label>
              <input v-model="form.nextFollowupDate" type="date" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">Follow-up Time</label>
              <input v-model="form.nextFollowupTime" type="time" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-default flex items-center justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-2">
            <PhCircleNotch v-if="loading" class="animate-spin" :size="16" />
            Save Activity
          </button>
        </div>
      </form>
    </div>
  </div>
</Transition>
</Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { PhClockCounterClockwise, PhX, PhCalendar, PhCircleNotch } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: Boolean,
  loading: Boolean,
});

const emit = defineEmits(['close', 'submit']);

const form = reactive({
  activityType: 'bank_followup',
  date: new Date().toISOString().slice(0, 10),
  title: '',
  description: '',
  nextFollowupDate: '',
  nextFollowupTime: '',
});

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>

<style scoped>
.drawer-slide-enter-active { transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-slide-leave-active { transition: transform 180ms cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }
</style>
