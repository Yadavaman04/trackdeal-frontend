<template>
  <div class="grid grid-cols-12 gap-6">
    <!-- Template Editor Form (Left Side) -->
    <div class="col-span-12 lg:col-span-7 bg-surface border border-default rounded-xl p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-default pb-3">
        <div>
          <h3 class="text-xs font-bold text-slate-800">Template Editor</h3>
          <p class="text-[10px] text-slate-500">Edit and save notification layouts with merge tags.</p>
        </div>
        <div class="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-default">
          <button
            type="button"
            @click="editorMode = 'whatsapp'"
            class="btn btn-sm text-[10px] h-6 px-3.5 font-bold"
            :class="editorMode === 'whatsapp' ? 'bg-white dark:bg-slate-800 shadow-xs text-primary' : 'btn-ghost text-slate-500'"
          >
            WhatsApp
          </button>
          <button
            type="button"
            @click="editorMode = 'email'"
            class="btn btn-sm text-[10px] h-6 px-3.5 font-bold"
            :class="editorMode === 'email' ? 'bg-white dark:bg-slate-800 shadow-xs text-primary' : 'btn-ghost text-slate-500'"
          >
            Email
          </button>
        </div>
      </div>

      <!-- General details -->
      <div class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-1">Template Name *</label>
            <input
              v-model="activeTemplate.name"
              type="text"
              placeholder="e.g. site_visit_details"
              class="w-full bg-slate-50 border border-default rounded-md px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800 font-medium"
            />
          </div>
          <div v-if="editorMode === 'email'">
            <label class="block text-[10px] font-bold text-slate-500 mb-1">Email Subject *</label>
            <input
              v-model="activeTemplate.subject"
              type="text"
              placeholder="e.g. Confirming your Booking details"
              class="w-full bg-slate-50 border border-default rounded-md px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
            />
          </div>
          <div v-if="editorMode === 'whatsapp'">
            <label class="block text-[10px] font-bold text-slate-500 mb-1">Category</label>
            <select
              v-model="activeTemplate.category"
              class="w-full bg-slate-50 border border-default rounded-md px-3 py-1.5 text-xs outline-none focus:border-primary text-slate-800"
            >
              <option value="UTILITY">UTILITY</option>
              <option value="MARKETING">MARKETING</option>
              <option value="AUTHENTICATION">AUTHENTICATION</option>
            </select>
          </div>
        </div>

        <!-- Merge Tags Selector -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-1.5">Click to Inject Variable Tags</label>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="tag in activeTags"
              :key="tag.value"
              type="button"
              @click="injectTag(tag.value)"
              class="btn btn-sm btn-ghost text-blue-600 bg-blue-50/50 hover:bg-blue-100/70 border border-blue-200/40 rounded text-[9px] h-6 px-2.5 font-bold"
            >
              {{ tag.label }}
            </button>
          </div>
        </div>

        <!-- Template Body -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-1">Message Body *</label>
          <textarea
            ref="bodyTextarea"
            v-model="activeTemplate.body"
            rows="6"
            placeholder="Write template content here. Use the buttons above to inject merge variables."
            class="w-full bg-slate-50 border border-default rounded-lg px-3 py-2 text-xs outline-none focus:border-primary text-slate-800 font-mono"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end space-x-2 pt-2 border-t border-default">
        <button
          type="button"
          @click="resetForm"
          class="btn-md btn-secondary"
        >
          Reset
        </button>
        <button
          type="button"
          @click="save"
          class="btn-md btn-primary"
        >
          Save Template
        </button>
      </div>
    </div>

    <!-- Live Preview Canvas (Right Side) -->
    <div class="col-span-12 lg:col-span-5 flex flex-col items-center justify-start space-y-4">
      <h4 class="text-xs font-bold text-slate-700 self-start">Live Simulated Preview</h4>

      <!-- WhatsApp Mobile Screen Mockup -->
      <div v-if="editorMode === 'whatsapp'" class="w-[280px] h-[500px] border-[8px] border-slate-800 rounded-[30px] bg-slate-100 shadow-xl overflow-hidden flex flex-col relative">
        <!-- Phone Notch / Camera -->
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl z-20"></div>

        <!-- Phone Header / Status -->
        <div class="h-10 bg-emerald-700 pt-3 px-4 flex items-center justify-between text-white shrink-0 z-10">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
            <span class="text-[9px] font-bold tracking-wider">Track Deal Support</span>
          </div>
          <span class="text-[9px] font-semibold">12:00 PM</span>
        </div>

        <!-- Chat area -->
        <div class="flex-1 p-3 overflow-y-auto bg-[radial-gradient(#dcf8c6_1px,transparent_1px)] [background-size:16px_16px] bg-emerald-50/50 flex flex-col justify-end space-y-2">
          <!-- WhatsApp Speech bubble -->
          <div class="bg-white border border-slate-200 rounded-xl rounded-tl-none p-3 max-w-[85%] text-[10px] text-slate-800 shadow-xs self-start leading-relaxed relative">
            <!-- Left bubble tail -->
            <div class="absolute top-0 -left-1.5 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent"></div>
            <!-- Bubble Body with rendered tags -->
            <div class="whitespace-pre-line">{{ renderedWhatsAppBody }}</div>
            <div class="text-[8px] text-slate-400 text-right mt-1 font-semibold">12:00 PM</div>
          </div>
        </div>

        <!-- Phone Input simulation -->
        <div class="h-10 bg-slate-200 border-t border-slate-300 p-1 flex items-center shrink-0">
          <div class="flex-1 bg-white rounded-full h-8 px-3 text-[9px] text-slate-400 flex items-center">Message</div>
          <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs ml-1 font-bold">▶</div>
        </div>
      </div>

      <!-- Email Preview Browser Mockup -->
      <div v-else class="w-full border border-default rounded-xl bg-white shadow-lg overflow-hidden flex flex-col">
        <!-- Browser Header -->
        <div class="h-8 bg-slate-100 border-b border-default px-4 flex items-center space-x-2 shrink-0">
          <div class="flex space-x-1">
            <span class="w-2 h-2 rounded-full bg-red-400"></span>
            <span class="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span class="w-2 h-2 rounded-full bg-green-400"></span>
          </div>
          <div class="bg-white border border-default rounded-md px-2 py-0.5 text-[9px] text-slate-400 flex-1 truncate max-w-xs">
            https://crm.trackdeal.com/mail-preview
          </div>
        </div>
        <!-- Email envelope header -->
        <div class="p-3 border-b border-default bg-slate-50 text-[10px] text-slate-600 space-y-1">
          <div><strong class="text-slate-800">From:</strong> Track Deal Notification &lt;system@trackdeal.com&gt;</div>
          <div><strong class="text-slate-800">Subject:</strong> {{ activeTemplate.subject || '(No Subject)' }}</div>
        </div>
        <!-- Email Rendered Body -->
        <div class="p-4 bg-white min-h-[220px] overflow-y-auto text-xs text-slate-700 leading-relaxed">
          <div v-html="renderedEmailBody"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  whatsappTemplates: { type: Array, default: () => [] },
  emailTemplates: { type: Array, default: () => [] }
});

const emit = defineEmits(['save']);

const editorMode = ref('whatsapp');
const bodyTextarea = ref(null);

const defaultWhatsApp = {
  id: null,
  name: '',
  category: 'UTILITY',
  body: 'Dear {{lead_name}}, your appointment is scheduled at {{project_name}} for {{booking_value}}.'
};

const defaultEmail = {
  id: null,
  name: '',
  subject: '',
  body: '<p>Dear {{lead_name}},</p><p>Congratulations! We have enqueued your booking for <strong>{{project_name}}</strong> with valuation <strong>{{booking_value}}</strong>.</p>'
};

const activeTemplate = ref({ ...defaultWhatsApp });

// Load default based on mode change
watch(editorMode, (newMode) => {
  if (newMode === 'whatsapp') {
    if (props.whatsappTemplates.length > 0) {
      activeTemplate.value = { ...props.whatsappTemplates[0] };
    } else {
      activeTemplate.value = { ...defaultWhatsApp };
    }
  } else {
    if (props.emailTemplates.length > 0) {
      activeTemplate.value = { ...props.emailTemplates[0] };
    } else {
      activeTemplate.value = { ...defaultEmail };
    }
  }
});

// Watch templates from parent to select first
watch(() => props.whatsappTemplates, (list) => {
  if (editorMode.value === 'whatsapp' && list.length > 0 && !activeTemplate.value.id) {
    activeTemplate.value = { ...list[0] };
  }
}, { immediate: true });

watch(() => props.emailTemplates, (list) => {
  if (editorMode.value === 'email' && list.length > 0 && !activeTemplate.value.id) {
    activeTemplate.value = { ...list[0] };
  }
}, { immediate: true });

const tagsConfig = {
  whatsapp: [
    { label: 'Lead Name', value: '{{lead_name}}' },
    { label: 'Project Name', value: '{{project_name}}' },
    { label: 'Booking Value', value: '{{booking_value}}' },
    { label: 'Agent Name', value: '{{agent_name}}' }
  ],
  email: [
    { label: 'Applicant Name', value: '{{Primary_Applicant_Name}}' },
    { label: 'Allotment Date', value: '{{Allotment_Date}}' },
    { label: 'Dues Outstanding', value: '{{Dues_Outstanding}}' },
    { label: 'Lead Name', value: '{{lead_name}}' },
    { label: 'Project Name', value: '{{project_name}}' }
  ]
};

const activeTags = computed(() => tagsConfig[editorMode.value]);

// Generate Preview replacements
const mockValues = {
  '{{lead_name}}': 'Rajesh Gupta',
  '{{project_name}}': 'Green Meadows Phase-I',
  '{{booking_value}}': '₹1.5 Crores',
  '{{agent_name}}': 'John Doe',
  '{{Primary_Applicant_Name}}': 'Rajesh Gupta',
  '{{Allotment_Date}}': 'June 10, 2026',
  '{{Dues_Outstanding}}': '₹12,45,000'
};

const renderedWhatsAppBody = computed(() => {
  let content = activeTemplate.value.body || '';
  // Meta uses numeric variables like {{1}} sometimes. Let's map tag replacements and generic numbers
  Object.keys(mockValues).forEach(tag => {
    content = content.replaceAll(tag, mockValues[tag]);
  });
  // Replace generic curly params
  content = content.replaceAll('{{1}}', mockValues['{{lead_name}}']);
  content = content.replaceAll('{{2}}', mockValues['{{project_name}}']);
  content = content.replaceAll('{{3}}', mockValues['{{booking_value}}']);
  content = content.replaceAll('{{4}}', 'PB-9014');
  return content;
});

const renderedEmailBody = computed(() => {
  let content = activeTemplate.value.body || '';
  Object.keys(mockValues).forEach(tag => {
    content = content.replaceAll(tag, mockValues[tag]);
  });
  return content;
});

function injectTag(tagValue) {
  const textarea = bodyTextarea.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = activeTemplate.value.body || '';
  const before = text.substring(0, start);
  const after = text.substring(end, text.length);

  activeTemplate.value.body = before + tagValue + after;

  // Refocus and place cursor after injected tag
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + tagValue.length;
  }, 10);
}

function resetForm() {
  if (editorMode.value === 'whatsapp') {
    activeTemplate.value = { ...defaultWhatsApp };
  } else {
    activeTemplate.value = { ...defaultEmail };
  }
}

function save() {
  if (!activeTemplate.value.name) {
    alert('Please provide a name');
    return;
  }
  emit('save', {
    mode: editorMode.value,
    template: activeTemplate.value
  });
}
</script>
