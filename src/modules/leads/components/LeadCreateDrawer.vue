<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Create New Lead" 
    width="520px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs">
      <!-- Live Duplicate Detection Warnings -->
      <DuplicateDetectionPanel 
        :firstName="firstName"
        :lastName="lastName"
        :mobile="mobile"
        :email="email"
        @merge="handleMerge"
      />

      <!-- Basic Profile Fields -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">First Name *</label>
          <input 
            v-model="firstName" 
            type="text" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.firstName ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.firstName" class="text-[9px] text-red-500 mt-1 block">{{ errors.firstName }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Last Name</label>
          <input 
            v-model="lastName" 
            type="text" 
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile *</label>
          <input 
            v-model="mobile" 
            type="text" 
            placeholder="e.g. 9876543210"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.mobile ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.mobile" class="text-[9px] text-red-500 mt-1 block">{{ errors.mobile }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="name@example.com"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.email ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.email" class="text-[9px] text-red-500 mt-1 block">{{ errors.email }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Source *</label>
          <select 
            v-model="source" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.source ? 'border-red-500' : 'border-default'"
          >
            <option value="">Select Lead Source</option>
            <option value="website">Website Portal</option>
            <option value="magicbricks">MagicBricks</option>
            <option value="99acres">99acres</option>
            <option value="housing">Housing.com</option>
            <option value="whatsapp">WhatsApp Outreach</option>
            <option value="referral">Referral Code</option>
            <option value="walk_in">Walk-in Inquiry</option>
            <option value="manual_entry">Manual Entry</option>
          </select>
          <span v-if="errors.source" class="text-[9px] text-red-500 mt-1 block">{{ errors.source }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alternative Mobile</label>
          <input 
            v-model="alternativeMobile" 
            type="text" 
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>
      </div>

      <!-- Requirements Section header -->
      <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-default pt-2 pb-1">
        Lead Requirements
      </h4>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Property Types</label>
          <div class="flex flex-wrap gap-2 mt-1">
            <label v-for="t in ['apartment', 'villa', 'plot', 'commercial', 'office']" :key="t" class="flex items-center space-x-1.5">
              <input type="checkbox" :value="t" v-model="propertyTypes" class="rounded border-default text-primary focus:ring-primary" />
              <span class="capitalize text-[10px]">{{ t }}</span>
            </label>
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">BHK Requirement</label>
          <div class="flex flex-wrap gap-2.5 mt-1">
            <label v-for="b in [1, 2, 3, 4, 5]" :key="b" class="flex items-center space-x-1">
              <input type="checkbox" :value="b" v-model="bhkTypes" class="rounded border-default text-primary focus:ring-primary" />
              <span class="text-[10px]">{{ b }} BHK</span>
            </label>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Min Budget (INR)</label>
          <input 
            v-model.number="budgetMin" 
            type="number" 
            placeholder="Min Budget"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Max Budget (INR)</label>
          <input 
            v-model.number="budgetMax" 
            type="number" 
            placeholder="Max Budget"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Locations (Comma Separated)</label>
        <input 
          v-model="locations" 
          type="text" 
          placeholder="e.g. Bandra, Andheri"
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
        />
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Requirements Notes</label>
        <textarea 
          v-model="reqNotes" 
          rows="2"
          placeholder="Additional detail parameters..."
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"
        ></textarea>
      </div>

      <!-- Assignee / Branch selectors (Roles conditional) -->
      <div v-if="showAdminFields" class="grid grid-cols-2 gap-3 border-t border-default pt-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Branch Office</label>
          <select 
            v-model="branchId" 
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          >
            <option value="">Select Branch</option>
            <option v-for="b in branchesList" :key="b.id || b._id" :value="b.id || b._id">
              {{ b.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To Agent</label>
          <select 
            v-model="assignedTo" 
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          >
            <option value="">Select Agent</option>
            <option v-for="u in agentsList" :key="u.id || u._id" :value="u.id || u._id">
              {{ u.name }}
            </option>
          </select>
        </div>
      </div>
    </form>

    <template #footer>
      <button 
        @click="$emit('close')" 
        class="px-4 py-2 border border-default rounded-lg hover:bg-slate-50 font-semibold"
      >
        Cancel
      </button>
      <button 
        @click="onSubmit"
        :disabled="isPending"
        class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:bg-slate-300 font-semibold flex items-center justify-center min-w-[70px]"
      >
        <span v-if="isPending">Saving...</span>
        <span v-else>Save Lead</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import AppDrawer from '@/components/AppDrawer.vue';
import DuplicateDetectionPanel from './DuplicateDetectionPanel.vue';
import { useCreateLeadMutation } from '../queries';
import { useBranchesQuery, useUsersQuery } from '@/modules/settings/queries';

const { data: branchesData } = useBranchesQuery();
const { data: usersData } = useUsersQuery();

const branchesList = computed(() => {
  const data = branchesData.value?.data || branchesData.value;
  return Array.isArray(data) ? data : [];
});

const agentsList = computed(() => {
  const data = usersData.value?.data || usersData.value;
  return Array.isArray(data) ? data.filter(u => u.active) : [];
});

defineProps({
  isOpen: { type: Boolean, required: true }
});

const emit = defineEmits(['close', 'success', 'merge']);

const store = useStore();
const userRole = computed(() => store.getters['auth/userRole'] || 'agent');
const showAdminFields = computed(() => ['super_admin', 'org_admin', 'branch_manager'].includes(userRole.value));

// Validation Schema
const schema = toTypedSchema(
  zod.object({
    firstName: zod.string().min(2, 'First Name must contain at least 2 characters').max(50),
    mobile: zod.string().regex(/^[0-9+ -]{5,20}$/, 'Invalid mobile format'),
    email: zod.string().email('Invalid email address').optional().or(zod.literal('')),
    source: zod.string().min(1, 'Lead source is required')
  })
);

const { errors, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    firstName: '',
    mobile: '',
    email: '',
    source: ''
  }
});

const { value: firstName } = useField('firstName');
const lastName = ref('');
const { value: mobile } = useField('mobile');
const { value: email } = useField('email');
const { value: source } = useField('source');
const alternativeMobile = ref('');
const propertyTypes = ref([]);
const bhkTypes = ref([]);
const budgetMin = ref(null);
const budgetMax = ref(null);
const locations = ref('');
const reqNotes = ref('');
const branchId = ref('');
const assignedTo = ref('');

const { mutateAsync: createLead, isPending } = useCreateLeadMutation();

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    ...values,
    lastName: lastName.value,
    alternativeMobile: alternativeMobile.value,
    branchId: branchId.value || undefined,
    assignedTo: assignedTo.value || undefined,
    requirements: {
      propertyType: propertyTypes.value,
      bhk: bhkTypes.value,
      budget: (budgetMin.value || budgetMax.value) ? {
        min: budgetMin.value || 0,
        max: budgetMax.value || 999999999,
        currency: 'INR'
      } : undefined,
      locations: locations.value ? locations.value.split(',').map(l => l.trim()) : [],
      notes: reqNotes.value
    }
  };

  try {
    await createLead(payload);
    store.dispatch('notifications/triggerToast', {
      message: 'Lead profile captured successfully.',
      type: 'success'
    });
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to create lead profile.',
      type: 'error'
    });
  }
});

const handleMerge = (duplicateLead) => {
  const mockLeadA = {
    firstName: firstName.value,
    lastName: lastName.value,
    mobile: mobile.value,
    email: email.value,
    source: source.value,
    requirements: {
      propertyType: propertyTypes.value,
      bhk: bhkTypes.value,
      budget: (budgetMin.value || budgetMax.value) ? {
        min: budgetMin.value || 0,
        max: budgetMax.value || 999999999,
        currency: 'INR'
      } : undefined,
      locations: locations.value ? locations.value.split(',').map(l => l.trim()) : [],
      notes: reqNotes.value
    }
  };
  emit('merge', { leadA: mockLeadA, leadB: duplicateLead });
};
</script>
