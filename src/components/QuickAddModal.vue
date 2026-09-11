<template>
  <Teleport to="body">
    <Transition name="quick-add">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-950/65 p-4 backdrop-blur-sm"
        @click.self="close"
      >
        <section class="section-panel w-full max-w-lg overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
          <header class="flex items-start justify-between border-b border-default px-5 py-4">
            <div class="flex gap-3">
              <div class="brand-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]">
                <AppIcon name="lightning" :size="17" weight="fill" />
              </div>
              <div>
                <p class="eyebrow">Create</p>
                <h2 id="quick-add-title" class="font-heading text-h3 font-bold text-text-primary">Quick action</h2>
                <p class="mt-0.5 text-caption text-text-muted">Start a common workflow without losing your place.</p>
              </div>
            </div>
            <button class="icon-button" type="button" aria-label="Close quick actions" @click="close">
              <AppIcon name="close" :size="16" weight="bold" />
            </button>
          </header>

          <div class="grid gap-1.5 p-3 sm:grid-cols-2">
            <router-link
              v-for="action in actions"
              :key="action.title"
              :to="action.to"
              class="quick-action group flex min-h-[108px] flex-col justify-between rounded-[11px] p-3.5"
              @click="close"
            >
              <div class="flex items-start justify-between">
                <span class="quick-action-icon" :class="action.tone">
                  <AppIcon :name="action.icon" :size="17" weight="duotone" />
                </span>
                <AppIcon name="arrowRight" :size="15" class="text-text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent-600" />
              </div>
              <div>
                <h3 class="font-heading text-body-sm font-bold text-text-primary">{{ action.title }}</h3>
                <p class="mt-0.5 text-[10px] leading-4 text-text-muted">{{ action.description }}</p>
              </div>
            </router-link>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({ isOpen: { type: Boolean, default: false } });

const emit = defineEmits(['close']);

const actions = [
  { title: 'New lead', description: 'Capture buyer needs, budget and financing.', to: '/app/leads', icon: 'user', tone: 'tone-accent' },
  { title: 'Add inventory', description: 'Add a unit, villa, plot or commercial space.', to: '/app/properties', icon: 'buildings', tone: 'tone-success' },
  { title: 'Create task', description: 'Schedule a follow-up, visit or internal task.', to: '/app/tasks', icon: 'clipboard', tone: 'tone-warning' },
  { title: 'Loan application', description: 'Manage submissions, sanctions and disbursals.', to: '/app/loans', icon: 'bank', tone: 'tone-info' },
  { title: 'Property agreement', description: 'Generate a sale, resale or rental agreement.', to: '/app/agreements/new', icon: 'agreements', tone: 'tone-success' },
  { title: 'Commission payment', description: 'Record payment, UTR and withholding details.', to: '/app/commissions', icon: 'payment', tone: 'tone-highlight' },
];

const close = () => emit('close');
</script>

<style scoped>
.quick-action { border: 1px solid transparent; background: hsl(var(--bg-elevated) / 0.72); transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms ease, background-color 180ms ease; }
.quick-action:hover { transform: translateY(-2px); border-color: hsl(var(--accent-200)); background: hsl(var(--accent-50) / 0.65); }
.quick-action-icon { display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 9px; }
.tone-accent { color: hsl(var(--accent-600)); background: hsl(var(--accent-100)); }
.tone-success { color: hsl(var(--success-text)); background: hsl(var(--success-bg)); }
.tone-warning { color: hsl(var(--warning-text)); background: hsl(var(--warning-bg)); }
.tone-info { color: hsl(var(--info-text)); background: hsl(var(--info-bg)); }
.tone-highlight { color: hsl(30 68% 35%); background: hsl(var(--highlight-100)); }
.quick-add-enter-active, .quick-add-leave-active { transition: opacity 160ms ease; }
.quick-add-enter-active .section-panel, .quick-add-leave-active .section-panel { transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 160ms ease; }
.quick-add-enter-from, .quick-add-leave-to { opacity: 0; }
.quick-add-enter-from .section-panel { opacity: 0; transform: translateY(8px) scale(0.97); }
</style>
