<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background-color: rgba(9, 14, 26, 0.55); backdrop-filter: blur(3px);"
        @click.self="$emit('cancel')"
      >
        <!-- Modal Card -->
        <Transition name="modal-scale">
          <div
            v-if="isOpen"
            class="relative border rounded-panel shadow-2xl flex flex-col w-full overflow-hidden"
            :style="{ maxWidth: maxSize, backgroundColor: 'hsl(var(--bg-surface))', borderColor: 'hsl(var(--neutral-100))' }"
            role="dialog"
            :aria-label="title"
          >
            <!-- Header -->
            <div
              class="flex items-start justify-between px-6 pt-5 pb-4 border-b shrink-0"
              style="border-color: hsl(var(--neutral-100));"
            >
              <div class="flex-1 min-w-0 pr-4">
                <h3 class="text-h3 font-semibold" style="color: hsl(var(--neutral-900));">{{ title }}</h3>
                <p v-if="subtitle" class="text-body-sm mt-0.5" style="color: hsl(var(--neutral-400));">{{ subtitle }}</p>
              </div>
              <button
                @click="$emit('cancel')"
                class="w-7 h-7 flex items-center justify-center rounded-[6px] transition-colors duration-80 mt-0.5 shrink-0"
                style="color: hsl(var(--neutral-400));"
                @mouseenter="(e) => { e.currentTarget.style.backgroundColor = 'hsl(var(--neutral-100))'; e.currentTarget.style.color = 'hsl(var(--neutral-700))'; }"
                @mouseleave="(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'hsl(var(--neutral-400))'; }"
                aria-label="Close"
              >
                <PhX :size="15" weight="bold" />
              </button>
            </div>

            <!-- Content -->
            <div class="px-6 py-5 text-body flex-1" style="color: hsl(var(--neutral-700));">
              <slot />
            </div>

            <!-- Footer -->
            <div
              class="px-6 py-4 border-t flex items-center justify-end gap-2.5 shrink-0"
              style="border-color: hsl(var(--neutral-100));"
            >
              <slot name="footer">
                <button
                  @click="$emit('cancel')"
                  class="btn-md btn-secondary"
                >
                  Cancel
                </button>
                <button
                  @click="$emit('confirm')"
                  class="btn-md"
                  :class="isDestructive ? 'bg-red-600 hover:bg-red-700 text-white rounded-input shadow-sm' : 'btn-primary'"
                >
                  {{ confirmLabel }}
                </button>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { PhX } from '@phosphor-icons/vue';

defineProps({
  isOpen:       { type: Boolean, required: true },
  title:        { type: String,  default: 'Confirm' },
  subtitle:     { type: String,  default: '' },
  confirmLabel: { type: String,  default: 'Confirm' },
  maxSize:      { type: String,  default: '480px' },
  isDestructive:{ type: Boolean, default: false },
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.backdrop-enter-active { transition: opacity 200ms ease; }
.backdrop-leave-active { transition: opacity 150ms ease; }
.backdrop-enter-from,
.backdrop-leave-to     { opacity: 0; }

.modal-scale-enter-active { transition: opacity 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1); }
.modal-scale-leave-active { transition: opacity 120ms ease, transform 120ms ease; }
.modal-scale-enter-from   { opacity: 0; transform: scale(0.95) translateY(8px); }
.modal-scale-leave-to     { opacity: 0; transform: scale(0.97); }
</style>
