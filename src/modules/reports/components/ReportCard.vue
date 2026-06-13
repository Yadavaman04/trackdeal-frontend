<template>
  <div class="bg-surface border border-default rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-xs space-y-3.5 group">
    <div class="space-y-1.5">
      <div class="flex justify-between items-start">
        <h4 class="font-heading font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors text-sm">
          {{ report.name }}
        </h4>
        <button 
          @click.stop="toggleFavorite"
          class="btn btn-sm btn-ghost p-1 h-7 w-7 text-slate-300 dark:text-slate-700 hover:text-amber-500 transition-transform hover:scale-110"
          :class="{ 'text-amber-400': isFav }"
          title="Toggle Favorite"
        >
          <PhStar :size="14" :weight="isFav ? 'fill' : 'regular'" />
        </button>
      </div>
      <p class="text-slate-500 dark:text-slate-400 leading-normal font-medium text-[11px]">{{ report.description }}</p>
    </div>

    <div class="flex justify-between items-center border-t border-dashed border-default pt-3">
      <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
        Category: {{ report.category }}
      </span>
      <div class="flex items-center space-x-1">
        <button 
          @click.stop="shareReport"
          class="btn btn-sm btn-ghost text-slate-450 hover:text-slate-700 text-[10px] h-6 px-1.5 gap-1"
          title="Share Report Link"
        >
          <PhShare :size="11" />
          <span>Share</span>
        </button>
        <router-link 
          :to="report.to"
          class="btn btn-sm btn-ghost text-primary text-[10px] h-6 px-1.5 gap-1 font-bold"
        >
          <span>View</span>
          <PhArrowRight :size="11" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { PhStar, PhShare, PhArrowRight } from '@phosphor-icons/vue';

const props = defineProps({
  report: { type: Object, required: true }
});

const store = useStore();
const isFav = ref(props.report.favorite || false);

const toggleFavorite = () => {
  isFav.value = !isFav.value;
  store.dispatch('notifications/triggerToast', {
    message: isFav.value ? `${props.report.name} added to favorites.` : `${props.report.name} removed from favorites.`,
    type: 'success'
  });
};

const shareReport = () => {
  // Share link simulation
  const shareLink = window.location.origin + props.report.to;
  navigator.clipboard.writeText(shareLink).then(() => {
    store.dispatch('notifications/triggerToast', {
      message: 'Report link copied to clipboard. Ready to share via WhatsApp/Email.',
      type: 'success'
    });
  }).catch(() => {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to copy share link.',
      type: 'error'
    });
  });
};
</script>
