<template>
  <Teleport to="body">
    <Transition name="drawer-slide">
      <div
        v-if="open"
        class="fixed inset-0 z-[1000] flex justify-end overflow-hidden"
        style="background-color: rgba(9, 14, 26, 0.6); backdrop-filter: blur(3px);"
        @click.self="close"
      >
        <div
          class="w-full max-w-md h-full border-l shadow-2xl overflow-hidden flex flex-col transition-all duration-150"
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
                + Add Seller Entity Owner
              </h3>
              <p class="text-micro" style="color: hsl(var(--neutral-400));">
                Create new property owner or seller contact
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
        <form @submit.prevent="handleSubmit" class="p-5 space-y-3.5 flex-1 overflow-y-auto">
          <!-- Error alert -->
          <div
            v-if="errorMessage"
            class="p-3 rounded-lg text-caption font-medium border flex items-center gap-2"
            style="background-color: hsl(var(--danger-50)); color: hsl(var(--danger-700)); border-color: hsl(var(--danger-200));"
          >
            <PhWarningCircle :size="16" class="shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- First Name & Last Name -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                First Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.firstName"
                type="text"
                placeholder="e.g. Ramesh"
                class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                :class="errors.firstName ? 'border-red-500' : ''"
                style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
              />
              <p v-if="errors.firstName" class="text-micro text-red-500 mt-1">{{ errors.firstName }}</p>
            </div>

            <div>
              <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                Last Name
              </label>
              <input
                v-model="form.lastName"
                type="text"
                placeholder="e.g. Mehta"
                class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
              />
            </div>
          </div>

          <!-- Mobile Number -->
          <div>
            <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
              Mobile Phone Number <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.mobile"
              type="text"
              placeholder="e.g. 9820098200"
              class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
              :class="errors.mobile ? 'border-red-500' : ''"
              style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
            />
            <p v-if="errors.mobile" class="text-micro text-red-500 mt-1">{{ errors.mobile }}</p>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
              Email Address
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="ramesh@mehtarealty.com"
              class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
              style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
            />
          </div>

          <!-- City -->
          <div>
            <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
              City / Location
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
              :disabled="isSubmitting"
              class="px-4 h-9 rounded-md text-caption font-medium text-white transition-opacity flex items-center gap-1.5"
              style="background-color: hsl(var(--accent-600));"
            >
              <PhCircleNotch v-if="isSubmitting" class="animate-spin" :size="14" />
              <span>Save & Select Seller</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</Teleport>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { PhUserPlus, PhX, PhWarningCircle, PhCircleNotch } from '@phosphor-icons/vue';
import apiClient from '@/api/client';

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'created']);

const isSubmitting = ref(false);
const errorMessage = ref('');

const form = reactive({
  firstName: '',
  lastName: '',
  mobile: '',
  email: '',
  city: 'Mumbai',
});

const errors = reactive({
  firstName: '',
  mobile: '',
});

const validate = () => {
  errors.firstName = '';
  errors.mobile = '';
  let valid = true;

  if (!form.firstName.trim()) {
    errors.firstName = 'First Name is mandatory';
    valid = false;
  }

  if (!form.mobile.trim()) {
    errors.mobile = 'Mobile Number is mandatory';
    valid = false;
  } else if (!/^[0-9+ -]{5,20}$/.test(form.mobile.trim())) {
    errors.mobile = 'Invalid mobile number format';
    valid = false;
  }

  return valid;
};

const handleSubmit = async () => {
  errorMessage.value = '';
  if (!validate()) return;

  isSubmitting.value = true;
  try {
    const payload = {
      firstName: form.firstName.trim(),
      ...(form.lastName.trim() ? { lastName: form.lastName.trim() } : {}),
      mobile: form.mobile.trim(),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      address: {
        city: form.city.trim() || 'Mumbai',
      },
    };

    const res = await apiClient.post('/sellers', payload);
    const newSeller = res.data?.data || res.data;
    emit('created', newSeller);
    close();
  } catch (err) {
    errorMessage.value = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to create seller';
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  form.firstName = '';
  form.lastName = '';
  form.mobile = '';
  form.email = '';
  errorMessage.value = '';
  emit('close');
};
</script>

<style scoped>
.drawer-slide-enter-active { transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-slide-leave-active { transition: transform 180ms cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }
</style>
