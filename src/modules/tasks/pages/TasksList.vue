<template>
  <div class="space-y-6">
    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">Tasks & Daily Agenda</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Schedule follow-ups, site visits, document reviews, and transactional actions.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 self-end sm:self-auto shrink-0 flex-wrap">
        <!-- Bulk Assign Action (Shows when items are checked) -->
        <button 
          v-if="selectedRows.length > 0"
          @click="openBulkAssign"
          class="btn btn-sm btn-secondary text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900"
        >
          Assign ({{ selectedRows.length }})
        </button>

        <!-- Create Task button -->
        <button 
          @click="isCreateOpen = true"
          class="btn btn-sm btn-primary"
        >
          + Add Task
        </button>
      </div>
    </div>

    <!-- KPI Section Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Open Tasks KPI -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-xs relative">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Open Schedules</span>
        <h3 class="text-xl font-heading font-extrabold text-slate-800 dark:text-slate-100 mt-1">
          {{ openTasksCount }}
        </h3>
        <span class="text-[8px] text-sky-500 font-semibold block mt-0.5">Pending / In Progress</span>
      </div>

      <!-- Overdue Tasks KPI -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-xs relative" :class="{ 'border-red-200 bg-red-50/10': overdueCount > 0 }">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">SLA Overdue</span>
        <h3 class="text-xl font-heading font-extrabold mt-1" :class="overdueCount > 0 ? 'text-red-650' : 'text-slate-800 dark:text-slate-100'">
          {{ overdueCount }}
        </h3>
        <span class="text-[8px] font-semibold block mt-0.5" :class="overdueCount > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'">
          {{ overdueCount > 0 ? 'Requires attention!' : 'All caught up' }}
        </span>
      </div>

      <!-- Due Today KPI -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-xs relative">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Due Today</span>
        <h3 class="text-xl font-heading font-extrabold text-slate-800 dark:text-slate-100 mt-1">
          {{ dueTodayCount }}
        </h3>
        <span class="text-[8px] text-slate-400 font-semibold block mt-0.5">Schedules due today</span>
      </div>

      <!-- Completion Rate KPI -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-xs relative">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Completion Rate</span>
        <h3 class="text-xl font-heading font-extrabold text-slate-800 dark:text-slate-100 mt-1">
          {{ completionRate }}%
        </h3>
        <span class="text-[8px] text-emerald-500 font-semibold block mt-0.5">Efficiency percentage</span>
      </div>
    </div>

    <!-- Filters Panel -->
    <TaskFilters @change="handleFilterChange" />

    <!-- Active View Area -->
    <div v-if="isLoading" class="animate-pulse space-y-4">
      <div class="h-10 bg-slate-200 dark:bg-slate-850 rounded w-full"></div>
      <div class="h-64 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
    </div>

    <div v-else class="space-y-4">
      <!-- Desktop Grid -->
      <div class="hidden lg:block">
        <TaskTable 
          :rows="mappedTasks"
          :isLoading="isLoading"
          :selectedTasks="selectedRows"
          @selectionChange="handleSelectionChange"
          @sort="handleSort"
          @select="handleTaskSelect"
          @complete="openCompleteModal"
          @cancelTask="openCancelModal"
        />
      </div>

      <!-- Responsive Mobile List Cards -->
      <div class="lg:hidden grid grid-cols-1 gap-3">
        <div 
          v-for="task in mappedTasks" 
          :key="task.id"
          class="bg-surface border border-default rounded-xl p-4 shadow-xs flex flex-col justify-between text-xs space-y-3.5"
          :class="isTaskOverdue(task.dueDate, task.status) ? 'border-red-200 bg-red-50/5' : ''"
        >
          <div class="flex items-start justify-between">
            <div>
              <button 
                @click="handleTaskSelect(task)"
                class="font-bold text-slate-850 dark:text-slate-150 hover:underline text-sm block text-left"
              >
                {{ task.title }}
              </button>
              <span v-if="task.description" class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">
                {{ task.description }}
              </span>
            </div>
            <span :class="['px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase', getPriorityBadgeClass(task.priority)]">
              {{ task.priority }}
            </span>
          </div>

          <div class="flex items-center justify-between text-[10px] text-slate-500 flex-wrap gap-2">
            <span class="flex items-center space-x-1">
              <span>Type:</span>
              <span :class="['px-1.5 py-0.2 rounded text-[8px] font-semibold border capitalize', getTypeBadgeClass(task.type)]">
                {{ task.type }}
              </span>
            </span>
            <span :class="['font-semibold', isTaskOverdue(task.dueDate, task.status) ? 'text-red-500' : 'text-slate-400']">
              Due: {{ formatTime(task.dueDate) }}
            </span>
          </div>

          <div class="flex items-center justify-between border-t border-dashed border-default pt-2 flex-wrap gap-2">
            <div class="flex items-center space-x-1.5">
              <span class="text-[9px] text-slate-400">Agent:</span>
              <span class="font-semibold text-slate-700 dark:text-slate-350">
                {{ task.assignedTo?.firstName || 'Me' }}
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <button 
                v-if="['pending', 'in_progress'].includes(task.status)"
                @click="openCompleteModal(task)"
                class="text-[9px] text-emerald-600 font-bold px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1"
              >
                <PhCheck :size="10" />
                <span>Complete</span>
              </button>
              <button 
                v-if="['pending', 'in_progress'].includes(task.status)"
                @click="openCancelModal(task)"
                class="text-[9px] text-red-655 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 flex items-center gap-1"
              >
                <PhX :size="10" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="mappedTasks.length === 0" class="text-center py-12 text-slate-400">
          No outreach tasks found.
        </div>
      </div>
    </div>

    <!-- Drawers & Modals mounts -->
    <TaskCreateDrawer 
      :isOpen="isCreateOpen" 
      @close="isCreateOpen = false"
      @success="refetch"
    />

    <TaskEditDrawer 
      v-if="isEditOpen"
      :isOpen="isEditOpen" 
      :task="activeTask"
      @close="isEditOpen = false"
      @success="refetch"
    />

    <TaskDetailsDrawer 
      v-if="isDetailsOpen"
      :isOpen="isDetailsOpen"
      :task="activeTask"
      @close="isDetailsOpen = false"
      @edit="openEditDrawer"
      @complete="openCompleteModalFromDetails"
      @cancelTask="openCancelModalFromDetails"
      @success="refetch"
    />

    <TaskCompleteModal 
      v-if="isCompleteOpen"
      :isOpen="isCompleteOpen"
      :task="activeTask"
      @close="isCompleteOpen = false"
      @success="handleTaskActionSuccess"
    />

    <TaskCancelModal 
      v-if="isCancelOpen"
      :isOpen="isCancelOpen"
      :task="activeTask"
      @close="isCancelOpen = false"
      @success="handleTaskActionSuccess"
    />

    <BulkAssignModal 
      :isOpen="isBulkAssignOpen"
      :taskIds="targetAssignIds"
      @close="isBulkAssignOpen = false"
      @success="clearSelection"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import TaskFilters from '../components/TaskFilters.vue';
import TaskTable from '../components/TaskTable.vue';
import TaskCreateDrawer from '../components/TaskCreateDrawer.vue';
import TaskEditDrawer from '../components/TaskEditDrawer.vue';
import TaskDetailsDrawer from '../components/TaskDetailsDrawer.vue';
import TaskCompleteModal from '../components/TaskCompleteModal.vue';
import TaskCancelModal from '../components/TaskCancelModal.vue';
import BulkAssignModal from '../components/BulkAssignModal.vue';
import { useTasksQuery } from '../queries';

// Phosphor icons
import { PhCheck, PhX } from '@phosphor-icons/vue';

const queryClient = useQueryClient();

const activeFilters = ref({
  search: '',
  status: '',
  priority: '',
  type: '',
  assignedTo: '',
  dateRange: 'all'
});

// Load tasks using TanStack Query
const { data, isLoading, refetch } = useTasksQuery(activeFilters);

const rawTasksList = computed(() => {
  return data.value?.data || [];
});

const mappedTasks = computed(() => {
  return rawTasksList.value.map(task => ({
    ...task,
    id: task._id || task.id
  }));
});

// KPI Calculations
const openTasksCount = computed(() => {
  return rawTasksList.value.filter(t => ['pending', 'in_progress'].includes(t.status)).length;
});

const overdueCount = computed(() => {
  return rawTasksList.value.filter(t => 
    ['pending', 'in_progress'].includes(t.status) && 
    new Date(t.dueDate).getTime() < Date.now()
  ).length;
});

const dueTodayCount = computed(() => {
  const todayStr = new Date().toDateString();
  return rawTasksList.value.filter(t => 
    ['pending', 'in_progress'].includes(t.status) && 
    new Date(t.dueDate).toDateString() === todayStr
  ).length;
});

const completionRate = computed(() => {
  const list = rawTasksList.value;
  if (list.length === 0) return 0;
  const completed = list.filter(t => t.status === 'completed').length;
  return Math.round((completed / list.length) * 100);
});

// Modals / Drawers Toggles
const selectedRows = ref([]);
const isCreateOpen = ref(false);
const isEditOpen = ref(false);
const isDetailsOpen = ref(false);
const isCompleteOpen = ref(false);
const isCancelOpen = ref(false);
const isBulkAssignOpen = ref(false);

const activeTask = ref(null);
const targetAssignIds = ref([]);

const handleFilterChange = (filters) => {
  activeFilters.value = { ...activeFilters.value, ...filters };
};

const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

const handleSort = ({ field, direction }) => {
  // Sort tasks in client side or set API order
  // For standard behavior we reload or let MappedTasks handle sorting,
  // Since query filters have order / sort keys:
  activeFilters.value.sort = field;
  activeFilters.value.order = direction === 'asc' ? 1 : -1;
};

const handleTaskSelect = (task) => {
  activeTask.value = task;
  isDetailsOpen.value = true;
};

const openEditDrawer = (task) => {
  activeTask.value = task;
  isDetailsOpen.value = false;
  isEditOpen.value = true;
};

const openCompleteModal = (task) => {
  activeTask.value = task;
  isCompleteOpen.value = true;
};

const openCompleteModalFromDetails = (task) => {
  activeTask.value = task;
  isDetailsOpen.value = false;
  isCompleteOpen.value = true;
};

const openCancelModal = (task) => {
  activeTask.value = task;
  isCancelOpen.value = true;
};

const openCancelModalFromDetails = (task) => {
  activeTask.value = task;
  isDetailsOpen.value = false;
  isCancelOpen.value = true;
};

const handleTaskActionSuccess = () => {
  refetch();
  // also invalidate leads in case this completion resolves follow-ups
  queryClient.invalidateQueries({ queryKey: ['leads'] });
};

const openBulkAssign = () => {
  targetAssignIds.value = selectedRows.value.map(row => row._id || row.id);
  isBulkAssignOpen.value = true;
};

const clearSelection = () => {
  selectedRows.value = [];
  refetch();
};

const isTaskOverdue = (dateStr, status) => {
  if (!dateStr || ['completed', 'cancelled'].includes(status)) return false;
  return new Date(dateStr).getTime() < Date.now();
};

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'call': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20';
    case 'whatsapp': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20';
    case 'email': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20';
    default: return 'bg-slate-50 text-slate-650 border-slate-200';
  }
};

const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'low': return 'bg-slate-50 text-slate-650 border-slate-200 dark:bg-slate-900';
    case 'medium': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20';
    case 'high': return 'bg-orange-50 text-orange-750 border-orange-250 dark:bg-orange-950/20';
    case 'urgent': return 'bg-red-50 text-red-750 border-red-250 dark:bg-red-950/20 font-bold';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
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
</script>
