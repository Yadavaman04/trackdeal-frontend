<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-default pb-2">
      <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
        Builder Coordination Center
      </h4>
      <span class="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
        SPOC Active
      </span>
    </div>

    <!-- SPOC Profile details -->
    <div class="space-y-1 bg-slate-50/50 dark:bg-slate-900 p-2.5 rounded-lg border border-default">
      <p class="font-bold text-slate-700 dark:text-slate-350">Amit Gupta (Manager SPOC)</p>
      <p class="text-[9px] text-slate-450 uppercase font-bold">Skyway Builders Group</p>
      <div class="flex items-center justify-between pt-1 text-[10px] text-slate-500">
        <span>📞 +91 99887 76655</span>
        <span>✉️ amit.gupta@skyway.com</span>
      </div>
    </div>

    <!-- Milestone Checklist checkpoints -->
    <div class="space-y-2.5">
      <h5 class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Milestone Status</h5>
      
      <div class="space-y-2 text-[10px]">
        <div class="flex justify-between items-center py-1 border-b border-default border-dashed">
          <span class="text-slate-650">Allotment Letter:</span>
          <span class="text-emerald-500 font-bold">✓ Received (10 Jun)</span>
        </div>
        <div class="flex justify-between items-center py-1 border-b border-default border-dashed">
          <span class="text-slate-655">Agreement Draft:</span>
          <span class="text-amber-500 font-bold">⏰ Pending Draft Approval</span>
        </div>
        <div class="flex justify-between items-center py-1 border-b border-default border-dashed">
          <span class="text-slate-655">Registration Slot:</span>
          <span class="text-slate-450 italic">Pending Agreement Signing</span>
        </div>
      </div>
    </div>

    <!-- Contact timelines -->
    <div class="space-y-1 text-[9px] text-slate-450 border-t border-dashed border-default pt-3">
      <p>Last Contact: <b>2 days ago (Email Sent)</b></p>
      <p>Next Follow-up: <b>Tomorrow, 11:30 AM (Follow-up Call)</b></p>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-2 gap-2 pt-1.5 shrink-0">
      <button 
        @click="logContact"
        class="flex items-center justify-center space-x-1 border border-default hover:bg-slate-50 text-[10px] font-bold py-1.5 rounded-lg text-slate-700"
      >
        <span>⚡</span> <span>Log Contact</span>
      </button>
      <button 
        @click="scheduleSync"
        class="flex items-center justify-center space-x-1 border border-default hover:bg-slate-50 text-[10px] font-bold py-1.5 rounded-lg text-slate-700"
      >
        <span>📅</span> <span>Schedule Sync</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';

const store = useStore();

const logContact = () => {
  store.dispatch('notifications/triggerToast', {
    message: 'Outreach contact logged with developer SPOC.',
    type: 'success'
  });
};

const scheduleSync = () => {
  store.dispatch('notifications/triggerToast', {
    message: 'Developer synchronization meeting scheduled.',
    type: 'success'
  });
};
</script>
