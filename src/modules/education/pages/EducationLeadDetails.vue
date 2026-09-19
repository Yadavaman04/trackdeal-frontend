<template>
  <div class="space-y-6 max-w-3xl">
    <router-link to="/app/leads" class="text-xs font-semibold text-indigo-600">← Student leads</router-link>
    <div v-if="loading" class="py-16 text-center text-sm text-slate-500">Loading lead...</div>
    <div v-else-if="lead" class="space-y-4">
      <div class="p-6 rounded-2xl bg-surface border border-default">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="font-heading text-2xl font-extrabold">{{ lead.firstName }} {{ lead.lastName }}</h1>
            <p class="text-sm text-slate-500 mt-1">{{ lead.mobile }} · {{ lead.email || 'No email' }}</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100">{{ lead.status }}</span>
        </div>
        <dl class="grid grid-cols-2 gap-4 mt-6 text-xs">
          <div>
            <dt class="text-slate-400 uppercase font-bold">Parent</dt>
            <dd class="font-semibold mt-1">{{ lead.parentName || '—' }} {{ lead.parentMobile ? `· ${lead.parentMobile}` : '' }}</dd>
          </div>
          <div>
            <dt class="text-slate-400 uppercase font-bold">Interested class</dt>
            <dd class="font-semibold mt-1">{{ lead.classInterestId?.name || 'Not selected' }}</dd>
          </div>
          <div>
            <dt class="text-slate-400 uppercase font-bold">Source</dt>
            <dd class="font-semibold mt-1 capitalize">{{ lead.source }}</dd>
          </div>
        </dl>
        <button
          v-if="lead.status !== 'enrolled'"
          class="btn btn-primary btn-sm mt-6"
          :disabled="saving"
          @click="enroll"
        >
          Enroll as student
        </button>
        <p v-else class="mt-6 text-sm text-emerald-600 font-semibold">This lead is enrolled as a student.</p>
        <p v-if="error" class="text-xs text-red-500 mt-3">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { enrollEducationLead, fetchEducationLead } from '../api/endpoints';

const route = useRoute();
const router = useRouter();
const lead = ref(null);
const loading = ref(true);
const saving = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    const res = await fetchEducationLead(route.params.id);
    lead.value = res.data || res || null;
  } finally {
    loading.value = false;
  }
});

async function enroll() {
  saving.value = true;
  error.value = '';
  try {
    await enrollEducationLead(lead.value._id, {
      classId: lead.value.classInterestId?._id || lead.value.classInterestId,
    });
    router.push('/app/students');
  } catch (err) {
    error.value = err.data?.message || err.message || 'Unable to enroll.';
  } finally {
    saving.value = false;
  }
}
</script>
