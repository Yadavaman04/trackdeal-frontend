<template>
  <AppDrawer
    :isOpen="isOpen"
    title="Invite New User"
    width="480px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-5 text-xs">
      <!-- Full Name -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name *</label>
        <input
          v-model="name"
          type="text"
          placeholder="e.g. John Doe"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800"
          :class="errors.name ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.name" class="text-[9px] text-red-500 mt-1 block">{{ errors.name }}</span>
      </div>

      <!-- Official Email Address -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Official Email Address *</label>
        <input
          v-model="email"
          type="email"
          placeholder="e.g. name@company.com or name@gmail.com"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800"
          :class="errors.email ? 'border-red-500' : 'border-default'"
        />
        <p class="text-[9px] text-slate-400 mt-1">Official or personal email address (Gmail, Outlook, Yahoo, etc.).</p>
        <span v-if="errors.email" class="text-[9px] text-red-500 mt-1 block font-semibold">{{ errors.email }}</span>
      </div>

      <!-- Role Selector -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role Selector *</label>
        <select
          v-model="role"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800"
          :class="errors.role ? 'border-red-500' : 'border-default'"
        >
          <option value="" disabled selected>Select Access Role</option>
          <option v-for="r in roles" :key="r.id || r._id" :value="r.id || r._id">
            {{ roleDisplayName(r) }}
          </option>
        </select>
        <span v-if="errors.role" class="text-[9px] text-red-500 mt-1 block">{{ errors.role }}</span>
      </div>
    </form>

    <template #footer>
      <button
        @click="$emit('close')"
        class="btn-md btn-secondary"
      >
        Cancel
      </button>
      <button
        @click="onSubmit"
        :disabled="isPending"
        class="btn-md btn-primary"
      >
        <span v-if="isPending">Inviting...</span>
        <span v-else>Invite User</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import { useInviteUserMutation } from '../queries';
import AppDrawer from '@/components/AppDrawer.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  roles: { type: Array, required: true },
  branches: { type: Array, default: () => [] }
});
 
const emit = defineEmits(['close', 'success']);
const store = useStore();
const isEducationWorkspace = computed(
  () => store.getters['organization/isEducationTenant']
);

// Keep the stored role code unchanged; education teams simply use the more
// natural “Staff” vocabulary in the invitation experience.
function roleDisplayName(roleOption) {
  const name = roleOption?.name || roleOption?.code || '';
  return isEducationWorkspace.value ? name.replace(/agent/gi, 'Staff') : name;
}
 
const schema = computed(() => toTypedSchema(
  zod.object({
    name: zod.string().min(2, 'Name must contain at least 2 characters').max(100),
    email: zod.string().min(1, 'Email address is required').email('Invalid email address'),
    role: zod.string().min(1, 'Role selection is required')
  })
));
 
const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    email: '',
    role: ''
  }
});

const { value: name } = useField('name');
const { value: email } = useField('email');
const { value: role } = useField('role');

const { mutateAsync: inviteUser, isPending } = useInviteUserMutation();

const onSubmit = handleSubmit(async (values) => {
  try {
    await inviteUser({
      name: values.name,
      email: values.email,
      role: values.role
    });
    store.dispatch('notifications/triggerToast', {
      message: `Invitation successfully enqueued for ${values.name} (${values.email}).`,
      type: 'success'
    });
    resetForm();
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to dispatch user invitation.',
      type: 'error'
    });
  }
});
</script>

