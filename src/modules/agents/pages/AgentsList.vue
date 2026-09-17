<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-title font-bold tracking-tight" style="color: hsl(var(--neutral-900));">
          Agent / Channel Partner Directory
        </h1>
        <p class="text-body-sm" style="color: hsl(var(--neutral-400));">
          Manage master brokers, channel partners, agency contracts, and lead assignments
        </p>
      </div>

      <button
        @click="openCreateDrawer"
        class="h-10 px-4 rounded-lg font-medium text-caption text-white transition-opacity flex items-center gap-2 shrink-0 shadow-sm"
        style="background-color: hsl(var(--accent-600));"
      >
        <PhUserPlus :size="18" weight="bold" />
        <span>+ Add Agent / Channel Partner</span>
      </button>
    </div>

    <!-- Search & Filters Toolbar -->
    <div
      class="p-4 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs"
      style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
    >
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <PhMagnifyingGlass :size="16" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--neutral-400));" />
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search by Agent name, office, phone, email, RERA..."
          class="w-full h-9 pl-9 pr-3 rounded-md border text-body-sm outline-none transition-all"
          style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
        />
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Status Filter -->
        <select
          v-model="filters.status"
          class="h-9 px-3 rounded-md border text-caption outline-none cursor-pointer"
          style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-700));"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <!-- Agent Type Filter -->
        <select
          v-model="filters.agentType"
          class="h-9 px-3 rounded-md border text-caption outline-none cursor-pointer"
          style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-700));"
        >
          <option value="">All Agent Types</option>
          <option value="channel_partner">Channel Partner</option>
          <option value="individual">Individual Broker</option>
          <option value="company">Real Estate Agency</option>
          <option value="broker">Independent Broker</option>
          <option value="other">Other</option>
        </select>

        <!-- City Filter -->
        <input
          v-model="filters.city"
          type="text"
          placeholder="Filter by city..."
          class="h-9 px-3 w-32 rounded-md border text-caption outline-none"
          style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-700));"
        />
      </div>
    </div>

    <!-- Data Table -->
    <div
      class="rounded-xl border overflow-hidden shadow-xs"
      style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="border-b text-micro uppercase tracking-wider font-semibold"
              style="border-color: hsl(var(--neutral-100)); background-color: hsl(var(--neutral-50)); color: hsl(var(--neutral-500));"
            >
              <th class="px-4 py-3">Agent / Office Name</th>
              <th class="px-4 py-3">Phone & Email</th>
              <th class="px-4 py-3">RERA & Reg. No.</th>
              <th class="px-4 py-3">City</th>
              <th class="px-4 py-3">Agent Type</th>
              <th class="px-4 py-3">Leads Assigned</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y" style="border-color: hsl(var(--neutral-100));">
            <!-- Loading skeleton -->
            <template v-if="isLoading">
              <tr v-for="n in 5" :key="n" class="animate-pulse">
                <td colspan="8" class="px-4 py-4">
                  <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <template v-else-if="agents.length === 0">
              <tr>
                <td colspan="8" class="px-4 py-12 text-center">
                  <PhUsersThree :size="36" class="mx-auto mb-2" style="color: hsl(var(--neutral-300));" />
                  <p class="font-medium text-body-sm" style="color: hsl(var(--neutral-600));">
                    No Agents or Channel Partners found
                  </p>
                  <p class="text-caption" style="color: hsl(var(--neutral-400));">
                    Click "+ Add Agent / Channel Partner" to register your first partner
                  </p>
                </td>
              </tr>
            </template>

            <!-- Table Rows -->
            <tr
              v-for="agent in agents"
              :key="agent._id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <!-- Name & Office -->
              <td class="px-4 py-3.5">
                <router-link
                  :to="`/app/agents/${agent._id}`"
                  class="font-semibold text-body-sm hover:underline block"
                  style="color: hsl(var(--neutral-900));"
                >
                  {{ agent.name }}
                </router-link>
                <span class="text-micro font-medium" style="color: hsl(var(--neutral-500));">
                  <AppIcon name="buildings" :size="12" /> {{ agent.officeName }}
                </span>
              </td>

              <!-- Phone & Email -->
              <td class="px-4 py-3.5 text-caption">
                <div class="font-medium" style="color: hsl(var(--neutral-800));">
                  <AppIcon name="phone" :size="12" /> {{ agent.phone }}
                </div>
                <div v-if="agent.email" class="text-micro" style="color: hsl(var(--neutral-400));">
                  <AppIcon name="email" :size="12" /> {{ agent.email }}
                </div>
              </td>

              <!-- RERA Number -->
              <td class="px-4 py-3.5 text-caption">
                <span v-if="agent.reraNumber" class="font-mono text-micro px-1.5 py-0.5 rounded border" style="background-color: hsl(var(--neutral-50)); border-color: hsl(var(--neutral-200)); color: hsl(var(--neutral-700));">
                  {{ agent.reraNumber }}
                </span>
                <span v-else class="text-micro" style="color: hsl(var(--neutral-400));">—</span>
              </td>

              <!-- City -->
              <td class="px-4 py-3.5 text-caption font-medium" style="color: hsl(var(--neutral-700));">
                {{ agent.city || '—' }}
              </td>

              <!-- Agent Type -->
              <td class="px-4 py-3.5">
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-micro font-medium capitalize"
                  style="background-color: hsl(var(--accent-50)); color: hsl(var(--accent-700));"
                >
                  {{ formatAgentType(agent.agentType) }}
                </span>
              </td>

              <!-- Assigned Leads Count -->
              <td class="px-4 py-3.5">
                <span class="font-bold text-caption" style="color: hsl(var(--accent-700));">
                  {{ agent.totalLeadsAssigned || 0 }}
                </span>
                <span class="text-micro ml-1" style="color: hsl(var(--neutral-400));">leads</span>
              </td>

              <!-- Status -->
              <td class="px-4 py-3.5">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-micro font-semibold capitalize"
                  :style="{
                    backgroundColor: agent.status === 'active' ? 'hsl(var(--success-50))' : 'hsl(var(--neutral-100))',
                    color: agent.status === 'active' ? 'hsl(var(--success-700))' : 'hsl(var(--neutral-600))'
                  }"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :style="{ backgroundColor: agent.status === 'active' ? 'hsl(var(--success-500))' : 'hsl(var(--neutral-400))' }"
                  ></span>
                  {{ agent.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <router-link
                    :to="`/app/agents/${agent._id}`"
                    class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    title="View Details & Performance"
                  >
                    <PhEye :size="16" />
                  </router-link>

                  <button
                    @click="openEditDrawer(agent)"
                    class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    title="Edit Agent"
                  >
                    <PhPencilSimple :size="16" />
                  </button>

                  <button
                    @click="toggleAgentStatus(agent)"
                    class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    :class="agent.status === 'active' ? 'text-amber-600' : 'text-emerald-600'"
                    :title="agent.status === 'active' ? 'Deactivate Agent' : 'Activate Agent'"
                  >
                    <PhPower :size="16" />
                  </button>

                  <button
                    @click="confirmDeleteAgent(agent)"
                    class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-red-500 transition-colors"
                    title="Delete Agent"
                  >
                    <PhTrash :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination
        :page="pagination.page"
        :page-size="filters.limit"
        :total="pagination.total"
        :total-pages="pagination.totalPages"
        @page-change="filters.page = $event"
        @page-size-change="filters.limit = $event; filters.page = 1"
      />
    </div>

    <!-- Create / Edit Drawer -->
    <AgentCreateDrawer
      :open="drawerOpen"
      :agent-data="selectedAgent"
      @close="drawerOpen = false"
      @saved="refetch"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import {
  PhUserPlus,
  PhMagnifyingGlass,
  PhUsersThree,
  PhEye,
  PhPencilSimple,
  PhPower,
  PhTrash,
} from '@phosphor-icons/vue';
import { useAgentsQuery, useAgentStatusMutation, useDeleteAgentMutation } from '../queries';
import AgentCreateDrawer from '../components/AgentCreateDrawer.vue';
import Swal from 'sweetalert2';

const filters = reactive({
  search: '',
  status: '',
  agentType: '',
  city: '',
  page: 1,
  limit: 20,
});

watch(
  () => [filters.search, filters.status, filters.agentType, filters.city],
  () => { filters.page = 1; }
);

const drawerOpen = ref(false);
const selectedAgent = ref(null);

const { data: agentsRes, isLoading, refetch } = useAgentsQuery(filters);
const statusMutation = useAgentStatusMutation();
const deleteMutation = useDeleteAgentMutation();

const agents = computed(() => agentsRes.value?.data || []);
const pagination = computed(() => agentsRes.value?.pagination || { page: 1, totalPages: 1, total: 0 });

const formatAgentType = (type) => {
  if (!type) return 'Channel Partner';
  return type.replace(/_/g, ' ');
};

const openCreateDrawer = () => {
  selectedAgent.value = null;
  drawerOpen.value = true;
};

const openEditDrawer = (agent) => {
  selectedAgent.value = agent;
  drawerOpen.value = true;
};

const toggleAgentStatus = async (agent) => {
  const newStatus = agent.status === 'active' ? 'inactive' : 'active';
  const result = await Swal.fire({ title: 'Confirm', text: `Are you sure you want to change '${agent.name}' status to ${newStatus}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes', cancelButtonText: 'Cancel' });
  if (result.isConfirmed) {
    try {
      await statusMutation.mutateAsync({ id: agent._id, status: newStatus });
    } catch (err) {
      Swal.fire({ text: err.response?.data?.error?.message || 'Failed to update status', icon: 'error' });
    }
  }
};

const confirmDeleteAgent = async (agent) => {
  const result = await Swal.fire({ title: 'Confirm', text: `Are you sure you want to delete '${agent.name}'? This action cannot be undone.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes', cancelButtonText: 'Cancel' });
  if (result.isConfirmed) {
    try {
      await deleteMutation.mutateAsync(agent._id);
    } catch (err) {
      Swal.fire({ text: err.response?.data?.error?.message || 'Failed to delete agent', icon: 'error' });
    }
  }
};
</script>
