<template>
  <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-4">
    <div>
      <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Feature Flags & Module Access</h3>
      <p class="text-[10px] text-slate-500 dark:text-slate-400">Enable or disable module modules organization-wide. Changes update navigation menus and route accesses instantly.</p>
    </div>

    <div class="divide-y divide-default">
      <div
        v-for="flag in flags"
        :key="flag.key"
        class="py-3.5 flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors rounded-lg px-2"
      >
        <div class="space-y-0.5 max-w-[80%]">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ flag.label }}</span>
            <span
              v-if="modelValue && modelValue[flag.key]"
              class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40"
            >
              Active
            </span>
            <span
              v-else
              class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-450 border border-default"
            >
              Inactive
            </span>
          </div>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">{{ flag.description }}</p>
        </div>

        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            :checked="modelValue && modelValue[flag.key]"
            @change="toggleFlag(flag.key)"
            class="sr-only peer"
          />
          <div class="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, required: true }
});

const emit = defineEmits(['update:modelValue', 'change']);

const flags = [
  {
    key: 'whatsappModule',
    label: 'WhatsApp Cloud API Module',
    description: 'Enables custom templates syncing, Meta cloud integrations, automated WhatsApp message workflows, and dashboard logs.'
  },
  {
    key: 'commissionModule',
    label: 'Commission Tracking & Splits',
    description: 'Enables revenue forecast metrics, collection ledgers, payout calculators, chargeback logs, and agent split policies.'
  },
  {
    key: 'reportsModule',
    label: 'Reports & Analytics Dashboard',
    description: 'Provides deep aggregates charting, custom report builders, export logs queues, and automated export scheduling.'
  },
  {
    key: 'automationEngine',
    label: 'Automation Workflow Engine',
    description: 'Enables custom webhook testers, triggers-to-actions rules builders, and lead scoring weights parameters.'
  },
  {
    key: 'apiAccess',
    label: 'Developer API Keys Access',
    description: 'Allows organization to generate API keys, configure webhooks callbacks receivers, and export database backends.'
  }
];

function toggleFlag(key) {
  const updated = {
    ...(props.modelValue || {}),
    [key]: !(props.modelValue && props.modelValue[key])
  };
  emit('update:modelValue', updated);
  emit('change', updated);
}
</script>
