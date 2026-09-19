<template>
  <div class="workspace-page space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Education Workspace</p>
        <h1 class="font-heading text-xl font-extrabold text-slate-800 dark:text-slate-100">Admissions Overview</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track your inquiries, counseling pipeline, and enrolled students in real time.</p>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/app/leads" class="btn btn-secondary btn-sm text-xs font-semibold gap-1.5">
          <PhUsersThree :size="14" />
          All Leads
        </router-link>
        <router-link to="/app/leads" class="btn btn-primary btn-sm text-xs font-semibold gap-1.5">
          <PhPlus :size="14" weight="bold" />
          Add Student Lead
        </router-link>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="i in 8" :key="i" class="bg-surface border border-default rounded-xl p-5 animate-pulse h-24"></div>
    </div>

    <template v-else>
      <!-- Today's Activity Stats -->
      <div>
        <h2 class="text-label text-slate-400 dark:text-slate-500 mb-3">Today's Activity</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPIWidget
            v-for="stat in todayStats"
            :key="stat.label"
            :title="stat.label"
            :value="stat.value"
            :icon="stat.icon"
          />
        </div>
      </div>

      <!-- Pipeline Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Stage Pipeline Funnel -->
        <div class="lg:col-span-2 bg-surface border border-default rounded-xl p-5 space-y-3">
          <div>
            <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Admission Pipeline</h3>
            <p class="text-[10px] text-slate-400 dark:text-slate-500">Leads by counseling stage</p>
          </div>
          <div class="space-y-2">
            <div
              v-for="stage in pipelineStages"
              :key="stage.key"
              class="flex items-center gap-3"
            >
              <span class="text-[10px] font-semibold text-slate-600 dark:text-slate-400 w-36 shrink-0">{{ stage.label }}</span>
              <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="stage.barColor"
                  :style="{ width: getStageWidth(stage.count) }"
                ></div>
              </div>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{{ stage.count }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Counts -->
        <div class="space-y-3">
          <KPIWidget
            title="Enrolled Students"
            :value="summary.totalStudents || 0"
            :icon="PhGraduationCap"
          />
          <KPIWidget
            title="Active Classes"
            :value="summary.totalClasses || 0"
            :icon="PhChalkboardTeacher"
          />
          <KPIWidget
            title="Overdue Follow-ups"
            :value="summary.overdueFollowUps || 0"
            :icon="PhWarning"
            trendDirection="down"
            trend="Needs Attention"
          />
        </div>
      </div>

      <!-- Alerts Banner -->
      <div v-if="hasAlerts" class="flex flex-wrap gap-2">
        <div
          v-if="(summary.unassignedLeads || 0) > 0"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs font-semibold text-red-700 dark:text-red-400"
        >
          <PhWarningCircle :size="14" />
          {{ summary.unassignedLeads }} unassigned leads need attention
        </div>
        <div
          v-if="(summary.staleLeads || 0) > 0"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs font-semibold text-amber-700 dark:text-amber-400"
        >
          <PhClock :size="14" />
          {{ summary.staleLeads }} leads have not been contacted in 48+ hours
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import KPIWidget from '@/components/KPIWidget.vue';
import {
  PhUsersThree,
  PhPlus,
  PhCheckSquare,
  PhPhoneCall,
  PhCalendarCheck,
  PhStar,
  PhGraduationCap,
  PhChalkboardTeacher,
  PhWarning,
  PhWarningCircle,
  PhClock,
  PhArrowRight,
  PhTrendUp,
} from '@phosphor-icons/vue';
import { fetchEducationSummary } from '../api/endpoints';

const loading = ref(true);
const summary = ref({});

const todayStats = computed(() => [
  {
    label: 'New Leads',
    value: summary.value.newLeadsToday ?? summary.value.totalLeads ?? 0,
    icon: PhUsersThree,
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    valueColor: 'text-slate-800 dark:text-slate-100',
  },
  {
    label: 'Pending Follow-ups',
    value: summary.value.pendingFollowUps ?? 0,
    icon: PhCheckSquare,
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    valueColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Calls Scheduled',
    value: summary.value.callsScheduled ?? 0,
    icon: PhPhoneCall,
    iconBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    valueColor: 'text-slate-800 dark:text-slate-100',
  },
  {
    label: 'Meetings Today',
    value: summary.value.meetingsToday ?? 0,
    icon: PhCalendarCheck,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    valueColor: 'text-slate-800 dark:text-slate-100',
  },
  {
    label: 'Leads Contacted',
    value: summary.value.leadsContacted ?? 0,
    icon: PhPhoneCall,
    iconBg: 'bg-teal-50 dark:bg-teal-950/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    valueColor: 'text-slate-800 dark:text-slate-100',
  },
  {
    label: 'Converted',
    value: summary.value.enrolledLeads ?? summary.value.convertedToday ?? 0,
    icon: PhGraduationCap,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    valueColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Overdue',
    value: summary.value.overdueFollowUps ?? 0,
    icon: PhWarning,
    iconBg: 'bg-red-50 dark:bg-red-950/30',
    iconColor: 'text-red-600 dark:text-red-400',
    valueColor: summary.value.overdueFollowUps > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100',
  },
  {
    label: 'Total Leads',
    value: summary.value.totalLeads ?? 0,
    icon: PhTrendUp,
    iconBg: 'bg-slate-50 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    valueColor: 'text-slate-800 dark:text-slate-100',
  },
]);

const pipelineStages = computed(() => {
  const stageCounts = summary.value.stageBreakdown || {};
  return [
    { key: 'new',               label: 'New',                 count: stageCounts.new || 0,               barColor: 'bg-slate-400' },
    { key: 'assigned',          label: 'Assigned',            count: stageCounts.assigned || 0,          barColor: 'bg-blue-400' },
    { key: 'contacted',         label: 'Contacted',           count: stageCounts.contacted || 0,         barColor: 'bg-indigo-400' },
    { key: 'follow_up',         label: 'Follow Up',           count: stageCounts.follow_up || 0,         barColor: 'bg-violet-400' },
    { key: 'meeting_scheduled', label: 'Meeting Scheduled',   count: stageCounts.meeting_scheduled || 0, barColor: 'bg-amber-400' },
    { key: 'qualified',         label: 'Qualified',           count: stageCounts.qualified || 0,         barColor: 'bg-orange-400' },
    { key: 'application_trial', label: 'Application / Trial', count: stageCounts.application_trial || 0, barColor: 'bg-teal-400' },
    { key: 'converted',         label: 'Converted',           count: stageCounts.converted || 0,         barColor: 'bg-emerald-500' },
  ];
});

const hasAlerts = computed(() =>
  (summary.value.unassignedLeads || 0) > 0 || (summary.value.staleLeads || 0) > 0
);

const maxStageCount = computed(() =>
  Math.max(1, ...pipelineStages.value.map(s => s.count))
);

function getStageWidth(count) {
  if (!count) return '0%';
  return `${Math.round((count / maxStageCount.value) * 100)}%`;
}

onMounted(async () => {
  try {
    const res = await fetchEducationSummary();
    summary.value = res.data || res || {};
  } catch {
    summary.value = {};
  } finally {
    loading.value = false;
  }
});
</script>
