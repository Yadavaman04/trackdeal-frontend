<template>
  <div class="auth-shell min-h-screen flex bg-app text-text-primary">
    <!-- Left Panel: Brand / Showcase (Hidden on small screens) -->
    <div class="auth-showcase hidden lg:flex lg:w-[54%] relative p-12 xl:p-16 flex-col justify-between overflow-hidden">
      <!-- Background subtle grid effect -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <!-- Top Logo lockup -->
      <div class="relative z-10 flex items-center space-x-2.5">
        <div class="brand-mark w-9 h-9 rounded-[11px] flex items-center justify-center">
          <PhBuildings :size="18" weight="duotone" />
        </div>
        <span class="font-heading font-extrabold text-slate-100 tracking-[-0.04em] text-lg">Track Deal</span>
      </div>

      <!-- Center visual mock / value prop -->
      <div class="relative z-10 space-y-6 my-auto max-w-md">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-[10px] uppercase tracking-[0.14em] font-bold text-emerald-300">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          Revenue operations workspace
        </div>
        <h1 class="font-heading text-4xl xl:text-5xl font-bold text-white tracking-[-0.045em] leading-[1.08]">
          Every deal, from first signal to final payout.
        </h1>
        <p class="text-slate-400 text-sm leading-6 max-w-lg">
          Track deals, calculate agent payouts, automate communication rules, and run executive commission analytics inside one unified premium workspace.
        </p>

        <!-- Mock dashboard visualization card -->
        <div class="auth-metric p-5 space-y-3">
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
    <div class="auth-form-panel w-full lg:w-[46%] flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
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
          <div class="brand-mark w-10 h-10 rounded-[12px] flex items-center justify-center mb-3">
            <PhBuildings :size="20" weight="duotone" />
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
import { PhSun, PhMoon, PhBuildings } from '@phosphor-icons/vue';

const store = useStore();
const activeTheme = computed(() => store.state.ui.activeThemeMode);

const toggleTheme = () => {
  const nextTheme = activeTheme.value === 'dark' ? 'light' : 'dark';
  store.commit('ui/SET_THEME_MODE', nextTheme);
};
</script>

<style scoped>
.auth-shell { background: hsl(var(--bg-app)); }
.auth-showcase {
  background:
    radial-gradient(circle at 15% 10%, hsl(var(--accent-500) / 0.2), transparent 28rem),
    radial-gradient(circle at 90% 85%, hsl(var(--highlight-500) / 0.09), transparent 24rem),
    hsl(18 20% 7%);
  border-right: 1px solid hsl(20 10% 16%);
}
.auth-showcase::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}
.auth-form-panel { background: radial-gradient(circle at 100% 0%, hsl(var(--accent-100) / 0.55), transparent 22rem); }
.auth-metric {
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 14px;
  background: rgb(255 255 255 / 0.045);
  box-shadow: 0 24px 60px rgb(0 0 0 / 0.25);
  backdrop-filter: blur(18px);
}
</style>


