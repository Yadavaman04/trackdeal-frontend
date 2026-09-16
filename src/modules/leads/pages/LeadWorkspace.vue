<template>
  <EducationLeadsList v-if="isEducation" />
  <LeadsList v-else />
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import LeadsList from './LeadsList.vue';
import EducationLeadsList from '@/modules/education/pages/EducationLeadsList.vue';

const store = useStore();
const isEducation = computed(() => store.getters['organization/isEducationTenant']);
</script>
