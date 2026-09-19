<template>
  <div class="relative w-full">
    <div class="flex items-center gap-1.5">
      <select
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        class="flex-1 h-9 px-3 rounded-md border text-body-sm outline-none transition-all cursor-pointer"
        :class="[disabled ? 'opacity-50 cursor-not-allowed' : '']"
        style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
        :disabled="disabled || isLoading"
      >
        <option value="">{{ placeholder }}</option>
        <option
          v-for="agent in agentsList"
          :key="agent._id"
          :value="agent._id"
        >
          {{ agent.name }} — {{ agent.officeName }} ({{ agent.city || 'CP' }})
        </option>
      </select>

      <!-- Quick Add Button -->
      <button
        v-if="showQuickAdd"
        type="button"
        @click="modalOpen = true"
        class="h-9 px-2.5 rounded-md border text-caption font-semibold shrink-0 transition-colors flex items-center gap-1"
        style="border-color: hsl(var(--accent-200)); background-color: hsl(var(--accent-50)); color: hsl(var(--accent-700));"
        title="Add new Agent or Channel Partner"
      >
        <PhUserPlus :size="15" />
        <span class="hidden sm:inline">+ Create</span>
      </button>
    </div>

    <!-- Quick Create Modal -->
    <AgentQuickCreateModal
      :open="modalOpen"
      @close="modalOpen = false"
      @created="handleAgentCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PhUserPlus } from '@phosphor-icons/vue';
import { useActiveAgentsQuery } from '@/modules/agents/queries';
import AgentQuickCreateModal from '@/modules/agents/components/AgentQuickCreateModal.vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Select Agent / Channel Partner...' },
  showQuickAdd: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'change']);

const modalOpen = ref(false);
const { data: activeAgentsRes, isLoading } = useActiveAgentsQuery();

const agentsList = computed(() => activeAgentsRes.value?.data || []);

const handleAgentCreated = (newAgent) => {
  emit('update:modelValue', newAgent._id);
  emit('change', newAgent);
};
</script>
