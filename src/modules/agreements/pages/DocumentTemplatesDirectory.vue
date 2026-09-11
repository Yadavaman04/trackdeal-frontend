<template>
  <div class="space-y-6 pb-16 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-2.5">
        <router-link to="/app/agreements" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <PhArrowLeft :size="18" />
        </router-link>
        <div>
          <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Legal Document Templates Master</h1>
          <p class="text-xs text-slate-500 mt-0.5">Master repository of standard clauses, recitals, and placeholder architectures</p>
        </div>
      </div>
    </div>

    <!-- Templates Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="tpl in templates"
        :key="tpl._id"
        class="bg-surface border border-default rounded-3xl p-5 shadow-sm space-y-4 hover:border-primary-300 dark:hover:border-primary-700 transition"
      >
        <div class="flex items-start justify-between">
          <div class="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950 text-primary-600 flex items-center justify-center">
            <PhScroll :size="22" weight="duotone" />
          </div>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            v{{ tpl.version || '1.0' }}
          </span>
        </div>

        <div>
          <h3 class="font-bold text-slate-900 dark:text-white text-sm">{{ tpl.name }}</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ tpl.description }}</p>
        </div>

        <div class="pt-3 border-t border-default/60 flex items-center justify-between text-xs">
          <span class="text-slate-400">{{ tpl.clauses?.length || 0 }} Standard Clauses</span>
          <router-link
            to="/app/agreements/new"
            class="font-bold text-primary-600 hover:underline flex items-center gap-1"
          >
            Use Template →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { PhArrowLeft, PhScroll } from '@phosphor-icons/vue';
import apiClient from '@/api/client';

const templates = ref([]);

onMounted(async () => {
  try {
    const res = await apiClient.get('/agreements/templates');
    templates.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to load templates:', err);
  }
});
</script>
