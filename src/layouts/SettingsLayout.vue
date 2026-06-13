<template>
  <div class="w-full">
    <div class="flex flex-col md:flex-row gap-6 min-h-full">

      <!-- Settings Left Navigation -->
      <aside
        class="md:w-52 shrink-0 bg-surface border border-default rounded-xl p-2.5 self-start shadow-sm"
      >
        <p class="text-label font-semibold uppercase tracking-wider px-2 pt-1 pb-2" style="color: hsl(var(--neutral-400));">
          Settings
        </p>
        <nav class="space-y-0.5">
          <router-link
            v-for="item in filteredSettingsMenu"
            :key="item.name"
            :to="item.to"
            class="flex items-center gap-2.5 h-9 px-2.5 rounded-[6px] text-body-sm font-medium transition-colors duration-80 relative"
            :class="activeRoute.startsWith(item.to) ? 'nav-item-active' : 'nav-item-default'"
          >
            <component :is="item.icon" :size="16" :weight="activeRoute.startsWith(item.to) ? 'bold' : 'regular'" class="shrink-0" />
            <span class="truncate">{{ item.name }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Settings Content Canvas -->
      <section class="flex-1 min-w-0 space-y-6">
        <router-view />
      </section>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import {
  PhBuildings, PhMapPin, PhUsersThree,
  PhShieldCheck, PhGearSix,
} from '@phosphor-icons/vue';

const store = useStore();
const route = useRoute();
const activeRoute = computed(() => route.path);

const settingsMenu = [
  { name: 'Organization',      to: '/app/settings/org',      icon: PhBuildings,   permission: 'settings.org'    },
  { name: 'Branches',          to: '/app/settings/branches', icon: PhMapPin,      permission: 'settings.branch' },
  { name: 'Users',             to: '/app/settings/users',    icon: PhUsersThree,  permission: 'settings.users'  },
  { name: 'Roles & Permissions', to: '/app/settings/roles', icon: PhShieldCheck, permission: 'settings.roles'  },
];

const filteredSettingsMenu = computed(() => {
  const isSuperAdmin = store.getters['auth/userRole'] === 'super_admin';
  const orgType = store.getters['organization/organizationType'];

  return settingsMenu.filter(item => {
    if (item.to === '/app/settings/branches' && orgType !== 'ENTERPRISE_AGENCY') {
      return false;
    }
    if ((item.to === '/app/settings/users' || item.to === '/app/settings/roles') && orgType === 'INDIVIDUAL_AGENT') {
      return false;
    }
    if (!item.permission || isSuperAdmin) return true;
    return store.getters['permissions/hasCapability'](item.permission);
  });
});
</script>
