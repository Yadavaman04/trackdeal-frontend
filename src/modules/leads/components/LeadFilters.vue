<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
    <!-- Saved Views tabs row -->
    <div class="flex items-center justify-between border-b border-default pb-3 flex-wrap gap-2">
      <div class="flex space-x-1">
        <button 
          v-for="view in savedViews" 
          :key="view.id"
          @click="selectSavedView(view)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          :class="[
            activeSavedView === view.id
              ? 'bg-primary text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
          ]"
        >
          {{ view.name }}
        </button>
      </div>
      
      <!-- Date range filters wrapper -->
      <div class="flex items-center space-x-2 text-xs">
        <span class="text-slate-400 dark:text-slate-500">Registered:</span>
        <select 
          v-model="activeDateRange" 
          @change="handleFilterChange"
          class="bg-surface border border-default rounded-lg px-2.5 py-1.5 outline-none font-semibold text-slate-700 dark:text-slate-200"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="ytd">Year to Date</option>
        </select>
      </div>
    </div>

    <!-- Active Filters Form Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <!-- Search Input -->
      <div class="relative flex items-center">
        <input 
          v-model="filtersState.search" 
          type="text" 
          placeholder="Search name, phone, email..."
          @input="debounceSearch"
          class="input-field pr-8 text-caption text-neutral-900"
        />
        <div class="absolute right-2.5 pointer-events-none text-neutral-400">
          <PhMagnifyingGlass class="w-3.5 h-3.5" />
        </div>
      </div>

      <!-- Stage dropdown -->
      <select 
        v-model="filtersState.status" 
        @change="handleFilterChange"
        class="input-field text-caption text-neutral-900 font-medium"
      >
        <option value="">Filter by Stage</option>
        <option value="new">New</option>
        <option value="assigned">Assigned</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="nurturing">Nurturing</option>
        <option value="site_visit_scheduled">Site Visit Scheduled</option>
        <option value="site_visit_completed">Site Visit Completed</option>
        <option value="negotiation">Negotiation</option>
        <option value="booked">Booked</option>
        <option value="won">Won</option>
        <option value="lost">Lost</option>
      </select>

      <!-- Source dropdown -->
      <select 
        v-model="filtersState.source" 
        @change="handleFilterChange"
        class="input-field text-caption text-neutral-900 font-medium"
      >
        <option value="">Filter by Source</option>
        <option value="website">Website</option>
        <option value="magicbricks">MagicBricks</option>
        <option value="99acres">99acres</option>
        <option value="housing">Housing.com</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="referral">Referral</option>
        <option value="walk_in">Walk-in</option>
        <option value="google_ads">Google Ads</option>
        <option value="facebook_ads">Facebook Ads</option>
        <option value="manual_entry">Manual Entry</option>
      </select>

      <!-- Branch dropdown (Managers/Admins only) -->
      <select 
        v-if="showBranchSelector"
        v-model="filtersState.branchId" 
        @change="handleFilterChange"
        class="input-field text-caption text-neutral-900 font-medium"
      >
        <option value="">All Branches</option>
        <option v-for="b in branchesList" :key="b.id || b._id" :value="b.id || b._id">
          {{ b.name }}
        </option>
      </select>

      <!-- Agent/Owner dropdown -->
      <select 
        v-model="filtersState.assignedTo" 
        @change="handleFilterChange"
        class="input-field text-caption text-neutral-900 font-medium"
      >
        <option value="">All Agents</option>
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
import { PhMagnifyingGlass } from '@phosphor-icons/vue';
import { useBranchesQuery, useUsersQuery } from '@/modules/settings/queries';

const { data: branchesData } = useBranchesQuery();
const { data: usersData } = useUsersQuery();

const branchesList = computed(() => {
  const data = branchesData.value?.data || branchesData.value;
  return Array.isArray(data) ? data : [];
});

const agentsList = computed(() => {
  const data = usersData.value?.data || usersData.value;
  return Array.isArray(data) ? data.filter(u => u.active) : [];
});

const emit = defineEmits(['change']);

const store = useStore();
const currentUser = computed(() => store.state.auth.user || {});
const userRole = computed(() => store.getters['auth/userRole'] || 'agent');

const showBranchSelector = computed(() => {
  return ['super_admin', 'org_admin', 'branch_manager'].includes(userRole.value);
});

const savedViews = [
  { id: 'all', name: 'All Leads', filters: { status: '', assignedTo: '', source: '', search: '', branchId: '' } },
  { id: 'my', name: 'My Leads', filters: { status: '', assignedTo: currentUser.value.id, source: '', search: '', branchId: '' } },
  { id: 'hot', name: 'Hot Leads', filters: { status: '', assignedTo: '', source: '', search: '', branchId: '' } }, // In table we will sort or highlight
  { id: 'lost', name: 'Lost Leads', filters: { status: 'lost', assignedTo: '', source: '', search: '', branchId: '' } }
];

const activeSavedView = ref('all');
const activeDateRange = ref('all');

const filtersState = reactive({
  search: '',
  status: '',
  source: '',
  branchId: '',
  assignedTo: ''
});

let searchDebounce = null;

const debounceSearch = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    handleFilterChange();
  }, 350);
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
