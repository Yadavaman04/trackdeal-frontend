<template>
  <div v-if="isLoading" class="animate-pulse space-y-6">
    <div class="h-10 bg-slate-200 dark:bg-slate-850 rounded w-1/4"></div>
    <div class="h-64 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
  </div>

  <div v-else-if="builder" class="space-y-6">
    <!-- Back to builders link -->
    <div>
      <router-link to="/app/builders" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
        <PhCaretLeft :size="12" />
        <span>Back to Builders Directory</span>
      </router-link>
    </div>

    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">
            {{ builder.name }}
          </h2>
          <span class="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-450 px-1.5 py-0.5 rounded">
            CODE: {{ builder.code }}
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          📍 Address: {{ builder.address || '—' }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="isEditOpen = true"
          class="btn btn-sm btn-primary"
        >
          Edit Profile
        </button>
      </div>
    </div>

    <!-- Tabs grid layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Tab Bar -->
        <div class="border-b border-default flex space-x-4 overflow-x-auto text-xs font-bold uppercase tracking-wider text-slate-400">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            class="pb-2 border-b-2 transition-all px-1"
            :class="activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent hover:text-slate-700'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab 1: Overview -->
        <div v-if="activeTab === 'overview'" class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-5 text-xs">
          <div>
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 mb-2">Corporate Contacts</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Email Address</span>
                <span class="font-semibold text-slate-750 dark:text-slate-200">{{ builder.email || '—' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Phone Number</span>
                <span class="font-semibold text-slate-750 dark:text-slate-200">{{ builder.phone || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Escrow info -->
          <div class="border-t border-dashed border-default pt-4">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 mb-2">Verified Escrow Bank Registry</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Bank Name</span>
                <span class="font-semibold text-slate-750 dark:text-slate-200">{{ builder.bankName || 'Not Registered' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold">IFSC Code</span>
                <span class="font-semibold text-slate-750 dark:text-slate-200 font-mono">{{ builder.bankIfsc || '—' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Account Number</span>
                <span class="font-semibold text-slate-750 dark:text-slate-200 font-mono">{{ builder.bankAccount || '—' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Account Holder Name</span>
                <span class="font-semibold text-slate-750 dark:text-slate-200">{{ builder.bankHolder || '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Projects list -->
        <div v-if="activeTab === 'projects'" class="bg-surface border border-default rounded-xl shadow-sm overflow-hidden">
          <div v-if="isProjectsLoading" class="p-6 text-center text-slate-400 text-xs animate-pulse">
            Loading developer projects...
          </div>
          <table v-else-if="projectsList.length > 0" class="w-full text-xs text-left">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-slate-900 border-b border-default text-slate-450 font-bold uppercase text-[10px] tracking-wider">
                <th class="p-4">Project Name</th>
                <th class="p-4">Locality / City</th>
                <th class="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default text-slate-655 font-medium">
              <tr v-for="proj in projectsList" :key="proj._id || proj.id" class="hover:bg-slate-55/40">
                <td class="p-4">
                  <router-link :to="`/app/projects/${proj._id || proj.id}`" class="font-bold text-primary hover:underline">
                    {{ proj.name }}
                  </router-link>
                  <span class="text-[9px] text-slate-400 block font-mono">{{ proj.code }}</span>
                </td>
                <td class="p-4">
                  <span>{{ proj.locality || '—' }}</span>
                  <span class="text-slate-450 block text-[9px]">{{ proj.city || '—' }}</span>
                </td>
                <td class="p-4 text-center font-bold text-slate-700 capitalize">
                  {{ (proj.status || 'upcoming').replace('_', ' ') }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="text-center py-12 text-slate-450 italic text-xs">
            No projects registered for this builder.
          </div>
        </div>

        <!-- Tab 3: Commission slab Agreements -->
        <div v-if="activeTab === 'agreements'" class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4 text-xs text-center py-12 text-slate-400 italic">
          No active commission slab agreements registered for this builder.
        </div>

        <!-- Tab 4: Performance Index -->
        <div v-if="activeTab === 'performance'" class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4 text-xs">
          <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
            Developer Booking Performance Metrics
          </h4>

          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="border border-default rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900">
              <span class="text-slate-450 text-[8px] uppercase block font-bold">Payout Speed</span>
              <span class="font-heading font-bold text-slate-800 dark:text-slate-200 block text-lg mt-1">—</span>
              <span class="text-[8px] text-slate-400">No payouts logged</span>
            </div>
            <div class="border border-default rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900">
              <span class="text-slate-450 text-[8px] uppercase block font-bold">Booking rollovers</span>
              <span class="font-heading font-bold text-slate-800 dark:text-slate-200 block text-lg mt-1">0%</span>
              <span class="text-[8px] text-slate-400">No conversions</span>
            </div>
            <div class="border border-default rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900">
              <span class="text-slate-450 text-[8px] uppercase block font-bold">Escalation Rate</span>
              <span class="font-heading font-bold text-slate-800 dark:text-slate-200 block text-lg mt-1">0%</span>
              <span class="text-[8px] text-slate-400">No issues</span>
            </div>
          </div>
        </div>

        <!-- Tab 5: Documents Directory -->
        <div v-if="activeTab === 'documents'" class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4 text-xs text-center py-12 text-slate-400 italic">
          No legal contracts or GST certificates registered for this builder.
        </div>
      </div>

      <!-- Right Column: Sidebar summaries -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm h-fit space-y-4 text-xs">
        <h3 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-default pb-2">
          Receivables Audit Summary
        </h3>
        
        <div class="space-y-3.5">
          <div class="flex justify-between border-b border-dashed border-default pb-2">
            <span class="text-slate-450 font-medium">Pending Split Claims:</span>
            <span class="font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(0) }}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-default pb-2">
            <span class="text-slate-450 font-medium">Cleared Commission:</span>
            <span class="font-bold text-emerald-600">{{ formatCurrency(0) }}</span>
          </div>
          <p class="text-[9px] text-slate-400">
            Claims are processed matching escrow banking settings automatically.
          </p>
        </div>
      </div>
    </div>

    <!-- Edit Builder profile drawer -->
    <BuilderCreateDrawer 
      v-if="builder"
      :isOpen="isEditOpen" 
      :builder="builder"
      @close="isEditOpen = false"
      @success="refetch"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { PhCaretLeft, PhFileText } from '@phosphor-icons/vue';
import { useBuilderQuery, useProjectsQuery } from '../queries';
import BuilderCreateDrawer from '../components/BuilderCreateDrawer.vue';

const route = useRoute();

const activeTab = ref('overview');
const isEditOpen = ref(false);

const { data: builderData, isLoading, refetch } = useBuilderQuery(route.params.id);
const { data: projectsData, isLoading: isProjectsLoading } = useProjectsQuery({ builderId: route.params.id });

const builder = computed(() => builderData.value?.data || null);
const projectsList = computed(() => projectsData.value?.data || []);

const tabs = [
  { key: 'overview', label: 'Company Profile' },
  { key: 'projects', label: 'Active Projects' },
  { key: 'agreements', label: 'Commission slabs' },
  { key: 'performance', label: 'Performance index' },
  { key: 'documents', label: 'Legal contracts' }
];

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>
