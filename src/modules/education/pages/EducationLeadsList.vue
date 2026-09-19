<template>
  <div class="workspace-page education-list">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-xl font-extrabold">Student leads</h1>
        <p class="text-xs text-slate-500 mt-0.5">Admission inquiries. Convert a lead into an enrolled student.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="canBulkUpload"
          @click="showBulkUpload = true"
          class="btn-sm btn-secondary h-9 text-xs font-bold gap-1.5 flex items-center hover:border-emerald-500 hover:text-emerald-600 transition-colors"
          title="Bulk Upload Student Leads from Excel (.xlsx, .csv)"
        >
          <PhFileArrowUp :size="15" weight="bold" />
          <span>Import Excel</span>
        </button>
        <button class="btn btn-primary btn-sm h-9 text-xs font-semibold" @click="openCreate">Add student lead</button>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-surface border border-default flex flex-wrap gap-2">
      <input v-model="search" type="text" placeholder="Search student lead..." class="w-full sm:w-72 bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs" @input="handleSearch" />
      <select v-model="statusFilter" class="bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs" @change="load">
        <option value="">All stages</option>
        <option value="new">New</option>
        <option value="assigned">Assigned</option>
        <option value="contacted">Contacted</option>
        <option value="follow_up">Follow Up</option>
        <option value="meeting_scheduled">Meeting Scheduled</option>
        <option value="qualified">Qualified</option>
        <option value="application_trial">Application / Trial</option>
        <option value="converted">Converted</option>
        <option value="lost">Lost</option>
        <option value="on_hold">On Hold</option>
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
          <tr v-for="row in rows" :key="row._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
            <td class="py-3 px-4">
              <router-link :to="`/app/leads/${row._id}`" class="font-bold hover:text-accent-600 transition-colors">{{ row.firstName }} {{ row.lastName }}</router-link>
              <div class="text-slate-500">{{ row.mobile }}</div>
            </td>
            <td class="py-3 px-4">{{ row.parentName || '—' }}</td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                {{ row.classInterestId?.name || '—' }}
              </span>
            </td>
            <td class="py-3 px-4 capitalize">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="row.status === 'enrolled' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'">
                {{ String(row.status || '').replace('_', ' ') }}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <button
                v-if="row.status !== 'enrolled'"
                class="btn btn-sm btn-secondary h-7 px-2.5 text-[11px] font-semibold text-accent-700 hover:bg-accent-50"
                @click="openEnroll(row)"
              >
                Enroll
              </button>
              <span v-else class="text-emerald-600 font-semibold text-xs">Enrolled</span>
            </td>
          </tr>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="5" class="py-10 text-center text-slate-500">No student leads yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Right-Side Modal Drawer: Add Student Lead -->
    <AppDrawer
      :isOpen="showModal"
      title="Add Student Lead"
      subtitle="Capture inquiry details and associate interested course or class"
      width="520px"
      @close="showModal = false"
    >
      <form id="lead-form" class="space-y-4 text-xs" @submit.prevent="save">
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
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Source
            <select v-model="form.source" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none">
              <option value="walk_in">Walk-in</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="campus">Campus</option>
              <option value="manual_entry">Manual</option>
            </select>
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Parent name
            <input v-model="form.parentName" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Parent mobile
            <input v-model="form.parentMobile" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300">Interested class
            <select v-model="form.classInterestId" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none">
              <option value="">Select class</option>
              <option v-for="c in classes" :key="c._id" :value="c._id">{{ c.name }}</option>
            </select>
          </label>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary btn-sm" @click="showModal = false">Cancel</button>
        <button type="submit" form="lead-form" class="btn btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Student Lead' }}
        </button>
      </template>
    </AppDrawer>

    <!-- Right-Side Modal Drawer: Enroll Student -->
    <AppDrawer
      :isOpen="!!enrollLead"
      :title="enrollLead ? `Enroll ${enrollLead.firstName} ${enrollLead.lastName || ''}` : 'Enroll Student'"
      subtitle="Select the batch or class to complete enrollment"
      width="440px"
      @close="enrollLead = null"
    >
      <form id="enroll-form" class="space-y-4 text-xs" @submit.prevent="enroll">
        <p v-if="error" class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900">{{ error }}</p>
        <label class="space-y-1 text-xs block font-medium text-slate-700 dark:text-slate-300">Class *
          <select v-model="enrollClassId" required class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none">
            <option value="" disabled>Select class to enroll into</option>
            <option v-for="c in classes" :key="c._id" :value="c._id">{{ c.name }} ({{ c.code }})</option>
          </select>
        </label>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary btn-sm" @click="enrollLead = null">Cancel</button>
        <button type="submit" form="enroll-form" class="btn btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Enrolling...' : 'Confirm Enrollment' }}
        </button>
      </template>
    </AppDrawer>

    <!-- Lead Bulk Upload Modal (Opens from right side) -->
    <LeadBulkUploadModal
      :isOpen="showBulkUpload"
      @close="showBulkUpload = false"
      @success="load"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { PhFileArrowUp } from '@phosphor-icons/vue';
import AppDrawer from '@/components/AppDrawer.vue';
import LeadBulkUploadModal from '@/modules/leads/components/LeadBulkUploadModal.vue';
import { createEducationLead, enrollEducationLead, fetchEducationClasses, fetchEducationLeads } from '../api/endpoints';

const store = useStore();
const isOrgAdmin = computed(() =>
  ['super_admin', 'system_admin', 'org_admin', 'organization_admin'].includes(
    String(store.getters['auth/userRole'] || '').toLowerCase()
  )
);
// Per doc §3: Classes Admin (org_admin) AND Manager can bulk upload. Representatives cannot.
const canBulkUpload = computed(() => {
  const role = String(store.getters['auth/userRole'] || '').toLowerCase();
  return ['super_admin', 'system_admin', 'org_admin', 'organization_admin', 'manager', 'branch_manager'].includes(role);
});

const showBulkUpload = ref(false);

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
  enrollClassId.value = row.classInterestId?._id || row.classInterestId || '';
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
  if (!enrollLead.value || !enrollClassId.value) return;
  saving.value = true;
  error.value = '';
  try {
    await enrollEducationLead(enrollLead.value._id, { classId: enrollClassId.value });
    enrollLead.value = null;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || 'Unable to enroll lead.';
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
