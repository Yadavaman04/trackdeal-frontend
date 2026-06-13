<template>
  <div class="space-y-6">
    <!-- Reports Subheader containing Date range toggles and export shortcuts -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800">
          Analytics & Custom Reporting
        </h2>
        <p class="text-xs text-slate-500">
          Monitor conversion pipelines, forecasts, collections, and team performance metrics.
        </p>
      </div>

      <!-- Quick reporting controls -->
      <div class="flex items-center space-x-2 shrink-0">
        <select 
          v-model="activeReportRange" 
          class="input-field text-caption text-neutral-900 w-44 font-medium"
        >
          <option value="mtd">Month to Date (MTD)</option>
          <option value="ytd">Year to Date (YTD)</option>
          <option value="last30">Last 30 Days</option>
          <option value="custom">Custom Date Range</option>
        </select>
        <button class="btn btn-primary btn-sm h-9 text-xs font-semibold px-3">
          <PhBookmark class="w-3.5 h-3.5" />
          <span>Save Custom Layout</span>
        </button>
      </div>
    </div>

    <!-- Active Report Page -->
    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PhBookmark } from '@phosphor-icons/vue';

const activeReportRange = ref('mtd');
</script>

