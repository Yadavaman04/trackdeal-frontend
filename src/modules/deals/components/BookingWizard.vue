<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div class="bg-surface border border-default w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in text-xs">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-default flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
        <div>
          <h3 class="font-heading font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <span>📋</span> <span>Booking Confirmation Stepper Wizard</span>
          </h3>
          <p class="text-[10px] text-slate-450 mt-0.5">Verify deal criteria before confirming to database.</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-650 text-sm">✕</button>
      </div>

      <!-- Stepper Progress Ribbon -->
      <div class="px-6 py-3 bg-slate-55/30 dark:bg-slate-900/50 border-b border-default flex justify-between text-[10px] font-bold uppercase shrink-0">
        <div 
          v-for="step in steps" 
          :key="step.num"
          class="flex items-center space-x-1.5"
          :class="activeStep === step.num ? 'text-primary' : activeStep > step.num ? 'text-emerald-500' : 'text-slate-400'"
        >
          <span class="w-4 h-4 rounded-full border flex items-center justify-center text-[9px] shrink-0" :class="activeStep === step.num ? 'border-primary' : activeStep > step.num ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'">
            {{ activeStep > step.num ? '✓' : step.num }}
          </span>
          <span>{{ step.label }}</span>
        </div>
      </div>

      <!-- Scrollable Wizard Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Step 1: Reservation Verification -->
        <div v-if="activeStep === 1" class="space-y-4">
          <div class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-xl p-4 space-y-3">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Verify Sourced Inventory Details</h4>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Project Name</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ deal.project?.name || 'Skyway Prestige Residency' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Unit Number</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ deal.unit?.unitNumber || '802' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Base Contract price</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ formatCurrency(deal.dealValue || 7200000) }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Closing Specialist</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">Agent Priya Sharma</span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <input type="checkbox" v-model="stepChecks.resApproved" id="resApproved" />
            <label for="resApproved" class="font-semibold text-slate-700 select-none">I verify that the project configuration and sales price match target values.</label>
          </div>
        </div>

        <!-- Step 2: Customer Verification (Co-Applicants & Splits) -->
        <div v-if="activeStep === 2" class="space-y-4">
          <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-default">
            Buyer Details & Ownership Shares Split
          </h4>

          <!-- Splits Config -->
          <div class="grid grid-cols-3 gap-3 bg-slate-50/50 p-3 rounded-lg border border-default">
            <div>
              <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Primary Buyer Split (%)</label>
              <input type="number" v-model.number="splits.primary" class="w-full bg-surface border border-default rounded px-2 py-1" />
            </div>
            <div>
              <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Co-Applicant split (%)</label>
              <input type="number" v-model.number="splits.coApp" class="w-full bg-surface border border-default rounded px-2 py-1" />
            </div>
            <div>
              <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Joint Buyer split (%)</label>
              <input type="number" v-model.number="splits.joint" class="w-full bg-surface border border-default rounded px-2 py-1" />
            </div>
          </div>
          
          <div class="flex justify-between items-center text-[10px] font-bold" :class="isSplitSumCorrect ? 'text-emerald-500' : 'text-red-500'">
            <span>Calculated Total Split sum:</span>
            <span>{{ splitSum }}% (Must be 100%)</span>
          </div>

          <!-- Document checklist -->
          <div class="space-y-2 pt-2">
            <h5 class="font-bold text-slate-700">Buyer KYC documents checks</h5>
            <div class="border border-default rounded-xl divide-y divide-default bg-surface">
              <div class="p-3 flex justify-between items-center">
                <span>Primary Buyer PAN Card Verification</span>
                <span class="text-emerald-500 font-bold">✓ Verified</span>
              </div>
              <div class="p-3 flex justify-between items-center">
                <span>Co-Applicant Aadhaar Card Verification</span>
                <div class="flex items-center space-x-2">
                  <span class="text-amber-500 font-bold">⚠️ Pending</span>
                  <button @click="verifyDocSim" class="bg-primary text-white text-[9px] px-2 py-0.5 rounded">Verify now</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Payment Verification -->
        <div v-if="activeStep === 3" class="space-y-4">
          <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">earnest token deposit compliance</h4>
          
          <div class="bg-indigo-50/50 border border-indigo-250 p-4 rounded-xl space-y-2">
            <p class="font-semibold text-indigo-700">Builder Booking Deposit Target: ₹5,00,000</p>
            <div class="text-[10px] text-slate-500 space-y-1 pt-1">
              <p>✔ Earnest Token Receipt: #TX-9842 (₹1,00,000) - <b class="text-emerald-500">CLEARED</b></p>
              <p>✔ Additional Deposit Draft: #TX-10928 (₹4,00,000) - <b class="text-emerald-500">CLEARED</b></p>
            </div>
            <p class="font-bold text-emerald-600 pt-1">✓ Deposit Threshold Met (Total: ₹5,00,000)</p>
          </div>

          <div class="border border-default rounded-xl p-4 bg-surface space-y-2">
            <label class="block text-[10px] font-bold text-slate-500 uppercase">Attach Deposit Voucher Receipt</label>
            <div class="border-2 border-dashed border-default rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50">
              <span class="text-lg">📤</span>
              <p class="text-[10px] text-slate-400 mt-1">Drag & Drop deposit voucher scanned copy (PDF/JPG)...</p>
            </div>
          </div>
        </div>

        <!-- Step 4: Builder Confirmation -->
        <div v-if="activeStep === 4" class="space-y-4">
          <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Developer Allotment Approval</h4>
          
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Developer Booking Confirmation Number *</label>
              <input 
                v-model="builderRef" 
                type="text" 
                placeholder="e.g. SKY-CONF-9842" 
                class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
                required
              />
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date of Allotment Letter Issue *</label>
                <input 
                  v-model="allotmentDate" 
                  type="date" 
                  class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Scanned Builder Sign-Off *</label>
                <input type="file" class="w-full bg-surface border border-default rounded px-2 py-1 outline-none text-[11px]" required />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-default flex justify-between shrink-0">
        <button 
          @click="prevStep" 
          :disabled="activeStep === 1"
          class="px-4 py-2 border border-default rounded hover:bg-slate-100 font-semibold disabled:opacity-50"
        >
          Back
        </button>
        
        <button 
          @click="nextStep"
          :disabled="isNextDisabled"
          class="px-4 py-2 bg-primary text-white rounded font-bold hover:bg-opacity-95 disabled:bg-slate-300"
        >
          {{ activeStep === 4 ? 'Confirm & Close' : 'Next Step' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useTransitionStageMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  deal: { type: Object, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const activeStep = ref(1);
const builderRef = ref('');
const allotmentDate = ref('');

const splits = ref({
  primary: 50,
  coApp: 30,
  joint: 20
});

const stepChecks = ref({
  resApproved: false,
  kycChecked: false
});

const steps = [
  { num: 1, label: 'Reservation' },
  { num: 2, label: 'Customer KYC' },
  { num: 3, label: 'Payment checks' },
  { num: 4, label: 'Allotment' }
];

const splitSum = computed(() => {
  return splits.value.primary + splits.value.coApp + splits.value.joint;
});

const isSplitSumCorrect = computed(() => splitSum.value === 100);

const isNextDisabled = computed(() => {
  if (activeStep.value === 1) return !stepChecks.value.resApproved;
  if (activeStep.value === 2) return !isSplitSumCorrect.value || !stepChecks.value.kycChecked;
  if (activeStep.value === 4) return !builderRef.value || !allotmentDate.value;
  return false;
});

const prevStep = () => {
  if (activeStep.value > 1) activeStep.value--;
};

const verifyDocSim = () => {
  stepChecks.value.kycChecked = true;
  store.dispatch('notifications/triggerToast', {
    message: 'Co-applicant Aadhaar verification checklist item approved.',
    type: 'success'
  });
};

const { mutateAsync: transitionStage } = useTransitionStageMutation();

const nextStep = async () => {
  if (activeStep.value < 4) {
    activeStep.value++;
  } else {
    // Submit wizard
    try {
      await transitionStage({
        id: props.deal._id || props.deal.id,
        stage: 'booking_confirmed',
        notes: `Wizard Approved: Reference ${builderRef.value}. Allotment Date ${allotmentDate.value}`
      });

      store.dispatch('notifications/triggerToast', {
        message: 'Booking details successfully verified. Deal stage transitioned.',
        type: 'success'
      });

      emit('success');
      emit('close');
    } catch (error) {
      store.dispatch('notifications/triggerToast', {
        message: error.response?.data?.message || 'Failed to complete booking validation.',
        type: 'error'
      });
    }
  }
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>
