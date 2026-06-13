<template>
  <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
    <div class="flex items-center justify-between border-b border-default pb-4">
      <div>
        <h3 class="text-sm font-bold text-slate-800">Automation Rule Builder</h3>
        <p class="text-[11px] text-slate-500">Trigger actions automatically when system events occur under set conditions.</p>
      </div>
      <div class="flex items-center space-x-2">
        <label class="text-xs font-semibold text-slate-600">Active Rule Profile:</label>
        <select
          v-model="selectedRuleId"
          class="bg-surface border border-default rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800 font-semibold"
          @change="loadRule"
        >
          <option value="new">+ Create Custom Rule</option>
          <option v-for="rule in rules" :key="rule.id" :value="rule.id">
            {{ rule.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Rule Configuration Form -->
    <div class="space-y-6">
      <!-- Rule General Metadata -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Rule Name *</label>
          <input
            v-model="ruleForm.name"
            type="text"
            placeholder="e.g. Site Visit Confirmation Notification"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2 text-xs outline-none focus:border-primary text-slate-800"
          />
        </div>
        <div class="flex items-end pb-2">
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="ruleForm.active" class="sr-only peer" />
            <div class="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            <span class="ms-3 text-xs font-bold text-slate-700">Enable Automation Rule</span>
          </label>
        </div>
      </div>

      <!-- Trigger Section -->
      <div class="bg-slate-50/50 border border-default rounded-xl p-4 space-y-3">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">1</div>
          <span class="text-xs font-bold text-slate-800">WHEN EVENT OCCURS (TRIGGER)</span>
        </div>
        <div class="max-w-md">
          <select
            v-model="ruleForm.trigger"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2 text-xs outline-none focus:border-primary text-slate-800"
          >
            <option value="" disabled>Select Event Trigger</option>
            <option v-for="t in triggers" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-slate-50/50 border border-default rounded-xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">2</div>
            <span class="text-xs font-bold text-slate-800">AND CONDITIONS MET (FILTERS)</span>
          </div>
          <button
            @click="addCondition"
            type="button"
            class="btn btn-sm btn-ghost text-[10px] h-7 px-2 gap-1 text-primary font-bold"
          >
            <PhPlus :size="11" />
            <span>Add AND/OR Condition</span>
          </button>
        </div>

        <div v-if="ruleForm.conditions.length === 0" class="text-slate-400 text-xs py-2 italic text-center">
          No filters set. This rule will trigger for all events.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(cond, idx) in ruleForm.conditions"
            :key="idx"
            class="flex items-center gap-2 bg-surface p-2 border border-default rounded-lg"
          >
            <select
              v-model="cond.field"
              class="w-1/3 bg-slate-50 border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
            >
              <option value="lead.score">Lead Score</option>
              <option value="lead.budget">Lead Budget (INR)</option>
              <option value="lead.location">Lead Preferred Location</option>
              <option value="lead.source">Lead Source</option>
              <option value="deal.value">Deal Value</option>
            </select>

            <select
              v-model="cond.operator"
              class="w-1/4 bg-slate-50 border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
            >
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="equals">equals</option>
              <option value="contains">contains</option>
            </select>

            <input
              v-model="cond.value"
              type="text"
              placeholder="Value"
              class="flex-1 bg-slate-50 border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
            />

            <button
              @click="removeCondition(idx)"
              type="button"
              class="btn btn-sm btn-ghost text-red-500 hover:text-red-655 p-1 h-7 w-7"
            >
              <PhX :size="12" />
            </button>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="bg-slate-50/50 border border-default rounded-xl p-4 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">3</div>
            <span class="text-xs font-bold text-slate-800">THEN EXECUTE ACTIONS</span>
          </div>
          <button
            @click="addAction"
            type="button"
            class="btn btn-sm btn-ghost text-[10px] h-7 px-2 gap-1 text-primary font-bold"
          >
            <PhPlus :size="11" />
            <span>Add Action Execution</span>
          </button>
        </div>

        <div v-if="ruleForm.actions.length === 0" class="text-slate-400 text-xs py-2 italic text-center">
          Add at least one execution action.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(act, idx) in ruleForm.actions"
            :key="idx"
            class="bg-surface p-3 border border-default rounded-lg space-y-3 relative"
          >
            <button
              @click="removeAction(idx)"
              type="button"
              class="absolute top-3 right-3 btn btn-sm btn-ghost text-red-500 hover:text-red-655 p-1 h-7 w-7"
            >
              <PhX :size="12" />
            </button>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-6">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">Action Type</label>
                <select
                  v-model="act.type"
                  class="w-full bg-slate-50 border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
                >
                  <option value="whatsapp">Send WhatsApp Message</option>
                  <option value="email">Send Email Template</option>
                  <option value="task">Create Task</option>
                  <option value="notify_manager">Notify Manager</option>
                </select>
              </div>

              <!-- Action Detail Subforms -->
              <div v-if="act.type === 'whatsapp'">
                <label class="block text-[10px] font-bold text-slate-500 mb-1">Select WhatsApp Template</label>
                <select
                  v-model="act.template"
                  class="w-full bg-slate-50 border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
                >
                  <option value="site_visit_details">Site Visit Details</option>
                  <option value="lead_welcome">Lead Welcome</option>
                  <option value="booking_alert">Booking Alert</option>
                </select>
              </div>

              <div v-else-if="act.type === 'email'">
                <label class="block text-[10px] font-bold text-slate-500 mb-1">Select Email Template</label>
                <select
                  v-model="act.template"
                  class="w-full bg-slate-50 border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
                >
                  <option value="welcome_email">Welcome Email Template</option>
                  <option value="outstanding_escalation">Payment Outstanding Dues</option>
                </select>
              </div>

              <div v-else-if="act.type === 'task'">
                <label class="block text-[10px] font-bold text-slate-500 mb-1">Task Title / Follow-up *</label>
                <input
                  v-model="act.title"
                  type="text"
                  placeholder="e.g. Call visitor 2h after visit"
                  class="w-full bg-slate-50 border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div v-else-if="act.type === 'notify_manager'">
                <label class="block text-[10px] font-bold text-slate-500 mb-1">Scope / Channel *</label>
                <input
                  v-model="act.scope"
                  type="text"
                  placeholder="e.g. Alert Branch Manager on Slack"
                  class="w-full bg-slate-50 border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer buttons -->
    <div class="flex items-center justify-between pt-4 border-t border-default">
      <button
        v-if="selectedRuleId !== 'new'"
        @click="deleteRule"
        class="btn-md btn-danger-outline gap-1.5"
        :disabled="isSaving"
      >
        <PhTrash :size="14" />
        <span>Delete Rule</span>
      </button>
      <div v-else></div>
      <div class="flex items-center space-x-2">
        <button
          @click="resetForm"
          class="btn-md btn-secondary"
          :disabled="isSaving"
        >
          Cancel
        </button>
        <button
          @click="saveRule"
          class="btn-md btn-primary gap-1.5"
          :disabled="isSaving"
        >
          <PhFloppyDisk :size="14" />
          <span>Save Active Rule</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { PhTrash, PhFloppyDisk, PhPlus, PhX } from '@phosphor-icons/vue';

const props = defineProps({
  rules: { type: Array, required: true },
  isSaving: { type: Boolean, default: false }
});

const emit = defineEmits(['save', 'delete']);

const triggers = [
  { value: 'lead_created', label: 'Lead Created' },
  { value: 'site_visit_scheduled', label: 'Site Visit Scheduled' },
  { value: 'deal_won', label: 'Deal Won' },
  { value: 'payment_received', label: 'Payment Received' }
];

const selectedRuleId = ref('new');

const initialRuleForm = () => ({
  name: '',
  active: true,
  trigger: 'lead_created',
  conditions: [],
  actions: []
});

const ruleForm = ref(initialRuleForm());

watch(() => props.rules, (newRules) => {
  if (newRules && newRules.length > 0 && selectedRuleId.value === 'new') {
    // If rules available and we are on new, check if we should select first
  }
}, { immediate: true });

function loadRule() {
  if (selectedRuleId.value === 'new') {
    ruleForm.value = initialRuleForm();
  } else {
    const rule = props.rules.find(r => r.id === selectedRuleId.value);
    if (rule) {
      // Deep clone rule
      ruleForm.value = JSON.parse(JSON.stringify(rule));
    }
  }
}

function addCondition() {
  ruleForm.value.conditions.push({
    field: 'lead.score',
    operator: '>=',
    value: '70'
  });
}

function removeCondition(idx) {
  ruleForm.value.conditions.splice(idx, 1);
}

function addAction() {
  ruleForm.value.actions.push({
    type: 'whatsapp',
    template: 'site_visit_details',
    title: '',
    scope: ''
  });
}

function removeAction(idx) {
  ruleForm.value.actions.splice(idx, 1);
}

function resetForm() {
  loadRule();
}

function saveRule() {
  if (!ruleForm.value.name.trim()) {
    alert('Please enter a rule name');
    return;
  }
  emit('save', {
    id: selectedRuleId.value === 'new' ? null : selectedRuleId.value,
    ...ruleForm.value
  });
}

function deleteRule() {
  if (confirm('Are you sure you want to delete this rule?')) {
    emit('delete', selectedRuleId.value);
    selectedRuleId.value = 'new';
    loadRule();
  }
}
</script>
