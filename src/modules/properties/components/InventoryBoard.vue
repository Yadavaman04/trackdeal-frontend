<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
    <!-- Kanban Columns -->
    <div 
      v-for="col in columns" 
      :key="col.status"
      class="bg-slate-50/60 dark:bg-slate-900 border border-default rounded-xl p-3 flex flex-col min-w-[260px] h-[calc(100vh-240px)] shrink-0"
      @dragover.prevent
      @drop="handleDrop($event, col.status)"
    >
      <!-- Column Header -->
      <div class="flex items-center justify-between pb-3 border-b border-default mb-3">
        <div class="flex items-center space-x-2">
          <span 
            class="w-2.5 h-2.5 rounded-full"
            :class="col.colorClass"
          ></span>
          <h3 class="font-heading font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {{ col.label }}
          </h3>
        </div>
        <span class="text-[10px] font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
          {{ getFilteredCount(col.status) }}
        </span>
      </div>

      <!-- Scrollable Card Area -->
      <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
        <div 
          v-for="item in getFilteredItems(col.status)" 
          :key="item._id || item.id"
          class="bg-surface border border-default rounded-xl p-3 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing text-xs space-y-2 group"
          :draggable="true"
          @dragstart="handleDragStart($event, item)"
        >
          <!-- Card Header details -->
          <div class="flex items-start justify-between">
            <span class="font-heading font-bold text-slate-800 dark:text-slate-100 truncate pr-2 group-hover:text-primary transition-colors">
              {{ item.title }}
            </span>
            <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[8px] font-bold text-slate-500 uppercase shrink-0">
              {{ item.bhk ? `${item.bhk} BHK` : item.type }}
            </span>
          </div>

          <!-- Project & Location -->
          <div class="text-[10px] text-slate-500 space-y-0.5">
            <p v-if="item.project?.name" class="font-medium truncate text-slate-600 dark:text-slate-455 flex items-center gap-1">
              <PhBuildings :size="10" class="text-slate-400 shrink-0" />
              <span>{{ item.project.name }}</span>
            </p>
            <p class="truncate flex items-center gap-1">
              <PhMapPin :size="10" class="text-slate-400 shrink-0" />
              <span>{{ item.location?.area || item.location?.city }}</span>
            </p>
          </div>

          <!-- Price & Area Details -->
          <div class="flex items-center justify-between border-t border-dashed border-default pt-2 mt-1">
            <span class="font-heading font-bold text-slate-800 dark:text-slate-100">
              {{ formatCurrency(item.price) }}
            </span>
            <span class="text-[10px] text-slate-400">
              {{ item.area?.carpet || item.area?.superBuiltUp || 0 }} sqft
            </span>
          </div>
        </div>

        <!-- Empty indicator -->
        <div 
          v-if="getFilteredCount(col.status) === 0" 
          class="h-28 border border-dashed border-default rounded-xl flex items-center justify-center text-[10px] text-slate-400 text-center p-4 italic"
        >
          No units listed here. Drag cards to update.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { PhBuildings, PhMapPin } from '@phosphor-icons/vue';

const props = defineProps({
  items: { type: Array, required: true }
});

const emit = defineEmits(['statusChange']);

const columns = [
  { status: 'available', label: 'Available', colorClass: 'bg-emerald-500' },
  { status: 'reserved', label: 'Reserved', colorClass: 'bg-amber-500' },
  { status: 'blocked', label: 'Blocked', colorClass: 'bg-slate-400' },
  { status: 'sold', label: 'Sold', colorClass: 'bg-red-500' }
];

const getFilteredItems = (status) => {
  return props.items.filter(item => {
    // Map backend 'off_market' to blocked or keep original status mapping
    const itemStatus = item.status === 'off_market' ? 'blocked' : item.status;
    return itemStatus === status;
  });
};

const getFilteredCount = (status) => {
  return getFilteredItems(status).length;
};

const handleDragStart = (evt, item) => {
  evt.dataTransfer.setData('text/plain', item._id || item.id);
  evt.dataTransfer.effectAllowed = 'move';
};

const handleDrop = (evt, newStatus) => {
  const itemId = evt.dataTransfer.getData('text/plain');
  const targetItem = props.items.find(item => (item._id || item.id) === itemId);
  if (!targetItem) return;

  const currentStatus = targetItem.status === 'off_market' ? 'blocked' : targetItem.status;
  if (currentStatus === newStatus) return;

  // Intercept Sold to any status change rule
  if (currentStatus === 'sold' && newStatus !== 'sold') {
    emit('statusChange', {
      item: targetItem,
      oldStatus: currentStatus,
      newStatus,
      isLocked: true // Indicates that Sold state is locked and needs Admin password check
    });
    return;
  }

  emit('statusChange', {
    item: targetItem,
    oldStatus: currentStatus,
    newStatus
  });
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>
