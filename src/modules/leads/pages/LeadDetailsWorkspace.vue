<template>
  <EducationLeadDetails v-if="isEducation" />
  <LeadDetails v-else />
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import LeadDetails from './LeadDetails.vue';
import EducationLeadDetails from '@/modules/education/pages/EducationLeadDetails.vue';

const store = useStore();
const isEducation = computed(() => store.getters['organization/isEducationTenant']);
</script>
