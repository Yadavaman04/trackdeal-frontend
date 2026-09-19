<template>
  <Teleport to="body">
    <Transition name="drawer-slide">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[1000] flex justify-end overflow-hidden"
        style="background-color: rgba(9, 14, 26, 0.55); backdrop-filter: blur(3px);"
        @click.self="$emit('close')"
      >
        <!-- Modal Content Container (Right-Side Drawer) -->
        <div 
          class="relative w-full max-w-2xl h-full bg-surface shadow-2xl border-l border-default overflow-hidden z-10 flex flex-col text-slate-800 dark:text-slate-100"
          style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b flex items-center justify-between shrink-0" style="border-color: hsl(var(--neutral-100)); background-color: hsl(var(--neutral-50));">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base">
                <AppIcon name="user" :size="22" weight="duotone" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-base text-slate-900 dark:text-slate-100">
                    {{ customerName }}
                  </h3>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Existing Customer Master
                  </span>
                </div>
                <p class="text-caption text-slate-400">
                  Review complete customer history, past inquiries, requirements & deals.
                </p>
              </div>
            </div>
            <button 
              @click="$emit('close')"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <AppIcon name="close" :size="15" weight="bold" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto space-y-5 flex-1">
            <!-- Contact Card -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border bg-slate-50/70 dark:bg-slate-850/40 text-xs" style="border-color: hsl(var(--neutral-100));">
              <div>
                <span class="text-[10px] text-slate-400 font-semibold block uppercase">Phone Number</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1"><AppIcon name="phone" :size="12" /> {{ customer?.mobile || '—' }}</span>
                <span v-if="customer?.alternativeMobile" class="text-[10px] text-slate-500 block">Alt: {{ customer.alternativeMobile }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-semibold block uppercase">Email Address</span>
                <span class="font-medium text-slate-800 dark:text-slate-200 truncate flex items-center gap-1"><AppIcon name="email" :size="12" /> {{ customer?.email || 'Not provided' }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-semibold block uppercase">Customer Since</span>
                <span class="font-medium text-slate-700 dark:text-slate-300 inline-flex items-center gap-1"><AppIcon name="calendar" :size="12" /> {{ formatDate(customer?.createdAt) }}</span>
              </div>
            </div>

            <!-- Stats Bar -->
            <div class="grid grid-cols-3 gap-3">
              <div class="p-3 rounded-xl border text-center" style="border-color: hsl(var(--neutral-100));">
                <span class="text-[10px] text-slate-400 font-semibold uppercase block">Total Leads</span>
                <span class="text-xl font-bold text-primary">{{ leadsList.length }}</span>
              </div>
              <div class="p-3 rounded-xl border text-center" style="border-color: hsl(var(--neutral-100));">
                <span class="text-[10px] text-slate-400 font-semibold uppercase block">Active Pipeline</span>
                <span class="text-xl font-bold text-blue-600">{{ activeLeadsCount }}</span>
              </div>
              <div class="p-3 rounded-xl border text-center" style="border-color: hsl(var(--neutral-100));">
                <span class="text-[10px] text-slate-400 font-semibold uppercase block">Converted Deals</span>
                <span class="text-xl font-bold text-emerald-600">{{ wonDealsCount }}</span>
              </div>
            </div>

            <!-- Previous Leads Section -->
            <div>
              <div class="flex items-center justify-between mb-2.5">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="inline-flex items-center gap-1"><AppIcon name="clipboard" :size="13" /> Associated inquiries & property requirements ({{ leadsList.length }})</span>
                </h4>
              </div>

              <!-- Loading State -->
              <div v-if="isLoading" class="p-8 text-center text-slate-400 text-xs animate-pulse">
                Loading existing requirements & leads history...
              </div>

              <!-- Empty State -->
              <div v-else-if="leadsList.length === 0" class="p-6 text-center rounded-xl border border-dashed text-slate-400 text-xs" style="border-color: hsl(var(--neutral-200));">
                No active or historical leads currently linked.
              </div>

              <!-- Leads List Cards -->
              <div v-else class="space-y-3">
                <div 
                  v-for="(leadItem, idx) in leadsList" 
                  :key="leadItem._id || leadItem.id || idx"
                  class="p-4 rounded-xl border bg-surface hover:shadow-xs transition-shadow space-y-2 text-xs"
                  style="border-color: hsl(var(--neutral-100));"
                >
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-300">
                        #{{ idx + 1 }}
                      </span>
                      <span class="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {{ leadItem.firstName }} {{ leadItem.lastName || '' }}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase capitalize" :class="getStageBadgeClass(leadItem.status)">
                        {{ (leadItem.status || 'new').replace(/_/g, ' ') }}
                      </span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="text-[10px] text-slate-400">
                        {{ formatDate(leadItem.createdAt) }}
                      </span>
                      <router-link
                        :to="`/app/leads/${leadItem._id || leadItem.id}`"
                        target="_blank"
                        class="px-2.5 py-1 rounded border text-[11px] font-semibold text-primary hover:bg-primary/5 transition-colors inline-flex items-center gap-1"
                        style="border-color: hsl(var(--neutral-200));"
                      >
                        <span>Open Lead</span>
                        <span>↗</span>
                      </router-link>
                    </div>
                  </div>

                  <!-- Requirement Details -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-[11px]" style="border-color: hsl(var(--neutral-100));">
                    <div>
                      <span class="text-[9px] text-slate-400 uppercase font-semibold block">Property Type</span>
                      <span class="font-medium text-slate-700 dark:text-slate-200 capitalize">
                        {{ leadItem.buyerRequirement?.propertyType?.join(', ') || leadItem.requirements?.propertyType?.join(', ') || 'Any' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-[9px] text-slate-400 uppercase font-semibold block">BHK / Config</span>
                      <span class="font-medium text-slate-700 dark:text-slate-200">
                        {{ leadItem.buyerRequirement?.bhk?.join(', ') || leadItem.requirements?.bhk?.join(', ') || '—' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-[9px] text-slate-400 uppercase font-semibold block">Location</span>
                      <span class="font-medium text-slate-700 dark:text-slate-200 capitalize truncate block">
                        {{ leadItem.buyerRequirement?.preferredLocation || leadItem.buyerRequirement?.locality || leadItem.requirements?.locations?.join(', ') || '—' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-[9px] text-slate-400 uppercase font-semibold block">Budget</span>
                      <span class="font-bold text-slate-800 dark:text-slate-200">
                        {{ formatBudget(leadItem.budget || leadItem.requirements?.budget) }}
                      </span>
                    </div>
                  </div>

                  <!-- Notes/Source if present -->
                  <div v-if="leadItem.qualification?.notesRemarks || leadItem.requirements?.notes" class="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <AppIcon name="lightbulb" :size="12" class="inline mr-1" /> <b>Notes:</b> {{ leadItem.qualification?.notesRemarks || leadItem.requirements?.notes }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-6 py-3.5 border-t flex items-center justify-between shrink-0" style="border-color: hsl(var(--neutral-100)); background-color: hsl(var(--neutral-50));">
            <button 
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded-lg border text-caption font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              style="border-color: hsl(var(--neutral-200)); color: hsl(var(--neutral-700));"
            >
              Close
            </button>

            <button 
              type="button"
              @click="$emit('confirm', customer)"
              class="px-5 py-2 rounded-lg bg-primary hover:bg-opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span class="inline-flex items-center gap-1"><AppIcon name="check" :size="13" weight="bold" /> Yes, create new lead for this customer</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  customer: { type: Object, default: null },
  existingLeads: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false }
});

defineEmits(['close', 'confirm']);

const customerName = computed(() => {
  if (!props.customer) return 'Existing Customer';
  return `${props.customer.firstName || ''} ${props.customer.lastName || ''}`.trim() || props.customer.name || 'Existing Customer';
});

const leadsList = computed(() => {
  return props.existingLeads || [];
});

const activeLeadsCount = computed(() => {
  return leadsList.value.filter(l => !['won', 'lost'].includes(l.status)).length;
});

const wonDealsCount = computed(() => {
  return leadsList.value.filter(l => l.status === 'won').length;
});

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatBudget = (budget) => {
  if (!budget) return '—';
  const min = budget.min || budget.minBudget;
  const max = budget.max || budget.maxBudget;
  if (!min && !max) return '—';

  const formatNum = (num) => {
    if (!num) return '0';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  if (min && max && max < 999999999) {
    return `${formatNum(min)} - ${formatNum(max)}`;
  }
  return formatNum(min || max);
};

const getStageBadgeClass = (stage) => {
  switch (stage) {
    case 'won':
    case 'booked':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    case 'lost':
      return 'bg-rose-100 text-rose-800 border border-rose-300';
    case 'site_visit_scheduled':
    case 'site_visit_completed':
      return 'bg-purple-100 text-purple-800 border border-purple-300';
    case 'negotiation':
      return 'bg-amber-100 text-amber-800 border border-amber-300';
    default:
      return 'bg-blue-100 text-blue-800 border border-blue-300';
  }
};
</script>

<style scoped>
.drawer-slide-enter-active { transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-slide-leave-active { transition: transform 180ms cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }
</style>
