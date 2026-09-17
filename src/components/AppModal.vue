<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1000] flex justify-end overflow-hidden premium-backdrop"
        @click.self="$emit('cancel')"
      >
        <!-- Modal Drawer (Right Side) -->
        <Transition name="modal-drawer-slide">
          <div
            v-if="isOpen"
            ref="panel"
            class="relative z-[1010] border-l premium-drawer flex flex-col h-full w-full max-w-[calc(100vw-12px)] overflow-hidden"
            :style="{ width: maxSize, maxWidth: maxSize, backgroundColor: 'hsl(var(--bg-surface))', borderColor: 'hsl(var(--neutral-100))' }"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
            tabindex="-1"
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
                class="w-8 h-8 flex items-center justify-center rounded-[8px] transition-colors duration-80 mt-0.5 shrink-0 btn-icon"
                aria-label="Close"
              >
                <PhX :size="16" weight="bold" />
              </button>
            </div>

            <!-- Content -->
            <div class="px-6 py-5 text-body flex-1 overflow-y-auto" style="color: hsl(var(--neutral-700));">
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
import { nextTick, onUnmounted, ref, watch } from 'vue';
import { PhX } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen:       { type: Boolean, required: true },
  title:        { type: String,  default: 'Confirm' },
  subtitle:     { type: String,  default: '' },
  confirmLabel: { type: String,  default: 'Confirm' },
  maxSize:      { type: String,  default: '480px' },
  isDestructive:{ type: Boolean, default: false },
});

const emit = defineEmits(['confirm', 'cancel']);
const panel = ref(null);
const previousFocus = ref(null);
const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isOpen) emit('cancel');
  if (event.key !== 'Tab' || !panel.value) return;
  const focusable = [...panel.value.querySelectorAll(focusableSelector)];
  if (!focusable.length) { event.preventDefault(); panel.value.focus(); return; }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
};

watch(() => props.isOpen, async (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (isOpen) {
    previousFocus.value = document.activeElement;
    window.addEventListener('keydown', handleKeydown);
    await nextTick();
    (panel.value?.querySelector(focusableSelector) || panel.value)?.focus();
  } else {
    window.removeEventListener('keydown', handleKeydown);
    previousFocus.value?.focus?.();
  }
}, { immediate: true });

onUnmounted(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.backdrop-enter-active { transition: opacity 200ms ease; }
.backdrop-leave-active { transition: opacity 150ms ease; }
.backdrop-enter-from,
.backdrop-leave-to     { opacity: 0; }

.modal-drawer-slide-enter-active { transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.modal-drawer-slide-leave-active { transition: transform 180ms cubic-bezier(0.4, 0, 1, 1); }
.modal-drawer-slide-enter-from   { transform: translateX(100%); }
.modal-drawer-slide-leave-to     { transform: translateX(100%); }
</style>
