<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40"
        style="background-color: rgba(9, 14, 26, 0.45); backdrop-filter: blur(2px);"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer-slide">
      <div
        v-if="isOpen"
        class="fixed right-0 top-0 z-50 h-full flex flex-col border-l shadow-2xl"
        :style="{ width, borderColor: 'hsl(var(--neutral-100))', backgroundColor: 'hsl(var(--bg-surface))' }"
        role="dialog"
        :aria-label="title"
      >
        <!-- Header -->
        <header
          class="flex items-start justify-between px-6 pt-5 pb-4 shrink-0 border-b"
          style="border-color: hsl(var(--neutral-100));"
        >
          <div class="flex-1 min-w-0 pr-4">
            <h3 class="text-h3 font-semibold leading-snug" style="color: hsl(var(--neutral-900));">{{ title }}</h3>
            <p v-if="subtitle" class="text-body-sm mt-0.5" style="color: hsl(var(--neutral-400));">{{ subtitle }}</p>
          </div>

          <!-- Close Button -->
          <button
            @click="$emit('close')"
            class="w-7 h-7 flex items-center justify-center rounded-[6px] shrink-0 transition-colors duration-80 mt-0.5"
            style="color: hsl(var(--neutral-400));"
            @mouseenter="(e) => { e.currentTarget.style.backgroundColor = 'hsl(var(--neutral-100))'; e.currentTarget.style.color = 'hsl(var(--neutral-700))'; }"
            @mouseleave="(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'hsl(var(--neutral-400))'; }"
            aria-label="Close"
          >
            <PhX :size="15" weight="bold" />
          </button>
        </header>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <slot />
        </div>

        <!-- Footer -->
        <footer
          v-if="$slots.footer"
          class="px-6 py-4 border-t flex items-center justify-end gap-2.5 shrink-0"
          style="border-color: hsl(var(--neutral-100));"
        >
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { PhX } from '@phosphor-icons/vue';

defineProps({
  isOpen:   { type: Boolean, required: true },
  title:    { type: String,  default: '' },
  subtitle: { type: String,  default: '' },
  width:    { type: String,  default: '520px' },
});

defineEmits(['close']);
</script>

<style scoped>
.backdrop-enter-active { transition: opacity 200ms ease; }
.backdrop-leave-active { transition: opacity 150ms ease; }
.backdrop-enter-from,
.backdrop-leave-to     { opacity: 0; }

.drawer-slide-enter-active { transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-slide-leave-active { transition: transform 150ms cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from   { transform: translateX(100%); }
.drawer-slide-leave-to     { transform: translateX(100%); }
</style>
