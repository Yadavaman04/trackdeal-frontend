<template>
  <div v-if="agreement" class="space-y-6 pb-20 animate-fade-in print:p-0 print:m-0">
    <!-- ── Top Action Header (Hidden on Print) ─────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
      <!-- Breadcrumb & Title -->
      <div class="flex items-center gap-2.5">
        <router-link to="/app/agreements" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <PhArrowLeft :size="18" />
        </router-link>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ agreement.agreementNumber }}</h1>
            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              v{{ agreement.currentVersionNumber || 1 }}.0
            </span>
            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 uppercase border border-blue-200 dark:border-blue-800">
              {{ agreement.pageSettings?.pageSize || 'A4' }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ agreement.agreementType }} • {{ agreement.structuredData?.property?.buildingName || 'Property Agreement' }}
          </p>
        </div>
      </div>

      <!-- Action Buttons Bar -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Status Dropdown -->
        <select
          v-model="agreement.status"
          @change="handleStatusChange"
          class="bg-surface border border-default rounded-xl px-3 py-2 text-xs font-bold focus:outline-none shadow-xs"
          :class="getStatusSelectClass(agreement.status)"
        >
          <option value="draft">Draft</option>
          <option value="under_review">Under Review</option>
          <option value="ready_for_print">Ready for Print</option>
          <option value="executed">Executed & Signed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div v-if="agreement.status === 'executed'" class="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl shadow-xs">
          <PhLockKey :size="16" class="text-amber-600 shrink-0" />
          <span>Executed & Signed (Locked)</span>
        </div>

        <router-link
          v-if="agreement.status !== 'executed'"
          :to="`/app/agreements/${agreement._id}/edit-details`"
          class="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-surface hover:bg-slate-50 dark:hover:bg-slate-800 border border-default rounded-xl transition flex items-center gap-1.5 shadow-xs"
        >
          <PhPencilSimple :size="15" />
          Edit Details
        </router-link>

        <router-link
          v-if="agreement.status !== 'executed'"
          :to="`/app/agreements/${agreement._id}/editor`"
          class="px-3.5 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-xl transition flex items-center gap-1.5 shadow-xs"
        >
          <PhFileDoc :size="15" weight="duotone" />
          Edit Full Agreement
        </router-link>

        <button
          @click="handleDownloadDocx"
          :disabled="isDownloadingDocx"
          class="px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <PhSpinner v-if="isDownloadingDocx" :size="15" class="animate-spin" />
          <PhDownloadSimple v-else :size="15" weight="bold" />
          <span>{{ isDownloadingDocx ? 'Exporting...' : 'Word (.doc)' }}</span>
        </button>

        <button
          @click="triggerPrint"
          class="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-opacity-90 active:scale-95 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <PhPrinter :size="16" weight="bold" />
          Print Agreement
        </button>
      </div>
    </div>

    <!-- ── Workspace Layout: Left Outline + Right Physical Paper ───────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block">
      <!-- Left: Document Outline (Sticky Nav, Hidden on Print) -->
      <div class="lg:col-span-3 bg-surface border border-default rounded-3xl p-4 shadow-sm sticky top-6 space-y-3 print:hidden">
        <div class="flex items-center justify-between border-b border-default pb-2">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <PhList :size="15" class="text-primary-600" />
            Document Outline
          </span>
          <span class="text-[10px] font-mono text-slate-400">{{ agreement.clauses?.length || 0 }} Sections</span>
        </div>

        <nav class="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
          <button
            v-for="(clause, idx) in agreement.clauses"
            :key="idx"
            @click="scrollToClause(clause.clauseId || idx)"
            class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition flex items-start gap-2 group"
          >
            <span class="text-[10px] font-mono text-slate-400 group-hover:text-primary-600 mt-0.5 shrink-0">{{ idx + 1 }}.</span>
            <span class="truncate leading-tight">{{ clause.title }}</span>
          </button>
        </nav>
      </div>

      <!-- Right: Formatted Legal Document Canvas -->
      <div class="lg:col-span-9 print:w-full print:m-0 flex flex-col items-center">
        <div
          id="a4-document-canvas"
          class="relative bg-white text-slate-900 border border-slate-200 shadow-sm rounded-sm p-8 sm:p-14 font-serif leading-relaxed text-[11pt] mx-auto print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none overflow-hidden"
          :style="getPreviewCanvasStyle()"
        >
          <!-- DRAFT Watermark Overlay -->
          <div
            v-if="agreement.status === 'draft' || agreement.status === 'under_review'"
            class="draft-watermark"
          >
            DRAFT
          </div>

          <table class="w-full border-collapse legal-print-table relative z-10">
            <thead class="hidden print:table-header-group print-page-header">
              <tr>
                <td class="h-0 print:h-[20mm] border-none p-0"></td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border-none p-0">
                  <!-- Document Clauses Sequence -->
                  <div
                    v-for="(clause, idx) in agreement.clauses"
                    :key="idx"
                    :id="`section-${clause.clauseId || idx}`"
                    class="clause-block mb-6 relative"
                  >
                    <!-- Render Formatted Legal Clause directly without any HTML tags exposed -->
                    <div v-html="clause.content" class="legal-clause-content"></div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot class="hidden print:table-footer-group print-page-footer">
              <tr>
                <td class="h-0 print:h-[20mm] border-none p-0"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  PhArrowLeft,
  PhPencilSimple,
  PhFileDoc,
  PhDownloadSimple,
  PhPrinter,
  PhList,
  PhSpinner,
  PhLockKey,
} from '@phosphor-icons/vue';
import apiClient from '@/api/client';

const route = useRoute();
const agreement = ref(null);
const isDownloadingDocx = ref(false);

const fetchAgreement = async () => {
  try {
    const res = await apiClient.get(`/agreements/${route.params.id}`);
    agreement.value = res.data?.data || res.data;
  } catch (err) {
    console.error('Failed to load agreement:', err);
  }
};

onMounted(() => {
  fetchAgreement();
});

const scrollToClause = (id) => {
  const el = document.getElementById(`section-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const handleStatusChange = async () => {
  try {
    await apiClient.patch(`/agreements/${agreement.value._id}/status`, {
      status: agreement.value.status,
    });
  } catch (err) {
    console.error('Failed to update status:', err);
  }
};

const handleDownloadDocx = async () => {
  if (!agreement.value?._id || isDownloadingDocx.value) return;
  isDownloadingDocx.value = true;
  try {
    const res = await apiClient.get(`/agreements/${agreement.value._id}/docx`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const agrNum = (agreement.value.agreementNumber || 'Agreement').replace(/[^a-zA-Z0-9_-]/g, '_');
    const buyerName = (agreement.value.structuredData?.transferees?.[0]?.name || 'Buyer').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${agrNum}_${buyerName}.doc`;
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download Word document:', err);
  } finally {
    isDownloadingDocx.value = false;
  }
};

const triggerPrint = () => {
  window.print();
};

const getPreviewCanvasStyle = () => {
  const ps = agreement.value?.pageSettings || { pageSize: 'a4', orientation: 'portrait', margins: 'normal', fontFamily: 'book_antiqua', fontSize: 11 };
  let width = '794px';
  let minHeight = '1123px';
  let padding = '25.4mm';

  if (ps.pageSize === 'legal') {
    width = ps.orientation === 'landscape' ? '1344px' : '816px';
    minHeight = ps.orientation === 'landscape' ? '816px' : '1344px';
  } else if (ps.pageSize === 'letter') {
    width = ps.orientation === 'landscape' ? '1056px' : '816px';
    minHeight = ps.orientation === 'landscape' ? '816px' : '1056px';
  } else {
    width = ps.orientation === 'landscape' ? '1123px' : '794px';
    minHeight = ps.orientation === 'landscape' ? '794px' : '1123px';
  }

  if (ps.margins === 'narrow') padding = '12.7mm';
  else if (ps.margins === 'moderate') padding = '19.0mm';

  let fontCss = "'Book Antiqua', 'Times New Roman', serif";
  switch (ps.fontFamily) {
    case 'times_new_roman': fontCss = "'Times New Roman', Times, serif"; break;
    case 'garamond': fontCss = "Garamond, 'EB Garamond', Georgia, serif"; break;
    case 'georgia': fontCss = "Georgia, 'Times New Roman', serif"; break;
    case 'baskerville': fontCss = "Baskerville, 'Baskerville Old Face', Georgia, serif"; break;
    case 'arial': fontCss = "Arial, 'Helvetica Neue', Helvetica, sans-serif"; break;
    case 'calibri': fontCss = "Calibri, 'Carlito', Arial, sans-serif"; break;
    case 'helvetica': fontCss = "'Helvetica Neue', Helvetica, Arial, sans-serif"; break;
    default: fontCss = "'Book Antiqua', 'Times New Roman', serif";
  }

  return {
    width,
    minHeight,
    padding,
    fontFamily: fontCss,
    fontSize: `${ps.fontSize || 11}pt`,
  };
};

const getStatusSelectClass = (st) => {
  switch (st) {
    case 'ready_for_print':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'executed':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'under_review':
      return 'text-purple-700 bg-purple-50 border-purple-200';
    default:
      return 'text-amber-700 bg-amber-50 border-amber-200';
  }
};
</script>

<style>
/* ── Legal Document Screen & Print Styling ─────────────────────────────────── */
@media print {
  @page {
    size: auto;
    /* margin: 0 strips browser header (date, title) & footer (URL, page #) */
    margin: 0;
  }

  body {
    background: #ffffff !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  #a4-document-canvas {
    width: 100% !important;
    max-width: 100% !important;
    min-height: auto !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 20mm !important;
    padding-right: 20mm !important;
    margin: 0 !important;
    border: none !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    background: #ffffff !important;
    color: #000000 !important;
  }

  .legal-print-table {
    width: 100% !important;
    border: none !important;
    border-collapse: collapse !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .legal-print-table thead.print-page-header {
    display: table-header-group !important;
  }

  .legal-print-table thead.print-page-header td {
    height: 20mm !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
  }

  .legal-print-table tfoot.print-page-footer {
    display: table-footer-group !important;
  }

  .legal-print-table tfoot.print-page-footer td {
    height: 20mm !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
  }

  .clause-block {
    page-break-inside: auto;
    break-inside: auto;
    margin-bottom: 14px !important;
  }

  .legal-clause-content h1,
  .legal-clause-content h2,
  .legal-clause-content h3 {
    page-break-after: avoid;
    break-after: avoid;
  }

  .legal-clause-content table,
  .legal-clause-content .signature-block,
  .legal-clause-content .witness-block {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}

.legal-clause-content {
  font-family: inherit;
  color: #111827;
}

.legal-clause-content p {
  text-align: justify;
  line-height: 1.85;
  margin-bottom: 12px;
  font-size: inherit;
}

.legal-clause-content ol,
.legal-clause-content ul {
  margin-left: 28px;
  line-height: 1.85;
  margin-bottom: 12px;
}

.legal-clause-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 10.5pt;
}

.legal-clause-content table th,
.legal-clause-content table td {
  border: 1px solid #d1d5db;
  padding: 8px 12px;
}

.draft-watermark {
  position: absolute;
  top: 42%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-35deg);
  font-size: 110pt;
  font-weight: 900;
  font-family: system-ui, -apple-system, sans-serif;
  color: rgba(203, 213, 225, 0.28);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  pointer-events: none;
  user-select: none;
  z-index: 1;
  white-space: nowrap;
}

@media print {
  .draft-watermark {
    display: block !important;
    position: fixed !important;
    top: 45% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) rotate(-35deg) !important;
    font-size: 120pt !important;
    color: rgba(148, 163, 184, 0.25) !important;
  }
}

.legal-clause-content table th {
  background-color: #f9fafb;
  font-weight: bold;
}
</style>

