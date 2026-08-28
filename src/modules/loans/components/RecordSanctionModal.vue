<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
    <div class="bg-surface border border-default w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-default flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-950/20">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhCertificate :size="22" class="text-emerald-600" weight="duotone" />
            Record Loan Sanction 🎉
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">Enter bank approval terms, sanctioned amount, and rate</p>
        </div>
        <button @click="$emit('close')" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <PhX :size="18" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sanctioning Bank *</label>
            <input v-model="form.bankName" required type="text" placeholder="e.g. HDFC Bank, SBI" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 font-medium" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sanction Date *</label>
            <input v-model="form.sanctionDate" required type="date" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sanctioned Amount (₹) *</label>
            <input v-model.number="form.sanctionedAmount" required type="number" min="1" placeholder="e.g. 9000000" class="w-full bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3.5 py-2 text-sm text-emerald-950 dark:text-emerald-200 font-bold focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sanction Letter Number</label>
            <input v-model="form.sanctionLetterNumber" type="text" placeholder="e.g. SANCT-2026-8877" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 font-mono" />
          </div>
        </div>

        <!-- Financial Terms -->
        <div class="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-default">
          <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-1">Interest Rate (%)</label>
            <input v-model.number="form.interestRate" type="number" step="0.05" placeholder="e.g. 8.4" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 font-semibold" />
          </div>
          <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-1">Tenure (Years)</label>
            <input v-model.number="form.tenureYears" type="number" placeholder="e.g. 20" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 font-semibold" />
          </div>
          <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-1">Approx. EMI (₹)</label>
            <input v-model.number="form.emi" type="number" placeholder="e.g. 77500" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 font-semibold" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Processing Fee (₹)</label>
            <input v-model.number="form.processingFee" type="number" placeholder="e.g. 10000" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sanction Validity Till</label>
            <input v-model="form.validTill" type="date" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Special Conditions / Remarks</label>
          <textarea v-model="form.remarks" rows="2" placeholder="e.g. Subject to legal title clearance and builder NOC..." class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"></textarea>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-default flex items-center justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-2">
            <PhCircleNotch v-if="loading" class="animate-spin" :size="16" />
            Confirm Sanction
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { PhCertificate, PhX, PhCircleNotch } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: Boolean,
  loanCase: Object,
  loading: Boolean,
});

const emit = defineEmits(['close', 'submit']);

const form = reactive({
  bankName: '',
  sanctionDate: new Date().toISOString().slice(0, 10),
  sanctionedAmount: null,
  sanctionLetterNumber: '',
  interestRate: 8.4,
  tenureYears: 20,
  emi: null,
  processingFee: 0,
  validTill: '',
  remarks: '',
});

watch(
  () => props.loanCase,
  (val) => {
    if (val) {
      form.bankName = val.preferredBank || val.applications?.[0]?.bankName || '';
      form.sanctionedAmount = val.appliedAmount || val.requiredAmount || 0;
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>
