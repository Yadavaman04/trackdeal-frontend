<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
    <div class="bg-surface border border-default w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-default flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhBank :size="20" class="text-primary-600" weight="duotone" />
            Submit Bank / DSA Application
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">Log bank submission details and assign RM</p>
        </div>
        <button @click="$emit('close')" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <PhX :size="18" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name *</label>
            <input v-model="form.bankName" required type="text" placeholder="e.g. HDFC Bank, SBI, ICICI" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Branch</label>
            <input v-model="form.bankBranch" type="text" placeholder="e.g. Baner, Pune" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Applied Amount (₹) *</label>
            <input v-model.number="form.appliedAmount" required type="number" min="1" placeholder="e.g. 9500000" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 font-semibold" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Application / LOS No.</label>
            <input v-model="form.applicationNumber" type="text" placeholder="e.g. HDFC-2026-9988" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 font-mono" />
          </div>
        </div>

        <!-- DSA Association -->
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-default space-y-3">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <PhUser :size="14" class="text-primary-600" />
            DSA / Channel Partner Sourced (Optional)
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">DSA Contact / Agent</label>
              <input v-model="form.dsaName" type="text" placeholder="e.g. Amit Kulkarni" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">DSA Firm / Agency</label>
              <input v-model="form.dsaCompany" type="text" placeholder="e.g. ABC Capital" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>

        <!-- Bank RM Details -->
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-default space-y-3">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <PhIdentificationBadge :size="14" class="text-primary-600" />
            Bank Relationship Manager (RM)
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">RM Name</label>
              <input v-model="form.bankRmName" type="text" placeholder="e.g. Praveen Patil" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">RM Mobile Phone</label>
              <input v-model="form.bankRmPhone" type="text" placeholder="e.g. 9876500001" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status / Remarks</label>
          <textarea v-model="form.statusRemarks" rows="2" placeholder="e.g. File logged in, credit appraisal underway..." class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"></textarea>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-default flex items-center justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-2">
            <PhCircleNotch v-if="loading" class="animate-spin" :size="16" />
            Submit Application
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { PhBank, PhX, PhUser, PhIdentificationBadge, PhCircleNotch } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: Boolean,
  loanCase: Object,
  loading: Boolean,
});

const emit = defineEmits(['close', 'submit']);

const form = reactive({
  bankName: '',
  bankBranch: '',
  appliedAmount: null,
  applicationNumber: '',
  dsaName: '',
  dsaCompany: '',
  bankRmName: '',
  bankRmPhone: '',
  statusRemarks: '',
});

watch(
  () => props.loanCase,
  (val) => {
    if (val) {
      form.bankName = val.preferredBank || '';
      form.appliedAmount = val.requiredAmount || 0;
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>
