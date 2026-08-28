<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transition-all text-xs">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
        <div>
          <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <AppIcon name="handshake" :size="18" weight="duotone" />
            </span>
            <span>Close Deal & Setup Commission</span>
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Mark this deal as Closed Won and automatically generate the financial commission & receivables record.
          </p>
        </div>
        <button 
          @click="close"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors"
        >
          <AppIcon name="close" :size="15" weight="bold" />
        </button>
      </div>

      <!-- Modal Body Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
        <!-- Deal Information Section -->
        <div class="space-y-3">
          <h4 class="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center justify-between">
            <span>1. Deal & Property Valuation</span>
            <span class="font-normal text-slate-400 normal-case">Deal #{{ deal?.dealNumber || 'NEW' }}</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer</label>
              <div class="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 font-medium">
                {{ customerName }}
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Property / Project</label>
              <div class="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 font-medium truncate">
                {{ projectOrPropertyName }}
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Final Property Deal Value (₹) *</label>
              <input 
                v-model.number="form.finalPropertyValue"
                type="number"
                min="1"
                required
                @input="calculateExpectedCommission"
                class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                placeholder="e.g. 15000000"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Closing Date *</label>
              <input 
                v-model="form.closingDate"
                type="date"
                required
                class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <!-- Commission Details Section -->
        <div class="space-y-3 pt-2">
          <h4 class="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span>2. Brokerage & Commission Structure</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Commission Type *</label>
              <select 
                v-model="form.commissionType"
                @change="calculateExpectedCommission"
                class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="slab">Slab Based</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div v-if="form.commissionType === 'percentage'">
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Commission Rate (%) *</label>
              <input 
                v-model.number="form.commissionRate"
                type="number"
                step="0.05"
                min="0.1"
                max="100"
                @input="calculateExpectedCommission"
                class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                placeholder="2"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Commission (₹) *</label>
              <input 
                v-model.number="form.expectedAmount"
                type="number"
                min="1"
                required
                class="w-full bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3 py-2 text-emerald-700 dark:text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
                placeholder="₹3,00,000"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Commission Payable By *</label>
              <select 
                v-model="form.payablePartyType"
                class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="builder">Builder / Developer</option>
                <option value="seller">Property Seller</option>
                <option value="customer">Customer / Buyer</option>
                <option value="channel_partner">Channel Partner</option>
                <option value="broker">Broker</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Paying Entity / Name *</label>
              <input 
                v-model="form.payablePartyName"
                type="text"
                required
                class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Godrej Properties / ABC Developers"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Payment Due Date *</label>
              <input 
                v-model="form.expectedPaymentDate"
                type="date"
                required
                class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">TDS Rate (Section 194H)</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model.number="form.tdsPercentage"
                  type="number"
                  step="0.5"
                  class="w-24 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                  placeholder="5"
                />
                <span class="text-slate-500 text-[11px]">% TDS withholder deduction</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Terms & Remarks</label>
            <textarea 
              v-model="form.paymentTerms"
              rows="2"
              class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
              placeholder="e.g. 50% on Agreement, 50% on Registration"
            ></textarea>
          </div>
        </div>

        <!-- Submission Summary Preview Banner -->
        <div class="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider block">Financial Summary</span>
            <p class="text-indigo-900 dark:text-indigo-100 font-semibold">
              Deal value: ₹{{ Number(form.finalPropertyValue || 0).toLocaleString('en-IN') }} <AppIcon name="arrowRight" :size="12" class="inline mx-1" /> Expected commission: <b class="text-emerald-600 dark:text-emerald-400">₹{{ Number(form.expectedAmount || 0).toLocaleString('en-IN') }}</b>
            </p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-200/60 dark:bg-indigo-800/60 text-indigo-800 dark:text-indigo-200">
            Auto-Receivable
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button 
            type="button"
            @click="close"
            :disabled="submitting"
            class="px-4 py-2 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            :disabled="submitting"
            class="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <span v-if="submitting" class="animate-spin text-xs">⏳</span>
            <span>Confirm & Close Won Deal</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  deal: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['close', 'deal-closed']);

const submitting = ref(false);

const customerName = computed(() => {
  const c = props.deal?.customer;
  if (!c) return 'Customer';
  if (typeof c === 'string') return c;
  return c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Customer';
});

const projectOrPropertyName = computed(() => {
  const p = props.deal?.project;
  const prop = props.deal?.property;
  if (p && typeof p === 'object') return p.name || 'Project';
  if (prop && typeof prop === 'object') return prop.title || 'Property';
  return 'Property / Unit';
});

const form = ref({
  finalPropertyValue: 10000000,
  closingDate: new Date().toISOString().slice(0, 10),
  commissionType: 'percentage',
  commissionRate: 2,
  expectedAmount: 200000,
  payablePartyType: 'builder',
  payablePartyName: '',
  expectedPaymentDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  tdsPercentage: 5,
  paymentTerms: '50% on Agreement, 50% on Registration',
});

watch(() => props.deal, (newDeal) => {
  if (newDeal) {
    const val = Number(newDeal.agreedPrice || newDeal.dealValue || newDeal.askingPrice || 10000000);
    const rate = Number(newDeal.commissionPercentage || 2);
    form.value.finalPropertyValue = val;
    form.value.commissionRate = rate;
    form.value.expectedAmount = (val * rate) / 100;
    
    if (newDeal.project && typeof newDeal.project === 'object') {
      form.value.payablePartyName = newDeal.project.builderName || newDeal.project.name || 'Developer';
      form.value.payablePartyType = 'builder';
    } else {
      form.value.payablePartyName = 'Property Seller / Owner';
      form.value.payablePartyType = 'seller';
    }
  }
}, { immediate: true });

function calculateExpectedCommission() {
  if (form.value.commissionType === 'percentage') {
    const val = Number(form.value.finalPropertyValue) || 0;
    const rate = Number(form.value.commissionRate) || 0;
    form.value.expectedAmount = Math.round((val * rate) / 100);
  }
}

function close() {
  emit('close');
}

function handleSubmit() {
  submitting.value = true;
  emit('deal-closed', {
    status: 'deal_closed',
    finalPropertyValue: form.value.finalPropertyValue,
    closingDate: form.value.closingDate,
    commissionDetails: {
      commissionType: form.value.commissionType,
      commissionRate: form.value.commissionRate,
      expectedAmount: form.value.expectedAmount,
      payablePartyType: form.value.payablePartyType,
      payablePartyName: form.value.payablePartyName,
      expectedPaymentDate: form.value.expectedPaymentDate,
      tdsPercentage: form.value.tdsPercentage,
      paymentTerms: form.value.paymentTerms,
    },
  });
  submitting.value = false;
}
</script>
