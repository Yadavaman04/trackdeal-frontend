<template>
  <article class="bento-card"><slot /></article>
</template>

<style scoped>
/* Aceternity's bento composition, adapted for Vue and a quieter product surface. */
.bento-card { position: relative; overflow: hidden; border: 1px solid hsl(var(--neutral-100)); border-radius: 18px; padding: 28px; background: hsl(var(--bg-surface)); transition: border-color 200ms ease, box-shadow 200ms ease; }
.bento-card:hover { border-color: hsl(var(--accent-200)); box-shadow: 0 12px 32px #163b2f08; }
@media (max-width: 640px) { .bento-card { padding: 22px; } }
@media (prefers-reduced-motion: reduce) { .bento-card { transition: none; } }
</style>
