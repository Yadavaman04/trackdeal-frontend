<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Qualified Matching Leads Matrix" 
    width="680px"
    @close="$emit('close')"
  >
    <div class="space-y-4 text-xs">
      <!-- Target Specifications summary -->
      <div class="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 p-3.5 rounded-xl space-y-1">
        <span class="text-[9px] text-indigo-400 font-bold block uppercase tracking-wider">Unit Profile Requirements</span>
        <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">
          {{ propertyTitle }}
        </h4>
        <div class="text-[10px] text-slate-500 flex justify-between pt-1">
          <span>Preferences: <b>2 BHK, 3 BHK</b></span>
          <span>Locality: <b>Whitefield, Bangalore</b></span>
          <span>Price Benchmark: <b class="text-primary">{{ formatCurrency(propertyPrice) }}</b></span>
        </div>
      </div>

      <!-- Live Matches list -->
      <div v-if="isLoading" class="animate-pulse space-y-3">
        <div v-for="i in 3" :key="i" class="h-28 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
      </div>
      <div v-else-if="matchesList.length > 0" class="space-y-3">
        <div 
          v-for="lead in matchesList" 
          :key="lead.id || lead._id"
          class="border border-default bg-surface rounded-xl p-4 space-y-3 hover:border-slate-350 dark:hover:border-slate-700 transition-all shadow-xs"
        >
          <!-- Lead header and score -->
          <div class="flex items-center justify-between border-b border-default pb-2">
            <div>
              <h4 class="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">
                {{ lead.firstName }} {{ lead.lastName || '' }}
              </h4>
              <span class="text-[9px] text-slate-400">
                Last Activity: contacted {{ lead.lastActivityDays || 2 }} days ago
              </span>
            </div>
            <div class="text-right">
              <span 
                class="px-2 py-0.5 rounded text-[10px] font-bold"
                :class="lead.matchScore >= 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
              >
                Match Score: {{ lead.matchScore }}%
              </span>
            </div>
          </div>

          <!-- Matching stats -->
          <div class="grid grid-cols-3 gap-2 text-[10px] text-slate-600 dark:text-slate-400">
            <div>
              <span class="text-[8px] text-slate-400 block uppercase">Preferred layouts</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">{{ lead.preferredBhk || '2 BHK, 3 BHK' }}</span>
            </div>
            <div>
              <span class="text-[8px] text-slate-400 block uppercase">Budget Scope</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">{{ lead.budgetRange || '₹65L - ₹85L' }}</span>
            </div>
            <div>
              <span class="text-[8px] text-slate-400 block uppercase">Weight parameters</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">Locality (35%)</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center border-t border-dashed border-default pt-3">
            <span class="text-[10px] text-slate-400">📞 {{ lead.mobile }}</span>
            <div class="flex space-x-2">
              <a 
                :href="`tel:${lead.mobile}`"
                class="px-2.5 py-1.2 border border-default rounded hover:bg-slate-50 font-semibold"
              >
                Call
              </a>
              <a 
                :href="`https://wa.me/${lead.mobile.replace(/\D/g, '')}`" 
                target="_blank"
                class="px-2.5 py-1.2 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 font-semibold"
              >
                WhatsApp
              </a>
              <button 
                @click="$emit('hold', lead)"
                class="px-2.5 py-1.2 bg-primary text-white rounded hover:bg-opacity-95 font-semibold"
              >
                Hold Unit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12 text-slate-450 italic">
        No matching leads found for this unit configuration.
      </div>
    </div>
  </AppDrawer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/api/client';
import AppDrawer from '@/components/AppDrawer.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  property: { type: Object, default: null }
});

const emit = defineEmits(['close', 'hold']);

const isLoading = ref(false);
const rawLeads = ref([]);

const propertyTitle = computed(() => props.property?.title || props.property?.unitNumber || 'Unit Item');
const propertyPrice = computed(() => props.property?.price || 0);

const loadMatchingData = async () => {
  if (!props.isOpen) return;
  isLoading.value = true;
  try {
    const res = await apiClient.get('/leads');
    rawLeads.value = res.data?.data || [];
  } catch (error) {
    console.error('Failed to load matching leads details:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadMatchingData);

// Dynamically generate mock match scores for demonstration based on lead and property
const matchesList = computed(() => {
  return rawLeads.value.map((lead, idx) => {
    // Generate deterministic matching score between 75% and 98%
    const seed = (lead.firstName.charCodeAt(0) + idx) % 24;
    const score = 75 + seed;
    
    return {
      ...lead,
      matchScore: score,
      lastActivityDays: (seed % 5) + 1,
      preferredBhk: seed % 2 === 0 ? '2 BHK, 3 BHK' : '3 BHK, 4 BHK',
      budgetRange: score >= 90 ? '₹70L - ₹85L' : '₹60L - ₹75L'
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
});

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>
