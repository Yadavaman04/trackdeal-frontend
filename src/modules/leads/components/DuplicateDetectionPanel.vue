<template>
  <div 
    v-if="duplicates.length > 0" 
    class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-xs"
  >
    <div class="flex items-center space-x-2 text-red-700 dark:text-red-400 font-bold mb-1.5">
      <span>⚠️ Duplicate Records Detected</span>
    </div>
    <p class="text-[10px] text-red-600 dark:text-red-400 mb-2">
      Profiles matching this name, mobile, or email already exist in the system:
    </p>
    <ul class="space-y-1">
      <li 
        v-for="lead in duplicates" 
        :key="lead.id || lead._id"
        class="flex items-center justify-between bg-surface dark:bg-slate-900 p-2 rounded border border-red-100 dark:border-red-950/60"
      >
        <div>
          <span class="font-bold text-slate-800 dark:text-slate-200">
            {{ lead.firstName }} {{ lead.lastName || '' }}
          </span>
          <span class="text-[10px] text-slate-400 dark:text-slate-500 block">
            {{ lead.mobile }} • {{ lead.email || 'No email' }}
          </span>
        </div>
        <div class="flex items-center space-x-1.5 shrink-0">
          <button 
            type="button"
            @click="$emit('merge', lead)"
            class="text-[10px] bg-amber-550 hover:bg-amber-600 text-white px-2 py-1 rounded font-semibold transition-colors"
          >
            Merge ➔
          </button>
          <router-link 
            :to="`/app/leads/${lead.id || lead._id}`" 
            class="text-[10px] bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 px-2 py-1 rounded hover:underline font-semibold"
          >
            View
          </router-link>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useLeadsQuery } from '../queries';

const props = defineProps({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  mobile: { type: String, default: '' },
  email: { type: String, default: '' }
});

const emit = defineEmits(['merge']);

const duplicates = ref([]);
const searchQuery = ref('');

// Dynamic hook execution
const { data: searchResults, refetch } = useLeadsQuery({ search: searchQuery });

let debounceTimeout = null;

const runDuplicateCheck = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(async () => {
    // Clear duplicates if inputs are empty
    if (!props.mobile && !props.email && !props.firstName) {
      duplicates.value = [];
      return;
    }

    // Set search parameter to look up duplicates
    const searchVal = props.mobile || props.email || `${props.firstName} ${props.lastName}`.trim();
    if (searchVal.length < 3) {
      duplicates.value = [];
      return;
    }

    searchQuery.value = searchVal;
    
    // Refetch the query
    const res = await refetch();
    if (res.data?.data) {
      // Filter results to check exact duplicate conditions
      duplicates.value = res.data.data.filter(lead => {
        const matchesMobile = props.mobile && lead.mobile?.replace(/[\s+-]/g, '') === props.mobile.replace(/[\s+-]/g, '');
        const matchesEmail = props.email && lead.email?.toLowerCase() === props.email.toLowerCase();
        const matchesName = props.firstName && lead.firstName?.toLowerCase() === props.firstName.toLowerCase();
        
        return matchesMobile || matchesEmail || (matchesName && (matchesMobile || matchesEmail));
      });
    }
  }, 400);
};

watch(() => [props.firstName, props.lastName, props.mobile, props.email], runDuplicateCheck);
</script>
