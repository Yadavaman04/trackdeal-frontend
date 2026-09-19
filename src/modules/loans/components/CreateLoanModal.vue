<template>
  <Teleport to="body">
    <Transition name="drawer-slide">
      <div v-if="isOpen" class="fixed inset-0 z-[1000] flex justify-end overflow-hidden" style="background-color: rgba(9, 14, 26, 0.6); backdrop-filter: blur(3px);" @click.self="$emit('close')">
        <div class="bg-surface border-l border-default w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden text-xs">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-default flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PhHandCoins :size="22" class="text-primary-600" weight="duotone" />
                Create Loan Case
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Initialize a customer home/property loan file</p>
            </div>
            <button @click="$emit('close')" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <PhX :size="18" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4 flex-1 overflow-y-auto">
        <!-- Customer Selector -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer *</label>
          <select v-model="form.customerId" required class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 font-medium">
            <option value="" disabled>Select a customer...</option>
            <option v-for="c in customers" :key="c._id" :value="c._id">
              {{ c.firstName }} {{ c.lastName }} ({{ c.mobile }})
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Loan Type *</label>
            <select v-model="form.loanType" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500">
              <option value="home_loan">Home Loan</option>
              <option value="lap">Loan Against Property (LAP)</option>
              <option value="commercial_property_loan">Commercial Property Loan</option>
              <option value="plot_loan">Plot / Land Loan</option>
              <option value="balance_transfer">Balance Transfer + Top-up</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Loan Amount (₹) *</label>
            <input v-model.number="form.requiredAmount" required type="number" min="1" placeholder="e.g. 10000000" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 font-bold" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Employment Type</label>
            <select v-model="form.employmentType" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500">
              <option value="salaried">Salaried (Corporate / Govt)</option>
              <option value="self_employed_business">Self-Employed (Business)</option>
              <option value="self_employed_professional">Self-Employed (Doctor/CA/Lawyer)</option>
              <option value="nri">NRI</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Income (₹)</label>
            <input v-model.number="form.monthlyIncome" type="number" placeholder="e.g. 200000" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Bank</label>
            <input v-model="form.preferredBank" type="text" placeholder="e.g. HDFC Bank, SBI" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CIBIL Score / Range</label>
            <input v-model="form.cibilScore" type="text" placeholder="e.g. 780" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 font-mono" />
          </div>
        </div>

        <!-- Commission Terms Preview -->
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-default space-y-2">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Standard Loan Commission Terms</div>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label class="text-slate-500 block mb-1">Commission Rate (%)</label>
              <input v-model.number="form.commissionRate" type="number" step="0.1" class="w-full bg-surface border border-default rounded-lg px-2.5 py-1 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="text-slate-500 block mb-1">Estimated Payout</label>
              <div class="px-2.5 py-1 text-emerald-600 font-bold">
                ₹{{ Math.round(((form.requiredAmount || 0) * (form.commissionRate || 0.5)) / 100).toLocaleString('en-IN') }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Special Requirements</label>
          <textarea v-model="form.notes" rows="2" placeholder="e.g. Needs fast approval within 7 days..." class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"></textarea>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-default flex items-center justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" :disabled="loading || !form.customerId || !form.requiredAmount" class="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-2">
            <PhCircleNotch v-if="loading" class="animate-spin" :size="16" />
            Create Loan Case
          </button>
        </div>
      </form>
    </div>
  </div>
</Transition>
</Teleport>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { PhHandCoins, PhX, PhCircleNotch } from '@phosphor-icons/vue';
import apiClient from '@/api/client';

const props = defineProps({
  isOpen: Boolean,
  loading: Boolean,
});

const emit = defineEmits(['close', 'submit']);

const customers = ref([]);

const form = reactive({
  customerId: '',
  loanType: 'home_loan',
  requiredAmount: null,
  employmentType: 'salaried',
  monthlyIncome: null,
  preferredBank: '',
  cibilScore: '',
  commissionRate: 0.5,
  notes: '',
});

onMounted(async () => {
  try {
    const res = await apiClient.get('/customers?limit=100');
    customers.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error('Error fetching customers:', err);
  }
});

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>

<style scoped>
.drawer-slide-enter-active { transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-slide-leave-active { transition: transform 180ms cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }
</style>
