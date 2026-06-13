<template>
  <div class="min-h-screen flex bg-app text-text-primary">
    <!-- Left Panel: Brand / Showcase (Hidden on small screens) -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-12 flex-col justify-between overflow-hidden border-r border-subtle">
      <!-- Background subtle grid effect -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <!-- Top Logo lockup -->
      <div class="relative z-10 flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          ▣
        </div>
        <span class="font-sans font-bold text-slate-200 tracking-tight text-lg">Track Deal</span>
      </div>

      <!-- Center visual mock / value prop -->
      <div class="relative z-10 space-y-6 my-auto max-w-md">
        <div class="inline-flex items-center px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-xs font-medium text-accent-300">
          Commission & Sales CRM Engine
        </div>
        <h1 class="text-4xl font-semibold text-white tracking-tight leading-tight">
          Supercharge your real estate brokerage sales.
        </h1>
        <p class="text-slate-400 text-xs leading-relaxed">
          Track deals, calculate agent payouts, automate communication rules, and run executive commission analytics inside one unified premium workspace.
        </p>

        <!-- Mock dashboard visualization card -->
        <div class="card bg-slate-900/40 backdrop-blur-md border-slate-800 p-4 shadow-xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Eligible Revenue</span>
            <span class="text-[9px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">+14.2%</span>
          </div>
          <div class="text-2xl font-bold font-mono text-slate-100">₹24,85,900</div>
          <div class="flex space-x-2 pt-1">
            <span class="w-full h-1 bg-accent-600 rounded-full"></span>
            <span class="w-1/2 h-1 bg-slate-700 rounded-full"></span>
          </div>
        </div>
      </div>

      <!-- Bottom footer credits -->
      <div class="relative z-10 text-xs text-slate-500 font-medium">
        © 2026 Track Deal Inc. All rights reserved.
      </div>
    </div>

    <!-- Right Panel: Auth Container -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
      <!-- Theme Switcher -->
      <button 
        @click="toggleTheme"
        class="absolute top-6 right-6 btn btn-secondary h-8 w-8 p-0 rounded-lg shadow-sm"
        title="Toggle color theme"
      >
        <component :is="activeTheme === 'dark' ? PhSun : PhMoon" class="w-4 h-4 text-neutral-500" />
      </button>

      <div class="max-w-md w-full space-y-8">
        <!-- Logo for mobile -->
        <div class="lg:hidden flex flex-col items-center mb-8">
          <div class="w-10 h-10 rounded-lg bg-accent-600 flex items-center justify-center text-white font-bold text-xl shadow-md mb-3">
            ▣
          </div>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Track Deal
          </h2>
        </div>

        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { PhSun, PhMoon } from '@phosphor-icons/vue';

const store = useStore();
const activeTheme = computed(() => store.state.ui.activeThemeMode);

const toggleTheme = () => {
  const nextTheme = activeTheme.value === 'dark' ? 'light' : 'dark';
  store.commit('ui/SET_THEME_MODE', nextTheme);
};
</script>


