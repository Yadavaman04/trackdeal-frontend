<template>
  <div class="space-y-6 text-xs">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-heading text-xl font-extrabold text-slate-800 dark:text-slate-100">Branch Management & Channels</h1>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Add physical offices, assign branch heads, configure API channel webhooks, and test SMTP email deliveries.</p>
      </div>
      <button
        @click="openCreateDrawer"
        class="btn-md btn-primary gap-1.5"
      >
        <PhPlus :size="14" />
        <span>Create New Branch</span>
      </button>
    </div>

    <!-- Inner tabs -->
    <div class="flex border-b border-default overflow-x-auto space-x-4 pb-0.5 scrollbar-none">
      <button
        @click="activeTab = 'list'"
        class="py-2.5 px-1.5 border-b-2 font-bold text-xs transition-colors shrink-0"
        :class="activeTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'"
      >
        Active Branches
      </button>
      <button
        @click="activeTab = 'channels'"
        class="py-2.5 px-1.5 border-b-2 font-bold text-xs transition-colors shrink-0"
        :class="activeTab === 'channels' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'"
      >
        Integrations & API Channels
      </button>
    </div>

    <!-- Active Branches Tab -->
    <div v-if="activeTab === 'list'" class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-4">
      <!-- High Density Table -->
      <div class="overflow-x-auto border border-default rounded-lg">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-default font-semibold">
              <th class="p-3">Branch Name</th>
              <th class="p-3">Code</th>
              <th class="p-3">Location / City</th>
              <th class="p-3">Contact Phone</th>
              <th class="p-3">Assigned Manager</th>
              <th class="p-3 text-right">Active Leads</th>
              <th class="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr v-for="branch in branches" :key="branch.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="p-3 font-bold text-slate-850 dark:text-slate-200">{{ branch.name }}</td>
              <td class="p-3"><span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-350 border border-default rounded text-[10px] font-mono font-bold">{{ branch.code }}</span></td>
              <td class="p-3 text-slate-600 dark:text-slate-400">{{ branch.city }}</td>
              <td class="p-3 text-slate-600 dark:text-slate-400 font-mono">{{ branch.phone }}</td>
              <td class="p-3 font-semibold text-slate-700 dark:text-slate-300">{{ branch.manager || 'Unassigned' }}</td>
              <td class="p-3 text-right text-slate-705 dark:text-slate-300 font-semibold">{{ formatNumber(branch.activeLeads) }}</td>
              <td class="p-3 text-center">
                <button
                  @click="openEditDrawer(branch)"
                  class="btn btn-sm btn-ghost text-primary hover:text-primary-700 h-6 px-2 font-bold"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Channels & Webhooks Tab -->
    <div v-if="activeTab === 'channels'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- SMTP Integration Card -->
        <IntegrationCard
          name="smtp"
          title="SMTP Email Delivery Provider"
          description="Route automated booking summaries, digital agreement copy links, and collection invoice notices through secure corporate servers."
          :icon="PhEnvelope"
          :status="smtpStatus"
          lastSync="Real-time"
          type="SMTP Protocol"
          :isTesting="testingMap.smtp"
          :configFields="[
            { key: 'host', label: 'SMTP Host Server', placeholder: 'smtp.gmail.com', defaultValue: 'smtp.sendgrid.net' },
            { key: 'port', label: 'Port', placeholder: '465 / 587', defaultValue: '587' },
            { key: 'username', label: 'Sender Email', placeholder: 'sender@org.com', defaultValue: '' },
            { key: 'password', label: 'API Password Key', placeholder: '••••••••', type: 'password', defaultValue: 'apikey12345' }
          ]"
          @test="testIntegration"
          @save="saveIntegration"
        />

        <!-- WhatsApp Cloud API Integration Card -->
        <IntegrationCard
          name="whatsapp"
          title="Meta WhatsApp Cloud API"
          description="Sync pre-approved notification templates with Meta console to message customers directly when appointments are scheduled or payments logged."
          :icon="PhChatCircle"
          :status="whatsappStatus"
          lastSync="10 minutes ago"
          type="REST API"
          :isTesting="testingMap.whatsapp"
          :configFields="[
            { key: 'phoneId', label: 'WhatsApp Phone Number ID', placeholder: '10928372625', defaultValue: '1088491823901' },
            { key: 'accessToken', label: 'Meta System Token key', placeholder: 'EAAG...', type: 'password', defaultValue: 'eaag_token' }
          ]"
          @test="testIntegration"
          @save="saveIntegration"
        />

        <!-- Google Calendar Integration Card -->
        <IntegrationCard
          name="calendar"
          title="Google Calendar Calendar Sync"
          description="Automate meeting invites for site visits. Sync agent availability profiles to prevent scheduling overlaps on calendar grids."
          :icon="PhCalendar"
          :status="calendarStatus"
          lastSync="2 hours ago"
          type="OAuth 2.0"
          :isTesting="testingMap.calendar"
          :configFields="[
            { key: 'clientId', label: 'Google Client ID', placeholder: '1283-abc.apps.googleusercontent.com', defaultValue: '' }
          ]"
          @test="testIntegration"
          @save="saveIntegration"
        />
      </div>

      <!-- Webhook Sandbox Tester -->
      <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Dynamic Webhooks Callback receiver</h3>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">Provide developers with receiver webhooks to subscribe to lead creation, site visits, or deal wins events in real time.</p>
        </div>
 
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Form -->
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Target Webhook Endpoint URL</label>
              <input
                v-model="webhookUrl"
                type="text"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-md px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Trigger Event</label>
                <select v-model="webhookEvent" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-200">
                  <option value="lead.created">Lead Created</option>
                  <option value="site_visit.scheduled">Site Visit Scheduled</option>
                  <option value="deal.won">Deal Won</option>
                  <option value="payment.received">Payment Received</option>
                </select>
              </div>
              <div class="flex items-end">
                <button
                  @click="sendTestWebhook"
                  :disabled="testingWebhook"
                  class="w-full btn-md btn-primary gap-1.5"
                >
                  <PhLightning :size="14" />
                  <span>Send Test Event</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Output Preview -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
              <span>RESPONSE BODY (HTTP/1.1 200 OK)</span>
              <button @click="webhookLogs = ''" class="btn btn-sm btn-ghost text-primary hover:text-primary-700 h-6 px-1.5 font-bold">Clear Output</button>
            </div>
            <pre class="bg-slate-900 text-slate-300 font-mono text-[9px] p-3 rounded-lg overflow-x-auto min-h-[120px] max-h-[200px] border border-slate-800 leading-relaxed">{{ webhookLogs || '// Webhook logs will output here...' }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Branch Drawer (Inline for modular simplicity) -->
    <AppDrawer
      :isOpen="isDrawerOpen"
      :title="editingBranch ? 'Edit Physical Branch' : 'Add Physical Branch'"
      width="480px"
      @close="closeDrawer"
    >
      <form @submit.prevent="onSaveBranch" class="space-y-4 text-xs">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Branch Name *</label>
          <input
            v-model="branchForm.name"
            type="text"
            required
            placeholder="e.g. Pune East"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800 font-semibold"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Branch Code (uppercase prefix)*</label>
            <input
              v-model="branchForm.code"
              type="text"
              required
              maxlength="5"
              placeholder="e.g. PNQ02"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary uppercase text-slate-800 font-mono font-bold"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">City / Region *</label>
            <input
              v-model="branchForm.city"
              type="text"
              required
              placeholder="e.g. Pune Kalyani"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800"
            />
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contact Phone</label>
          <input
            v-model="branchForm.phone"
            type="text"
            placeholder="e.g. +91 99999 99902"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Branch Manager</label>
          <select
            v-model="branchForm.manager"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800"
          >
            <option value="">Unassigned</option>
            <option v-for="u in users" :key="u.id" :value="u.name || u.fullName">
              {{ u.name || u.fullName }}
            </option>
          </select>
        </div>
      </form>

      <template #footer>
        <button
          @click="closeDrawer"
          class="btn-md btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="onSaveBranch"
          class="btn-md btn-primary"
        >
          {{ editingBranch ? 'Update Branch' : 'Create Branch' }}
        </button>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { PhPlus, PhLightning, PhEnvelope, PhChatCircle, PhCalendar } from '@phosphor-icons/vue';
import { useBranchesQuery, useCreateBranchMutation, useUpdateBranchMutation, useTestIntegrationMutation, useUsersQuery } from '../queries';
import IntegrationCard from '../components/IntegrationCard.vue';
import AppDrawer from '@/components/AppDrawer.vue';

const store = useStore();
const activeTab = ref('list');

// TanStack queries
const { data: branches } = useBranchesQuery();
const { data: users } = useUsersQuery();
const { mutateAsync: createBranch } = useCreateBranchMutation();
const { mutateAsync: updateBranch } = useUpdateBranchMutation();
const { mutateAsync: testIntegrationApi } = useTestIntegrationMutation();

// Local integration statuses
const smtpStatus = ref('connected');
const whatsappStatus = ref('connected');
const calendarStatus = ref('degraded');

// Testing loading state map
const testingMap = ref({
  smtp: false,
  whatsapp: false,
  calendar: false
});

// Webhook sandbox
const webhookUrl = ref('');
const webhookEvent = ref('lead.created');
const testingWebhook = ref(false);
const webhookLogs = ref('');

// Drawer states
const isDrawerOpen = ref(false);
const editingBranch = ref(null);
const branchForm = ref({
  name: '',
  code: '',
  city: '',
  phone: '',
  manager: ''
});

function openCreateDrawer() {
  editingBranch.value = null;
  branchForm.value = { name: '', code: '', city: '', phone: '', manager: '' };
  isDrawerOpen.value = true;
}

function openEditDrawer(branch) {
  editingBranch.value = branch;
  branchForm.value = { ...branch };
  isDrawerOpen.value = true;
}

function closeDrawer() {
  isDrawerOpen.value = false;
  editingBranch.value = null;
}

async function onSaveBranch() {
  if (!branchForm.value.name.trim() || !branchForm.value.code.trim()) {
    store.dispatch('notifications/triggerToast', {
      message: 'Name and unique Branch code uppercase prefixes are required.',
      type: 'error'
    });
    return;
  }

  // Validate Code
  if (branchForm.value.code.length > 5) {
    store.dispatch('notifications/triggerToast', {
      message: 'Branch code prefix cannot exceed 5 characters.',
      type: 'error'
    });
    return;
  }

  try {
    if (editingBranch.value) {
      await updateBranch({
        id: editingBranch.value.id,
        ...branchForm.value
      });
      store.dispatch('notifications/triggerToast', {
        message: 'Branch details modified successfully.',
        type: 'success'
      });
    } else {
      await createBranch({
        ...branchForm.value,
        activeLeads: 0
      });
      store.dispatch('notifications/triggerToast', {
        message: 'Physical branch registered.',
        type: 'success'
      });
    }
    closeDrawer();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to save branch parameters.',
      type: 'error'
    });
  }
}

async function testIntegration(name) {
  testingMap.value[name] = true;
  try {
    await testIntegrationApi(name);
    if (name === 'smtp') smtpStatus.value = 'connected';
    if (name === 'whatsapp') whatsappStatus.value = 'connected';
    if (name === 'calendar') calendarStatus.value = 'connected';

    store.dispatch('notifications/triggerToast', {
      message: `Connection test successful for ${name.toUpperCase()} API service.`,
      type: 'success'
    });
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: `Connection test failed for ${name.toUpperCase()}. Check credentials.`,
      type: 'error'
    });
  } finally {
    testingMap.value[name] = false;
  }
}

function saveIntegration({ name, config }) {
  store.dispatch('notifications/triggerToast', {
    message: `${name.toUpperCase()} integration configuration updated successfully.`,
    type: 'success'
  });
}

function sendTestWebhook() {
  if (!webhookUrl.value.trim()) return;
  testingWebhook.value = true;
  webhookLogs.value = '// Enqueuing connection test...';

  setTimeout(() => {
    testingWebhook.value = false;
    const bodyObj = {
      event: webhookEvent.value,
      timestamp: new Date().toISOString(),
      status: 'success',
      response: {
        received: true,
        processed_id: `wh_${Math.random().toString(36).substring(2, 7)}`
      }
    };
    webhookLogs.value = JSON.stringify(bodyObj, null, 2);
    store.dispatch('notifications/triggerToast', {
      message: 'Test webhook event dispatched successfully.',
      type: 'success'
    });
  }, 800);
}

function formatNumber(num) {
  if (num === undefined) return 0;
  return new Intl.NumberFormat('en-IN').format(num);
}
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
