<template>
  <div class="space-y-6 text-center py-4">
    <div class="text-center">
      <span class="text-4xl">⏳</span>
      <h3 class="font-heading text-lg font-bold text-slate-800 mt-4">
        Session Expired
      </h3>
      <p class="text-xs text-slate-500 mt-2 leading-relaxed">
        Your active security session has expired due to inactivity or token renewal limits. Please sign in again to access your CRM workspace.
      </p>
    </div>

    <!-- Redirect CTA -->
    <div class="pt-2">
      <router-link 
        to="/login"
        class="w-full bg-primary text-white py-2 px-4 rounded-lg text-xs font-semibold hover:bg-opacity-95 transition-all inline-block text-center"
      >
        Return to Login
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

onMounted(() => {
  // Clear any residual session states on mount
  store.dispatch('auth/logoutSession');
});
</script>
