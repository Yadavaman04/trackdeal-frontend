<template>
  <AppModal
    :is-open="isOpen"
    title="Record commission payment"
    :subtitle="subtitle"
    max-size="620px"
    @cancel="$emit('close')"
  >
    <form id="record-commission-payment" class="space-y-5" @submit.prevent="submit">
      <div class="financial-payment-summary">
        <div>
          <span>Outstanding</span>
          <strong>{{ formatCurrency(record?.outstanding) }}</strong>
        </div>
        <div class="text-right">
          <span>Expected commission</span>
          <strong>{{ formatCurrency(record?.expected) }}</strong>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label class="financial-field">
          <span>Payment date</span>
          <input v-model="form.paymentDate" type="date" required />
        </label>
        <label class="financial-field">
          <span>Amount received</span>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style="color: hsl(var(--neutral-400));">₹</span>
            <input v-model.number="form.amount" class="!pl-7 font-semibold" type="number" min="1" :max="record?.outstanding" required />
          </div>
        </label>
        <label class="financial-field">
          <span>Payment method</span>
          <select v-model="form.paymentMethod">
            <option>Bank Transfer</option>
            <option>Cheque</option>
            <option>UPI</option>
            <option>Cash</option>
            <option>Other</option>
          </select>
        </label>
        <label class="financial-field">
          <span>Transaction reference / UTR</span>
          <input v-model.trim="form.referenceNumber" type="text" placeholder="Enter bank or transaction reference" required />
        </label>
        <label class="financial-field">
          <span>Received from</span>
          <input v-model.trim="form.receivedFrom" type="text" placeholder="Paying party or account team" />
        </label>
        <label class="financial-field">
          <span>Deposited account</span>
          <input v-model.trim="form.bankAccount" type="text" placeholder="Bank account reference" />
        </label>
      </div>

      <div class="financial-tax-row">
        <label class="financial-tax-toggle">
          <input v-model="form.tdsDeducted" class="app-checkbox" type="checkbox" />
          <span>
            <strong>TDS was deducted</strong>
            <small>Include the tax deducted at source for reconciliation.</small>
          </span>
        </label>
        <label v-if="form.tdsDeducted" class="financial-field">
          <span>TDS amount</span>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style="color: hsl(var(--neutral-400));">₹</span>
            <input v-model.number="form.tdsAmount" class="!pl-7 font-semibold" type="number" min="0" />
          </div>
        </label>
      </div>

      <label class="financial-field">
        <span>Notes</span>
        <textarea v-model.trim="form.notes" rows="3" placeholder="Add payment context or reconciliation notes"></textarea>
      </label>
    </form>

    <template #footer>
      <button type="button" class="btn-md btn-secondary" @click="$emit('close')">Cancel</button>
      <button type="submit" form="record-commission-payment" class="btn-md btn-primary" :disabled="saving">
        <AppIcon name="payment" :size="15" />
        {{ saving ? 'Recording payment…' : 'Record payment' }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import AppModal from '@/components/AppModal.vue';
import { formatCurrency } from '../utils/financialFormat';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  record: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'submit']);
const subtitle = computed(() => [props.record?.commissionNumber, props.record?.partyName].filter(Boolean).join(' · '));
const form = reactive({
  paymentDate: '',
  amount: 0,
  paymentMethod: 'Bank Transfer',
  referenceNumber: '',
  receivedFrom: '',
  bankAccount: '',
  tdsDeducted: false,
  tdsAmount: 0,
  notes: '',
});

watch(() => [props.isOpen, props.record], () => {
  if (!props.isOpen) return;
  Object.assign(form, {
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: Number(props.record?.outstanding) || 0,
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    receivedFrom: props.record?.partyName || '',
    bankAccount: '',
    tdsDeducted: false,
    tdsAmount: 0,
    notes: '',
  });
}, { immediate: true });

const submit = () => emit('submit', { ...form });
</script>
