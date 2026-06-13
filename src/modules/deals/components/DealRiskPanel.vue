<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm text-xs space-y-3.5">
    <div class="flex items-center justify-between border-b border-default pb-2">
      <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
        Risk Assessment Center
      </h4>
      <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/20 border border-amber-250">
        Moderate Risk
      </span>
    </div>

    <!-- Alert List -->
    <div class="space-y-2.5">
      <!-- KYC Document Risk -->
      <div class="flex items-start space-x-2.5 bg-yellow-50/50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900/50 p-2.5 rounded-lg">
        <span class="text-sm">📄</span>
        <div class="space-y-0.5">
          <p class="font-bold text-yellow-800 dark:text-yellow-450">Co-Applicant KYC Incomplete</p>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">
            Aadhaar verification copy for co-applicant Rohan Mehta has not been uploaded yet. Required for agreement signing.
          </p>
        </div>
      </div>

      <!-- Builder Delay Risk -->
      <div class="flex items-start space-x-2.5 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900/50 p-2.5 rounded-lg">
        <span class="text-sm">🏢</span>
        <div class="space-y-0.5">
          <p class="font-bold text-orange-800 dark:text-orange-450">Builder Allotment Delay</p>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">
            Allotment Letter from Skyway Builders Group is pending draft review. Follow-up is scheduled with SPOC Amit Gupta.
          </p>
        </div>
      </div>

      <!-- Financial collection Risk -->
      <div class="flex items-start space-x-2.5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/50 p-2.5 rounded-lg">
        <span class="text-sm">💳</span>
        <div class="space-y-0.5">
          <p class="font-bold text-blue-800 dark:text-blue-450">Mortgage Sanction Pending</p>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">
            Home loan application is at bank verification stage. Tripartite contract has not been signed.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props needed for simple mock/reactive layout display
</script>
