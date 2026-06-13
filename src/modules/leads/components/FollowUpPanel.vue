<template>
  <div class="bg-surface border border-default rounded-xl overflow-hidden shadow-sm">
    <!-- Tabs Header -->
    <header class="bg-slate-50 border-b border-default px-4 py-2 flex items-center justify-between shrink-0">
      <div class="flex space-x-1">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors"
          :class="[
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          ]"
        >
          {{ tab.name }} ({{ getTabCount(tab.id) }})
        </button>
      </div>
      
      <!-- Quick Schedule outreach -->
      <button 
        @click="$emit('schedule')"
        class="text-[10px] font-bold text-primary hover:underline"
      >
        + Add outreach
      </button>
    </header>

    <!-- Scrollable outreach list -->
    <div class="p-3 max-h-[220px] overflow-y-auto divide-y divide-default">
      <div 
        v-for="item in getTabList(activeTab)" 
        :key="item._id || item.id"
        class="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs group"
      >
        <div class="flex items-center space-x-2.5 min-w-0">
          <!-- Icon indicator -->
          <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
            {{ getOutreachIcon(item.type) }}
          </span>
          <div class="min-w-0">
            <h5 class="font-bold text-slate-800 dark:text-slate-200 truncate capitalize">{{ item.title || item.type }}</h5>
            <p class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {{ formatDateTime(item.dueDate || item.scheduledAt) }}
            </p>
          </div>
        </div>

        <!-- Action trigger -->
        <div class="flex items-center space-x-2 shrink-0">
          <button 
            v-if="activeTab !== 'completed'"
            @click="$emit('complete', item._id || item.id)"
            class="w-5 h-5 rounded-full bg-emerald-50 hover:bg-emerald-500 border border-emerald-250 text-[10px] flex items-center justify-center text-emerald-600 hover:text-white transition-colors"
            title="Mark outreach completed"
          >
            ✓
          </button>
          
          <span 
            v-else 
            class="text-[9px] text-emerald-500 font-bold"
          >
            Completed
          </span>
        </div>
      </div>

      <div 
        v-if="getTabList(activeTab).length === 0" 
        class="py-8 text-center text-slate-400 text-[10px]"
      >
        No outreach follow-ups in this tab.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  tasks: { type: Array, default: () => [] }
});

defineEmits(['complete', 'schedule']);

const activeTab = ref('upcoming');

const tabs = [
  { id: 'upcoming', name: 'Upcoming' },
  { id: 'missed', name: 'Missed' },
  { id: 'completed', name: 'Completed' }
];

const parsedOutreaches = computed(() => {
  const now = new Date();
  return props.tasks.map(t => {
    const itemDate = new Date(t.dueDate || t.scheduledAt || t.createdAt);
    const isPast = itemDate < now;
    let computedTab = 'upcoming';

    if (t.status === 'completed') {
      computedTab = 'completed';
    } else if (isPast && (t.status === 'pending' || t.status === 'scheduled')) {
      computedTab = 'missed';
    }

    return {
      ...t,
      computedTab
    };
  });
});

const getTabList = (tabId) => {
  return parsedOutreaches.value.filter(o => o.computedTab === tabId);
};

const getTabCount = (tabId) => {
  return getTabList(tabId).length;
};

const getOutreachIcon = (type) => {
  switch (type) {
    case 'call': return '📞';
    case 'whatsapp': return '💬';
    case 'meeting':
    case 'visit': return '🤝';
    case 'email': return '✉️';
    default: return '📋';
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
