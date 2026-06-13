<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Task Specification Details" 
    width="480px"
    @close="$emit('close')"
  >
    <div v-if="task" class="space-y-5 text-xs">
      <!-- Top Action Ribbon -->
      <div class="flex items-center justify-between border-b border-default pb-3 flex-wrap gap-2">
        <div class="flex space-x-1.5">
          <!-- Complete -->
          <button 
            v-if="['pending', 'in_progress'].includes(task.status)"
            @click="$emit('complete', task)"
            class="btn-sm btn-success"
          >
            <PhCheck :size="12" />
            <span>Mark Completed</span>
          </button>
          <!-- Cancel -->
          <button 
            v-if="['pending', 'in_progress'].includes(task.status)"
            @click="$emit('cancelTask', task)"
            class="btn-sm btn-danger-outline"
          >
            <PhX :size="12" />
            <span>Cancel Task</span>
          </button>
        </div>

        <div class="flex space-x-1.5">
          <button 
            @click="$emit('edit', task)"
            class="btn-sm btn-secondary"
          >
            Edit
          </button>
          <button 
            @click="handleDelete"
            :disabled="isDeleting"
            class="btn-sm btn-danger-outline"
          >
            {{ isDeleting ? 'Archiving...' : 'Delete' }}
          </button>
        </div>
      </div>

      <!-- Main Specifications Block -->
      <div class="bg-slate-50/50 border border-default rounded-xl p-4 space-y-3.5">
        <div>
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Task Title</span>
          <h3 class="font-heading text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            {{ task.title }}
          </h3>
        </div>

        <div v-if="task.description" class="pt-1.5 border-t border-dashed border-default">
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Description Notes</span>
          <p class="text-slate-650 leading-relaxed bg-surface border border-default p-2 rounded-lg text-[10px]">
            {{ task.description }}
          </p>
        </div>

        <!-- 2-Column Meta Matrix -->
        <div class="grid grid-cols-2 gap-3.5 pt-2 border-t border-dashed border-default">
          <div>
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Priority</span>
            <span :class="['px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase', getPriorityBadgeClass(task.priority)]">
              {{ task.priority }}
            </span>
          </div>
          <div>
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Task Type</span>
            <span :class="['px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase capitalize flex items-center w-fit gap-1', getTypeBadgeClass(task.type)]">
              <component :is="getTypeIcon(task.type)" :size="10" />
              <span>{{ task.type.replace('_', ' ') }}</span>
            </span>
          </div>
          <div>
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Status Flow</span>
            <span :class="['px-2 py-0.5 rounded text-[8px] font-bold border uppercase', getStatusBadgeClass(task.status)]">
              {{ task.status.replace('_', ' ') }}
            </span>
          </div>
          <div>
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Due Date</span>
            <span :class="['font-semibold text-[10px]', isTaskOverdue(task.dueDate, task.status) ? 'text-red-650 font-bold' : 'text-slate-700 dark:text-slate-350']">
              {{ formatTime(task.dueDate) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Relationships Card -->
      <div class="bg-surface border border-default rounded-xl p-4 space-y-3 shadow-xs">
        <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-1.5">
          Linked Context Entities
        </h4>
        
        <div class="space-y-2 text-[11px]">
          <div class="flex justify-between items-center py-1 border-b border-default last:border-b-0">
            <span class="text-slate-400 flex items-center gap-1"><PhUser :size="12" /><span>Assigned Agent:</span></span>
            <div v-if="task.assignedTo" class="flex items-center space-x-1.5">
              <div class="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary capitalize shrink-0">
                {{ task.assignedTo.firstName?.charAt(0) || 'A' }}
              </div>
              <span class="font-bold text-slate-700 dark:text-slate-250">
                {{ task.assignedTo.firstName }} {{ task.assignedTo.lastName || '' }}
              </span>
            </div>
            <span v-else class="text-slate-400 italic">Unassigned</span>
          </div>

          <div v-if="task.leadId" class="flex justify-between items-center py-1 border-b border-default last:border-b-0">
            <span class="text-slate-400">Linked Lead Prospect:</span>
            <router-link :to="`/app/leads/${task.leadId._id || task.leadId}`" class="text-primary hover:underline font-bold flex items-center gap-0.5">
              <span>{{ getLeadName(task.leadId) }}</span>
              <PhCaretRight :size="10" />
            </router-link>
          </div>

          <div v-if="task.dealId" class="flex justify-between items-center py-1 border-b border-default last:border-b-0">
            <span class="text-slate-400">Associated Deal File:</span>
            <router-link :to="`/app/deals/${task.dealId._id || task.dealId}`" class="text-primary hover:underline font-bold flex items-center gap-0.5">
              <span>{{ task.dealId.title || 'View Deal Details' }}</span>
              <PhCaretRight :size="10" />
            </router-link>
          </div>

          <div v-if="task.propertyId" class="flex justify-between items-center py-1 border-b border-default last:border-b-0">
            <span class="text-slate-400">Property Unit Listing:</span>
            <span class="font-semibold text-slate-750 dark:text-slate-250">
              {{ task.propertyId.unitNumber || 'Unit' }}
            </span>
          </div>
        </div>
      </div>

      <!-- SLA Overdue / Escalations Logs -->
      <div v-if="task.isOverdue || task.status === 'missed'" class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 space-y-2">
        <h5 class="text-xs font-bold text-red-800 dark:text-red-400 flex items-center gap-1.5">
          <PhWarning :size="14" class="text-red-655" />
          <span>SLA Overdue Escalation Ledger</span>
        </h5>
        <div class="text-[10px] text-red-700 dark:text-red-400 space-y-1">
          <div v-if="task.escalatedAt">
            <span class="font-bold">Escalated On:</span> {{ formatTime(task.escalatedAt) }}
          </div>
          <div v-if="task.escalatedTo">
            <span class="font-bold">Escalated Supervisor:</span> {{ task.escalatedTo.firstName }} {{ task.escalatedTo.lastName || '' }}
          </div>
          <div v-if="task.escalationReason">
            <span class="font-bold">Reason:</span> {{ task.escalationReason }}
          </div>
        </div>
      </div>
      
      <!-- General Completion details -->
      <div v-if="task.status === 'completed'" class="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4 space-y-2">
        <h5 class="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
          <PhCheckCircle :size="14" class="text-emerald-600" />
          <span>Task Action Logged Details</span>
        </h5>
        <div class="text-[10px] text-emerald-700 dark:text-emerald-400 space-y-1">
          <div v-if="task.completedAt">
            <span class="font-bold">Completed On:</span> {{ formatTime(task.completedAt) }}
          </div>
          <div v-if="task.cancellationReason">
            <span class="font-bold">Outcome:</span> {{ task.cancellationReason }}
          </div>
        </div>
      </div>
      
      <!-- Cancelled Details -->
      <div v-if="task.status === 'cancelled'" class="bg-slate-100 dark:bg-slate-900 border border-default rounded-xl p-4 space-y-2">
        <h5 class="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
          <PhXCircle :size="14" class="text-slate-500" />
          <span>Task Cancellation Details</span>
        </h5>
        <div class="text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
          <div v-if="task.cancelledAt">
            <span class="font-bold">Cancelled On:</span> {{ formatTime(task.cancelledAt) }}
          </div>
          <div v-if="task.cancellationReason">
            <span class="font-bold">Reason:</span> {{ task.cancellationReason }}
          </div>
        </div>
      </div>
    </div>
  </AppDrawer>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import AppDrawer from '@/components/AppDrawer.vue';
import { useDeleteTaskMutation } from '../queries';
import {
  PhPhone, PhChatCircle, PhEnvelope, PhHouse, PhHandshake,
  PhFileText, PhCreditCard, PhGear, PhUser, PhWarning,
  PhCheck, PhX, PhCheckCircle, PhXCircle, PhCaretRight
} from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  task: { type: Object, default: null }
});

const emit = defineEmits(['close', 'edit', 'complete', 'cancelTask', 'success']);

const store = useStore();
const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

const handleDelete = async () => {
  if (!props.task) return;
  const taskId = props.task._id || props.task.id;
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  try {
    await deleteTask(taskId);
    store.dispatch('notifications/triggerToast', {
      message: 'Task soft-deleted successfully.',
      type: 'success'
    });
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to delete task.',
      type: 'error'
    });
  }
};

const getLeadName = (lead) => {
  if (!lead) return 'Unknown';
  if (typeof lead === 'string') return 'View Lead';
  return `${lead.firstName} ${lead.lastName || ''}`.trim();
};

const isTaskOverdue = (dateStr, status) => {
  if (!dateStr || ['completed', 'cancelled'].includes(status)) return false;
  return new Date(dateStr).getTime() < Date.now();
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'call': return PhPhone;
    case 'whatsapp': return PhChatCircle;
    case 'email': return PhEnvelope;
    case 'site_visit': return PhHouse;
    case 'meeting': return PhHandshake;
    case 'document': return PhFileText;
    case 'payment': return PhCreditCard;
    default: return PhGear;
  }
};

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'call': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20';
    case 'whatsapp': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20';
    case 'email': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20';
    case 'site_visit': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20';
    case 'meeting': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20';
    case 'document': return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20';
    case 'payment': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20';
    default: return 'bg-slate-50 text-slate-655 border-slate-200 dark:bg-slate-900';
  }
};

const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'low': return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-450';
    case 'medium': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-450';
    case 'high': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-455';
    case 'urgent': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-455 font-bold animate-pulse';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20';
    case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20';
    case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20';
    case 'missed': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20';
    case 'cancelled': return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
