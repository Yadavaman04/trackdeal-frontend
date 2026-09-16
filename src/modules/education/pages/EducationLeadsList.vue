<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-xl font-extrabold">Student leads</h1>
        <p class="text-xs text-slate-500 mt-0.5">Admission inquiries. Convert a lead into an enrolled student.</p>
      </div>
      <button class="btn btn-primary btn-sm h-9 text-xs font-semibold" @click="openCreate">Add student lead</button>
    </div>

    <div class="p-4 rounded-xl bg-surface border border-default flex flex-wrap gap-2">
      <input v-model="search" type="text" placeholder="Search student lead..." class="w-full sm:w-72 bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs" @input="handleSearch" />
      <select v-model="statusFilter" class="bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs" @change="load">
        <option value="">All statuses</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="counseling_scheduled">Counseling scheduled</option>
        <option value="enrolled">Enrolled</option>
        <option value="lost">Lost</option>
      </select>
    </div>

    <div class="rounded-xl bg-surface border border-default overflow-hidden">
      <table class="w-full text-left text-xs">
        <thead class="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 dark:bg-slate-900">
          <tr>
            <th class="py-3 px-4">Student</th>
            <th class="py-3 px-4">Parent</th>
            <th class="py-3 px-4">Interested class</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="row in rows" :key="row._id">
            <td class="py-3 px-4">
              <router-link :to="`/app/leads/${row._id}`" class="font-bold hover:text-indigo-600">{{ row.firstName }} {{ row.lastName }}</router-link>
              <div class="text-slate-500">{{ row.mobile }}</div>
            </td>
            <td class="py-3 px-4">{{ row.parentName || '—' }}</td>
            <td class="py-3 px-4">{{ row.classInterestId?.name || '—' }}</td>
            <td class="py-3 px-4 capitalize">{{ String(row.status || '').replace('_', ' ') }}</td>
            <td class="py-3 px-4 text-right">
              <button
                v-if="row.status !== 'enrolled'"
                class="text-indigo-600 font-semibold"
                @click="openEnroll(row)"
              >
                Enroll
              </button>
              <span v-else class="text-emerald-600 font-semibold">Enrolled</span>
            </td>
          </tr>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="5" class="py-10 text-center text-slate-500">No student leads yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" @click.self="showModal = false">
        <form class="bg-surface border border-default rounded-2xl w-full max-w-lg p-6 space-y-4" @submit.prevent="save">
          <h2 class="font-bold">Add student lead</h2>
          <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <label class="space-y-1">First name *
              <input v-model="form.firstName" required class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1">Last name
              <input v-model="form.lastName" class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1">Mobile *
              <input v-model="form.mobile" required class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1">Source
              <select v-model="form.source" class="w-full border border-default rounded-xl px-3 py-2">
                <option value="walk_in">Walk-in</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="campus">Campus</option>
                <option value="manual_entry">Manual</option>
              </select>
            </label>
            <label class="space-y-1">Parent name
              <input v-model="form.parentName" class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1">Parent mobile
              <input v-model="form.parentMobile" class="w-full border border-default rounded-xl px-3 py-2" />
            </label>
            <label class="space-y-1 col-span-2">Interested class
              <select v-model="form.classInterestId" class="w-full border border-default rounded-xl px-3 py-2">
                <option value="">Select class</option>
                <option v-for="c in classes" :key="c._id" :value="c._id">{{ c.name }}</option>
              </select>
            </label>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-secondary btn-sm" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">Save</button>
          </div>
        </form>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="enrollLead" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" @click.self="enrollLead = null">
        <form class="bg-surface border border-default rounded-2xl w-full max-w-md p-6 space-y-4" @submit.prevent="enroll">
          <h2 class="font-bold">Enroll {{ enrollLead.firstName }}</h2>
          <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
          <label class="space-y-1 text-xs block">Class *
            <select v-model="enrollClassId" required class="w-full border border-default rounded-xl px-3 py-2">
              <option v-for="c in classes" :key="c._id" :value="c._id">{{ c.name }}</option>
            </select>
          </label>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-secondary btn-sm" @click="enrollLead = null">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">Enroll student</button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { createEducationLead, enrollEducationLead, fetchEducationClasses, fetchEducationLeads } from '../api/endpoints';

const rows = ref([]);
const classes = ref([]);
const loading = ref(false);
const search = ref('');
const statusFilter = ref('');
const showModal = ref(false);
const saving = ref(false);
const error = ref('');
const form = ref({});
const enrollLead = ref(null);
const enrollClassId = ref('');
let timer = null;

async function load() {
  loading.value = true;
  try {
    const res = await fetchEducationLeads({
      search: search.value.trim() || undefined,
      status: statusFilter.value || undefined,
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
  form.value = { firstName: '', lastName: '', mobile: '', source: 'walk_in', parentName: '', parentMobile: '', classInterestId: '' };
  error.value = '';
  showModal.value = true;
}

function openEnroll(row) {
  enrollLead.value = row;
  enrollClassId.value = row.classInterestId?._id || row.classInterestId || classes.value[0]?._id || '';
  error.value = '';
}

async function save() {
  saving.value = true;
  error.value = '';
  try {
    await createEducationLead({ ...form.value, classInterestId: form.value.classInterestId || undefined });
    showModal.value = false;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || 'Unable to save lead.';
  } finally {
    saving.value = false;
  }
}

async function enroll() {
  saving.value = true;
  error.value = '';
  try {
    await enrollEducationLead(enrollLead.value._id, { classId: enrollClassId.value });
    enrollLead.value = null;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || 'Unable to enroll.';
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const res = await fetchEducationClasses({ limit: 100 });
  classes.value = res.data || [];
  await load();
});
</script>
