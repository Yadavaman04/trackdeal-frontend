<template>
  <div class="inline-flex items-center p-0.5 bg-neutral-25 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg">
    <button
      v-for="opt in ranges"
      :key="opt.value"
      type="button"
      @click="selectRange(opt.value)"
      :class="[
        'px-3 py-1 text-xs font-medium rounded-md transition-all duration-80 ease-in-out',
        activeRange === opt.value
          ? 'bg-surface dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-sm border border-neutral-100 dark:border-neutral-700'
          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 border border-transparent'
      ]"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const activeRange = ref('mtd');

const ranges = [
  { value: 'today', label: 'Today' },
  { value: 'last30', label: '30 Days' },
  { value: 'mtd', label: 'MTD' },
  { value: 'ytd', label: 'YTD' }
];

const calculateDates = (range) => {
  const now = new Date();
  let startDate = null;
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (range) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      break;
    case 'last30':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'ytd':
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      break;
    case 'mtd':
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      break;
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

const selectRange = (rangeValue) => {
  activeRange.value = rangeValue;
  const dates = calculateDates(rangeValue);
  store.commit('dashboard/SET_DATE_RANGE', dates);
};

onMounted(() => {
  // Trigger initial date calculations on load
  const dates = calculateDates(activeRange.value);
  store.commit('dashboard/SET_DATE_RANGE', dates);
});
</script>
