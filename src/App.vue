<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

onMounted(() => {
  // Initialize dynamic styles and theme modes
  store.dispatch('ui/initializeTheme');
});
</script>
