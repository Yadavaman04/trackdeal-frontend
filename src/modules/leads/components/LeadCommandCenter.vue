<template>
  <div class="space-y-6">
    <!-- 1. Lead Health Card -->
    <LeadHealthCard 
      :score="lead.score || 0" 
      :requirements="lead.requirements" 
      :tasks="tasks"
    />

    <!-- 2. Command Center Stats Grid -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3.5">
      <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
        Operational Summary
      </h4>

      <div class="grid grid-cols-2 gap-4">
        <!-- Open Tasks count -->
        <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 text-center border border-default">
          <span class="text-lg font-bold text-slate-800 dark:text-slate-200 font-heading block leading-none">
            {{ pendingTasksCount }}
          </span>
          <span class="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-medium mt-1 block">Open Tasks</span>
        </div>

        <!-- Site Visits count -->
        <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 text-center border border-default">
          <span class="text-lg font-bold text-slate-800 dark:text-slate-200 font-heading block leading-none">
            {{ siteVisitsCount }}
          </span>
          <span class="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-medium mt-1 block">Site Visits</span>
        </div>
      </div>

      <!-- Quick Timeline Indicators -->
      <div class="space-y-2 pt-2 text-[11px] divide-y divide-default">
        <div class="flex items-center justify-between py-1.5 first:pt-0">
          <span class="text-slate-400">Last Contacted:</span>
          <span class="font-semibold text-slate-700 dark:text-slate-350">
            {{ lastContactDate || 'Never' }}
          </span>
        </div>
        <div class="flex items-center justify-between py-1.5">
          <span class="text-slate-400">Next Follow-Up:</span>
          <div class="flex items-center space-x-1.5">
            <span 
              v-if="slaBadge" 
              :class="['px-1.5 py-0.5 rounded text-[8px] font-bold border', slaBadge.class]"
            >
              {{ slaBadge.indicator }} {{ slaBadge.text }}
            </span>
            <span class="font-semibold text-slate-700 dark:text-slate-350">
              {{ nextFollowUpDate || 'None Scheduled' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Matching Properties Panel -->
    <MatchingPropertiesPanel :requirements="lead.requirements" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LeadHealthCard from './LeadHealthCard.vue';
import MatchingPropertiesPanel from './MatchingPropertiesPanel.vue';

const props = defineProps({
  lead: { type: Object, required: true },
  activities: { type: Array, default: () => [] },
  tasks: { type: Array, default: () => [] }
});

const pendingTasksCount = computed(() => {
  return props.tasks.filter(t => t.status === 'pending' || t.status === 'scheduled').length;
});

const siteVisitsCount = computed(() => {
  return props.tasks.filter(t => t.type === 'site_visit' || t.type === 'visit').length;
});

const lastContactDate = computed(() => {
  const contacts = props.activities.filter(a => ['call', 'whatsapp', 'meeting', 'email'].includes(a.type));
  if (contacts.length === 0) return null;
  const sorted = [...contacts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return new Date(sorted[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
});

const nextFollowUpDate = computed(() => {
  const pendings = props.tasks.filter(t => t.status === 'pending' || t.status === 'scheduled');
  if (pendings.length === 0) return null;
  const sorted = [...pendings].sort((a, b) => new Date(a.dueDate || a.scheduledAt) - new Date(b.dueDate || b.scheduledAt));
  return new Date(sorted[0].dueDate || sorted[0].scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
});

const slaBadge = computed(() => {
  const pendings = props.tasks.filter(t => t.status === 'pending' || t.status === 'scheduled');
  if (pendings.length === 0) return null;
  const sorted = [...pendings].sort((a, b) => new Date(a.dueDate || a.scheduledAt) - new Date(b.dueDate || b.scheduledAt));
  const closestTask = sorted[0];
  const dueDateStr = closestTask.dueDate || closestTask.scheduledAt;
  if (!dueDateStr) return null;
  
  const dueTime = new Date(dueDateStr).getTime();
  const now = Date.now();
  const diffMs = dueTime - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = -diffHours / 24; // positive if overdue
  
  if (diffMs > 0 && diffHours <= 2) {
    return {
      text: 'Due in < 2h',
      indicator: '🟢',
      class: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-450 dark:border-green-900/50'
    };
  } else if (diffMs < 0) {
    if (diffDays >= 3) {
      return {
        text: 'Overdue 3d+',
        indicator: '🔴🔴',
        class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'
      };
    } else {
      return {
        text: 'Overdue 1d+',
        indicator: '🔴',
        class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
      };
    }
  }
  return null;
});
</script>
