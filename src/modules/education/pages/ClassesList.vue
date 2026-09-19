<template>
  <div class="workspace-page education-list">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-xl font-extrabold">Classes</h1>
        <p class="text-xs text-slate-500 mt-0.5">Batches and courses this institute offers.</p>
      </div>
      <button class="btn btn-primary btn-sm h-9 text-xs font-semibold" @click="openCreate">Add class</button>
    </div>

    <div class="p-4 rounded-xl bg-surface border border-default">
      <input v-model="search" type="text" placeholder="Search class, subject, grade..." class="w-full sm:w-72 bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs" @input="handleSearch" />
    </div>

    <div class="rounded-xl bg-surface border border-default overflow-hidden">
      <table class="w-full text-left text-xs">
        <thead class="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 dark:bg-slate-900">
          <tr>
            <th class="py-3 px-4">Class</th>
            <th class="py-3 px-4">Subject / Grade</th>
            <th class="py-3 px-4">Fees</th>
            <th class="py-3 px-4">Capacity</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="row in rows" :key="row._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
            <td class="py-3 px-4 font-bold">{{ row.name }} <span class="text-slate-400 font-mono text-[10px]">{{ row.code }}</span></td>
            <td class="py-3 px-4">{{ row.subject || '—' }} / {{ row.grade || '—' }}</td>
            <td class="py-3 px-4 font-semibold">₹{{ Number(row.fees || 0).toLocaleString('en-IN') }}</td>
            <td class="py-3 px-4">{{ row.capacity || 0 }}</td>
            <td class="py-3 px-4 capitalize">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="row.status === 'upcoming' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'">
                {{ row.status }}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <button
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/40 transition-colors"
                title="Edit class"
                aria-label="Edit class"
                @click="openEdit(row)"
              >
                <PhPencilSimple :size="16" weight="bold" />
              </button>
            </td>
          </tr>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="6" class="py-10 text-center text-slate-500">No classes yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Right-Side Modal Drawer -->
    <AppDrawer
      :isOpen="showModal"
      :title="editing ? 'Edit Class' : 'Create Class'"
      :subtitle="editing ? 'Update class and batch information' : 'Create a new batch or course offering'"
      width="520px"
      @close="showModal = false"
    >
      <form id="class-form" class="space-y-4 text-xs" @submit.prevent="save">
        <p v-if="error" class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900">{{ error }}</p>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <label class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300">Name *
            <input v-model="form.name" required class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Code
            <input v-model="form.code" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Subject
            <input v-model="form.subject" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Grade
            <input v-model="form.grade" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Fees (₹)
            <input v-model="form.fees" type="number" min="0" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Capacity
            <input v-model="form.capacity" type="number" min="1" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Instructor
            <input v-model="form.instructorName" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300">Schedule
            <input v-model="form.schedule" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary btn-sm" @click="showModal = false">Cancel</button>
        <button type="submit" form="class-form" class="btn btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Class' }}
        </button>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { PhPencilSimple } from '@phosphor-icons/vue';
import AppDrawer from '@/components/AppDrawer.vue';
import { createEducationClass, fetchEducationClasses, updateEducationClass } from '../api/endpoints';

const rows = ref([]);
const loading = ref(false);
const search = ref('');
const showModal = ref(false);
const saving = ref(false);
const error = ref('');
const editing = ref(null);
const form = ref({});
let timer = null;

function blank() {
  return { name: '', code: '', subject: '', grade: '', fees: 0, capacity: 30, instructorName: '', schedule: '', status: 'upcoming' };
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchEducationClasses({ search: search.value.trim() || undefined, limit: 50 });
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
  editing.value = null;
  form.value = blank();
  error.value = '';
  showModal.value = true;
}

function openEdit(row) {
  editing.value = row;
  form.value = { ...blank(), ...row };
  error.value = '';
  showModal.value = true;
}

async function save() {
  saving.value = true;
  error.value = '';
  try {
    if (editing.value) await updateEducationClass(editing.value._id, form.value);
    else await createEducationClass(form.value);
    showModal.value = false;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || 'Unable to save class.';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>
