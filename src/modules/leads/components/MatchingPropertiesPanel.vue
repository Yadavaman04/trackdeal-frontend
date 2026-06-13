<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
    <div class="flex items-center justify-between border-b border-default pb-2">
      <span class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200">Matching Properties</span>
      <span class="text-[9px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
        {{ matchedItems.length }} Matches
      </span>
    </div>

    <!-- Match list -->
    <div class="space-y-3 max-h-[220px] overflow-y-auto pr-1">
      <div 
        v-for="item in matchedItems" 
        :key="item.id"
        class="bg-slate-50 dark:bg-slate-900 border border-default rounded-lg p-2.5 flex items-center justify-between text-xs hover:border-primary/50 transition-colors"
      >
        <div class="min-w-0">
          <h5 class="font-bold text-slate-800 dark:text-slate-100 truncate">{{ item.title }}</h5>
          <div class="flex items-center space-x-2 text-[9px] text-slate-400 mt-0.5">
            <span class="capitalize">{{ item.type }}</span>
            <span>•</span>
            <span>{{ item.bhk }} BHK</span>
            <span>•</span>
            <span>{{ item.location }}</span>
          </div>
          <span class="text-[10px] text-primary font-bold block mt-1.5">{{ formatCurrency(item.price) }}</span>
        </div>

        <!-- Reserve trigger -->
        <div class="flex flex-col items-end space-y-1.5 shrink-0">
          <span 
            class="text-[9px] font-bold px-1.5 py-0.5 rounded capitalize"
            :class="[
              item.status === 'available'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
            ]"
          >
            {{ item.status }}
          </span>
          <button 
            @click="handleReserve(item)"
            class="text-[9px] bg-primary hover:bg-opacity-95 text-white font-bold px-2 py-1 rounded"
          >
            Reserve
          </button>
        </div>
      </div>

      <div 
        v-if="matchedItems.length === 0" 
        class="py-8 text-center text-slate-400 text-xs"
      >
        No properties currently match this lead's requirements.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
  requirements: { type: Object, default: () => ({}) }
});

const store = useStore();

const mockProperties = [
  { id: 'prop-1', title: 'Prestige Heights - Tower A', type: 'apartment', bhk: 3, price: 15000000, location: 'Mumbai', status: 'available' },
  { id: 'prop-2', title: 'Skyway Plaza - Unit 802', type: 'apartment', bhk: 2, price: 11000000, location: 'Delhi', status: 'available' },
  { id: 'prop-3', title: 'Dynamic Greenpark Villa', type: 'villa', bhk: 4, price: 25000000, location: 'Bangalore', status: 'reserved' },
  { id: 'prop-4', title: 'Prestige Heights - Tower B', type: 'apartment', bhk: 3, price: 14800000, location: 'Mumbai', status: 'available' },
  { id: 'prop-5', title: 'Skyway Plaza - Unit 504', type: 'apartment', bhk: 3, price: 16200000, location: 'Delhi', status: 'available' }
];

const matchedItems = computed(() => {
  const req = props.requirements;
  if (!req) return [];

  return mockProperties.filter(prop => {
    // 1. Property Type match
    if (req.propertyType?.length > 0 && !req.propertyType.includes(prop.type)) {
      return false;
    }

    // 2. BHK match
    if (req.bhk?.length > 0 && !req.bhk.includes(prop.bhk)) {
      return false;
    }

    // 3. Budget match
    if (req.budget) {
      if (req.budget.min && prop.price < req.budget.min) return false;
      if (req.budget.max && prop.price > req.budget.max) return false;
    }

    // 4. Location match
    if (req.locations?.length > 0) {
      const matchLoc = req.locations.some(loc => prop.location.toLowerCase().includes(loc.toLowerCase()));
      if (!matchLoc) return false;
    }

    return true;
  });
});

const handleReserve = (item) => {
  store.dispatch('notifications/triggerToast', {
    message: `Reserving unit ${item.title} initiated.`,
    type: 'success'
  });
};

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '$0';
  return '$' + Number(val).toLocaleString();
};
</script>
