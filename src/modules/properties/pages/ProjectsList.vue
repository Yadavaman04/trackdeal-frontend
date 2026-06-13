<template>
  <div class="space-y-6">
    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">Projects Directory</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Directory of development projects partner-represented by the sales organization.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button 
          @click="isCreateOpen = true"
          class="btn btn-sm btn-primary"
        >
          + Add Project
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="flex-grow relative flex items-center">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by project name, builder, locality..."
            class="w-full bg-slate-55/35 border border-default rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary"
          />
          <PhMagnifyingGlass :size="14" class="absolute left-2.5 top-2.5 text-slate-400" />
        </div>

        <select v-model="filterStatus" class="bg-surface border border-default rounded-lg px-3 py-1.5 text-xs outline-none">
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="under_construction">Under Construction</option>
          <option value="ready_to_move">Ready to Move</option>
          <option value="sold_out">Sold Out</option>
        </select>
      </div>
    </div>

    <!-- Projects Table Grid -->
    <div v-if="isLoading" class="animate-pulse space-y-4">
      <div class="h-64 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
    </div>

    <div v-else class="bg-surface border border-default rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-900 border-b border-default text-slate-450 uppercase font-bold text-[10px] tracking-wider">
              <th class="p-4">Project Name</th>
              <th class="p-4">Builder</th>
              <th class="p-4">Locality / City</th>
              <th class="p-4 text-center">Total Units</th>
              <th class="p-4 text-center">Available</th>
              <th class="p-4 text-center">Reserved</th>
              <th class="p-4 text-center">Sold</th>
              <th class="p-4">RERA Registration</th>
              <th class="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default text-slate-655 font-medium">
            <tr v-for="proj in filteredProjects" :key="proj._id || proj.id" class="hover:bg-slate-50/40">
              <td class="p-4">
                <router-link 
                  :to="`/app/projects/${proj._id || proj.id}`" 
                  class="font-bold text-primary hover:underline text-sm"
                >
                  {{ proj.name }}
                </router-link>
                <span class="text-[9px] text-slate-400 block font-mono">{{ proj.code }}</span>
              </td>
              <td class="p-4">
                <span v-if="proj.builderId" class="text-slate-800 dark:text-slate-200 font-semibold">
                  {{ proj.builderId.name }}
                </span>
                <span v-else class="text-slate-400 italic">—</span>
              </td>
              <td class="p-4">
                <span>{{ proj.locality || '—' }}</span>
                <span class="text-slate-400 block text-[10px]">{{ proj.city }}</span>
              </td>
              <td class="p-4 text-center font-bold text-slate-700 dark:text-slate-350">
                {{ projectUnitsStats[proj._id || proj.id]?.total || 0 }}
              </td>
              <td class="p-4 text-center font-bold text-emerald-600">
                {{ projectUnitsStats[proj._id || proj.id]?.available || 0 }}
              </td>
              <td class="p-4 text-center font-bold text-amber-500">
                {{ projectUnitsStats[proj._id || proj.id]?.reserved || 0 }}
              </td>
              <td class="p-4 text-center font-bold text-red-650">
                {{ projectUnitsStats[proj._id || proj.id]?.sold || 0 }}
              </td>
              <td class="p-4">
                <div v-if="proj.rera" class="flex items-center space-x-1.5">
                  <span class="bg-indigo-50 border border-indigo-200 text-indigo-750 dark:bg-indigo-950/20 dark:border-indigo-900 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold">
                    {{ proj.rera }}
                  </span>
                  <button @click="copyRera(proj.rera)" class="text-[9px] opacity-60 hover:opacity-100 text-primary" title="Copy RERA ID">
                    <PhCopy :size="12" />
                  </button>
                </div>
                <span v-else class="text-slate-400 italic">—</span>
              </td>
              <td class="p-4 text-center space-x-3">
                <router-link 
                  :to="`/app/projects/${proj._id || proj.id}`" 
                  class="text-primary hover:underline font-bold"
                >
                  View
                </router-link>
                <button 
                  @click="openEditProject(proj)" 
                  class="text-indigo-600 hover:underline font-bold"
                >
                  Edit
                </button>
              </td>
            </tr>
            <tr v-if="filteredProjects.length === 0">
              <td colspan="9" class="text-center py-12 text-slate-450 italic">
                No developmental projects registered. Click "+ Add Project" to create.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Project Drawer Modal -->
    <AppDrawer 
      :isOpen="isCreateOpen" 
      :title="isEditMode ? 'Edit Project Details' : 'Create New Project'" 
      width="480px"
      @close="closeDrawer"
    >
      <form @submit.prevent="handleSaveProject" class="space-y-4 text-xs">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project Name *</label>
          <input 
            v-model="newProj.name" 
            type="text" 
            placeholder="e.g. Prestige Heights"
            class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
            required
          />
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project Short Code *</label>
            <input 
              v-model="newProj.code" 
              type="text" 
              placeholder="e.g. PRESTIGE"
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary uppercase"
              :disabled="isEditMode"
              required
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Builder Developer *</label>
            <select 
              v-model="newProj.builderId" 
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
              required
            >
              <option value="">Select Builder</option>
              <option v-for="b in builders" :key="b._id" :value="b._id">
                {{ b.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">RERA Registration ID</label>
            <input 
              v-model="newProj.rera" 
              type="text" 
              placeholder="e.g. PRM/KA/RERA/1258"
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Construction Status</label>
            <select 
              v-model="newProj.status" 
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
            >
              <option value="upcoming">Upcoming</option>
              <option value="under_construction">Under Construction</option>
              <option value="ready_to_move">Ready to Move</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">City *</label>
            <input 
              v-model="newProj.city" 
              type="text" 
              placeholder="e.g. Mumbai"
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Locality</label>
            <input 
              v-model="newProj.locality" 
              type="text" 
              placeholder="Whitefield"
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Address Coordinates</label>
          <textarea 
            v-model="newProj.address" 
            rows="2"
            class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary resize-none"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button @click="closeDrawer" class="btn-md btn-secondary">Cancel</button>
        <button @click="handleSaveProject" :disabled="isSaving" class="btn-md btn-primary">
          {{ isSaving ? 'Saving...' : 'Save Project' }}
        </button>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { PhMagnifyingGlass, PhCopy } from '@phosphor-icons/vue';
import { useProjectsQuery, useUnitsQuery, useCreateProjectMutation, useUpdateProjectMutation } from '../queries';
import apiClient from '@/api/client';
import AppDrawer from '@/components/AppDrawer.vue';

const store = useStore();

const searchQuery = ref('');
const filterStatus = ref('');
const isCreateOpen = ref(false);
const isSaving = ref(false);
const isEditMode = ref(false);
const editingProjectId = ref(null);

const newProj = ref({
  name: '',
  code: '',
  builderId: '',
  city: '',
  locality: '',
  address: '',
  rera: '',
  status: 'upcoming'
});

const builders = ref([]);

const { data: projectsData, isLoading, refetch } = useProjectsQuery();
const { data: unitsData } = useUnitsQuery();

const projectsList = computed(() => projectsData.value?.data || []);
const unitsList = computed(() => unitsData.value?.data || []);

const filteredProjects = computed(() => {
  return projectsList.value.filter(item => {
    const matchesSearch = !searchQuery.value ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (item.locality || '').toLowerCase().includes(searchQuery.value.toLowerCase());
      
    const matchesStatus = !filterStatus.value || item.status === filterStatus.value;
    return matchesSearch && matchesStatus;
  });
});

const projectUnitsStats = computed(() => {
  const stats = {};
  projectsList.value.forEach(p => {
    stats[p._id || p.id] = {
      total: 0,
      available: 0,
      reserved: 0,
      sold: 0
    };
  });
  
  unitsList.value.forEach(u => {
    const projId = u.projectId?._id || u.projectId;
    if (projId && stats[projId]) {
      stats[projId].total++;
      if (u.availability === 'available') {
        stats[projId].available++;
      } else if (u.availability === 'reserved') {
        stats[projId].reserved++;
      } else if (u.availability === 'sold') {
        stats[projId].sold++;
      }
    }
  });
  
  return stats;
});

const loadBuilders = async () => {
  try {
    const res = await apiClient.get('/projects/builders');
    builders.value = res.data?.data || [];
  } catch (error) {
    console.error('Failed to load builders list for project creation:', error);
  }
};

onMounted(loadBuilders);

const { mutateAsync: createProject } = useCreateProjectMutation();
const { mutateAsync: updateProject } = useUpdateProjectMutation();

const openEditProject = (proj) => {
  isEditMode.value = true;
  editingProjectId.value = proj._id || proj.id;
  newProj.value = {
    name: proj.name,
    code: proj.code,
    builderId: proj.builderId?._id || proj.builderId,
    city: proj.city,
    locality: proj.locality || '',
    address: proj.address || '',
    rera: proj.rera || '',
    status: proj.status || 'upcoming'
  };
  isCreateOpen.value = true;
};

const closeDrawer = () => {
  isCreateOpen.value = false;
  isEditMode.value = false;
  editingProjectId.value = null;
  newProj.value = {
    name: '',
    code: '',
    builderId: '',
    city: '',
    locality: '',
    address: '',
    rera: '',
    status: 'upcoming'
  };
};

const handleSaveProject = async () => {
  if (!newProj.value.name || !newProj.value.builderId) return;
  isSaving.value = true;
  try {
    if (isEditMode.value) {
      const { code, ...updatePayload } = newProj.value;
      await updateProject({
        id: editingProjectId.value,
        ...updatePayload
      });
      
      store.dispatch('notifications/triggerToast', {
        message: 'Project details updated successfully.',
        type: 'success'
      });
    } else {
      await createProject({
        ...newProj.value
      });
      
      store.dispatch('notifications/triggerToast', {
        message: 'New development project added successfully.',
        type: 'success'
      });
    }
    
    closeDrawer();
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: err.response?.data?.message || 'Failed to save project.',
      type: 'error'
    });
  } finally {
    isSaving.value = false;
  }
};

const copyRera = (reraId) => {
  if (!reraId) return;
  navigator.clipboard.writeText(reraId);
  store.dispatch('notifications/triggerToast', {
    message: 'RERA Registration ID copied to clipboard.',
    type: 'success'
  });
};
</script>
