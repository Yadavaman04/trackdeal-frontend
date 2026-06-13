<template>
  <AppModal
    :isOpen="isOpen"
    title="Clone Role Profile"
    maxSize="450px"
    @cancel="$emit('close')"
  >
    <div class="space-y-4">
      <div v-if="sourceRole" class="text-xs bg-slate-50 border border-default p-3 rounded-lg text-slate-650">
        Source Profile: <strong class="text-slate-805">{{ sourceRole.name }}</strong>
      </div>

      <div class="space-y-1">
        <label class="block text-[10px] font-bold text-slate-500 uppercase">New Custom Role Name *</label>
        <input
          v-model="newRoleName"
          type="text"
          placeholder="e.g. Senior Sales Consultant"
          class="w-full bg-surface border border-default rounded-lg px-3 py-2 text-xs outline-none focus:border-primary text-slate-805"
          :class="error ? 'border-red-500' : 'border-default'"
          @input="error = ''"
        />
        <span v-if="error" class="text-[9px] text-red-500 block font-semibold">{{ error }}</span>
      </div>

      <p class="text-[10px] text-slate-450 leading-relaxed">
        This operation copies the entire Create, Read, Update, Delete permission matrix configuration of the source profile into a fresh editable custom role.
      </p>
    </div>

    <template #footer>
      <button
        @click="$emit('close')"
        class="btn-md btn-secondary"
        :disabled="isPending"
      >
        Cancel
      </button>
      <button
        @click="onClone"
        class="btn-md btn-primary gap-1.5"
        :disabled="isPending || !newRoleName.trim()"
      >
        <PhCopy :size="14" />
        <span v-if="isPending">Cloning...</span>
        <span v-else>Clone Role</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import { PhCopy } from '@phosphor-icons/vue';
import { useCloneRoleMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  sourceRole: { type: Object, default: null }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const newRoleName = ref('');
const error = ref('');

watch(() => props.isOpen, (open) => {
  if (open) {
    newRoleName.value = '';
    error.value = '';
  }
});

const { mutateAsync: cloneRole, isPending } = useCloneRoleMutation();

async function onClone() {
  if (!newRoleName.value.trim()) {
    error.value = 'New role name is required';
    return;
  }

  try {
    await cloneRole({
      id: props.sourceRole.id,
      name: newRoleName.value.trim()
    });
    store.dispatch('notifications/triggerToast', {
      message: `Role profile successfully cloned into "${newRoleName.value.trim()}".`,
      type: 'success'
    });
    emit('success');
    emit('close');
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: err.response?.data?.message || 'Failed to clone role profile configuration.',
      type: 'error'
    });
  }
}
</script>
