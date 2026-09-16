<template>
  <div class="workspace-page">
    <header class="workspace-page-header">
      <div class="workspace-page-header__copy">
        <p class="eyebrow">Education workspace</p>
        <h1 class="workspace-page-header__title">Admissions, with room to focus.</h1>
        <p class="workspace-page-header__description">A clear view of your inquiries, enrolled students, and classes.</p>
      </div>
      <router-link to="/app/leads" class="btn btn-primary btn-sm self-start sm:self-auto">
        Add student lead
      </router-link>
    </header>

    <div v-if="loading" class="workspace-panel py-20 text-center text-sm text-text-muted">Loading your admissions overview…</div>
    <div v-else class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div class="workspace-panel p-5">
        <div class="eyebrow">Student leads</div>
        <div class="mt-3 font-heading text-3xl font-bold tracking-[-0.05em] text-text-primary">{{ summary.totalLeads || 0 }}</div>
      </div>
      <div class="workspace-panel p-5">
        <div class="eyebrow">Enrolled students</div>
        <div class="mt-3 font-heading text-3xl font-bold tracking-[-0.05em] text-text-primary">{{ summary.totalStudents || 0 }}</div>
      </div>
      <div class="workspace-panel p-5">
        <div class="eyebrow">Classes</div>
        <div class="mt-3 font-heading text-3xl font-bold tracking-[-0.05em] text-text-primary">{{ summary.totalClasses || 0 }}</div>
      </div>
      <div class="workspace-panel p-5">
        <div class="eyebrow">Leads enrolled</div>
        <div class="mt-3 font-heading text-3xl font-bold tracking-[-0.05em] text-text-primary">{{ summary.enrolledLeads || 0 }}</div>
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
