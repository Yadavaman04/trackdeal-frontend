<template>
  <div
    class="border rounded-card shadow-sm flex flex-col"
    style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
  >
    <!-- Card Header -->
    <div
      class="flex items-center justify-between px-5 py-3.5 border-b shrink-0"
      style="border-color: hsl(var(--neutral-100));"
    >
      <div>
        <h3 class="text-h4 font-semibold" style="color: hsl(var(--neutral-900));">{{ title }}</h3>
        <p v-if="subtitle" class="text-body-sm mt-0.5" style="color: hsl(var(--neutral-400));">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <!-- Card Body -->
    <div class="flex-1 min-h-0">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
});
</script>
