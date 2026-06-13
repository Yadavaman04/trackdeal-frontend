<template>
  <AppModal
    :isOpen="isOpen"
    title="Cancel Scheduled Task"
    maxSize="450px"
    @cancel="$emit('close')"
    @confirm="handleConfirm"
  >
    <div class="space-y-3.5 text-xs">
      <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-red-800 dark:text-red-400">
        <p class="text-[10px] leading-relaxed">
          Please provide a valid cancellation reason. Cancelling this task will void all scheduled reminders and log the cancellation audit.
        </p>
      </div>

      <!-- Cancellation Reason -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason for Cancellation *</label>
        <textarea 
          v-model="cancellationReason" 
          rows="3"
          placeholder="e.g. Lead requested no phone outreach anymore / deal closed lost..."
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.8 outline-none focus:border-primary resize-none text-slate-800"
        ></textarea>
        <span v-if="cancellationReason.trim().length > 0 && cancellationReason.trim().length < 3" class="text-[9px] text-red-500 mt-1 block">
          Reason must contain at least 3 characters.
        </span>
      </div>
    </div>

    <template #footer>
      <button 
        @click="$emit('close')" 
        class="btn-md btn-secondary"
      >
        Cancel
      </button>
      <button 
        @click="handleConfirm"
        :disabled="isPending || cancellationReason.trim().length < 3"
        class="btn-md btn-danger min-w-[90px]"
      >
        <span v-if="isPending">Cancelling...</span>
        <span v-else>Confirm Cancel</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import AppModal from '@/components/AppModal.vue';
import { useCancelTaskMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  task: { type: Object, default: null }
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const cancellationReason = ref('');

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    cancellationReason.value = '';
  }
});

const { mutateAsync: cancelTask, isPending } = useCancelTaskMutation();

const handleConfirm = async () => {
  if (!props.task || cancellationReason.value.trim().length < 3) return;
  const taskId = props.task._id || props.task.id;

  try {
    await cancelTask({
      id: taskId,
      cancellationReason: cancellationReason.value
    });
    
    store.dispatch('notifications/triggerToast', {
      message: 'Task cancelled successfully.',
      type: 'success'
    });
    
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to cancel task.',
      type: 'error'
    });
  }
};
</script>
