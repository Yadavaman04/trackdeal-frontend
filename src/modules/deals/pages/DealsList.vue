<template>
  <div class="space-y-6">
    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
          <PhHandshake :size="20" class="text-primary" />
          <span>Enterprise Deals Workspace</span>
        </h2>
        <p class="text-xs text-slate-550 mt-0.5">
          Track property bookings, manage buyer milestone KYC validation, and forecast commission schedules.
        </p>
      </div>

      <!-- Action buttons & Views toggle -->
      <div class="flex items-center gap-3 self-end sm:self-auto shrink-0 flex-wrap">
        <!-- View Toggle buttons -->
        <div class="border border-default rounded-lg p-0.5 bg-slate-55/50 dark:bg-slate-900 flex space-x-0.5">
          <button 
            @click="viewMode = 'table'"
            class="px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5"
            :class="viewMode === 'table' ? 'bg-surface text-slate-800 dark:text-slate-200 shadow-xs' : 'text-slate-400 hover:text-slate-650'"
            title="Table View"
          >
            <PhTable :size="12" />
            <span>Table</span>
          </button>
          <button 
            @click="viewMode = 'kanban'"
            class="px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5"
            :class="viewMode === 'kanban' ? 'bg-surface text-slate-800 dark:text-slate-200 shadow-xs' : 'text-slate-400 hover:text-slate-650'"
            title="Pipeline Board"
          >
            <PhColumns :size="12" />
            <span>Kanban</span>
          </button>
          <button 
            @click="viewMode = 'forecast'"
            class="px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5"
            :class="viewMode === 'forecast' ? 'bg-surface text-slate-800 dark:text-slate-200 shadow-xs' : 'text-slate-400 hover:text-slate-650'"
            title="Revenue Forecast"
          >
            <PhTrendUp :size="12" />
            <span>Forecast</span>
          </button>
        </div>

        <!-- Convert Reservation Action -->
        <button 
          @click="openConvertReservation"
          class="btn btn-sm btn-secondary text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 gap-1.5"
        >
          <PhKey :size="14" />
          <span>Convert Hold</span>
        </button>

        <!-- Create Deal button -->
        <button 
          @click="isCreateOpen = true"
          class="btn btn-sm btn-primary"
        >
          + Create Deal
        </button>
      </div>
    </div>

    <!-- Metrics Ribbon -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Active Deal Files -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-1.5">
        <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Active Transactions</span>
        <div class="flex items-baseline space-x-2">
          <span class="text-lg font-bold font-heading text-slate-800 dark:text-slate-100">{{ metrics.activeCount }}</span>
          <span class="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded dark:bg-indigo-950/20">Pipeline</span>
        </div>
      </div>
      <!-- Card 2: Booked MTD -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-1.5">
        <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Booking Confirmed MTD</span>
        <div class="flex items-baseline space-x-2">
          <span class="text-lg font-bold font-heading text-slate-800 dark:text-slate-100">{{ metrics.confirmedCount }}</span>
          <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded dark:bg-emerald-950/20">Success</span>
        </div>
      </div>
      <!-- Card 3: Expected Revenue Forecast -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-1.5">
        <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Est. Revenue Value</span>
        <div class="flex items-baseline space-x-2">
          <span class="text-base font-bold font-heading text-slate-800 dark:text-slate-100">{{ formatCurrency(metrics.totalValue) }}</span>
        </div>
      </div>
      <!-- Card 4: Total Expected Commissions -->
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-1.5">
        <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Commission Accrued</span>
        <div class="flex items-baseline space-x-2">
          <span class="text-base font-bold font-heading text-slate-800 dark:text-slate-100">{{ formatCurrency(metrics.expectedCommissions) }}</span>
          <span class="text-[9px] text-emerald-500 font-semibold">● Projected</span>
        </div>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="bg-surface border border-default rounded-xl p-3 shadow-xs text-xs flex flex-wrap items-center gap-3">
      <div class="flex-1 min-w-[200px]">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search by Deal #, Customer name..."
          class="w-full bg-slate-55/30 border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary font-medium"
        />
      </div>

      <div class="w-40 shrink-0">
        <select v-model="filters.status" class="w-full bg-slate-55/30 border border-default rounded-lg px-3 py-1.5 outline-none font-medium">
          <option value="">All Stages</option>
          <option value="draft">Reserved / Draft</option>
          <option value="token_received">Token Received</option>
          <option value="booking_confirmed">Booking Confirmed</option>
          <option value="agreement_executed">Agreement Executed</option>
          <option value="registration_completed">Registration Completed</option>
          <option value="commission_eligible">Commission Eligible</option>
          <option value="deal_closed">Closed Won</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div class="w-44 shrink-0">
        <select v-model="filters.assignedTo" class="w-full bg-slate-55/30 border border-default rounded-lg px-3 py-1.5 outline-none font-medium">
          <option value="">All Agents</option>
          <option v-for="agent in agents" :key="agent._id" :value="agent._id">
            {{ agent.firstName }} {{ agent.lastName || '' }}
          </option>
        </select>
      </div>

      <button 
        @click="resetFilters"
        class="text-slate-400 hover:text-slate-600 font-semibold py-1.5 px-3 rounded-lg border border-default hover:bg-slate-50 transition-colors"
      >
        Clear Filters
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="animate-pulse space-y-4">
      <div class="h-40 bg-slate-200 dark:bg-slate-850 rounded-xl w-full"></div>
      <div class="h-64 bg-slate-200 dark:bg-slate-850 rounded-xl w-full"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-xl">
      ⚠️ Failed to load deals data. Please refresh and try again.
    </div>

    <!-- Main Workspace Content -->
    <div v-else class="space-y-4">
      <!-- 1. TABLE VIEW -->
      <div v-if="viewMode === 'table'" class="bg-surface border border-default rounded-xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50 dark:bg-slate-900/50">
                <th class="py-3 px-4">Deal Number</th>
                <th class="py-3 px-4">Client Customer</th>
                <th class="py-3 px-4">Project & Unit</th>
                <th class="py-3 px-4 text-right">Deal Value</th>
                <th class="py-3 px-4">Transaction Stage</th>
                <th class="py-3 px-4 text-center">Health</th>
                <th class="py-3 px-4">Est. Close Target</th>
                <th class="py-3 px-4">Allocated Agent</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default text-slate-655">
              <tr 
                v-for="deal in filteredDeals" 
                :key="deal._id || deal.id"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer"
                @click="$router.push(`/app/deals/${deal._id || deal.id}`)"
              >
                <!-- Deal Number -->
                <td class="py-3.5 px-4 font-bold text-primary font-heading">
                  {{ deal.dealNumber || `#DL-${(deal._id || deal.id || '').substring(18).toUpperCase()}` }}
                </td>
                
                <!-- Client Customer -->
                <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                  <div class="space-y-0.5">
                    <p>{{ deal.customer?.name || deal.customer?.firstName || 'Buyer Lead' }}</p>
                    <p class="text-[9px] text-slate-450 font-medium font-mono" v-if="deal.customer?.mobile">{{ deal.customer.mobile }}</p>
                  </div>
                </td>

                <!-- Project & Unit -->
                <td class="py-3.5 px-4">
                  <div class="space-y-0.5 font-medium">
                    <p class="text-slate-800 dark:text-slate-250 truncate max-w-[180px]">{{ deal.project?.name || deal.projectTitle || 'Skyway Prestige' }}</p>
                    <p class="text-[10px] text-slate-450">Unit: {{ deal.unit?.unitNumber || deal.unitCode || 'Unit 802' }}</p>
                  </div>
                </td>

                <!-- Deal Value -->
                <td class="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-100 font-heading">
                  {{ formatCurrency(deal.dealValue || deal.askingPrice) }}
                </td>

                <!-- Transaction Stage -->
                <td class="py-3.5 px-4">
                  <span 
                    class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                    :class="getStageBadgeClass(deal.status)"
                  >
                    ● {{ formatStageName(deal.status) }}
                  </span>
                </td>

                <!-- Health score -->
                <td class="py-3.5 px-4 text-center">
                  <span 
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold"
                    :class="deal.healthScore >= 80 ? 'bg-emerald-50 text-emerald-600' : deal.healthScore >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'"
                  >
                    {{ deal.healthScore || 90 }}%
                  </span>
                </td>

                <!-- Est. Close Target -->
                <td class="py-3.5 px-4 text-slate-450 font-medium">
                  {{ formatDate(deal.closeDate || deal.createdAt) }}
                </td>

                <!-- Allocated Agent -->
                <td class="py-3.5 px-4 text-slate-650 dark:text-slate-400 font-semibold">
                  {{ deal.assignedTo?.firstName || 'Assigned Staff' }}
                </td>
              </tr>

              <tr v-if="filteredDeals.length === 0">
                <td colspan="8" class="text-center py-10 text-slate-400 italic">No deals matching active filters.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. PIPELINE BOARD -->
      <div v-else-if="viewMode === 'kanban'">
        <DealPipelineBoard 
          :deals="dealsList"
          @stageChange="handleStageChange"
          @cancelDeal="triggerCancel"
          @startWizard="triggerWizard"
        />
      </div>

      <!-- 3. FORECAST REVENUE VIEW -->
      <div v-else-if="viewMode === 'forecast'" class="space-y-6">
        <!-- Probability Distribution SVG Metric Panel -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div class="md:col-span-8 space-y-2">
            <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Probability Weighted Closing Distribution</h4>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">
              Analysis based on closing velocity factors (KYC completion speed, booking deposit clearing time, loan coordination milestones).
            </p>
            <!-- Native SVG probability curve/chart -->
            <div class="pt-3">
              <svg viewBox="0 0 500 100" class="w-full h-24 overflow-visible">
                <!-- Grid lines -->
                <line x1="0" y1="90" x2="500" y2="90" stroke="var(--border-default, #e2e8f0)" stroke-dasharray="4 4" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border-default, #e2e8f0)" stroke-dasharray="4 4" />
                <line x1="0" y1="10" x2="500" y2="10" stroke="var(--border-default, #e2e8f0)" stroke-dasharray="4 4" />

                <!-- Probability Area Curve -->
                <path 
                  d="M0,90 C80,85 120,20 180,30 C240,40 300,75 360,60 C420,45 460,10 500,10 L500,90 Z" 
                  fill="url(#forecastGradient)" 
                  opacity="0.15" 
                />
                <!-- Curve Stroke -->
                <path 
                  d="M0,90 C80,85 120,20 180,30 C240,40 300,75 360,60 C420,45 460,10 500,10" 
                  fill="none" 
                  stroke="var(--color-primary, #6366f1)" 
                  stroke-width="3" 
                  stroke-linecap="round"
                />

                <!-- Markers/Nodes -->
                <circle cx="180" cy="30" r="4" fill="#6366f1" stroke="#ffffff" stroke-width="1.5" />
                <circle cx="360" cy="60" r="4" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5" />
                <circle cx="500" cy="10" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />

                <!-- Node labels -->
                <text x="175" y="20" font-size="8" font-weight="bold" fill="#6366f1">30 Days (85%)</text>
                <text x="350" y="50" font-size="8" font-weight="bold" fill="#3b82f6">60 Days (60%)</text>
                <text x="460" y="25" font-size="8" font-weight="bold" fill="#10b981">Won (100%)</text>

                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#6366f1" />
                    <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <div class="md:col-span-4 border-l border-default pl-0 md:pl-6 space-y-4">
            <h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weighted Targets</h5>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-slate-655 font-medium">30 Days Volume:</span>
                <span class="font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(forecasts.d30Total) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-655 font-medium">60 Days Volume:</span>
                <span class="font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(forecasts.d60Total) }}</span>
              </div>
              <div class="flex justify-between items-center border-t border-dashed border-default pt-2">
                <span class="text-slate-655 font-bold">Total Weighted:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-450">{{ formatCurrency(forecasts.d30Total + forecasts.d60Total) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Columns Timeline -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Column 1: Next 30 Days Expected -->
          <div class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-xl p-4 flex flex-col min-h-[400px]">
            <div class="border-b border-default pb-3 mb-4 flex justify-between items-center">
              <div>
                <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">🔥 Next 30 Days Expected</h4>
                <p class="text-[10px] text-slate-450 mt-0.5">High probability closing targets</p>
              </div>
              <span class="text-[10px] font-bold text-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 border border-default rounded-full">
                {{ formatCurrency(forecasts.d30Total) }}
              </span>
            </div>

            <div class="space-y-3 flex-1 overflow-y-auto">
              <div 
                v-for="deal in forecasts.d30List" 
                :key="deal._id || deal.id"
                class="bg-surface border border-default rounded-xl p-3 hover:border-slate-350 dark:hover:border-slate-700 transition-all shadow-xs cursor-pointer text-xs space-y-2"
                @click="$router.push(`/app/deals/${deal._id || deal.id}`)"
              >
                <div class="flex justify-between items-start">
                  <span class="font-heading font-bold text-primary">{{ deal.dealNumber || 'DEAL-FILE' }}</span>
                  <span class="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase">
                    {{ deal.status === 'booking_initiated' || deal.status === 'booking_confirmed' ? 'Booking' : formatStageName(deal.status) }}
                  </span>
                </div>
                <p class="font-semibold text-slate-700 dark:text-slate-300">👤 {{ deal.customer?.name || 'Client' }}</p>
                <div class="text-[10px] text-slate-450 flex justify-between pt-1 border-t border-default border-dashed">
                  <span>Value: <b>{{ formatCurrency(deal.dealValue) }}</b></span>
                  <span class="text-emerald-500 font-bold">Comm: {{ formatCurrency(deal.commissionAmount) }}</span>
                </div>
              </div>

              <div v-if="forecasts.d30List.length === 0" class="h-24 flex items-center justify-center text-[10px] text-slate-400 italic border border-dashed border-default rounded-xl">
                No pipeline files expected in 30 days.
              </div>
            </div>
          </div>

          <!-- Column 2: Next 60 Days Expected -->
          <div class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-xl p-4 flex flex-col min-h-[400px]">
            <div class="border-b border-default pb-3 mb-4 flex justify-between items-center">
              <div>
                <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">📅 Next 60 Days Expected</h4>
                <p class="text-[10px] text-slate-450 mt-0.5">Agreement and registration stage files</p>
              </div>
              <span class="text-[10px] font-bold text-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 border border-default rounded-full">
                {{ formatCurrency(forecasts.d60Total) }}
              </span>
            </div>

            <div class="space-y-3 flex-1 overflow-y-auto">
              <div 
                v-for="deal in forecasts.d60List" 
                :key="deal._id || deal.id"
                class="bg-surface border border-default rounded-xl p-3 hover:border-slate-350 dark:hover:border-slate-700 transition-all shadow-xs cursor-pointer text-xs space-y-2"
                @click="$router.push(`/app/deals/${deal._id || deal.id}`)"
              >
                <div class="flex justify-between items-start">
                  <span class="font-heading font-bold text-primary">{{ deal.dealNumber || 'DEAL-FILE' }}</span>
                  <span class="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 text-[8px] font-bold uppercase">
                    {{ formatStageName(deal.status) }}
                  </span>
                </div>
                <p class="font-semibold text-slate-700 dark:text-slate-300">👤 {{ deal.customer?.name || 'Client' }}</p>
                <div class="text-[10px] text-slate-450 flex justify-between pt-1 border-t border-default border-dashed">
                  <span>Value: <b>{{ formatCurrency(deal.dealValue) }}</b></span>
                  <span class="text-emerald-500 font-bold">Comm: {{ formatCurrency(deal.commissionAmount) }}</span>
                </div>
              </div>

              <div v-if="forecasts.d60List.length === 0" class="h-24 flex items-center justify-center text-[10px] text-slate-400 italic border border-dashed border-default rounded-xl">
                No pipeline files expected in 60 days.
              </div>
            </div>
          </div>

          <!-- Column 3: Risks / Long-term / Stale -->
          <div class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-xl p-4 flex flex-col min-h-[400px]">
            <div class="border-b border-default pb-3 mb-4 flex justify-between items-center">
              <div>
                <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">⚠️ Risk / Long-Term</h4>
                <p class="text-[10px] text-slate-450 mt-0.5">Stale files or pending mortgage loans</p>
              </div>
              <span class="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 border border-red-200 rounded-full">
                {{ formatCurrency(forecasts.riskTotal) }}
              </span>
            </div>

            <div class="space-y-3 flex-1 overflow-y-auto">
              <div 
                v-for="deal in forecasts.riskList" 
                :key="deal._id || deal.id"
                class="bg-surface border border-default rounded-xl p-3 border-red-200 hover:border-red-300 dark:border-red-950/50 dark:hover:border-red-900 transition-all shadow-xs cursor-pointer text-xs space-y-2"
                @click="$router.push(`/app/deals/${deal._id || deal.id}`)"
              >
                <div class="flex justify-between items-start">
                  <span class="font-heading font-bold text-red-600">{{ deal.dealNumber || 'DEAL-FILE' }}</span>
                  <span class="px-1.5 py-0.2 rounded bg-red-50 text-red-655 text-[8px] font-bold uppercase">
                    {{ formatStageName(deal.status) }}
                  </span>
                </div>
                <p class="font-semibold text-slate-700 dark:text-slate-350">👤 {{ deal.customer?.name || 'Client' }}</p>
                <div class="text-[10px] text-slate-450 flex justify-between pt-1 border-t border-default border-dashed">
                  <span>Value: <b>{{ formatCurrency(deal.dealValue) }}</b></span>
                  <span class="text-red-550 font-bold">Health: {{ deal.healthScore || 50 }}%</span>
                </div>
              </div>

              <div v-if="forecasts.riskList.length === 0" class="h-24 flex items-center justify-center text-[10px] text-slate-400 italic border border-dashed border-default rounded-xl">
                No high risk/long-term items.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Deal Drawer -->
    <DealCreationDrawer 
      :isOpen="isCreateOpen"
      @close="isCreateOpen = false"
      @success="refetch"
    />

    <!-- Convert Reservation Drawer -->
    <ReservationConversionDrawer
      v-if="selectedHold"
      :isOpen="isConvertOpen"
      :property="selectedHold"
      @close="isConvertOpen = false; selectedHold = null"
      @success="refetch"
    />

    <!-- Booking Confirmation Stepper Wizard -->
    <BookingWizard
      v-if="wizardTargetDeal"
      :isOpen="isWizardOpen"
      :deal="wizardTargetDeal"
      @close="isWizardOpen = false; wizardTargetDeal = null"
      @success="refetch"
    />

    <!-- Cancellation Drawer -->
    <DealCancellationDrawer
      v-if="cancelTargetDeal"
      :isOpen="isCancelOpen"
      :deal="cancelTargetDeal"
      @close="isCancelOpen = false; cancelTargetDeal = null"
      @success="refetch"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api/client';
import DealPipelineBoard from '../components/DealPipelineBoard.vue';
import DealCreationDrawer from '../components/DealCreationDrawer.vue';
import ReservationConversionDrawer from '../components/ReservationConversionDrawer.vue';
import BookingWizard from '../components/BookingWizard.vue';
import DealCancellationDrawer from '../components/DealCancellationDrawer.vue';
import { useDealsQuery, useTransitionStageMutation } from '../queries';

// Phosphor icons
import { PhHandshake, PhTable, PhColumns, PhTrendUp, PhKey } from '@phosphor-icons/vue';

const store = useStore();

const filters = ref({
  search: '',
  status: '',
  assignedTo: '',
  sort: 'createdAt',
  order: -1
});

const viewMode = ref('table');

// Drawers & Modals States
const isCreateOpen = ref(false);
const isConvertOpen = ref(false);
const isWizardOpen = ref(false);
const isCancelOpen = ref(false);

const selectedHold = ref(null);
const wizardTargetDeal = ref(null);
const cancelTargetDeal = ref(null);

const agents = ref([]);

const { data, isLoading, error, refetch } = useDealsQuery(filters);

const dealsList = computed(() => {
  return data.value?.data || data.value || [];
});

const filteredDeals = computed(() => {
  return dealsList.value.filter(deal => {
    // Stage check
    if (filters.value.status) {
      if (deal.status !== filters.value.status) return false;
    }
    // Agent check
    if (filters.value.assignedTo) {
      const agentId = deal.assignedTo?._id || deal.assignedTo;
      if (agentId !== filters.value.assignedTo) return false;
    }
    // Search text check
    if (filters.value.search.trim()) {
      const query = filters.value.search.toLowerCase();
      const num = (deal.dealNumber || '').toLowerCase();
      const client = (deal.customer?.name || deal.customer?.firstName || '').toLowerCase();
      const unitStr = (deal.unit?.unitNumber || deal.unitCode || '').toLowerCase();
      if (!num.includes(query) && !client.includes(query) && !unitStr.includes(query)) {
        return false;
      }
    }
    return true;
  });
});

// Calculate metrics based on filtered or active deals
const metrics = computed(() => {
  const active = dealsList.value.filter(d => d.status !== 'cancelled' && d.status !== 'deal_closed');
  const confirmed = dealsList.value.filter(d => d.status === 'booking_confirmed' || d.status === 'booking_initiated');
  
  const totalVal = dealsList.value.reduce((acc, d) => acc + (d.dealValue || d.askingPrice || 0), 0);
  const comms = dealsList.value.reduce((acc, d) => acc + (d.commissionAmount || 0), 0);

  return {
    activeCount: active.length,
    confirmedCount: confirmed.length,
    totalValue: totalVal,
    expectedCommissions: comms
  };
});

// Forecast Timeline split lists
const forecasts = computed(() => {
  const d30 = [];
  const d60 = [];
  const risk = [];

  let d30Sum = 0;
  let d60Sum = 0;
  let riskSum = 0;

  dealsList.value.forEach(deal => {
    const health = deal.healthScore || 90;
    const isCancelled = deal.status === 'cancelled';
    const isClosed = deal.status === 'deal_closed' || deal.status === 'commission_received';

    if (isCancelled || isClosed) return;

    if (health < 70) {
      risk.push(deal);
      riskSum += (deal.dealValue || 0);
    } else {
      // Look at status or target date.
      // For mock simplicity: draft, token_received, booking_confirmed/initiated go to 30 days.
      // agreement_executed, registration_completed go to 60 days.
      const status = deal.status;
      if (status === 'draft' || status === 'token_received' || status === 'booking_initiated' || status === 'booking_confirmed') {
        d30.push(deal);
        d30Sum += (deal.dealValue || 0);
      } else {
        d60.push(deal);
        d60Sum += (deal.dealValue || 0);
      }
    }
  });

  return {
    d30List: d30,
    d60List: d60,
    riskList: risk,
    d30Total: d30Sum,
    d60Total: d60Sum,
    riskTotal: riskSum
  };
});

// Load context agents
onMounted(async () => {
  try {
    const res = await apiClient.get('/users');
    agents.value = res.data?.data || [];
  } catch (err) {
    console.error('Failed to load agents in DealsList:', err);
  }
});

const resetFilters = () => {
  filters.value = {
    search: '',
    status: '',
    assignedTo: '',
    sort: 'createdAt',
    order: -1
  };
};

const openConvertReservation = async () => {
  try {
    // Find a property with reserved status
    const propsRes = await apiClient.get('/properties');
    const reservedProps = propsRes.data?.data?.filter(p => p.status === 'reserved') || [];
    if (reservedProps.length > 0) {
      selectedHold.value = reservedProps[0];
      isConvertOpen.value = true;
    } else {
      store.dispatch('notifications/triggerToast', {
        message: 'No active reservation holds available for conversion. Create a property hold first.',
        type: 'warning'
      });
    }
  } catch (err) {
    console.error('Failed to check reserved holds:', err);
  }
};

const { mutateAsync: transitionStage } = useTransitionStageMutation();

const handleStageChange = async ({ deal, oldStage, newStage }) => {
  try {
    await transitionStage({
      id: deal._id || deal.id,
      stage: newStage,
      notes: `Dragged from stage ${oldStage} to ${newStage}`
    });
    store.dispatch('notifications/triggerToast', {
      message: `Deal transitioned to ${formatStageName(newStage)} successfully.`,
      type: 'success'
    });
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: err.response?.data?.message || 'Failed to update deal stage.',
      type: 'error'
    });
  }
};

const triggerCancel = (deal) => {
  cancelTargetDeal.value = deal;
  isCancelOpen.value = true;
};

const triggerWizard = (deal) => {
  wizardTargetDeal.value = deal;
  isWizardOpen.value = true;
};

// Formatting helpers
const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const formatDate = (val) => {
  if (!val) return '';
  return new Date(val).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatStageName = (stage) => {
  if (!stage) return '';
  // Map stage code to labels
  const mapping = {
    'draft': 'Reserved / Draft',
    'token_received': 'Token Received',
    'booking_initiated': 'Booking Initiating',
    'booking_confirmed': 'Booking Confirmed',
    'agreement_executed': 'Agreement Executed',
    'registration_completed': 'Registration Completed',
    'commission_eligible': 'Commission Eligible',
    'deal_closed': 'Closed Won',
    'commission_received': 'Closed Won',
    'cancelled': 'Cancelled'
  };
  return mapping[stage] || stage.replace(/_/g, ' ');
};

const getStageBadgeClass = (stage) => {
  switch (stage) {
    case 'draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    case 'token_received': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20';
    case 'booking_initiated':
    case 'booking_confirmed': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20';
    case 'agreement_executed': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/20';
    case 'registration_completed': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20';
    case 'commission_eligible': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20';
    case 'deal_closed':
    case 'commission_received': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40';
    case 'cancelled': return 'bg-red-50 text-red-500 dark:bg-red-950/20';
    default: return 'bg-slate-100 text-slate-600';
  }
};
</script>
