<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
    <div class="bg-surface border border-default w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-default flex items-center justify-between bg-blue-500/10 dark:bg-blue-950/20">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhMoney :size="22" class="text-blue-600" weight="duotone" />
            Record Loan Disbursement
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">Record released tranche or full loan payment to developer/escrow</p>
        </div>
        <button @click="$emit('close')" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <PhX :size="18" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <!-- Balance Status Strip -->
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-default flex items-center justify-between text-xs">
          <div>
            <span class="text-slate-400">Sanctioned:</span>
            <span class="font-bold text-slate-900 dark:text-white ml-1.5">₹{{ (loanCase?.sanctionedAmount || 0).toLocaleString('en-IN') }}</span>
          </div>
          <div>
            <span class="text-slate-400">Already Disbursed:</span>
            <span class="font-bold text-emerald-600 ml-1.5">₹{{ (loanCase?.disbursedAmount || 0).toLocaleString('en-IN') }}</span>
          </div>
          <div>
            <span class="text-slate-400">Remaining Balance:</span>
            <span class="font-bold text-primary-600 ml-1.5">₹{{ Math.max(0, (loanCase?.sanctionedAmount || 0) - (loanCase?.disbursedAmount || 0)).toLocaleString('en-IN') }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Disbursing Bank *</label>
            <input v-model="form.bankName" required type="text" placeholder="e.g. HDFC Bank" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Disbursement Date *</label>
            <input v-model="form.disbursementDate" required type="date" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Disbursed (₹) *</label>
            <input v-model.number="form.amount" required type="number" min="1" placeholder="e.g. 5000000" class="w-full bg-blue-50/50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-700 rounded-xl px-3.5 py-2 text-sm text-blue-950 dark:text-blue-200 font-bold focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Disbursement Type</label>
            <select v-model="form.disbursementType" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500">
              <option value="partial">Partial / Tranche</option>
              <option value="full">Full Final Disbursement</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Reference / UTR No.</label>
            <input v-model="form.referenceNumber" type="text" placeholder="e.g. UTR-HDFC-99881122" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 font-mono" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Beneficiary Account / Name</label>
            <input v-model="form.beneficiary" type="text" placeholder="e.g. Godrej Properties Escrow" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Remarks / Milestone Linked</label>
          <textarea v-model="form.remarks" rows="2" placeholder="e.g. Milestone 1 released on foundation completion..." class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"></textarea>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-default flex items-center justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-2">
            <PhCircleNotch v-if="loading" class="animate-spin" :size="16" />
            Save Disbursement
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { PhMoney, PhX, PhCircleNotch } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: Boolean,
  loanCase: Object,
  loading: Boolean,
});

const emit = defineEmits(['close', 'submit']);

const form = reactive({
  bankName: '',
  disbursementDate: new Date().toISOString().slice(0, 10),
  amount: null,
  disbursementType: 'partial',
  referenceNumber: '',
  beneficiary: '',
  remarks: '',
});

watch(
  () => props.loanCase,
  (val) => {
    if (val) {
      form.bankName = val.sanctionDetails?.bankName || val.preferredBank || '';
      const remaining = Math.max(0, (val.sanctionedAmount || val.requiredAmount || 0) - (val.disbursedAmount || 0));
      form.amount = remaining > 0 ? remaining : null;
      form.disbursementType = remaining > 0 ? 'full' : 'partial';
      form.beneficiary = val.propertyId?.builderName || '';
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>
