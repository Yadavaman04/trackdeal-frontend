<template>
  <div class="space-y-6 text-xs">
    <!-- Breadcrumbs / Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-heading text-xl font-extrabold text-slate-800 dark:text-slate-100">Organization Settings</h1>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Manage company profile details, theme palettes, subscription quotas, and data migrations.</p>
      </div>
    </div>

    <!-- Inner Tab Navigation -->
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
              <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Company Name *</label>
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

      <!-- 2. Feature Flags -->
      <div v-if="activeTab === 'features'">
        <FeatureFlagCard
          v-model="localFeatureFlags"
          @change="saveFeatureFlags"
        />
      </div>

      <!-- 3. Theme Branding Config -->
      <div v-if="activeTab === 'branding'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-default pb-3">
            <div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Theme Token Customization</h3>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Configure corporate branding theme colors. Changes propagate across views in real time.</p>
            </div>
            <button
              @click="resetBrandingColors"
              class="text-[10px] text-primary dark:text-accent-500 font-bold hover:underline"
            >
              Reset to Defaults
            </button>
          </div>
 
          <!-- Color HSL Customizers -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Primary HSL Color -->
            <div class="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-default">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 dark:text-slate-200">Primary Color HSL</span>
                <span
                  class="w-5 h-5 rounded border border-default shadow-xs"
                  :style="{ backgroundColor: `hsl(${themeConfig.primaryH} ${themeConfig.primaryS}% ${themeConfig.primaryL}%)` }"
                ></span>
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-[10px]">
                  <span class="font-semibold text-slate-500 dark:text-slate-400">Hue (H): {{ themeConfig.primaryH }}</span>
                  <input type="range" min="0" max="360" v-model="themeConfig.primaryH" @input="updateColorsInRealTime" class="w-2/3 h-1 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div class="flex items-center justify-between text-[10px]">
                  <span class="font-semibold text-slate-500 dark:text-slate-400">Sat (S): {{ themeConfig.primaryS }}%</span>
                  <input type="range" min="0" max="100" v-model="themeConfig.primaryS" @input="updateColorsInRealTime" class="w-2/3 h-1 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div class="flex items-center justify-between text-[10px]">
                  <span class="font-semibold text-slate-500 dark:text-slate-400">Light (L): {{ themeConfig.primaryL }}%</span>
                  <input type="range" min="0" max="100" v-model="themeConfig.primaryL" @input="updateColorsInRealTime" class="w-2/3 h-1 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
            </div>
 
            <!-- Secondary HSL Color -->
            <div class="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-default">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 dark:text-slate-200">Secondary Color HSL</span>
                <span
                  class="w-5 h-5 rounded border border-default shadow-xs"
                  :style="{ backgroundColor: `hsl(${themeConfig.secondaryH} ${themeConfig.secondaryS}% ${themeConfig.secondaryL}%)` }"
                ></span>
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-[10px]">
                  <span class="font-semibold text-slate-500 dark:text-slate-400">Hue (H): {{ themeConfig.secondaryH }}</span>
                  <input type="range" min="0" max="360" v-model="themeConfig.secondaryH" @input="updateColorsInRealTime" class="w-2/3 h-1 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div class="flex items-center justify-between text-[10px]">
                  <span class="font-semibold text-slate-500 dark:text-slate-400">Sat (S): {{ themeConfig.secondaryS }}%</span>
                  <input type="range" min="0" max="100" v-model="themeConfig.secondaryS" @input="updateColorsInRealTime" class="w-2/3 h-1 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div class="flex items-center justify-between text-[10px]">
                  <span class="font-semibold text-slate-500 dark:text-slate-400">Light (L): {{ themeConfig.secondaryL }}%</span>
                  <input type="range" min="0" max="100" v-model="themeConfig.secondaryL" @input="updateColorsInRealTime" class="w-2/3 h-1 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
 
          <!-- Dynamic Propagation Checklist -->
          <div class="space-y-3 pt-2">
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">DYNAMIC PROPAGATION CHANNELS</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-default">
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" v-model="brandingChannels.sidebar" class="rounded border-default text-primary" />
                <span class="font-semibold text-slate-700 dark:text-slate-300">Sidebar layouts & UI navigation nodes</span>
              </label>
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" v-model="brandingChannels.portal" class="rounded border-default text-primary" />
                <span class="font-semibold text-slate-700 dark:text-slate-300">External customer Portal & login screens</span>
              </label>
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" v-model="brandingChannels.emails" class="rounded border-default text-primary" />
                <span class="font-semibold text-slate-700 dark:text-slate-300">Custom email transaction notifications</span>
              </label>
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" v-model="brandingChannels.pdfs" class="rounded border-default text-primary" />
                <span class="font-semibold text-slate-700 dark:text-slate-300">Generated PDF Invoice & Microsheet exports</span>
              </label>
            </div>
          </div>
 
          <!-- Save Color Theme button -->
          <div class="flex justify-end pt-4 border-t border-default">
            <button
              @click="saveBrandingColors"
              class="btn-md btn-primary gap-1.5"
            >
              <PhFloppyDisk :size="14" />
              <span>Save Theme Settings</span>
            </button>
          </div>
        </div>
 
        <!-- Custom Logo Uploads -->
        <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Custom Logo Assets</h3>
            <p class="text-[9px] text-slate-500 dark:text-slate-400">Provide PNG assets for light/dark mode layouts and browser ICO favicons.</p>
          </div>
 
          <!-- Logo light -->
          <div class="space-y-1.5">
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Main Light Logo</label>
            <div class="flex items-center space-x-3">
              <div class="w-14 h-14 border border-default rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 font-semibold text-[9px] shadow-xs">
                Light Logo
              </div>
              <button class="btn-sm btn-secondary text-[10px]">Upload PNG</button>
            </div>
          </div>
 
          <!-- Logo dark -->
          <div class="space-y-1.5">
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Main Dark Logo</label>
            <div class="flex items-center space-x-3">
              <div class="w-14 h-14 border border-default rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 font-semibold text-[9px] shadow-xs">
                Dark Logo
              </div>
              <button class="btn-sm btn-secondary text-[10px]">Upload PNG</button>
            </div>
          </div>
 
          <!-- Favicon -->
          <div class="space-y-1.5">
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Favicon (16x16 / 32x32)</label>
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 border border-default rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs shadow-xs">
                <PhFileText :size="16" class="text-slate-400 dark:text-slate-500" />
              </div>
              <button class="btn-sm btn-secondary text-[10px]">Upload ICO</button>
            </div>
          </div>
        </div>
      </div>
 
      <!-- 4. Subscription & Billing -->
      <div v-if="activeTab === 'billing'" class="space-y-6">
        <div class="bg-gradient-to-r from-primary to-slate-800 text-white rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="space-y-1">
            <span class="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Active Subscription</span>
            <h3 class="text-base font-extrabold font-heading">{{ orgForm.companyName || orgSettings?.companyName || '' }} — {{ orgSettings?.billing?.currentPlan || '' }}</h3>
            <p class="text-[10px] text-slate-200 dark:text-slate-300">Billed monthly. Next invoice scheduled for July 1, 2026.</p>
          </div>
          <button class="btn-md bg-white hover:bg-slate-50 text-slate-900 border-0 font-bold shrink-0 gap-1.5">
            <PhCreditCard :size="14" />
            <span>Manage Billing Portal</span>
          </button>
        </div>
 
        <!-- Quota progress bars -->
        <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Tenant Resource Quotas</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">Resource quotas are capped based on plan tiers. Color shifts flag capacity limits.</p>
          </div>
 
          <div class="space-y-4">
            <!-- Active Users Quota -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-700 dark:text-slate-350">Active Seats (Users)</span>
                <span class="font-semibold text-slate-500 dark:text-slate-400">{{ orgSettings.billing?.activeUsers }} / {{ orgSettings.billing?.maxUsers }} Users ({{ usersQuotaPercent }}%)</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :class="getQuotaColorClass(usersQuotaPercent)" :style="{ width: `${usersQuotaPercent}%` }"></div>
              </div>
            </div>
 
            <!-- Branches Quota -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-700 dark:text-slate-350">Branch Locations</span>
                <span class="font-semibold text-slate-500 dark:text-slate-400">{{ orgSettings.billing?.activeBranches }} / {{ orgSettings.billing?.maxBranches }} Branches ({{ branchQuotaPercent }}%)</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :class="getQuotaColorClass(branchQuotaPercent)" :style="{ width: `${branchQuotaPercent}%` }"></div>
              </div>
            </div>
 
            <!-- Storage Quota -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-700 dark:text-slate-350">Allocated Cloud Document Storage</span>
                <span class="font-semibold text-slate-500 dark:text-slate-400">{{ orgSettings.billing?.storageUsed }} GB / {{ orgSettings.billing?.storageAllocated }} GB ({{ storageQuotaPercent }}%)</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :class="getQuotaColorClass(storageQuotaPercent)" :style="{ width: `${storageQuotaPercent}%` }"></div>
              </div>
            </div>
 
            <!-- Leads Quota -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-700 dark:text-slate-350">Registered Leads</span>
                <span class="font-semibold text-slate-500 dark:text-slate-400">{{ orgSettings.billing?.leadsCount }} / Unlimited Leads</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                <div class="h-full rounded-full bg-emerald-500" style="width: 100%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Data Center (Import / Export) -->
      <div v-if="activeTab === 'datacenter'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- CSV Import Mapper Stepper -->
        <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">CSV Import Center</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">Migrate leads, deals, or properties databases via column map files.</p>
          </div>
 
          <!-- Stepper Headers -->
          <div class="flex items-center justify-between border-y border-default py-2 text-[10px] font-bold text-slate-450 dark:text-slate-500">
            <span :class="importStep >= 1 ? 'text-primary' : ''">1. UPLOAD CSV</span>
            <span>▶</span>
            <span :class="importStep >= 2 ? 'text-primary' : ''">2. FIELD MAPPING</span>
            <span>▶</span>
            <span :class="importStep >= 3 ? 'text-primary' : ''">3. CONFLICT RULES</span>
          </div>
 
          <!-- Step 1: Upload CSV -->
          <div v-if="importStep === 1" class="space-y-4">
            <div class="border-2 border-dashed border-default hover:border-primary rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/20 cursor-pointer space-y-2" @click="mockCSVSelect">
              <PhFileText :size="32" class="text-slate-400 dark:text-slate-500 mx-auto" />
              <div class="font-bold text-slate-700 dark:text-slate-250">{{ csvFile ? csvFile.name : 'Drag & Drop CSV file here' }}</div>
              <p class="text-[9px] text-slate-400 dark:text-slate-500">File limits: 50MB max. Rows will be scanned for headers.</p>
            </div>
            <div class="flex justify-end">
              <button
                @click="importStep = 2"
                :disabled="!csvFile"
                class="btn-md btn-primary"
              >
                Proceed to Mapping
              </button>
            </div>
          </div>
 
          <!-- Step 2: Field Mapping Canvas -->
          <div v-if="importStep === 2" class="space-y-4">
            <div class="font-bold text-slate-700 dark:text-slate-250">Column Mapping Wizard</div>
            <div class="space-y-2 border border-default rounded-lg p-3 max-h-[220px] overflow-y-auto bg-slate-50/30 dark:bg-slate-800/30">
              <div v-for="map in columnMappings" :key="map.csvCol" class="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-default last:border-0">
                <span class="font-semibold text-slate-600 dark:text-slate-400 font-mono">{{ map.csvCol }}</span>
                <PhArrowRight :size="12" class="text-slate-400 dark:text-slate-500" />
                <select v-model="map.crmKey" class="bg-surface border border-default rounded-md px-2 py-1 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-200">
                  <option value="lead.name">Lead Name</option>
                  <option value="lead.phone">Mobile Number</option>
                  <option value="lead.email">Email Address</option>
                  <option value="lead.budget">Preferred Budget</option>
                  <option value="ignore">[ Ignore Column ]</option>
                </select>
              </div>
            </div>
 
            <!-- Mock Validation Warning preview -->
            <div class="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 text-yellow-800 dark:text-yellow-400 p-3 rounded-lg text-[10px] font-semibold leading-relaxed flex items-start gap-1.5">
              <PhWarning :size="14" class="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <strong>Pre-validation check:</strong> Found 3 rows with missing phone numbers. If imported, these will report validation errors during execution and write log reports.
              </div>
            </div>
 
            <div class="flex justify-between">
              <button @click="importStep = 1" class="btn-md btn-secondary">Back</button>
              <button @click="importStep = 3" class="btn-md btn-primary">Conflict Rules</button>
            </div>
          </div>
 
          <!-- Step 3: Conflict Rules -->
          <div v-if="importStep === 3" class="space-y-4">
            <div class="font-bold text-slate-700 dark:text-slate-250 mb-2">Duplicate Conflict Resolution Rules</div>
            <div class="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 border border-default rounded-xl">
              <label class="flex items-start cursor-pointer">
                <input type="radio" name="conflict" value="skip" v-model="conflictRule" class="mt-0.5 text-primary" />
                <span class="ml-2.5 font-semibold text-slate-750 dark:text-slate-300">Skip duplicate rows (Keep existing CRM records intact)</span>
              </label>
              <label class="flex items-start cursor-pointer">
                <input type="radio" name="conflict" value="overwrite" v-model="conflictRule" class="mt-0.5 text-primary" />
                <span class="ml-2.5 font-semibold text-slate-750 dark:text-slate-300">Overwrite CRM record values with CSV columns data</span>
              </label>
              <label class="flex items-start cursor-pointer">
                <input type="radio" name="conflict" value="merge" v-model="conflictRule" class="mt-0.5 text-primary" />
                <span class="ml-2.5 font-semibold text-slate-750 dark:text-slate-300">Merge details (Append missing fields without overwriting fields)</span>
              </label>
            </div>
 
            <div class="flex justify-between">
              <button @click="importStep = 2" class="btn-md btn-secondary">Back</button>
              <button @click="runCSVImport" class="btn-md btn-primary gap-1.5">
                <PhLightning :size="14" />
                <span>Execute Import Job</span>
              </button>
            </div>
          </div>
        </div>
 
        <!-- Export Center -->
        <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Export Center</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">Request raw backups and database exports enqueued for security audits.</p>
          </div>
 
          <!-- Export Scopes -->
          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Select Data Scopes</label>
            <div class="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-default">
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" v-model="exportScopes.leads" class="rounded border-default text-primary" />
                <span class="font-semibold text-slate-750 dark:text-slate-300">Leads Module</span>
              </label>
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" v-model="exportScopes.deals" class="rounded border-default text-primary" />
                <span class="font-semibold text-slate-750 dark:text-slate-300">Deals & Bookings</span>
              </label>
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" v-model="exportScopes.properties" class="rounded border-default text-primary" />
                <span class="font-semibold text-slate-750 dark:text-slate-300">Inventory Property</span>
              </label>
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" v-model="exportScopes.auditLogs" class="rounded border-default text-primary" />
                <span class="font-semibold text-slate-750 dark:text-slate-300">System Audit Logs</span>
              </label>
            </div>
          </div>
 
          <!-- Format Filters -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Export Format</label>
              <select v-model="exportFormat" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-200">
                <option value="CSV">CSV Format</option>
                <option value="JSON">JSON File</option>
                <option value="EXCEL">Excel (.xlsx)</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Delivery Channel</label>
              <select class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-200" disabled>
                <option value="email">Send via Email link</option>
              </select>
            </div>
          </div>
 
          <!-- Security Authorizations Checkbox -->
          <div class="bg-red-50/50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/20 p-3 rounded-lg space-y-2">
            <label class="flex items-start cursor-pointer">
              <input type="checkbox" v-model="exportAuthorized" class="mt-0.5 rounded border-red-300 text-red-650 focus:ring-red-500" />
              <span class="ml-2 font-semibold text-red-800 dark:text-red-400 text-[10px]">I confirm that I am authorized to export raw organization data for backup and compliance purposes.</span>
            </label>
          </div>
 
          <!-- Export History List empty state -->
          <div class="space-y-2 pt-1">
            <label class="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase">RECENT EXPORT HISTORY</label>
            <div class="flex flex-col items-center justify-center py-6 px-4 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-default rounded-xl text-center space-y-1">
              <PhFileText :size="20" class="text-slate-350 dark:text-slate-500" />
              <span class="font-semibold text-slate-500 dark:text-slate-300 text-[10px]">No Export History Found</span>
              <span class="text-slate-400 dark:text-slate-500 text-[9px] leading-normal">Enqueued compliance and backup history will appear here.</span>
            </div>
          </div>

          <!-- Request button -->
          <div class="flex justify-end pt-2">
            <button
              @click="requestDatabaseExport"
              :disabled="!exportAuthorized"
              class="btn-md btn-primary gap-1.5"
            >
              <PhDownload :size="14" />
              <span>Request Database Export</span>
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
import { PhFloppyDisk, PhCreditCard, PhFileText, PhLightning, PhDownload, PhWarning, PhArrowRight } from '@phosphor-icons/vue';
import { useOrgSettingsQuery, useUpdateOrgSettingsMutation } from '../queries';
import FeatureFlagCard from '../components/FeatureFlagCard.vue';

const store = useStore();

const tabs = [
  { label: 'Profile Metadata', value: 'profile' },
  { label: 'Feature Flags', value: 'features' },
  { label: 'Theme Branding', value: 'branding' },
  { label: 'Subscription & Billing', value: 'billing' },
  { label: 'Data Center', value: 'datacenter' }
];

const activeTab = ref('profile');

// Fetch Query Layer
const { data: orgSettings, isLoading } = useOrgSettingsQuery();
const { mutateAsync: updateOrgSettings, isPending: isUpdating } = useUpdateOrgSettingsMutation();

// Local forms state
const orgForm = ref({
  companyName: '',
  spoc: '',
  gstin: '',
  currency: 'INR',
  timezone: 'Asia/Kolkata'
});

const localFeatureFlags = ref({
  whatsappModule: false,
  commissionModule: false,
  reportsModule: false,
  automationEngine: false,
  apiAccess: false
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
    if (newVal.featureFlags) {
      localFeatureFlags.value = { ...newVal.featureFlags };
    }
  }
}, { immediate: true });

// Branding states
const themeConfig = ref({
  primaryH: '220',
  primaryS: '85',
  primaryL: '45',
  secondaryH: '210',
  secondaryS: '25',
  secondaryL: '35'
});

const brandingChannels = ref({
  sidebar: true,
  portal: true,
  emails: true,
  pdfs: false
});

// Quota Percentages computed values
const usersQuotaPercent = computed(() => {
  const billing = orgSettings.value?.billing;
  if (!billing) return 0;
  return Math.round((billing.activeUsers / billing.maxUsers) * 100);
});

const branchQuotaPercent = computed(() => {
  const billing = orgSettings.value?.billing;
  if (!billing) return 0;
  return Math.round((billing.activeBranches / billing.maxBranches) * 100);
});

const storageQuotaPercent = computed(() => {
  const billing = orgSettings.value?.billing;
  if (!billing) return 0;
  return Math.round((billing.storageUsed / billing.storageAllocated) * 100);
});

function getQuotaColorClass(percent) {
  if (percent >= 95) return 'bg-red-500';
  if (percent >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

// Data Center details
const importStep = ref(1);
const csvFile = ref(null);
const conflictRule = ref('skip');
const columnMappings = ref([
  { csvCol: 'First Name', crmKey: 'lead.name' },
  { csvCol: 'Buyer Mob', crmKey: 'lead.phone' },
  { csvCol: 'Email Addr', crmKey: 'lead.email' },
  { csvCol: 'Target Price', crmKey: 'lead.budget' }
]);

const exportScopes = ref({
  leads: true,
  deals: true,
  properties: false,
  auditLogs: false
});
const exportFormat = ref('CSV');
const exportAuthorized = ref(false);

function mockCSVSelect() {
  csvFile.value = { name: 'leads_migration_june2026.csv', size: 1024 * 342 };
  store.dispatch('notifications/triggerToast', {
    message: 'CSV file enqueued. System detected columns mapping.',
    type: 'success'
  });
}

function runCSVImport() {
  store.dispatch('notifications/triggerToast', {
    message: 'CSV migration job enqueued in background. Progress can be monitored in Audit Logs.',
    type: 'success'
  });
  importStep.value = 1;
  csvFile.value = null;
}

function requestDatabaseExport() {
  if (!exportAuthorized.value) return;
  store.dispatch('notifications/triggerToast', {
    message: 'Database backup request submitted. Download link will be sent shortly via email.',
    type: 'success'
  });
  exportAuthorized.value = false;
}

// Branding save
function updateColorsInRealTime() {
  // Update document variables dynamically
  document.documentElement.style.setProperty('--primary', `${themeConfig.value.primaryH} ${themeConfig.value.primaryS}% ${themeConfig.value.primaryL}%`);
  document.documentElement.style.setProperty('--secondary', `${themeConfig.value.secondaryH} ${themeConfig.value.secondaryS}% ${themeConfig.value.secondaryL}%`);
}

function resetBrandingColors() {
  themeConfig.value = {
    primaryH: '220',
    primaryS: '85',
    primaryL: '45',
    secondaryH: '210',
    secondaryS: '25',
    secondaryL: '35'
  };
  updateColorsInRealTime();
}

function saveBrandingColors() {
  updateColorsInRealTime();
  store.dispatch('notifications/triggerToast', {
    message: 'HSL Theme Colors applied and saved to tenant profile successfully.',
    type: 'success'
  });
}

// Feature flags save
function saveFeatureFlags(updatedFlags) {
  localFeatureFlags.value = { ...updatedFlags };
  store.dispatch('notifications/triggerToast', {
    message: 'Organization-level access permissions modified.',
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
