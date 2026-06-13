<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Convert Lead to Won" 
    width="480px"
    @close="$emit('close')"
  >
    <div class="space-y-4 text-xs">
      <div class="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl p-3 text-green-800 dark:text-green-400">
        <h4 class="font-heading font-bold text-sm mb-1">🎉 Win Conversion Summary</h4>
        <p class="text-[11px] leading-relaxed">
          You are converting <b>{{ lead.firstName }} {{ lead.lastName || '' }}</b> to a won status. This confirms client acquisition and locks the lead details.
        </p>
      </div>

      <!-- Optional agreed conversion pricing fields (for local logging / display) -->
      <div class="space-y-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agreed Transaction Price (INR)</label>
          <input 
            v-model.number="agreedPrice" 
            type="number" 
            placeholder="e.g. 15000000"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Conversion Closure Notes</label>
          <textarea 
            v-model="conversionNotes" 
            rows="3"
            placeholder="Provide any transaction details, booking references, or terms..."
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Warning info block -->
      <div class="bg-slate-50 dark:bg-slate-900 border border-default rounded-xl p-3 text-slate-500">
        <p class="text-[10px] leading-normal">
          ⚠️ <b>Note:</b> Once converted, the lead profile becomes read-only for agents. Further transactions (booking form uploads, payment invoices, and commissions) will be managed under the Deals and Customers modules.
        </p>
      </div>
    </div>

    <template #footer>
      <button 
        @click="$emit('close')" 
        class="px-4 py-2 border border-default rounded-lg hover:bg-slate-50 font-semibold"
      >
        Cancel
      </button>
      <button 
        @click="onConvert"
        :disabled="isPending"
        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:bg-slate-350 font-semibold flex items-center justify-center min-w-[100px]"
      >
        <span v-if="isPending">Converting...</span>
        <span v-else>Confirm Win 🎉</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import AppDrawer from '@/components/AppDrawer.vue';
import { useMarkLeadWonMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  lead: { type: Object, required: true }
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const agreedPrice = ref(null);
const conversionNotes = ref('');

const { mutateAsync: markWon, isPending } = useMarkLeadWonMutation();

const onConvert = async () => {
  try {
    const leadId = props.lead._id || props.lead.id;
    await markWon(leadId);
    
    store.dispatch('notifications/triggerToast', {
      message: `${props.lead.firstName} successfully converted to Won.`,
      type: 'success'
    });
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Lead conversion failed.',
      type: 'error'
    });
  }
};
</script>
