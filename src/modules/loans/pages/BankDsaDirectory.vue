<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-2.5">
        <router-link to="/app/loans" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <PhArrowLeft :size="18" />
        </router-link>
        <div>
          <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Banks & DSA Partners Directory</h1>
          <p class="text-xs text-slate-500 mt-0.5">Manage banking institutions, DSA partners, and standard commission agreements</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="activeTab === 'banks'"
          @click="isAddBankModalOpen = true"
          class="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition flex items-center gap-2"
        >
          <PhPlus :size="16" weight="bold" />
          Add Bank
        </button>
        <button
          v-else
          @click="isAddDsaModalOpen = true"
          class="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition flex items-center gap-2"
        >
          <PhPlus :size="16" weight="bold" />
          Add DSA Partner
        </button>
      </div>
    </div>

    <!-- Tab Bar -->
    <div class="flex items-center gap-2 bg-surface border border-default rounded-2xl p-1.5 w-fit shadow-xs">
      <button
        @click="activeTab = 'banks'"
        class="px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2"
        :class="activeTab === 'banks' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
      >
        <PhBank :size="16" />
        Banks Directory ({{ banks.length }})
      </button>
      <button
        @click="activeTab = 'dsas'"
        class="px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2"
        :class="activeTab === 'dsas' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
      >
        <PhUsersThree :size="16" />
        DSA Partners ({{ dsas.length }})
      </button>
    </div>

    <!-- ── BANKS TABLE ──────────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'banks'" class="bg-surface border border-default rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
      <table class="w-full min-w-[800px] text-left text-xs">
        <thead class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-default text-[11px] font-bold text-slate-500 uppercase">
          <tr>
            <th class="py-3 px-4">Bank Name</th>
            <th class="py-3 px-4">Branch</th>
            <th class="py-3 px-4">Contact Person / RM</th>
            <th class="py-3 px-4">Phone</th>
            <th class="py-3 px-4">Email</th>
            <th class="py-3 px-4">Standard Comm.</th>
            <th class="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-for="b in paginatedBanks" :key="b._id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
            <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhBank :size="16" class="text-primary-600" />
              {{ b.bankName }}
            </td>
            <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300">{{ b.branch || 'Main Branch' }}</td>
            <td class="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">{{ b.contactPerson || '—' }}</td>
            <td class="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{{ b.mobile || '—' }}</td>
            <td class="py-3.5 px-4 text-slate-500">{{ b.email || '—' }}</td>
            <td class="py-3.5 px-4 font-mono font-bold text-emerald-600">{{ b.standardCommissionRate || 0.5 }}%</td>
            <td class="py-3.5 px-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Active</span>
            </td>
          </tr>
          <tr v-if="banks.length === 0">
            <td colspan="7" class="text-center py-10 text-slate-400">
              No banks registered yet. Click "Add Bank" to register banking partners.
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      <AppPagination v-bind="bankPagination" @page-change="setBankPage" @page-size-change="setBankPageSize" />
    </div>

    <!-- ── DSAs TABLE ───────────────────────────────────────────────────────── -->
    <div v-else class="bg-surface border border-default rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
      <table class="w-full min-w-[800px] text-left text-xs">
        <thead class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-default text-[11px] font-bold text-slate-500 uppercase">
          <tr>
            <th class="py-3 px-4">DSA Company Name</th>
            <th class="py-3 px-4">Contact Person</th>
            <th class="py-3 px-4">Phone</th>
            <th class="py-3 px-4">Email</th>
            <th class="py-3 px-4">Supported Banks</th>
            <th class="py-3 px-4">Standard Comm.</th>
            <th class="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-for="d in paginatedDsas" :key="d._id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
            <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhBuildings :size="16" class="text-purple-600" />
              {{ d.companyName }}
            </td>
            <td class="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">{{ d.contactPerson || '—' }}</td>
            <td class="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{{ d.mobile || '—' }}</td>
            <td class="py-3.5 px-4 text-slate-500">{{ d.email || '—' }}</td>
            <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300">
              {{ (d.supportedBanks || []).join(', ') || 'All Major Banks' }}
            </td>
            <td class="py-3.5 px-4 font-mono font-bold text-amber-600">{{ d.standardCommissionRate || 0.6 }}%</td>
            <td class="py-3.5 px-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Active</span>
            </td>
          </tr>
          <tr v-if="dsas.length === 0">
            <td colspan="7" class="text-center py-10 text-slate-400">
              No DSA partners registered yet. Click "Add DSA Partner" to add DSA contacts.
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      <AppPagination v-bind="dsaPagination" @page-change="setDsaPage" @page-size-change="setDsaPageSize" />
    </div>

    <!-- Add Bank Modal -->
    <div v-if="isAddBankModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-surface border border-default w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-default pb-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhBank :size="18" class="text-primary-600" />
            Add Bank Master
          </h3>
          <button @click="isAddBankModalOpen = false" class="text-slate-400 hover:text-slate-600"><PhX :size="16" /></button>
        </div>
        <form @submit.prevent="handleAddBank" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1">Bank Name *</label>
            <input v-model="bankForm.bankName" required type="text" placeholder="e.g. HDFC Bank, SBI" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block font-semibold mb-1">Branch</label>
            <input v-model="bankForm.branch" type="text" placeholder="e.g. Baner, Pune" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block font-semibold mb-1">Contact Person / RM Name</label>
            <input v-model="bankForm.contactPerson" type="text" placeholder="e.g. Praveen Patil" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">Phone</label>
              <input v-model="bankForm.mobile" type="text" placeholder="e.g. 9876500001" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Standard Comm (%)</label>
              <input v-model.number="bankForm.standardCommissionRate" type="number" step="0.05" placeholder="0.5" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          <div class="pt-3 border-t border-default flex justify-end gap-2">
            <button type="button" @click="isAddBankModalOpen = false" class="px-3.5 py-1.5 font-semibold text-slate-500">Cancel</button>
            <button type="submit" class="px-4 py-1.5 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl">Save Bank</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add DSA Modal -->
    <div v-if="isAddDsaModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-surface border border-default w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-default pb-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhUsersThree :size="18" class="text-purple-600" />
            Add DSA Partner Master
          </h3>
          <button @click="isAddDsaModalOpen = false" class="text-slate-400 hover:text-slate-600"><PhX :size="16" /></button>
        </div>
        <form @submit.prevent="handleAddDSA" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1">DSA Agency / Company Name *</label>
            <input v-model="dsaForm.companyName" required type="text" placeholder="e.g. ABC Capital Services" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block font-semibold mb-1">Key Contact Person</label>
            <input v-model="dsaForm.contactPerson" type="text" placeholder="e.g. Amit Kulkarni" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">Phone</label>
              <input v-model="dsaForm.mobile" type="text" placeholder="e.g. 9988776655" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Standard Comm (%)</label>
              <input v-model.number="dsaForm.standardCommissionRate" type="number" step="0.05" placeholder="0.6" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          <div class="pt-3 border-t border-default flex justify-end gap-2">
            <button type="button" @click="isAddDsaModalOpen = false" class="px-3.5 py-1.5 font-semibold text-slate-500">Cancel</button>
            <button type="submit" class="px-4 py-1.5 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl">Save DSA</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { PhArrowLeft, PhPlus, PhBank, PhUsersThree, PhBuildings, PhX } from '@phosphor-icons/vue';
import apiClient from '@/api/client';
import { useClientPagination } from '@/composables/useClientPagination';

const activeTab = ref('banks');
const banks = ref([]);
const dsas = ref([]);
const { paginatedItems: paginatedBanks, pagination: bankPagination, setPage: setBankPage, setPageSize: setBankPageSize } = useClientPagination(banks, 10);
const { paginatedItems: paginatedDsas, pagination: dsaPagination, setPage: setDsaPage, setPageSize: setDsaPageSize } = useClientPagination(dsas, 10);

const isAddBankModalOpen = ref(false);
const isAddDsaModalOpen = ref(false);

const bankForm = reactive({
  bankName: '',
  branch: '',
  contactPerson: '',
  mobile: '',
  email: '',
  standardCommissionRate: 0.5,
});

const dsaForm = reactive({
  companyName: '',
  contactPerson: '',
  mobile: '',
  email: '',
  standardCommissionRate: 0.6,
});

const fetchMasters = async () => {
  try {
    const [bRes, dRes] = await Promise.all([
      apiClient.get('/loans/banks'),
      apiClient.get('/loans/dsas'),
    ]);
    banks.value = bRes.data?.data || bRes.data || [];
    dsas.value = dRes.data?.data || dRes.data || [];
  } catch (err) {
    console.error('Error loading Bank/DSA masters:', err);
  }
};

onMounted(() => {
  fetchMasters();
});

const handleAddBank = async () => {
  try {
    await apiClient.post('/loans/banks', { ...bankForm });
    isAddBankModalOpen.value = false;
    await fetchMasters();
  } catch (err) {
    console.error('Error adding bank:', err);
  }
};

const handleAddDSA = async () => {
  try {
    await apiClient.post('/loans/dsas', { ...dsaForm });
    isAddDsaModalOpen.value = false;
    await fetchMasters();
  } catch (err) {
    console.error('Error adding DSA:', err);
  }
};
</script>
