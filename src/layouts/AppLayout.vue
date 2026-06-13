<template>
  <div
    class="h-screen overflow-hidden flex p-0 lg:p-4 lg:gap-4"
    style="background-color: hsl(var(--bg-app))"
  >
    <!-- ── Desktop Sidebar ─────────────────────────────────────────────── -->
    <aside
      class="hidden lg:flex flex-col flex-shrink-0 border lg:rounded-[12px] transition-all duration-200 ease-enter overflow-hidden shadow-xs"
      :class="[sidebarCollapsed ? 'w-16' : 'w-[220px]']"
      style="
        background-color: hsl(var(--bg-surface));
        border-color: hsl(var(--neutral-100));
      "
    >
      <!-- Logo -->
      <div
        class="h-14 flex items-center px-3 shrink-0 border-b"
        style="border-color: hsl(var(--neutral-100))"
      >
        <div
          class="w-7 h-7 rounded-lg bg-accent-600 flex items-center justify-center shrink-0"
        >
          <PhBuildings weight="bold" :size="16" class="text-white" />
        </div>
        <Transition name="label-fade">
          <span
            v-if="!sidebarCollapsed"
            class="ml-2.5 font-semibold tracking-tight whitespace-nowrap overflow-hidden"
            style="font-size: 14px; color: hsl(var(--neutral-900))"
          >
            Track Deal
          </span>
        </Transition>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        <template v-for="group in filteredMenuGroups" :key="group.title">
          <!-- Section label -->
          <p
            v-if="!sidebarCollapsed"
            class="px-2 pt-4 pb-1 text-label font-semibold uppercase tracking-wider"
            style="color: hsl(var(--neutral-400))"
          >
            {{ group.title }}
          </p>
          <div
            v-else
            class="mt-3 mb-1 border-t mx-2"
            style="border-color: hsl(var(--neutral-100))"
          ></div>

          <!-- Nav Items -->
          <router-link
            v-for="item in group.items"
            :key="item.name"
            :to="item.to"
            :title="sidebarCollapsed ? item.name : undefined"
            class="nav-link flex items-center rounded-[6px] text-body font-medium transition-colors duration-80 relative group"
            :class="[
              sidebarCollapsed
                ? 'h-9 w-9 mx-auto justify-center'
                : 'h-9 px-2.5 gap-2.5',
              isActiveRoute(item.to) ? 'nav-item-active' : 'nav-item-default',
            ]"
          >
            <component
              :is="item.icon"
              :size="18"
              :weight="isActiveRoute(item.to) ? 'bold' : 'regular'"
              class="shrink-0 transition-all duration-80"
            />
            <span v-if="!sidebarCollapsed" class="truncate">{{
              item.name
            }}</span>

            <!-- Tooltip when collapsed -->
            <div
              v-if="sidebarCollapsed"
              class="absolute left-full ml-2 px-2.5 py-1.5 rounded-[6px] text-caption font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-120 z-50 shadow-lg"
              style="
                background-color: hsl(var(--neutral-900));
                color: hsl(var(--neutral-0));
              "
            >
              {{ item.name }}
            </div>
          </router-link>
        </template>
      </nav>

      <!-- Bottom: User Profile -->
      <div
        class="p-3 pb-4 border-t shrink-0"
        style="border-color: hsl(var(--neutral-100))"
      >
        <!-- Collapse Toggle -->
        <button
          @click="toggleSidebar"
          class="w-full flex items-center rounded-[6px] h-8 transition-colors duration-80 mb-1"
          :class="
            sidebarCollapsed
              ? 'justify-center'
              : 'px-2.5 gap-2 text-body-sm font-medium'
          "
          style="color: hsl(var(--neutral-400))"
          :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @mouseenter="
            (e) =>
              (e.currentTarget.style.backgroundColor =
                'hsl(var(--neutral-100))')
          "
          @mouseleave="(e) => (e.currentTarget.style.backgroundColor = '')"
        >
          <PhSidebarSimple :size="16" :weight="'regular'" />
          <span v-if="!sidebarCollapsed">Collapse</span>
        </button>

        <!-- User Card -->
        <div
          class="flex items-center rounded-[6px] transition-colors duration-80 cursor-pointer"
          :class="
            sidebarCollapsed
              ? 'h-9 w-9 mx-auto justify-center'
              : 'h-9 px-2 gap-2.5'
          "
          @click="userMenuOpen = !userMenuOpen"
          @mouseenter="
            (e) =>
              (e.currentTarget.style.backgroundColor =
                'hsl(var(--neutral-100))')
          "
          @mouseleave="(e) => (e.currentTarget.style.backgroundColor = '')"
        >
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-micro font-bold text-white shrink-0 uppercase"
            style="background-color: hsl(var(--accent-600))"
          >
            {{ userInitials }}
          </div>
          <div v-if="!sidebarCollapsed" class="flex-1 min-w-0">
            <p
              class="text-caption font-semibold truncate"
              style="color: hsl(var(--neutral-900))"
            >
              {{ userName }}
            </p>
            <p
              class="text-micro capitalize"
              style="color: hsl(var(--neutral-400))"
            >
              {{ userRoleName }}
            </p>
          </div>
        </div>
      </div>
    </aside>

    <!-- ── Mobile Sidebar Overlay ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-40 lg:hidden"
          style="
            background-color: rgba(9, 14, 26, 0.5);
            backdrop-filter: blur(2px);
          "
          @click="mobileMenuOpen = false"
        />
      </Transition>
      <Transition name="drawer">
        <aside
          v-if="mobileMenuOpen"
          class="fixed left-0 top-0 z-50 h-full w-[220px] flex flex-col border-r lg:hidden shadow-2xl"
          style="
            background-color: hsl(var(--bg-elevated));
            border-color: hsl(var(--neutral-100));
          "
        >
          <div
            class="h-14 flex items-center justify-between px-3 border-b shrink-0"
            style="border-color: hsl(var(--neutral-100))"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-7 h-7 rounded-lg bg-accent-600 flex items-center justify-center"
              >
                <PhBuildings weight="bold" :size="16" class="text-white" />
              </div>
              <span
                class="font-semibold text-body"
                style="color: hsl(var(--neutral-900))"
                >Track Deal</span
              >
            </div>
            <button
              @click="mobileMenuOpen = false"
              class="w-7 h-7 flex items-center justify-center rounded-[6px] transition-colors duration-80"
              style="color: hsl(var(--neutral-400))"
              @mouseenter="
                (e) => {
                  e.currentTarget.style.backgroundColor =
                    'hsl(var(--neutral-100))';
                  e.currentTarget.style.color = 'hsl(var(--neutral-900))';
                }
              "
              @mouseleave="
                (e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = 'hsl(var(--neutral-400))';
                }
              "
            >
              <PhX :size="16" weight="bold" />
            </button>
          </div>

          <nav class="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
            <template v-for="group in filteredMenuGroups" :key="group.title">
              <p
                class="px-2 pt-4 pb-1 text-label font-semibold uppercase tracking-wider"
                style="color: hsl(var(--neutral-400))"
              >
                {{ group.title }}
              </p>
              <router-link
                v-for="item in group.items"
                :key="item.name"
                :to="item.to"
                @click="mobileMenuOpen = false"
                class="flex items-center h-9 px-2.5 gap-2.5 rounded-[6px] text-body font-medium transition-colors duration-80 relative"
                :class="
                  isActiveRoute(item.to)
                    ? 'nav-item-active'
                    : 'nav-item-default'
                "
              >
                <component
                  :is="item.icon"
                  :size="18"
                  :weight="isActiveRoute(item.to) ? 'bold' : 'regular'"
                  class="shrink-0"
                />
                <span class="truncate">{{ item.name }}</span>
              </router-link>
            </template>
          </nav>
        </aside>
      </Transition>
    </Teleport>

    <!-- ── Main Content Area ──────────────────────────────────────────── -->
    <div
      class="flex-1 flex flex-col min-w-0 overflow-hidden border lg:rounded-[12px] shadow-xs"
      style="
        background-color: hsl(var(--bg-app));
        border-color: hsl(var(--neutral-100));
      "
    >
      <!-- Topbar -->
      <header
        class="h-14 flex items-center justify-between px-4 lg:px-5 shrink-0 border-b"
        style="
          background-color: hsl(var(--bg-surface));
          border-color: hsl(var(--neutral-100));
        "
      >
        <!-- Left: Mobile hamburger + Breadcrumb -->
        <div class="flex items-center gap-3">
          <button
            @click="mobileMenuOpen = true"
            class="lg:hidden w-8 h-8 flex items-center justify-center rounded-[6px] transition-colors duration-80"
            style="color: hsl(var(--neutral-400))"
            @mouseenter="
              (e) =>
                (e.currentTarget.style.backgroundColor =
                  'hsl(var(--neutral-100))')
            "
            @mouseleave="(e) => (e.currentTarget.style.backgroundColor = '')"
          >
            <PhList :size="18" />
          </button>

          <!-- Breadcrumb -->
          <nav
            class="hidden sm:flex items-center gap-1.5 text-caption"
            style="color: hsl(var(--neutral-400))"
          >
            <span>Workspace</span>
            <PhCaretRight :size="12" />
            <span class="font-medium" style="color: hsl(var(--neutral-700))">{{
              activePageName
            }}</span>
          </nav>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-1">
          <!-- Search Trigger (desktop) -->
          <button
            @click="toggleSearch"
            class="hidden md:flex items-center gap-2 h-8 px-3 rounded-[6px] border text-caption transition-colors duration-80"
            style="
              border-color: hsl(var(--neutral-100));
              color: hsl(var(--neutral-400));
              background: transparent;
            "
            @mouseenter="
              (e) =>
                (e.currentTarget.style.backgroundColor =
                  'hsl(var(--neutral-50))')
            "
            @mouseleave="
              (e) => (e.currentTarget.style.backgroundColor = 'transparent')
            "
          >
            <PhMagnifyingGlass :size="14" />
            <span>Search...</span>
            <kbd class="kbd">Ctrl K</kbd>
          </button>

          <!-- Search (mobile) -->
          <button
            @click="toggleSearch"
            class="md:hidden w-8 h-8 flex items-center justify-center rounded-[6px] transition-colors duration-80"
            style="color: hsl(var(--neutral-400))"
            @mouseenter="
              (e) =>
                (e.currentTarget.style.backgroundColor =
                  'hsl(var(--neutral-100))')
            "
            @mouseleave="(e) => (e.currentTarget.style.backgroundColor = '')"
          >
            <PhMagnifyingGlass :size="16" />
          </button>

          <!-- Theme toggle -->
          <button
            @click="toggleTheme"
            class="w-8 h-8 flex items-center justify-center rounded-[6px] transition-colors duration-80"
            style="color: hsl(var(--neutral-400))"
            :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            @mouseenter="
              (e) =>
                (e.currentTarget.style.backgroundColor =
                  'hsl(var(--neutral-100))')
            "
            @mouseleave="(e) => (e.currentTarget.style.backgroundColor = '')"
          >
            <PhSun v-if="isDarkMode" :size="16" />
            <PhMoon v-else :size="16" />
          </button>

          <!-- Notifications -->
          <button
            @click="toggleNotifications"
            class="relative w-8 h-8 flex items-center justify-center rounded-[6px] transition-colors duration-80"
            style="color: hsl(var(--neutral-400))"
            @mouseenter="
              (e) =>
                (e.currentTarget.style.backgroundColor =
                  'hsl(var(--neutral-100))')
            "
            @mouseleave="(e) => (e.currentTarget.style.backgroundColor = '')"
          >
            <PhBell :size="16" />
            <span
              v-if="unreadCount > 0"
              class="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-micro font-bold"
              style="background-color: hsl(var(--danger-dot)); font-size: 9px"
            >
              {{ unreadCount > 9 ? "9+" : unreadCount }}
            </span>
          </button>

          <!-- User menu -->
          <div class="relative ml-1">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex items-center gap-2 h-8 pl-1 pr-2 rounded-[6px] transition-colors duration-80"
              @mouseenter="
                (e) =>
                  (e.currentTarget.style.backgroundColor =
                    'hsl(var(--neutral-100))')
              "
              @mouseleave="(e) => (e.currentTarget.style.backgroundColor = '')"
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-micro font-bold text-white uppercase"
                style="background-color: hsl(var(--accent-600))"
              >
                {{ userInitials }}
              </div>
              <span
                class="text-caption font-medium hidden md:block"
                style="color: hsl(var(--neutral-700))"
                >{{ userName }}</span
              >
            </button>

            <!-- User dropdown -->
            <Transition name="dropdown">
              <div
                v-if="userMenuOpen"
                v-click-outside="() => (userMenuOpen = false)"
                class="absolute right-0 top-10 w-52 rounded-[8px] border shadow-lg overflow-hidden z-30 py-1"
                style="
                  background-color: hsl(var(--bg-overlay));
                  border-color: hsl(var(--neutral-100));
                "
              >
                <div
                  class="px-3 py-2.5 border-b"
                  style="border-color: hsl(var(--neutral-100))"
                >
                  <p
                    class="text-caption font-semibold truncate"
                    style="color: hsl(var(--neutral-900))"
                  >
                    {{ userName }}
                  </p>
                  <p
                    class="text-micro capitalize mt-0.5"
                    style="color: hsl(var(--neutral-400))"
                  >
                    {{ userRoleName }}
                  </p>
                </div>
                <router-link
                  to="/app/settings"
                  @click="userMenuOpen = false"
                  class="flex items-center gap-2.5 px-3 py-2 text-body-sm font-medium transition-colors duration-80"
                  style="color: hsl(var(--neutral-700))"
                  @mouseenter="
                    (e) =>
                      (e.currentTarget.style.backgroundColor =
                        'hsl(var(--neutral-50))')
                  "
                  @mouseleave="
                    (e) => (e.currentTarget.style.backgroundColor = '')
                  "
                >
                  <PhGearSix :size="15" />
                  Settings
                </router-link>
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-2.5 px-3 py-2 text-body-sm font-medium transition-colors duration-80"
                  style="color: hsl(var(--danger-text))"
                  @mouseenter="
                    (e) =>
                      (e.currentTarget.style.backgroundColor =
                        'hsl(var(--danger-bg))')
                  "
                  @mouseleave="
                    (e) => (e.currentTarget.style.backgroundColor = '')
                  "
                >
                  <PhSignOut :size="15" />
                  Sign out
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main
        class="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 pb-12"
        style="background-color: hsl(var(--bg-app))"
      >
        <router-view />
      </main>

      <!-- Footer -->
      <footer
        class="h-11 flex items-center justify-between shrink-0 border-t text-[11px] px-4 lg:px-6 select-none"
        style="
          background-color: hsl(var(--bg-surface));
          border-color: hsl(var(--neutral-100));
          color: hsl(var(--neutral-400));
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04), 0 -1px 2px rgba(0, 0, 0, 0.02);
          position: relative;
          z-index: 10;
        "
      >
        <div class="flex items-center gap-1.5 font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          <span style="color: hsl(var(--neutral-500)); font-weight: 500;">All systems operational</span>
        </div>
        <div class="font-semibold tracking-wider uppercase text-[10px]" style="color: hsl(var(--neutral-500));">
          trackdeal by swarajyaconsultancy
        </div>
        <div class="flex items-center gap-3 font-medium">
          <a
            href="https://swarajyaconsultancy.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors duration-80"
            style="color: hsl(var(--neutral-400));"
            @mouseenter="e => e.target.style.color = 'hsl(var(--neutral-900))'"
            @mouseleave="e => e.target.style.color = 'hsl(var(--neutral-400))'"
          >
            Documentation
          </a>
          <span style="color: hsl(var(--neutral-200));">•</span>
          <a
            href="mailto:support@swarajyaconsultancy.com"
            class="transition-colors duration-80"
            style="color: hsl(var(--neutral-400));"
            @mouseenter="e => e.target.style.color = 'hsl(var(--neutral-900))'"
            @mouseleave="e => e.target.style.color = 'hsl(var(--neutral-400))'"
          >
            Support
          </a>
        </div>
      </footer>
    </div>

    <!-- ── Global Search Modal ────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="searchOpen"
          class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          style="
            background-color: rgba(9, 14, 26, 0.6);
            backdrop-filter: blur(3px);
          "
          @click.self="toggleSearch"
        />
      </Transition>
      <Transition name="command">
        <div
          v-if="searchOpen"
          class="fixed left-1/2 top-[15vh] -translate-x-1/2 z-50 w-full max-w-[560px] rounded-[10px] border overflow-hidden shadow-2xl flex flex-col"
          style="
            background-color: hsl(224 28% 8%);
            border-color: hsl(220 18% 18%);
            max-height: 440px;
          "
        >
          <!-- Search Input -->
          <div
            class="flex items-center gap-3 px-4 py-3.5 border-b"
            style="border-color: hsl(220 18% 18%)"
          >
            <PhMagnifyingGlass
              :size="16"
              style="color: hsl(218 10% 52%)"
              class="shrink-0"
            />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search or jump to..."
              class="flex-1 bg-transparent border-0 outline-none text-body placeholder:text-neutral-400"
              style="
                color: hsl(var(--neutral-900));
                --tw-placeholder-opacity: 1;
              "
              @keydown.esc="toggleSearch"
              @keydown.arrow-down.prevent="commandNavDown"
              @keydown.arrow-up.prevent="commandNavUp"
              @keydown.enter.prevent="commandSelect"
            />
            <button
              @click="toggleSearch"
              class="kbd cursor-pointer"
              style="color: hsl(218 10% 52%)"
            >
              ESC
            </button>
          </div>

          <!-- Results -->
          <div class="flex-1 overflow-y-auto py-2">
            <template v-if="searchQuery.trim()">
              <div
                v-for="group in searchResults"
                :key="group.category"
                class="mb-1"
              >
                <p
                  class="px-4 py-1.5 text-label font-semibold uppercase tracking-wider"
                  style="color: hsl(218 10% 40%)"
                >
                  {{ group.category }}
                </p>
                <button
                  v-for="(item, idx) in group.items"
                  :key="item.name"
                  class="w-full flex items-center gap-3 px-4 h-10 text-left transition-colors duration-80"
                  :class="commandIndex === idx ? 'bg-accent-600' : ''"
                  @mouseenter="() => {}"
                  @click="navigateSearch(item.route)"
                  style="color: hsl(220 3% 94%)"
                >
                  <component
                    :is="item.icon"
                    :size="16"
                    class="shrink-0 opacity-70"
                  />
                  <span class="text-body-sm font-medium">{{ item.name }}</span>
                  <span class="ml-auto text-micro opacity-50">{{
                    item.desc
                  }}</span>
                </button>
              </div>
              <p
                v-if="searchResults.length === 0"
                class="text-center py-8 text-caption"
                style="color: hsl(218 10% 40%)"
              >
                No results for "{{ searchQuery }}"
              </p>
            </template>

            <template v-else>
              <!-- Quick Actions -->
              <p
                class="px-4 py-1.5 text-label font-semibold uppercase tracking-wider"
                style="color: hsl(218 10% 40%)"
              >
                Quick Actions
              </p>
              <button
                v-for="action in quickActions"
                :key="action.name"
                class="w-full flex items-center gap-3 px-4 h-10 text-left transition-colors duration-80"
                style="color: hsl(220 3% 94%)"
                @mouseenter="
                  (e) =>
                    (e.currentTarget.style.backgroundColor = 'hsl(220 18% 14%)')
                "
                @mouseleave="
                  (e) => (e.currentTarget.style.backgroundColor = '')
                "
                @click="navigateSearch(action.route)"
              >
                <component
                  :is="action.icon"
                  :size="16"
                  class="shrink-0 opacity-70"
                />
                <span class="text-body-sm font-medium">{{ action.name }}</span>
                <span
                  v-if="action.shortcut"
                  class="ml-auto kbd"
                  style="
                    background: hsl(220 14% 18%);
                    border-color: hsl(220 18% 24%);
                    color: hsl(218 10% 52%);
                  "
                >
                  {{ action.shortcut }}
                </span>
              </button>
            </template>
          </div>

          <!-- Footer hint -->
          <div
            class="flex items-center gap-4 px-4 py-2.5 border-t text-micro"
            style="border-color: hsl(220 18% 18%); color: hsl(218 10% 40%)"
          >
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Notifications Drawer ───────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="notificationsOpen"
          class="fixed inset-0 z-40"
          style="
            background-color: rgba(9, 14, 26, 0.4);
            backdrop-filter: blur(2px);
          "
          @click="notificationsOpen = false"
        />
      </Transition>
      <Transition name="slide-right">
        <aside
          v-if="notificationsOpen"
          class="fixed right-0 top-0 h-full w-80 z-50 border-l flex flex-col shadow-2xl"
          style="
            background-color: hsl(var(--bg-surface));
            border-color: hsl(var(--neutral-100));
          "
        >
          <header
            class="h-14 px-4 border-b flex items-center justify-between shrink-0"
            style="border-color: hsl(var(--neutral-100))"
          >
            <div class="flex items-center gap-2">
              <PhBell :size="16" style="color: hsl(var(--neutral-500))" />
              <h3
                class="text-h4 font-semibold"
                style="color: hsl(var(--neutral-900))"
              >
                Notifications
              </h3>
              <span
                v-if="unreadCount > 0"
                class="text-micro font-bold px-1.5 py-0.5 rounded-full text-white"
                style="background-color: hsl(var(--danger-dot))"
              >
                {{ unreadCount }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="unreadCount > 0"
                @click="markAllNotificationsRead"
                class="text-caption font-medium transition-colors duration-80"
                style="color: hsl(var(--accent-600))"
                @mouseenter="
                  (e) => (e.currentTarget.style.textDecoration = 'underline')
                "
                @mouseleave="
                  (e) => (e.currentTarget.style.textDecoration = 'none')
                "
              >
                Mark all read
              </button>
              <button
                @click="notificationsOpen = false"
                class="w-7 h-7 flex items-center justify-center rounded-[6px] transition-colors duration-80"
                style="color: hsl(var(--neutral-400))"
                @mouseenter="
                  (e) =>
                    (e.currentTarget.style.backgroundColor =
                      'hsl(var(--neutral-100))')
                "
                @mouseleave="
                  (e) => (e.currentTarget.style.backgroundColor = '')
                "
              >
                <PhX :size="15" weight="bold" />
              </button>
            </div>
          </header>

          <div class="flex-1 overflow-y-auto p-3 space-y-2">
            <div
              v-for="item in mockNotifications"
              :key="item.id"
              class="p-3 rounded-[8px] border transition-all duration-80"
              :style="{
                backgroundColor: item.read
                  ? 'transparent'
                  : 'hsl(var(--accent-50))',
                borderColor: item.read
                  ? 'hsl(var(--neutral-100))'
                  : 'hsl(var(--accent-200))',
                opacity: item.read ? '0.65' : '1',
              }"
            >
              <div class="flex justify-between items-start gap-2 mb-0.5">
                <span
                  class="text-caption font-semibold"
                  style="color: hsl(var(--neutral-900))"
                  >{{ item.title }}</span
                >
                <span
                  class="text-micro shrink-0 mt-0.5"
                  style="color: hsl(var(--neutral-400))"
                  >{{ item.time }}</span
                >
              </div>
              <p
                class="text-body-sm leading-relaxed"
                style="color: hsl(var(--neutral-500))"
              >
                {{ item.message }}
              </p>
              <button
                v-if="!item.read"
                @click="markNotificationRead(item.id)"
                class="text-micro font-semibold mt-1.5 transition-colors duration-80"
                style="color: hsl(var(--accent-600))"
              >
                Mark as read
              </button>
            </div>
            <div
              v-if="mockNotifications.length === 0"
              class="text-center py-12"
            >
              <PhBellSlash
                :size="32"
                class="mx-auto mb-3"
                style="color: hsl(var(--neutral-300))"
              />
              <p class="text-body-sm" style="color: hsl(var(--neutral-400))">
                You're all caught up
              </p>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- ── Toast Stack ────────────────────────────────────────────────── -->
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-[380px] w-full pointer-events-none"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-start gap-3 p-3.5 rounded-[8px] border-l-[3px] shadow-xl pointer-events-auto"
          :style="{
            backgroundColor: 'hsl(226 33% 6%)',
            borderLeftColor:
              toast.type === 'error'
                ? 'hsl(var(--danger-dot))'
                : toast.type === 'warning'
                  ? 'hsl(var(--warning-dot))'
                  : 'hsl(var(--success-dot))',
          }"
        >
          <component
            :is="
              toast.type === 'error'
                ? PhXCircle
                : toast.type === 'warning'
                  ? PhWarningCircle
                  : PhCheckCircle
            "
            :size="16"
            class="shrink-0 mt-0.5"
            :style="{
              color:
                toast.type === 'error'
                  ? 'hsl(var(--danger-dot))'
                  : toast.type === 'warning'
                    ? 'hsl(var(--warning-dot))'
                    : 'hsl(var(--success-dot))',
            }"
          />
          <div class="flex-1 min-w-0">
            <p
              class="text-caption font-semibold"
              style="color: hsl(220 3% 94%)"
            >
              {{ toast.message }}
            </p>
          </div>
          <button
            @click="dismissToast(toast.id)"
            class="shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors duration-80"
            style="color: hsl(218 10% 40%)"
            @mouseenter="
              (e) => (e.currentTarget.style.color = 'hsl(220 3% 94%)')
            "
            @mouseleave="
              (e) => (e.currentTarget.style.color = 'hsl(218 10% 40%)')
            "
          >
            <PhX :size="12" weight="bold" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

// ── Phosphor Icons ──────────────────────────────────────────────────────────
import {
  PhBuildings,
  PhChartBar,
  PhUsersThree,
  PhCheckSquare,
  PhHouseLine,
  PhHandshake,
  PhCurrencyInr,
  PhTrendUp,
  PhGearSix,
  PhMagnifyingGlass,
  PhBell,
  PhBellSlash,
  PhList,
  PhCaretRight,
  PhX,
  PhSun,
  PhMoon,
  PhSignOut,
  PhSidebarSimple,
  PhCheckCircle,
  PhXCircle,
  PhWarningCircle,
  PhHardHat,
} from "@phosphor-icons/vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

// ── State ───────────────────────────────────────────────────────────────────
const sidebarCollapsed = computed(() => store.state.ui.sidebarCollapsed);
const toasts = computed(() => store.state.notifications.toasts);

const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);
const notificationsOpen = ref(false);
const searchOpen = ref(false);
const searchQuery = ref("");
const searchInput = ref(null);
const commandIndex = ref(0);

// ── User ────────────────────────────────────────────────────────────────────
const userProfile = computed(() => store.state.auth.currentUser);
const userName = computed(() => {
  if (userProfile.value?.name) return userProfile.value.name;
  if (userProfile.value?.firstName) {
    return `${userProfile.value.firstName} ${userProfile.value.lastName || ""}`.trim();
  }
  return "User";
});
const userInitials = computed(() => {
  if (!userName.value || userName.value === "User") return "U";
  return userName.value
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
});
const userRoleName = computed(() => store.getters["auth/userRole"] || "Agent");

// ── Page / Route ────────────────────────────────────────────────────────────
const activePageName = computed(() => {
  const name = route.name;
  if (!name) return "Home";
  return String(name)
    .replace(/([A-Z])/g, " $1")
    .trim();
});

const isActiveRoute = (to) => route.path.startsWith(to);

// ── Theme ───────────────────────────────────────────────────────────────────
const isDarkMode = computed(() => store.state.ui.activeThemeMode === "dark");
const toggleTheme = () =>
  store.commit("ui/SET_THEME_MODE", isDarkMode.value ? "light" : "dark");
const toggleSidebar = () => store.commit("ui/TOGGLE_SIDEBAR");

// ── Navigation Menu ─────────────────────────────────────────────────────────
const menuGroups = [
  {
    title: "Main",
    items: [{ name: "Dashboard", to: "/app/dashboard", icon: PhChartBar }],
  },
  {
    title: "Sales",
    items: [
      {
        name: "Leads",
        to: "/app/leads",
        icon: PhUsersThree,
        permission: "leads:read",
      },
      {
        name: "Tasks",
        to: "/app/tasks",
        icon: PhCheckSquare,
        permission: "tasks:read",
      },
    ],
  },
  {
    title: "Portfolio",
    items: [
      {
        name: "Projects",
        to: "/app/projects",
        icon: PhBuildings,
        permission: "projects:read",
      },
      {
        name: "Properties",
        to: "/app/properties",
        icon: PhHouseLine,
        permission: "properties:read",
      },
      {
        name: "Builders",
        to: "/app/builders",
        icon: PhHardHat,
        permission: "projects:read",
      },
      {
        name: "Deals",
        to: "/app/deals",
        icon: PhHandshake,
        permission: "deals:read",
      },
    ],
  },
  {
    title: "Financials",
    items: [
      {
        name: "Commissions",
        to: "/app/commissions",
        icon: PhCurrencyInr,
        permission: "commissions:read",
        featureFlag: "commissionModule",
      },
      {
        name: "Reports",
        to: "/app/reports",
        icon: PhTrendUp,
        permission: "reports:read",
        featureFlag: "reportsModule",
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        name: "Settings",
        to: "/app/settings",
        icon: PhGearSix,
        permission: "settings:read",
      },
    ],
  },
];

const filteredMenuGroups = computed(() => {
  const isSuperAdmin = store.getters["auth/userRole"] === "super_admin";
  return menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (
          item.featureFlag &&
          !store.getters["organization/isFeatureEnabled"](item.featureFlag)
        )
          return false;
        if (
          item.permission &&
          !isSuperAdmin &&
          !store.getters["permissions/hasCapability"](item.permission)
        )
          return false;
        return true;
      }),
    }))
    .filter((g) => g.items.length > 0);
});

// ── Quick Actions for Command Palette ───────────────────────────────────────
const quickActions = [
  {
    name: "Go to Dashboard",
    route: "/app/dashboard",
    icon: PhChartBar,
    shortcut: "G D",
  },
  {
    name: "Go to Leads",
    route: "/app/leads",
    icon: PhUsersThree,
    shortcut: "G L",
  },
  {
    name: "Go to Deals",
    route: "/app/deals",
    icon: PhHandshake,
    shortcut: "G D",
  },
  {
    name: "Go to Tasks",
    route: "/app/tasks",
    icon: PhCheckSquare,
    shortcut: "G T",
  },
  {
    name: "Open Settings",
    route: "/app/settings",
    icon: PhGearSix,
    shortcut: null,
  },
];

// ── Search Results ───────────────────────────────────────────────────────────
const searchResults = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return [];
  const db = [
    {
      name: "Prestige Heights",
      desc: "Project",
      route: "/app/projects",
      icon: PhBuildings,
      category: "Projects",
    },
    {
      name: "Skyway Tower",
      desc: "Project",
      route: "/app/projects",
      icon: PhBuildings,
      category: "Projects",
    },
    {
      name: "Anand Mehta",
      desc: "Lead",
      route: "/app/leads",
      icon: PhUsersThree,
      category: "Leads",
    },
    {
      name: "Settings",
      desc: "Settings",
      route: "/app/settings",
      icon: PhGearSix,
      category: "Pages",
    },
  ];
  const filtered = db.filter((i) => i.name.toLowerCase().includes(query));
  const groups = {};
  filtered.forEach((i) => {
    (groups[i.category] ??= []).push(i);
  });
  return Object.entries(groups).map(([category, items]) => ({
    category,
    items,
  }));
});

// ── Command palette keyboard nav ─────────────────────────────────────────────
const commandNavDown = () => {
  commandIndex.value = Math.min(commandIndex.value + 1, 10);
};
const commandNavUp = () => {
  commandIndex.value = Math.max(commandIndex.value - 1, 0);
};
const commandSelect = () => {};

// ── Notifications ────────────────────────────────────────────────────────────
const mockNotifications = ref([
  {
    id: "1",
    title: "New Lead Assigned",
    message: "Anand Mehta has been assigned to you.",
    time: "2m ago",
    read: false,
  },
  {
    id: "2",
    title: "Deal Approved",
    message: "Compliance approved Deal #3320.",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    title: "Commission Processed",
    message: "Your payout of ₹2,40,000 has been cleared.",
    time: "1d ago",
    read: true,
  },
]);
const unreadCount = computed(
  () => mockNotifications.value.filter((n) => !n.read).length,
);
const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value;
};
const markNotificationRead = (id) => {
  const n = mockNotifications.value.find((n) => n.id === id);
  if (n) n.read = true;
};
const markAllNotificationsRead = () =>
  mockNotifications.value.forEach((n) => (n.read = true));

// ── Search ───────────────────────────────────────────────────────────────────
const toggleSearch = () => {
  searchOpen.value = !searchOpen.value;
  if (searchOpen.value) {
    searchQuery.value = "";
    commandIndex.value = 0;
    nextTick(() => searchInput.value?.focus());
  }
};
const navigateSearch = (targetRoute) => {
  toggleSearch();
  router.push(targetRoute);
};

// ── Toasts ───────────────────────────────────────────────────────────────────
const dismissToast = (id) => store.commit("notifications/REMOVE_TOAST", id);

// ── Keyboard Shortcuts ────────────────────────────────────────────────────────
const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    toggleSearch();
  }
  if (e.key === "Escape" && searchOpen.value) toggleSearch();
};

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  store.dispatch("ui/initializeTheme");
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// ── Logout ───────────────────────────────────────────────────────────────────
const handleLogout = async () => {
  userMenuOpen.value = false;
  await store.dispatch("auth/logoutSession");
  router.push("/login");
};

// ── Click outside directive (simple inline) ──────────────────────────────────
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!el.contains(e.target)) binding.value(e);
    };
    document.addEventListener("click", el._clickOutside, true);
  },
  unmounted(el) {
    document.removeEventListener("click", el._clickOutside, true);
  },
};
</script>

<style scoped>
/* ── Nav item states ─────────────────────────────────────────────────────── */
.nav-item-default {
  color: hsl(var(--neutral-500));
}
.nav-item-default:hover {
  background-color: hsl(var(--neutral-100));
  color: hsl(var(--neutral-900));
}
.nav-item-active {
  background-color: hsl(var(--accent-50));
  color: hsl(var(--accent-600));
}
.dark .nav-item-active {
  background-color: hsl(var(--accent-100));
  color: hsl(var(--accent-500));
}
.nav-item-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 2px;
  border-radius: 999px;
  background-color: hsl(var(--accent-500));
}

/* ── Transitions ─────────────────────────────────────────────────────────── */
.label-fade-enter-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}
.label-fade-leave-active {
  transition: opacity 80ms ease;
}
.label-fade-enter-from {
  opacity: 0;
  transform: translateX(-6px);
}
.label-fade-leave-to {
  opacity: 0;
}

.backdrop-enter-active {
  transition: opacity 200ms ease;
}
.backdrop-leave-active {
  transition: opacity 150ms ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active {
  transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-leave-active {
  transition: transform 150ms cubic-bezier(0.4, 0, 1, 1);
}
.drawer-enter-from {
  transform: translateX(-100%);
}
.drawer-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-active {
  transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-leave-active {
  transition: transform 150ms cubic-bezier(0.4, 0, 1, 1);
}
.slide-right-enter-from {
  transform: translateX(100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}

.dropdown-enter-active {
  transition:
    opacity 120ms ease,
    transform 120ms cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-leave-active {
  transition: opacity 80ms ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
.dropdown-leave-to {
  opacity: 0;
}

.command-enter-active {
  transition:
    opacity 200ms ease,
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.command-leave-active {
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}
.command-enter-from {
  opacity: 0;
  transform: translateX(-50%) scale(0.96) translateY(-8px);
}
.command-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.97);
}

.toast-enter-active {
  animation: toast-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 200ms cubic-bezier(0.4, 0, 1, 1);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(calc(100% + 16px));
}
.toast-move {
  transition: transform 200ms ease;
}
</style>
