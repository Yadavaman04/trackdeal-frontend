<template>
  <div class="space-y-4">
    <!-- Matching Portfolio Properties Panel -->
    <MatchingPropertiesPanel 
      :lead="lead" 
      :requirements="lead.requirements" 
      :buyerRequirement="lead.buyerRequirement" 
      :budget="lead.budget" 
    />
  </div>
</template>

<script setup>
import MatchingPropertiesPanel from './MatchingPropertiesPanel.vue';

defineProps({
  lead: { type: Object, required: true },
  activities: { type: Array, default: () => [] },
  tasks: { type: Array, default: () => [] }
});
</script>
