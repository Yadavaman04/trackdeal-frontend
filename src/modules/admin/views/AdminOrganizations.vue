<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-xl sm:text-2xl font-black text-white">Tenant Organizations</h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-0.5">Manage SaaS tenant brokerages, agency accounts, plans, and suspension policies.</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 self-start sm:self-auto"
      >
        <span>➕</span>
        <span>Create Organization</span>
      </button>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <!-- Search input -->
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search by name, code, city, email..."
          class="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-72"
        />
        <!-- Status filter -->
        <select
          v-model="statusFilter"
          @change="loadOrganizations"
          class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div class="text-xs text-slate-400 self-end sm:self-auto">
        Total: <span class="font-bold text-white">{{ pagination.total || 0 }}</span> organizations
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && organizations.length === 0" class="py-24 text-center">
      <div class="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs text-slate-400">Loading organizations...</p>
    </div>

    <!-- Organizations Table -->
    <div v-else class="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="text-[10px] font-bold uppercase text-slate-400 bg-slate-800/60 border-b border-slate-800">
            <tr>
              <th class="py-3 px-4">Organization Name</th>
              <th class="py-3 px-4">Tenant Code</th>
              <th class="py-3 px-4">Owner Contact</th>
              <th class="py-3 px-4">Plan / Tier</th>
              <th class="py-3 px-4 text-center">Users</th>
              <th class="py-3 px-4 text-center">Leads</th>
              <th class="py-3 px-4 text-center">Properties</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-for="org in organizations" :key="org._id" class="hover:bg-slate-800/40 transition">
              <td class="py-3.5 px-4">
                <router-link :to="`/admin/organizations/${org._id}`" class="font-bold text-slate-100 hover:text-indigo-400 transition">
                  {{ org.name }}
                </router-link>
                <div class="text-[10px] text-slate-500">{{ org.address?.city || 'City' }}, {{ org.address?.state || 'India' }}</div>
              </td>
              <td class="py-3.5 px-4 font-mono font-bold text-indigo-400">{{ org.code }}</td>
              <td class="py-3.5 px-4">
                <div class="font-semibold text-slate-200">{{ org.ownerId?.firstName }} {{ org.ownerId?.lastName }}</div>
                <div class="text-[10px] text-slate-400">{{ org.ownerId?.email }}</div>
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {{ org.organizationType || org.subscriptionPlan }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center font-bold text-slate-200">{{ org.usersCount || 0 }}</td>
              <td class="py-3.5 px-4 text-center font-bold text-slate-200">{{ org.leadsCount || 0 }}</td>
              <td class="py-3.5 px-4 text-center font-bold text-slate-200">{{ org.propertiesCount || 0 }}</td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize"
                  :class="{
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': org.status === 'active',
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20': org.status === 'inactive',
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20': org.status === 'suspended',
                  }"
                >
                  {{ org.status }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <router-link
                    :to="`/admin/organizations/${org._id}`"
                    class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition text-[11px]"
                  >
                    View
                  </router-link>
                  <button
                    @click="toggleOrgStatus(org)"
                    class="px-2.5 py-1 rounded-lg border font-semibold transition text-[11px]"
                    :class="org.status === 'suspended' ? 'border-emerald-700 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40' : 'border-rose-800 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40'"
                  >
                    {{ org.status === 'suspended' ? 'Activate' : 'Suspend' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="organizations.length === 0">
              <td colspan="9" class="py-12 text-center text-xs text-slate-500">
                No organizations matching current criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>Page {{ pagination.page }} of {{ pagination.pages }}</div>
        <div class="flex items-center gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold disabled:opacity-40 transition"
          >
            ← Previous
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold disabled:opacity-40 transition"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- CREATE ORGANIZATION MODAL -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        @click.self="showCreateModal = false"
      >
        <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 class="text-base font-bold text-white">Create Tenant Organization</h2>
              <p class="text-xs text-slate-400">Onboard a new real-estate brokerage & configure initial owner credentials.</p>
            </div>
            <button @click="showCreateModal = false" class="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
          </div>

          <div v-if="createError" class="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
            {{ createError }}
          </div>

          <form @submit.prevent="handleCreateOrg" class="space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-300">Organization Name *</label>
                <input v-model="createForm.name" type="text" required placeholder="e.g. Skyline Real Estate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-300">Organization Code (Optional)</label>
                <input v-model="createForm.code" type="text" placeholder="e.g. SKYLINE" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-300">Owner Full Name *</label>
                <input v-model="createForm.ownerName" type="text" required placeholder="e.g. Rajesh Sharma" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-300">Owner Email Address *</label>
                <input v-model="createForm.ownerEmail" type="email" required placeholder="owner@skyline.com" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-300">Owner Mobile Number</label>
                <input v-model="createForm.ownerMobile" type="text" placeholder="+91 9876543210" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-300">Initial Password</label>
                <input v-model="createForm.password" type="text" placeholder="TrackDeal@123" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-300">Subscription Plan</label>
                <select v-model="createForm.plan" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500">
                  <option value="INDIVIDUAL_AGENT">Individual Agent</option>
                  <option value="AGENCY">Agency</option>
                  <option value="ENTERPRISE_AGENCY">Enterprise Agency</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-300">Max Users</label>
                <input v-model="createForm.maxUsers" type="number" min="1" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-300">City</label>
                <input v-model="createForm.city" type="text" placeholder="Pune" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button type="button" @click="showCreateModal = false" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition">
                Cancel
              </button>
              <button type="submit" :disabled="creating" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2">
                <span v-if="creating" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Create & Onboard</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAdminOrganizations, createAdminOrganization, updateAdminOrganization } from '../api/endpoints';

const loading = ref(false);
const organizations = ref([]);
const pagination = ref({ page: 1, limit: 10, total: 0, pages: 1 });
const searchQuery = ref('');
const statusFilter = ref('');

const showCreateModal = ref(false);
const creating = ref(false);
const createError = ref('');
const createForm = ref({
  name: '',
  code: '',
  ownerName: '',
  ownerEmail: '',
  ownerMobile: '',
  password: 'TrackDeal@123',
  plan: 'AGENCY',
  maxUsers: 10,
  city: 'Pune',
});

let searchTimer = null;
function handleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.value.page = 1;
    loadOrganizations();
  }, 300);
}

async function loadOrganizations() {
  loading.value = true;
  try {
    const res = await fetchAdminOrganizations({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value.trim() || undefined,
      status: statusFilter.value || undefined,
    });
    organizations.value = res?.data || [];
    if (res?.pagination) {
      pagination.value = res.pagination;
    }
  } catch (err) {
    console.error('Failed to load organizations:', err);
  } finally {
    loading.value = false;
  }
}

function changePage(p) {
  pagination.value.page = p;
  loadOrganizations();
}

function openCreateModal() {
  createError.value = '';
  createForm.value = {
    name: '',
    code: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    password: 'TrackDeal@123',
    plan: 'AGENCY',
    maxUsers: 10,
    city: 'Pune',
  };
  showCreateModal.value = true;
}

async function handleCreateOrg() {
  creating.value = true;
  createError.value = '';
  try {
    await createAdminOrganization(createForm.value);
    showCreateModal.value = false;
    await loadOrganizations();
  } catch (err) {
    createError.value = err.response?.data?.error?.message || err.message || 'Failed to create organization.';
  } finally {
    creating.value = false;
  }
}

async function toggleOrgStatus(org) {
  const newStatus = org.status === 'suspended' ? 'active' : 'suspended';
  const confirmMsg = `Are you sure you want to ${newStatus === 'suspended' ? 'SUSPEND' : 'ACTIVATE'} organization '${org.name}'?`;
  if (!confirm(confirmMsg)) return;

  try {
    await updateAdminOrganization(org._id, { status: newStatus });
    await loadOrganizations();
  } catch (err) {
    alert(err.response?.data?.error?.message || err.message || 'Failed to update organization status.');
  }
}

onMounted(() => {
  loadOrganizations();
});
</script>
