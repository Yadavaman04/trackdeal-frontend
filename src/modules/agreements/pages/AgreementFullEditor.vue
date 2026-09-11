<template>
  <div v-if="agreement" class="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans pb-16">
    <!-- ── 1. Top Ribbon Header ─────────────────────────────────────────────── -->
    <header class="bg-surface border-b border-default sticky top-0 z-30 shadow-xs">
      <div v-if="agreement.status === 'executed'" class="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
        <PhLockKey :size="16" class="text-amber-600 shrink-0" />
        <span>Agreement Executed & Signed (Locked from editing)</span>
      </div>

      <!-- Top Row: Title, Status, Action Buttons -->
      <div class="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-default/60">
        <div class="flex items-center gap-3">
          <router-link
            :to="`/app/agreements/${agreement._id}`"
            class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Exit Editor & View Preview"
          >
            <PhArrowLeft :size="18" />
          </router-link>

          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-slate-900 dark:text-white">{{ agreement.agreementNumber }}</span>
            <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              v{{ agreement.currentVersionNumber || 1 }}.0
            </span>
            <span v-if="agreement.status === 'executed'" class="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 uppercase">
              Locked
            </span>
          </div>

          <div class="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 border-l border-default pl-3">
            <span v-if="isAutoSaving" class="flex items-center gap-1 text-amber-600 font-medium">
              <PhSpinner :size="12" class="animate-spin" /> Saving...
            </span>
            <span v-else-if="agreement.status === 'executed'" class="flex items-center gap-1 text-amber-600 font-medium">
              <PhLockKey :size="13" /> Locked
            </span>
            <span v-else class="flex items-center gap-1 text-emerald-600 font-medium">
              <PhCheck :size="13" weight="bold" /> All changes saved
            </span>
          </div>
        </div>

        <!-- Top Right Actions -->
        <div class="flex items-center gap-2">
          <button
            @click="isVersionDrawerOpen = true"
            class="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-surface hover:bg-slate-50 dark:hover:bg-slate-800 border border-default rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <PhClockCounterClockwise :size="14" />
            History ({{ agreement.versions?.length || 1 }})
          </button>

          <a
            :href="`/api/v1/agreements/${agreement._id}/docx`"
            download
            class="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <PhDownloadSimple :size="14" weight="bold" />
            Word (.doc)
          </a>

          <button
            @click="triggerPrint"
            class="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-surface hover:bg-slate-50 dark:hover:bg-slate-800 border border-default rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <PhPrinter :size="14" />
            Print
          </button>

          <button
            v-if="agreement.status !== 'executed'"
            @click="manualSave(false)"
            :disabled="isSaving"
            class="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-opacity-90 active:scale-95 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <PhSpinner v-if="isSaving" :size="14" class="animate-spin" />
            <PhFloppyDisk v-else :size="14" weight="bold" />
            Save
          </button>

          <router-link
            :to="`/app/agreements/${agreement._id}`"
            class="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Preview
          </router-link>
        </div>
      </div>

      <!-- ── Word-Style Formatting Ribbon Toolbar ──────────────────────────── -->
      <div class="px-4 py-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/30">
        <!-- 1. Page Setup Group -->
        <div class="flex items-center gap-1 bg-surface border border-default rounded-xl px-2 py-1 shadow-2xs">
          <label class="text-[10px] font-bold uppercase text-slate-400 mr-1">Paper</label>
          <select
            v-model="pageSettings.pageSize"
            @change="handlePageSetupChange"
            class="bg-transparent font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="a4">A4 (210 × 297 mm)</option>
            <option value="legal">Legal (8.5 × 14 in)</option>
            <option value="letter">Letter (8.5 × 11 in)</option>
          </select>
        </div>

        <div class="flex items-center gap-1 bg-surface border border-default rounded-xl px-2 py-1 shadow-2xs">
          <label class="text-[10px] font-bold uppercase text-slate-400 mr-1">Margins</label>
          <select
            v-model="pageSettings.margins"
            @change="handlePageSetupChange"
            class="bg-transparent font-medium text-xs focus:outline-none cursor-pointer"
          >
            <option value="normal">Normal (1 in / 25.4mm)</option>
            <option value="narrow">Narrow (0.5 in / 12.7mm)</option>
            <option value="moderate">Moderate (0.75 in / 19mm)</option>
          </select>
        </div>

        <div class="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <!-- 2. History: Undo / Redo -->
        <div class="flex items-center gap-0.5 bg-surface border border-default rounded-xl p-0.5 shadow-2xs">
          <button @click="execCmd('undo')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Undo (Ctrl+Z)">
            <PhArrowUUpLeft :size="14" />
          </button>
          <button @click="execCmd('redo')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Redo (Ctrl+Y)">
            <PhArrowUUpRight :size="14" />
          </button>
        </div>

        <!-- 3. Font Family & Size -->
        <div class="flex items-center gap-1 bg-surface border border-default rounded-xl px-2 py-1 shadow-2xs">
          <select v-model="selectedFontFamily" @change="applyFontFamily" class="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer">
            <option value="'Book Antiqua', 'Times New Roman', serif">Book Antiqua (Classic Legal)</option>
            <option value="'Times New Roman', Times, serif">Times New Roman (Standard Legal)</option>
            <option value="Baskerville, 'Baskerville Old Face', Georgia, serif">Baskerville (Premium Legal)</option>
            <option value="Garamond, 'EB Garamond', Georgia, serif">Garamond (Formal Legal)</option>
            <option value="Georgia, 'Times New Roman', serif">Georgia (Modern Serif)</option>
            <option value="Arial, 'Helvetica Neue', Helvetica, sans-serif">Arial (Clean Sans-Serif)</option>
            <option value="Calibri, 'Carlito', Arial, sans-serif">Calibri (Modern Corporate)</option>
            <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica (Sleek Sans-Serif)</option>
          </select>
        </div>

        <div class="flex items-center gap-1 bg-surface border border-default rounded-xl px-2 py-1 shadow-2xs">
          <select v-model="selectedFontSize" @change="applyFontSize" class="bg-transparent font-mono text-xs focus:outline-none cursor-pointer">
            <option value="10pt">10 pt</option>
            <option value="11pt">11 pt</option>
            <option value="12pt">12 pt</option>
            <option value="14pt">14 pt</option>
            <option value="16pt">16 pt</option>
            <option value="18pt">18 pt</option>
          </select>
        </div>

        <!-- 4. Text Styles: Bold, Italic, Underline, Strikethrough -->
        <div class="flex items-center gap-0.5 bg-surface border border-default rounded-xl p-0.5 shadow-2xs">
          <button @click="execCmd('bold')" class="p-1.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Bold (Ctrl+B)">
            <PhTextBolder :size="14" />
          </button>
          <button @click="execCmd('italic')" class="p-1.5 italic hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Italic (Ctrl+I)">
            <PhTextItalic :size="14" />
          </button>
          <button @click="execCmd('underline')" class="p-1.5 underline hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Underline (Ctrl+U)">
            <PhTextUnderline :size="14" />
          </button>
          <button @click="execCmd('strikeThrough')" class="p-1.5 line-through hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Strikethrough">
            <PhTextStrikethrough :size="14" />
          </button>
        </div>

        <!-- 5. Paragraph Alignment -->
        <div class="flex items-center gap-0.5 bg-surface border border-default rounded-xl p-0.5 shadow-2xs">
          <button @click="execCmd('justifyLeft')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Align Left">
            <PhTextAlignLeft :size="14" />
          </button>
          <button @click="execCmd('justifyCenter')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Center">
            <PhTextAlignCenter :size="14" />
          </button>
          <button @click="execCmd('justifyRight')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Align Right">
            <PhTextAlignRight :size="14" />
          </button>
          <button @click="execCmd('justifyFull')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Justify (Legal Standard)">
            <PhTextAlignJustify :size="14" />
          </button>
        </div>

        <!-- 6. Lists & Indentation -->
        <div class="flex items-center gap-0.5 bg-surface border border-default rounded-xl p-0.5 shadow-2xs">
          <button @click="execCmd('insertUnorderedList')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Bulleted List">
            <PhListBullets :size="14" />
          </button>
          <button @click="execCmd('insertOrderedList')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Numbered List">
            <PhListNumbers :size="14" />
          </button>
          <button @click="execCmd('outdent')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Decrease Indent">
            <PhTextOutdent :size="14" />
          </button>
          <button @click="execCmd('indent')" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Increase Indent">
            <PhTextIndent :size="14" />
          </button>
        </div>

        <div class="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <!-- 7. Insert Actions Menu -->
        <button
          @click="openInsertClauseModal"
          class="px-2.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-xl transition flex items-center gap-1 shadow-2xs"
        >
          <PhPlus :size="13" weight="bold" />
          Insert Clause
        </button>

        <button
          @click="insertPageBreak"
          class="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 border border-default rounded-xl transition flex items-center gap-1 shadow-2xs"
          title="Insert Page Break"
        >
          <PhFilePlus :size="13" />
          Page Break
        </button>

        <button
          @click="insertSignatureBox"
          class="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 border border-default rounded-xl transition flex items-center gap-1 shadow-2xs"
        >
          <PhPenNib :size="13" />
          Signature Block
        </button>
      </div>
    </header>

    <!-- ── 2. Workspace Body: Left Outline Tree + Center Word Document Canvas ── -->
    <div class="max-w-[1400px] w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left: Interactive Document Outline & Section Navigator -->
      <aside class="lg:col-span-3 bg-surface border border-default rounded-3xl p-4 shadow-sm sticky top-28 space-y-3">
        <div class="flex items-center justify-between border-b border-default pb-2">
          <span class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <PhList :size="15" class="text-primary-600" />
            Document Outline
          </span>
          <span class="text-[10px] font-mono text-slate-400">{{ editableClauses.length }} Clauses</span>
        </div>

        <nav class="space-y-1 max-h-[68vh] overflow-y-auto pr-1">
          <div
            v-for="(clause, idx) in editableClauses"
            :key="idx"
            @click="scrollToClause(idx)"
            class="group flex items-center justify-between p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-[10px] font-mono text-slate-400 shrink-0">{{ idx + 1 }}.</span>
              <span class="truncate">{{ clause.title }}</span>
            </div>

            <!-- Quick Clause Actions -->
            <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition" @click.stop>
              <button
                @click="moveClauseUp(idx)"
                :disabled="idx === 0"
                class="p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-20"
                title="Move Up"
              >
                <PhCaretUp :size="12" weight="bold" />
              </button>
              <button
                @click="moveClauseDown(idx)"
                :disabled="idx === editableClauses.length - 1"
                class="p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-20"
                title="Move Down"
              >
                <PhCaretDown :size="12" weight="bold" />
              </button>
              <button
                v-if="!clause.isMandatory"
                @click="deleteClause(idx)"
                class="p-0.5 text-rose-400 hover:text-rose-600"
                title="Remove Clause"
              >
                <PhTrash :size="12" />
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <!-- Center: Physical Word-Style Document Canvas -->
      <main class="lg:col-span-9 flex flex-col items-center">
        <!-- Paper Canvas Container with Dynamic Width/Height based on Page Size -->
        <div
          :class="getCanvasClass()"
          class="bg-white text-slate-900 border border-slate-200 shadow-sm rounded-sm transition-all duration-200 relative overflow-hidden"
          :style="getCanvasStyle()"
        >
          <!-- DRAFT Watermark Overlay -->
          <div
            v-if="agreement.status === 'draft' || agreement.status === 'under_review'"
            class="draft-watermark"
          >
            DRAFT
          </div>

          <!-- Document Content Area (Direct WYSIWYG visual editing) -->
          <table class="w-full border-collapse legal-print-table relative z-10">
            <thead class="hidden print:table-header-group print-page-header">
              <tr>
                <td class="h-0 print:h-[20mm] border-none p-0"></td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border-none p-0">
                  <div
                    ref="editorRef"
                    :contenteditable="agreement.status !== 'executed'"
                    @input="handleEditorInput"
                    @blur="handleEditorBlur"
                    class="document-editor-surface min-h-[900px] focus:outline-none select-text"
                    :style="getInnerEditorStyle()"
                  >
                    <!-- Render each clause directly as formatted visual text -->
                    <section
                      v-for="(clause, idx) in editableClauses"
                      :key="idx"
                      :id="`clause-node-${idx}`"
                      class="clause-section mb-6 relative group"
                    >
                      <!-- Clause HTML Content (User clicks and edits directly!) -->
                      <div v-html="clause.content" class="clause-body"></div>
                    </section>
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

          <!-- Physical Document Footer / Page Indicator (Hidden on Print) -->
          <div class="border-t border-slate-200 mt-12 pt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono select-none print:hidden">
            <span>TrackDeal Legal Document Engine</span>
            <span>{{ pageSettings.pageSize.toUpperCase() }} • {{ pageSettings.orientation.toUpperCase() }}</span>
            <span>Page 1 of {{ totalPagesEstimated }}</span>
          </div>
        </div>
      </main>
    </div>

    <!-- ── 3. Insert Clause Modal (with Auto-Renumbering) ──────────────────── -->
    <div v-if="isInsertClauseModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-surface border border-default w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 animate-scale-up">
        <div class="flex items-center justify-between border-b border-default pb-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhPlus :size="16" class="text-primary-600" weight="bold" />
            Insert Legal Clause
          </h3>
          <button @click="isInsertClauseModalOpen = false" class="text-slate-400 hover:text-slate-600" aria-label="Close"><AppIcon name="close" :size="14" weight="bold" /></button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1">Clause Title *</label>
            <input
              v-model="newClause.title"
              type="text"
              placeholder="e.g. Special Car Parking Allocation / Fixtures"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1">Insert Position</label>
            <select
              v-model.number="newClause.insertAfterIdx"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500"
            >
              <option v-for="(c, idx) in editableClauses" :key="idx" :value="idx">
                After {{ idx + 1 }}. {{ c.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1">Clause Text *</label>
            <textarea
              v-model="newClause.text"
              rows="5"
              placeholder="The Transferor(s) confirms that covered car parking space bearing No. CP-42 is transferred along with the Said Flat..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl p-3 font-serif text-xs leading-relaxed focus:outline-none focus:border-primary-500"
            ></textarea>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input id="auto-renumber" v-model="newClause.autoRenumber" type="checkbox" class="rounded text-primary-600 focus:ring-primary-500" />
            <label for="auto-renumber" class="text-slate-600 dark:text-slate-300 font-medium">
              Automatically renumber subsequent clauses
            </label>
          </div>
        </div>

        <div class="pt-3 border-t border-default flex justify-end gap-2 text-xs">
          <button @click="isInsertClauseModalOpen = false" class="px-4 py-2 font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
          <button @click="confirmInsertClause" class="px-5 py-2 font-bold text-white bg-primary hover:bg-opacity-90 active:scale-95 rounded-xl cursor-pointer">Insert Clause</button>
        </div>
      </div>
    </div>

    <!-- ── 4. Version History Drawer ──────────────────────────────────────── -->
    <div v-if="isVersionDrawerOpen" class="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs" @click.self="isVersionDrawerOpen = false">
      <div class="bg-surface border-l border-default w-full max-w-md h-full p-6 space-y-4 overflow-y-auto shadow-2xl animate-slide-left">
        <div class="flex items-center justify-between border-b border-default pb-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhClockCounterClockwise :size="18" class="text-primary-600" />
            Document Version History
          </h3>
          <button @click="isVersionDrawerOpen = false" class="text-slate-400 hover:text-slate-600" aria-label="Close"><AppIcon name="close" :size="14" weight="bold" /></button>
        </div>

        <div class="space-y-3">
          <div
            v-for="v in (agreement.versions || []).slice().reverse()"
            :key="v._id || v.versionNumber"
            class="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-default rounded-2xl space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs font-bold text-slate-900 dark:text-white">Version {{ v.versionNumber }}.0</span>
              <span class="text-[10px] font-mono text-slate-400">{{ formatDate(v.modifiedAt) }}</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{{ v.changeSummary || 'Document updated.' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  PhArrowLeft,
  PhClockCounterClockwise,
  PhDownloadSimple,
  PhPrinter,
  PhFloppyDisk,
  PhSpinner,
  PhCheck,
  PhLockKey,
  PhArrowUUpLeft,
  PhArrowUUpRight,
  PhTextBolder,
  PhTextItalic,
  PhTextUnderline,
  PhTextStrikethrough,
  PhTextAlignLeft,
  PhTextAlignCenter,
  PhTextAlignRight,
  PhTextAlignJustify,
  PhListBullets,
  PhListNumbers,
  PhTextIndent,
  PhTextOutdent,
  PhPlus,
  PhFilePlus,
  PhPenNib,
  PhList,
  PhCaretUp,
  PhCaretDown,
  PhTrash,
} from '@phosphor-icons/vue';
import apiClient from '@/api/client';

const route = useRoute();
const agreement = ref(null);
const editorRef = ref(null);

const isSaving = ref(false);
const isAutoSaving = ref(false);
const isInsertClauseModalOpen = ref(false);
const isVersionDrawerOpen = ref(false);

const editableClauses = ref([]);
const selectedFontFamily = ref("'Book Antiqua', 'Times New Roman', serif");
const selectedFontSize = ref('11pt');

const pageSettings = reactive({
  pageSize: 'a4',
  orientation: 'portrait',
  margins: 'normal',
  marginTop: 25.4,
  marginBottom: 25.4,
  marginLeft: 25.4,
  marginRight: 25.4,
});

const newClause = reactive({
  title: '',
  text: '',
  insertAfterIdx: 0,
  autoRenumber: true,
});

const fetchAgreement = async () => {
  try {
    const res = await apiClient.get(`/agreements/${route.params.id}`);
    agreement.value = res.data?.data || res.data;
    if (agreement.value) {
      editableClauses.value = JSON.parse(JSON.stringify(agreement.value.clauses || []));
      if (agreement.value.pageSettings) {
        Object.assign(pageSettings, agreement.value.pageSettings);
      }
    }
  } catch (err) {
    console.error('Failed to load agreement in Word editor:', err);
  }
};

onMounted(() => {
  fetchAgreement();
  startAutoSaveTimer();
});

onUnmounted(() => {
  stopAutoSaveTimer();
});

// ── Word-Style Formatting Commands ──────────────────────────────────────────
const execCmd = (command, value = null) => {
  document.execCommand(command, false, value);
};

const applyFontFamily = () => {
  execCmd('fontName', selectedFontFamily.value);
};

const applyFontSize = () => {
  // Apply visual font size styling to selection
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const span = document.createElement('span');
    span.style.fontSize = selectedFontSize.value;
    const range = sel.getRangeAt(0);
    span.appendChild(range.extractContents());
    range.insertNode(span);
  }
};

const insertPageBreak = () => {
  const pageBreakHtml = '<div class="page-break-line my-6 border-b-2 border-dashed border-slate-300 relative text-center"><span class="bg-white px-3 text-[10px] text-slate-400 font-mono uppercase tracking-wider relative -top-2">Page Break</span></div><p><br></p>';
  execCmd('insertHTML', pageBreakHtml);
};

const insertSignatureBox = () => {
  const sigBoxHtml = `
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr>
        <td style="width: 50%; border: none; padding: 20px 10px; vertical-align: top;">
          <p><b>SIGNED AND DELIVERED</b> by the withinnamed Transferor(s):</p>
          <div style="margin-top: 45px; border-top: 1px solid #000; width: 80%; padding-top: 5px;">(Signature of Transferor)</div>
        </td>
        <td style="width: 50%; border: none; padding: 20px 10px; vertical-align: top;">
          <p><b>SIGNED AND DELIVERED</b> by the withinnamed Transferee(s):</p>
          <div style="margin-top: 45px; border-top: 1px solid #000; width: 80%; padding-top: 5px;">(Signature of Transferee)</div>
        </td>
      </tr>
    </table>
    <p><br></p>
  `;
  execCmd('insertHTML', sigBoxHtml);
};

// ── Physical Page Canvas Calculations ───────────────────────────────────────
const getCanvasClass = () => {
  return 'document-canvas';
};

const getCanvasStyle = () => {
  // Page Widths in pixels (~96 DPI)
  // A4: 210mm (~794px), Height: 297mm (~1123px)
  // Legal: 215.9mm (~816px), Height: 355.6mm (~1344px)
  // Letter: 215.9mm (~816px), Height: 279.4mm (~1056px)
  let width = '794px';
  let minHeight = '1123px';

  if (pageSettings.pageSize === 'legal') {
    width = pageSettings.orientation === 'landscape' ? '1344px' : '816px';
    minHeight = pageSettings.orientation === 'landscape' ? '816px' : '1344px';
  } else if (pageSettings.pageSize === 'letter') {
    width = pageSettings.orientation === 'landscape' ? '1056px' : '816px';
    minHeight = pageSettings.orientation === 'landscape' ? '816px' : '1056px';
  } else {
    // A4
    width = pageSettings.orientation === 'landscape' ? '1123px' : '794px';
    minHeight = pageSettings.orientation === 'landscape' ? '794px' : '1123px';
  }

  return {
    width,
    minHeight,
  };
};

const getInnerEditorStyle = () => {
  let padding = '25.4mm'; // Normal (1 inch)
  if (pageSettings.margins === 'narrow') padding = '12.7mm';
  else if (pageSettings.margins === 'moderate') padding = '19.0mm';

  return {
    padding,
    fontFamily: selectedFontFamily.value,
    fontSize: selectedFontSize.value,
    lineHeight: '1.7',
  };
};

const totalPagesEstimated = computed(() => {
  // Approximate page count calculation based on clauses and paper size
  const totalLength = editableClauses.value.reduce((acc, c) => acc + (c.content?.length || 0), 0);
  const factor = pageSettings.pageSize === 'legal' ? 2400 : 1800;
  return Math.max(1, Math.ceil(totalLength / factor));
});

const handlePageSetupChange = () => {
  syncContentFromDOM();
  manualSave(true);
};

// ── Left Outline Navigation & Manipulation ──────────────────────────────────
const scrollToClause = (idx) => {
  const el = document.getElementById(`clause-node-${idx}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const moveClauseUp = (idx) => {
  if (idx <= 0) return;
  syncContentFromDOM();
  const temp = editableClauses.value[idx];
  editableClauses.value[idx] = editableClauses.value[idx - 1];
  editableClauses.value[idx - 1] = temp;
  manualSave(true);
};

const moveClauseDown = (idx) => {
  if (idx >= editableClauses.value.length - 1) return;
  syncContentFromDOM();
  const temp = editableClauses.value[idx];
  editableClauses.value[idx] = editableClauses.value[idx + 1];
  editableClauses.value[idx + 1] = temp;
  manualSave(true);
};

const deleteClause = (idx) => {
  syncContentFromDOM();
  editableClauses.value.splice(idx, 1);
  manualSave(true);
};

const openInsertClauseModal = () => {
  newClause.title = '';
  newClause.text = '';
  newClause.insertAfterIdx = Math.max(0, editableClauses.value.length - 1);
  isInsertClauseModalOpen.value = true;
};

const confirmInsertClause = () => {
  syncContentFromDOM();
  const targetIdx = newClause.insertAfterIdx + 1;
  const clauseNumber = targetIdx;

  const formattedHtml = `<p><b>${newClause.title.toUpperCase()}:</b></p><p>${newClause.text}</p>`;

  editableClauses.value.splice(targetIdx, 0, {
    clauseId: `custom_clause_${Date.now()}`,
    title: newClause.title,
    order: targetIdx,
    content: formattedHtml,
    isMandatory: false,
    isCustom: true,
  });

  if (newClause.autoRenumber) {
    editableClauses.value.forEach((c, i) => {
      c.order = i + 1;
    });
  }

  isInsertClauseModalOpen.value = false;
  manualSave(true);
};

// ── DOM Content Synchronization ─────────────────────────────────────────────
const syncContentFromDOM = () => {
  if (!editorRef.value) return;
  const sections = editorRef.value.querySelectorAll('.clause-section');
  sections.forEach((sec, idx) => {
    if (editableClauses.value[idx]) {
      const bodyEl = sec.querySelector('.clause-body');
      if (bodyEl) {
        editableClauses.value[idx].content = bodyEl.innerHTML;
      }
    }
  });
};

const handleEditorInput = () => {
  // Content was changed directly by typing
};

const handleEditorBlur = () => {
  syncContentFromDOM();
};

// ── Save Management (Auto-Save & Manual) ─────────────────────────────────────
let autoSaveTimer = null;
const startAutoSaveTimer = () => {
  autoSaveTimer = setInterval(() => {
    syncContentFromDOM();
    autoSave();
  }, 20000); // Auto-save draft every 20 seconds
};

const stopAutoSaveTimer = () => {
  if (autoSaveTimer) clearInterval(autoSaveTimer);
};

const autoSave = async () => {
  if (!agreement.value || agreement.value.status === 'executed' || isSaving.value || isAutoSaving.value) return;
  isAutoSaving.value = true;
  try {
    syncContentFromDOM();
    editableClauses.value.forEach((c, idx) => {
      c.order = idx + 1;
    });

    const res = await apiClient.put(`/agreements/${agreement.value._id}/clauses`, {
      clauses: editableClauses.value,
      pageSettings,
      changeSummary: 'Auto-saved visual edits in Word Editor',
    });
    if (res.data?.data) {
      agreement.value = res.data.data;
    }
  } catch (err) {
    console.error('Auto-save error:', err);
  } finally {
    isAutoSaving.value = false;
  }
};

const manualSave = async (silent = false) => {
  if (!agreement.value || agreement.value.status === 'executed') return;
  isSaving.value = true;
  try {
    syncContentFromDOM();
    editableClauses.value.forEach((c, idx) => {
      c.order = idx + 1;
    });

    const res = await apiClient.put(`/agreements/${agreement.value._id}/clauses`, {
      clauses: editableClauses.value,
      pageSettings,
      changeSummary: 'Saved document in Word Document Editor',
    });
    if (res.data?.data) {
      agreement.value = res.data.data;
    }
  } catch (err) {
    console.error('Manual save error:', err);
  } finally {
    isSaving.value = false;
  }
};

const triggerPrint = () => {
  window.print();
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
</script>

<style>
/* ── Word-Style WYSIWYG Document Editor Typography & Layout ─────────────── */
.document-editor-surface {
  color: #111827;
  text-align: justify;
}

.document-editor-surface p {
  margin-bottom: 12px;
  line-height: 1.75;
  text-align: justify;
  text-justify: inter-word;
}

.document-editor-surface h1,
.document-editor-surface h2,
.document-editor-surface h3 {
  text-align: center;
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  margin: 16px 0 12px 0;
}

.document-editor-surface table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 10pt;
}

.document-editor-surface th,
.document-editor-surface td {
  border: 1px solid #666;
  padding: 6px 10px;
  vertical-align: top;
}

.document-editor-surface th {
  background-color: #f3f4f6;
  font-weight: bold;
}

.document-editor-surface ol,
.document-editor-surface ul {
  margin-left: 28px;
  margin-bottom: 12px;
  line-height: 1.75;
}

/* Page Break styling */
.page-break-line {
  user-select: none;
}

/* ── Print Exact Styling matching Page Settings ────────────────────────── */
@media print {
  @page {
    size: auto;
    margin: 0;
  }

  body {
    background: #ffffff !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  header, aside, button, nav, .print\:hidden, .no-print {
    display: none !important;
  }

  .document-canvas {
    box-shadow: none !important;
    border: none !important;
    width: 100% !important;
    max-width: 100% !important;
    min-height: auto !important;
    margin: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 20mm !important;
    padding-right: 20mm !important;
    background: #ffffff !important;
    color: #000000 !important;
    box-sizing: border-box !important;
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

  .clause-section {
    break-inside: auto;
    page-break-inside: auto;
    margin-bottom: 14px !important;
  }

  .page-break-line {
    page-break-before: always;
    break-before: page;
    display: none;
  }

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
</style>
