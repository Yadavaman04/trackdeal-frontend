<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-xl sm:text-2xl font-black text-white">Platform Administration Dashboard</h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-0.5">Real-time TrackDeal SaaS cluster analytics, tenant growth, and platform health.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="loadData"
          class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-2"
        >
          <span :class="{ 'animate-spin': loading }">🔄</span>
          <span>Refresh Analytics</span>
        </button>
        <router-link
          to="/admin/organizations"
          class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
        >
          <span>➕</span>
          <span>Add Tenant</span>
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !stats" class="py-24 text-center">
      <div class="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs text-slate-400">Loading platform metrics...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- SUMMARY METRIC CARDS (4 Grid) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Organizations -->
        <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Organizations</span>
            <div class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-sm">
              🏢
            </div>
          </div>
          <div class="mt-3">
            <span class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ stats?.totalOrganizations || 0 }}</span>
            <div class="mt-1 flex items-center gap-2 text-[11px]">
              <span class="text-emerald-400 font-semibold">+{{ stats?.newOrganizationsThisMonth || 0 }} this month</span>
              <span class="text-slate-500">• {{ stats?.activeTenants || 0 }} active</span>
            </div>
          </div>
        </div>

        <!-- 2. Platform Users -->
        <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-sm">
              👥
            </div>
          </div>
          <div class="mt-3">
            <span class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ stats?.totalUsers || 0 }}</span>
            <div class="mt-1 flex items-center gap-2 text-[11px]">
              <span class="text-emerald-400 font-semibold">+{{ stats?.newUsersThisMonth || 0 }} new</span>
              <span class="text-slate-500">• Across all tenants</span>
            </div>
          </div>
        </div>

        <!-- 3. Active Tenants -->
        <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Tenants</span>
            <div class="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-sm">
              ⚡
            </div>
          </div>
          <div class="mt-3">
            <span class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ stats?.activeTenants || 0 }}</span>
            <div class="mt-1 flex items-center gap-2 text-[11px]">
              <span class="text-slate-400">{{ stats?.inactiveTenants || 0 }} inactive</span>
              <span v-if="stats?.suspendedTenants > 0" class="text-rose-400 font-bold">• {{ stats?.suspendedTenants }} suspended</span>
            </div>
          </div>
        </div>

        <!-- 4. Total Platform Leads -->
        <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Leads</span>
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-sm">
              🎯
            </div>
          </div>
          <div class="mt-3">
            <span class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ stats?.totalLeads || 0 }}</span>
            <div class="mt-1 flex items-center gap-2 text-[11px]">
              <span class="text-slate-400">{{ stats?.totalDeals || 0 }} deals</span>
              <span class="text-slate-500">• {{ stats?.totalProperties || 0 }} properties</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RECENT ACTIVE ORGANIZATIONS & PLATFORM SUMMARY -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Organizations Table (2 Cols) -->
        <div class="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 class="text-sm font-bold text-white">Recent Tenant Organizations</h2>
              <p class="text-xs text-slate-400">Newly onboarded real-estate agencies and brokerages</p>
            </div>
            <router-link to="/admin/organizations" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View All ({{ stats?.totalOrganizations }}) →
            </router-link>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-[10px] font-bold uppercase text-slate-500 border-b border-slate-800/80">
                <tr>
                  <th class="py-2.5 px-3">Organization</th>
                  <th class="py-2.5 px-3">Owner</th>
                  <th class="py-2.5 px-3">Plan</th>
                  <th class="py-2.5 px-3">Users</th>
                  <th class="py-2.5 px-3">Leads</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr v-for="org in recentOrganizations" :key="org._id" class="hover:bg-slate-800/40 transition">
                  <td class="py-3 px-3">
                    <div class="font-bold text-slate-200">{{ org.name }}</div>
                    <div class="text-[10px] text-slate-500 font-mono">{{ org.code }}</div>
                  </td>
                  <td class="py-3 px-3">
                    <div class="text-slate-300">{{ org.ownerId?.firstName }} {{ org.ownerId?.lastName }}</div>
                    <div class="text-[10px] text-slate-500">{{ org.ownerId?.email }}</div>
                  </td>
                  <td class="py-3 px-3">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {{ org.organizationType || org.subscriptionPlan }}
                    </span>
                  </td>
                  <td class="py-3 px-3 font-semibold text-slate-300">{{ org.usersCount || 0 }}</td>
                  <td class="py-3 px-3 font-semibold text-slate-300">{{ org.leadsCount || 0 }}</td>
                  <td class="py-3 px-3">
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                      :class="{
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': org.status === 'active',
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20': org.status === 'inactive',
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20': org.status === 'suspended',
                      }"
                    >
                      {{ org.status }}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-right">
                    <router-link
                      :to="`/admin/organizations/${org._id}`"
                      class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-semibold transition text-[11px]"
                    >
                      Manage
                    </router-link>
                  </td>
                </tr>
                <tr v-if="recentOrganizations.length === 0">
                  <td colspan="7" class="py-8 text-center text-xs text-slate-500">No organizations found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Platform System Health & Quick Actions (1 Col) -->
        <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
          <div class="border-b border-slate-800 pb-3">
            <h2 class="text-sm font-bold text-white">Platform Health & Quick Actions</h2>
            <p class="text-xs text-slate-400">Cluster runtime services & controls</p>
          </div>

          <div class="space-y-3">
            <div class="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <div>
                  <div class="text-xs font-bold text-slate-200">MongoDB Multi-Tenant DB</div>
                  <div class="text-[10px] text-slate-500">ReplicaSet Connected • Isolated Contexts</div>
                </div>
              </div>
              <span class="text-xs font-bold text-emerald-400">Healthy</span>
            </div>

            <div class="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <div>
                  <div class="text-xs font-bold text-slate-200">API Gateway & Fastify</div>
                  <div class="text-[10px] text-slate-500">JWT Authentication & Rate Limiters</div>
                </div>
              </div>
              <span class="text-xs font-bold text-emerald-400">Active</span>
            </div>

            <div class="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <div>
                  <div class="text-xs font-bold text-slate-200">Tenant Isolation Policy</div>
                  <div class="text-[10px] text-slate-500">Strict Org-ID Scoping & Masked PII</div>
                </div>
              </div>
              <span class="text-xs font-bold text-emerald-400">Enforced</span>
            </div>
          </div>

          <div class="pt-2 space-y-2">
            <router-link
              to="/admin/users"
              class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
            >
              <span>👥</span>
              <span>Manage Platform Users</span>
            </router-link>
            <router-link
              to="/admin/audit-logs"
              class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
            >
              <span>📜</span>
              <span>View System Audit Logs</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAdminDashboard } from '../api/endpoints';

const loading = ref(false);
const stats = ref(null);
const recentOrganizations = ref([]);

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchAdminDashboard();
    const payload = res?.data || res || {};
    stats.value = payload.summary || null;
    recentOrganizations.value = payload.recentOrganizations || [];
  } catch (err) {
    console.error('Failed to load admin dashboard:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
