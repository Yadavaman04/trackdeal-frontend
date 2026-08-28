<template>
  <div class="space-y-6 pb-16 animate-fade-in">
    <!-- ── Header & Action Bar ─────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center shadow-xs">
            <PhScroll :size="22" weight="duotone" />
          </div>
          <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Agreements & Legal Documents</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          Generate, customize, version, preview and print property sale deeds and legal agreements in minutes
        </p>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          to="/app/agreements/templates"
          class="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-surface hover:bg-slate-50 dark:hover:bg-slate-800 border border-default rounded-xl transition flex items-center gap-1.5 shadow-xs"
        >
          <PhFileDoc :size="15" />
          Templates Master
        </router-link>

        <router-link
          to="/app/agreements/new"
          class="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-opacity-90 active:scale-95 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <PhPlus :size="16" weight="bold" />
          Create Agreement
        </router-link>
      </div>
    </div>

    <!-- ── 4 Executive KPI Cards ───────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Total Agreements</span>
          <span class="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 text-xs">📜</span>
        </div>
        <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
          {{ summary.totalCount || 0 }}
        </div>
        <div class="text-[11px] text-slate-400 mt-1">All generated document files</div>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Draft In Progress</span>
          <span class="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 text-xs">✏️</span>
        </div>
        <div class="text-2xl font-black text-amber-600 font-mono mt-1">
          {{ summary.draftCount || 0 }}
        </div>
        <div class="text-[11px] text-slate-400 mt-1">Awaiting details or review</div>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Ready for Print</span>
          <span class="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs">🖨️</span>
        </div>
        <div class="text-2xl font-black text-blue-600 font-mono mt-1">
          {{ summary.readyForPrintCount || 0 }}
        </div>
        <div class="text-[11px] text-blue-600/80 font-medium mt-1">Finalized & verified</div>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Executed & Signed</span>
          <span class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-xs">🖋️</span>
        </div>
        <div class="text-2xl font-black text-emerald-600 font-mono mt-1">
          {{ summary.executedCount || 0 }}
        </div>
        <div class="text-[11px] text-emerald-600/80 font-medium mt-1">Fully signed contracts</div>
      </div>
    </div>

    <!-- ── Filter Tabs & Search Bar ────────────────────────────────────────── -->
    <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm space-y-3">
      <!-- Tabs -->
      <div class="flex flex-wrap items-center gap-1.5 border-b border-default pb-3">
        <button
          v-for="t in tabs"
          :key="t.key"
          @click="activeStatusFilter = t.key"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          :class="activeStatusFilter === t.key
            ? 'bg-primary-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          <span>{{ t.label }}</span>
          <span
            v-if="t.count !== undefined"
            class="px-1.5 py-0.2 rounded-full text-[10px]"
            :class="activeStatusFilter === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
          >
            {{ t.count }}
          </span>
        </button>
      </div>

      <!-- Search & Refresh Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="relative flex-1 min-w-[240px]">
          <PhMagnifyingGlass :size="16" class="absolute left-3 top-2.5 text-slate-400" />
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Search by Agreement #, Unit No, Buyer, Seller, Society..."
            class="w-full bg-slate-50 dark:bg-slate-850 border border-default rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary-500 transition"
          />
        </div>

        <button
          @click="fetchAgreements"
          class="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white border border-default rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
          title="Refresh List"
        >
          <PhArrowsClockwise :size="16" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- ── AGREEMENTS DATA TABLE ───────────────────────────────────────────── -->
    <div class="bg-surface border border-default rounded-2xl overflow-hidden shadow-sm">
      <div v-if="loading" class="p-12 text-center text-xs text-slate-400">
        <PhSpinner :size="28" class="animate-spin mx-auto mb-2 text-primary-600" />
        Loading legal agreements...
      </div>

      <div v-else-if="filteredAgreements.length === 0" class="p-12 text-center space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <PhScroll :size="30" />
        </div>
        <div class="text-sm font-bold text-slate-800 dark:text-slate-200">No agreements found</div>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">
          Create your first property agreement to generate legally compliant sale deeds, recitals, and payment schedules.
        </p>
        <router-link
          to="/app/agreements/new"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-opacity-90 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
        >
          <PhPlus :size="14" weight="bold" />
          Create First Agreement
        </router-link>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-default text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th class="py-3 px-4">Agreement No.</th>
              <th class="py-3 px-4">Type</th>
              <th class="py-3 px-4">Subject Property</th>
              <th class="py-3 px-4">Transferor(s) / Seller</th>
              <th class="py-3 px-4">Transferee(s) / Buyer</th>
              <th class="py-3 px-4">Consideration</th>
              <th class="py-3 px-4">Date</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr
              v-for="agr in filteredAgreements"
              :key="agr._id"
              class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition group"
            >
              <!-- Agreement No -->
              <td class="py-3.5 px-4">
                <router-link
                  :to="`/app/agreements/${agr._id}`"
                  class="font-mono font-bold text-primary-600 hover:underline block"
                >
                  {{ agr.agreementNumber }}
                </router-link>
                <span class="text-[10px] text-slate-400 font-mono">v{{ agr.currentVersionNumber || 1 }}.0</span>
              </td>

              <!-- Agreement Type -->
              <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                {{ agr.agreementType }}
              </td>

              <!-- Property Details -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-800 dark:text-slate-200">
                  Flat {{ agr.structuredData?.property?.flatNumber || '—' }}
                </div>
                <div class="text-[11px] text-slate-400 truncate max-w-[160px]">
                  {{ agr.structuredData?.property?.buildingName || agr.structuredData?.property?.societyName || 'Property' }}
                </div>
              </td>

              <!-- Transferors / Seller -->
              <td class="py-3.5 px-4">
                <div class="font-medium text-slate-800 dark:text-slate-200">
                  {{ agr.structuredData?.transferors?.[0]?.name || '—' }}
                </div>
                <div v-if="agr.structuredData?.transferors?.length > 1" class="text-[10px] text-primary-600 font-semibold">
                  + {{ agr.structuredData.transferors.length - 1 }} more
                </div>
              </td>

              <!-- Transferees / Buyer -->
              <td class="py-3.5 px-4">
                <div class="font-medium text-slate-800 dark:text-slate-200">
                  {{ agr.structuredData?.transferees?.[0]?.name || '—' }}
                </div>
                <div v-if="agr.structuredData?.transferees?.length > 1" class="text-[10px] text-primary-600 font-semibold">
                  + {{ agr.structuredData.transferees.length - 1 }} more
                </div>
              </td>

              <!-- Consideration -->
              <td class="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                ₹{{ (agr.structuredData?.consideration?.totalAmount || 0).toLocaleString('en-IN') }}
              </td>

              <!-- Date -->
              <td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                {{ formatDate(agr.structuredData?.agreement?.agreementDate || agr.createdAt) }}
              </td>

              <!-- Status Badge -->
              <td class="py-3.5 px-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                  :class="getStatusBadgeClass(agr.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(agr.status)"></span>
                  {{ formatStatus(agr.status) }}
                </span>
              </td>

              <!-- Action Menu -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <router-link
                    :to="`/app/agreements/${agr._id}`"
                    class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Preview A4 Document"
                  >
                    <PhEye :size="16" />
                  </router-link>

                  <router-link
                    :to="`/app/agreements/${agr._id}/edit-details`"
                    class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Edit Variable Details"
                  >
                    <PhPencilSimple :size="16" />
                  </router-link>

                  <router-link
                    :to="`/app/agreements/${agr._id}/editor`"
                    class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition"
                    title="Full Document Editor"
                  >
                    <PhFileDoc :size="16" />
                  </router-link>

                  <button
                    @click="handleDuplicate(agr._id)"
                    class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
                    title="Duplicate Agreement"
                  >
                    <PhCopy :size="16" />
                  </button>

                  <a
                    :href="`/api/v1/agreements/${agr._id}/docx`"
                    download
                    class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                    title="Download Word (.doc)"
                  >
                    <PhDownloadSimple :size="16" />
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  PhScroll,
  PhFileDoc,
  PhPlus,
  PhMagnifyingGlass,
  PhArrowsClockwise,
  PhSpinner,
  PhEye,
  PhPencilSimple,
  PhCopy,
  PhDownloadSimple,
} from '@phosphor-icons/vue';
import apiClient from '@/api/client';

const router = useRouter();
const loading = ref(false);
const agreements = ref([]);
const summary = ref({
  totalCount: 0,
  draftCount: 0,
  readyForPrintCount: 0,
  executedCount: 0,
  cancelledCount: 0,
});

const activeStatusFilter = ref('all');
const searchQuery = ref('');

const tabs = computed(() => [
  { key: 'all', label: 'All Agreements', count: summary.value.totalCount },
  { key: 'draft', label: 'Draft', count: summary.value.draftCount },
  { key: 'ready_for_print', label: 'Ready for Print', count: summary.value.readyForPrintCount },
  { key: 'executed', label: 'Executed', count: summary.value.executedCount },
]);

const fetchAgreements = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get('/agreements', {
      params: {
        search: searchQuery.value.trim() || undefined,
        status: activeStatusFilter.value !== 'all' ? activeStatusFilter.value : undefined,
      },
    });
    agreements.value = res.data?.data || res.data || [];
    if (res.data?.summary) {
      summary.value = res.data.summary;
    }
  } catch (err) {
    console.error('Failed to load agreements:', err);
  } finally {
    loading.value = false;
  }
};

let searchTimer = null;
const handleSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchAgreements();
  }, 250);
};

onMounted(() => {
  fetchAgreements();
});

const filteredAgreements = computed(() => {
  return agreements.value.filter((a) => {
    if (activeStatusFilter.value !== 'all' && a.status !== activeStatusFilter.value) {
      return false;
    }
    return true;
  });
});

const handleDuplicate = async (id) => {
  try {
    const res = await apiClient.post(`/agreements/${id}/duplicate`);
    const newAgr = res.data?.data || res.data;
    if (newAgr?._id) {
      router.push(`/app/agreements/${newAgr._id}`);
    } else {
      await fetchAgreements();
    }
  } catch (err) {
    console.error('Failed to duplicate agreement:', err);
  }
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatStatus = (st) => {
  if (!st) return 'Draft';
  return st.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getStatusBadgeClass = (st) => {
  switch (st) {
    case 'ready_for_print':
      return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    case 'executed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    case 'under_review':
      return 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    default:
      return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  }
};

const getStatusDotClass = (st) => {
  switch (st) {
    case 'ready_for_print':
      return 'bg-blue-500';
    case 'executed':
      return 'bg-emerald-500';
    case 'under_review':
      return 'bg-purple-500';
    case 'cancelled':
      return 'bg-rose-500';
    default:
      return 'bg-amber-500';
  }
};
</script>
