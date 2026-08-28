<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white font-sans">
    <!-- TOP HEADER -->
    <header class="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <!-- Brand / Logo -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            ⚡
          </div>
          <div>
            <div class="font-heading font-black text-sm text-white tracking-wider flex items-center gap-1.5">
              TRACKDEAL <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PLATFORM ADMIN</span>
            </div>
            <div class="text-[10px] text-slate-400 font-medium">SaaS Multi-Tenant Management Console</div>
          </div>
        </div>
      </div>

      <!-- Global Admin Search -->
      <div class="relative max-w-md w-full hidden md:block">
        <input
          v-model="searchQuery"
          @input="handleGlobalSearch"
          type="text"
          placeholder="Global Search (Organizations, Tenants, Users, Codes)..."
          class="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
        />
        <span class="absolute right-3 top-2.5 text-slate-400 text-xs">⌘K</span>

        <!-- Search Results Dropdown -->
        <div
          v-if="searchResults && (searchResults.organizations?.length || searchResults.users?.length)"
          class="absolute left-0 right-0 top-11 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 space-y-3"
        >
          <div v-if="searchResults.organizations?.length">
            <span class="text-[10px] font-bold uppercase text-indigo-400 px-2">Organizations</span>
            <div class="mt-1 space-y-1">
              <router-link
                v-for="org in searchResults.organizations"
                :key="org._id"
                :to="`/admin/organizations/${org._id}`"
                @click="clearSearch"
                class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition"
              >
                <span class="font-semibold">{{ org.name }}</span>
                <span class="text-[10px] text-slate-400">{{ org.code }} • {{ org.organizationType }}</span>
              </router-link>
            </div>
          </div>

          <div v-if="searchResults.users?.length">
            <span class="text-[10px] font-bold uppercase text-emerald-400 px-2">Users</span>
            <div class="mt-1 space-y-1">
              <router-link
                v-for="u in searchResults.users"
                :key="u._id"
                to="/admin/users"
                @click="clearSearch"
                class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition"
              >
                <span class="font-semibold">{{ u.firstName }} {{ u.lastName }} ({{ u.email }})</span>
                <span class="text-[10px] text-slate-400">{{ u.organizationId?.name || 'No Org' }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Profile & Logout -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
            SA
          </div>
          <div class="text-left hidden sm:block">
            <div class="text-xs font-bold text-slate-200">Platform Administrator</div>
            <div class="text-[10px] text-slate-400">system.administrator@trackdeal.com</div>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="p-2 rounded-xl bg-slate-800/80 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700/80 hover:border-red-800/50 transition text-xs font-semibold flex items-center gap-1.5"
          title="Sign Out"
        >
          <span>🚪</span>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <!-- SIDEBAR -->
      <aside class="w-64 bg-slate-900/60 border-r border-slate-800/80 shrink-0 p-4 space-y-6 flex flex-col justify-between hidden md:flex">
        <div class="space-y-6">
          <!-- MAIN NAVIGATION -->
          <div class="space-y-1">
            <span class="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3">Platform Overview</span>
            <router-link
              to="/admin/dashboard"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition"
              :class="$route.path === '/admin/dashboard' || $route.path === '/admin' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
            >
              <span class="text-sm">📊</span>
              <span>Dashboard</span>
            </router-link>
          </div>

          <!-- TENANT MANAGEMENT -->
          <div class="space-y-1">
            <span class="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3">Tenant Management</span>
            <router-link
              to="/admin/organizations"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition"
              :class="$route.path.startsWith('/admin/organizations') ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
            >
              <span class="text-sm">🏢</span>
              <span>Organizations / Tenants</span>
            </router-link>
            <router-link
              to="/admin/users"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition"
              :class="$route.path.startsWith('/admin/users') ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
            >
              <span class="text-sm">👥</span>
              <span>Platform Users</span>
            </router-link>
          </div>

          <!-- MONITORING & SYSTEM -->
          <div class="space-y-1">
            <span class="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3">Platform Monitoring</span>
            <router-link
              to="/admin/audit-logs"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition"
              :class="$route.path.startsWith('/admin/audit-logs') ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
            >
              <span class="text-sm">📜</span>
              <span>Audit Logs</span>
            </router-link>
            <router-link
              to="/admin/settings"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition"
              :class="$route.path.startsWith('/admin/settings') ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
            >
              <span class="text-sm">⚙️</span>
              <span>System Settings</span>
            </router-link>
          </div>
        </div>

        <!-- FOOTER STATUS CHIP -->
        <div class="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div class="flex items-center gap-2 text-emerald-400 font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cluster Status: Healthy</span>
          </div>
          <div>TrackDeal Engine v2.4.0 (Prod)</div>
        </div>
      </aside>

      <!-- MAIN CONTENT VIEWPORT -->
      <main class="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { searchAdminGlobal } from '../modules/admin/api/endpoints';

const store = useStore();
const router = useRouter();

const searchQuery = ref('');
const searchResults = ref(null);
let searchTimeout = null;

function handleGlobalSearch() {
  clearTimeout(searchTimeout);
  if (!searchQuery.value.trim()) {
    searchResults.value = null;
    return;
  }
  searchTimeout = setTimeout(async () => {
    try {
      const res = await searchAdminGlobal(searchQuery.value.trim());
      searchResults.value = res?.data || res || null;
    } catch (e) {
      searchResults.value = null;
    }
  }, 250);
}

function clearSearch() {
  searchQuery.value = '';
  searchResults.value = null;
}

function handleLogout() {
  store.dispatch('auth/logoutSession');
  router.push('/login');
}
</script>
