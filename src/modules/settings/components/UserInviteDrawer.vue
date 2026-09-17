<template>
  <AppDrawer
    :isOpen="isOpen"
    :title="drawerTitle"
    width="500px"
    @close="handleClose"
  >
    <div class="space-y-5 text-xs text-slate-700 dark:text-slate-300">
      <!-- Info Banner -->
      <div class="rounded-lg p-3 border text-[11px] flex items-start gap-2.5 bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300">
        <PhCheckCircle :size="16" class="shrink-0 mt-0.5" />
        <div class="leading-relaxed">
          <p>
            <strong>Direct Staff Onboarding:</strong> Immediately creates an active staff account with login credentials and assigned role. The staff member can sign in right away.
          </p>
        </div>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4" autocomplete="off">
        <!-- Hidden inputs to consume browser password manager autofill -->
        <div style="position: absolute; left: -9999px; top: -9999px; width: 0; height: 0; opacity: 0; pointer-events: none;" aria-hidden="true">
          <input type="text" name="prevent_autofill_username" tabindex="-1" autocomplete="username" />
          <input type="password" name="prevent_autofill_password" tabindex="-1" autocomplete="current-password" />
        </div>

        <!-- Full Name -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <PhUser :size="14" />
            </span>
            <input
              v-model="name"
              type="text"
              name="new_staff_name"
              autocomplete="off"
              :placeholder="isEducationWorkspace ? 'e.g. Dr. Priya Sharma' : 'e.g. Rahul Sharma'"
              class="w-full bg-surface border rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-slate-100 transition-all"
              :class="errors.name ? 'border-red-500' : 'border-default'"
            />
          </div>
          <span v-if="errors.name" class="text-[10px] text-red-500 mt-1 block">{{ errors.name }}</span>
        </div>

        <!-- Official Email Address -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Official Email Address *
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <PhEnvelopeSimple :size="14" />
            </span>
            <input
              v-model="email"
              type="email"
              name="new_staff_account_email_field"
              id="new_staff_account_email_field"
              autocomplete="new-password"
              :readonly="isEmailReadonly"
              @focus="isEmailReadonly = false"
              placeholder="e.g. name@institution.edu or name@company.com"
              class="w-full bg-surface border rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-slate-100 font-mono transition-all"
              :class="errors.email ? 'border-red-500' : 'border-default'"
            />
          </div>
          <span v-if="errors.email" class="text-[10px] text-red-500 mt-1 block font-semibold">{{ errors.email }}</span>
        </div>

        <!-- Role Selector -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {{ isEducationWorkspace ? 'Staff / Admissions Role *' : 'Access Role *' }}
            </label>
            <span v-if="isEducationWorkspace" class="text-[9px] font-medium text-primary dark:text-accent-400">
              Education Vertical
            </span>
          </div>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <PhShieldCheck :size="14" />
            </span>
            <select
              v-model="role"
              class="w-full bg-surface border rounded-lg pl-8 pr-8 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-slate-100 transition-all appearance-none cursor-pointer"
              :class="errors.role ? 'border-red-500' : 'border-default'"
            >
              <option value="" disabled selected>
                {{ isEducationWorkspace ? 'Select Staff Role' : 'Select Access Role' }}
              </option>
              <option v-for="r in roles" :key="r.id || r._id" :value="r.id || r._id">
                {{ roleDisplayName(r) }}
              </option>
            </select>
            <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <PhCaretDown :size="13" />
            </span>
          </div>
          <span v-if="errors.role" class="text-[10px] text-red-500 mt-1 block">{{ errors.role }}</span>
        </div>

        <!-- Optional Branch / Campus Selector -->
        <div v-if="branches && branches.length > 0">
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {{ isEducationWorkspace ? 'Assigned Campus / Center (Optional)' : 'Assigned Branch Office (Optional)' }}
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <PhBuildings :size="14" />
            </span>
            <select
              v-model="branch"
              class="w-full bg-surface border border-default rounded-lg pl-8 pr-8 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-slate-100 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Branches / Main Headquarters</option>
              <option v-for="b in branches" :key="b.id || b._id" :value="b.id || b._id">
                {{ b.name }} {{ b.city ? `(${b.city})` : '' }}
              </option>
            </select>
            <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <PhCaretDown :size="13" />
            </span>
          </div>
        </div>

        <!-- Password Configuration -->
        <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Initial Staff Password *
            </label>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="generateRandomPassword"
                class="inline-flex items-center gap-1 text-[10px] font-bold text-primary dark:text-accent-400 hover:underline cursor-pointer"
              >
                <PhLightning :size="11" />
                <span>Generate Password</span>
              </button>
              <span class="text-slate-300 dark:text-slate-600">|</span>
              <button
                type="button"
                @click="copyPasswordToClipboard"
                :disabled="!password"
                class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <component :is="copied ? PhCheck : PhCopy" :size="11" />
                <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
              </button>
            </div>
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <PhLockKey :size="14" />
            </span>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              name="new_staff_account_password_field"
              id="new_staff_account_password_field"
              autocomplete="new-password"
              :readonly="isPasswordReadonly"
              @focus="isPasswordReadonly = false"
              placeholder="Enter password or click Generate (min 6 characters)"
              class="w-full bg-surface border rounded-lg pl-8 pr-10 py-2 text-xs font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-slate-100 transition-all"
              :class="errors.password ? 'border-red-500' : 'border-default'"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <component :is="showPassword ? PhEyeSlash : PhEye" :size="14" />
            </button>
          </div>
          <span v-if="errors.password" class="text-[10px] text-red-500 block">{{ errors.password }}</span>

          <p class="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <PhLockKey :size="11" class="shrink-0" />
            <span>Staff member can sign in directly using this email & password.</span>
          </p>
        </div>
      </form>
    </div>

    <template #footer>
      <button
        type="button"
        @click="handleClose"
        class="btn-md btn-secondary"
      >
        Cancel
      </button>
      <button
        type="button"
        @click="onSubmit"
        :disabled="isPending"
        class="btn-md btn-primary gap-1.5"
      >
        <span v-if="isPending" class="flex items-center gap-1.5">
          <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Onboarding...</span>
        </span>
        <span v-else class="flex items-center gap-1.5">
          <PhUserPlus :size="14" />
          <span>{{ isEducationWorkspace ? 'Onboard Staff' : 'Onboard User' }}</span>
        </span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import {
  PhUser,
  PhEnvelopeSimple,
  PhShieldCheck,
  PhBuildings,
  PhLockKey,
  PhEye,
  PhEyeSlash,
  PhLightning,
  PhCopy,
  PhCheck,
  PhCheckCircle,
  PhUserPlus,
  PhCaretDown
} from '@phosphor-icons/vue';
import { useInviteUserMutation } from '../queries';
import AppDrawer from '@/components/AppDrawer.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  roles: { type: Array, required: true },
  branches: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const showPassword = ref(false);
const copied = ref(false);
const isEmailReadonly = ref(true);
const isPasswordReadonly = ref(true);

const isEducationWorkspace = computed(
  () => store.getters['organization/isEducationTenant']
);

const drawerTitle = computed(() => {
  return isEducationWorkspace.value ? 'Onboard Staff / Counselor' : 'Onboard Staff Member';
});

// Vertical label transformation
function roleDisplayName(roleOption) {
  const name = roleOption?.name || roleOption?.code || '';
  if (isEducationWorkspace.value) {
    return name.replace(/agent/gi, 'Staff');
  }
  return name.replace(/_/g, ' ');
}

// Zod validation schema: Direct onboarding requires name, email, role, and password
const schema = computed(() =>
  toTypedSchema(
    zod.object({
      name: zod.string().min(2, 'Name must contain at least 2 characters').max(100),
      email: zod.string().min(1, 'Email address is required').email('Invalid email address format'),
      role: zod.string().min(1, 'Please select an access role'),
      password: zod.string().min(6, 'Password must be at least 6 characters').max(100),
      branch: zod.string().optional()
    })
  )
);

const { errors, handleSubmit, resetForm, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    email: '',
    role: '',
    password: '',
    branch: ''
  }
});

const { value: name } = useField('name');
const { value: email } = useField('email');
const { value: role } = useField('role');
const { value: password } = useField('password');
const { value: branch } = useField('branch');

const { mutateAsync: onboardUser, isPending } = useInviteUserMutation();

function generateRandomPassword() {
  isPasswordReadonly.value = false;
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
  let gen = 'Trk#';
  for (let i = 0; i < 6; i++) {
    gen += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  setFieldValue('password', gen);
  showPassword.value = true;
}

async function copyPasswordToClipboard() {
  if (!password.value) return;
  try {
    await navigator.clipboard.writeText(password.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    // fallback
  }
}

function handleClose() {
  resetForm();
  setFieldValue('email', '');
  setFieldValue('password', '');
  showPassword.value = false;
  copied.value = false;
  isEmailReadonly.value = true;
  isPasswordReadonly.value = true;
  emit('close');
}

function unlockAndClearInputs() {
  setFieldValue('email', '');
  setFieldValue('password', '');
  isEmailReadonly.value = true;
  isPasswordReadonly.value = true;
  // Delay removing readonly to prevent browser autofill injection on initial open
  setTimeout(() => {
    isEmailReadonly.value = false;
    isPasswordReadonly.value = false;
    // Clear once more in case browser attempted early autofill pass
    if (email.value || password.value) {
      setFieldValue('email', '');
      setFieldValue('password', '');
    }
  }, 250);
}

watch(() => props.isOpen, (open) => {
  if (open) {
    unlockAndClearInputs();
  }
});

onMounted(() => {
  if (props.isOpen) {
    unlockAndClearInputs();
  }
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const payload = {
      name: values.name,
      email: values.email,
      role: values.role,
      password: values.password,
      branchId: values.branch || null
    };

    await onboardUser(payload);

    store.dispatch('notifications/triggerToast', {
      message: `Staff member ${values.name} (${values.email}) successfully onboarded with login credentials.`,
      type: 'success'
    });

    handleClose();
    emit('success');
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to onboard staff member.';
    store.dispatch('notifications/triggerToast', {
      message: errMsg,
      type: 'error'
    });
  }
});
</script>

<style scoped>
/* Prevent browser autofill background discoloration */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px white inset !important;
  box-shadow: 0 0 0 1000px white inset !important;
  -webkit-text-fill-color: inherit !important;
  transition: background-color 5000s ease-in-out 0s;
}
:global(.dark) input:-webkit-autofill,
:global(.dark) input:-webkit-autofill:hover,
:global(.dark) input:-webkit-autofill:focus,
:global(.dark) input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
  box-shadow: 0 0 0 1000px #0f172a inset !important;
  -webkit-text-fill-color: #f8fafc !important;
}
</style>
