<template>
  <div v-if="isLoading" class="animate-pulse space-y-6">
    <div class="h-20 bg-slate-200 dark:bg-slate-850 rounded-xl w-full"></div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 h-96 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
      <div class="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
    </div>
  </div>

  <div v-else-if="!lead" class="text-center py-12 text-slate-500">
    Lead profile not found.
  </div>

  <div v-else class="space-y-6">
    <!-- Breadcrumb -->
    <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center space-x-1.5 uppercase tracking-wider shrink-0">
      <router-link to="/app/leads" class="hover:text-primary transition-colors">Leads</router-link>
      <span>/</span>
      <span class="text-slate-700 dark:text-slate-350">{{ lead.firstName }} {{ lead.lastName || '' }}</span>
    </div>

    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
      <div class="flex items-center space-x-4">
        <!-- Lead Avatar Circle -->
        <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-heading text-lg font-extrabold text-primary capitalize shrink-0">
          {{ lead.firstName.charAt(0) }}
        </div>
        <div>
          <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">
            {{ lead.firstName }} {{ lead.lastName || '' }}
          </h2>
          <div class="flex flex-wrap items-center gap-2 mt-1">
            <LeadStageBadge :stage="lead.status" />
            <span class="text-[10px] text-slate-400 font-medium">Score: <b>{{ lead.score }}</b></span>
          </div>
        </div>
      </div>

      <!-- Action Actions Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 self-end md:self-auto shrink-0">
        <!-- Reopen Lost Lead -->
        <button 
          v-if="lead.status === 'lost'"
          @click="isReopenOpen = true"
          class="bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3.5 py-1.8 rounded-lg hover:underline transition-all"
        >
          Reopen Lead
        </button>

        <template v-else-if="lead.status !== 'won'">
          <button 
            @click="isTransferOpen = true"
            class="px-3.5 py-1.8 border border-default text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Transfer context
          </button>
          <button 
            @click="isLostOpen = true"
            class="px-3.5 py-1.8 border border-red-200 text-xs font-semibold text-red-650 hover:bg-red-50 rounded-lg transition-colors"
          >
            Mark Lost
          </button>
          <button 
            @click="isWonOpen = true"
            class="px-4 py-1.8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            Convert Lead 🎉
          </button>
        </template>

        <button 
          @click="isEditOpen = true"
          class="px-3.5 py-1.8 border border-default text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Edit Profile
        </button>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left & Center Workspace -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Profiles Cards & Requirements (Double columns) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Lead details card -->
          <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
            <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
              Contact Profile Info
            </h4>
            <div class="space-y-2 text-[11px]">
              <div class="flex justify-between"><span class="text-slate-400">Mobile:</span><span class="font-bold text-slate-750 dark:text-slate-200">{{ lead.mobile }}</span></div>
              <div v-if="lead.alternativeMobile" class="flex justify-between"><span class="text-slate-400">Alt Mobile:</span><span class="font-medium text-slate-750 dark:text-slate-250">{{ lead.alternativeMobile }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Email:</span><span class="font-medium text-slate-750 dark:text-slate-250">{{ lead.email || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Source:</span><span class="font-semibold text-slate-750 dark:text-slate-250 capitalize">{{ lead.source }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Owner Agent:</span><span class="font-semibold text-slate-750 dark:text-slate-250">{{ lead.assignedTo?.firstName || 'Me' }} {{ lead.assignedTo?.lastName || '' }}</span></div>
            </div>
          </div>

          <!-- Requirements details card -->
          <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
            <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
              Property Requirements
            </h4>
            <div class="space-y-2 text-[11px]" v-if="lead.requirements">
              <div class="flex justify-between"><span class="text-slate-400">Property Types:</span><span class="font-bold text-slate-750 dark:text-slate-200 capitalize">{{ lead.requirements.propertyType?.join(', ') || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">BHK Sizes:</span><span class="font-bold text-slate-750 dark:text-slate-200">{{ lead.requirements.bhk?.join(', ') || '—' }} BHK</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Budget Range:</span><span class="font-bold text-slate-750 dark:text-slate-200">{{ formatBudget(lead.requirements.budget) }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Locality:</span><span class="font-semibold text-slate-750 dark:text-slate-250 capitalize">{{ lead.requirements.locations?.join(', ') || '—' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Log outreach panels tabs -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4" v-if="lead.status !== 'won'">
          <div class="flex space-x-1 border-b border-default pb-2 shrink-0">
            <button 
              v-for="logTab in ['activity', 'note', 'whatsapp']" 
              :key="logTab"
              @click="activeLogTab = logTab"
              class="px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors"
              :class="activeLogTab === logTab ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-700'"
            >
              {{ logTab }} log
            </button>
          </div>

          <!-- Log Activity tab -->
          <div v-if="activeLogTab === 'activity'" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <select v-model="logType" class="bg-surface border border-default rounded-lg px-3 py-1.5 outline-none font-medium">
                <option value="call">Phone Call</option>
                <option value="meeting">Personal Meeting</option>
                <option value="email">Email Outreach</option>
              </select>
              <input v-model="logOutcome" type="text" placeholder="Outcome (e.g. connected, busy...)" class="bg-surface border border-default rounded-lg px-3 py-1.5 outline-none" />
            </div>
            <textarea v-model="logDescription" rows="2" placeholder="Summary notes of call or meeting..." class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none resize-none"></textarea>
            <button @click="submitActivityLog" class="bg-primary hover:bg-opacity-90 text-white font-bold px-4 py-1.5 rounded-lg">Log Interaction</button>
          </div>

          <!-- Log Note tab -->
          <div v-if="activeLogTab === 'note'" class="space-y-3 text-xs">
            <textarea v-model="noteContent" rows="2" placeholder="Write internal team notes here..." class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none resize-none"></textarea>
            <div class="flex items-center justify-between">
              <label class="flex items-center space-x-1.5 cursor-pointer">
                <input type="checkbox" v-model="noteIsPrivate" class="rounded border-default text-primary" />
                <span class="text-[10px] text-slate-500">Lock as Private Note</span>
              </label>
              <button @click="submitNoteLog" class="bg-primary hover:bg-opacity-90 text-white font-bold px-4 py-1.5 rounded-lg">Save Note</button>
            </div>
          </div>

          <!-- WhatsApp Workspace Simulator tab -->
          <div v-if="activeLogTab === 'whatsapp'">
            <WhatsAppWorkspace 
              :leadId="lead._id || lead.id" 
              :leadName="lead.firstName" 
              @logActivity="handleWhatsAppLog"
              @scheduleOutreach="handleWhatsAppSchedule"
            />
          </div>
        </div>

        <!-- Main Details Workspace Tabs (Overview, Activities, Tasks, Site Visits, Deals, Documents, Audit Timeline) -->
        <div class="bg-surface border border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
          <!-- Desktop Tabs Header -->
          <header class="hidden md:flex border-b border-default px-4 bg-slate-50 shrink-0">
            <button 
              v-for="wTab in workspaceTabs" 
              :key="wTab.id"
              @click="activeWorkspaceTab = wTab.id"
              class="px-4 py-3 border-b-2 font-heading text-xs font-bold transition-all relative top-[1px]"
              :class="[
                activeWorkspaceTab === wTab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              ]"
            >
              {{ wTab.name }}
            </button>
          </header>

          <!-- Mobile Tabs Picker Header -->
          <div class="md:hidden p-3 border-b border-default bg-slate-50 shrink-0 flex items-center justify-between">
            <!-- Primary Mobile Tabs -->
            <div class="flex space-x-1">
              <button 
                v-for="wTab in workspaceTabs.slice(0, 3)" 
                :key="wTab.id"
                @click="activeWorkspaceTab = wTab.id"
                class="px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all"
                :class="activeWorkspaceTab === wTab.id ? 'bg-primary text-white' : 'text-slate-500'"
              >
                {{ wTab.name.split(' ')[0] }}
              </button>
            </div>

            <!-- More Tabs selector -->
            <select 
              v-model="activeWorkspaceTab"
              class="bg-surface border border-default rounded px-2.5 py-1 text-[10px] font-semibold text-slate-700"
            >
              <option v-for="wTab in workspaceTabs.slice(3)" :key="wTab.id" :value="wTab.id">
                {{ wTab.name }}
              </option>
            </select>
          </div>

          <!-- Tab Content Area -->
          <div class="p-4 flex-1">
            <!-- 1. OVERVIEW TAB -->
            <div v-if="activeWorkspaceTab === 'overview'" class="space-y-4">
              <FollowUpPanel 
                :tasks="tasksList" 
                @complete="handleTaskComplete"
                @schedule="activeWorkspaceTab = 'tasks'; activeLogTab = 'activity'; isSchedulingOutreach = true"
              />
              <div class="border border-default rounded-xl p-4 bg-slate-50/50">
                <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Requirements Notes</h5>
                <p class="text-xs text-slate-600 leading-relaxed">{{ lead.requirements?.notes || 'No notes specified.' }}</p>
              </div>
            </div>

            <!-- 2. ACTIVITIES TAB -->
            <div v-else-if="activeWorkspaceTab === 'activities'" class="space-y-3">
              <div v-for="act in loggedActivities" :key="act.id || act._id" class="p-3 border border-default rounded-xl bg-slate-50/40 text-xs flex items-center justify-between">
                <div>
                  <span class="font-bold capitalize text-slate-800 dark:text-slate-200">{{ act.type }} outreach</span>
                  <p class="text-[10px] text-slate-400 mt-0.5">{{ act.description }}</p>
                </div>
                <span class="text-[10px] text-slate-400">{{ formatTime(act.createdAt) }}</span>
              </div>
              <div v-if="loggedActivities.length === 0" class="text-center py-8 text-slate-400 text-xs">
                No logged outreach logs.
              </div>
            </div>

            <!-- 3. TASKS TAB -->
            <div v-else-if="activeWorkspaceTab === 'tasks'" class="space-y-3">
              <div v-for="task in tasksList" :key="task._id || task.id" class="p-3 border border-default rounded-xl bg-slate-50/40 text-xs flex items-center justify-between">
                <div>
                  <h5 class="font-bold text-slate-800 dark:text-slate-100">{{ task.title }}</h5>
                  <p class="text-[10px] text-slate-400 mt-0.5">Due: {{ formatTime(task.dueDate) }}</p>
                </div>
                <span 
                  class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                  :class="task.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                >
                  {{ task.status }}
                </span>
              </div>
              <div v-if="tasksList.length === 0" class="text-center py-8 text-slate-400 text-xs">
                No scheduled follow-up tasks.
              </div>
            </div>

            <!-- 4. SITE VISITS TAB -->
            <div v-else-if="activeWorkspaceTab === 'site_visits'" class="space-y-3">
              <div v-for="visit in siteVisits" :key="visit.id" class="p-3 border border-default rounded-xl bg-slate-50/40 text-xs flex items-center justify-between">
                <div>
                  <h5 class="font-bold text-slate-800 dark:text-slate-100">{{ visit.project }} Visit</h5>
                  <p class="text-[10px] text-slate-400 mt-0.5">Scheduled: {{ visit.date }}</p>
                </div>
                <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-50 text-blue-700">
                  {{ visit.status }}
                </span>
              </div>
              <div v-if="siteVisits.length === 0" class="text-center py-8 text-slate-400 text-xs">
                No site visits recorded.
              </div>
            </div>

            <!-- 5. DEALS TAB -->
            <div v-else-if="activeWorkspaceTab === 'deals'" class="space-y-3">
              <div v-if="lead.status === 'won'" class="p-4 border border-default rounded-xl bg-emerald-50/20 text-xs flex items-center justify-between">
                <div>
                  <h5 class="font-bold text-slate-800">Deal #DL-88301 (Initiated)</h5>
                  <p class="text-[10px] text-slate-400 mt-0.5">Conversion deal created on won transition.</p>
                </div>
                <router-link to="/app/deals" class="text-xs text-primary font-bold hover:underline">View Deal ➔</router-link>
              </div>
              <div v-else class="text-center py-8 text-slate-400 text-xs">
                Deals are created upon marking lead Won.
              </div>
            </div>

            <!-- 6. DOCUMENTS TAB -->
            <div v-else-if="activeWorkspaceTab === 'documents'" class="grid grid-cols-2 gap-3 text-xs">
              <div v-for="doc in documents" :key="doc.id" class="p-2.5 border border-default rounded-lg bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span class="font-bold text-slate-700 truncate block max-w-[120px]">{{ doc.name }}</span>
                  <span class="text-[9px] text-slate-400 block">{{ doc.size }}</span>
                </div>
                <button class="text-primary hover:underline">Download</button>
              </div>
              <div v-if="documents.length === 0" class="col-span-2 text-center py-8 text-slate-400">
                No KYC documents uploaded.
              </div>
            </div>

            <!-- 7. AUDIT TIMELINE TAB -->
            <div v-else-if="activeWorkspaceTab === 'timeline'">
              <LeadTimeline 
                :activities="loggedActivities" 
                :notes="loggedNotes" 
                :tasks="tasksList" 
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column Action Sidebar -->
      <div class="lg:col-span-4 shrink-0">
        <LeadCommandCenter 
          :lead="lead" 
          :activities="loggedActivities" 
          :tasks="tasksList" 
        />
      </div>
    </div>

    <!-- Modals & Drawers mounts -->
    <LeadEditDrawer 
      :isOpen="isEditOpen" 
      :lead="lead"
      @close="isEditOpen = false"
      @success="refetch"
      @merge="handleMergeTrigger"
    />

    <LeadTransferDrawer 
      :isOpen="isTransferOpen" 
      :lead="lead"
      @close="isTransferOpen = false"
      @success="refetch"
    />

    <LeadLostModal 
      :isOpen="isLostOpen" 
      :leadId="leadId"
      @close="isLostOpen = false"
      @success="refetch"
    />

    <LeadConversionDrawer 
      :isOpen="isWonOpen" 
      :lead="lead"
      @close="isWonOpen = false"
      @success="refetch"
    />

    <LeadReopenModal 
      :isOpen="isReopenOpen" 
      :leadId="leadId"
      @close="isReopenOpen = false"
      @success="refetch"
    />

    <LeadMergeModal
      v-if="isMergeOpen"
      :isOpen="isMergeOpen"
      :leadA="mergeLeadA"
      :leadB="mergeLeadB"
      @close="isMergeOpen = false"
      @success="handleMergeSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useQuery } from '@tanstack/vue-query';
import apiClient from '@/api/client';
import LeadStageBadge from '../components/LeadStageBadge.vue';
import LeadTimeline from '../components/LeadTimeline.vue';
import WhatsAppWorkspace from '../components/WhatsAppWorkspace.vue';
import FollowUpPanel from '../components/FollowUpPanel.vue';
import LeadCommandCenter from '../components/LeadCommandCenter.vue';
import LeadEditDrawer from '../components/LeadEditDrawer.vue';
import LeadTransferDrawer from '../components/LeadTransferDrawer.vue';
import LeadLostModal from '../components/LeadLostModal.vue';
import LeadConversionDrawer from '../components/LeadConversionDrawer.vue';
import LeadReopenModal from '../components/LeadReopenModal.vue';
import LeadMergeModal from '../components/LeadMergeModal.vue';
import { useLeadQuery, useAddLeadNoteMutation, useLogLeadActivityMutation, useAddLeadFollowUpMutation } from '../queries';

const route = useRoute();
const router = useRouter();
const store = useStore();
const leadId = computed(() => route.params.id);

// Load lead details
const { data: leadData, isLoading, refetch } = useLeadQuery(leadId);
const lead = computed(() => leadData.value?.data || null);

// Load linked tasks/follow-ups via /tasks?leadId=:id
const { data: tasksData, refetch: refetchTasks } = useQuery({
  queryKey: ['leads', leadId, 'tasks'],
  queryFn: () => apiClient.get('/tasks', { params: { leadId: leadId.value } }).then(res => res.data),
  enabled: !!leadId
});

const tasksList = computed(() => {
  return tasksData.value?.data || [];
});

const activeLogTab = ref('activity');
const activeWorkspaceTab = ref('overview');

// 1. Tab forms states
const logType = ref('call');
const logOutcome = ref('');
const logDescription = ref('');

const noteContent = ref('');
const noteIsPrivate = ref(false);

const workspaceTabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'activities', name: 'Activities' },
  { id: 'tasks', name: 'Follow-ups' },
  { id: 'site_visits', name: 'Site Visits' },
  { id: 'deals', name: 'Deals' },
  { id: 'documents', name: 'Documents' },
  { id: 'timeline', name: 'Audit Timeline' }
];

// Local timeline appends to support live updates in UI
const localActivities = ref([]);
const localNotes = ref([]);

const loggedActivities = computed(() => {
  // Combine database logs (if lead has activity logs, wait! lead detail doesn't include activity logs, so we combine local session logs)
  return localActivities.value;
});

const loggedNotes = computed(() => {
  return localNotes.value;
});

// Mock sub-items to make detail workspace look live and realistic
const siteVisits = ref([
  { id: 'sv-1', project: 'Prestige Heights', date: '2026-06-05 11:00 AM', status: 'scheduled' }
]);
const documents = ref([
  { id: 'doc-1', name: 'PAN_Card_Verification.pdf', size: '240 KB' },
  { id: 'doc-2', name: 'Aadhaar_KYC_Front.jpg', size: '480 KB' }
]);

// Actions overlays togglers
const isEditOpen = ref(false);
const isTransferOpen = ref(false);
const isLostOpen = ref(false);
const isWonOpen = ref(false);
const isReopenOpen = ref(false);

const { mutateAsync: addNote } = useAddLeadNoteMutation();
const { mutateAsync: logActivity } = useLogLeadActivityMutation();
const { mutateAsync: addFollowUp } = useAddLeadFollowUpMutation();

const submitActivityLog = async () => {
  if (!logDescription.value.trim()) return;

  try {
    const res = await logActivity({
      id: leadId.value,
      type: logType.value,
      description: logDescription.value,
      metadata: { outcome: logOutcome.value }
    });

    localActivities.value.push({
      id: res.data?._id || Date.now(),
      type: logType.value,
      description: logDescription.value,
      createdAt: new Date().toISOString(),
      metadata: { outcome: logOutcome.value }
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Interaction logged successfully.',
      type: 'success'
    });

    // Clear form
    logDescription.value = '';
    logOutcome.value = '';
    refetch(); // Invalidate main lead query
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to log outreach activity.',
      type: 'error'
    });
  }
};

const submitNoteLog = async () => {
  if (!noteContent.value.trim()) return;

  try {
    const res = await addNote({
      id: leadId.value,
      content: noteContent.value,
      isPrivate: noteIsPrivate.value
    });

    localNotes.value.push({
      id: res.data?._id || Date.now(),
      content: noteContent.value,
      isPrivate: noteIsPrivate.value,
      createdAt: new Date().toISOString()
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Internal note added.',
      type: 'success'
    });

    // Clear form
    noteContent.value = '';
    noteIsPrivate.value = false;
    refetch();
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to save note.',
      type: 'error'
    });
  }
};

const handleWhatsAppLog = async ({ type, description, metadata }) => {
  try {
    const res = await logActivity({
      id: leadId.value,
      type,
      description,
      metadata
    });

    localActivities.value.push({
      id: res.data?._id || Date.now(),
      type,
      description,
      createdAt: new Date().toISOString(),
      metadata
    });

    refetch();
  } catch (error) {
    console.error('Failed to log WhatsApp activity:', error);
  }
};

const handleWhatsAppSchedule = async ({ scheduledAt, type, notes }) => {
  try {
    await addFollowUp({
      id: leadId.value,
      scheduledAt,
      type,
      notes
    });

    store.dispatch('notifications/triggerToast', {
      message: 'WhatsApp follow-up scheduled.',
      type: 'success'
    });
    refetchTasks();
    refetch();
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to schedule follow-up.',
      type: 'error'
    });
  }
};

const handleTaskComplete = async (taskId) => {
  try {
    await apiClient.post(`/tasks/${taskId}/complete`, { outcome: 'outreach connected' });
    store.dispatch('notifications/triggerToast', {
      message: 'Outreach follow-up task marked completed.',
      type: 'success'
    });
    refetchTasks();
    refetch();
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to complete task.',
      type: 'error'
    });
  }
};

const formatBudget = (budget) => {
  if (!budget) return '—';
  const formatNum = (num) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)} L`;
    return `$${num.toLocaleString()}`;
  };
  return `${formatNum(budget.min || 0)} - ${formatNum(budget.max || 0)}`;
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isMergeOpen = ref(false);
const mergeLeadA = ref(null);
const mergeLeadB = ref(null);

const handleMergeTrigger = ({ leadA, leadB }) => {
  mergeLeadA.value = leadA;
  mergeLeadB.value = leadB;
  
  isEditOpen.value = false;
  isMergeOpen.value = true;
};

const handleMergeSuccess = () => {
  const survivorId = mergeLeadA.value?._id || mergeLeadA.value?.id;
  const deletedId = mergeLeadB.value?._id || mergeLeadB.value?.id;
  
  if (leadId.value === deletedId) {
    router.push(`/app/leads/${survivorId}`);
  } else {
    refetch();
    refetchTasks();
  }
};
</script>
