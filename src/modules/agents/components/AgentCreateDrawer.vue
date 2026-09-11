<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50 overflow-hidden flex justify-end">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 transition-opacity"
          style="background-color: rgba(9, 14, 26, 0.6); backdrop-filter: blur(2px);"
          @click="close"
        ></div>

        <!-- Drawer Panel -->
        <div
          class="relative w-full max-w-xl h-full shadow-2xl flex flex-col z-10 transition-transform duration-200"
          style="background-color: hsl(var(--bg-surface)); border-left: 1px solid hsl(var(--neutral-100));"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b shrink-0"
            style="border-color: hsl(var(--neutral-100));"
          >
            <div>
              <h2 class="font-semibold text-subtitle" style="color: hsl(var(--neutral-900));">
                {{ isEdit ? 'Edit Agent / Channel Partner' : '+ Add Agent / Channel Partner' }}
              </h2>
              <p class="text-caption" style="color: hsl(var(--neutral-400));">
                {{ isEdit ? 'Update channel partner contact & business details' : 'Add new broker or channel partner master to CRM' }}
              </p>
            </div>
            <button
              @click="close"
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style="color: hsl(var(--neutral-400));"
            >
              <PhX :size="18" />
            </button>
          </div>

          <!-- Drawer Form Body -->
          <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Global error alert -->
            <div
              v-if="errorMessage"
              class="p-3.5 rounded-lg text-body-sm font-medium border flex items-center gap-2.5"
              style="background-color: hsl(var(--danger-50)); color: hsl(var(--danger-700)); border-color: hsl(var(--danger-200));"
            >
              <PhWarningCircle :size="18" class="shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- SECTION 1: Basic Information -->
            <div>
              <h3 class="text-caption font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style="color: hsl(var(--accent-600));">
                <PhIdentificationCard :size="16" />
                <span>1. Basic Information</span>
              </h3>

              <div class="space-y-3.5">
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
                    placeholder="e.g. Apex Real Estate Solutions"
                    class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                    :class="errors.officeName ? 'border-red-500' : ''"
                    style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                  />
                  <p v-if="errors.officeName" class="text-micro text-red-500 mt-1">{{ errors.officeName }}</p>
                </div>

                <!-- Grid: Phone & Alt Phone -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      Phone Number <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.phone"
                      type="text"
                      placeholder="9820098200"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      :class="errors.phone ? 'border-red-500' : ''"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                    <p v-if="errors.phone" class="text-micro text-red-500 mt-1">{{ errors.phone }}</p>
                  </div>

                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      Alternate Phone
                    </label>
                    <input
                      v-model="form.alternatePhone"
                      type="text"
                      placeholder="9820098201"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                  </div>
                </div>

                <!-- Email -->
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
            </div>

            <hr style="border-color: hsl(var(--neutral-100));" />

            <!-- SECTION 2: Business & Registration -->
            <div>
              <h3 class="text-caption font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style="color: hsl(var(--accent-600));">
                <PhBriefcase :size="16" />
                <span>2. Business & Registration Information</span>
              </h3>

              <div class="space-y-3.5">
                <!-- Grid: Agent Type & Specialization -->
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
                      <option value="broker">Independent Broker</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      Specialization
                    </label>
                    <select
                      v-model="form.specialization"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="plot">Plot / Land</option>
                      <option value="rental">Rental / Leasing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <!-- Grid: RERA & Registration -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      Registration Number
                    </label>
                    <input
                      v-model="form.registrationNumber"
                      type="text"
                      placeholder="REG-2026-889"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                  </div>
                </div>

                <!-- Grid: GST & PAN -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      GST Number
                    </label>
                    <input
                      v-model="form.gstNumber"
                      type="text"
                      placeholder="27AAACG0000A1Z5"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all uppercase"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                  </div>

                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      PAN Number
                    </label>
                    <input
                      v-model="form.panNumber"
                      type="text"
                      placeholder="ABCDE1234F"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all uppercase"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr style="border-color: hsl(var(--neutral-100));" />

            <!-- SECTION 3: Address Information -->
            <div>
              <h3 class="text-caption font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style="color: hsl(var(--accent-600));">
                <PhMapPin :size="16" />
                <span>3. Address Information</span>
              </h3>

              <div class="space-y-3.5">
                <!-- Address -->
                <div>
                  <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                    Address <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.address"
                    type="text"
                    placeholder="Suite 404, Trade Tower, Bandra Kurla Complex"
                    class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                    :class="errors.address ? 'border-red-500' : ''"
                    style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                  />
                  <p v-if="errors.address" class="text-micro text-red-500 mt-1">{{ errors.address }}</p>
                </div>

                <!-- Grid: City, State, Pincode -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      City
                    </label>
                    <input
                      v-model="form.city"
                      type="text"
                      placeholder="Mumbai"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                  </div>

                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      State
                    </label>
                    <input
                      v-model="form.state"
                      type="text"
                      placeholder="Maharashtra"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                  </div>

                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      Pincode
                    </label>
                    <input
                      v-model="form.pincode"
                      type="text"
                      placeholder="400051"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr style="border-color: hsl(var(--neutral-100));" />

            <!-- SECTION 4: Additional Information -->
            <div>
              <h3 class="text-caption font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style="color: hsl(var(--accent-600));">
                <PhNote :size="16" />
                <span>4. Additional Information & Contact</span>
              </h3>

              <div class="space-y-3.5">
                <!-- Grid: Contact Person & Phone -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      Contact Person Name
                    </label>
                    <input
                      v-model="form.contactPersonName"
                      type="text"
                      placeholder="Suresh Shah"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                  </div>

                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      Contact Person Phone
                    </label>
                    <input
                      v-model="form.contactPersonPhone"
                      type="text"
                      placeholder="9820098202"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                  </div>
                </div>

                <!-- Grid: Website & Status -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      Website URL
                    </label>
                    <input
                      v-model="form.website"
                      type="text"
                      placeholder="https://apexrealty.in"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    />
                  </div>

                  <div>
                    <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                      Status
                    </label>
                    <select
                      v-model="form.status"
                      class="w-full h-9 px-3 rounded-md border text-body-sm outline-none transition-all"
                      style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                    >
                      <option value="active">Active (Available for lead transfer)</option>
                      <option value="inactive">Inactive (Disabled for new transfers)</option>
                    </select>
                  </div>
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-caption font-semibold mb-1" style="color: hsl(var(--neutral-700));">
                    Notes / Remarks
                  </label>
                  <textarea
                    v-model="form.notes"
                    rows="3"
                    placeholder="Enter business terms, commission tier, or channel partner notes..."
                    class="w-full p-3 rounded-md border text-body-sm outline-none transition-all"
                    style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t sticky bottom-0 bg-surface" style="border-color: hsl(var(--neutral-100));">
              <button
                type="button"
                @click="close"
                class="px-5 h-9 rounded-md border text-caption font-medium transition-colors"
                style="border-color: hsl(var(--neutral-200)); color: hsl(var(--neutral-600));"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-5 h-9 rounded-md text-caption font-medium text-white transition-opacity flex items-center gap-2"
                style="background-color: hsl(var(--accent-600));"
              >
                <PhCircleNotch v-if="isSubmitting" class="animate-spin" :size="16" />
                <span>{{ isEdit ? 'Update Agent Details' : 'Save Agent / Channel Partner' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import {
  PhX,
  PhWarningCircle,
  PhCircleNotch,
  PhIdentificationCard,
  PhBriefcase,
  PhMapPin,
  PhNote,
} from '@phosphor-icons/vue';
import { useCreateAgentMutation, useUpdateAgentMutation } from '../queries';

const props = defineProps({
  open: { type: Boolean, default: false },
  agentData: { type: Object, default: null },
});

const emit = defineEmits(['close', 'saved']);

const isEdit = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');

const createMutation = useCreateAgentMutation();
const updateMutation = useUpdateAgentMutation();

const form = reactive({
  name: '',
  officeName: '',
  phone: '',
  alternatePhone: '',
  email: '',
  agentType: 'channel_partner',
  specialization: 'residential',
  reraNumber: '',
  registrationNumber: '',
  gstNumber: '',
  panNumber: '',
  address: '',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '',
  contactPersonName: '',
  contactPersonPhone: '',
  website: '',
  notes: '',
  status: 'active',
});

const errors = reactive({
  name: '',
  officeName: '',
  phone: '',
  email: '',
  address: '',
});

watch(
  () => props.agentData,
  (val) => {
    if (val) {
      isEdit.value = true;
      Object.assign(form, {
        name: val.name || '',
        officeName: val.officeName || '',
        phone: val.phone || '',
        alternatePhone: val.alternatePhone || '',
        email: val.email || '',
        agentType: val.agentType || 'channel_partner',
        specialization: val.specialization || 'residential',
        reraNumber: val.reraNumber || '',
        registrationNumber: val.registrationNumber || '',
        gstNumber: val.gstNumber || '',
        panNumber: val.panNumber || '',
        address: val.address || '',
        city: val.city || '',
        state: val.state || '',
        pincode: val.pincode || '',
        contactPersonName: val.contactPersonName || '',
        contactPersonPhone: val.contactPersonPhone || '',
        website: val.website || '',
        notes: val.notes || '',
        status: val.status || 'active',
      });
    } else {
      isEdit.value = false;
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  form.name = '';
  form.officeName = '';
  form.phone = '';
  form.alternatePhone = '';
  form.email = '';
  form.agentType = 'channel_partner';
  form.specialization = 'residential';
  form.reraNumber = '';
  form.registrationNumber = '';
  form.gstNumber = '';
  form.panNumber = '';
  form.address = '';
  form.city = 'Mumbai';
  form.state = 'Maharashtra';
  form.pincode = '';
  form.contactPersonName = '';
  form.contactPersonPhone = '';
  form.website = '';
  form.notes = '';
  form.status = 'active';

  errors.name = '';
  errors.officeName = '';
  errors.phone = '';
  errors.email = '';
  errors.address = '';
  errorMessage.value = '';
}

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
    errors.officeName = 'Office / Agency Name is mandatory';
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
    errors.address = 'Office Address is mandatory';
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
      name: form.name.trim(),
      officeName: form.officeName.trim(),
      phone: form.phone.trim(),
      ...(form.alternatePhone.trim() ? { alternatePhone: form.alternatePhone.trim() } : {}),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      agentType: form.agentType,
      specialization: form.specialization,
      ...(form.reraNumber.trim() ? { reraNumber: form.reraNumber.trim() } : {}),
      ...(form.registrationNumber.trim() ? { registrationNumber: form.registrationNumber.trim() } : {}),
      ...(form.gstNumber.trim() ? { gstNumber: form.gstNumber.trim() } : {}),
      ...(form.panNumber.trim() ? { panNumber: form.panNumber.trim() } : {}),
      address: form.address.trim(),
      ...(form.city.trim() ? { city: form.city.trim() } : {}),
      ...(form.state.trim() ? { state: form.state.trim() } : {}),
      ...(form.pincode.trim() ? { pincode: form.pincode.trim() } : {}),
      ...(form.contactPersonName.trim() ? { contactPersonName: form.contactPersonName.trim() } : {}),
      ...(form.contactPersonPhone.trim() ? { contactPersonPhone: form.contactPersonPhone.trim() } : {}),
      ...(form.website.trim() ? { website: form.website.trim() } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      status: form.status,
    };

    if (isEdit.value && props.agentData?._id) {
      await updateMutation.mutateAsync({ id: props.agentData._id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    emit('saved');
    close();
  } catch (err) {
    errorMessage.value = err.response?.data?.error?.message || err.message || 'Operation failed';
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  resetForm();
  emit('close');
};
</script>
