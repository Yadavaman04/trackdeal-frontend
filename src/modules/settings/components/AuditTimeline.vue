<template>
  <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
    <div class="flex items-center justify-between border-b border-default pb-4">
      <div>
        <h3 class="text-sm font-bold text-slate-800">System Audit Logs</h3>
        <p class="text-[11px] text-slate-500">Immutable chronological record of administrative actions, status toggles, and security alerts.</p>
      </div>
      <button
        @click="resetFilters"
        type="button"
        class="text-[10px] font-bold text-primary hover:underline"
      >
        Clear Filters
      </button>
    </div>

    <!-- Filters Panel -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-default">
      <div>
        <label class="block text-[9px] font-bold text-slate-500 mb-1">MODULE</label>
        <select
          v-model="filters.module"
          class="w-full bg-surface border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
        >
          <option value="">All Modules</option>
          <option value="Users">Users</option>
          <option value="Roles">Roles</option>
          <option value="Branches">Branches</option>
          <option value="Integrations">Integrations</option>
          <option value="Platform">Platform</option>
        </select>
      </div>

      <div>
        <label class="block text-[9px] font-bold text-slate-500 mb-1">ACTION PERFORMED</label>
        <input
          v-model="filters.action"
          type="text"
          placeholder="e.g. user.suspend"
          class="w-full bg-surface border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
        />
      </div>

      <div>
        <label class="block text-[9px] font-bold text-slate-500 mb-1">ACTOR (USER)</label>
        <input
          v-model="filters.user"
          type="text"
          placeholder="Search admin user..."
          class="w-full bg-surface border border-default rounded-md px-2 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
        />
      </div>

      <div>
        <label class="block text-[9px] font-bold text-slate-500 mb-1">DATE RANGE</label>
        <div class="flex items-center space-x-1">
          <input
            v-model="filters.startDate"
            type="date"
            class="w-1/2 bg-surface border border-default rounded-md px-1.5 py-1 text-[10px] outline-none focus:border-primary text-slate-800"
          />
          <span class="text-slate-400 text-xs">-</span>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-1/2 bg-surface border border-default rounded-md px-1.5 py-1 text-[10px] outline-none focus:border-primary text-slate-800"
          />
        </div>
      </div>
    </div>

    <!-- Timeline List -->
    <div v-if="filteredLogs.length === 0" class="text-center py-8 text-slate-400 text-xs italic">
      No audit logs found matching your criteria.
    </div>

    <div v-else class="relative border-l-2 border-slate-100 pl-4 ml-3 space-y-6">
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="relative space-y-1.5"
      >
        <!-- Bullet Indicator -->
        <span
          class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ring-4 shadow-xs"
          :class="getLogIndicatorClass(log.action)"
        ></span>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-slate-800">{{ log.user }}</span>
            <span class="text-[10px] font-semibold text-slate-400">performed</span>
            <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">{{ log.action }}</span>
          </div>
          <time class="text-[10px] text-slate-400 font-semibold">{{ formatDate(log.timestamp) }}</time>
        </div>

        <div class="bg-slate-50 border border-default rounded-lg p-3 space-y-1">
          <div class="text-[11px] text-slate-700 font-medium">
            Target Entity: <strong class="text-slate-800">{{ log.target }}</strong>
          </div>
          <div class="text-[10px] text-slate-500 font-mono overflow-x-auto">
            Changes: {{ log.details }}
          </div>
          <div class="flex items-center justify-between text-[9px] text-slate-400 pt-1">
            <span>IP Address: <strong>{{ log.ip }}</strong></span>
            <span>Module: <strong>{{ log.module }}</strong></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  logs: { type: Array, required: true }
});

const filters = ref({
  module: '',
  action: '',
  user: '',
  startDate: '',
  endDate: ''
});

const filteredLogs = computed(() => {
  return props.logs.filter(log => {
    if (filters.value.module && log.module !== filters.value.module) return false;
    if (filters.value.action && !log.action.toLowerCase().includes(filters.value.action.toLowerCase())) return false;
    if (filters.value.user && !log.user.toLowerCase().includes(filters.value.user.toLowerCase())) return false;

    if (filters.value.startDate) {
      const start = new Date(filters.value.startDate).getTime();
      const logTime = new Date(log.timestamp).getTime();
      if (logTime < start) return false;
    }

    if (filters.value.endDate) {
      const end = new Date(filters.value.endDate + 'T23:59:59').getTime();
      const logTime = new Date(log.timestamp).getTime();
      if (logTime > end) return false;
    }

    return true;
  });
});

function resetFilters() {
  filters.value = {
    module: '',
    action: '',
    user: '',
    startDate: '',
    endDate: ''
  };
}

function formatDate(isoStr) {
  const date = new Date(isoStr);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getLogIndicatorClass(action) {
  if (action.includes('suspend') || action.includes('delete') || action.includes('fail')) {
    return 'bg-red-500 ring-red-100';
  }
  if (action.includes('create') || action.includes('add') || action.includes('invite')) {
    return 'bg-emerald-500 ring-emerald-100';
  }
  if (action.includes('update') || action.includes('edit') || action.includes('change')) {
    return 'bg-amber-500 ring-amber-100';
  }
  return 'bg-blue-500 ring-blue-100';
}
</script>
