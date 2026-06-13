<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Request Hold Extension" 
    width="480px"
    @close="$emit('close')"
  >
    <div class="space-y-4 text-xs">
      <div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 p-3 rounded-lg text-[10px] text-amber-800 dark:text-amber-450 leading-relaxed">
        💡 **Extension Policy Limit**: Holds can be extended by a maximum of 24 hours at a time. All extension records are logged in the audit history timeline.
      </div>

      <!-- Add Hours -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Extension Duration *</label>
        <select 
          v-model.number="hours" 
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary font-medium"
        >
          <option :value="12">12 Hours Extension</option>
          <option :value="24">24 Hours Extension</option>
          <option :value="48">48 Hours Extension (Requires Admin)</option>
        </select>
      </div>

      <!-- Justification reason -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason for Extension *</label>
        <textarea 
          v-model="reason" 
          rows="3"
          placeholder="Specify why the client needs more hold time (e.g. Waiting for token transfer bank verification)..."
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"
        ></textarea>
        <span v-if="error" class="text-[9px] text-red-500 mt-1 block">{{ error }}</span>
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
        @click="onSubmit"
        :disabled="isPending || !reason.trim()"
        class="btn-md btn-primary"
      >
        Extend Hold
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api/client';
import AppDrawer from '@/components/AppDrawer.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  property: { type: Object, default: null }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const hours = ref(24);
const reason = ref('');
const error = ref('');
const isPending = ref(false);

const onSubmit = async () => {
  if (!reason.value.trim()) {
    error.value = 'Reason is required';
    return;
  }

  isPending.value = true;
  error.value = '';
  const propId = props.property._id || props.property.id;
  const isUnit = !!props.property.unitNumber;

  try {
    if (isUnit) {
      // Mock API call or extend route if present
      await apiClient.post(`/projects/units/${propId}/block`, {
        reason: `Extended Reservation: ${reason.value}`,
        lockedUntil: new Date(Date.now() + hours.value * 60 * 60 * 1000).toISOString()
      });
    } else {
      // Independent property listing
      await apiClient.post(`/properties/${propId}/extend`, {
        hours: hours.value,
        reason: reason.value
      });
    }

    store.dispatch('notifications/triggerToast', {
      message: 'Hold lock successfully extended.',
      type: 'success'
    });

    reason.value = '';
    emit('success');
    emit('close');
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: err.response?.data?.message || 'Failed to extend hold lock.',
      type: 'error'
    });
  } finally {
    isPending.value = false;
  }
};
</script>
