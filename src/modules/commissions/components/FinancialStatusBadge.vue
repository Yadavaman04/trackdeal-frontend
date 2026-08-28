<template>
  <span class="financial-status" :class="`financial-status--${normalizedStatus}`">
    <span class="financial-status__dot" aria-hidden="true"></span>
    {{ formatStatus(status) }}
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { formatStatus } from '../utils/financialFormat';

const props = defineProps({ status: { type: String, default: 'unpaid' } });
const normalizedStatus = computed(() => String(props.status || 'unpaid').toLowerCase().replace(/\s+/g, '_'));
</script>
