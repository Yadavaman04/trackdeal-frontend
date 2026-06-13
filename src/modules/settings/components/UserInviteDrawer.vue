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

      <!-- Official Email -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Official Email Address *</label>
        <input
          v-model="email"
          type="email"
          placeholder="e.g. john.doe@company.com"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800"
          :class="errors.email ? 'border-red-500' : 'border-default'"
        />
        <p class="text-[9px] text-slate-400 mt-1">Please enter organization domain email only (personal domains like gmail, yahoo, outlook are blocked).</p>
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
          <option v-for="r in roles" :key="r.id" :value="r.id">
            {{ r.name }}
          </option>
        </select>
        <span v-if="errors.role" class="text-[9px] text-red-500 mt-1 block">{{ errors.role }}</span>
      </div>

      <!-- Primary Branch Selector -->
      <div v-if="isEnterprise">
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Primary Branch Selector *</label>
        <select
          v-model="branch"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800"
          :class="errors.branch ? 'border-red-500' : 'border-default'"
        >
          <option value="" disabled selected>Select Primary Branch</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">
            {{ b.name }} ({{ b.code }})
          </option>
        </select>
        <span v-if="errors.branch" class="text-[9px] text-red-500 mt-1 block">{{ errors.branch }}</span>
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
  branches: { type: Array, required: true }
});
 
const emit = defineEmits(['close', 'success']);
const store = useStore();
const isEnterprise = computed(() => store.getters['organization/isEnterpriseAgency']);
 
const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'zoho.com', 'yandex.com', 'mail.com'];
 
const schema = computed(() => toTypedSchema(
  zod.object({
    name: zod.string().min(2, 'Name must contain at least 2 characters').max(100),
    email: zod.string()
      .email('Invalid email address')
      .superRefine((val, ctx) => {
        const domain = val.split('@')[1]?.toLowerCase();
        if (domain && personalDomains.includes(domain)) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: 'Official organization email is required (no personal domains like gmail/yahoo allowed)'
          });
        }
      }),
    role: zod.string().min(1, 'Role selection is required'),
    branch: isEnterprise.value
      ? zod.string().min(1, 'Branch selection is required')
      : zod.string().optional()
  })
));
 
const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    email: '',
    role: '',
    branch: ''
  }
});

const { value: name } = useField('name');
const { value: email } = useField('email');
const { value: role } = useField('role');
const { value: branch } = useField('branch');

const { mutateAsync: inviteUser, isPending } = useInviteUserMutation();

const onSubmit = handleSubmit(async (values) => {
  try {
    await inviteUser(values);
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
