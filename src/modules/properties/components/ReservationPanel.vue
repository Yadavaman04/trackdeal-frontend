<template>
  <div class="space-y-4">
    <!-- 1. Active Reservation Hold (Only when status is Reserved) -->
    <div 
      v-if="status === 'reserved'" 
      class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3"
    >
      <div class="flex items-center justify-between border-b border-default pb-2">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
          Current Reservation hold
        </h4>
        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200">
          Reserved
        </span>
      </div>

      <!-- Time Left Expiry countdown bar -->
      <div class="space-y-1.5">
        <div class="flex justify-between items-center text-[10px]">
          <span class="text-slate-400 font-medium">Remaining Hold Time:</span>
          <span class="font-bold text-slate-800 dark:text-slate-100">{{ timeLeftStr }}</span>
        </div>
        <!-- Progress Bar -->
        <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-300"
            :class="getCountdownBarClass"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
      </div>

      <!-- Reservation Details -->
      <div class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-lg p-2.5 space-y-2 text-[10px] leading-relaxed">
        <div class="flex justify-between py-0.5 border-b border-default last:border-b-0 border-dashed">
          <span class="text-slate-400">Linked Lead Client:</span>
          <span class="font-bold text-slate-700 dark:text-slate-350">
            {{ reservedLeadName }}
          </span>
        </div>
        <div class="flex justify-between py-0.5 border-b border-default last:border-b-0 border-dashed">
          <span class="text-slate-400">Reserved By:</span>
          <span class="font-semibold text-slate-700 dark:text-slate-350">
            {{ reservedAgentName }}
          </span>
        </div>
        <div class="flex justify-between py-0.5 border-b border-default last:border-b-0 border-dashed">
          <span class="text-slate-400">Token Amount Paid:</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-450">
            {{ formatCurrency(tokenPaid) }}
          </span>
        </div>
        <div class="flex justify-between py-0.5 border-b border-default last:border-b-0 border-dashed">
          <span class="text-slate-400">Receipt Status:</span>
          <span class="text-emerald-500 font-bold flex items-center gap-1">
            <PhCheck :size="10" />
            <span>Verified</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 2. Reservation Waitlist Queue -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
      <div class="flex items-center justify-between border-b border-default pb-2">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
          Reservation Waitlist Queue
        </h4>
        <span class="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">
          {{ waitlist.length }} Queued
        </span>
      </div>
      
      <div v-if="waitlist.length > 0" class="space-y-2">
        <div 
          v-for="(item, idx) in waitlist.slice(0, 3)" 
          :key="item._id || item.id"
          class="flex items-center justify-between text-[10px] bg-slate-55/30 p-2 rounded-lg"
        >
          <div class="truncate">
            <span class="font-bold text-slate-700 dark:text-slate-350">
              {{ idx + 1 }}. {{ item.leadName }}
            </span>
            <span class="text-[8px] text-slate-400 block truncate">
              Agent: {{ item.agentName }}
            </span>
          </div>
          <span class="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase" :class="item.tokenPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500'">
            {{ item.tokenPaid ? 'Token Paid' : 'No Token' }}
          </span>
        </div>
        <button 
          @click="$emit('manageQueue')"
          class="w-full text-center text-[10px] text-primary font-bold hover:underline py-1 flex items-center justify-center gap-1"
        >
          <PhLink :size="10" />
          <span>Manage Conflict Queue ➔</span>
        </button>
      </div>
      <p v-else class="text-[10px] text-slate-400 italic text-center py-2">
        Waitlist queue is empty.
      </p>
    </div>

    <!-- 3. Lead Matching Matrix -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
      <div class="flex items-center justify-between border-b border-default pb-2">
        <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
          Lead Matching Matrix
        </h4>
        <span class="text-[9px] font-bold bg-red-50 text-red-650 px-1.5 py-0.5 rounded-full border border-red-200">
          {{ hotMatches }} Hot Matches
        </span>
      </div>
      
      <div class="flex items-center justify-between text-[11px]">
        <div class="text-slate-500">
          Active Matches: <b class="text-slate-800 dark:text-slate-100 font-heading">{{ totalMatches }} Leads</b>
        </div>
        <button 
          @click="$emit('viewMatchingLeads')"
          class="text-primary hover:underline font-bold text-[10px]"
        >
          View Matches ➔
        </button>
      </div>
    </div>

    <!-- 4. Interactive Action Buttons -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-2">
      <!-- Convert to Booking / Deal -->
      <button 
        v-if="status === 'reserved' || status === 'available'"
        @click="$emit('convertToDeal')"
        class="w-full bg-primary hover:bg-opacity-95 text-white font-bold text-xs py-2 rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-1.5"
      >
        <PhHandshake :size="14" />
        <span>Convert to Booking</span>
      </button>

      <div class="grid grid-cols-2 gap-2">
        <!-- Extend Hold -->
        <button 
          v-if="status === 'reserved'"
          @click="$emit('extend')"
          class="flex items-center justify-center space-x-1 px-3 py-1.8 border border-default rounded-lg text-slate-700 hover:bg-slate-50 text-[10px] font-bold transition-all"
        >
          <PhClock :size="12" />
          <span>Extend Hold</span>
        </button>
        <!-- Release Unit -->
        <button 
          v-if="status === 'reserved' || status === 'blocked'"
          @click="$emit('release')"
          class="flex items-center justify-center space-x-1 px-3 py-1.8 border border-red-150 text-red-650 hover:bg-red-50 rounded-lg text-[10px] font-bold transition-all"
        >
          <PhLockOpen :size="12" />
          <span>Release Unit</span>
        </button>
      </div>

      <!-- Share Unit Dropdown Trigger -->
      <div class="relative pt-1">
        <button 
          @click="showShareMenu = !showShareMenu"
          class="w-full flex items-center justify-center space-x-1.5 px-3 py-2 border border-indigo-150 text-indigo-650 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 rounded-lg text-xs font-bold transition-all"
        >
          <PhExport :size="14" />
          <span>Share Property Collaterals</span>
          <span>▾</span>
        </button>
        
        <div 
          v-if="showShareMenu"
          class="absolute left-0 right-0 bottom-12 bg-surface border border-default rounded-xl shadow-xl py-1 z-35 flex flex-col text-xs"
        >
          <button @click="triggerShare('pdf')" class="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 text-left flex items-center space-x-2">
            <PhFilePdf :size="14" />
            <span>Export PDF Brochure</span>
          </button>
          <button @click="triggerShare('whatsapp')" class="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-750 dark:text-slate-350 text-left flex items-center space-x-2">
            <PhWhatsappLogo :size="14" />
            <span>Share on WhatsApp</span>
          </button>
          <button @click="triggerShare('email')" class="px-4 py-2 hover:bg-slate-55 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-750 dark:text-slate-350 text-left flex items-center space-x-2">
            <PhEnvelope :size="14" />
            <span>Share via Email</span>
          </button>
          <button @click="triggerShare('microsheet')" class="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-750 dark:text-slate-350 text-left flex items-center space-x-2 font-bold text-primary">
            <PhLink :size="14" />
            <span>Public Microsheet Link</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  PhHandshake, 
  PhClock, 
  PhLockOpen, 
  PhExport, 
  PhFilePdf, 
  PhWhatsappLogo, 
  PhEnvelope, 
  PhLink,
  PhCheck
} from '@phosphor-icons/vue';

const props = defineProps({
  status: { type: String, default: 'available' },
  tokenPaid: { type: Number, default: 0 },
  reservedLeadName: { type: String, default: 'Unknown Lead' },
  reservedAgentName: { type: String, default: 'Staff Agent' },
  waitlist: { type: Array, default: () => [] },
  totalMatches: { type: Number, default: 0 },
  hotMatches: { type: Number, default: 0 },
  timeLeftStr: { type: String, default: '24h 00m' },
  progressPercent: { type: Number, default: 100 }
});

const emit = defineEmits(['extend', 'release', 'convertToDeal', 'manageQueue', 'viewMatchingLeads', 'share']);

const showShareMenu = ref(false);

const getCountdownBarClass = computed(() => {
  if (props.progressPercent > 50) return 'bg-emerald-500';
  if (props.progressPercent > 20) return 'bg-amber-500';
  return 'bg-red-500 animate-pulse';
});

const triggerShare = (type) => {
  showShareMenu.value = false;
  emit('share', type);
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
