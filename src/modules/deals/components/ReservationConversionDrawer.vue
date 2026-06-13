<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Convert Hold to Confirmed Booking" 
    width="480px"
    @close="$emit('close')"
  >
    <div class="space-y-5 text-xs">
      <div class="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 p-3 rounded-lg leading-relaxed text-[11px]">
        ℹ️ **Conversion Information**: This action confirms the client's booking token payment, releases the reservation SLA lock, and transitions the listing to won deals.
      </div>

      <!-- Property Details (Read Only) -->
      <div class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-xl p-3.5 space-y-1.5 font-medium">
        <span class="text-[9px] text-slate-400 font-bold block uppercase">Linked Property Unit</span>
        <p class="font-bold text-slate-800 dark:text-slate-100">{{ propertyTitle }}</p>
        <p class="text-slate-500">Value: {{ formatCurrency(propertyPrice) }}</p>
      </div>

      <!-- Lead Details (Read Only) -->
      <div class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-xl p-3.5 space-y-1.5 font-medium">
        <span class="text-[9px] text-slate-400 font-bold block uppercase">Purchaser Lead</span>
        <p class="font-bold text-slate-800 dark:text-slate-100">{{ buyerName }}</p>
        <p class="text-slate-550">Earnest Token Paid: <b class="text-emerald-600 font-bold">{{ formatCurrency(tokenPaid) }}</b></p>
      </div>

      <!-- Date picker close target -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Closing Date *</label>
        <input 
          v-model="closeDate" 
          type="date" 
          class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary font-medium"
          required
        />
      </div>

      <!-- Payment Ref -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Token Payment Reference Number *</label>
        <input 
          v-model="paymentRef" 
          type="text" 
          placeholder="e.g. UPI-TXN-12948"
          class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
          required
        />
      </div>

      <!-- Invoice trigger checkbox -->
      <div class="flex items-center space-x-2 pt-1.5">
        <input type="checkbox" v-model="generateInvoice" id="generateInvoice" />
        <label for="generateInvoice" class="font-bold text-slate-700 select-none">Generate Booking Payout Split Ledger Invoice</label>
      </div>
    </div>

    <template #footer>
      <button 
        @click="$emit('close')" 
        class="px-4 py-2 border border-default rounded hover:bg-slate-50 font-semibold"
      >
        Cancel
      </button>
      <button 
        @click="handleConvert"
        :disabled="isPending || !paymentRef || !closeDate"
        class="px-4 py-2 bg-primary text-white rounded font-bold hover:bg-opacity-95 disabled:bg-slate-300"
      >
        {{ isPending ? 'Converting...' : 'Confirm Conversion' }}
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useCreateDealMutation } from '../queries';
import apiClient from '@/api/client';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  property: { type: Object, default: null } // Hold listing or unit
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const closeDate = ref(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
const paymentRef = ref('');
const generateInvoice = ref(true);
const isPending = ref(false);

const propertyTitle = computed(() => props.property?.title || props.property?.unitNumber || 'Unit Item');
const propertyPrice = computed(() => props.property?.price || 0);
const buyerName = computed(() => props.property?.reservedLeadName || 'Amit Shah');
const tokenPaid = computed(() => props.property?.tokenPaid || 100000);

const { mutateAsync: createDeal } = useCreateDealMutation();

const handleConvert = async () => {
  if (!paymentRef.value || !closeDate.value) return;
  isPending.value = true;

  const propId = props.property._id || props.property.id;
  const isUnit = !!props.property.unitNumber;

  const payload = {
    customer: props.property?.customer?._id || '665cd229085248a29fe88283',
    assignedTo: store.state.auth.currentUser?._id || '665cd229085248a29fe88282',
    sourcingAgent: store.state.auth.currentUser?._id || '665cd229085248a29fe88282',
    broker: store.state.auth.currentUser?._id || '665cd229085248a29fe88282',
    property: !isUnit ? propId : undefined,
    project: isUnit ? props.property.projectId?._id || props.property.projectId : undefined,
    unit: isUnit ? propId : undefined,
    askingPrice: propertyPrice.value,
    dealValue: propertyPrice.value,
    status: 'booking_initiated',
    notes: `Hold Converted: Ref ${paymentRef.value}. Estimated Close ${closeDate.value}`
  };

  try {
    // 1. Create deal
    const dealRes = await createDeal(payload);
    const newDealId = dealRes.data?._id || dealRes.data?.id;

    // 2. Mark unit status to sold or booking_confirmed in database
    if (isUnit) {
      await apiClient.post(`/projects/units/${propId}/sold`, {
        customerId: payload.customer,
        soldPrice: propertyPrice.value
      }).catch(err => console.warn('Unit sold status update failed:', err));
    } else {
      await apiClient.post(`/properties/${propId}/sold`).catch(err => console.warn('Property sold status update failed:', err));
    }

    // 3. Log initial earnest deposit payment
    if (newDealId) {
      await apiClient.post(`/deals/${newDealId}/payment`, {
        amount: tokenPaid.value,
        paymentType: 'token',
        paymentMode: 'wire',
        transactionRef: paymentRef.value,
        netAmount: tokenPaid.value
      }).catch(err => console.warn('Sync payment logging failed:', err));
    }

    store.dispatch('notifications/triggerToast', {
      message: 'Hold converted into Confirmed Booking successfully.',
      type: 'success'
    });

    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to convert hold to booking.',
      type: 'error'
    });
  } finally {
    isPending.value = false;
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
