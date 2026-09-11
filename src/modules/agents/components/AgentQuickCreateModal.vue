<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background-color: rgba(9, 14, 26, 0.65); backdrop-filter: blur(4px);"
      @click.self="close"
    >
      <div
        class="w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-150"
        style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style="border-color: hsl(var(--neutral-100));"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style="background-color: hsl(var(--accent-600));"
            >
              <PhUserPlus :size="18" weight="bold" />
            </div>
            <div>
              <h3 class="font-semibold text-body" style="color: hsl(var(--neutral-900));">
                + Create New Agent / Channel Partner
              </h3>
              <p class="text-micro" style="color: hsl(var(--neutral-400));">
                Add master channel partner to transfer leads immediately
              </p>
            </div>
          </div>
          <button
            @click="close"
            class="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
            style="color: hsl(var(--neutral-400));"
          >
            <PhX :size="16" />
          </button>
        </div>

        <!-- Body Form -->
        <form @submit.prevent="handleSubmit" class="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <!-- Error alert -->
          <div
            v-if="errorMessage"
            class="p-3 rounded-lg text-caption font-medium border flex items-center gap-2"
            style="background-color: hsl(var(--danger-50)); color: hsl(var(--danger-700)); border-color: hsl(var(--danger-200));"
          >
            <PhWarningCircle :size="16" class="shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Agent Name -->
          <div>
            <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
              Agent / Contact Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Rajesh Kumar"
              class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
              :class="errors.name ? 'border-red-500' : ''"
              style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
            />
            <p v-if="errors.name" class="text-micro text-red-500 mt-1">{{ errors.name }}</p>
          </div>

          <!-- Office / Company Name -->
          <div>
            <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
              Office / Agency Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.officeName"
              type="text"
              placeholder="e.g. Apex Realty Solutions"
              class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
              :class="errors.officeName ? 'border-red-500' : ''"
              style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
            />
            <p v-if="errors.officeName" class="text-micro text-red-500 mt-1">{{ errors.officeName }}</p>
          </div>

          <!-- Grid: Phone & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                Phone Number <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.phone"
                type="text"
                placeholder="e.g. 9820098200"
                class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                :class="errors.phone ? 'border-red-500' : ''"
                style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
              />
              <p v-if="errors.phone" class="text-micro text-red-500 mt-1">{{ errors.phone }}</p>
            </div>

            <div>
              <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                Email Address
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="rajesh@apexrealty.in"
                class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                :class="errors.email ? 'border-red-500' : ''"
                style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
              />
              <p v-if="errors.email" class="text-micro text-red-500 mt-1">{{ errors.email }}</p>
            </div>
          </div>

          <!-- Grid: Agent Type & RERA -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                Agent Type
              </label>
              <select
                v-model="form.agentType"
                class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
              >
                <option value="channel_partner">Channel Partner</option>
                <option value="individual">Individual Broker</option>
                <option value="company">Real Estate Agency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                RERA Number
              </label>
              <input
                v-model="form.reraNumber"
                type="text"
                placeholder="A51800012345"
                class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
              />
            </div>
          </div>

          <!-- Address -->
          <div>
            <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
              Office Address <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.address"
              type="text"
              placeholder="e.g. Suite 404, Trade Tower, BKC"
              class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
              :class="errors.address ? 'border-red-500' : ''"
              style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
            />
            <p v-if="errors.address" class="text-micro text-red-500 mt-1">{{ errors.address }}</p>
          </div>

          <!-- City -->
          <div>
            <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
              City
            </label>
            <input
              v-model="form.city"
              type="text"
              placeholder="e.g. Mumbai"
              class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
              style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t shrink-0" style="border-color: hsl(var(--neutral-100));">
            <button
              type="button"
              @click="close"
              class="px-4 h-9 rounded-md border text-caption font-medium transition-colors"
              style="border-color: hsl(var(--neutral-200)); color: hsl(var(--neutral-600));"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="createMutation.isPending.value"
              class="px-4 h-9 rounded-md text-caption font-medium text-white transition-opacity flex items-center gap-1.5"
              style="background-color: hsl(var(--accent-600));"
            >
              <PhCircleNotch v-if="createMutation.isPending.value" class="animate-spin" :size="14" />
              <span>Save & Select Agent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { PhUserPlus, PhX, PhWarningCircle, PhCircleNotch } from '@phosphor-icons/vue';
import { useCreateAgentMutation } from '../queries';

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'created']);

const createMutation = useCreateAgentMutation();
const errorMessage = ref('');

const form = reactive({
  name: '',
  officeName: '',
  phone: '',
  email: '',
  agentType: 'channel_partner',
  reraNumber: '',
  address: '',
  city: 'Mumbai',
});

const errors = reactive({
  name: '',
  officeName: '',
  phone: '',
  email: '',
  address: '',
});

const validate = () => {
  errors.name = '';
  errors.officeName = '';
  errors.phone = '';
  errors.email = '';
  errors.address = '';
  let valid = true;

  if (!form.name.trim()) {
    errors.name = 'Agent Name is mandatory';
    valid = false;
  }
  if (!form.officeName.trim()) {
    errors.officeName = 'Office Name is mandatory';
    valid = false;
  }
  if (!form.phone.trim()) {
    errors.phone = 'Phone Number is mandatory';
    valid = false;
  } else if (!/^[0-9+ -]{5,20}$/.test(form.phone.trim())) {
    errors.phone = 'Invalid phone number format';
    valid = false;
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Invalid email address';
    valid = false;
  }
  if (!form.address.trim()) {
    errors.address = 'Address is mandatory';
    valid = false;
  }

  return valid;
};

const handleSubmit = async () => {
  errorMessage.value = '';
  if (!validate()) return;

  try {
    const payload = {
      name: form.name.trim(),
      officeName: form.officeName.trim(),
      phone: form.phone.trim(),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      agentType: form.agentType,
      ...(form.reraNumber.trim() ? { reraNumber: form.reraNumber.trim() } : {}),
      address: form.address.trim(),
      ...(form.city.trim() ? { city: form.city.trim() } : {}),
    };

    const res = await createMutation.mutateAsync(payload);
    const newAgent = res.data;
    emit('created', newAgent);
    close();
  } catch (err) {
    errorMessage.value = err.response?.data?.error?.message || err.message || 'Failed to create agent';
  }
};

const close = () => {
  form.name = '';
  form.officeName = '';
  form.phone = '';
  form.email = '';
  form.reraNumber = '';
  form.address = '';
  errorMessage.value = '';
  emit('close');
};
</script>
