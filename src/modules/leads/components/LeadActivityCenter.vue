<template>
  <!-- Full-panel drawer or inline embed -->
  <Teleport :to="asDrawer ? 'body' : 'span'">
    <div
      v-if="asDrawer ? isOpen : true"
      :class="[
        asDrawer
          ? 'fixed inset-0 z-[150] flex items-start justify-end bg-black/40 backdrop-blur-xs'
          : 'w-full'
      ]"
      @click.self="asDrawer ? $emit('close') : null"
    >
      <div
        :class="[
          asDrawer
            ? 'relative h-full bg-surface shadow-2xl flex flex-col animate-slide-in-right overflow-hidden w-full max-w-3xl border-l border-default'
            : 'w-full flex flex-col'
        ]"
      >
        <!-- Header (only when drawer mode) -->
        <div v-if="asDrawer" class="px-5 py-4 border-b border-default bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <PhClockCounterClockwise :size="18" weight="bold" />
            </div>
            <div>
              <h2 class="font-heading text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Lead Activity Center
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">360° View</span>
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ lead?.firstName }} {{ lead?.lastName || '' }} • Complete chronological sales interaction timeline
              </p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition" aria-label="Close"><AppIcon name="close" :size="14" weight="bold" /></button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex-1 flex items-center justify-center p-12">
          <div class="text-center space-y-3">
            <div class="w-9 h-9 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p class="text-xs font-medium text-slate-500">Loading interactions...</p>
          </div>
        </div>

        <div v-else class="flex-1 overflow-y-auto">
          <!-- SUMMARY STRIP & ALERTS -->
          <div class="px-5 py-3.5 border-b border-default bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <!-- Metric chips -->
            <div class="grid grid-cols-4 sm:grid-cols-7 gap-2">
              <div
                v-for="stat in summaryMetrics"
                :key="stat.label"
                class="flex flex-col items-center justify-center p-2 rounded-xl bg-surface border border-default shadow-2xs text-center"
              >
                <div class="w-6 h-6 rounded-md flex items-center justify-center text-xs mb-1" :class="stat.bgClass">
                  <component :is="stat.icon" :size="13" weight="bold" />
                </div>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">{{ stat.value }}</span>
                <span class="text-[9px] text-slate-400 font-medium leading-tight mt-1">{{ stat.label }}</span>
              </div>
            </div>

            <!-- Next Follow-up Alert Banner -->
            <div v-if="activityData?.summary?.nextFollowUp" class="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 rounded-xl px-3.5 py-2 shadow-2xs">
              <span class="text-amber-600 dark:text-amber-400">
                <PhCalendarCheck :size="16" weight="fill" />
              </span>
              <div class="text-xs flex-1">
                <span class="font-bold text-amber-800 dark:text-amber-300">Next Follow-up: </span>
                <span class="text-slate-700 dark:text-slate-300 font-semibold">{{ formatDateTime(activityData.summary.nextFollowUp.scheduledAt) }}</span>
                <span class="text-slate-500 ml-1.5">— {{ activityData.summary.nextFollowUp.notes || activityData.summary.nextFollowUp.type }}</span>
              </div>
            </div>

            <!-- Overdue Alert -->
            <div v-if="activityData?.summary?.overdueFollowUps > 0" class="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-800/80 rounded-xl px-3.5 py-2 shadow-2xs">
              <span class="text-red-600 dark:text-red-400">
                <PhWarningCircle :size="16" weight="fill" />
              </span>
              <span class="text-xs font-bold text-red-700 dark:text-red-300">
                {{ activityData.summary.overdueFollowUps }} overdue follow-up(s) pending — Immediate action required!
              </span>
            </div>
          </div>

          <!-- CONTROLS: SEARCH + FILTER TABS + ADD BUTTON -->
          <div class="px-5 py-3 border-b border-default space-y-2.5 bg-surface sticky top-0 z-10">
            <div class="flex items-center justify-between gap-3">
              <!-- Search box -->
              <div class="relative flex-1 max-w-xs">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search activities..."
                  class="form-input w-full text-xs pl-8 py-1.5"
                />
                <span class="absolute left-2.5 top-2 text-slate-400">
                  <PhMagnifyingGlass :size="13" />
                </span>
              </div>

              <!-- Add Activity Button -->
              <button
                @click="openAddActivity"
                class="btn btn-primary btn-sm text-xs font-bold px-3.5 flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <PhPlus :size="13" weight="bold" />
                <span>Add Activity</span>
              </button>
            </div>

            <!-- Filter tabs -->
            <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pt-0.5">
              <button
                v-for="tab in filterTabs"
                :key="tab.key"
                @click="activeFilter = tab.key"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1"
                :class="activeFilter === tab.key ? 'bg-primary text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'"
              >
                <span>{{ tab.label }}</span>
                <span v-if="tab.count > 0" class="text-[9px] px-1 py-0.2 rounded-full" :class="activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'">
                  {{ tab.count }}
                </span>
              </button>
            </div>
          </div>

          <!-- TIMELINE CONTAINER -->
          <div class="p-5 space-y-4">
            <!-- Empty state -->
            <div v-if="filteredTimeline.length === 0" class="text-center py-16 px-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <PhNotePencil :size="24" />
              </div>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-300">No interaction records found</p>
              <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Click <span class="font-bold text-primary">+ Add Activity</span> above to record site visits, calls, quotations, negotiations, or follow-ups.</p>
            </div>

            <!-- Grouped by Date -->
            <div v-else class="space-y-6">
              <div v-for="(items, dateLabel) in groupedTimeline" :key="dateLabel" class="space-y-3">
                <!-- Date divider -->
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80">
                    {{ dateLabel }}
                  </span>
                  <div class="flex-1 border-t border-default"></div>
                </div>

                <!-- Activity Cards -->
                <div class="space-y-3 pl-1">
                  <div
                    v-for="item in items"
                    :key="item._id || item.id"
                    class="bg-surface rounded-xl border border-default p-4 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group border-l-4"
                    :class="getCardAccentBorder(item)"
                  >
                    <!-- Card Header -->
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        <!-- Icon Container -->
                        <div class="w-6 h-6 rounded-md flex items-center justify-center text-xs" :class="getActivityColorClass(item)">
                          <component :is="getActivityIcon(item)" :size="13" weight="bold" />
                        </div>
                        <span class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ getActivityTitle(item) }}</span>

                        <!-- Status Badge -->
                        <span
                          v-if="item.status || item.visitStatus"
                          class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                          :class="getStatusBadgeClass(item.status || item.visitStatus)"
                        >
                          {{ formatStatus(item.status || item.visitStatus) }}
                        </span>

                        <!-- Private Badge -->
                        <span v-if="item.isPrivate" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <AppIcon name="lock" :size="11" class="inline mr-1" /> Internal team only
                        </span>

                        <!-- Interest Badge -->
                        <span v-if="item.interestLevel" class="px-1.5 py-0.5 rounded text-[9px] font-semibold" :class="getInterestClass(item.interestLevel)">
                          {{ interestLabel(item.interestLevel) }}
                        </span>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        <span class="text-[10px] font-medium text-slate-400">
                          {{ formatTime(item.activityDate || item.createdAt || item.visitDate || item.quotedDate || item.scheduledAt) }}
                        </span>
                      </div>
                    </div>

                    <!-- PRIMARY INFORMATION / SPECIFIC FIELDS -->

                    <!-- Property Visit Properties -->
                    <div v-if="(item.type === 'property_visit' || item._type === 'visit') && item.propertiesShown?.length > 0" class="mb-2 flex flex-wrap gap-1.5">
                      <span class="text-[10px] font-semibold text-slate-400">Properties Shown:</span>
                      <span
                        v-for="p in item.propertiesShown"
                        :key="p._id || p"
                        class="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-200/60 dark:border-blue-800/60"
                      >
                        {{ p.title || p.unitNumber || 'Property' }}
                      </span>
                    </div>

                    <!-- Quotation Box -->
                    <div v-if="item.type === 'quotation' || item._type === 'quotation'" class="mb-2.5 p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div v-if="item.listPrice">
                        <div class="text-[9px] text-slate-400">List Price</div>
                        <div class="text-xs font-bold text-slate-700 dark:text-slate-300">₹{{ formatAmount(item.listPrice) }}</div>
                      </div>
                      <div>
                        <div class="text-[9px] text-teal-600 dark:text-teal-400 font-bold">Quoted Offer</div>
                        <div class="text-xs font-bold text-teal-700 dark:text-teal-300">₹{{ formatAmount(item.quotedPrice) }}</div>
                      </div>
                      <div v-if="item.discount">
                        <div class="text-[9px] text-red-500">Discount</div>
                        <div class="text-xs font-bold text-red-600">{{ item.discount }}%</div>
                      </div>
                      <div v-if="item.totalEstimatedCost">
                        <div class="text-[9px] text-violet-600 dark:text-violet-400 font-bold">Total Estimated</div>
                        <div class="text-xs font-bold text-violet-700 dark:text-violet-300">₹{{ formatAmount(item.totalEstimatedCost) }}</div>
                      </div>
                    </div>

                    <!-- Negotiation Box -->
                    <div v-if="item.type === 'negotiation' && (item.metadata?.customerExpectedPrice || item.metadata?.negotiatedPrice)" class="mb-2.5 p-2.5 rounded-lg bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/60 grid grid-cols-3 gap-2 text-center">
                      <div v-if="item.metadata?.quotedPrice">
                        <div class="text-[9px] text-slate-400">Quoted</div>
                        <div class="text-xs font-bold text-slate-700 dark:text-slate-300">₹{{ formatAmount(item.metadata.quotedPrice) }}</div>
                      </div>
                      <div v-if="item.metadata?.customerExpectedPrice">
                        <div class="text-[9px] text-amber-600 dark:text-amber-400 font-bold">Customer Expected</div>
                        <div class="text-xs font-bold text-amber-700 dark:text-amber-300">₹{{ formatAmount(item.metadata.customerExpectedPrice) }}</div>
                      </div>
                      <div v-if="item.metadata?.negotiatedPrice">
                        <div class="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">Negotiated Deal</div>
                        <div class="text-xs font-bold text-emerald-700 dark:text-emerald-300">₹{{ formatAmount(item.metadata.negotiatedPrice) }}</div>
                      </div>
                    </div>

                    <!-- Property Shared details -->
                    <div v-if="item.type === 'property_shared' && (item.metadata?.propertyName || item.metadata?.quotedPrice)" class="mb-2 text-xs font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-2">
                      <span class="inline-flex items-center gap-1"><AppIcon name="house" :size="11" /> {{ item.metadata?.propertyName }}</span>
                      <span v-if="item.metadata?.configuration">• {{ item.metadata?.configuration }}</span>
                      <span v-if="item.metadata?.quotedPrice" class="text-slate-800 dark:text-slate-100 font-bold">• ₹{{ formatAmount(item.metadata.quotedPrice) }}</span>
                    </div>

                    <!-- SUMMARY / NOTES -->
                    <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {{ item.summary || item.description || item.content || item.customerFeedback || item.notes }}
                    </p>

                    <!-- CUSTOMER RESPONSE -->
                    <div v-if="item.customerResponse" class="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-default text-xs">
                      <span class="font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Customer Feedback:</span>
                      <span class="text-slate-700 dark:text-slate-300">{{ item.customerResponse }}</span>
                    </div>

                    <!-- NEXT FOLLOW-UP ALERT PILL -->
                    <div v-if="item.nextFollowUpAt || item.followUpDate" class="mt-2.5 flex items-center gap-2 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 px-2.5 py-1 rounded-md border border-amber-200/60 dark:border-amber-800/60 w-fit">
                      <PhCalendarCheck :size="12" weight="bold" />
                      <span>Next Follow-up: {{ formatDateTime(item.nextFollowUpAt || item.followUpDate) }}</span>
                    </div>

                    <!-- CARD FOOTER: Added by + Action buttons -->
                    <div class="mt-3 pt-2.5 border-t border-default flex items-center justify-between text-[10px] text-slate-400">
                      <span class="flex items-center gap-1">
                        <PhUser :size="11" />
                        <span>By {{ item.performedBy?.firstName || item.createdBy?.firstName || item.quotedBy?.firstName || 'System' }} {{ item.performedBy?.lastName || item.createdBy?.lastName || '' }}</span>
                      </span>

                      <!-- Edit / Delete actions -->
                      <div class="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          @click="openEditActivity(item)"
                          class="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:text-primary transition text-[10px] font-semibold flex items-center gap-1"
                        >
                          <PhPencilSimple :size="11" />
                          <span>Edit</span>
                        </button>
                        <button
                          @click="confirmDelete(item)"
                          class="px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition text-[10px] font-semibold flex items-center gap-1"
                        >
                          <PhTrash :size="11" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Add / Edit Activity Modal -->
  <AddActivityModal
    :isOpen="showAddActivity"
    :lead="lead"
    :editItem="editingItem"
    @close="closeAddActivity"
    @saved="handleActivitySaved"
  />

  <!-- Delete Confirmation Modal -->
  <Teleport to="body">
    <div
      v-if="itemToDelete"
      class="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div class="bg-surface rounded-2xl border border-default p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
          <PhWarning :size="22" weight="bold" />
        </div>
        <div class="text-center space-y-1">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Delete Activity Record?</h3>
          <p class="text-xs text-slate-500">
            Are you sure you want to delete this activity? This interaction will be removed from the lead timeline.
          </p>
        </div>
        <div class="flex items-center gap-3 pt-2">
          <button
            @click="itemToDelete = null"
            class="flex-1 btn btn-secondary btn-sm text-xs py-2"
          >
            Cancel
          </button>
          <button
            @click="executeDelete"
            :disabled="deleting"
            class="flex-1 btn btn-danger btn-sm text-xs py-2 font-bold flex items-center justify-center gap-1.5"
          >
            <span v-if="deleting" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import AddActivityModal from './AddActivityModal.vue';
import {
  fetchActivityCenter,
  deleteLeadActivity,
  deleteVisit,
  deleteQuotation,
  deleteLeadNote,
  deleteLeadFollowUp,
} from '../api/endpoints';

import {
  PhPhone,
  PhChatCircleDots,
  PhUsers,
  PhHouseLine,
  PhBuildings,
  PhEnvelopeSimple,
  PhCalendarCheck,
  PhShareNetwork,
  PhProjectorScreenChart,
  PhReceipt,
  PhScales,
  PhBookmarkSimple,
  PhCreditCard,
  PhBank,
  PhStamp,
  PhBell,
  PhNotePencil,
  PhSparkle,
  PhClockCounterClockwise,
  PhWarningCircle,
  PhMagnifyingGlass,
  PhPlus,
  PhPencilSimple,
  PhTrash,
  PhUser,
  PhWarning,
} from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  lead: { type: Object, default: null },
  asDrawer: { type: Boolean, default: true },
});

const emit = defineEmits(['close']);

const loading = ref(false);
const activityData = ref(null);
const activeFilter = ref('all');
const searchQuery = ref('');

const showAddActivity = ref(false);
const editingItem = ref(null);
const itemToDelete = ref(null);
const deleting = ref(false);

async function loadActivities() {
  const leadId = props.lead?._id || props.lead?.id;
  if (!leadId) return;

  loading.value = true;
  try {
    const res = await fetchActivityCenter(leadId);
    activityData.value = res?.data || null;
  } catch (err) {
    console.error('Failed to fetch activity center:', err);
  } finally {
    loading.value = false;
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    loadActivities();
  }
}, { immediate: true });

function openAddActivity() {
  editingItem.value = null;
  showAddActivity.value = true;
}

function openEditActivity(item) {
  editingItem.value = item;
  showAddActivity.value = true;
}

function closeAddActivity() {
  showAddActivity.value = false;
  editingItem.value = null;
}

function handleActivitySaved() {
  loadActivities();
}

function confirmDelete(item) {
  itemToDelete.value = item;
}

async function executeDelete() {
  if (!itemToDelete.value) return;

  const leadId = props.lead?._id || props.lead?.id;
  const item = itemToDelete.value;
  const itemId = item._id || item.id;

  deleting.value = true;
  try {
    if (item._type === 'visit' || item.type === 'property_visit') {
      await deleteVisit({ leadId, visitId: itemId });
    } else if (item._type === 'quotation' || item.type === 'quotation') {
      await deleteQuotation({ leadId, quotationId: itemId });
    } else if (item._type === 'note' || item.type === 'note') {
      await deleteLeadNote({ leadId, noteId: itemId });
    } else if (item._type === 'followup' || item.type === 'follow_up') {
      await deleteLeadFollowUp({ leadId, followUpId: itemId });
    } else {
      await deleteLeadActivity({ leadId, activityId: itemId });
    }
    itemToDelete.value = null;
    await loadActivities();
  } catch (err) {
    console.error('Failed to delete activity:', err);
  } finally {
    deleting.value = false;
  }
}

// Unified timeline combining activities, notes, follow-ups, visits, and quotations
const timelineItems = computed(() => {
  if (!activityData.value) return [];

  const items = [];

  // 1. Activities
  (activityData.value.activities || []).forEach(a => {
    items.push({ ...a, _type: a.type || 'activity' });
  });

  // 2. Visits
  (activityData.value.visits || []).forEach(v => {
    items.push({ ...v, _type: 'visit', type: 'property_visit' });
  });

  // 3. Quotations
  (activityData.value.quotations || []).forEach(q => {
    items.push({ ...q, _type: 'quotation', type: 'quotation' });
  });

  // 4. Notes
  (activityData.value.notes || []).forEach(n => {
    items.push({ ...n, _type: 'note', type: 'note', summary: n.content });
  });

  // 5. Follow-ups
  (activityData.value.followUps || []).forEach(f => {
    items.push({ ...f, _type: 'followup', type: 'follow_up', summary: f.notes });
  });

  // Sort newest first
  return items.sort((a, b) => {
    const dateA = new Date(a.activityDate || a.createdAt || a.visitDate || a.quotedDate || a.scheduledAt || 0);
    const dateB = new Date(b.activityDate || b.createdAt || b.visitDate || b.quotedDate || b.scheduledAt || 0);
    return dateB - dateA;
  });
});

// Filter tabs
const filterTabs = computed(() => {
  const all = timelineItems.value;
  return [
    { key: 'all', label: 'All', count: all.length },
    { key: 'calls', label: 'Calls', count: all.filter(i => i.type === 'call' || i.type === 'phone_call').length },
    { key: 'whatsapp', label: 'WhatsApp', count: all.filter(i => i.type === 'whatsapp').length },
    { key: 'meetings', label: 'Meetings', count: all.filter(i => i.type === 'meeting').length },
    { key: 'visits', label: 'Visits', count: all.filter(i => i.type === 'property_visit' || i.type === 'site_visit' || i._type === 'visit').length },
    { key: 'property_shared', label: 'Property Shared', count: all.filter(i => i.type === 'property_shared').length },
    { key: 'quotations', label: 'Quotations', count: all.filter(i => i.type === 'quotation' || i._type === 'quotation').length },
    { key: 'negotiation', label: 'Negotiations', count: all.filter(i => i.type === 'negotiation').length },
    { key: 'followups', label: 'Follow-ups', count: all.filter(i => i.type === 'follow_up' || i._type === 'followup').length },
    { key: 'notes', label: 'Notes', count: all.filter(i => i.type === 'note' || i._type === 'note').length },
  ];
});

// Filtered timeline
const filteredTimeline = computed(() => {
  let list = timelineItems.value;

  if (activeFilter.value === 'calls') {
    list = list.filter(i => i.type === 'call' || i.type === 'phone_call');
  } else if (activeFilter.value === 'whatsapp') {
    list = list.filter(i => i.type === 'whatsapp');
  } else if (activeFilter.value === 'meetings') {
    list = list.filter(i => i.type === 'meeting');
  } else if (activeFilter.value === 'visits') {
    list = list.filter(i => i.type === 'property_visit' || i.type === 'site_visit' || i._type === 'visit');
  } else if (activeFilter.value === 'property_shared') {
    list = list.filter(i => i.type === 'property_shared');
  } else if (activeFilter.value === 'quotations') {
    list = list.filter(i => i.type === 'quotation' || i._type === 'quotation');
  } else if (activeFilter.value === 'negotiation') {
    list = list.filter(i => i.type === 'negotiation');
  } else if (activeFilter.value === 'followups') {
    list = list.filter(i => i.type === 'follow_up' || i._type === 'followup');
  } else if (activeFilter.value === 'notes') {
    list = list.filter(i => i.type === 'note' || i._type === 'note');
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(i => {
      const text = `${i.type} ${i.summary} ${i.description} ${i.customerResponse} ${i.content} ${i.notes}`.toLowerCase();
      return text.includes(q);
    });
  }

  return list;
});

// Grouped by Date (e.g. "Today", "Yesterday", "23 Aug 2026")
const groupedTimeline = computed(() => {
  const groups = {};
  filteredTimeline.value.forEach(item => {
    const dateObj = new Date(item.activityDate || item.createdAt || item.visitDate || item.quotedDate || item.scheduledAt || Date.now());
    const label = formatDateGroup(dateObj);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return groups;
});

// Summary metrics strip
const summaryMetrics = computed(() => {
  const s = activityData.value?.summary || {};
  return [
    { label: 'Calls', value: s.totalCalls || 0, icon: PhPhone, bgClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
    { label: 'WhatsApp', value: s.totalWhatsApp || 0, icon: PhChatCircleDots, bgClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
    { label: 'Meetings', value: s.totalMeetings || 0, icon: PhUsers, bgClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' },
    { label: 'Visits', value: s.totalPropertyVisits || 0, icon: PhHouseLine, bgClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
    { label: 'Quotes', value: s.totalQuotations || 0, icon: PhReceipt, bgClass: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400' },
    { label: 'Follow-ups', value: s.totalFollowUps || 0, icon: PhCalendarCheck, bgClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
    { label: 'Days Active', value: s.leadAgeDays || 0, icon: PhClockCounterClockwise, bgClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  ];
});

// Helpers
function getActivityTitle(item) {
  const type = item.type || item._type;
  switch (type) {
    case 'call':
    case 'phone_call': return 'Phone Call';
    case 'whatsapp': return 'WhatsApp Interaction';
    case 'meeting': return 'Customer Meeting';
    case 'property_visit':
    case 'visit': return 'Property Visit';
    case 'site_visit': return 'Site Visit';
    case 'property_shared': return 'Property Shared';
    case 'project_presented': return 'Project Presented';
    case 'quotation': return 'Quotation / Rate';
    case 'negotiation': return 'Price Negotiation';
    case 'booking_discussion': return 'Booking Discussion';
    case 'payment_discussion': return 'Payment Discussion';
    case 'loan_discussion': return 'Loan Discussion';
    case 'registration':
    case 'registration_discussion': return 'Registration Discussion';
    case 'follow_up':
    case 'followup': return 'Follow-up Scheduled';
    case 'email': return 'Email Outreach';
    case 'note': return item.title || 'Internal Note';
    case 'reminder': return item.metadata?.reminderTitle || 'Reminder';
    default: return item.metadata?.activityName || 'Activity Interaction';
  }
}

function getActivityIcon(item) {
  const type = item.type || item._type;
  switch (type) {
    case 'call':
    case 'phone_call': return PhPhone;
    case 'whatsapp': return PhChatCircleDots;
    case 'meeting': return PhUsers;
    case 'property_visit':
    case 'visit': return PhHouseLine;
    case 'site_visit': return PhBuildings;
    case 'property_shared': return PhShareNetwork;
    case 'project_presented': return PhProjectorScreenChart;
    case 'quotation': return PhReceipt;
    case 'negotiation': return PhScales;
    case 'booking_discussion': return PhBookmarkSimple;
    case 'payment_discussion': return PhCreditCard;
    case 'loan_discussion': return PhBank;
    case 'registration':
    case 'registration_discussion': return PhStamp;
    case 'follow_up':
    case 'followup': return PhCalendarCheck;
    case 'email': return PhEnvelopeSimple;
    case 'reminder': return PhBell;
    case 'note': return PhNotePencil;
    default: return PhSparkle;
  }
}

function getActivityColorClass(item) {
  const type = item.type || item._type;
  switch (type) {
    case 'call':
    case 'phone_call': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'whatsapp': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'meeting': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
    case 'property_visit':
    case 'visit': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    case 'site_visit': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
    case 'property_shared': return 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300';
    case 'project_presented': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300';
    case 'quotation': return 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300';
    case 'negotiation': return 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300';
    case 'booking_discussion': return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
    case 'payment_discussion': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'loan_discussion': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300';
    case 'registration':
    case 'registration_discussion': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300';
    case 'follow_up':
    case 'followup': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    case 'email': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'reminder': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}

function getCardAccentBorder(item) {
  const type = item.type || item._type;
  switch (type) {
    case 'call':
    case 'phone_call': return 'border-l-blue-500';
    case 'whatsapp': return 'border-l-emerald-500';
    case 'meeting': return 'border-l-purple-500';
    case 'property_visit':
    case 'visit': return 'border-l-amber-500';
    case 'site_visit': return 'border-l-orange-500';
    case 'property_shared': return 'border-l-sky-500';
    case 'project_presented': return 'border-l-indigo-500';
    case 'quotation': return 'border-l-teal-500';
    case 'negotiation': return 'border-l-violet-500';
    case 'booking_discussion': return 'border-l-rose-500';
    case 'payment_discussion': return 'border-l-emerald-500';
    case 'loan_discussion': return 'border-l-cyan-500';
    case 'registration':
    case 'registration_discussion': return 'border-l-indigo-500';
    case 'follow_up':
    case 'followup': return 'border-l-amber-500';
    case 'email': return 'border-l-blue-500';
    case 'reminder': return 'border-l-yellow-500';
    default: return 'border-l-slate-400';
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'completed': return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300';
    case 'scheduled': return 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300';
    case 'pending': return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300';
    case 'cancelled':
    case 'missed':
    case 'no_show': return 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300';
    case 'rescheduled': return 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300';
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
  }
}

function formatStatus(status) {
  if (!status) return 'Completed';
  return status.replace(/_/g, ' ');
}

function interestLabel(level) {
  switch (level) {
    case 'very_interested': return 'Very interested';
    case 'interested': return 'Interested';
    case 'maybe': return 'Maybe';
    case 'not_interested': return 'Not interested';
    default: return '';
  }
}

function getInterestClass(level) {
  switch (level) {
    case 'very_interested': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    case 'interested': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    case 'maybe': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    case 'not_interested': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
    default: return 'bg-slate-100 text-slate-600';
  }
}

function formatAmount(n) {
  if (!n) return '0';
  return Number(n).toLocaleString('en-IN');
}

function formatDateTime(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatTime(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateGroup(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) return 'Today';
  if (itemDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
</script>
