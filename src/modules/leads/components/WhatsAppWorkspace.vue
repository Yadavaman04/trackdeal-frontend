<template>
  <div class="border border-emerald-100 dark:border-emerald-950 bg-emerald-50/10 dark:bg-slate-900 rounded-xl overflow-hidden shadow-xs flex flex-col h-[400px]">
    <!-- Green Workspace Header -->
    <header class="bg-emerald-600 px-4 py-2.5 flex items-center justify-between text-white shrink-0">
      <div class="flex items-center space-x-2">
        <span class="text-base">💬</span>
        <div>
          <h4 class="text-xs font-bold font-heading">WhatsApp Business Workspace</h4>
          <span class="text-[9px] text-emerald-150">Active Chat with {{ leadName }}</span>
        </div>
      </div>
      <span class="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
    </header>

    <!-- Scrollable Chat Bubble Area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-slate-50/50">
      <div 
        v-for="(msg, idx) in chatHistory" 
        :key="idx"
        class="flex flex-col max-w-[80%] rounded-lg p-2.5 text-xs shadow-xs"
        :class="[
          msg.direction === 'outgoing'
            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-slate-800 dark:text-emerald-300 ml-auto rounded-tr-none border border-emerald-200/50'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 mr-auto rounded-tl-none border border-default'
        ]"
      >
        <p>{{ msg.text }}</p>
        <span class="text-[8px] text-slate-400 dark:text-slate-500 self-end mt-1 font-medium">
          {{ msg.time }}
        </span>
      </div>
    </div>

    <!-- Actions Footer Panels -->
    <div class="p-3 border-t border-default bg-surface space-y-3 shrink-0">
      <!-- Templates Select dropdown -->
      <div class="flex items-center justify-between">
        <select 
          v-model="selectedTemplate" 
          @change="applyTemplate"
          class="bg-surface border border-default rounded-lg px-2.5 py-1 text-[10px] outline-none text-slate-700 dark:text-slate-200 font-semibold"
        >
          <option value="">Select Message Template...</option>
          <option value="welcome">Initial Welcome & Introduction</option>
          <option value="visit">Schedule Site Visit Appointment</option>
          <option value="followup">Document Submission Follow-up</option>
        </select>
        
        <!-- Schedule toggle check -->
        <label class="flex items-center space-x-1 cursor-pointer select-none">
          <input 
            type="checkbox" 
            v-model="isScheduling" 
            class="rounded border-default text-emerald-600 focus:ring-emerald-500"
          />
          <span class="text-[10px] font-bold text-slate-500 hover:text-slate-700">Schedule Follow-up</span>
        </label>
      </div>

      <!-- Scheduling input row -->
      <div v-if="isScheduling" class="flex items-center space-x-2 bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-default">
        <input 
          v-model="scheduledTime"
          type="datetime-local"
          class="bg-surface border border-default rounded px-2 py-1 text-[10px] outline-none text-slate-700 dark:text-slate-200"
        />
        <span class="text-[9px] text-slate-400">Task will be queued for this time.</span>
      </div>

      <!-- Send input row -->
      <div class="flex space-x-2">
        <input 
          v-model="messageText"
          type="text" 
          placeholder="Type WhatsApp message here..."
          @keyup.enter="sendMessage"
          class="flex-1 bg-surface border border-default rounded-lg px-3 py-1.5 text-xs placeholder-slate-400 outline-none text-slate-750 focus:border-emerald-500 transition-colors"
        />
        <button 
          @click="sendMessage"
          :disabled="!messageText.trim()"
          class="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  leadId: { type: String, required: true },
  leadName: { type: String, required: true }
});

const emit = defineEmits(['logActivity', 'scheduleOutreach']);

const selectedTemplate = ref('');
const messageText = ref('');
const isScheduling = ref(false);
const scheduledTime = ref('');

const templates = {
  welcome: `Hi ${props.leadName}, this is Sonia from Track Deal CRM. Thank you for expressing interest. I'd love to understand your property requirements better. Let's connect today.`,
  visit: `Hi ${props.leadName}, would you be available for a site visit to Prestige Heights this Saturday at 11 AM? I can arrange a pickup.`,
  followup: `Hi ${props.leadName}, just following up to check if you had a chance to review the floor plans we sent. Let me know if you have any questions.`
};

const chatHistory = ref([
  { text: `Welcome lead registered from website portal source.`, direction: 'incoming', time: '10:00 AM' },
  { text: `Hi Sonia, I am looking for a 3BHK unit in South Bangalore. Budget is around 1.5 Cr.`, direction: 'incoming', time: '10:02 AM' },
  { text: `Sure Anand! Let me scan our inventory projects list and share details.`, direction: 'outgoing', time: '10:05 AM' }
]);

const applyTemplate = () => {
  if (selectedTemplate.value && templates[selectedTemplate.value]) {
    messageText.value = templates[selectedTemplate.value];
  }
};

const sendMessage = () => {
  const text = messageText.value.trim();
  if (!text) return;

  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Add to local chat timeline bubbles
  chatHistory.value.push({
    text,
    direction: 'outgoing',
    time: now
  });

  if (isScheduling.value && scheduledTime.value) {
    emit('scheduleOutreach', {
      scheduledAt: new Date(scheduledTime.value).toISOString(),
      type: 'whatsapp',
      notes: text
    });
    isScheduling.value = false;
    scheduledTime.value = '';
  } else {
    emit('logActivity', {
      type: 'whatsapp',
      description: `WhatsApp Message Sent: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`,
      metadata: { text }
    });
  }

  // Clear inputs
  messageText.value = '';
  selectedTemplate.value = '';
};
</script>
