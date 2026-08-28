<template>
  <div v-if="agreement" class="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
    <!-- Breadcrumb & Top Bar -->
    <div class="flex items-center justify-between">
      <router-link :to="`/app/agreements/${agreement._id}`" class="text-xs font-bold text-slate-500 hover:text-primary-600 flex items-center gap-1.5 transition">
        <PhArrowLeft :size="14" />
        Back to Agreement Preview
      </router-link>
      <span class="font-mono text-xs font-bold text-slate-500">{{ agreement.agreementNumber }} (v{{ agreement.currentVersionNumber || 1 }}.0)</span>
    </div>

    <!-- Header Card -->
    <div class="bg-surface border border-default rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Edit Variable Agreement Details</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Update buyer, seller, property coordinates, or consideration. The document will recompile automatically.
        </p>
      </div>

      <button
        @click="handleSaveDetails"
        :disabled="isSaving"
        class="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-opacity-90 active:scale-95 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <PhSpinner v-if="isSaving" :size="16" class="animate-spin" />
        <PhFloppyDisk v-else :size="16" weight="bold" />
        Save & Recompile
      </button>
    </div>

    <!-- ── 1. TRANSFEROR(S) / SELLER ───────────────────────────────────────── -->
    <div class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-default pb-3">
        <h2 class="text-sm font-bold text-slate-900 dark:text-white">1. Transferor(s) / Seller Information</h2>
        <button type="button" @click="addTransferor" class="text-xs font-bold text-primary-600 hover:underline">
          + Add Seller
        </button>
      </div>

      <div class="space-y-3">
        <div v-for="(t, idx) in form.transferors" :key="idx" class="p-4 bg-slate-50/60 dark:bg-slate-800/30 border border-default rounded-2xl space-y-3">
          <div class="flex justify-between">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Seller #{{ idx + 1 }}</span>
            <button v-if="form.transferors.length > 1" @click="form.transferors.splice(idx, 1)" class="text-rose-500 text-xs font-bold">✕</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="sm:col-span-2">
              <label class="block font-semibold mb-1">Full Legal Name *</label>
              <input v-model="t.name" type="text" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Age</label>
              <input v-model.number="t.age" type="number" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block font-semibold mb-1">PAN Number *</label>
              <input v-model="t.pan" type="text" class="w-full font-mono uppercase bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Address *</label>
              <input v-model="t.address" type="text" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 2. TRANSFEREE(S) / BUYER ────────────────────────────────────────── -->
    <div class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-default pb-3">
        <h2 class="text-sm font-bold text-slate-900 dark:text-white">2. Transferee(s) / Buyer Information</h2>
        <button type="button" @click="addTransferee" class="text-xs font-bold text-primary-600 hover:underline">
          + Add Buyer
        </button>
      </div>

      <div class="space-y-3">
        <div v-for="(b, idx) in form.transferees" :key="idx" class="p-4 bg-slate-50/60 dark:bg-slate-800/30 border border-default rounded-2xl space-y-3">
          <div class="flex justify-between">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Buyer #{{ idx + 1 }}</span>
            <button v-if="form.transferees.length > 1" @click="form.transferees.splice(idx, 1)" class="text-rose-500 text-xs font-bold">✕</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="sm:col-span-2">
              <label class="block font-semibold mb-1">Full Legal Name *</label>
              <input v-model="b.name" type="text" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Age</label>
              <input v-model.number="b.age" type="number" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block font-semibold mb-1">PAN Number *</label>
              <input v-model="b.pan" type="text" class="w-full font-mono uppercase bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Address *</label>
              <input v-model="b.address" type="text" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 3. PROPERTY DETAILS ─────────────────────────────────────────────── -->
    <div class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-4">
      <h2 class="text-sm font-bold text-slate-900 dark:text-white border-b border-default pb-3">3. Property Information & Legal Description</h2>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1">Flat No. *</label>
          <input v-model="form.property.flatNumber" type="text" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Floor</label>
          <input v-model="form.property.floor" type="text" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Wing</label>
          <input v-model="form.property.wing" type="text" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Building Name</label>
          <input v-model="form.property.buildingName" type="text" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1">Society Name *</label>
          <input v-model="form.property.societyName" type="text" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Carpet Area (sq ft)</label>
          <input v-model.number="form.property.carpetArea" type="number" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Sub-Registrar Office</label>
          <input v-model="form.property.subRegistrarOffice" type="text" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
      </div>
    </div>

    <!-- ── 4. CONSIDERATION & PAYMENTS ─────────────────────────────────────── -->
    <div class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-4">
      <h2 class="text-sm font-bold text-slate-900 dark:text-white border-b border-default pb-3">4. Consideration & Payment Schedule</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block font-bold mb-1">Total Consideration Amount (₹) *</label>
          <input v-model.number="form.consideration.totalAmount" type="number" class="w-full font-mono font-bold bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-bold mb-1">Advance Amount (₹)</label>
          <input v-model.number="form.consideration.advanceAmount" type="number" class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
      </div>
    </div>

    <!-- ── 5. DOCUMENT PAGE SETUP ─────────────────────────────────────────── -->
    <div class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-4">
      <h2 class="text-sm font-bold text-slate-900 dark:text-white border-b border-default pb-3">5. Document Paper Size & Margins</h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label class="block font-semibold mb-1">Page Size *</label>
          <select v-model="pageSettings.pageSize" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary-500">
            <option value="a4">A4 (210 × 297 mm) - Standard</option>
            <option value="legal">Legal (8.5 × 14 in / 215.9 × 355.6 mm)</option>
            <option value="letter">Letter (8.5 × 11 in / 215.9 × 279.4 mm)</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold mb-1">Orientation</label>
          <select v-model="pageSettings.orientation" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500">
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold mb-1">Margins</label>
          <select v-model="pageSettings.margins" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500">
            <option value="normal">Normal (1 in / 25.4mm)</option>
            <option value="narrow">Narrow (0.5 in / 12.7mm)</option>
            <option value="moderate">Moderate (0.75 in / 19mm)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Save Button Footer -->
    <div class="flex justify-end gap-3 pt-2">
      <router-link :to="`/app/agreements/${agreement._id}`" class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700">
        Cancel
      </router-link>
      <button
        @click="handleSaveDetails"
        :disabled="isSaving"
        class="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-opacity-90 active:scale-95 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <PhSpinner v-if="isSaving" :size="16" class="animate-spin" />
        <PhFloppyDisk v-else :size="16" weight="bold" />
        Save & Recompile Agreement
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PhArrowLeft, PhFloppyDisk, PhSpinner } from '@phosphor-icons/vue';
import apiClient from '@/api/client';

const route = useRoute();
const router = useRouter();
const agreement = ref(null);
const isSaving = ref(false);

const form = reactive({
  transferors: [],
  transferees: [],
  property: {},
  agreement: {},
  consideration: {},
  payments: [],
  witnesses: [],
});

const pageSettings = reactive({
  pageSize: 'a4',
  orientation: 'portrait',
  margins: 'normal',
  marginTop: 25.4,
  marginBottom: 25.4,
  marginLeft: 25.4,
  marginRight: 25.4,
});

onMounted(async () => {
  try {
    const res = await apiClient.get(`/agreements/${route.params.id}`);
    agreement.value = res.data?.data || res.data;
    if (agreement.value?.structuredData) {
      Object.assign(form, JSON.parse(JSON.stringify(agreement.value.structuredData)));
    }
    if (agreement.value?.pageSettings) {
      Object.assign(pageSettings, agreement.value.pageSettings);
    }
  } catch (err) {
    console.error('Failed to load agreement details:', err);
  }
});

const addTransferor = () => {
  form.transferors.push({ name: '', age: null, pan: '', occupation: '', address: '', city: 'Pune', state: 'Maharashtra', pin: '' });
};

const addTransferee = () => {
  form.transferees.push({ name: '', age: null, pan: '', occupation: '', address: '', city: 'Pune', state: 'Maharashtra', pin: '' });
};

const handleSaveDetails = async () => {
  isSaving.value = true;
  try {
    await apiClient.put(`/agreements/${agreement.value._id}/details`, {
      ...form,
      pageSettings,
    });
    router.push(`/app/agreements/${agreement.value._id}`);
  } catch (err) {
    console.error('Failed to save agreement details:', err);
  } finally {
    isSaving.value = false;
  }
};
</script>
