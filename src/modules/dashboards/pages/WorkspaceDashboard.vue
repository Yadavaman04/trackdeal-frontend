<template>
  <EducationDashboard v-if="isEducation" />
  <Dashboard v-else />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import Dashboard from "./Dashboard.vue";
import EducationDashboard from "@/modules/education/pages/EducationDashboard.vue";

const store = useStore();
const isEducation = computed(
  () => store.getters["organization/isEducationTenant"],
);
</script>
