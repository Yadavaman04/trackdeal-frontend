<template>
  <AppDrawer 
    :isOpen="isOpen" 
    :title="`Conflict Queue Center — Unit ${unitCode}`" 
    width="480px"
    @close="$emit('close')"
  >
    <div class="space-y-5 text-xs">
      <!-- Active Reservation Priority 1 -->
      <div class="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-250 p-4 rounded-xl space-y-3 shadow-xs">
        <div class="flex items-center justify-between border-b border-amber-200 dark:border-amber-900 pb-2">
          <h4 class="font-heading font-bold text-xs text-amber-800 dark:text-amber-450 uppercase tracking-wider">
            Active Priority 1 Hold
          </h4>
          <span class="text-[8px] font-bold text-amber-600">Countdown Active</span>
        </div>

        <div v-if="activeHold" class="space-y-1.5 text-[11px]">
          <div class="font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <PhUser :size="12" class="text-slate-400" />
              <span>Lead Client: {{ activeHold.leadName }}</span>
            </span>
            <span class="text-[9px] font-bold text-slate-500 font-mono">Verified Token: {{ formatCurrency(activeHold.tokenPaid || 100000) }}</span>
          </div>
          <p class="text-slate-550 flex justify-between">
            <span>Agent Owner: {{ activeHold.agentName }}</span>
            <span class="text-red-500 font-bold">Expires in 2 hours</span>
          </p>
          
          <div class="pt-2 flex justify-end">
            <button 
              @click="$emit('forceRelease', activeHold)"
              class="btn-sm btn-danger-outline text-[9px]"
            >
              <PhLightning :size="10" />
              <span>Force Release Hold</span>
            </button>
          </div>
        </div>
        <p v-else class="text-slate-400 italic">No active reservation lock.</p>
      </div>

      <!-- Waitlist queue list -->
      <div class="space-y-3">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-default pb-2">
          Waitlist Queue Roll Pipeline
        </h4>

        <div v-if="waitlistQueue.length > 0" class="space-y-2.5">
          <div 
            v-for="(item, idx) in waitlistQueue" 
            :key="item.id || item._id"
            class="bg-surface border border-default rounded-xl p-3.5 space-y-2.5 flex flex-col hover:border-slate-350 dark:hover:border-slate-750"
          >
            <div class="flex items-start justify-between">
              <div>
                <span class="font-bold text-slate-700 dark:text-slate-200">
                  Position {{ idx + 1 }}: {{ item.leadName }}
                </span>
                <span class="text-[9px] text-slate-400 block mt-0.5">
                  Assigned Agent: {{ item.agentName }}
                </span>
              </div>
              <span 
                class="px-2 py-0.5 rounded text-[8px] font-bold uppercase shrink-0"
                :class="item.tokenPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'"
              >
                {{ item.tokenPaid ? 'Token Paid' : 'Pending Verification' }}
              </span>
            </div>

            <!-- Queue Priority Actions -->
            <div class="flex justify-between items-center border-t border-dashed border-default pt-2 text-[9px] font-bold uppercase tracking-wider text-slate-550">
              <span v-if="item.tokenPaid" class="text-emerald-500 flex items-center gap-1">
                <PhCheck :size="10" />
                <span>Rollable hold pre-authorized</span>
              </span>
              <span v-else class="text-amber-500 flex items-center gap-1">
                <PhWarning :size="10" />
                <span>Requires payment validation (12h roll)</span>
              </span>
              
              <div class="flex space-x-1.5">
                <button 
                  v-if="idx > 0"
                  @click="moveUp(idx)"
                  class="btn-sm btn-secondary h-6 px-2 text-[9px]"
                >
                  Move Up
                </button>
                <button 
                  v-if="idx > 0"
                  @click="moveToTop(idx)"
                  class="btn-sm btn-secondary h-6 px-2 text-[9px]"
                >
                  Top
                </button>
                <button 
                  @click="removeQueue(idx)"
                  class="btn-sm btn-danger-outline h-6 px-2 text-[9px]"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <p v-else class="text-center py-6 text-slate-400 italic">
          No waitlisted leads are queued.
        </p>

        <!-- Add lead to waitlist placeholder button -->
        <div class="pt-2">
          <button 
            @click="showAddLeadInput = !showAddLeadInput"
            class="w-full flex items-center justify-center space-x-1 border border-dashed border-default p-2 rounded-lg text-slate-650 dark:text-slate-450 hover:bg-slate-50 hover:text-slate-800 font-bold"
          >
            <span>+</span> <span>Queue Lead to Waitlist</span>
          </button>
          
          <!-- Add lead input selectors -->
          <div v-if="showAddLeadInput" class="mt-3 border border-default rounded-xl p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900">
            <div>
              <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Select Lead Prospect</label>
              <select v-model="selectedAddLeadId" class="w-full bg-surface border border-default rounded px-2.5 py-1 text-xs">
                <option value="">Choose Lead</option>
                <option v-for="lead in leadsList" :key="lead._id || lead.id" :value="lead._id || lead.id">
                  {{ lead.firstName }} {{ lead.lastName || '' }} ({{ lead.mobile }})
                </option>
              </select>
            </div>
            
            <div class="flex items-center space-x-2">
              <label class="flex items-center space-x-1">
                <input type="checkbox" v-model="addLeadTokenPaid" />
                <span class="text-[10px] font-semibold text-slate-700">Pre-authorized waitlist token paid</span>
              </label>
            </div>

            <div class="flex justify-end space-x-1.5 pt-1">
              <button @click="showAddLeadInput = false" class="btn-sm btn-secondary text-[10px]">Cancel</button>
              <button @click="handleAddWaitlist" class="btn-sm btn-primary text-[10px]">Queue</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppDrawer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api/client';
import AppDrawer from '@/components/AppDrawer.vue';

// Phosphor icons
import { PhUser, PhLightning, PhCheck, PhWarning } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  unitCode: { type: String, default: '802' },
  activeHold: { type: Object, default: null },
  waitlist: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'forceRelease', 'updateQueue']);
const store = useStore();

const waitlistQueue = ref([...props.waitlist]);
const showAddLeadInput = ref(false);
const selectedAddLeadId = ref('');
const addLeadTokenPaid = ref(false);
const leadsList = ref([]);

const loadLeadsList = async () => {
  try {
    const res = await apiClient.get('/leads');
    leadsList.value = res.data?.data || [];
  } catch (err) {
    console.error('Failed to load leads list for waitlist dropdown:', err);
  }
};

onMounted(() => {
  loadLeadsList();
  waitlistQueue.value = [...props.waitlist];
});

const moveUp = (idx) => {
  if (idx <= 0) return;
  const temp = waitlistQueue.value[idx];
  waitlistQueue.value[idx] = waitlistQueue.value[idx - 1];
  waitlistQueue.value[idx - 1] = temp;
  emit('updateQueue', waitlistQueue.value);
};

const moveToTop = (idx) => {
  if (idx <= 0) return;
  const item = waitlistQueue.value.splice(idx, 1)[0];
  waitlistQueue.value.unshift(item);
  emit('updateQueue', waitlistQueue.value);
};

const removeQueue = (idx) => {
  waitlistQueue.value.splice(idx, 1);
  emit('updateQueue', waitlistQueue.value);
  store.dispatch('notifications/triggerToast', {
    message: 'Lead removed from waitlist queue successfully.',
    type: 'success'
  });
};

const handleAddWaitlist = () => {
  const chosenLead = leadsList.value.find(l => (l._id || l.id) === selectedAddLeadId.value);
  if (!chosenLead) return;

  const newItem = {
    id: chosenLead._id || chosenLead.id,
    leadName: `${chosenLead.firstName} ${chosenLead.lastName || ''}`.trim(),
    agentName: chosenLead.assignedTo?.firstName ? `${chosenLead.assignedTo.firstName} ${chosenLead.assignedTo.lastName || ''}` : 'Independent Agent',
    tokenPaid: addLeadTokenPaid.value
  };

  waitlistQueue.value.push(newItem);
  emit('updateQueue', waitlistQueue.value);

  showAddLeadInput.value = false;
  selectedAddLeadId.value = '';
  addLeadTokenPaid.value = false;

  store.dispatch('notifications/triggerToast', {
    message: 'Lead queued into waitlist pipeline.',
    type: 'success'
  });
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
