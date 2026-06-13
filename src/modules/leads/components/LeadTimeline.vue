<template>
  <div class="relative pl-6 border-l border-default space-y-5 py-2">
    <!-- Timeline node list -->
    <div 
      v-for="(item, idx) in sortedTimeline" 
      :key="item.id || idx"
      class="relative group"
    >
      <!-- Icon indicator -->
      <span 
        class="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center text-[10px] shadow-sm"
        :class="getIconBgClass(item.type)"
      >
        {{ getIconLabel(item.type) }}
      </span>

      <!-- Content box -->
      <div class="bg-surface border border-default rounded-xl p-3 shadow-xs hover:shadow-sm transition-all duration-200">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center space-x-1.5">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
              {{ formatLogTitle(item) }}
            </span>
            <span v-if="item.isPrivate" class="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 text-[8px] font-bold border border-amber-100">
              Private Note
            </span>
          </div>
          <span class="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
            {{ formatTime(item.createdAt) }}
          </span>
        </div>

        <p class="text-xs text-slate-650 dark:text-slate-405 leading-relaxed">
          {{ item.description || item.content }}
        </p>

        <!-- Metadata logs details -->
        <div v-if="item.metadata && Object.keys(item.metadata).length > 0" class="mt-2 text-[9px] text-slate-400 space-x-2">
          <span v-if="item.metadata.duration">Duration: {{ formatDuration(item.metadata.duration) }}</span>
          <span v-if="item.metadata.outcome">Outcome: <b class="capitalize text-slate-600">{{ item.metadata.outcome }}</b></span>
          <span v-if="item.metadata.stageFrom">Transition: <b class="capitalize text-slate-600">{{ item.metadata.stageFrom }} ➔ {{ item.metadata.stageTo }}</b></span>
        </div>

        <!-- Author / Performed by -->
        <div class="mt-2 pt-2 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between text-[9px] text-slate-400">
          <span>By: {{ item.performedBy?.firstName || 'System Manager' }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="sortedTimeline.length === 0" class="text-center py-8 text-slate-400 text-xs">
      No logged activity records found for this lead.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  activities: { type: Array, default: () => [] },
  notes: { type: Array, default: () => [] },
  tasks: { type: Array, default: () => [] }
});

const sortedTimeline = computed(() => {
  // Map notes and tasks to fit the timeline node representation
  const notesTimeline = props.notes.map(n => ({
    ...n,
    type: 'note',
    description: n.content,
    performedBy: n.createdBy
  }));

  const tasksTimeline = props.tasks.map(t => ({
    ...t,
    type: t.type === 'site_visit' ? 'site_visit' : 'task',
    description: `Task outreach scheduled: "${t.title}" (${t.status})`,
    performedBy: t.assignedTo
  }));

  // Combine arrays
  const combined = [...props.activities, ...notesTimeline, ...tasksTimeline];
  
  // Sort chronologically (descending)
  return combined.sort((a, b) => new Date(b.createdAt || b.scheduledAt) - new Date(a.createdAt || a.scheduledAt));
});

const getIconBgClass = (type) => {
  switch (type) {
    case 'call':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
    case 'whatsapp':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400';
    case 'meeting':
    case 'site_visit':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400';
    case 'email':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
    case 'note':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    case 'stage_change':
      return 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400';
    case 'assignment':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400';
    default:
      return 'bg-slate-50 text-slate-600 dark:bg-slate-900';
  }
};

const getIconLabel = (type) => {
  switch (type) {
    case 'call': return '📞';
    case 'whatsapp': return '💬';
    case 'meeting':
    case 'site_visit': return '🤝';
    case 'email': return '✉️';
    case 'note': return '📝';
    case 'stage_change': return '🔄';
    case 'assignment': return '👤';
    default: return '📋';
  }
};

const formatLogTitle = (item) => {
  if (item.type === 'stage_change') return 'Stage Update';
  if (item.type === 'assignment') return 'Assignment Transfer';
  if (item.type === 'note') return 'Internal Note';
  if (item.type === 'site_visit') return 'Site Visit Action';
  return `${item.type} Interaction`;
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

const formatDuration = (sec) => {
  if (!sec) return '';
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
};
</script>
