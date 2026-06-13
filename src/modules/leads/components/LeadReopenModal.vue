<template>
  <AppModal
    :isOpen="isOpen"
    title="Reopen Lost Lead"
    maxSize="420px"
    @cancel="$emit('close')"
    @confirm="handleConfirm"
  >
    <div class="space-y-3 text-xs">
      <div class="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-3 text-indigo-800 dark:text-indigo-400">
        <p class="text-[11px] leading-relaxed">
          You are reopening this lead. Reopening will transition the status from <b>Lost</b> back to the active <b>Contacted</b> stage.
        </p>
      </div>
      <p class="text-slate-600 dark:text-slate-400">
        Are you sure you want to restore this lead profile to the sales pipeline?
      </p>
    </div>

    <!-- Actions slot overriding standard modal buttons to show loading state -->
    <template #footer>
      <button 
        @click="$emit('close')" 
        class="px-3.5 py-2 border border-default text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
      >
        Cancel
      </button>
      <button 
        @click="handleConfirm"
        :disabled="isPending"
        class="px-3.5 py-2 text-xs font-semibold text-white bg-primary rounded-lg disabled:bg-slate-350 transition-colors flex items-center justify-center min-w-[90px]"
      >
        <span v-if="isPending">Reopening...</span>
        <span v-else>Reopen Lead</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { useStore } from 'vuex';
import AppModal from '@/components/AppModal.vue';
import { useReopenLeadMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  leadId: { type: String, required: true }
});

const emit = defineEmits(['close', 'success']);

const store = useStore();

const { mutateAsync: reopenLead, isPending } = useReopenLeadMutation();

const handleConfirm = async () => {
  try {
    await reopenLead(props.leadId);

    store.dispatch('notifications/triggerToast', {
      message: 'Lead profile successfully reopened.',
      type: 'success'
    });
    
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to reopen lead.',
      type: 'error'
    });
  }
};
</script>
