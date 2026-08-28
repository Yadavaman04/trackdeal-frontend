<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-fade-in" @click.self="close">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden transition-all text-xs">
      <!-- Search Input Header -->
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <span class="text-slate-400 text-base">🔍</span>
        <input 
          ref="searchInputRef"
          v-model="searchQuery" 
          type="text" 
          placeholder="Search leads, properties, projects, deals, contacts... (Press Esc to close)"
          class="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none font-medium"
          @keydown.esc="close"
          @input="performSearch"
        />
        <button @click="close" class="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800">
          ESC
        </button>
      </div>

      <!-- Search Results Area -->
      <div class="max-h-[60vh] overflow-y-auto p-3 space-y-4">
        <!-- Loading State -->
        <div v-if="loading" class="py-6 text-center text-slate-400">
          <span class="text-xs">Searching TrackDeal records...</span>
        </div>

        <!-- Quick Links when empty -->
        <div v-else-if="!searchQuery" class="space-y-3 p-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Quick Navigation</span>
          <div class="grid grid-cols-2 gap-2">
            <router-link to="/app/dashboard" @click="close" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
              <span>📊</span>
              <span>Dashboard</span>
            </router-link>
            <router-link to="/app/leads" @click="close" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
              <span>👥</span>
              <span>Leads Directory</span>
            </router-link>
            <router-link to="/app/properties" @click="close" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
              <span>🏢</span>
              <span>Properties</span>
            </router-link>
            <router-link to="/app/deals" @click="close" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
              <span>🤝</span>
              <span>Deals Pipeline</span>
            </router-link>
            <router-link to="/app/commissions" @click="close" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
              <span>💰</span>
              <span>Commissions</span>
            </router-link>
            <router-link to="/app/commissions/receivables" @click="close" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
              <span>📑</span>
              <span>Receivables Ledger</span>
            </router-link>
          </div>
        </div>

        <!-- Empty search results -->
        <div v-else-if="resultsCount === 0" class="py-8 text-center text-slate-400 space-y-1">
          <span class="text-2xl">🔍</span>
          <p class="font-semibold text-slate-600 dark:text-slate-300">No results found for "{{ searchQuery }}"</p>
          <p class="text-[11px]">Try searching by lead name, phone number, project, or deal ID.</p>
        </div>

        <!-- Grouped Results -->
        <div v-else class="space-y-4">
          <!-- 1. Leads Group -->
          <div v-if="results.leads?.length > 0" class="space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-2 block">
              Leads & Inquiries ({{ results.leads.length }})
            </span>
            <router-link 
              v-for="lead in results.leads" 
              :key="lead._id"
              :to="`/app/leads/${lead._id}`" 
              @click="close"
              class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors block"
            >
              <div class="space-y-0.5">
                <div class="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-2">
                  <span>{{ lead.firstName }} {{ lead.lastName || '' }}</span>
                  <span 
                    v-if="lead.temperature" 
                    class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                    :class="lead.temperature === 'hot' ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'"
                  >
                    {{ lead.temperature }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400">
                  {{ lead.preferredPropertyType || 'Residential' }} · {{ lead.budgetMax ? '₹' + Number(lead.budgetMax).toLocaleString('en-IN') : 'Budget Flexible' }}
                </div>
              </div>
              <span class="text-[10px] font-semibold text-slate-400 capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {{ (lead.stage || 'new').replace(/_/g, ' ') }}
              </span>
            </router-link>
          </div>

          <!-- 2. Properties & Projects Group -->
          <div v-if="results.properties?.length > 0" class="space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 block">
              Properties & Inventory ({{ results.properties.length }})
            </span>
            <router-link 
              v-for="prop in results.properties" 
              :key="prop._id"
              :to="`/app/properties/${prop._id}`" 
              @click="close"
              class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors block"
            >
              <div class="space-y-0.5">
                <div class="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  {{ prop.title || prop.name }}
                </div>
                <div class="text-[11px] text-slate-400">
                  {{ prop.location || prop.city }} · {{ prop.configuration || '3 BHK' }}
                </div>
              </div>
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ₹{{ Number(prop.price || prop.askingPrice || 0).toLocaleString('en-IN') }}
              </span>
            </router-link>
          </div>

          <!-- 3. Deals Group -->
          <div v-if="results.deals?.length > 0" class="space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2 block">
              Deals & Transactions ({{ results.deals.length }})
            </span>
            <router-link 
              v-for="deal in results.deals" 
              :key="deal._id"
              :to="`/app/deals/${deal._id}`" 
              @click="close"
              class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors block"
            >
              <div class="space-y-0.5">
                <div class="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  {{ deal.dealNumber }}
                </div>
                <div class="text-[11px] text-slate-400">
                  Value: ₹{{ Number(deal.dealValue || 0).toLocaleString('en-IN') }}
                </div>
              </div>
              <span class="text-[10px] font-bold uppercase text-indigo-600">
                {{ deal.status }}
              </span>
            </router-link>
          </div>

          <!-- 4. Loans Group -->
          <div v-if="results.loans?.length > 0" class="space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-2 block">
              Loan Cases & Applications ({{ results.loans.length }})
            </span>
            <router-link 
              v-for="loan in results.loans" 
              :key="loan._id"
              :to="`/app/loans/${loan._id}`" 
              @click="close"
              class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors block"
            >
              <div class="space-y-0.5">
                <div class="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-2">
                  <span>{{ loan.loanCaseNumber }}</span>
                  <span class="text-slate-400 font-normal">· {{ loan.customerId?.firstName }} {{ loan.customerId?.lastName }}</span>
                </div>
                <div class="text-[11px] text-slate-400">
                  {{ loan.preferredBank || 'Bank' }} · ₹{{ Number(loan.requiredAmount || 0).toLocaleString('en-IN') }}
                </div>
              </div>
              <span class="text-[10px] font-bold uppercase text-blue-600">
                {{ (loan.stage || 'new').replace(/_/g, ' ') }}
              </span>
            </router-link>
          </div>

          <!-- 5. Agreements Group -->
          <div v-if="results.agreements?.length > 0" class="space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 block">
              Property Agreements ({{ results.agreements.length }})
            </span>
            <router-link 
              v-for="agr in results.agreements" 
              :key="agr._id"
              :to="`/app/agreements/${agr._id}`" 
              @click="close"
              class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors block"
            >
              <div class="space-y-0.5">
                <div class="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-2">
                  <span>{{ agr.agreementNumber }}</span>
                  <span class="text-slate-400 font-normal">· {{ agr.structuredData?.property?.flatNumber ? 'Flat ' + agr.structuredData.property.flatNumber : agr.agreementType }}</span>
                </div>
                <div class="text-[11px] text-slate-400">
                  {{ agr.structuredData?.transferees?.[0]?.name || 'Buyer' }} · ₹{{ Number(agr.structuredData?.consideration?.totalAmount || 0).toLocaleString('en-IN') }}
                </div>
              </div>
              <span class="text-[10px] font-bold uppercase text-emerald-600">
                {{ (agr.status || 'draft').replace(/_/g, ' ') }}
              </span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Footer Help -->
      <div class="p-3 bg-slate-50 dark:bg-slate-850/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
        <span>Quick search across all active CRM modules</span>
        <span class="font-mono">⌘ + K / Ctrl + K</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
import apiClient from '@/api/client';

const props = defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const searchQuery = ref('');
const loading = ref(false);
const searchInputRef = ref(null);

const results = ref({
  leads: [],
  properties: [],
  deals: [],
  loans: [],
  agreements: [],
});

const resultsCount = computed(() => {
  return (results.value.leads?.length || 0) + 
         (results.value.properties?.length || 0) + 
         (results.value.deals?.length || 0) +
         (results.value.loans?.length || 0) +
         (results.value.agreements?.length || 0);
});

watch(() => props.isOpen, (open) => {
  if (open) {
    searchQuery.value = '';
    results.value = { leads: [], properties: [], deals: [], loans: [], agreements: [] };
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});

let searchTimer = null;
function performSearch() {
  clearTimeout(searchTimer);
  const q = searchQuery.value.trim();
  if (!q) {
    results.value = { leads: [], properties: [], deals: [], loans: [], agreements: [] };
    return;
  }

  searchTimer = setTimeout(async () => {
    loading.value = true;
    try {
      const [leadsRes, propRes, dealsRes, loansRes, agrRes] = await Promise.allSettled([
        apiClient.get('/leads', { params: { search: q, limit: 5 } }),
        apiClient.get('/properties', { params: { search: q, limit: 5 } }),
        apiClient.get('/deals', { params: { search: q, limit: 5 } }),
        apiClient.get('/loans', { params: { search: q, limit: 5 } }),
        apiClient.get('/agreements', { params: { search: q, limit: 5 } }),
      ]);

      results.value.leads = leadsRes.status === 'fulfilled' ? (leadsRes.value.data?.data || []) : [];
      results.value.properties = propRes.status === 'fulfilled' ? (propRes.value.data?.data || []) : [];
      results.value.deals = dealsRes.status === 'fulfilled' ? (dealsRes.value.data?.data || []) : [];
      results.value.loans = loansRes.status === 'fulfilled' ? (loansRes.value.data?.data || []) : [];
      results.value.agreements = agrRes.status === 'fulfilled' ? (agrRes.value.data?.data || []) : [];
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      loading.value = false;
    }
  }, 250);
}

function close() {
  emit('close');
}

// Global Keyboard Shortcut handler
function handleGlobalKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (props.isOpen) {
      close();
    } else {
      // emit open event or parent toggle
      window.dispatchEvent(new CustomEvent('toggle-global-search'));
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>
