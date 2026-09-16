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
          <tr v-for="row in rows" :key="row._id">
            <td class="py-3 px-4 font-bold">{{ row.name }} <span class="text-slate-400 font-mono">{{ row.code }}</span></td>
            <td class="py-3 px-4">{{ row.subject || '—' }} / {{ row.grade || '—' }}</td>
            <td class="py-3 px-4">₹{{ row.fees || 0 }}</td>
            <td class="py-3 px-4">{{ row.capacity || 0 }}</td>
            <td class="py-3 px-4 capitalize">{{ row.status }}</td>
            <td class="py-3 px-4 text-right">
              <button class="text-indigo-600 font-semibold" @click="openEdit(row)">Edit</button>
            </td>
          </tr>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="6" class="py-10 text-center text-slate-500">No classes yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="workspace-dialog-backdrop fixed inset-0 z-[200] flex items-center justify-center p-4" @click.self="showModal = false">
        <form class="workspace-dialog bg-surface border border-default rounded-xl w-full max-w-lg p-6 space-y-4" @submit.prevent="save">
          <h2 class="font-bold">{{ editing ? 'Edit class' : 'Create class' }}</h2>
          <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <label class="space-y-1 col-span-2">Name *
              <input v-model="form.name" required class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1">Code
              <input v-model="form.code" class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1">Subject
              <input v-model="form.subject" class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1">Grade
              <input v-model="form.grade" class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1">Fees
              <input v-model="form.fees" type="number" min="0" class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1">Capacity
              <input v-model="form.capacity" type="number" min="1" class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1">Instructor
              <input v-model="form.instructorName" class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1 col-span-2">Schedule
              <input v-model="form.schedule" class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-secondary btn-sm" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">Save</button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
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
