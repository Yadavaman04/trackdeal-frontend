<template>
  <div class="workspace-page education-list">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-xl font-extrabold">Students</h1>
        <p class="text-xs text-slate-500 mt-0.5">Enrolled students mapped to classes.</p>
      </div>
      <button class="btn btn-primary btn-sm h-9 text-xs font-semibold" @click="openCreate">Add student</button>
    </div>

    <div class="p-4 rounded-xl bg-surface border border-default flex flex-wrap gap-2">
      <input v-model="search" type="text" placeholder="Search student or parent..." class="w-full sm:w-72 bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs" @input="handleSearch" />
      <select v-model="classFilter" class="bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs" @change="load">
        <option value="">All classes</option>
        <option v-for="c in classes" :key="c._id" :value="c._id">{{ c.name }}</option>
      </select>
    </div>

    <div class="rounded-xl bg-surface border border-default overflow-hidden">
      <table class="w-full text-left text-xs">
        <thead class="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 dark:bg-slate-900">
          <tr>
            <th class="py-3 px-4">Student</th>
            <th class="py-3 px-4">Parent</th>
            <th class="py-3 px-4">Class</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4">Enrolled</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="row in rows" :key="row._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
            <td class="py-3 px-4">
              <div class="font-bold">{{ row.firstName }} {{ row.lastName }}</div>
              <div class="text-slate-500">{{ row.mobile }}</div>
            </td>
            <td class="py-3 px-4">{{ row.parentName || '—' }} <span class="text-slate-400">{{ row.parentMobile }}</span></td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                {{ row.classId?.name || 'Unassigned' }}
              </span>
            </td>
            <td class="py-3 px-4 capitalize">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                {{ row.status }}
              </span>
            </td>
            <td class="py-3 px-4">{{ formatDate(row.enrollmentDate) }}</td>
          </tr>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="5" class="py-10 text-center text-slate-500">No students enrolled yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Right-Side Modal Drawer -->
    <AppDrawer
      :isOpen="showModal"
      title="Add Student"
      subtitle="Enroll a new student and associate class details"
      width="520px"
      @close="showModal = false"
    >
      <form id="student-form" class="space-y-4 text-xs" @submit.prevent="save">
        <p v-if="error" class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900">{{ error }}</p>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">First name *
            <input v-model="form.firstName" required class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Last name
            <input v-model="form.lastName" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Mobile *
            <input v-model="form.mobile" required class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Email
            <input v-model="form.email" type="email" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Parent name
            <input v-model="form.parentName" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Parent mobile
            <input v-model="form.parentMobile" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300">Class
            <select v-model="form.classId" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none">
              <option value="">Unassigned</option>
              <option v-for="c in classes" :key="c._id" :value="c._id">{{ c.name }}</option>
            </select>
          </label>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary btn-sm" @click="showModal = false">Cancel</button>
        <button type="submit" form="student-form" class="btn btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Saving...' : 'Enroll Student' }}
        </button>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import AppDrawer from '@/components/AppDrawer.vue';
import { createEducationStudent, fetchEducationClasses, fetchEducationStudents } from '../api/endpoints';

const rows = ref([]);
const classes = ref([]);
const loading = ref(false);
const search = ref('');
const classFilter = ref('');
const showModal = ref(false);
const saving = ref(false);
const error = ref('');
const form = ref({});
let timer = null;

async function load() {
  loading.value = true;
  try {
    const res = await fetchEducationStudents({
      search: search.value.trim() || undefined,
      classId: classFilter.value || undefined,
      limit: 50,
    });
    rows.value = res.data || [];
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  clearTimeout(timer);
  timer = setTimeout(load, 300);
}

function openCreate() {
  form.value = { firstName: '', lastName: '', mobile: '', email: '', parentName: '', parentMobile: '', classId: '' };
  error.value = '';
  showModal.value = true;
}

async function save() {
  saving.value = true;
  error.value = '';
  try {
    await createEducationStudent({ ...form.value, classId: form.value.classId || undefined });
    showModal.value = false;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || 'Unable to save student.';
  } finally {
    saving.value = false;
  }
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

onMounted(async () => {
  const res = await fetchEducationClasses({ limit: 100 });
  classes.value = res.data || [];
  await load();
});
</script>
