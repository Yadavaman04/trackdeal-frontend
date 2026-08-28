<template>
  <section class="filter-panel" aria-label="Lead filters">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between" style="border-color: hsl(var(--neutral-100));">
        <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <button
            v-for="view in savedViews"
            :key="view.id"
            type="button"
            class="h-9 shrink-0 rounded-lg px-3.5 text-xs font-semibold transition-colors"
            :class="activeSavedView === view.id ? 'text-white' : 'hover:bg-neutral-50'"
            :style="activeSavedView === view.id
              ? 'background-color: hsl(var(--accent-600)); box-shadow: 0 5px 14px hsl(var(--accent-600) / 0.18);'
              : 'color: hsl(var(--neutral-500));'"
            @click="selectSavedView(view)"
          >
            {{ view.name }}
          </button>
        </div>

        <label class="flex shrink-0 items-center gap-2.5 text-xs font-medium" style="color: hsl(var(--neutral-450));">
          <span>Registered</span>
          <select v-model="activeDateRange" class="filter-control !w-40" @change="handleFilterChange">
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="ytd">Year to date</option>
          </select>
        </label>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label class="relative block sm:col-span-2 xl:col-span-1">
          <span class="sr-only">Search leads</span>
          <AppIcon name="search" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--neutral-350));" />
          <input
            v-model="filtersState.search"
            type="search"
            placeholder="Search name, phone or city"
            class="filter-control !pl-9"
            @input="debounceSearch"
          />
        </label>

        <label>
          <span class="sr-only">Lead stage</span>
          <select v-model="filtersState.status" class="filter-control" @change="handleFilterChange">
            <option value="">All stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="property_shared">Property shared</option>
            <option value="site_visit_scheduled">Site visit</option>
            <option value="negotiation">Negotiation</option>
            <option value="booked">Booking</option>
            <option value="won">Closed won</option>
            <option value="lost">Closed lost</option>
          </select>
        </label>

        <label>
          <span class="sr-only">Lead temperature</span>
          <select v-model="filtersState.temperature" class="filter-control" @change="handleFilterChange">
            <option value="">All temperatures</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </label>

        <label>
          <span class="sr-only">Lead source</span>
          <select v-model="filtersState.source" class="filter-control" @change="handleFilterChange">
            <option value="">All sources</option>
            <option value="website">Website</option>
            <option value="magicbricks">MagicBricks</option>
            <option value="99acres">99acres</option>
            <option value="housing">Housing.com</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referral">Referral</option>
            <option value="walk_in">Walk-in</option>
            <option value="manual_entry">Direct input</option>
          </select>
        </label>

        <label>
          <span class="sr-only">Assigned agent</span>
          <select v-model="filtersState.assignedTo" class="filter-control" @change="handleFilterChange">
            <option value="">All assigned agents</option>
            <option :value="currentUser.id">Me (my assigned)</option>
            <option v-for="user in agentsList" :key="user.id || user._id" :value="user.id || user._id">
              {{ user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() }}
            </option>
          </select>
        </label>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useUsersQuery } from '@/modules/settings/queries';

const { data: usersData } = useUsersQuery();
const agentsList = computed(() => {
  const data = usersData.value?.data || usersData.value;
  return Array.isArray(data) ? data.filter(user => user.active) : [];
});

const emit = defineEmits(['change']);
const store = useStore();
const currentUser = computed(() => store.state.auth.user || {});
const savedViews = computed(() => [
  { id: 'all', name: 'All leads', filters: { status: '', assignedTo: '', source: '', temperature: '', search: '' } },
  { id: 'my', name: 'My leads', filters: { status: '', assignedTo: currentUser.value.id || '', source: '', temperature: '', search: '' } },
  { id: 'hot', name: 'Hot', filters: { status: '', assignedTo: '', source: '', temperature: 'hot', search: '' } },
  { id: 'followup', name: 'Follow-up', filters: { status: 'contacted', assignedTo: '', source: '', temperature: '', search: '' } },
  { id: 'received', name: 'Received', filters: { status: 'new', assignedTo: '', source: '', temperature: '', search: '' } },
  { id: 'closed', name: 'Closed', filters: { status: 'won', assignedTo: '', source: '', temperature: '', search: '' } },
]);

const activeSavedView = ref('all');
const activeDateRange = ref('all');
const filtersState = reactive({ search: '', status: '', temperature: '', source: '', assignedTo: '' });
let searchDebounce;

const handleFilterChange = () => emit('change', { ...filtersState, dateRange: activeDateRange.value });
const debounceSearch = () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(handleFilterChange, 300);
};
const selectSavedView = (view) => {
  activeSavedView.value = view.id;
  Object.assign(filtersState, view.filters);
  handleFilterChange();
};

onBeforeUnmount(() => clearTimeout(searchDebounce));
</script>
