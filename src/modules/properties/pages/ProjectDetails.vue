<template>
  <div v-if="isLoading" class="animate-pulse space-y-6">
    <div class="h-10 bg-slate-200 dark:bg-slate-850 rounded w-1/4"></div>
    <div class="h-64 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
  </div>

  <div v-else-if="project" class="space-y-6">
    <!-- Back to Projects link -->
    <div>
      <router-link to="/app/projects" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
        <PhCaretLeft :size="12" />
        <span>Back to Projects Directory</span>
      </router-link>
    </div>

    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">
            {{ project.name }}
          </h2>
          <span class="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-450 px-1.5 py-0.5 rounded">
            Code: {{ project.code }}
          </span>
        </div>
        <p class="text-xs text-slate-550 mt-1 flex items-center gap-1">
          <PhMapPin :size="12" class="text-slate-400" />
          <span>Locality: {{ project.locality || 'Whitefield' }}, {{ project.city }}</span>
        </p>
      </div>

      <div class="flex items-center gap-3">
        <router-link 
          :to="`/app/projects/${project._id || project.id}/analytics`"
          class="px-3.5 py-1.8 border border-default hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5"
        >
          <PhTrendUp :size="14" class="text-primary" />
          <span>View Analytics</span>
        </router-link>
        
        <span class="px-2.5 py-1.2 rounded-lg text-[10px] font-bold uppercase" :class="getStatusBadgeClass(project.status)">
          {{ project.status.replace(/_/g, ' ') }}
        </span>
      </div>
    </div>

    <!-- Tab Section -->
    <div class="space-y-6">
      <div class="border-b border-default flex space-x-4 overflow-x-auto text-xs font-bold uppercase tracking-wider text-slate-400">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          class="pb-2 border-b-2 transition-all px-1"
          :class="activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent hover:text-slate-700'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab 1: Profile & Developer -->
      <div v-if="activeTab === 'profile'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4 text-xs">
          <h3 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
            Project Overview Specifications
          </h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            {{ project.address || 'No address details listed for this project.' }}
          </p>

          <div v-if="project.rera" class="border-t border-dashed border-default pt-4 space-y-2">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 mb-2">Verification & Regulatory badges</h4>
            <div class="flex items-center gap-2">
              <span class="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 border border-emerald-200 px-2 py-0.5 rounded text-[8px] font-bold uppercase">RERA ID: {{ project.rera }}</span>
            </div>
          </div>
        </div>

        <!-- Builder Developer profile -->
        <div class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4 text-xs">
          <h3 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
            Linked Developer Account
          </h3>
          <div v-if="project.builderId" class="space-y-3">
            <div>
              <router-link 
                :to="`/app/builders/${project.builderId._id || project.builderId.id}`"
                class="font-heading font-bold text-sm text-primary hover:underline block"
              >
                {{ project.builderId.name }}
              </router-link>
              <span class="text-[8px] font-mono text-slate-400">ID: {{ project.builderId._id || project.builderId.id }}</span>
            </div>
            
            <p class="text-slate-500 leading-relaxed text-[11px]">
              Click the developer title to view active payment slabs, commission agreements, and contact details.
            </p>
          </div>
          <p v-else class="text-slate-400 italic">No developer assigned.</p>
        </div>
      </div>

      <!-- Tab 2: KPI Metrics Grid -->
      <div v-if="activeTab === 'kpis'" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-1">
          <span class="text-[8px] text-slate-400 font-bold block uppercase">Total Closing Value</span>
          <span class="font-heading font-bold text-lg text-slate-800 dark:text-slate-100">{{ formatCurrency(totalClosingValue) }}</span>
        </div>
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-1">
          <span class="text-[8px] text-slate-400 font-bold block uppercase">Inventory conversion %</span>
          <span class="font-heading font-bold text-lg text-slate-800 dark:text-slate-100">{{ inventoryConversionPercent }}%</span>
        </div>
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-1">
          <span class="text-[8px] text-slate-400 font-bold block uppercase">Active Reservations</span>
          <span class="font-heading font-bold text-lg text-amber-500">{{ activeReservationsCount }} holds</span>
        </div>
      </div>

      <!-- Tab 3: Tower Availability Matrix -->
      <div v-if="activeTab === 'matrix'" class="space-y-4">
        <div class="flex items-center space-x-2">
          <label class="text-xs font-bold text-slate-450 uppercase">Select Tower Block:</label>
          <select 
            v-model="selectedTowerBlock" 
            class="bg-surface border border-default rounded-lg px-2.5 py-1.5 text-xs outline-none"
          >
            <option value="">Select Tower</option>
            <option v-for="t in towerOptions" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <InventoryHeatMap 
          :units="filteredUnits" 
          @unitClick="handleUnitClick"
        />
      </div>

      <!-- Tab 4: Unit List -->
      <div v-if="activeTab === 'units'" class="bg-surface border border-default rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-900 border-b border-default text-slate-450 font-bold uppercase text-[10px] tracking-wider">
              <th class="p-4">Unit Number</th>
              <th class="p-4">Configuration</th>
              <th class="p-4">Carpet Area</th>
              <th class="p-4">Base Price</th>
              <th class="p-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default text-slate-655 font-medium">
            <tr v-for="unit in unitsList" :key="unit._id || unit.id" class="hover:bg-slate-55/40">
              <td class="p-4 font-bold text-slate-800 dark:text-slate-200">{{ unit.unitNumber }}</td>
              <td class="p-4 uppercase">{{ unit.configuration }}</td>
              <td class="p-4">{{ unit.carpetArea || 1200 }} sqft</td>
              <td class="p-4 font-bold">{{ formatCurrency(unit.price) }}</td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase" :class="getUnitBadgeClass(unit.availability)">
                  {{ unit.availability }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mounting Drawers -->
    <PropertyEditDrawer 
      v-if="selectedUnit"
      :isOpen="isEditOpen" 
      :property="selectedUnit"
      @close="isEditOpen = false"
      @success="refetch"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectQuery } from '../queries';
import apiClient from '@/api/client';
import InventoryHeatMap from '../components/InventoryHeatMap.vue';
import PropertyEditDrawer from '../components/PropertyEditDrawer.vue';
import { PhCaretLeft, PhMapPin, PhTrendUp } from '@phosphor-icons/vue';

const route = useRoute();

const activeTab = ref('matrix');
const selectedTowerBlock = ref('');
const isEditOpen = ref(false);
const selectedUnit = ref(null);

const { data: projectData, isLoading, refetch } = useProjectQuery(route.params.id);

const project = computed(() => projectData.value?.data || null);

const tabs = [
  { key: 'matrix', label: 'Availability Matrix' },
  { key: 'units', label: 'Unit Directory List' },
  { key: 'profile', label: 'Developer & Info' },
  { key: 'kpis', label: 'Occupancy KPIs' }
];

const unitsList = ref([]);

const loadUnits = async () => {
  try {
    const res = await apiClient.get('/projects/units', {
      params: { projectId: route.params.id }
    });
    unitsList.value = res.data?.data || [];
  } catch (error) {
    console.error('Failed to load project units list:', error);
  }
};

onMounted(() => {
  loadUnits();
});

const towerOptions = computed(() => {
  const towers = new Set();
  unitsList.value.forEach(unit => {
    const name = unit.towerId?.name || unit.towerId;
    if (name) towers.add(name);
  });
  return Array.from(towers);
});

watch(towerOptions, (newTowers) => {
  if (newTowers.length > 0 && !newTowers.includes(selectedTowerBlock.value)) {
    selectedTowerBlock.value = newTowers[0];
  }
}, { immediate: true });

const filteredUnits = computed(() => {
  if (unitsList.value.length === 0) {
    return [];
  }
  return unitsList.value.filter(unit => {
    const towerName = unit.towerId?.name || unit.towerId;
    return towerName === selectedTowerBlock.value;
  });
});

const totalClosingValue = computed(() => {
  return unitsList.value
    .filter(u => u.availability === 'sold')
    .reduce((sum, u) => sum + (u.price || 0), 0);
});

const inventoryConversionPercent = computed(() => {
  const total = unitsList.value.length;
  if (!total) return 0;
  const sold = unitsList.value.filter(u => u.availability === 'sold').length;
  return Math.round((sold / total) * 100);
});

const activeReservationsCount = computed(() => {
  return unitsList.value.filter(u => u.availability === 'reserved').length;
});

const handleUnitClick = (unit) => {
  selectedUnit.value = {
    ...unit,
    title: `Unit ${unit.unitNumber} (${unit.configuration})`,
    bhk: parseInt(unit.configuration, 10) || 2,
    floors: Math.floor(parseInt(unit.unitNumber, 10) / 100) || 1,
    totalFloors: 10
  };
  isEditOpen.value = true;
};

const getStatusBadgeClass = (status) => {
  if (status === 'upcoming') return 'bg-sky-50 text-sky-700 border border-sky-200';
  if (status === 'under_construction') return 'bg-amber-50 text-amber-700 border border-amber-250';
  if (status === 'ready_to_move') return 'bg-emerald-50 text-emerald-700 border border-emerald-250';
  return 'bg-red-50 text-red-650 border border-red-200';
};

const getUnitBadgeClass = (status) => {
  if (status === 'available') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (status === 'reserved') return 'bg-amber-50 text-amber-700 border border-amber-250';
  if (status === 'blocked') return 'bg-slate-100 text-slate-500 border border-slate-300';
  return 'bg-red-50 text-red-650 border border-red-200';
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
