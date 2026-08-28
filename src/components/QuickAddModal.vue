<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" @click.self="close">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all text-xs">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span class="p-1 rounded-lg bg-indigo-500/10 text-indigo-600">⚡</span>
            <span>Quick Create Action</span>
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">Select what you would like to add to TrackDeal</p>
        </div>
        <button @click="close" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>

      <div class="p-4 grid grid-cols-1 gap-2.5">
        <router-link 
          to="/app/leads"
          @click="close"
          class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between group"
        >
          <div class="flex items-center gap-3">
            <span class="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 text-base">👤</span>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 text-xs">New Lead / Customer Enquiry</h4>
              <p class="text-[10px] text-slate-400">Capture buyer requirements, budget, & loan info</p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-indigo-600 font-bold text-sm">→</span>
        </router-link>

        <router-link 
          to="/app/properties"
          @click="close"
          class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between group"
        >
          <div class="flex items-center gap-3">
            <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-base">🏢</span>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 text-xs">Add Property / Inventory</h4>
              <p class="text-[10px] text-slate-400">Add apartment unit, villa, plot, or commercial space</p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-indigo-600 font-bold text-sm">→</span>
        </router-link>

        <router-link 
          to="/app/tasks"
          @click="close"
          class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between group"
        >
          <div class="flex items-center gap-3">
            <span class="p-2 rounded-xl bg-amber-500/10 text-amber-600 text-base">📋</span>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 text-xs">Create Task / Reminder</h4>
              <p class="text-[10px] text-slate-400">Schedule follow-up call, client visit, or internal task</p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-indigo-600 font-bold text-sm">→</span>
        </router-link>

        <router-link 
          to="/app/loans"
          @click="close"
          class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between group"
        >
          <div class="flex items-center gap-3">
            <span class="p-2 rounded-xl bg-blue-500/10 text-blue-600 text-base">🏦</span>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 text-xs">Home Loan Application</h4>
              <p class="text-[10px] text-slate-400">Manage bank submissions, sanctions & disbursements</p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-indigo-600 font-bold text-sm">→</span>
        </router-link>

        <router-link 
          to="/app/agreements/new"
          @click="close"
          class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between group"
        >
          <div class="flex items-center gap-3">
            <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-base">📜</span>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 text-xs">Create Property Agreement</h4>
              <p class="text-[10px] text-slate-400">Generate sale deed, resale, or rental agreement</p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-indigo-600 font-bold text-sm">→</span>
        </router-link>

        <router-link 
          to="/app/commissions"
          @click="close"
          class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between group"
        >
          <div class="flex items-center gap-3">
            <span class="p-2 rounded-xl bg-purple-500/10 text-purple-600 text-base">💳</span>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 text-xs">Record Commission Payment</h4>
              <p class="text-[10px] text-slate-400">Log partial payment, UTR reference, TDS withholding</p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-indigo-600 font-bold text-sm">→</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

function close() {
  emit('close');
}
</script>
