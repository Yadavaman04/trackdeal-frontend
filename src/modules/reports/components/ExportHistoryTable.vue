<template>
  <div class="bg-surface border border-default rounded-xl overflow-hidden shadow-sm text-xs">
    <div class="px-4 py-3 border-b border-default bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
      <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">
        Export & Extraction Logs
      </h4>
      <span class="text-[9px] font-bold text-slate-450 uppercase">Data Refresh Live</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-xs text-left">
        <thead>
          <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
            <th class="py-2.5 px-4">Job ID</th>
            <th class="py-2.5 px-4">Report Details</th>
            <th class="py-2.5 px-4">Format</th>
            <th class="py-2.5 px-4">Requested By</th>
            <th class="py-2.5 px-4 text-center">Status</th>
            <th class="py-2.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default text-slate-655 font-medium">
          <tr v-for="job in jobs" :key="job.id">
            <td class="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-350">{{ job.id }}</td>
            <td class="py-3 px-4">
              <p class="font-bold text-slate-800 dark:text-slate-200 capitalize">{{ job.reportType }} Report</p>
              <p class="text-[9px] text-slate-400 mt-0.5">Parameters: {{ job.startDate }} to {{ job.endDate }}</p>
            </td>
            <td class="py-3 px-4 uppercase font-bold text-indigo-650">{{ job.format }}</td>
            <td class="py-3 px-4 text-slate-500">{{ job.requestedBy }}</td>
            <td class="py-3 px-4 text-center">
              <div class="flex flex-col items-center space-y-1" v-if="job.status === 'processing'">
                <span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-50 text-amber-700">● {{ job.status }}</span>
                <!-- Progress bar -->
                <div class="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                  <div class="bg-amber-500 h-full rounded-full animate-pulse" :style="{ width: '60%' }"></div>
                </div>
              </div>
              <span 
                v-else
                class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                :class="job.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'"
              >
                ● {{ job.status }}
              </span>
            </td>
            <td class="py-3 px-4 text-right shrink-0">
              <button 
                v-if="job.status === 'completed'"
                @click="downloadJob(job)"
                class="btn btn-sm btn-ghost text-primary text-[10px] h-6 px-2 gap-1 font-bold"
              >
                <PhDownload :size="12" />
                <span>Download</span>
              </button>
              <span v-else-if="job.status === 'processing'" class="text-slate-400 italic text-[10px]">Polling...</span>
              <span v-else class="text-slate-455 italic text-[10px]">Failed</span>
            </td>
          </tr>

          <tr v-if="jobs.length === 0">
            <td colspan="6" class="text-center py-8 text-slate-450 italic">No export job requests logged.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { PhDownload } from '@phosphor-icons/vue';

const props = defineProps({
  jobs: { type: Array, required: true }
});

const emit = defineEmits(['download']);

const downloadJob = (job) => {
  emit('download', job);
};
</script>
