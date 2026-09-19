<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Close Lead & Record Transaction" 
    width="640px"
    @close="$emit('close')"
  >
    <div class="space-y-4 text-xs">
      <!-- Notice Header -->
      <div class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-900 dark:text-amber-300">
        <h4 class="font-heading font-bold text-xs flex items-center gap-1.5">
          <span class="inline-flex items-center gap-1.5"><AppIcon name="trophy" :size="15" /> Transaction closing workflow</span>
        </h4>
        <p class="text-[11px] mt-0.5 leading-relaxed">
          Please enter the transaction details before closing this lead. Once confirmed, the lead status becomes <b>Won</b>, the purchased property inventory status is updated to <b>Sold</b>, and a transaction audit record is saved.
        </p>
      </div>

      <!-- Tab Navigation -->
      <div class="flex items-center gap-1 border-b border-default pb-1 overflow-x-auto">
        <button 
          v-for="(stepName, index) in steps" 
          :key="index"
          @click="activeStep = index"
          class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap"
          :class="activeStep === index ? 'bg-primary text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          {{ index + 1 }}. {{ stepName }}
        </button>
      </div>

      <!-- STEP 1: PROPERTY PURCHASED -->
      <div v-if="activeStep === 0" class="space-y-4">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-default pb-1">
          Select Purchased Property
        </h4>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Which Property Did the Customer Purchase? *</label>
          <select 
            v-model="selectedPropertyId" 
            @change="onPropertySelect"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2 outline-none focus:border-primary font-medium"
          >
            <option value="">-- Search / Select Property from Master List --</option>
            <option 
              v-for="prop in properties" 
              :key="prop._id || prop.id" 
              :value="prop._id || prop.id"
              :disabled="prop.status === 'sold'"
            >
              {{ prop.title }} — ₹{{ (prop.price / 100000).toFixed(2) }}L ({{ prop.type || 'Property' }}, {{ prop.location?.city || 'Mumbai' }}) {{ prop.status === 'sold' ? '[ SOLD ]' : '' }}
            </option>
          </select>
        </div>

        <div v-if="selectedProperty" class="p-3 bg-surface border border-default rounded-xl space-y-2 text-[11px]">
          <div class="flex justify-between items-center border-b border-default pb-1.5">
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ selectedProperty.title }}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" :class="selectedProperty.status === 'sold' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
              {{ selectedProperty.status }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-slate-500">
            <div><b>Type:</b> {{ selectedProperty.type }}</div>
            <div><b>City:</b> {{ selectedProperty.location?.city || 'Mumbai' }}</div>
            <div><b>BHK / Config:</b> {{ selectedProperty.bhk ? selectedProperty.bhk + ' BHK' : 'N/A' }}</div>
            <div><b>Listing Price:</b> ₹{{ Number(selectedProperty.price || 0).toLocaleString('en-IN') }}</div>
            <div><b>Carpet Area:</b> {{ selectedProperty.area?.carpet || 'N/A' }} sqft</div>
            <div><b>Super Built-Up:</b> {{ selectedProperty.area?.superBuiltUp || 'N/A' }} sqft</div>
          </div>
        </div>
      </div>

      <!-- STEP 2: ACTUAL TRANSACTION VALUE -->
      <div v-if="activeStep === 1" class="space-y-4">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-default pb-1">
          Actual Financial Breakdown
        </h4>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Final Property Sale Price (INR) *</label>
            <input 
              v-model.number="finalSalePrice" 
              type="number" 
              placeholder="e.g. 8500000"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary font-bold text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agreement Value (INR)</label>
            <input 
              v-model.number="agreementValue" 
              type="number" 
              placeholder="e.g. 8000000"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Booking Amount (INR)</label>
            <input 
              v-model.number="bookingAmount" 
              type="number" 
              placeholder="e.g. 500000"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer Own Contribution (OC)</label>
            <input 
              v-model.number="customerOwnContribution" 
              type="number" 
              placeholder="e.g. 2000000"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Actual Loan Amount</label>
            <input 
              v-model.number="actualLoanAmount" 
              type="number" 
              placeholder="e.g. 6000000"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Other Funding Amount</label>
            <input 
              v-model.number="otherFundingAmount" 
              type="number" 
              placeholder="e.g. 500000"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Discount Given (INR)</label>
            <input 
              v-model.number="discountGiven" 
              type="number" 
              placeholder="e.g. 100000"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Additional Charges (INR)</label>
            <input 
              v-model.number="additionalCharges" 
              type="number" 
              placeholder="e.g. 200000"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
        </div>

        <!-- Live Funding Match Validation Alert -->
        <div 
          class="p-2.5 rounded-lg border text-[11px] font-medium flex items-center justify-between"
          :class="isFundingMatched ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300' : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300'"
        >
          <div>
            <span>Sum of Funding (OC + Loan + Other): <b>₹{{ calculatedFundingSum.toLocaleString('en-IN') }}</b></span>
          </div>
          <span v-if="isFundingMatched" class="font-bold inline-flex items-center gap-1"><AppIcon name="check" :size="12" weight="bold" /> Matches sale price</span>
          <span v-else class="text-[10px] text-amber-700 dark:text-amber-400 inline-flex items-center gap-1"><AppIcon name="warning" :size="12" /> Difference of ₹{{ Math.abs(finalSalePrice - calculatedFundingSum).toLocaleString('en-IN') }}</span>
        </div>
      </div>

      <!-- STEP 3: ACTUAL LOAN DETAILS -->
      <div v-if="activeStep === 2" class="space-y-4">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-default pb-1">
          Actual Loan Information
        </h4>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Did the Customer Take a Loan? *</label>
          <div class="flex items-center gap-4 py-1">
            <label class="flex items-center gap-1.5 cursor-pointer font-bold">
              <input type="radio" :value="true" v-model="hasLoan" /> Yes
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer font-bold">
              <input type="radio" :value="false" v-model="hasLoan" /> No
            </label>
          </div>
        </div>

        <div v-if="hasLoan" class="space-y-3 pt-2">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loan Bank / Financial Institution</label>
              <input v-model="loanBank" type="text" placeholder="e.g. HDFC Bank / SBI" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loan Application Number</label>
              <input v-model="loanApplicationNumber" type="text" placeholder="e.g. HDFC-892102" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sanctioned Amount</label>
              <input v-model.number="loanSanctionedAmount" type="number" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sanction Date</label>
              <input v-model="loanSanctionDate" type="date" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Disbursement Amount</label>
              <input v-model.number="loanDisbursementAmount" type="number" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tenure (Years)</label>
              <input v-model.number="loanTenure" type="number" placeholder="20" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Interest Rate (%)</label>
              <input v-model.number="interestRate" type="number" step="0.1" placeholder="8.5" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loan Status</label>
              <select v-model="loanStatus" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
                <option value="Sanctioned">Sanctioned</option>
                <option value="Partially Disbursed">Partially Disbursed</option>
                <option value="Fully Disbursed">Fully Disbursed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loan Officer Name</label>
              <input v-model="loanOfficerName" type="text" placeholder="e.g. Rajesh Sharma" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loan Officer Phone</label>
              <input v-model="loanOfficerPhone" type="text" placeholder="e.g. 9876543210" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 4: OUR COMMISSION -->
      <div v-if="activeStep === 3" class="space-y-4">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-default pb-1">
          Brokerage / Our Commission
        </h4>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Commission Type</label>
            <select v-model="commissionType" @change="recalculateCommission" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Commission %</label>
            <input 
              v-model.number="commissionPercentage" 
              @input="recalculateCommission" 
              type="number" 
              step="0.1" 
              placeholder="2.0"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Commission Amount (₹)</label>
            <input 
              v-model.number="commissionAmount" 
              type="number" 
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary font-bold text-emerald-700 dark:text-emerald-400"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Commission Received?</label>
            <select v-model="commissionStatus" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="no">No (Pending)</option>
              <option value="yes">Yes (Fully Received)</option>
              <option value="partially">Partially Received</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Received Amount (INR)</label>
            <input v-model.number="commissionReceivedAmount" type="number" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Reference</label>
            <input v-model="commissionPaymentReference" type="text" placeholder="e.g. Cheque / NEFT Ref" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
        </div>
      </div>

      <!-- STEP 5: REGISTRATION & SUMMARY -->
      <div v-if="activeStep === 4" class="space-y-4">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-default pb-1">
          Registration & Transaction Summary
        </h4>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Registration Required? *</label>
          <div class="flex items-center gap-4 py-1">
            <label class="flex items-center gap-1.5 cursor-pointer font-bold">
              <input type="radio" :value="true" v-model="registrationRequired" /> Yes
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer font-bold">
              <input type="radio" :value="false" v-model="registrationRequired" /> No / Pending
            </label>
          </div>
        </div>

        <div v-if="registrationRequired" class="grid grid-cols-3 gap-3 pt-1">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Registration Date</label>
            <input v-model="registrationDate" type="date" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Registration Number</label>
            <input v-model="registrationNumber" type="text" placeholder="e.g. REG-9021" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Registration Office</label>
            <input v-model="registrationOffice" type="text" placeholder="e.g. Sub-Registrar Borivali" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
        </div>

        <!-- FINAL CLOSING SUMMARY -->
        <div class="p-3 bg-surface border border-default rounded-xl space-y-2 text-[11px] mt-3">
          <h5 class="font-bold text-slate-800 dark:text-slate-100 border-b border-default pb-1">
            <AppIcon name="clipboard" :size="14" /> Final closing summary
          </h5>
          <div class="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
            <div><b>Customer:</b> {{ lead?.firstName }} {{ lead?.lastName || '' }}</div>
            <div><b>Property:</b> {{ selectedProperty?.title || 'Selected Property' }}</div>
            <div><b>Final Sale Price:</b> ₹{{ Number(finalSalePrice || 0).toLocaleString('en-IN') }}</div>
            <div><b>Own Contribution:</b> ₹{{ Number(customerOwnContribution || 0).toLocaleString('en-IN') }}</div>
            <div><b>Loan Amount:</b> ₹{{ Number(actualLoanAmount || 0).toLocaleString('en-IN') }} ({{ hasLoan ? loanBank || 'Bank' : 'No Loan' }})</div>
            <div><b>Commission Earned:</b> ₹{{ Number(commissionAmount || 0).toLocaleString('en-IN') }} ({{ commissionPercentage }}%)</div>
          </div>
        </div>
      </div>

      <div v-if="submitError" class="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium text-[11px]">
        {{ submitError }}
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <button 
          v-if="activeStep > 0" 
          @click="activeStep--"
          class="px-3 py-1.5 border border-default rounded-lg text-xs font-semibold hover:bg-slate-50"
        >
          ← Back
        </button>
        <div v-else></div>

        <div class="flex items-center gap-2">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2 border border-default rounded-lg hover:bg-slate-50 font-semibold"
          >
            Cancel
          </button>

          <button 
            v-if="activeStep < steps.length - 1"
            @click="activeStep++"
            class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold"
          >
            Next Step →
          </button>

          <button 
            v-else
            @click="onConfirmClose"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:bg-slate-350 font-semibold flex items-center justify-center min-w-[140px]"
          >
            <span v-if="isSubmitting">Processing...</span>
            <span v-else>Confirm & close lead</span>
          </button>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import AppDrawer from '@/components/AppDrawer.vue';
import apiClient from '@/api/client';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  lead: { type: Object, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const steps = ['Property Purchased', 'Transaction Value', 'Loan Details', 'Commission', 'Registration & Summary'];
const activeStep = ref(0);

const properties = ref([]);
const selectedPropertyId = ref('');
const selectedProperty = ref(null);

const finalSalePrice = ref(8500000);
const agreementValue = ref(8000000);
const bookingAmount = ref(500000);
const customerOwnContribution = ref(2500000);
const actualLoanAmount = ref(6000000);
const otherFundingAmount = ref(0);
const discountGiven = ref(0);
const additionalCharges = ref(0);

const hasLoan = ref(true);
const loanBank = ref('');
const loanApplicationNumber = ref('');
const loanSanctionedAmount = ref(6000000);
const loanSanctionDate = ref('');
const loanDisbursementAmount = ref(6000000);
const loanDisbursementDate = ref('');
const loanTenure = ref(20);
const interestRate = ref(8.5);
const loanStatus = ref('Sanctioned');
const loanOfficerName = ref('');
const loanOfficerPhone = ref('');

const commissionType = ref('percentage');
const commissionPercentage = ref(2.0);
const commissionAmount = ref(170000);
const commissionStatus = ref('no');
const commissionReceivedAmount = ref(0);
const commissionPaymentReference = ref('');

const registrationRequired = ref(true);
const registrationDate = ref('');
const registrationNumber = ref('');
const registrationOffice = ref('');

const isSubmitting = ref(false);
const submitError = ref('');

const loadProperties = async () => {
  try {
    const res = await apiClient.get('/properties');
    properties.value = res.data?.data || [];
  } catch (err) {
    console.error('Failed to load property master list:', err);
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadProperties();
    activeStep.value = 0;
    submitError.value = '';
  }
}, { immediate: true });

const onPropertySelect = () => {
  selectedProperty.value = properties.value.find(p => (p._id || p.id) === selectedPropertyId.value) || null;
  if (selectedProperty.value && selectedProperty.value.price) {
    finalSalePrice.value = selectedProperty.value.price;
    recalculateCommission();
  }
};

const calculatedFundingSum = computed(() => {
  return Number(customerOwnContribution.value || 0) + Number(actualLoanAmount.value || 0) + Number(otherFundingAmount.value || 0);
});

const isFundingMatched = computed(() => {
  return calculatedFundingSum.value === Number(finalSalePrice.value || 0);
});

const recalculateCommission = () => {
  if (commissionType.value === 'percentage') {
    commissionAmount.value = Math.round((Number(finalSalePrice.value || 0) * Number(commissionPercentage.value || 0)) / 100);
  }
};

watch(finalSalePrice, recalculateCommission);

const onConfirmClose = async () => {
  submitError.value = '';
  if (!selectedPropertyId.value) {
    activeStep.value = 0;
    submitError.value = 'Please select the property purchased by the customer.';
    return;
  }

  if (!finalSalePrice.value || finalSalePrice.value <= 0) {
    activeStep.value = 1;
    submitError.value = 'Please enter a valid final sale price.';
    return;
  }

  isSubmitting.value = true;

  try {
    const leadId = props.lead._id || props.lead.id;
    const payload = {
      propertyId: selectedPropertyId.value,
      finalSalePrice: finalSalePrice.value,
      agreementValue: agreementValue.value,
      bookingAmount: bookingAmount.value,
      customerOwnContribution: customerOwnContribution.value,
      actualLoanAmount: actualLoanAmount.value,
      otherFundingAmount: otherFundingAmount.value,
      discountGiven: discountGiven.value,
      additionalCharges: additionalCharges.value,
      hasLoan: hasLoan.value,
      loanBank: loanBank.value,
      loanApplicationNumber: loanApplicationNumber.value,
      loanSanctionedAmount: loanSanctionedAmount.value,
      loanSanctionDate: loanSanctionDate.value || undefined,
      loanDisbursementAmount: loanDisbursementAmount.value,
      loanDisbursementDate: loanDisbursementDate.value || undefined,
      loanTenure: loanTenure.value,
      interestRate: interestRate.value,
      loanStatus: loanStatus.value,
      loanOfficerName: loanOfficerName.value,
      loanOfficerPhone: loanOfficerPhone.value,
      commissionType: commissionType.value,
      commissionPercentage: commissionPercentage.value,
      commissionAmount: commissionAmount.value,
      commissionStatus: commissionStatus.value,
      commissionReceivedAmount: commissionReceivedAmount.value,
      commissionPaymentReference: commissionPaymentReference.value,
      registrationRequired: registrationRequired.value,
      registrationDate: registrationDate.value || undefined,
      registrationNumber: registrationNumber.value,
      registrationOffice: registrationOffice.value
    };

    await apiClient.post(`/leads/${leadId}/close-transaction`, payload);

    store.dispatch('notifications/triggerToast', {
      message: `Lead ${props.lead.firstName} successfully closed as Won!`,
      type: 'success'
    });

    emit('success');
    emit('close');
  } catch (err) {
    submitError.value = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to close lead transaction.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
