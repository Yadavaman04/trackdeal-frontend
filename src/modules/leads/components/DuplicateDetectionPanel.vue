<template>
  <div v-if="duplicateState.isDuplicate && !isDismissed" class="space-y-2">
    <!-- Confirmed Linking Banner -->
    <div 
      v-if="isConfirmed" 
      class="p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all"
      style="background-color: hsl(var(--success-50)); border-color: hsl(var(--success-200)); color: hsl(var(--success-800));"
    >
      <div class="flex items-center gap-2.5">
        <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
          <AppIcon name="check" :size="12" weight="bold" />
        </span>
        <div>
          <p class="font-bold text-slate-900 dark:text-slate-100">
            Linked to Existing Customer Profile: <span class="text-emerald-700">{{ customerName }}</span>
          </p>
          <p class="text-[10px] text-slate-500">
            This new lead and its property requirement will be saved under this customer's profile history.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button 
          type="button" 
          @click="openProfile"
          class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs"
        >
          View Profile ↗
        </button>
        <button 
          type="button" 
          @click="unconfirm"
          class="text-[11px] text-slate-400 hover:text-slate-600 underline"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Warning & Confirmation Dialog Card -->
    <div 
      v-else
      class="p-4 rounded-xl border text-xs space-y-3 transition-all shadow-xs"
      style="background-color: hsl(var(--warning-50, 48 100% 96%)); border-color: hsl(var(--warning-200, 48 96% 76%)); color: hsl(var(--neutral-900));"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-2.5">
          <AppIcon name="warning" :size="17" class="shrink-0 mt-0.5" />
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-bold text-xs text-amber-900 dark:text-amber-300">
                Existing Customer Profile Found
              </h4>
              <span 
                class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                :class="duplicateState.matchType === 'mobile' || duplicateState.matchType === 'email' ? 'bg-amber-200 text-amber-900 border border-amber-300' : 'bg-slate-200 text-slate-800'"
              >
                {{ getMatchBadgeText(duplicateState.matchType) }}
              </span>
            </div>
            <p class="text-[11px] text-amber-800/90 dark:text-amber-200/90 mt-0.5 leading-relaxed">
              A customer profile matching this name, mobile number, or email address already exists in the system.
              This customer may have returned with a new property requirement.
            </p>
          </div>
        </div>

        <button 
          type="button" 
          @click="dismiss" 
          class="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors text-sm font-bold"
          title="Dismiss warning"
        >
          <AppIcon name="close" :size="14" weight="bold" />
        </button>
      </div>

      <!-- Customer Summary Details Box -->
      <div 
        class="p-3 rounded-lg border bg-white/80 dark:bg-slate-900/80 space-y-1.5"
        style="border-color: hsl(var(--warning-200, 48 96% 76%));"
      >
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-900 dark:text-slate-100 text-body-sm">
            <AppIcon name="user" :size="13" class="inline" /> {{ customerName }}
          </span>
          <span v-if="duplicateState.existingLeads?.length" class="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {{ duplicateState.existingLeads.length }} Previous Lead(s) on File
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
          <span v-if="customer?.mobile" class="inline-flex items-center gap-1"><AppIcon name="phone" :size="12" /> <b>Mobile:</b> {{ customer.mobile }}</span>
          <span v-if="customer?.email" class="inline-flex items-center gap-1"><AppIcon name="email" :size="12" /> <b>Email:</b> {{ customer.email }}</span>
          <span v-if="customer?.alternativeMobile">Alt: {{ customer.alternativeMobile }}</span>
        </div>

        <p class="text-[11px] font-medium text-amber-900 pt-1 border-t border-amber-100">
          Would you like to create a new lead for this existing customer?
        </p>
      </div>

      <!-- 3 Required Action Buttons -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button 
          type="button"
          @click="openProfile"
          class="px-3 py-1.5 rounded-lg border text-[11px] font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs flex items-center gap-1.5"
          style="border-color: hsl(var(--neutral-200));"
        >
          <span class="inline-flex items-center gap-1"><AppIcon name="eye" :size="13" /> View existing profile</span>
        </button>

        <div class="flex items-center gap-2">
          <button 
            type="button"
            @click="dismiss"
            class="px-3 py-1.5 rounded-lg border text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style="border-color: hsl(var(--neutral-200));"
          >
            No, Cancel
          </button>

          <button 
            type="button"
            @click="confirmLink"
            class="px-4 py-1.5 rounded-lg bg-primary hover:bg-opacity-95 text-white text-[11px] font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span class="inline-flex items-center gap-1"><AppIcon name="check" :size="13" weight="bold" /> Yes, create new lead</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { checkDuplicateLead } from '../api/endpoints';

const props = defineProps({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  mobile: { type: String, default: '' },
  email: { type: String, default: '' },
});

const emit = defineEmits(['confirm', 'viewProfile', 'cancel', 'reset']);

const isDismissed = ref(false);
const isConfirmed = ref(false);

const duplicateState = reactive({
  isDuplicate: false,
  matchType: null,
  customer: null,
  existingLeads: [],
});

const customer = computed(() => duplicateState.customer);
const customerName = computed(() => {
  if (!customer.value) return 'Existing Customer';
  return `${customer.value.firstName || ''} ${customer.value.lastName || ''}`.trim() || customer.value.name || 'Existing Customer';
});

const getMatchBadgeText = (matchType) => {
  switch (matchType) {
    case 'mobile':
      return 'Matched by Mobile (Strong Match)';
    case 'email':
      return 'Matched by Email (Strong Match)';
    case 'name':
      return 'Matched by Name';
    default:
      return 'Customer Found';
  }
};

let debounceTimer = null;

const runDuplicateCheck = () => {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    // If all input fields are empty, reset
    if (!props.mobile && !props.email && !props.firstName) {
      duplicateState.isDuplicate = false;
      duplicateState.customer = null;
      duplicateState.existingLeads = [];
      isConfirmed.value = false;
      isDismissed.value = false;
      return;
    }

    const searchVal = props.mobile || props.email || `${props.firstName} ${props.lastName}`.trim();
    if (searchVal.length < 3) {
      duplicateState.isDuplicate = false;
      return;
    }

    try {
      const res = await checkDuplicateLead({
        mobile: props.mobile?.trim(),
        email: props.email?.trim(),
        firstName: props.firstName?.trim(),
        lastName: props.lastName?.trim(),
      });

      if (res.data?.isDuplicate && res.data?.customer) {
        duplicateState.isDuplicate = true;
        duplicateState.matchType = res.data.matchType;
        duplicateState.customer = res.data.customer;
        duplicateState.existingLeads = res.data.existingLeads || [];
        isDismissed.value = false;
      } else {
        duplicateState.isDuplicate = false;
        duplicateState.customer = null;
        duplicateState.existingLeads = [];
      }
    } catch (err) {
      console.warn('Duplicate check error:', err);
    }
  }, 350);
};

watch(
  () => [props.firstName, props.lastName, props.mobile, props.email],
  () => {
    if (!isConfirmed.value) {
      runDuplicateCheck();
    }
  }
);

const confirmLink = () => {
  isConfirmed.value = true;
  emit('confirm', {
    customer: duplicateState.customer,
    existingLeads: duplicateState.existingLeads,
  });
};

const unconfirm = () => {
  isConfirmed.value = false;
  emit('reset');
};

const openProfile = () => {
  emit('viewProfile', {
    customer: duplicateState.customer,
    existingLeads: duplicateState.existingLeads,
  });
};

const dismiss = () => {
  isDismissed.value = true;
  emit('cancel');
};
</script>

