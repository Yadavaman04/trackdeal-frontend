<template>
  <div class="space-y-6">
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Education</p>
        <h1 class="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">Admissions overview</h1>
        <p class="text-sm text-slate-500 mt-1">Student leads, enrolled students, and classes for this institute.</p>
      </div>
      <router-link to="/app/leads" class="btn btn-primary btn-sm h-9 text-xs font-semibold self-start">
        Add student lead
      </router-link>
    </header>

    <div v-if="loading" class="py-20 text-center text-sm text-slate-500">Loading education metrics...</div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 rounded-2xl bg-surface border border-default shadow-sm">
        <div class="text-[10px] uppercase font-bold text-slate-400">Student leads</div>
        <div class="text-3xl font-black mt-2">{{ summary.totalLeads || 0 }}</div>
      </div>
      <div class="p-5 rounded-2xl bg-surface border border-default shadow-sm">
        <div class="text-[10px] uppercase font-bold text-slate-400">Enrolled students</div>
        <div class="text-3xl font-black mt-2">{{ summary.totalStudents || 0 }}</div>
      </div>
      <div class="p-5 rounded-2xl bg-surface border border-default shadow-sm">
        <div class="text-[10px] uppercase font-bold text-slate-400">Classes</div>
        <div class="text-3xl font-black mt-2">{{ summary.totalClasses || 0 }}</div>
      </div>
      <div class="p-5 rounded-2xl bg-surface border border-default shadow-sm">
        <div class="text-[10px] uppercase font-bold text-slate-400">Leads enrolled</div>
        <div class="text-3xl font-black mt-2">{{ summary.enrolledLeads || 0 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { fetchEducationSummary } from '../api/endpoints';

const loading = ref(true);
const summary = ref({});

onMounted(async () => {
  try {
    const res = await fetchEducationSummary();
    summary.value = res.data || res || {};
  } catch {
    summary.value = {};
  } finally {
    loading.value = false;
  }
});
</script>
