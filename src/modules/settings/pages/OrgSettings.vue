<template>
  <div class="space-y-6 text-xs">
    <!-- Breadcrumbs / Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-heading text-xl font-extrabold text-slate-800 dark:text-slate-100">{{ isEducation ? 'Institute Settings' : 'Organization Settings' }}</h1>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ isEducation ? 'Manage institute profile, campus branding, and counseling workspace theme.' : 'Manage company profile details and corporate theme branding.' }}</p>
      </div>
    </div>

    <!-- Inner Tab Navigation (Only Profile Metadata & Theme Branding) -->
    <div class="flex border-b border-default overflow-x-auto space-x-4 pb-0.5 scrollbar-none">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="py-2.5 px-1.5 border-b-2 font-bold text-xs transition-colors shrink-0"
        :class="[
          activeTab === tab.value
            ? 'border-primary text-primary'
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="space-y-6">
      <!-- 1. Profile Metadata Form -->
      <div v-if="activeTab === 'profile'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Organization Profile</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">Configure corporate identity metadata, default localizations, and currencies.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{{ isEducation ? 'Institute / Organisation Name *' : 'Company Name *' }}</label>
              <input
                v-model="orgForm.companyName"
                type="text"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Primary SPOC / Admin *</label>
              <input
                v-model="orgForm.spoc"
                type="text"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">GSTIN Number (Optional)</label>
              <input
                v-model="orgForm.gstin"
                type="text"
                placeholder="27AAAAA1111A1Z1"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 uppercase"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Localization Default Currency</label>
              <select
                v-model="orgForm.currency"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 font-semibold"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD" disabled>USD ($) - US Dollar (Enterprise Plan only)</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Default Timezone</label>
              <select
                v-model="orgForm.timezone"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              >
                <option value="Asia/Kolkata">(GMT+05:30) Mumbai, New Delhi</option>
                <option value="GMT">(GMT+00:00) London</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-default">
            <button
              @click="saveProfile"
              class="btn-md btn-primary gap-1.5"
              :disabled="isUpdating"
            >
              <PhFloppyDisk :size="14" />
              <span>Save Profile Settings</span>
            </button>
          </div>
        </div>

        <!-- Enterprise SSO Placeholders (Grayed out) -->
        <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-4 opacity-50 relative group">
          <div class="absolute inset-0 bg-slate-100/10 rounded-xl pointer-events-none"></div>
          <div>
            <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Enterprise Single Sign-On</h3>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 text-[9px] font-bold mt-1">Enterprise Tier Only</span>
          </div>

          <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Integrate Google Workspace, Microsoft Entra ID, or customized SAML 2.0/OIDC login providers for centralized user lifecycle identity access.
          </p>

          <div class="space-y-3 pt-2">
            <label class="flex items-center space-x-2">
              <input type="checkbox" disabled class="rounded border-default text-primary" />
              <span class="font-semibold text-slate-700 dark:text-slate-350">Enable Single Sign-On (SSO)</span>
            </label>

            <div class="space-y-1.5 pl-5">
              <label class="flex items-center space-x-2">
                <input type="radio" name="sso" disabled />
                <span class="text-slate-655 dark:text-slate-400">Google Workspace</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="radio" name="sso" disabled />
                <span class="text-slate-655 dark:text-slate-400">Microsoft Entra ID</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="radio" name="sso" disabled />
                <span class="text-slate-655 dark:text-slate-400">SAML 2.0 Connection</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Theme Config -->
      <div v-if="activeTab === 'theme'" class="max-w-4xl space-y-6">
        <!-- Appearance Mode Card (Light / Dark) -->
        <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Appearance Mode</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">Select your workspace interface color theme.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              @click="setThemeMode('light')"
              class="p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 text-left"
              :class="activeThemeMode === 'light' ? 'border-primary bg-primary/5 shadow-xs' : 'border-default hover:border-slate-300 dark:hover:border-slate-750 bg-slate-50/50 dark:bg-slate-800/40'"
            >
              <div class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
                <PhSun :size="22" weight="bold" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">Light Mode</span>
                  <span v-if="activeThemeMode === 'light'" class="text-[10px] font-bold text-primary">Active</span>
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Clean surfaces and high contrast readability</div>
              </div>
            </button>
            <button
              type="button"
              @click="setThemeMode('dark')"
              class="p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 text-left"
              :class="activeThemeMode === 'dark' ? 'border-primary bg-primary/5 shadow-xs' : 'border-default hover:border-slate-300 dark:hover:border-slate-750 bg-slate-50/50 dark:bg-slate-800/40'"
            >
              <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-400 flex items-center justify-center shrink-0">
                <PhMoon :size="22" weight="bold" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">Dark Mode</span>
                  <span v-if="activeThemeMode === 'dark'" class="text-[10px] font-bold text-primary">Active</span>
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Deep slate tones tailored for nighttime work</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Token Customization Card -->
        <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-default pb-3">
            <div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Brand Color Customization</h3>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Configure corporate branding theme colors. Changes propagate across views in real time.</p>
            </div>
            <button
              @click="resetBrandingColors"
              class="text-[10px] text-primary dark:text-accent-500 font-bold hover:underline"
            >
              Reset to Defaults
            </button>
          </div>
 
          <!-- Color Customizers -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <!-- Brand / Button Accent -->
            <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-default">
              <div class="relative w-10 h-10 rounded-full overflow-hidden shadow-inner border border-slate-300 dark:border-slate-600 shrink-0">
                <input
                  v-model="themeConfig.primaryHex"
                  type="color"
                  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 cursor-pointer border-0 p-0"
                  @input="updateColorsInRealTime"
                />
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-slate-700 dark:text-slate-200 text-xs">Buttons & Accents</span>
                <span class="text-[10px] text-slate-500 font-mono uppercase">{{ themeConfig.primaryHex }}</span>
              </div>
            </div>

            <!-- Navbar Color -->
            <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-default">
              <div class="relative w-10 h-10 rounded-full overflow-hidden shadow-inner border border-slate-300 dark:border-slate-600 shrink-0">
                <input
                  v-model="themeConfig.navbarHex"
                  type="color"
                  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 cursor-pointer border-0 p-0"
                  @input="updateColorsInRealTime"
                />
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-slate-700 dark:text-slate-200 text-xs">Navigation Bar</span>
                <span class="text-[10px] text-slate-500 font-mono uppercase">{{ themeConfig.navbarHex }}</span>
              </div>
            </div>

            <!-- Background Color -->
            <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-default">
              <div class="relative w-10 h-10 rounded-full overflow-hidden shadow-inner border border-slate-300 dark:border-slate-600 shrink-0">
                <input
                  v-model="themeConfig.backgroundHex"
                  type="color"
                  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 cursor-pointer border-0 p-0"
                  @input="updateColorsInRealTime"
                />
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-slate-700 dark:text-slate-200 text-xs">App Background</span>
                <span class="text-[10px] text-slate-500 font-mono uppercase">{{ themeConfig.backgroundHex }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-default">
            <button
              @click="saveBrandingColors"
              class="btn-md btn-primary gap-1.5"
            >
              <PhFloppyDisk :size="14" />
              <span>Apply Theme Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { PhFloppyDisk, PhSun, PhMoon } from '@phosphor-icons/vue';
import { applyThemeTokensToDOM } from '@/store/modules/ui';
import { useOrgSettingsQuery, useUpdateOrgSettingsMutation } from '../queries';

const store = useStore();

const isEducation = computed(() => store.getters['organization/isEducationTenant']);

// Cleaned Tabs: Only Profile Metadata & Theme
const tabs = computed(() => [
  { label: isEducation.value ? 'Institute Profile' : 'Profile Metadata', value: 'profile' },
  { label: 'Theme', value: 'theme' },
]);

const activeTab = ref('profile');

// Theme Mode Selection
const activeThemeMode = computed(() => store.state.ui.activeThemeMode);
const setThemeMode = (mode) => {
  store.commit('ui/SET_THEME_MODE', mode);
};

// Fetch Query Layer
const { data: orgSettings } = useOrgSettingsQuery();
const { mutateAsync: updateOrgSettings, isPending: isUpdating } = useUpdateOrgSettingsMutation();

// Local forms state
const orgForm = ref({
  companyName: '',
  spoc: '',
  gstin: '',
  currency: 'INR',
  timezone: 'Asia/Kolkata'
});

watch(orgSettings, (newVal) => {
  if (newVal) {
    orgForm.value = {
      companyName: newVal.name || newVal.companyName || '',
      spoc: newVal.spoc || '',
      gstin: newVal.gstNumber || newVal.gstin || '',
      currency: newVal.settings?.currency || newVal.currency || 'INR',
      timezone: newVal.settings?.timezone || newVal.timezone || 'Asia/Kolkata'
    };
  }
}, { immediate: true });

// Branding default tokens (TrackDeal teal-green default: 150, 34%, 23%)
const defaultTokens = {
  primaryHex: '#264f3c',
  secondaryHex: '#43617e',
  navbarHex: '#ffffff',
  backgroundHex: '#f8fafc'
};

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('theme_custom_hsl');
    if (saved) return { ...defaultTokens, ...JSON.parse(saved) };
  } catch (e) {}
  return { ...defaultTokens };
};

const themeConfig = ref(getInitialTheme());

// Branding save & preview
function updateColorsInRealTime() {
  applyThemeTokensToDOM(themeConfig.value);
}

function resetBrandingColors() {
  themeConfig.value = { ...defaultTokens };
  applyThemeTokensToDOM(null);
  localStorage.removeItem('theme_custom_hsl');
  store.dispatch('notifications/triggerToast', {
    message: 'Theme colors restored to defaults.',
    type: 'info'
  });
}

function saveBrandingColors() {
  applyThemeTokensToDOM(themeConfig.value);
  localStorage.setItem('theme_custom_hsl', JSON.stringify(themeConfig.value));
  store.dispatch('notifications/triggerToast', {
    message: 'Theme colors applied and saved successfully.',
    type: 'success'
  });
}

// Save General Profile
async function saveProfile() {
  try {
    const payload = {
      name: orgForm.value.companyName,
      gstNumber: orgForm.value.gstin,
      settings: {
        currency: orgForm.value.currency,
        timezone: orgForm.value.timezone
      }
    };
    await updateOrgSettings(payload);
    store.dispatch('notifications/triggerToast', {
      message: 'Profile configuration updated.',
      type: 'success'
    });
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to update organization metadata details.',
      type: 'error'
    });
  }
}
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
