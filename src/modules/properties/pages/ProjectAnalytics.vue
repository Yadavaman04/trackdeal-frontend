<template>
  <div v-if="isLoading" class="animate-pulse space-y-6">
    <div class="h-10 bg-slate-200 dark:bg-slate-850 rounded w-1/4"></div>
    <div class="h-64 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
  </div>

  <div v-else-if="project" class="space-y-6">
    <!-- Back link -->
    <div>
      <router-link :to="`/app/projects/${route.params.id}`" class="text-xs font-bold text-primary hover:underline flex items-center space-x-1">
        <span>←</span> <span>Back to Project Overview</span>
      </router-link>
    </div>

    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">
          {{ project.name }} - Sales Intelligence
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Occupancy timelines, revenue audits, and reservation analytics dashboards.
        </p>
      </div>

      <div class="flex items-center space-x-2 shrink-0 text-xs">
        <label class="text-[10px] font-bold text-slate-450 uppercase">Timeline Scope:</label>
        <select class="bg-surface border border-default rounded-lg px-2.5 py-1.5 outline-none font-semibold">
          <option>Year to Date (YTD)</option>
          <option>Last 12 Months</option>
          <option>This Quarter</option>
        </select>
      </div>
    </div>

    <!-- Analytics Dashboard widgets -->
    <ProjectAnalyticsCard 
      :units="unitsList"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectQuery } from '../queries';
import apiClient from '@/api/client';
import ProjectAnalyticsCard from '../components/ProjectAnalyticsCard.vue';

const route = useRoute();
const { data: projectData, isLoading } = useProjectQuery(route.params.id);
const project = computed(() => projectData.value?.data || null);

const unitsList = ref([]);

const loadUnits = async () => {
  try {
    const res = await apiClient.get('/projects/units', {
      params: { projectId: route.params.id }
    });
    unitsList.value = res.data?.data || [];
  } catch (error) {
    console.error('Failed to load project units for analytics:', error);
  }
};

onMounted(() => {
  loadUnits();
});
</script>
