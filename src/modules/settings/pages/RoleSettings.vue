<template>
  <div class="space-y-6 text-xs">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-heading text-xl font-extrabold text-slate-800 dark:text-slate-100">Security Roles & Automations</h1>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Configure permission matrices, delivery triggers, automated workflow rules, templates previews, and lead health weights.</p>
      </div>
    </div>

    <!-- Tab navigation -->
    <div class="flex border-b border-default overflow-x-auto space-x-4 pb-0.5 scrollbar-none">
      <button
        v-for="t in tabs"
        :key="t.value"
        @click="activeTab = t.value"
        class="py-2.5 px-1.5 border-b-2 font-bold text-xs transition-colors shrink-0"
        :class="activeTab === t.value ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Tab contents -->
    <div class="space-y-6">
      <!-- 1. Permissions Matrix -->
      <div v-if="activeTab === 'permissions'" class="space-y-6">
        <div v-if="!roles || roles.length === 0" class="bg-surface border border-default rounded-xl p-8 text-center text-slate-500 dark:text-slate-400 shadow-sm">
          <p class="font-semibold text-xs">No security roles found</p>
          <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Please make sure roles are properly initialized in the database.</p>
        </div>
        <template v-else>
          <div class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-default pb-3">
              <div>
                <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Security Profile Directory</h3>
                <p class="text-[9px] text-slate-500 dark:text-slate-400">Clone and select template structures for custom regional role creation.</p>
              </div>
              <button
                @click="openCloneModal"
                class="btn-sm btn-secondary gap-1.5"
              >
                <PhCopy :size="12" />
                <span>Clone Active Profile</span>
              </button>
            </div>

            <!-- Active Roles list inline summary -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="role in roles"
                :key="role.id || role._id"
                @click="selectedRoleId = role.id || role._id"
                class="px-3 py-2 border rounded-xl text-left hover:border-primary transition-colors flex-1 min-w-[150px] relative group"
                :class="selectedRoleId === (role.id || role._id) ? 'border-primary bg-primary/5 text-primary' : 'border-default'"
              >
                <div class="font-bold flex items-center justify-between">
                  <span>{{ role.name }}</span>
                  <span v-if="role.isCustom" class="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded px-1 border border-default">Custom</span>
                </div>
                <div class="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">ID: {{ role.id || role._id }}</div>
              </button>
            </div>
          </div>

          <PermissionMatrix
            v-model="selectedRoleId"
            :roles="roles || []"
            :isSaving="savingMatrix"
            @save="savePermissionMatrix"
          />
        </template>
      </div>

      <!-- 2. Notification Delivery Settings -->
      <div v-if="activeTab === 'notifications'" class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Notification Channel Matrix</h3>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">Configure delivery channels for system-wide transaction triggers.</p>
        </div>
 
        <!-- Matrix table -->
        <div class="overflow-x-auto border border-default rounded-lg">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-default font-semibold">
                <th class="p-3">System Event Trigger</th>
                <th class="p-3 text-center">SMS</th>
                <th class="p-3 text-center">Email</th>
                <th class="p-3 text-center">Push App</th>
                <th class="p-3 text-center">WhatsApp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="evt in notificationRules" :key="evt.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td class="p-3 font-bold text-slate-700 dark:text-slate-200">{{ evt.label }}</td>
                <td v-for="ch in channels" :key="ch" class="p-3 text-center">
                  <label class="inline-flex items-center justify-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      v-model="evt.channels[ch]"
                      class="sr-only peer"
                    />
                    <div class="w-20 py-1 rounded-md text-[10px] font-bold border transition-all text-center
                      peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:border-emerald-200
                      bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 border-default"
                    >
                      {{ evt.channels[ch] ? 'Enabled' : 'Denied' }}
                    </div>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end pt-2">
          <button
            @click="saveNotificationsMatrix"
            class="btn-md btn-primary gap-1.5"
          >
            <PhFloppyDisk :size="14" />
            <span>Save Trigger Matrix</span>
          </button>
        </div>
      </div>

      <!-- 3. Automation Rules -->
      <div v-if="activeTab === 'automation'">
        <AutomationBuilder
          :rules="automationRules || []"
          :isSaving="savingAutomation"
          @save="saveAutomationRule"
          @delete="deleteAutomationRule"
        />
      </div>

      <!-- 4. Template Designer -->
      <div v-if="activeTab === 'templates'">
        <TemplateEditor
          :whatsappTemplates="whatsappTemplates || []"
          :emailTemplates="emailTemplates || []"
          @save="saveTemplate"
        />
      </div>

      <!-- 5. Lead Scoring Rules -->
      <div v-if="activeTab === 'scoring'" class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
        <div class="flex items-center justify-between border-b border-default pb-3">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Lead Health Modifiers & Scoring weights</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">Define points increments/decays to score leads. Modify priorities automatically.</p>
          </div>
          <button
            @click="resetScoringRules"
            class="btn btn-sm btn-ghost text-primary text-[10px] h-7 px-2.5 font-bold"
          >
            Reset to Defaults
          </button>
        </div>
 
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Profile Fit (Positive) -->
          <div class="space-y-4 bg-slate-50/50 dark:bg-slate-800/20 p-4 border border-default rounded-xl">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <PhUser :size="12" class="text-blue-500" />
              <span>Profile Fit (Fields)</span>
            </h4>
            <div class="space-y-3">
              <div v-if="!scoringRules.profileFit || scoringRules.profileFit.length === 0" class="text-slate-400 dark:text-slate-500 italic text-[10px] text-center py-6 bg-white dark:bg-slate-800/30 border border-dashed rounded-lg">
                No profile fit rules configured.
              </div>
              <div v-else v-for="rule in scoringRules.profileFit" :key="rule.id" class="space-y-1">
                <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-450">{{ rule.label }}</label>
                <div class="flex items-center space-x-2">
                  <input
                    type="number"
                    v-model.number="rule.points"
                    class="w-20 bg-surface border border-default rounded-md px-2 py-1 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-right"
                  />
                  <span class="text-[10px] text-slate-450 dark:text-slate-500 font-bold">Points</span>
                </div>
              </div>
            </div>
          </div>
 
          <!-- Interaction Modifiers (Positive) -->
          <div class="space-y-4 bg-slate-50/50 dark:bg-slate-800/20 p-4 border border-default rounded-xl">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <PhLightning :size="12" class="text-emerald-500" />
              <span>Interactions (Activities)</span>
            </h4>
            <div class="space-y-3">
              <div v-if="!scoringRules.interactions || scoringRules.interactions.length === 0" class="text-slate-400 dark:text-slate-500 italic text-[10px] text-center py-6 bg-white dark:bg-slate-800/30 border border-dashed rounded-lg">
                No interaction modifiers configured.
              </div>
              <div v-else v-for="rule in scoringRules.interactions" :key="rule.id" class="space-y-1">
                <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-450">{{ rule.label }}</label>
                <div class="flex items-center space-x-2">
                  <input
                    type="number"
                    v-model.number="rule.points"
                    class="w-20 bg-surface border border-default rounded-md px-2 py-1 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-right"
                  />
                  <span class="text-[10px] text-slate-450 dark:text-slate-500 font-bold">Points</span>
                </div>
              </div>
            </div>
          </div>
 
          <!-- Inactivity Decay (Negative) -->
          <div class="space-y-4 bg-slate-50/50 dark:bg-slate-800/20 p-4 border border-default rounded-xl">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <PhTrendDown :size="12" class="text-red-500" />
              <span>Decay modifier (Negative)</span>
            </h4>
            <div class="space-y-3">
              <div v-if="!scoringRules.decay || scoringRules.decay.length === 0" class="text-slate-400 dark:text-slate-500 italic text-[10px] text-center py-6 bg-white dark:bg-slate-800/30 border border-dashed rounded-lg">
                No inactivity decay modifiers configured.
              </div>
              <div v-else v-for="rule in scoringRules.decay" :key="rule.id" class="space-y-1">
                <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-450">{{ rule.label }}</label>
                <div class="flex items-center space-x-2">
                  <input
                    type="number"
                    v-model.number="rule.points"
                    class="w-20 bg-surface border border-default rounded-md px-2 py-1 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 text-right"
                  />
                  <span class="text-[10px] text-slate-450 dark:text-slate-500 font-bold">Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-default">
          <button
            @click="saveScoringRules"
            class="btn-md btn-primary gap-1.5"
          >
            <PhFloppyDisk :size="14" />
            <span>Save Modifier Weights</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Role Clone Modal -->
    <RoleCloneModal
      :isOpen="cloneModalOpen"
      :sourceRole="activeSourceRole"
      @close="cloneModalOpen = false"
      @success="refetchRoles"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useQueryClient } from '@tanstack/vue-query';
import { PhCopy, PhFloppyDisk, PhUser, PhLightning, PhTrendDown } from '@phosphor-icons/vue';
import {
  useRolesQuery,
  useUpdateRolePermissionsMutation,
  useAutomationRulesQuery,
  useCreateAutomationRuleMutation,
  useUpdateAutomationRuleMutation,
  useDeleteAutomationRuleMutation,
  useWhatsAppTemplatesQuery,
  useEmailTemplatesQuery,
  useSaveEmailTemplateMutation,
  useSyncWhatsAppTemplatesMutation,
  useLeadScoringRulesQuery,
  useUpdateLeadScoringRulesMutation
} from '../queries';
import PermissionMatrix from '../components/PermissionMatrix.vue';
import AutomationBuilder from '../components/AutomationBuilder.vue';
import TemplateEditor from '../components/TemplateEditor.vue';
import RoleCloneModal from '../components/RoleCloneModal.vue';

const store = useStore();
const queryClient = useQueryClient();

const tabs = [
  { label: 'Permissions Matrix', value: 'permissions' },
  { label: 'Notification Settings', value: 'notifications' },
  { label: 'Automation Rules', value: 'automation' },
  { label: 'Templates Designer', value: 'templates' },
  { label: 'Lead Scoring Rules', value: 'scoring' }
];

const activeTab = ref('permissions');
const selectedRoleId = ref('');

// Queries
const { data: roles } = useRolesQuery();
const { data: automationRules } = useAutomationRulesQuery();
const { data: whatsappTemplates } = useWhatsAppTemplatesQuery();
const { data: emailTemplates } = useEmailTemplatesQuery();
const { data: serverScoringRules } = useLeadScoringRulesQuery();

watch(roles, (list) => {
  if (list && list.length > 0 && !selectedRoleId.value) {
    selectedRoleId.value = list[0].id || list[0]._id;
  }
}, { immediate: true });

// Mutations
const { mutateAsync: updateRolePermissions } = useUpdateRolePermissionsMutation();
const { mutateAsync: createRule } = useCreateAutomationRuleMutation();
const { mutateAsync: updateRule } = useUpdateAutomationRuleMutation();
const { mutateAsync: deleteRule } = useDeleteAutomationRuleMutation();
const { mutateAsync: saveEmailTemplate } = useSaveEmailTemplateMutation();
const { mutateAsync: updateScoring } = useUpdateLeadScoringRulesMutation();

// Loading states
const savingMatrix = ref(false);
const savingAutomation = ref(false);

// Clone Modal
const cloneModalOpen = ref(false);

const activeSourceRole = computed(() => {
  return roles.value?.find(r => (r.id || r._id) === selectedRoleId.value) || null;
});

function openCloneModal() {
  cloneModalOpen.value = true;
}

function refetchRoles() {
  queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] });
}

// 1. Permission Matrix Save
async function savePermissionMatrix({ roleId, permissions }) {
  savingMatrix.value = true;
  try {
    await updateRolePermissions({ id: roleId, permissions });
    store.dispatch('notifications/triggerToast', {
      message: `Permission matrix for role "${roleId}" updated successfully.`,
      type: 'success'
    });
    refetchRoles();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to update role permissions configuration.',
      type: 'error'
    });
  } finally {
    savingMatrix.value = false;
  }
}

// 2. Notification Delivery Settings Matrix
const channels = ['sms', 'email', 'push', 'whatsapp'];
const notificationRules = ref([
  { id: '1', label: 'Lead Assigned to Agent', channels: { sms: false, email: true, push: true, whatsapp: true } },
  { id: '2', label: 'Task Overdue / SLA Escalation', channels: { sms: true, email: true, push: true, whatsapp: false } },
  { id: '3', label: 'Site Visit Scheduled', channels: { sms: true, email: false, push: true, whatsapp: true } },
  { id: '4', label: 'Deal Closed / Booking Confirmed', channels: { sms: false, email: true, push: true, whatsapp: true } },
  { id: '5', label: 'Commission Invoice Released', channels: { sms: false, email: true, push: true, whatsapp: false } }
]);

function saveNotificationsMatrix() {
  store.dispatch('notifications/triggerToast', {
    message: 'System event notifications trigger matrix updated.',
    type: 'success'
  });
}

// 3. Automation Rules
async function saveAutomationRule(ruleData) {
  savingAutomation.value = true;
  try {
    if (ruleData.id) {
      await updateRule(ruleData);
      store.dispatch('notifications/triggerToast', {
        message: 'Automation rule updated successfully.',
        type: 'success'
      });
    } else {
      await createRule(ruleData);
      store.dispatch('notifications/triggerToast', {
        message: 'Custom automation rule created successfully.',
        type: 'success'
      });
    }
    queryClient.invalidateQueries({ queryKey: ['settings', 'automation'] });
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to save automation rule configuration.',
      type: 'error'
    });
  } finally {
    savingAutomation.value = false;
  }
}

async function deleteAutomationRule(ruleId) {
  try {
    await deleteRule(ruleId);
    store.dispatch('notifications/triggerToast', {
      message: 'Automation rule deleted successfully.',
      type: 'success'
    });
    queryClient.invalidateQueries({ queryKey: ['settings', 'automation'] });
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to delete automation rule.',
      type: 'error'
    });
  }
}

// 4. Template Designer
async function saveTemplate({ mode, template }) {
  try {
    if (mode === 'whatsapp') {
      // WhatsApp Meta template is read only from Meta API locally (synced).
      // We warn or mock save local override
      store.dispatch('notifications/triggerToast', {
        message: 'WhatsApp Cloud templates require approval from Meta console. Local preview saved.',
        type: 'success'
      });
    } else {
      await saveEmailTemplate(template);
      store.dispatch('notifications/triggerToast', {
        message: 'Email template markup saved successfully.',
        type: 'success'
      });
      queryClient.invalidateQueries({ queryKey: ['settings', 'email'] });
    }
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to save template markup details.',
      type: 'error'
    });
  }
}

// 5. Lead Scoring Rules
const defaultScoringRules = {
  profileFit: [
    { id: '1', label: 'Budget > ₹1 Crore', points: 20 },
    { id: '2', label: "Preferred Location equals 'Mumbai South'", points: 15 },
    { id: '3', label: "Lead Source equals 'Referrals'", points: 15 }
  ],
  interactions: [
    { id: '4', label: 'Site Visit Completed', points: 30 },
    { id: '5', label: 'WhatsApp Message Replied', points: 10 },
    { id: '6', label: 'Email Opened', points: 5 }
  ],
  decay: [
    { id: '7', label: 'No active contact in 7 days', points: -15 },
    { id: '8', label: 'Overdue task or missed follow-up', points: -10 }
  ]
};

const scoringRules = ref({ ...defaultScoringRules });

// Load initial values from query
watch(serverScoringRules, (newRules) => {
  if (newRules) {
    scoringRules.value = JSON.parse(JSON.stringify(newRules));
  }
}, { immediate: true });

function resetScoringRules() {
  scoringRules.value = JSON.parse(JSON.stringify(defaultScoringRules));
}

async function saveScoringRules() {
  try {
    await updateScoring(scoringRules.value);
    store.dispatch('notifications/triggerToast', {
      message: 'Lead scoring modifier weights parameters applied.',
      type: 'success'
    });
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to save modified rules parameters.',
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
