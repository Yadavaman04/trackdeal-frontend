<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5 text-xs font-sans">
    <!-- Saved Views / Metric Pills Tabs Row -->
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
      <div class="flex items-center gap-1.5 flex-wrap">
        <button 
          v-for="view in savedViews" 
          :key="view.id"
          @click="selectSavedView(view)"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5"
          :class="[
            activeSavedView === view.id
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <span>{{ view.name }}</span>
        </button>
      </div>
      
      <!-- Date range filters wrapper -->
      <div class="flex items-center space-x-2 text-xs">
        <span class="text-slate-400 font-medium">Registered:</span>
        <select 
          v-model="activeDateRange" 
          @change="handleFilterChange"
          class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 outline-none font-semibold text-slate-700 dark:text-slate-200 text-xs"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="ytd">Year to Date</option>
        </select>
      </div>
    </div>

    <!-- Active Filters Single-Row Form Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <!-- Search Input -->
      <div class="relative flex items-center">
        <input 
          v-model="filtersState.search" 
          type="text" 
          placeholder="Search lead, phone, city..."
          @input="debounceSearch"
          class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.8 pr-8 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium outline-none focus:border-indigo-500"
        />
        <div class="absolute right-2.5 pointer-events-none text-slate-400 text-xs">
          🔍
        </div>
      </div>

      <!-- Stage dropdown -->
      <select 
        v-model="filtersState.status" 
        @change="handleFilterChange"
        class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.8 text-xs text-slate-800 dark:text-slate-100 font-medium outline-none focus:border-indigo-500"
      >
        <option value="">All Stages</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="property_shared">Property Shared</option>
        <option value="site_visit_scheduled">Site Visit</option>
        <option value="negotiation">Negotiation</option>
        <option value="booked">Booking</option>
        <option value="won">Closed Won</option>
        <option value="lost">Closed Lost</option>
      </select>

      <!-- Temperature dropdown -->
      <select 
        v-model="filtersState.temperature" 
        @change="handleFilterChange"
        class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.8 text-xs text-slate-800 dark:text-slate-100 font-medium outline-none focus:border-indigo-500"
      >
        <option value="">All Temperatures</option>
        <option value="hot">🔥 Hot</option>
        <option value="warm">⚡ Warm</option>
        <option value="cold">❄️ Cold</option>
      </select>

      <!-- Source dropdown -->
      <select 
        v-model="filtersState.source" 
        @change="handleFilterChange"
        class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.8 text-xs text-slate-800 dark:text-slate-100 font-medium outline-none focus:border-indigo-500"
      >
        <option value="">All Sources</option>
        <option value="website">Website</option>
        <option value="magicbricks">MagicBricks</option>
        <option value="99acres">99acres</option>
        <option value="housing">Housing.com</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="referral">Referral</option>
        <option value="walk_in">Walk-in</option>
        <option value="manual_entry">Direct Input</option>
      </select>

      <!-- Agent/Owner dropdown -->
      <select 
        v-model="filtersState.assignedTo" 
        @change="handleFilterChange"
        class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.8 text-xs text-slate-800 dark:text-slate-100 font-medium outline-none focus:border-indigo-500"
      >
        <option value="">All Assigned Agents</option>
        <option :value="currentUser.id">Me (My Assigned)</option>
        <option v-for="u in agentsList" :key="u.id || u._id" :value="u.id || u._id">
          {{ u.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useStore } from 'vuex';
import { useUsersQuery } from '@/modules/settings/queries';

const { data: usersData } = useUsersQuery();

const agentsList = computed(() => {
  const data = usersData.value?.data || usersData.value;
  return Array.isArray(data) ? data.filter(u => u.active) : [];
});

const emit = defineEmits(['change']);

const store = useStore();
const currentUser = computed(() => store.state.auth.user || {});

const savedViews = [
  { id: 'all', name: 'All Leads', filters: { status: '', assignedTo: '', source: '', temperature: '', search: '' } },
  { id: 'my', name: 'My Leads', filters: { status: '', assignedTo: currentUser.value.id, source: '', temperature: '', search: '' } },
  { id: 'hot', name: 'Hot', filters: { status: '', assignedTo: '', source: '', temperature: 'hot', search: '' } },
  { id: 'followup', name: 'Follow-up', filters: { status: 'contacted', assignedTo: '', source: '', temperature: '', search: '' } },
  { id: 'received', name: 'Received', filters: { status: 'new', assignedTo: '', source: '', temperature: '', search: '' } },
  { id: 'closed', name: 'Closed', filters: { status: 'won', assignedTo: '', source: '', temperature: '', search: '' } }
];

const activeSavedView = ref('all');
const activeDateRange = ref('all');

const filtersState = reactive({
  search: '',
  status: '',
  temperature: '',
  source: '',
  assignedTo: ''
});

let searchDebounce = null;

const debounceSearch = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    handleFilterChange();
  }, 300);
};

const selectSavedView = (view) => {
  activeSavedView.value = view.id;
  Object.keys(view.filters).forEach(key => {
    filtersState[key] = view.filters[key];
  });
  handleFilterChange();
};

const handleFilterChange = () => {
  const payload = { ...filtersState, dateRange: activeDateRange.value };
  emit('change', payload);
};
</script>
