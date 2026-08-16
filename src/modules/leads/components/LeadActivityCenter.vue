<template>
  <!-- Full-panel drawer or inline embed -->
  <Teleport :to="asDrawer ? 'body' : 'span'">
    <div
      v-if="asDrawer ? isOpen : true"
      :class="[
        asDrawer
          ? 'fixed inset-0 z-[150] flex items-start justify-end bg-black/40 backdrop-blur-sm'
          : 'w-full'
      ]"
      @click.self="asDrawer ? $emit('close') : null"
    >
      <div
        :class="[
          asDrawer
            ? 'relative h-full bg-surface shadow-2xl flex flex-col animate-slide-in-right overflow-hidden w-full max-w-3xl'
            : 'w-full flex flex-col'
        ]"
      >
        <!-- Header (only when drawer mode) -->
        <div v-if="asDrawer" class="px-5 py-4 border-b border-default bg-gradient-to-r from-violet-600/10 to-indigo-600/10 flex items-center justify-between shrink-0">
          <div>
            <h2 class="font-heading text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              🏠 Activity Center
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">360° View</span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ lead?.firstName }} {{ lead?.lastName || '' }} • Complete interaction history
            </p>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">✕</button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <div class="text-center space-y-3">
            <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p class="text-xs text-slate-500">Loading activity history...</p>
          </div>
        </div>

        <div v-else class="flex-1 overflow-y-auto">
          <!-- SUMMARY STATS STRIP -->
          <div class="px-4 py-3 border-b border-default bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
              <div v-for="stat in summaryStats" :key="stat.label" class="flex flex-col items-center p-2 rounded-xl bg-surface border border-default shadow-xs">
                <span class="text-lg leading-none">{{ stat.icon }}</span>
                <span class="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{{ stat.value }}</span>
                <span class="text-[9px] text-slate-400 text-center leading-tight mt-0.5">{{ stat.label }}</span>
              </div>
            </div>

            <!-- Next Follow-up Banner -->
            <div v-if="activityData?.summary?.nextFollowUp" class="mt-3 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              <span class="text-base">📅</span>
              <div class="text-xs">
                <span class="font-bold text-amber-700 dark:text-amber-300">Next Follow-up: </span>
                <span class="text-slate-700 dark:text-slate-300">{{ formatDateTime(activityData.summary.nextFollowUp.scheduledAt) }}</span>
                <span class="text-slate-500 ml-1">— {{ activityData.summary.nextFollowUp.notes || activityData.summary.nextFollowUp.type }}</span>
              </div>
            </div>

            <!-- Overdue Alert -->
            <div v-if="activityData?.summary?.overdueFollowUps > 0" class="mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <span class="text-base">⚠️</span>
              <span class="text-xs font-bold text-red-700 dark:text-red-300">
                {{ activityData.summary.overdueFollowUps }} overdue follow-up(s) — Action needed!
              </span>
            </div>
          </div>

          <!-- FILTER TABS + ADD BUTTON -->
          <div class="px-4 py-3 border-b border-default flex items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <button
                v-for="tab in filterTabs"
                :key="tab.key"
                @click="activeFilter = tab.key"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-all"
                :class="activeFilter === tab.key ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'"
              >
                {{ tab.icon }} {{ tab.label }}
                <span v-if="tab.count > 0" class="ml-0.5 text-[9px] opacity-70">({{ tab.count }})</span>
              </button>
            </div>
            <button
              @click="showAddActivity = true"
              class="btn btn-primary btn-sm text-xs font-bold px-3 shrink-0"
            >
              + Add Activity
            </button>
          </div>

          <!-- TIMELINE -->
          <div class="px-4 py-4 space-y-3">
            <div v-if="filteredTimeline.length === 0" class="text-center py-12 text-slate-400">
              <div class="text-3xl mb-2">📋</div>
              <p class="text-sm font-medium">No activity records found</p>
              <p class="text-xs mt-1">Click <b>+ Add Activity</b> to record the first interaction</p>
            </div>

            <div v-else class="relative pl-8 space-y-4">
              <!-- Date Group Headers -->
              <template v-for="(group, date) in groupedTimeline" :key="date">
                <!-- Date Divider -->
                <div class="flex items-center gap-3 -ml-8">
                  <span class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">{{ date }}</span>
                  <div class="flex-1 border-t border-default"></div>
                </div>

                <!-- Timeline items for this date -->
                <div
                  v-for="item in group"
                  :key="item._id || item.id"
                  class="relative group"
                >
                  <!-- Timeline dot -->
                  <span
                    class="absolute -left-8 top-2 w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center text-xs shadow-sm"
                    :class="getIconBgClass(item._type)"
                  >
                    {{ getIconLabel(item._type) }}
                  </span>

                  <!-- Item card -->
                  <div class="bg-surface border border-default rounded-xl p-3.5 shadow-xs hover:shadow-sm transition-all duration-150 ml-2">
                    <!-- Card header -->
                    <div class="flex items-start justify-between mb-1.5">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ getActivityTitle(item) }}</span>
                        <span v-if="item.isPrivate" class="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-100">🔒 Private</span>
                        <!-- Visit Status Badge -->
                        <span v-if="item.visitStatus" class="px-1.5 py-0.5 rounded text-[8px] font-bold capitalize" :class="getStatusBadgeClass(item.visitStatus)">{{ item.visitStatus }}</span>
                        <!-- Interest Badge -->
                        <span v-if="item.interestLevel" class="px-1.5 py-0.5 rounded text-[8px] font-semibold" :class="getInterestClass(item.interestLevel)">{{ interestLabel(item.interestLevel) }}</span>
                      </div>
                      <span class="text-[9px] text-slate-400 font-medium whitespace-nowrap ml-2">{{ formatTime(item.createdAt || item.visitDate || item.quotedDate || item.scheduledAt) }}</span>
                    </div>

                    <!-- Description -->
                    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {{ item.description || item.content || item.customerFeedback || item.notes }}
                    </p>

                    <!-- VISIT-specific details -->
                    <div v-if="item._type === 'visit' && item.propertiesShown?.length > 0" class="mt-2 flex flex-wrap gap-1">
                      <span class="text-[9px] font-medium text-slate-500">Properties:</span>
                      <span v-for="p in item.propertiesShown" :key="p._id" class="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-[9px] font-semibold border border-blue-100 dark:border-blue-800">
                        {{ p.title || p.unitNumber || 'Property' }}
                      </span>
                    </div>

                    <!-- QUOTATION-specific details -->
                    <div v-if="item._type === 'quotation'" class="mt-2 grid grid-cols-3 gap-2">
                      <div v-if="item.listPrice" class="text-center p-1.5 rounded bg-slate-50 dark:bg-slate-800">
                        <div class="text-[9px] text-slate-400">List Price</div>
                        <div class="text-xs font-bold text-slate-700 dark:text-slate-300">₹{{ formatAmount(item.listPrice) }}</div>
                      </div>
                      <div class="text-center p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/30">
                        <div class="text-[9px] text-emerald-600">Quoted Price</div>
                        <div class="text-xs font-bold text-emerald-700 dark:text-emerald-300">₹{{ formatAmount(item.quotedPrice) }}</div>
                      </div>
                      <div v-if="item.discount" class="text-center p-1.5 rounded bg-red-50 dark:bg-red-950/30">
                        <div class="text-[9px] text-red-500">Discount</div>
                        <div class="text-xs font-bold text-red-600">{{ item.discount }}%</div>
                      </div>
                      <div v-if="item.totalEstimatedCost" class="col-span-3 text-center p-1.5 rounded bg-violet-50 dark:bg-violet-950/30">
                        <div class="text-[9px] text-violet-500">Total Estimated Cost</div>
                        <div class="text-sm font-bold text-violet-700 dark:text-violet-300">₹{{ formatAmount(item.totalEstimatedCost) }}</div>
                      </div>
                    </div>

                    <!-- FOLLOW-UP details -->
                    <div v-if="item._type === 'followup'" class="mt-2 flex items-center gap-2 text-[10px]">
                      <span :class="getFollowUpStatusClass(item.status)" class="px-2 py-0.5 rounded-full font-bold capitalize">{{ item.status }}</span>
                      <span class="text-slate-500">{{ formatDateTime(item.scheduledAt) }}</span>
                      <span v-if="item.assignedTo" class="text-slate-400">• {{ item.assignedTo?.firstName }} {{ item.assignedTo?.lastName || '' }}</span>
                    </div>

                    <!-- Metadata: stage transition, etc. -->
                    <div v-if="item.metadata?.stageFrom && item.metadata?.stageTo" class="mt-1.5 text-[10px] text-slate-400">
                      Stage: <span class="font-semibold text-slate-600 dark:text-slate-300 capitalize">{{ item.metadata.stageFrom }}</span> → <span class="font-bold text-primary capitalize">{{ item.metadata.stageTo }}</span>
                    </div>

                    <!-- Author -->
                    <div class="mt-2 pt-2 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between text-[9px] text-slate-400">
                      <span>By: {{ item.performedBy?.firstName || item.createdBy?.firstName || item.quotedBy?.firstName || 'System' }} {{ item.performedBy?.lastName || item.createdBy?.lastName || item.quotedBy?.lastName || '' }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Add Activity Modal -->
  <AddActivityModal
    :isOpen="showAddActivity"
    :lead="lead"
    @close="showAddActivity = false"
    @saved="handleActivitySaved"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import AddActivityModal from './AddActivityModal.vue';
import { fetchActivityCenter } from '../api/endpoints';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  lead: { type: Object, default: null },
  asDrawer: { type: Boolean, default: true },
});

const emit = defineEmits(['close']);

const loading = ref(false);
const activityData = ref(null);
const activeFilter = ref('all');
const showAddActivity = ref(false);

const filterTabs = computed(() => {
  const s = activityData.value?.summary || {};
  const visits = activityData.value?.visits || [];
  const quotations = activityData.value?.quotations || [];
  const notes = activityData.value?.notes || [];
  const followUps = activityData.value?.followUps || [];
  const activities = activityData.value?.activities || [];

  const calls = activities.filter(a => a.type === 'call').length;
  const whatsapps = activities.filter(a => a.type === 'whatsapp').length;
  const meetings = activities.filter(a => a.type === 'meeting').length;

  return [
    { key: 'all', label: 'All', icon: '📋', count: 0 },
    { key: 'visit', label: 'Visits', icon: '🏠', count: visits.length },
    { key: 'call', label: 'Calls', icon: '📞', count: calls },
    { key: 'whatsapp', label: 'WhatsApp', icon: '💬', count: whatsapps },
    { key: 'meeting', label: 'Meetings', icon: '🤝', count: meetings },
    { key: 'quotation', label: 'Quotes', icon: '💰', count: quotations.length },
    { key: 'note', label: 'Notes', icon: '📝', count: notes.length },
    { key: 'followup', label: 'Follow-ups', icon: '📅', count: followUps.length },
  ];
});

const summaryStats = computed(() => {
  const s = activityData.value?.summary || {};
  return [
    { icon: '🏠', value: s.totalPropertyVisits || 0, label: 'Visits' },
    { icon: '📞', value: s.totalCalls || 0, label: 'Calls' },
    { icon: '💬', value: s.totalWhatsApp || 0, label: 'WhatsApp' },
    { icon: '🤝', value: s.totalMeetings || 0, label: 'Meetings' },
    { icon: '🏢', value: s.totalProjectsShown || 0, label: 'Projects' },
    { icon: '🏡', value: s.totalPropertiesShown || 0, label: 'Properties' },
    { icon: '💰', value: s.totalQuotations || 0, label: 'Quotes' },
    { icon: '📅', value: `${s.leadAgeDays || 0}d`, label: 'Lead Age' },
  ];
});

// Combined & filtered timeline
const allTimelineItems = computed(() => {
  if (!activityData.value) return [];
  const activities = (activityData.value.activities || []).map(a => ({ ...a, _type: a.type || 'activity', _date: a.createdAt }));
  const notes = (activityData.value.notes || []).map(n => ({ ...n, _type: 'note', description: n.content, _date: n.createdAt }));
  const followUps = (activityData.value.followUps || []).map(f => ({ ...f, _type: 'followup', description: f.notes, _date: f.scheduledAt || f.createdAt }));
  const visits = (activityData.value.visits || []).map(v => ({ ...v, _type: 'visit', description: v.customerFeedback || `Visit on ${formatDateShort(v.visitDate)}`, _date: v.visitDate || v.createdAt }));
  const quotations = (activityData.value.quotations || []).map(q => ({ ...q, _type: 'quotation', description: q.notes || `Quoted ₹${formatAmount(q.quotedPrice)}`, _date: q.quotedDate || q.createdAt }));

  return [...activities, ...notes, ...followUps, ...visits, ...quotations]
    .sort((a, b) => new Date(b._date) - new Date(a._date));
});

const filteredTimeline = computed(() => {
  if (activeFilter.value === 'all') return allTimelineItems.value;
  return allTimelineItems.value.filter(item => item._type === activeFilter.value);
});

const groupedTimeline = computed(() => {
  const groups = {};
  for (const item of filteredTimeline.value) {
    const dateKey = formatDateGroup(item._date);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
  }
  return groups;
});

async function loadActivityCenter() {
  if (!props.lead) return;
  loading.value = true;
  try {
    const res = await fetchActivityCenter(props.lead._id || props.lead.id);
    activityData.value = res.data || res;
  } catch (e) {
    activityData.value = null;
  } finally {
    loading.value = false;
  }
}

function handleActivitySaved() {
  showAddActivity.value = false;
  loadActivityCenter();
}

watch(() => [props.isOpen, props.lead], ([open]) => {
  if (open || !props.asDrawer) loadActivityCenter();
}, { immediate: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

function getIconBgClass(type) {
  const map = {
    call: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    whatsapp: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    meeting: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
    email: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    property_visit: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
    site_visit: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
    visit: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
    quotation: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    note: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350',
    followup: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    follow_up: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    stage_change: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
    assignment: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
    negotiation: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400',
    booking_discussion: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
    payment_discussion: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    loan_discussion: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
    registration_discussion: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  };
  return map[type] || 'bg-slate-50 text-slate-600 dark:bg-slate-900';
}

function getIconLabel(type) {
  const map = {
    call: '📞', whatsapp: '💬', meeting: '🤝', email: '✉️',
    property_visit: '🏠', site_visit: '🏗️', visit: '🏠',
    quotation: '💰', note: '📝', followup: '📅', follow_up: '📅',
    stage_change: '🔄', assignment: '👤', negotiation: '🤜',
    booking_discussion: '📋', payment_discussion: '💳',
    loan_discussion: '🏦', registration_discussion: '📝',
    property_shared: '📤', project_presented: '🏢',
    reminder: '🔔', other: '📌',
  };
  return map[type] || '📋';
}

function getActivityTitle(item) {
  const typeLabels = {
    call: 'Phone Call', whatsapp: 'WhatsApp Message', meeting: 'Meeting',
    email: 'Email', property_visit: 'Property Visit', site_visit: 'Site Visit',
    visit: 'Property Visit', quotation: 'Quotation / Rate Given', note: 'Note',
    followup: 'Follow-up', follow_up: 'Follow-up', stage_change: 'Stage Update',
    assignment: 'Assignment / Transfer', negotiation: 'Negotiation',
    booking_discussion: 'Booking Discussion', payment_discussion: 'Payment Discussion',
    loan_discussion: 'Loan Discussion', registration_discussion: 'Registration Discussion',
    property_shared: 'Property Shared', project_presented: 'Project Presented',
    reminder: 'Reminder Set', other: 'Activity',
  };
  return typeLabels[item._type] || item._type || 'Activity';
}

function getStatusBadgeClass(status) {
  const map = {
    scheduled: 'bg-blue-50 text-blue-700 border border-blue-100',
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    cancelled: 'bg-red-50 text-red-700 border border-red-100',
    no_show: 'bg-orange-50 text-orange-700 border border-orange-100',
    rescheduled: 'bg-amber-50 text-amber-700 border border-amber-100',
  };
  return map[status] || 'bg-slate-50 text-slate-600';
}

function getInterestClass(level) {
  const map = {
    very_interested: 'bg-red-50 text-red-700 border border-red-100',
    interested: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    maybe: 'bg-amber-50 text-amber-700 border border-amber-100',
    not_interested: 'bg-slate-100 text-slate-600',
  };
  return map[level] || '';
}

function interestLabel(level) {
  const map = {
    very_interested: '🔥 Very Interested',
    interested: '✅ Interested',
    maybe: '🤔 Maybe',
    not_interested: '❌ Not Interested',
  };
  return map[level] || level;
}

function getFollowUpStatusClass(status) {
  const map = {
    scheduled: 'bg-blue-50 text-blue-700',
    completed: 'bg-emerald-50 text-emerald-700',
    missed: 'bg-red-50 text-red-700',
    cancelled: 'bg-slate-100 text-slate-600',
  };
  return map[status] || 'bg-slate-50 text-slate-600';
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatDateGroup(dateStr) {
  if (!dateStr) return 'Unknown Date';
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatAmount(n) {
  if (!n) return '0';
  return Number(n).toLocaleString('en-IN');
}
</script>
