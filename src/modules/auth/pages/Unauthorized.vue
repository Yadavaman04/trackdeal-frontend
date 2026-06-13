<template>
  <div class="space-y-6 text-center py-4">
    <div class="text-center">
      <span class="text-4xl text-red-500">🚫</span>
      <h3 class="font-heading text-lg font-bold text-slate-800 mt-4">
        Access Unauthorized
      </h3>
      <p class="text-xs text-slate-500 mt-2 leading-relaxed">
        You do not possess the required RBAC scopes or permission rules to view this workspace. Please contact your system administrator if you believe this is an error.
      </p>
    </div>

    <!-- Redirect CTA -->
    <div class="pt-2">
      <router-link 
        to="/app/dashboard"
        class="w-full bg-primary text-white py-2 px-4 rounded-lg text-xs font-semibold hover:bg-opacity-95 transition-all inline-block text-center"
      >
        Back to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Unauthorized access redirect shell
</script>
