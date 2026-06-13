<template>
  <div v-if="isLoading" class="animate-pulse space-y-6">
    <div class="h-10 bg-slate-200 dark:bg-slate-850 rounded w-1/4"></div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
      <div class="h-96 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
    </div>
  </div>
  
  <div v-else-if="property" class="space-y-6">
    <!-- Breadcrumbs -->
    <div>
      <router-link to="/app/properties" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
        <PhCaretLeft :size="12" />
        <span>Back to Inventory Directory</span>
      </router-link>
    </div>

    <!-- Header identity Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">
            {{ property.title }}
          </h2>
          <span class="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-450 px-1.5 py-0.5 rounded">
            ID: {{ property._id || property.id }}
          </span>
        </div>
        <p class="text-xs text-slate-550 mt-1">
          {{ property.bhk ? `${property.bhk} BHK` : '' }} {{ property.type }} | Floor {{ property.floors }} of {{ property.totalFloors }} | {{ property.location?.city }}
        </p>
      </div>

      <!-- Interactive Status Dropdown -->
      <div class="flex items-center space-x-2 shrink-0">
        <label class="text-[10px] font-bold text-slate-450 uppercase">Update Status:</label>
        <select 
          v-model="property.status" 
          @change="handleStatusChangeDropdown"
          class="bg-surface border border-default rounded-lg px-3 py-1.5 font-bold uppercase text-[10px] focus:border-primary outline-none"
          :class="getStatusSelectClass(property.status)"
        >
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
          <option value="off_market">Blocked / Off Market</option>
        </select>
      </div>
    </div>

    <!-- Main Workspace Layout grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Tabs Workspace -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Tab Bar -->
        <div class="border-b border-default flex space-x-4 overflow-x-auto text-xs font-bold uppercase tracking-wider text-slate-400">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            class="pb-2 border-b-2 transition-all px-1"
            :class="activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent hover:text-slate-700'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab 1: Overview -->
        <div v-if="activeTab === 'overview'" class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-6">
          <!-- Pricing grid -->
          <div class="space-y-3">
            <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
              Pricing structures (Breakout Matrix)
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div class="bg-slate-50/50 p-2.5 rounded-lg">
                <span class="text-[9px] text-slate-450 uppercase block font-bold">Base Price</span>
                <span class="font-heading font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(property.price) }}</span>
              </div>
              <div class="bg-slate-50/50 p-2.5 rounded-lg">
                <span class="text-[9px] text-slate-450 uppercase block font-bold">PLC Charges</span>
                <span class="font-heading font-bold text-slate-850 dark:text-slate-100">{{ formatCurrency(property.price * 0.05) }}</span>
              </div>
              <div class="bg-slate-50/50 p-2.5 rounded-lg">
                <span class="text-[9px] text-slate-450 uppercase block font-bold">Parking splits</span>
                <span class="font-heading font-bold text-slate-850 dark:text-slate-100">₹2,50,000</span>
              </div>
              <div class="bg-slate-50/50 p-2.5 rounded-lg">
                <span class="text-[9px] text-slate-450 uppercase block font-bold">Approx GST (12%)</span>
                <span class="font-heading font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(property.price * 0.12) }}</span>
              </div>
            </div>
          </div>

          <!-- Specifications grid -->
          <div class="space-y-3 border-t border-dashed border-default pt-4">
            <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
              Technical Specifications
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span class="text-[8px] text-slate-400 block uppercase font-bold">Carpet Area</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ property.area?.carpet || 1200 }} sqft</span>
              </div>
              <div>
                <span class="text-[8px] text-slate-400 block uppercase font-bold">Super Area</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ property.area?.superBuiltUp || 1500 }} sqft</span>
              </div>
              <div>
                <span class="text-[8px] text-slate-400 block uppercase font-bold">Facing parameter</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200 capitalize">{{ property.facing || 'East' }}</span>
              </div>
              <div>
                <span class="text-[8px] text-slate-400 block uppercase font-bold">Furnishing State</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200 capitalize">Semi-Furnished</span>
              </div>
            </div>
          </div>

          <!-- Address Coordinates -->
          <div class="space-y-3 border-t border-dashed border-default pt-4" v-if="property.location">
            <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between">
              <span>Location details</span>
              <!-- Open maps deep link -->
              <a 
                href="https://maps.google.com/?q=Whitefield,Bangalore"
                target="_blank"
                class="text-primary hover:underline text-[10px] flex items-center gap-1.5"
              >
                <PhMapPin :size="12" />
                <span>Open Google Maps</span>
              </a>
            </h4>
            <p class="text-slate-650 leading-relaxed text-xs">
              {{ property.location.address || 'Prestige Heights Building, Whitefield road near metro station' }}, {{ property.location.city }}
            </p>
          </div>
        </div>

        <!-- Tab 2: Availability Calendar -->
        <div v-if="activeTab === 'calendar'" class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4">
          <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
            Booking & Visit Availability Calendar
          </h4>
          <!-- Simulated interactive grid calendar -->
          <div class="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase text-slate-400 pt-2">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div class="grid grid-cols-7 gap-2">
            <div 
              v-for="day in 30" 
              :key="day"
              class="h-10 border border-default rounded-lg flex flex-col justify-between p-1 hover:border-slate-350 select-none bg-surface"
            >
              <span class="text-[9px] text-slate-400 font-bold">{{ day }}</span>
              <!-- Highlight active hold or visit dates -->
              <span v-if="day === 12" class="w-2.5 h-2.5 rounded-full bg-amber-500 self-end" title="Active Reservation hold"></span>
              <span v-if="day === 18" class="w-2.5 h-2.5 rounded-full bg-purple-500 self-end" title="Scheduled Site Visit"></span>
            </div>
          </div>
        </div>

        <!-- Tab 3: Reservations History -->
        <div v-if="activeTab === 'reservations'" class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4">
          <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
            Reservation Holds History Log
          </h4>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead>
                <tr class="border-b border-default text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-2">
                  <th class="py-2">Holder Client</th>
                  <th class="py-2">Agent owner</th>
                  <th class="py-2">Token Paid</th>
                  <th class="py-2">Hold Expiry</th>
                  <th class="py-2">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default text-slate-650">
                <tr v-for="hold in mockReservations" :key="hold.id">
                  <td class="py-2.5 font-bold text-slate-800 dark:text-slate-200">{{ hold.leadName }}</td>
                  <td class="py-2.5">{{ hold.agentName }}</td>
                  <td class="py-2.5 font-semibold text-emerald-600">{{ formatCurrency(hold.tokenPaid) }}</td>
                  <td class="py-2.5 text-slate-450">{{ hold.expiry }}</td>
                  <td class="py-2.5">
                    <span 
                      class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                      :class="hold.status === 'active' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400'"
                    >
                      {{ hold.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 4: Documents Gallery -->
        <div v-if="activeTab === 'documents'" class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-default pb-3">
            <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
              Approved brochures & legal specifications files
            </h4>
            
            <button class="btn btn-sm btn-primary">
              + Upload File
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div class="border border-default rounded-xl p-3 flex items-center justify-between bg-slate-55/50 dark:bg-slate-900">
              <div class="flex items-center space-x-2.5">
                <PhFile :size="20" class="text-slate-400 shrink-0" />
                <div>
                  <h5 class="font-bold text-slate-750 dark:text-slate-200">RERA Registration Certificate.pdf</h5>
                  <span class="text-[9px] text-slate-450">4.8 MB | Verified</span>
                </div>
              </div>
              <button class="text-primary hover:underline font-bold text-[10px]">Download</button>
            </div>
            
            <div class="border border-default rounded-xl p-3 flex items-center justify-between bg-slate-55/50 dark:bg-slate-900">
              <div class="flex items-center space-x-2.5">
                <PhFile :size="20" class="text-slate-400 shrink-0" />
                <div>
                  <h5 class="font-bold text-slate-750 dark:text-slate-200">Layout Unit Plan.pdf</h5>
                  <span class="text-[9px] text-slate-450">1.2 MB | Verified</span>
                </div>
              </div>
              <button class="text-primary hover:underline font-bold text-[10px]">Download</button>
            </div>
          </div>
        </div>

        <!-- Tab 5: Activities & Task Timeline -->
        <div v-if="activeTab === 'activities'" class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4">
          <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-default pb-2">
            Property Interactions & Follow-Up Log
          </h4>

          <div class="relative border-l border-default ml-2.5 pl-4 space-y-5 text-xs">
            <div class="relative">
              <span class="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900"></span>
              <p class="font-bold text-slate-800 dark:text-slate-100">Site visit logged by Agent Priya Sharma</p>
              <p class="text-slate-450 text-[10px] mt-0.5">3 Jun 2026, 04:30 PM</p>
              <p class="text-slate-650 bg-slate-50/50 dark:bg-slate-900 border border-default p-2 rounded-lg mt-1.5 leading-relaxed text-[10px]">
                Client Amit Shah visited the tower today. Evaluated East-facing balconies. Showed high purchase intent.
              </p>
            </div>

            <div class="relative">
              <span class="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></span>
              <p class="font-bold text-slate-800 dark:text-slate-100">Outreach phone call logged by Agent Rahul M</p>
              <p class="text-slate-450 text-[10px] mt-0.5">1 Jun 2026, 11:15 AM</p>
            </div>
          </div>
        </div>

        <!-- Tab 6: Audit Trail -->
        <div v-if="activeTab === 'audit'" class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-4">
          <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-default pb-2">
            System Operations & Configuration Logs
          </h4>

          <div class="space-y-3.5 text-xs text-slate-650">
            <div 
              v-for="log in property.priceHistory" 
              :key="log.changedAt" 
              class="flex justify-between items-center py-1.5 border-b border-default last:border-b-0 border-dashed"
            >
              <div>
                <p class="font-bold text-slate-850 dark:text-slate-200">
                  Price revised from <b>{{ formatCurrency(property.price - 200000) }}</b> to <b>{{ formatCurrency(log.price) }}</b>
                </p>
                <p class="text-[10px] text-slate-450">Reason: {{ log.reason || 'Market adjustments adjustment value' }}</p>
              </div>
              <span class="text-[9px] text-slate-400 font-mono">{{ formatDate(log.changedAt) }}</span>
            </div>
            
            <div class="flex justify-between items-center py-1.5 border-b border-default last:border-b-0 border-dashed">
              <div>
                <p class="font-bold text-slate-850 dark:text-slate-200">Property Listing Created</p>
                <p class="text-[10px] text-slate-450">Created by System Admin Supervisor</p>
              </div>
              <span class="text-[9px] text-slate-400 font-mono">{{ formatDate(property.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Sidebar Action Panel -->
      <div class="space-y-6">
        <ReservationPanel 
          :status="property.status"
          :tokenPaid="100000"
          reservedLeadName="John Doe (Premium)"
          reservedAgentName="Priya Sharma"
          :waitlist="mockWaitlist"
          :totalMatches="18"
          :hotMatches="5"
          timeLeftStr="22h 14m"
          :progressPercent="75"
          @extend="isExtendOpen = true"
          @release="isReleaseOpen = true"
          @convertToDeal="handleConvertToDeal"
          @manageQueue="isQueueOpen = true"
          @viewMatchingLeads="isMatchingOpen = true"
          @share="handleShareCollaterals"
        />
      </div>
    </div>

    <!-- Mounting Drawers & Modals -->
    <PropertyReservationDrawer 
      :isOpen="isReserveOpen" 
      :property="property"
      @close="isReserveOpen = false"
      @success="refetch"
    />

    <ReservationExtensionDrawer 
      :isOpen="isExtendOpen" 
      :property="property"
      @close="isExtendOpen = false"
      @success="refetch"
    />

    <ReservationReleaseModal 
      :isOpen="isReleaseOpen" 
      :property="property"
      :tokenPaid="100000"
      @close="isReleaseOpen = false"
      @success="refetch"
    />

    <ReservationQueueDrawer 
      :isOpen="isQueueOpen" 
      unitCode="802"
      :activeHold="{ leadName: 'John Doe', agentName: 'Priya Sharma', tokenPaid: 100000 }"
      :waitlist="mockWaitlist"
      @close="isQueueOpen = false"
      @forceRelease="isReleaseOpen = true"
      @updateQueue="handleWaitlistQueueUpdate"
    />

    <MatchingLeadsDrawer 
      :isOpen="isMatchingOpen" 
      :property="property"
      @close="isMatchingOpen = false"
      @hold="handleDirectHoldFromMatching"
    />
  </div>
  
  <div v-else class="text-center py-12 text-slate-450 italic">
    Property record could not be loaded. Please verify parameters.
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { usePropertyQuery } from '../queries';
import ReservationPanel from '../components/ReservationPanel.vue';
import PropertyReservationDrawer from '../components/PropertyReservationDrawer.vue';
import ReservationExtensionDrawer from '../components/ReservationExtensionDrawer.vue';
import ReservationReleaseModal from '../components/ReservationReleaseModal.vue';
import ReservationQueueDrawer from '../components/ReservationQueueDrawer.vue';
import MatchingLeadsDrawer from '../components/MatchingLeadsDrawer.vue';

// Phosphor icons
import { PhCaretLeft, PhMapPin, PhFile } from '@phosphor-icons/vue';

const route = useRoute();
const router = useRouter();
const store = useStore();

const activeTab = ref('overview');
const isReserveOpen = ref(false);
const isExtendOpen = ref(false);
const isReleaseOpen = ref(false);
const isQueueOpen = ref(false);
const isMatchingOpen = ref(false);

const { data: propertyData, isLoading, refetch } = usePropertyQuery(route.params.id);

const property = computed(() => propertyData.value?.data || null);

const tabs = [
  { key: 'overview', label: 'Technical specs' },
  { key: 'calendar', label: 'Availability Calendar' },
  { key: 'reservations', label: 'Holds History' },
  { key: 'documents', label: 'Brochures' },
  { key: 'activities', label: 'Interactions' },
  { key: 'audit', label: 'Audit Trail' }
];

const mockReservations = ref([
  { id: '1', leadName: 'John Doe (Premium)', agentName: 'Priya Sharma', tokenPaid: 100000, expiry: '15 Jun 2026', status: 'active' },
  { id: '2', leadName: 'Amit Shah', agentName: 'Rahul Mehta', tokenPaid: 50000, expiry: '10 May 2026', status: 'expired' }
]);

const mockWaitlist = ref([
  { id: 'w1', leadName: 'Amit Shah', agentName: 'Rahul M.', tokenPaid: true },
  { id: 'w2', leadName: 'Priya Patel', agentName: 'Sneha K.', tokenPaid: false }
]);

const handleStatusChangeDropdown = (evt) => {
  const nextStatus = evt.target.value;
  if (nextStatus === 'reserved') {
    isReserveOpen.value = true;
  } else if (nextStatus === 'sold') {
    // Lead Conversion close
    if (confirm('Initiate booking closure deal process?')) {
      handleConvertToDeal();
    }
  } else if (nextStatus === 'available') {
    isReleaseOpen.value = true;
  }
};

const handleConvertToDeal = () => {
  // Push to conversion flow
  store.dispatch('notifications/triggerToast', {
    message: 'Navigating to deal conversion closure wizard...',
    type: 'info'
  });
  router.push('/app/deals');
};

const handleWaitlistQueueUpdate = (updatedList) => {
  mockWaitlist.value = updatedList;
};

const handleDirectHoldFromMatching = (lead) => {
  isMatchingOpen.value = false;
  isReserveOpen.value = true;
};

const handleShareCollaterals = (type) => {
  if (type === 'whatsapp') {
    window.open(`https://wa.me/?text=Check out Skyway Tower Unit 802 details: http://trackdeal.in/microsheet/SKY-T-A-802`, '_blank');
  } else {
    store.dispatch('notifications/triggerToast', {
      message: `Collateral share via ${type.toUpperCase()} initiated successfully.`,
      type: 'success'
    });
  }
};

const getStatusSelectClass = (status) => {
  if (status === 'available') return 'text-emerald-600 border-emerald-300 bg-emerald-50';
  if (status === 'reserved') return 'text-amber-600 border-amber-300 bg-amber-50';
  if (status === 'sold') return 'text-red-650 border-red-300 bg-red-50';
  return 'text-slate-600 border-slate-300 bg-slate-50';
};

const formatDate = (val) => {
  if (!val) return '';
  return new Date(val).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
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
