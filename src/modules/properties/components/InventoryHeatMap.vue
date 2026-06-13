<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-default pb-3">
      <div>
        <h3 class="font-heading font-bold text-sm text-slate-800 dark:text-slate-100">
          Tower Unit Matrix & Analysis
        </h3>
        <p class="text-[10px] text-slate-450 mt-0.5">
          Visualize real-time unit status and perform market intelligence overlays.
        </p>
      </div>

      <!-- Overlay Select Radio Buttons -->
      <div class="flex items-center gap-2 flex-wrap text-[10px] font-bold uppercase">
        <label class="flex items-center space-x-1.5 cursor-pointer px-2 py-1.5 border border-default rounded-lg" :class="overlay === 'base' ? 'bg-slate-100 dark:bg-slate-800 text-primary border-primary' : 'text-slate-400'">
          <input type="radio" value="base" v-model="overlay" class="hidden" />
          <span>● Base Availability</span>
        </label>
        <label class="flex items-center space-x-1.5 cursor-pointer px-2 py-1.5 border border-default rounded-lg" :class="overlay === 'demand' ? 'bg-slate-100 dark:bg-slate-800 text-primary border-primary' : 'text-slate-400'">
          <input type="radio" value="demand" v-model="overlay" class="hidden" />
          <PhFlame :size="12" />
          <span>Demand Heatmap</span>
        </label>
        <label class="flex items-center space-x-1.5 cursor-pointer px-2 py-1.5 border border-default rounded-lg" :class="overlay === 'aging' ? 'bg-slate-100 dark:bg-slate-800 text-primary border-primary' : 'text-slate-400'">
          <input type="radio" value="aging" v-model="overlay" class="hidden" />
          <PhHourglass :size="12" />
          <span>Inventory Aging</span>
        </label>
      </div>
    </div>

    <!-- Legends Row -->
    <div class="flex items-center gap-4 text-[10px] text-slate-500 font-semibold px-1">
      <span class="text-slate-400 font-bold uppercase tracking-wider">Legend:</span>
      <div v-if="overlay === 'base'" class="flex items-center gap-3">
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> <span>Available</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> <span>Reserved</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> <span>Blocked</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> <span>Sold</span></span>
      </div>
      <div v-else-if="overlay === 'demand'" class="flex items-center gap-3">
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-orange-650 inline-block"></span> <span>High Demand (>100 views)</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span> <span>Medium (50-100 views)</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-yellow-150 inline-block border border-yellow-300"></span> <span>Low (<50 views)</span></span>
      </div>
      <div v-else-if="overlay === 'aging'" class="flex items-center gap-3">
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> <span>&lt; 30 Days</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> <span>31-90 Days</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> <span>91-180 Days</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> <span>&gt; 180 Days (Stagnant)</span></span>
      </div>
    </div>

    <!-- Matrix Layout Grid -->
    <div class="border border-default rounded-xl p-4 bg-slate-55/30 dark:bg-slate-950 overflow-x-auto min-h-[220px]">
      <div class="min-w-[600px] flex flex-col space-y-3">
        <!-- Rows per Floor -->
        <div 
          v-for="floorRow in groupedUnits" 
          :key="floorRow.floor"
          class="flex items-center space-x-4 py-1"
        >
          <!-- Floor Indicator label -->
          <div class="w-16 font-heading font-bold text-xs text-slate-400 uppercase text-right shrink-0">
            Floor {{ floorRow.floor }}
          </div>

          <!-- Unit Cards list -->
          <div class="flex items-center gap-2.5 flex-1">
            <div 
              v-for="unit in floorRow.units" 
              :key="unit._id || unit.id"
              class="relative w-20 h-10 rounded-lg flex items-center justify-center font-bold text-xs select-none transition-all shadow-xs border cursor-pointer hover:scale-105 active:scale-95 group"
              :class="getUnitClass(unit)"
              @click="$emit('unitClick', unit)"
            >
              <span>{{ unit.unitNumber }}</span>
              
              <!-- Popover details card on hover -->
              <div class="absolute bottom-11 hidden group-hover:block w-48 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-750 p-2.5 z-40 text-[10px] font-medium leading-relaxed pointer-events-none transition-all duration-150">
                <p class="font-bold text-xs mb-1 border-b border-slate-800 pb-1 flex justify-between">
                  <span>Unit {{ unit.unitNumber }}</span>
                  <span class="uppercase text-[9px] opacity-75 font-semibold">{{ unit.configuration }}</span>
                </p>
                <p>Price: <span class="font-bold text-primary-light">{{ formatCurrency(unit.price) }}</span></p>
                <p>Area: <b>{{ unit.carpetArea || 0 }} sqft</b></p>
                <p>Status: <span class="capitalize font-bold">{{ unit.availability }}</span></p>
                <p class="border-t border-slate-800 pt-1 mt-1 flex justify-between opacity-80">
                  <span>Views: {{ getDemandViews(unit) }}</span>
                  <span>Age: {{ getAgeDays(unit) }}d</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="groupedUnits.length === 0" class="text-center py-12 text-slate-450 italic text-xs">
          No units found in this tower. Check another block.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PhFlame, PhHourglass } from '@phosphor-icons/vue';

const props = defineProps({
  units: { type: Array, required: true }
});

const emit = defineEmits(['unitClick']);

const overlay = ref('base');

// Group units by their parsed floor
const groupedUnits = computed(() => {
  if (!props.units || props.units.length === 0) return [];
  
  const floors = {};
  props.units.forEach(unit => {
    // Parse floor number (e.g. A-802 -> floor 8, 1204 -> floor 12, 102 -> floor 1)
    const match = unit.unitNumber.match(/(\d+)/);
    let floorNum = 1;
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 100) {
        floorNum = Math.floor(num / 100);
      } else {
        floorNum = num;
      }
    }
    if (!floors[floorNum]) {
      floors[floorNum] = [];
    }
    floors[floorNum].push(unit);
  });
  
  const sortedFloors = Object.keys(floors)
    .map(Number)
    .sort((a, b) => b - a);
    
  return sortedFloors.map(fNum => ({
    floor: fNum,
    units: floors[fNum].sort((a, b) => a.unitNumber.localeCompare(b.unitNumber))
  }));
});

// Deterministic mock views count for demand heatmap
const getDemandViews = (unit) => {
  const hash = parseInt((unit._id || unit.id || '').slice(-4), 16) || 45;
  return (hash % 180) + 12;
};

// Deterministic mock age in days for inventory aging overlay
const getAgeDays = (unit) => {
  const hash = parseInt((unit._id || unit.id || '').slice(-4), 16) || 78;
  return (hash % 240) + 3;
};

const getUnitClass = (unit) => {
  const avail = unit.availability;
  
  if (overlay.value === 'base') {
    switch (avail) {
      case 'available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/50';
      case 'reserved':
        return 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/50';
      case 'blocked':
        return 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
      case 'sold':
        return 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-450 dark:border-red-900/50';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  } else if (overlay.value === 'demand') {
    const views = getDemandViews(unit);
    if (views >= 100) {
      return 'bg-orange-600 border-orange-700 text-white hover:bg-orange-700';
    } else if (views >= 50) {
      return 'bg-orange-400 border-orange-500 text-slate-950 hover:bg-orange-500';
    } else {
      return 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-900/50 dark:text-yellow-450 hover:bg-yellow-200';
    }
  } else if (overlay.value === 'aging') {
    const age = getAgeDays(unit);
    if (age <= 30) {
      return 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600';
    } else if (age <= 90) {
      return 'bg-amber-400 border-amber-500 text-slate-950 hover:bg-amber-550';
    } else if (age <= 180) {
      return 'bg-orange-500 border-orange-600 text-white hover:bg-orange-650';
    } else {
      return 'bg-red-500 border-red-650 text-white hover:bg-red-600';
    }
  }
  return '';
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
