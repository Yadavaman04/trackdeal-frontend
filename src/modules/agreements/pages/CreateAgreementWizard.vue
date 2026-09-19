<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
    <!-- Top Breadcrumb -->
    <div class="flex items-center justify-between">
      <router-link to="/app/agreements" class="text-xs font-bold text-slate-500 hover:text-primary-600 flex items-center gap-1.5 transition">
        <PhArrowLeft :size="14" />
        Back to Agreements Directory
      </router-link>
      <span class="text-xs font-semibold text-slate-400">Step {{ currentStep }} of 7</span>
    </div>

    <!-- Wizard Header Card -->
    <div class="bg-surface border border-default rounded-3xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center shadow-xs">
          <PhFileDoc :size="24" weight="duotone" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Create Property Agreement</h1>
          <p class="text-xs text-slate-500 mt-0.5">Guided legal document generator with CRM auto-fill and dynamic clause compilation</p>
        </div>
      </div>

      <!-- Horizontal Step Stepper -->
      <div class="mt-6 pt-5 border-t border-default">
        <div class="grid grid-cols-4 sm:grid-cols-7 gap-2">
          <div
            v-for="(step, idx) in steps"
            :key="step.num"
            @click="goToStep(step.num)"
            class="p-2 rounded-xl border text-center transition cursor-pointer"
            :class="getStepClass(step.num)"
          >
            <div class="w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-black mb-1" :class="getStepBadgeClass(step.num)">
              <PhCheck v-if="currentStep > step.num" :size="10" weight="bold" />
              <span v-else>{{ step.num }}</span>
            </div>
            <div class="text-[11px] font-bold truncate">{{ step.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── STEP 1: TEMPLATE SELECTION ──────────────────────────────────────── -->
    <div v-if="currentStep === 1" class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-4">
      <div>
        <h2 class="text-sm font-bold text-slate-900 dark:text-white">Select Legal Document Template</h2>
        <p class="text-xs text-slate-500">Choose the standard legal template framework for your transaction</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div
          v-for="tpl in templates"
          :key="tpl._id"
          @click="selectedTemplate = tpl"
          class="p-5 rounded-2xl border-2 transition cursor-pointer space-y-3"
          :class="selectedTemplate?._id === tpl._id ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/20 shadow-sm' : 'border-default bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'"
        >
          <div class="flex items-start justify-between">
            <div class="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
              <PhScroll :size="20" weight="duotone" />
            </div>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              v{{ tpl.version || '1.0' }}
            </span>
          </div>

          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-sm">{{ tpl.name }}</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ tpl.description || 'Standard property transfer agreement.' }}</p>
          </div>

          <div class="flex items-center gap-3 pt-2 text-[11px] text-slate-400 border-t border-default/60">
            <span>{{ tpl.clauses?.length || 13 }} Standard Clauses</span>
            <span>•</span>
            <span class="capitalize">{{ tpl.category?.replace(/_/g, ' ') }}</span>
          </div>
        </div>
      </div>

      <!-- Document Page Setup Section -->
      <div class="pt-4 border-t border-default space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Document Page Setup & Font Style</h3>
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Page Size *</label>
            <select v-model="pageSettings.pageSize" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary-500">
              <option value="a4">A4 (Standard)</option>
              <option value="legal">Legal Paper</option>
              <option value="letter">Letter Paper</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Orientation</label>
            <select v-model="pageSettings.orientation" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500">
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Margins</label>
            <select v-model="pageSettings.margins" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500">
              <option value="normal">Normal (1.0 in)</option>
              <option value="narrow">Narrow (0.5 in)</option>
              <option value="moderate">Moderate (0.75 in)</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Font Family *</label>
            <select v-model="pageSettings.fontFamily" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary-500">
              <option value="book_antiqua">Book Antiqua (Serif - Classic Legal)</option>
              <option value="times_new_roman">Times New Roman (Serif - Standard)</option>
              <option value="baskerville">Baskerville (Serif - Premium)</option>
              <option value="garamond">Garamond (Serif - Elegant)</option>
              <option value="georgia">Georgia (Serif - Screen Readable)</option>
              <option value="arial">Arial (Sans-Serif - Clean)</option>
              <option value="calibri">Calibri (Sans-Serif - Modern)</option>
              <option value="helvetica">Helvetica (Sans-Serif - Sleek)</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Font Size</label>
            <select v-model.number="pageSettings.fontSize" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500">
              <option :value="10">10 pt</option>
              <option :value="11">11 pt (Standard)</option>
              <option :value="12">12 pt (Large)</option>
              <option :value="13">13 pt</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- ── STEP 2: SELECT CRM DEAL / PROPERTY (AUTO-FILL) ─────────────────── -->
    <div v-if="currentStep === 2" class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-5">
      <div>
        <h2 class="text-sm font-bold text-slate-900 dark:text-white">Auto-Fill from CRM Context (Optional)</h2>
        <p class="text-xs text-slate-500">Pick an active deal or property to automatically load buyer, seller, price, and unit details</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Active Deal</label>
          <select v-model="selectedDealId" @change="handleDealSelect" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500">
            <option value="">-- Or enter manually --</option>
            <option v-for="d in crmDeals" :key="d._id" :value="d._id">
              {{ d.dealNumber }} (₹{{ (d.agreedPrice || d.dealValue || 0).toLocaleString('en-IN') }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Property / Inventory</label>
          <select v-model="selectedPropertyId" @change="handlePropertySelect" class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500">
            <option value="">-- Or enter manually --</option>
            <option v-for="p in crmProperties" :key="p._id" :value="p._id">
              {{ p.title || p.name }} ({{ p.configuration || 'Residential' }})
            </option>
          </select>
        </div>
      </div>

      <div class="p-4 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 rounded-2xl flex items-center justify-between text-xs">
        <span class="text-primary-800 dark:text-primary-300 font-medium">Auto-fill maps all known addresses, PAN numbers, and property coordinates.</span>
        <button type="button" @click="currentStep++" class="font-bold text-primary-600 hover:underline">
          Skip & Continue →
        </button>
      </div>
    </div>

    <!-- ── STEP 3: TRANSFEROR(S) / SELLER DETAILS ─────────────────────────── -->
    <div v-if="currentStep === 3" class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">Transferor(s) / Seller Information</h2>
          <p class="text-xs text-slate-500">Add one or multiple sellers / transferors</p>
        </div>
        <button
          type="button"
          @click="addTransferor"
          class="px-3.5 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-xl transition flex items-center gap-1.5"
        >
          <PhPlus :size="14" weight="bold" />
          Add Another Seller
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="(t, idx) in form.transferors"
          :key="idx"
          class="p-4 bg-slate-50/60 dark:bg-slate-800/30 border border-default rounded-2xl space-y-3"
        >
          <div class="flex items-center justify-between border-b border-default/60 pb-2">
            <span class="text-xs font-bold text-slate-900 dark:text-white">Seller / Transferor #{{ idx + 1 }}</span>
            <button v-if="form.transferors.length > 1" @click="removeTransferor(idx)" class="text-rose-500 hover:text-rose-700 text-xs font-semibold">
              <AppIcon name="close" :size="13" weight="bold" /> Remove
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="sm:col-span-2">
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Full Legal Name *</label>
              <input v-model="t.name" required type="text" placeholder="e.g. Mr. Sandeep L. Makwana" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Age</label>
              <input v-model.number="t.age" type="number" placeholder="45" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">PAN Number *</label>
              <input v-model="t.pan" required type="text" placeholder="ABCDE1234F" class="w-full font-mono uppercase bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Occupation</label>
              <input v-model="t.occupation" type="text" placeholder="Business / Salaried" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <div class="text-xs">
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Residential Address *</label>
            <input v-model="t.address" required type="text" placeholder="Full residential street address" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">City</label>
              <input v-model="t.city" type="text" placeholder="Pune" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">State</label>
              <input v-model="t.state" type="text" placeholder="Maharashtra" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">PIN Code</label>
              <input v-model="t.pin" type="text" placeholder="411045" class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── STEP 4: TRANSFEREE(S) / BUYER DETAILS ──────────────────────────── -->
    <div v-if="currentStep === 4" class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">Transferee(s) / Buyer Information</h2>
          <p class="text-xs text-slate-500">Add one or multiple buyers / transferees</p>
        </div>
        <button
          type="button"
          @click="addTransferee"
          class="px-3.5 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-xl transition flex items-center gap-1.5"
        >
          <PhPlus :size="14" weight="bold" />
          Add Another Buyer
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="(b, idx) in form.transferees"
          :key="idx"
          class="p-4 bg-slate-50/60 dark:bg-slate-800/30 border border-default rounded-2xl space-y-3"
        >
          <div class="flex items-center justify-between border-b border-default/60 pb-2">
            <span class="text-xs font-bold text-slate-900 dark:text-white">Buyer / Transferee #{{ idx + 1 }}</span>
            <button v-if="form.transferees.length > 1" @click="removeTransferee(idx)" class="text-rose-500 hover:text-rose-700 text-xs font-semibold">
              <AppIcon name="close" :size="13" weight="bold" /> Remove
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="sm:col-span-2">
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Full Legal Name *</label>
              <input v-model="b.name" required type="text" placeholder="e.g. Mr. Pramodnarayan Jha" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Age</label>
              <input v-model.number="b.age" type="number" placeholder="38" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">PAN Number *</label>
              <input v-model="b.pan" required type="text" placeholder="CDEFG3456H" class="w-full font-mono uppercase bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Occupation</label>
              <input v-model="b.occupation" type="text" placeholder="IT Professional / Salaried" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <div class="text-xs">
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Residential Address *</label>
            <input v-model="b.address" required type="text" placeholder="Full residential street address" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">City</label>
              <input v-model="b.city" type="text" placeholder="Pune" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">State</label>
              <input v-model="b.state" type="text" placeholder="Maharashtra" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">PIN Code</label>
              <input v-model="b.pin" type="text" placeholder="411038" class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── STEP 5: AGREEMENT & PROPERTY LEGAL COORDINATES ─────────────────── -->
    <div v-if="currentStep === 5" class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-5">
      <div>
        <h2 class="text-sm font-bold text-slate-900 dark:text-white">Agreement Date & Property Specifics</h2>
        <p class="text-xs text-slate-500">Legal survey numbers, society registration, share certificate numbers, and chain deed data</p>
      </div>

      <!-- Agreement metadata -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-default rounded-2xl">
        <div>
          <label class="block font-semibold mb-1">Agreement Date *</label>
          <input v-model="form.agreement.agreementDate" type="date" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Agreement Place *</label>
          <input v-model="form.agreement.agreementPlace" type="text" placeholder="Pune" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Legal Jurisdiction City</label>
          <input v-model="form.agreement.jurisdictionCity" type="text" placeholder="Pune" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      <!-- Property specifics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1">Flat / Unit No. *</label>
          <input v-model="form.property.flatNumber" type="text" placeholder="302" class="w-full font-bold bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Floor</label>
          <input v-model="form.property.floor" type="text" placeholder="Third Floor" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Wing</label>
          <input v-model="form.property.wing" type="text" placeholder="C-Wing" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Building / Complex Name</label>
          <input v-model="form.property.buildingName" type="text" placeholder="Nityanand Shakti Building" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1">Society Name *</label>
          <input v-model="form.property.societyName" type="text" placeholder="NITYANAND SHAKTI CO-OP HSG SOC LTD" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Society Reg. Number</label>
          <input v-model="form.property.societyRegistrationNumber" type="text" placeholder="TNA/VSI/HSG/TC/19137/2007-2008" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Society Reg. Date</label>
          <input v-model="form.property.societyRegistrationDate" type="date" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1">Built-up Area (sq ft) *</label>
          <input v-model.number="form.property.builtUpArea" type="number" placeholder="495" class="w-full font-mono font-bold bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Built-up Area (sq mtr)</label>
          <input v-model.number="form.property.builtUpAreaSqMtr" type="number" step="0.01" placeholder="46.00" class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Carpet Area (sq ft)</label>
          <input v-model.number="form.property.carpetArea" type="number" placeholder="410" class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Landmark / Location</label>
          <input v-model="form.property.landmark" type="text" placeholder="Near Grandevi Mandir, Nilegaon" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1">Survey No(s) *</label>
          <input v-model="form.property.surveyNumbers" type="text" placeholder="SURVEY NO 1" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Hissa No. *</label>
          <input v-model="form.property.hissaNumber" type="text" placeholder="Hissa No 5 & 6" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Village *</label>
          <input v-model="form.property.village" type="text" placeholder="Nilemore" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Taluka & District</label>
          <input v-model="form.property.taluka" type="text" placeholder="Vasai, Dist: Palghar" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1">Share Cert. No.</label>
          <input v-model="form.property.shareCertificateNumber" type="text" placeholder="SC-12" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Distinctive Shares From</label>
          <input v-model="form.property.shareNumbersFrom" type="text" placeholder="431" class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Distinctive Shares To</label>
          <input v-model="form.property.shareNumbersTo" type="text" placeholder="440" class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Society Membership No.</label>
          <input v-model="form.property.membershipNumber" type="text" placeholder="44" class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      <!-- Resale Chain of Title Recitals Data -->
      <div class="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-2xl space-y-3">
        <h3 class="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">Chain of Title Recitals (Resale Document History)</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Original Buyer Name (Developer Sale)</label>
            <input v-model="form.property.originalBuyerName" type="text" placeholder="SMT. AASHA MANIK PATIL" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Original Developer Name</label>
            <input v-model="form.property.originalDeveloperName" type="text" placeholder="SHREE SADGURU CONSTRUCTION CO." class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Orig Agreement Reg. No & Date</label>
            <input v-model="form.property.originalRegistrationNumber" type="text" placeholder="VASAI 3 - 11208/2007 (30/10/2007)" class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Previous Seller Name (Transfer Deed)</label>
            <input v-model="form.property.previousSellerName" type="text" placeholder="SMT. ASHA MANIK PATIL" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Previous Sale Deed Reg. No.</label>
            <input v-model="form.property.previousRegistrationNumber" type="text" placeholder="5926/2017 at Vasai-3" class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Previous Sale Deed Date</label>
            <input v-model="form.property.previousAgreementDate" type="date" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── STEP 6: CONSIDERATION & PAYMENT SCHEDULE ───────────────────────── -->
    <div v-if="currentStep === 6" class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-5">
      <div>
        <h2 class="text-sm font-bold text-slate-900 dark:text-white">Consideration & Dynamic Payment Schedule</h2>
        <p class="text-xs text-slate-500">Define sale price, auto-generated amount in words, bank loan timeline, and 50:50 society transfer fee sharing</p>
      </div>

      <div class="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-default rounded-2xl space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-bold mb-1 text-slate-800 dark:text-slate-200">Total Consideration Amount (₹) *</label>
            <input
              v-model.number="form.consideration.totalAmount"
              type="number"
              placeholder="3350000"
              class="w-full font-mono font-bold text-sm bg-surface border border-default rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block font-bold mb-1 text-slate-800 dark:text-slate-200">Advance / Token Paid (₹)</label>
            <input
              v-model.number="form.consideration.advanceAmount"
              type="number"
              placeholder="351000"
              class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block font-bold mb-1 text-slate-800 dark:text-slate-200">Loan Period (Days)</label>
            <input
              v-model.number="form.consideration.loanContingencyDays"
              type="number"
              placeholder="45"
              class="w-full font-mono bg-surface border border-default rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label class="block font-bold mb-1 text-slate-800 dark:text-slate-200">Society Transfer Fees Sharing</label>
            <select v-model="form.consideration.societyTransferFeeRatio" class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary-500">
              <option value="equal_50_50">Equal (50:50) Sharing between Transferor & Transferee (Standard)</option>
              <option value="transferee_100">100% Borne by Transferee (Buyer)</option>
              <option value="transferor_100">100% Borne by Transferor (Seller)</option>
            </select>
          </div>
          <div class="flex items-center text-[11px] text-slate-500 pt-5">
            <span>* Transferor authorizes Transferee to pay their 50% share directly out of consideration to society.</span>
          </div>
        </div>

        <div class="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-default/60">
          <span class="font-semibold text-slate-400 not-italic mr-1">Amount in Words:</span>
          <b>{{ getIndianWords(form.consideration.totalAmount) }}</b>
        </div>
      </div>

      <!-- Payment Tranches Table -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-900 dark:text-white">Payment Tranches & Cheque / UTR Details</h3>
          <button
            type="button"
            @click="addPaymentRow"
            class="px-3 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-xl transition flex items-center gap-1.5"
          >
            <PhPlus :size="14" weight="bold" />
            Add Payment Row
          </button>
        </div>

        <div class="border border-default rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-default text-[10px] font-bold text-slate-500 uppercase">
              <tr>
                <th class="py-2.5 px-3">Date</th>
                <th class="py-2.5 px-3">Amount (₹)</th>
                <th class="py-2.5 px-3">Mode</th>
                <th class="py-2.5 px-3">Bank & Branch</th>
                <th class="py-2.5 px-3">Ref / Chq / UTR</th>
                <th class="py-2.5 px-3 text-right"><span class="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="(p, idx) in form.payments" :key="idx">
                <td class="py-2 px-3">
                  <input v-model="p.date" type="date" class="bg-transparent border border-default rounded-lg px-2 py-1 text-xs w-28" />
                </td>
                <td class="py-2 px-3">
                  <input v-model.number="p.amount" type="number" class="bg-transparent font-mono font-bold border border-default rounded-lg px-2 py-1 text-xs w-28" />
                </td>
                <td class="py-2 px-3">
                  <select v-model="p.mode" class="bg-transparent border border-default rounded-lg px-2 py-1 text-xs">
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>UPI</option>
                    <option>Demand Draft</option>
                  </select>
                </td>
                <td class="py-2 px-3">
                  <input v-model="p.bankName" type="text" placeholder="HDFC, Baner" class="bg-transparent border border-default rounded-lg px-2 py-1 text-xs w-full" />
                </td>
                <td class="py-2 px-3">
                  <input v-model="p.referenceNumber" type="text" placeholder="UTR/CHQ No" class="bg-transparent font-mono border border-default rounded-lg px-2 py-1 text-xs w-full" />
                </td>
                <td class="py-2 px-3 text-right">
                  <button @click="removePaymentRow(idx)" class="text-rose-500 hover:text-rose-700 font-bold" aria-label="Remove payment"><AppIcon name="close" :size="14" weight="bold" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center text-xs p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-default">
          <span class="text-slate-500">Total Payments Recorded: <b class="font-mono text-emerald-600">₹{{ getSumPayments().toLocaleString('en-IN') }}</b></span>
          <span class="text-slate-500">Balance Payable: <b class="font-mono text-amber-600">₹{{ Math.max(0, (form.consideration.totalAmount || 0) - getSumPayments()).toLocaleString('en-IN') }}</b></span>
        </div>
      </div>
    </div>

    <!-- ── STEP 7: REVIEW & GENERATE ──────────────────────────────────────── -->
    <div v-if="currentStep === 7" class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-6">
      <div>
        <h2 class="text-sm font-bold text-slate-900 dark:text-white">Review Document Summary</h2>
        <p class="text-xs text-slate-500">Verify structured parameters before compiling legal agreement</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="p-4 bg-slate-50/60 dark:bg-slate-800/30 border border-default rounded-2xl space-y-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Party Summary</span>
          <div><b>Seller(s):</b> {{ form.transferors.map(t => t.name).join(', ') || '—' }}</div>
          <div><b>Buyer(s):</b> {{ form.transferees.map(t => t.name).join(', ') || '—' }}</div>
          <div><b>Agreement Date:</b> {{ form.agreement.agreementDate || 'Today' }} ({{ form.agreement.agreementPlace || 'Pune' }})</div>
        </div>

        <div class="p-4 bg-slate-50/60 dark:bg-slate-800/30 border border-default rounded-2xl space-y-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property & Financials</span>
          <div><b>Unit:</b> Flat {{ form.property.flatNumber || '604' }}, {{ form.property.societyName || 'Society' }}</div>
          <div><b>Carpet Area:</b> {{ form.property.carpetArea || '920' }} sq. ft.</div>
          <div><b>Consideration:</b> <span class="font-mono font-bold text-primary-600">₹{{ (form.consideration.totalAmount || 0).toLocaleString('en-IN') }}</span></div>
        </div>
      </div>

      <div class="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
        <PhCheckCircle :size="20" class="shrink-0" />
        <span>Ready to compile! TrackDeal will auto-interpolate all {{ form.property.flatNumber ? 'Flat ' + form.property.flatNumber : '' }} clauses, schedules, and signatures.</span>
      </div>
    </div>

    <!-- ── Bottom Navigation Controls ──────────────────────────────────────── -->
    <div class="flex items-center justify-between pt-2">
      <button
        type="button"
        @click="currentStep--"
        :disabled="currentStep === 1"
        class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-surface border border-default hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-40"
      >
        ← Previous Step
      </button>

      <button
        v-if="currentStep < 7"
        type="button"
        @click="currentStep++"
        class="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-opacity-90 active:scale-95 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
      >
        Continue →
      </button>

      <button
        v-else
        type="button"
        @click="handleGenerateAgreement"
        :disabled="isGenerating"
        class="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-opacity-90 active:scale-95 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <PhSpinner v-if="isGenerating" :size="16" class="animate-spin" />
        <PhFileDoc v-else :size="16" weight="bold" />
        Generate & Preview Agreement
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  PhArrowLeft,
  PhFileDoc,
  PhScroll,
  PhCheck,
  PhPlus,
  PhCheckCircle,
  PhSpinner,
} from '@phosphor-icons/vue';
import apiClient from '@/api/client';

const router = useRouter();
const currentStep = ref(1);
const isGenerating = ref(false);

const templates = ref([]);
const selectedTemplate = ref(null);
const crmDeals = ref([]);
const crmProperties = ref([]);
const selectedDealId = ref('');
const selectedPropertyId = ref('');

const pageSettings = reactive({
  pageSize: 'a4',
  orientation: 'portrait',
  margins: 'normal',
  fontFamily: 'book_antiqua',
  fontSize: 11,
  marginTop: 25.4,
  marginBottom: 25.4,
  marginLeft: 25.4,
  marginRight: 25.4,
});

const steps = [
  { num: 1, label: 'Template' },
  { num: 2, label: 'CRM Sync' },
  { num: 3, label: 'Sellers' },
  { num: 4, label: 'Buyers' },
  { num: 5, label: 'Property' },
  { num: 6, label: 'Payments' },
  { num: 7, label: 'Review' },
];

const form = reactive({
  transferors: [
    { name: '', age: null, pan: '', occupation: '', address: '', city: 'Pune', state: 'Maharashtra', pin: '' }
  ],
  transferees: [
    { name: '', age: null, pan: '', occupation: '', address: '', city: 'Pune', state: 'Maharashtra', pin: '' }
  ],
  property: {
    flatNumber: '302',
    floor: 'Third Floor',
    wing: 'C-Wing',
    buildingName: 'NITYANAND SHAKTI CO-OP HSG SOC LTD',
    projectName: 'NITYANAND SHAKTI',
    societyName: 'NITYANAND SHAKTI CO-OP HSG SOC LTD',
    societyRegistrationNumber: 'TNA/VSI/HSG/TC/19137/2007-2008',
    societyRegistrationDate: '2007-11-29',
    carpetArea: 410,
    builtUpArea: 495,
    builtUpAreaSqMtr: 46.00,
    surveyNumbers: 'SURVEY NO 1',
    hissaNumber: 'Hissa No 5 & 6',
    ctsNumber: '',
    village: 'Nilemore',
    landmark: 'Near Grandevi Mandir, Nilegaon',
    taluka: 'Vasai',
    district: 'Palghar',
    city: 'Nallasopara',
    municipalCorporation: 'Vasai Virar City Municipal Corporation',
    subRegistrarOffice: 'Vasai',
    shareCertificateNumber: 'SC-44',
    shareNumbersFrom: '431',
    shareNumbersTo: '440',
    membershipNumber: '44',
    developerName: 'SHREE SADGURU CONSTRUCTION CO.',
    originalBuyerName: 'SMT. AASHA MANIK PATIL',
    originalDeveloperName: 'SHREE SADGURU CONSTRUCTION CO.',
    originalAgreementDate: '2007-10-30',
    originalRegistrationNumber: 'VASAI 3 - 11208/2007',
    originalSubRegistrarOffice: 'Vasai-3',
    previousSellerName: 'SMT. ASHA MANIK PATIL',
    previousBuyerName: 'MR. SANDEEP N RAWAL',
    previousAgreementDate: '2017-06-30',
    previousRegistrationNumber: '5926/2017',
    previousSubRegistrarOffice: 'Vasai-3',
  },
  agreement: {
    agreementDate: new Date().toISOString().slice(0, 10),
    agreementPlace: 'Nallasopara',
    jurisdictionCity: 'Vasai',
  },
  consideration: {
    totalAmount: 3350000,
    advanceAmount: 351000,
    loanContingencyDays: 45,
    societyTransferFeeRatio: 'equal_50_50',
  },
  payments: [
    { date: new Date().toISOString().slice(0, 10), amount: 500000, mode: 'Bank Transfer', bankName: 'HDFC Bank', referenceNumber: 'UTR-001', branch: 'Main Branch' }
  ],
  witnesses: [
    { name: '1. ____________________________', address: 'Address: ____________________________' },
    { name: '2. ____________________________', address: 'Address: ____________________________' }
  ]
});

onMounted(async () => {
  try {
    const [tplRes, dealsRes, propRes] = await Promise.allSettled([
      apiClient.get('/agreements/templates'),
      apiClient.get('/deals'),
      apiClient.get('/properties'),
    ]);

    if (tplRes.status === 'fulfilled') {
      templates.value = tplRes.value.data?.data || tplRes.value.data || [];
      if (templates.value.length > 0) {
        selectedTemplate.value = templates.value[0];
      }
    }
    if (dealsRes.status === 'fulfilled') {
      crmDeals.value = dealsRes.value.data?.data || dealsRes.value.data || [];
    }
    if (propRes.status === 'fulfilled') {
      crmProperties.value = propRes.value.data?.data || propRes.value.data || [];
    }
  } catch (err) {
    console.error('Error initializing agreement wizard:', err);
  }
});

const goToStep = (s) => {
  currentStep.value = s;
};

const getStepClass = (s) => {
  if (currentStep.value === s) {
    return 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 font-bold';
  }
  if (currentStep.value > s) {
    return 'border-emerald-300 dark:border-emerald-800 text-slate-700 dark:text-slate-300';
  }
  return 'border-default text-slate-400';
};

const getStepBadgeClass = (s) => {
  if (currentStep.value === s) return 'bg-primary-600 text-white';
  if (currentStep.value > s) return 'bg-emerald-600 text-white';
  return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
};

const addTransferor = () => {
  form.transferors.push({ name: '', age: null, pan: '', occupation: '', address: '', city: 'Pune', state: 'Maharashtra', pin: '' });
};

const removeTransferor = (idx) => {
  form.transferors.splice(idx, 1);
};

const addTransferee = () => {
  form.transferees.push({ name: '', age: null, pan: '', occupation: '', address: '', city: 'Pune', state: 'Maharashtra', pin: '' });
};

const removeTransferee = (idx) => {
  form.transferees.splice(idx, 1);
};

const addPaymentRow = () => {
  form.payments.push({ date: new Date().toISOString().slice(0, 10), amount: 0, mode: 'Bank Transfer', bankName: '', referenceNumber: '', branch: '' });
};

const removePaymentRow = (idx) => {
  form.payments.splice(idx, 1);
};

const getSumPayments = () => {
  return (form.payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
};

const getIndianWords = (amt) => {
  const num = Math.round(Number(amt) || 0);
  if (!num) return 'Rupees Zero Only';
  if (num >= 10000000) return `Rupees ${(num / 10000000).toFixed(2)} Crores Only`;
  if (num >= 100000) return `Rupees ${(num / 100000).toFixed(2)} Lakhs Only`;
  return `Rupees ${num.toLocaleString('en-IN')} Only`;
};

const handleDealSelect = () => {
  const deal = crmDeals.value.find((d) => d._id === selectedDealId.value);
  if (!deal) return;

  if (deal.agreedPrice || deal.dealValue) {
    form.consideration.totalAmount = deal.agreedPrice || deal.dealValue;
  }
  if (deal.customer) {
    form.transferees[0].name = `${deal.customer.firstName || ''} ${deal.customer.lastName || ''}`.trim();
  }
  if (deal.property) {
    selectedPropertyId.value = deal.property._id || deal.property;
    handlePropertySelect();
  }
};

const handlePropertySelect = () => {
  const prop = crmProperties.value.find((p) => p._id === selectedPropertyId.value);
  if (!prop) return;

  if (prop.title) form.property.buildingName = prop.title;
  if (prop.builderName) form.property.developerName = prop.builderName;
  if (prop.price && !form.consideration.totalAmount) form.consideration.totalAmount = prop.price;
  if (prop.area) form.property.carpetArea = prop.area;
};

const handleGenerateAgreement = async () => {
  isGenerating.value = true;
  try {
    const payload = {
      templateId: selectedTemplate.value?._id,
      dealId: selectedDealId.value || undefined,
      propertyId: selectedPropertyId.value || undefined,
      pageSettings: JSON.parse(JSON.stringify(pageSettings)),
      structuredData: JSON.parse(JSON.stringify(form)),
    };

    const res = await apiClient.post('/agreements', payload);
    const created = res.data?.data || res.data;
    if (created?._id) {
      router.push(`/app/agreements/${created._id}`);
    }
  } catch (err) {
    console.error('Error generating agreement:', err);
  } finally {
    isGenerating.value = false;
  }
};
</script>
