<template>
  <AppModal
    :isOpen="isOpen"
    title="Log Task Outreach Completion"
    maxSize="500px"
    @cancel="$emit('close')"
    @confirm="handleConfirm"
  >
    <div class="space-y-3.5 text-xs">
      <div class="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 rounded-xl p-3 text-emerald-800 dark:text-emerald-400">
        <p class="text-[10px] leading-relaxed">
          Provide outreach outcome details. Completing this task will automatically create a narrative log in the activities history feed and void future alerts.
        </p>
      </div>

      <!-- Outcome Summary -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Interaction Outcome *</label>
        <input 
          v-model="outcome" 
          type="text" 
          placeholder="e.g. Connected, client agreed to site visit next Sunday"
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.8 outline-none focus:border-primary text-slate-800"
        />
      </div>

      <!-- Narrative Notes -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Detailed Conversation Notes</label>
        <textarea 
          v-model="notes" 
          rows="3"
          placeholder="Summary logs of the call or meeting narrative details..."
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.8 outline-none focus:border-primary resize-none text-slate-800"
        ></textarea>
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
        :disabled="isPending || !outcome.trim()"
        class="btn-md btn-success min-w-[100px]"
      >
        <span v-if="isPending">Completing...</span>
        <span v-else>Confirm Complete</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import AppModal from '@/components/AppModal.vue';
import { useCompleteTaskMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  task: { type: Object, default: null }
});

const emit = defineEmits(['close', 'success']);

const store = useStore();

const outcome = ref('');
const notes = ref('');

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    outcome.value = '';
    notes.value = '';
  }
});

const { mutateAsync: completeTask, isPending } = useCompleteTaskMutation();

const handleConfirm = async () => {
  if (!props.task || !outcome.value.trim()) return;
  const taskId = props.task._id || props.task.id;

  try {
    await completeTask({
      id: taskId,
      outcome: outcome.value,
      notes: notes.value || undefined
    });
    
    store.dispatch('notifications/triggerToast', {
      message: 'Task completed and activity narrative logged.',
      type: 'success'
    });
    
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to complete task.',
      type: 'error'
    });
  }
};
</script>
