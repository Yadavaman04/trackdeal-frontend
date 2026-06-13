<template>
  <AppModal
    :isOpen="isOpen"
    title="Merge Duplicate Lead Profiles"
    maxSize="680px"
    @cancel="$emit('close')"
    @confirm="handleConfirm"
  >
    <div class="space-y-4 text-xs">
      <div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 text-amber-800 dark:text-amber-400">
        <p class="text-[10px] leading-relaxed">
          Select which field attributes to keep from each profile. Confirming will update the surviving profile, migrate all scheduled follow-ups and tasks, and soft-delete the merged duplicate profile.
        </p>
      </div>

      <!-- Comparison Grid Table -->
      <div class="border border-default rounded-lg overflow-hidden bg-slate-50/50">
        <table class="min-w-full divide-y divide-default text-left">
          <thead class="bg-slate-100 text-[10px] font-heading font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th class="px-3 py-2 w-1/3">Field</th>
              <th class="px-3 py-2 w-1/3">Profile A (Keep)</th>
              <th class="px-3 py-2 w-1/3">Profile B (Keep)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default bg-surface text-slate-700">
            <!-- First Name -->
            <tr class="h-9">
              <td class="px-3 py-1.5 font-bold">First Name</td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="mergedFields.firstName" :value="leadA.firstName" />
                  <span>{{ leadA.firstName }}</span>
                </label>
              </td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="mergedFields.firstName" :value="leadB.firstName" />
                  <span>{{ leadB.firstName }}</span>
                </label>
              </td>
            </tr>

            <!-- Last Name -->
            <tr class="h-9">
              <td class="px-3 py-1.5 font-bold">Last Name</td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="mergedFields.lastName" :value="leadA.lastName || ''" />
                  <span>{{ leadA.lastName || '—' }}</span>
                </label>
              </td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="mergedFields.lastName" :value="leadB.lastName || ''" />
                  <span>{{ leadB.lastName || '—' }}</span>
                </label>
              </td>
            </tr>

            <!-- Mobile -->
            <tr class="h-9">
              <td class="px-3 py-1.5 font-bold">Mobile</td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="mergedFields.mobile" :value="leadA.mobile" />
                  <span>{{ leadA.mobile }}</span>
                </label>
              </td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="mergedFields.mobile" :value="leadB.mobile" />
                  <span>{{ leadB.mobile }}</span>
                </label>
              </td>
            </tr>

            <!-- Email -->
            <tr class="h-9">
              <td class="px-3 py-1.5 font-bold">Email</td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="mergedFields.email" :value="leadA.email || ''" />
                  <span>{{ leadA.email || '—' }}</span>
                </label>
              </td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="mergedFields.email" :value="leadB.email || ''" />
                  <span>{{ leadB.email || '—' }}</span>
                </label>
              </td>
            </tr>

            <!-- Source -->
            <tr class="h-9">
              <td class="px-3 py-1.5 font-bold">Source</td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="mergedFields.source" :value="leadA.source" />
                  <span class="capitalize">{{ leadA.source }}</span>
                </label>
              </td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="mergedFields.source" :value="leadB.source" />
                  <span class="capitalize">{{ leadB.source }}</span>
                </label>
              </td>
            </tr>

            <!-- Budget -->
            <tr class="h-9">
              <td class="px-3 py-1.5 font-bold">Budget (INR)</td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="selectedBudgetKey" value="a" />
                  <span>{{ formatBudget(leadA.requirements?.budget) }}</span>
                </label>
              </td>
              <td class="px-3 py-1.5">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="selectedBudgetKey" value="b" />
                  <span>{{ formatBudget(leadB.requirements?.budget) }}</span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <button 
        @click="$emit('close')" 
        class="px-3.5 py-2 border border-default text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
      >
        Cancel
      </button>
      <button 
        @click="handleConfirm"
        :disabled="isPending"
        class="px-3.5 py-2 text-xs font-semibold text-white bg-primary rounded-lg disabled:bg-slate-350 transition-colors flex items-center justify-center min-w-[90px]"
      >
        <span v-if="isPending">Merging...</span>
        <span v-else>Confirm Merge</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { useQueryClient } from '@tanstack/vue-query';
import apiClient from '@/api/client';
import AppModal from '@/components/AppModal.vue';
import { useUpdateLeadMutation, useAddLeadNoteMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  leadA: { type: Object, required: true },
  leadB: { type: Object, required: true }
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const queryClient = useQueryClient();
const isPending = ref(false);

const mergedFields = reactive({
  firstName: '',
  lastName: '',
  mobile: '',
  email: '',
  source: ''
});

const selectedBudgetKey = ref('a');

const initFields = () => {
  if (props.leadA && props.leadB) {
    mergedFields.firstName = props.leadA.firstName || '';
    mergedFields.lastName = props.leadA.lastName || '';
    mergedFields.mobile = props.leadA.mobile || '';
    mergedFields.email = props.leadA.email || '';
    mergedFields.source = props.leadA.source || '';
    selectedBudgetKey.value = 'a';
  }
};

watch(() => [props.leadA, props.leadB], initFields, { immediate: true });

const formatBudget = (budget) => {
  if (!budget?.min && !budget?.max) return '—';
  return `$${budget.min?.toLocaleString()} - $${budget.max?.toLocaleString()}`;
};

const { mutateAsync: updateLead } = useUpdateLeadMutation();
const { mutateAsync: addNote } = useAddLeadNoteMutation();

const handleConfirm = async () => {
  isPending.value = true;
  const idA = props.leadA._id || props.leadA.id;
  const idB = props.leadB._id || props.leadB.id;

  try {
    // 1. Fetch Lead B's tasks to migrate
    const tasksRes = await apiClient.get('/tasks', { params: { leadId: idB } });
    const tasksB = tasksRes.data?.data || [];

    // 2. Migrate Tasks to Lead A
    for (const task of tasksB) {
      await apiClient.put(`/tasks/${task._id}`, { leadId: idA });
    }

    // 3. Update Lead A with merged properties
    const chosenBudget = selectedBudgetKey.value === 'a' 
      ? props.leadA.requirements?.budget 
      : props.leadB.requirements?.budget;

    await updateLead({
      id: idA,
      ...mergedFields,
      requirements: {
        ...props.leadA.requirements,
        budget: chosenBudget
      }
    });

    // 4. Create Audit Log Note on Lead A
    await addNote({
      id: idA,
      content: `[System Audit Log] Merged duplicate Lead profile "${props.leadB.firstName} ${props.leadB.lastName || ''}" (${props.leadB.mobile}) into this profile. Tasks migrated.`,
      isPrivate: false
    });

    // 5. Delete Lead B (soft delete)
    await apiClient.delete(`/leads/${idB}`);

    store.dispatch('notifications/triggerToast', {
      message: 'Duplicate profiles merged and tasks migrated successfully.',
      type: 'success'
    });

    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['leads', idA] });

    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Error occurred during profile merge.',
      type: 'error'
    });
  } finally {
    isPending.value = false;
  }
};
</script>
