<template>
  <div v-if="loan" class="space-y-6 pb-16 animate-fade-in">
    <!-- ── Breadcrumb & Top Bar ────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <router-link to="/app/loans" class="hover:text-primary-600 flex items-center gap-1">
          <PhArrowLeft :size="14" />
          Loans Directory
        </router-link>
        <span>/</span>
        <span class="font-mono text-slate-900 dark:text-white font-bold">{{ loan.loanCaseNumber }}</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-400">Assigned to:</span>
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-default text-xs font-medium text-slate-800 dark:text-slate-200">
          <div class="w-4 h-4 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[9px] font-bold">
            {{ (loan.assignedTo?.firstName || 'A')[0] }}
          </div>
          {{ loan.assignedTo?.firstName || 'Agent' }} {{ loan.assignedTo?.lastName || '' }}
        </div>
      </div>
    </div>

    <!-- ── EXECUTIVE HEADER ────────────────────────────────────────────────── -->
    <div class="bg-surface border border-default rounded-3xl p-6 shadow-sm relative overflow-hidden">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <!-- Left: Case Details -->
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 shadow-sm shrink-0">
            <PhBank :size="30" weight="duotone" />
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {{ loan.customerId?.firstName }} {{ loan.customerId?.lastName }}
              </h1>
              <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {{ loan.loanCaseNumber }}
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-xs" :class="getStageBadgeClass(loan.stage)">
                <span class="w-2 h-2 rounded-full" :class="getStageDotClass(loan.stage)"></span>
                {{ formatStage(loan.stage) }}
              </span>
            </div>

            <div class="mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500">
              <span class="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <PhFileText :size="14" class="text-primary-500" />
                {{ (loan.loanType || 'home_loan').replace(/_/g, ' ').toUpperCase() }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <PhPhone :size="14" class="text-slate-400" />
                <a :href="`tel:${loan.customerId?.mobile}`" class="font-mono text-slate-700 dark:text-slate-200 hover:text-primary-600 underline">
                  {{ loan.customerId?.mobile }}
                </a>
              </span>
              <span v-if="loan.preferredBank">•</span>
              <span v-if="loan.preferredBank" class="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <PhBuildings :size="14" class="text-slate-400" />
                {{ loan.preferredBank }}
              </span>
              <span v-if="loan.propertyId?.title">•</span>
              <span v-if="loan.propertyId?.title" class="text-primary-600 font-medium truncate max-w-[200px]">
                {{ loan.propertyId.title }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Action Bar -->
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button
            @click="isActivityModalOpen = true"
            class="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-default rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <PhPlus :size="14" weight="bold" />
            Add Activity
          </button>

          <button
            @click="isBankAppModalOpen = true"
            class="px-3.5 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <PhBank :size="15" weight="duotone" />
            Submit Bank
          </button>

          <button
            @click="isQueryModalOpen = true"
            class="px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <PhQuestion :size="15" weight="duotone" />
            Log Query
          </button>

          <button
            @click="isSanctionModalOpen = true"
            class="px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <PhCertificate :size="15" weight="duotone" />
            Record Sanction
          </button>

          <button
            @click="isDisbursementModalOpen = true"
            class="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 rounded-xl transition flex items-center gap-1.5 shadow-md"
          >
            <PhMoney :size="16" weight="duotone" />
            Disbursement
          </button>
        </div>
      </div>

      <!-- ── Horizontal Loan Progress Stepper ────────────────────────────── -->
      <div class="mt-8 pt-6 border-t border-default">
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <div
            v-for="(step, idx) in journeySteps"
            :key="step.id"
            class="flex flex-col items-center text-center p-2 rounded-xl border transition-all"
            :class="getStepStateClass(step.id)"
          >
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1.5" :class="getStepIconClass(step.id)">
              <PhCheck v-if="isStepPassed(step.id)" :size="12" weight="bold" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="text-[11px] font-bold leading-tight">{{ step.label }}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">{{ getStepSubtext(step.id) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 4 Valuation Metric Cards ────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm">
        <span class="text-xs font-medium text-slate-500">Loan Required</span>
        <div class="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
          ₹{{ (loan.requiredAmount || 0).toLocaleString('en-IN') }}
        </div>
        <div class="text-[11px] text-slate-400 mt-1">Initial customer budget request</div>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm">
        <span class="text-xs font-medium text-slate-500">Applied to Bank</span>
        <div class="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
          ₹{{ (loan.appliedAmount || loan.applications?.[0]?.appliedAmount || loan.requiredAmount || 0).toLocaleString('en-IN') }}
        </div>
        <div class="text-[11px] text-slate-400 mt-1">{{ loan.applications?.length || 0 }} bank submissions logged</div>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm">
        <span class="text-xs font-medium text-slate-500">Sanctioned Amount</span>
        <div class="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
          ₹{{ (loan.sanctionedAmount || loan.sanctionDetails?.sanctionedAmount || 0).toLocaleString('en-IN') }}
        </div>
        <div class="text-[11px] text-emerald-600 dark:text-emerald-400/80 font-medium mt-1">
          {{ loan.sanctionDetails?.interestRate ? `@ ${loan.sanctionDetails.interestRate}% interest` : 'Pending approval' }}
        </div>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Disbursed & Progress</span>
          <span class="text-xs font-bold text-primary-600 font-mono">{{ getDisbursedPercent() }}%</span>
        </div>
        <div class="text-xl font-black text-primary-600 font-mono mt-1">
          ₹{{ (loan.disbursedAmount || 0).toLocaleString('en-IN') }}
        </div>
        <!-- Progress Bar -->
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
          <div class="bg-primary-600 h-full transition-all duration-500" :style="{ width: `${getDisbursedPercent()}%` }"></div>
        </div>
      </div>
    </div>

    <!-- ── TABBED WORKSPACE ────────────────────────────────────────────────── -->
    <div class="bg-surface border border-default rounded-3xl p-6 shadow-sm space-y-6">
      <!-- Tabs Bar -->
      <div class="flex flex-wrap items-center gap-2 border-b border-default pb-4">
        <button
          v-for="t in workspaceTabs"
          :key="t.id"
          @click="activeWorkspaceTab = t.id"
          class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
          :class="activeWorkspaceTab === t.id
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          <component :is="t.icon" :size="16" />
          {{ t.label }}
          <span v-if="t.badge !== undefined" class="px-1.5 py-0.2 rounded-full text-[10px]" :class="activeWorkspaceTab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'">
            {{ t.badge }}
          </span>
        </button>
      </div>

      <!-- ── TAB 1: OVERVIEW & BANK SUBMISSIONS ─────────────────────────────── -->
      <div v-if="activeWorkspaceTab === 'overview'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Customer Profile -->
          <div class="p-5 bg-slate-50/70 dark:bg-slate-900/40 border border-default rounded-2xl space-y-3">
            <div class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <PhUser :size="16" class="text-primary-600" />
              Applicant Financial Profile
            </div>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">Employment:</span>
                <span class="font-bold text-slate-900 dark:text-white capitalize">{{ (loan.employmentType || 'salaried').replace(/_/g, ' ') }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">Monthly Income:</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">₹{{ (loan.monthlyIncome || 0).toLocaleString('en-IN') }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">CIBIL Score:</span>
                <span class="font-mono font-bold text-emerald-600">{{ loan.cibilScore || '750+' }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">PAN Card:</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">{{ loan.customerId?.pan || 'Verified' }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-500">Aadhaar:</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">{{ loan.customerId?.aadhaar || 'Verified' }}</span>
              </div>
            </div>
          </div>

          <!-- Linked Property / Deal Context -->
          <div class="p-5 bg-slate-50/70 dark:bg-slate-900/40 border border-default rounded-2xl space-y-3">
            <div class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <PhBuildings :size="16" class="text-primary-600" />
              Property & Deal Context
            </div>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">Property:</span>
                <span class="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{{ loan.propertyId?.title || 'Direct Application' }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">Builder / Developer:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ loan.propertyId?.builderName || 'Godrej Properties' }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">Configuration:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ loan.propertyId?.configuration || '3 BHK' }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">Agreed Deal Value:</span>
                <span class="font-mono font-bold text-primary-600">₹{{ (loan.dealId?.agreedPrice || loan.propertyId?.price || 15000000).toLocaleString('en-IN') }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-500">Deal Status:</span>
                <span class="font-bold text-emerald-600 uppercase">{{ loan.dealId?.status || 'Active' }}</span>
              </div>
            </div>
          </div>

          <!-- Sanction Terms Card -->
          <div class="p-5 bg-slate-50/70 dark:bg-slate-900/40 border border-default rounded-2xl space-y-3">
            <div class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <PhCertificate :size="16" class="text-emerald-600" />
              Sanction Terms & Letter
            </div>
            <div v-if="loan.sanctionDetails?.sanctionedAmount" class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">Sanctioned Bank:</span>
                <span class="font-bold text-emerald-600">{{ loan.sanctionDetails.bankName }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">Letter No:</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">{{ loan.sanctionDetails.sanctionLetterNumber || 'N/A' }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">Interest Rate:</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">{{ loan.sanctionDetails.interestRate }}% p.a.</span>
              </div>
              <div class="flex justify-between py-1 border-b border-default/60">
                <span class="text-slate-500">Monthly EMI:</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">₹{{ (loan.sanctionDetails.emi || 0).toLocaleString('en-IN') }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-500">Tenure:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ loan.sanctionDetails.tenureYears || 20 }} Years</span>
              </div>
            </div>
            <div v-else class="text-center py-6 text-xs text-slate-400 italic">
              <PhCertificate :size="24" class="mx-auto mb-1.5 opacity-40 text-emerald-500" />
              Sanction letter not recorded yet.
              <div class="mt-2">
                <button @click="isSanctionModalOpen = true" class="text-primary-600 font-bold hover:underline">
                  + Record Sanction
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Multi-Bank Submissions Directory -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhBank :size="18" class="text-primary-600" weight="duotone" />
              Bank & DSA Applications ({{ loan.applications?.length || 0 }})
            </h3>
            <button @click="isBankAppModalOpen = true" class="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <PhPlus :size="14" weight="bold" />
              Add Submission
            </button>
          </div>

          <div v-if="loan.applications?.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="app in loan.applications"
              :key="app._id"
              class="p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-default rounded-2xl space-y-2.5 shadow-xs"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white text-sm">{{ app.bankName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">App #: {{ app.applicationNumber || 'LOS-Pending' }}</div>
                </div>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {{ (app.stage || 'Submitted').replace(/_/g, ' ') }}
                </span>
              </div>

              <div class="text-xs text-slate-600 dark:text-slate-300">
                <span class="text-slate-400">Applied:</span>
                <span class="font-bold font-mono ml-1">₹{{ (app.appliedAmount || 0).toLocaleString('en-IN') }}</span>
              </div>

              <div v-if="app.bankRmName" class="pt-2 border-t border-default/60 text-[11px] text-slate-500 space-y-1">
                <div class="font-semibold text-slate-700 dark:text-slate-300">RM: {{ app.bankRmName }}</div>
                <div v-if="app.bankRmPhone" class="font-mono">{{ app.bankRmPhone }}</div>
              </div>

              <div v-if="app.statusRemarks" class="text-[11px] text-slate-500 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-default/40">
                "{{ app.statusRemarks }}"
              </div>
            </div>
          </div>

          <div v-else class="p-6 bg-slate-50/50 dark:bg-slate-900/20 border border-default rounded-2xl text-center text-xs text-slate-400">
            No bank applications logged yet. Click "Submit Bank" to record multi-bank submissions.
          </div>
        </div>
      </div>

      <!-- ── TAB 2: DOCUMENT CHECKLIST ──────────────────────────────────────── -->
      <div v-if="activeWorkspaceTab === 'documents'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Loan Document Verification Checklist</h3>
            <p class="text-xs text-slate-500 mt-0.5">Collect and verify KYC, income statements, and property paperwork</p>
          </div>
          <div class="text-xs font-bold px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
            Verified: {{ getVerifiedDocsCount() }} / {{ loan.documents?.length || 0 }}
          </div>
        </div>

        <div class="border border-default rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-default text-[11px] font-bold text-slate-500 uppercase">
              <tr>
                <th class="py-3 px-4">Document Name</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Required</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Verified By</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="doc in loan.documents" :key="doc._id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  {{ doc.name }}
                </td>
                <td class="py-3 px-4 uppercase text-[10px] font-bold text-slate-400 font-mono">
                  {{ doc.category }}
                </td>
                <td class="py-3 px-4">
                  <span v-if="doc.isRequired" class="text-rose-500 font-bold text-[10px]">Mandatory</span>
                  <span v-else class="text-slate-400 text-[10px]">Optional</span>
                </td>
                <td class="py-3 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase" :class="getDocBadgeClass(doc.status)">
                    {{ doc.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-500 font-medium">
                  {{ doc.verifiedBy?.firstName ? `${doc.verifiedBy.firstName} ${doc.verifiedBy.lastName || ''}` : '—' }}
                </td>
                <td class="py-3 px-4 text-right space-x-1.5">
                  <button
                    v-if="doc.status !== 'verified'"
                    @click="updateDocStatus(doc._id, 'verified')"
                    class="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold transition"
                  >
                    ✓ Verify
                  </button>
                  <button
                    v-if="doc.status === 'pending'"
                    @click="updateDocStatus(doc._id, 'received')"
                    class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-[11px] font-bold transition"
                  >
                    Mark Received
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── TAB 3: BANK QUERIES ────────────────────────────────────────────── -->
      <div v-if="activeWorkspaceTab === 'queries'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Bank Credit & Appraisal Queries</h3>
            <p class="text-xs text-slate-500 mt-0.5">Track resolution of documentation or income queries raised by underwriters</p>
          </div>
          <button @click="isQueryModalOpen = true" class="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition flex items-center gap-1.5">
            <PhPlus :size="14" weight="bold" />
            Raise Query
          </button>
        </div>

        <div v-if="loan.queries?.length > 0" class="border border-default rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-default text-[11px] font-bold text-slate-500 uppercase">
              <tr>
                <th class="py-3 px-4">Bank</th>
                <th class="py-3 px-4">Query Details</th>
                <th class="py-3 px-4">Required Proof</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Resolution</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="q in loan.queries" :key="q._id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  {{ q.bankName }}
                </td>
                <td class="py-3 px-4 max-w-[280px]">
                  <div class="font-medium text-slate-800 dark:text-slate-200">{{ q.queryDetails }}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">By: {{ q.queryRaisedBy || 'Credit Team' }}</div>
                </td>
                <td class="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                  {{ q.requiredDocument || 'Clarification' }}
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    :class="q.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ q.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-600 dark:text-slate-300 italic text-[11px]">
                  {{ q.resolution || 'Pending action' }}
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    v-if="q.status !== 'resolved'"
                    @click="openResolveQueryModal(q)"
                    class="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Resolve
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-8 bg-slate-50/50 dark:bg-slate-900/20 border border-default rounded-2xl text-center text-xs text-slate-400">
          <PhCheckCircle :size="30" class="mx-auto mb-2 text-emerald-500 opacity-60" />
          No open bank queries! File is running smoothly.
        </div>
      </div>

      <!-- ── TAB 4: DISBURSEMENTS LEDGER ────────────────────────────────────── -->
      <div v-if="activeWorkspaceTab === 'disbursements'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Loan Tranche Disbursements</h3>
            <p class="text-xs text-slate-500 mt-0.5">Complete record of funds disbursed to seller/developer escrow</p>
          </div>
          <button @click="isDisbursementModalOpen = true" class="px-3.5 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition flex items-center gap-1.5">
            <PhPlus :size="14" weight="bold" />
            Add Disbursement
          </button>
        </div>

        <div v-if="loan.disbursements?.length > 0" class="border border-default rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-default text-[11px] font-bold text-slate-500 uppercase">
              <tr>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Bank</th>
                <th class="py-3 px-4">Amount Released</th>
                <th class="py-3 px-4">Type</th>
                <th class="py-3 px-4">UTR / Ref No.</th>
                <th class="py-3 px-4">Beneficiary</th>
                <th class="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="d in loan.disbursements" :key="d._id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition font-medium">
                <td class="py-3 px-4 text-slate-600 dark:text-slate-300">
                  {{ formatDate(d.disbursementDate) }}
                </td>
                <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  {{ d.bankName }}
                </td>
                <td class="py-3 px-4 font-mono font-bold text-emerald-600 text-sm">
                  ₹{{ (d.amount || 0).toLocaleString('en-IN') }}
                </td>
                <td class="py-3 px-4 uppercase text-[10px] font-bold text-slate-500 font-mono">
                  {{ d.disbursementType }}
                </td>
                <td class="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                  {{ d.referenceNumber || '—' }}
                </td>
                <td class="py-3 px-4 text-slate-600 dark:text-slate-300">
                  {{ d.beneficiary || 'Developer Escrow' }}
                </td>
                <td class="py-3 px-4 text-slate-500 text-[11px]">
                  {{ d.recordedBy?.firstName || 'System' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-8 bg-slate-50/50 dark:bg-slate-900/20 border border-default rounded-2xl text-center text-xs text-slate-400">
          No disbursements released yet. Click "Disbursement" to record bank tranche.
        </div>
      </div>

      <!-- ── TAB 5: LOAN COMMISSION ─────────────────────────────────────────── -->
      <div v-if="activeWorkspaceTab === 'commission'" class="space-y-6">
        <div class="p-6 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-3xl space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
                <PhHandCoins :size="22" weight="duotone" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Broker Loan Commission</h3>
                <p class="text-xs text-slate-500">Auto-calculated from loan disbursement and synced with Financials</p>
              </div>
            </div>
            <router-link
              to="/app/commissions"
              class="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              View in Financials
              <PhArrowRight :size="14" weight="bold" />
            </router-link>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div class="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-default">
              <span class="text-[11px] font-medium text-slate-400">Payable By</span>
              <div class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {{ loan.commissionTerms?.payablePartyName || loan.preferredBank || 'HDFC Bank' }}
              </div>
              <div class="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Bank / DSA</div>
            </div>

            <div class="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-default">
              <span class="text-[11px] font-medium text-slate-400">Commission Rate</span>
              <div class="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {{ loan.commissionTerms?.commissionRate || 0.5 }}%
              </div>
              <div class="text-[10px] text-slate-400 mt-0.5">of disbursed value</div>
            </div>

            <div class="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-default">
              <span class="text-[11px] font-medium text-slate-400">Expected Commission</span>
              <div class="text-lg font-black text-amber-600 font-mono mt-0.5">
                ₹{{ (loan.commissionTerms?.expectedAmount || 0).toLocaleString('en-IN') }}
              </div>
              <div class="text-[10px] text-emerald-600 font-medium mt-0.5">Auto-provisioned</div>
            </div>

            <div class="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-default">
              <span class="text-[11px] font-medium text-slate-400">Receivable Status</span>
              <div class="text-sm font-bold text-slate-900 dark:text-white uppercase mt-0.5">
                {{ (loan.stage === 'fully_disbursed' || loan.stage === 'partially_disbursed') ? 'Active Receivable' : 'Pending Disbursement' }}
              </div>
              <div class="text-[10px] text-slate-400 mt-0.5">TDS: 5% Applicable</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB 6: ACTIVITY TIMELINE ───────────────────────────────────────── -->
      <div v-if="activeWorkspaceTab === 'timeline'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Loan Case Activity Timeline</h3>
            <p class="text-xs text-slate-500 mt-0.5">Complete chronological history of submissions, sanctions, calls, and follow-ups</p>
          </div>
          <button @click="isActivityModalOpen = true" class="px-3.5 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition flex items-center gap-1.5">
            <PhPlus :size="14" weight="bold" />
            Add Activity
          </button>
        </div>

        <div class="space-y-3 pt-2">
          <div
            v-for="(t, idx) in (loan.timeline || []).slice().reverse()"
            :key="idx"
            class="flex items-start gap-3 p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-default rounded-2xl"
          >
            <div class="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center shrink-0 mt-0.5">
              <PhClockCounterClockwise :size="16" weight="duotone" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900 dark:text-white">{{ t.title || t.event }}</span>
                <span class="text-[11px] text-slate-400 font-mono">{{ formatDate(t.createdAt) }}</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{{ t.description }}</p>
              <div v-if="t.performedBy" class="text-[10px] text-slate-400 mt-1 font-medium">
                By: {{ t.performedBy.firstName }} {{ t.performedBy.lastName || '' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <BankApplicationModal
      :is-open="isBankAppModalOpen"
      :loan-case="loan"
      :loading="isSubmitting"
      @close="isBankAppModalOpen = false"
      @submit="handleBankAppSubmit"
    />

    <RecordSanctionModal
      :is-open="isSanctionModalOpen"
      :loan-case="loan"
      :loading="isSubmitting"
      @close="isSanctionModalOpen = false"
      @submit="handleSanctionSubmit"
    />

    <RecordDisbursementModal
      :is-open="isDisbursementModalOpen"
      :loan-case="loan"
      :loading="isSubmitting"
      @close="isDisbursementModalOpen = false"
      @submit="handleDisbursementSubmit"
    />

    <BankQueryModal
      :is-open="isQueryModalOpen"
      :loan-case="loan"
      :loading="isSubmitting"
      @close="isQueryModalOpen = false"
      @submit="handleQuerySubmit"
    />

    <ResolveQueryModal
      :is-open="isResolveModalOpen"
      :query="selectedQuery"
      :loading="isSubmitting"
      @close="isResolveModalOpen = false"
      @submit="handleResolveQuerySubmit"
    />

    <AddLoanActivityModal
      :is-open="isActivityModalOpen"
      :loading="isSubmitting"
      @close="isActivityModalOpen = false"
      @submit="handleActivitySubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  PhBank,
  PhArrowLeft,
  PhFileText,
  PhPhone,
  PhBuildings,
  PhPlus,
  PhQuestion,
  PhCertificate,
  PhMoney,
  PhCheck,
  PhUser,
  PhFiles,
  PhCheckCircle,
  PhHandCoins,
  PhClockCounterClockwise,
  PhArrowRight,
} from '@phosphor-icons/vue';
import apiClient from '@/api/client';

import BankApplicationModal from '../components/BankApplicationModal.vue';
import RecordSanctionModal from '../components/RecordSanctionModal.vue';
import RecordDisbursementModal from '../components/RecordDisbursementModal.vue';
import BankQueryModal from '../components/BankQueryModal.vue';
import ResolveQueryModal from '../components/ResolveQueryModal.vue';
import AddLoanActivityModal from '../components/AddLoanActivityModal.vue';

const route = useRoute();
const loan = ref(null);
const activeWorkspaceTab = ref('overview');

const isBankAppModalOpen = ref(false);
const isSanctionModalOpen = ref(false);
const isDisbursementModalOpen = ref(false);
const isQueryModalOpen = ref(false);
const isResolveModalOpen = ref(false);
const isActivityModalOpen = ref(false);
const selectedQuery = ref(null);
const isSubmitting = ref(false);

const journeySteps = [
  { id: 'new', label: 'New File' },
  { id: 'docs', label: 'Documents' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'review', label: 'Under Review' },
  { id: 'sanctioned', label: 'Sanctioned 🎉' },
  { id: 'disbursed', label: 'Disbursed' },
  { id: 'commission', label: 'Commission' },
];

const workspaceTabs = computed(() => [
  { id: 'overview', label: 'Overview & Banks', icon: PhBank },
  { id: 'documents', label: 'Documents Checklist', icon: PhFiles, badge: `${getVerifiedDocsCount()}/${loan.value?.documents?.length || 0}` },
  { id: 'queries', label: 'Bank Queries', icon: PhQuestion, badge: loan.value?.queries?.filter((q) => q.status === 'open').length || undefined },
  { id: 'disbursements', label: 'Disbursements', icon: PhMoney, badge: loan.value?.disbursements?.length || undefined },
  { id: 'commission', label: 'Commission & Receivables', icon: PhHandCoins },
  { id: 'timeline', label: 'Activity Timeline', icon: PhClockCounterClockwise },
]);

const fetchLoanDetails = async () => {
  try {
    const res = await apiClient.get(`/loans/${route.params.id}`);
    loan.value = res.data?.data || res.data;
  } catch (err) {
    console.error('Error loading loan details:', err);
  }
};

onMounted(() => {
  fetchLoanDetails();
});

const getVerifiedDocsCount = () => {
  return loan.value?.documents?.filter((d) => d.status === 'verified').length || 0;
};

const getDisbursedPercent = () => {
  if (!loan.value) return 0;
  const target = Number(loan.value.sanctionedAmount || loan.value.requiredAmount || 0);
  if (!target) return 0;
  const disbursed = Number(loan.value.disbursedAmount || 0);
  return Math.min(100, Math.round((disbursed / target) * 100));
};

const isStepPassed = (stepId) => {
  if (!loan.value) return false;
  const stage = loan.value.stage;
  const order = ['new', 'documents_pending', 'documents_collected', 'submitted_to_bank', 'under_review', 'query_raised', 'query_resolved', 'sanctioned', 'disbursement_pending', 'partially_disbursed', 'fully_disbursed'];
  const curIdx = order.indexOf(stage);

  if (stepId === 'new') return curIdx >= 0;
  if (stepId === 'docs') return curIdx >= 2;
  if (stepId === 'submitted') return curIdx >= 3;
  if (stepId === 'review') return curIdx >= 4;
  if (stepId === 'sanctioned') return curIdx >= 7;
  if (stepId === 'disbursed') return curIdx >= 10;
  if (stepId === 'commission') return curIdx >= 10;
  return false;
};

const getStepStateClass = (stepId) => {
  if (isStepPassed(stepId)) {
    return 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300';
  }
  return 'border-default bg-slate-50/50 dark:bg-slate-800/30 text-slate-400';
};

const getStepIconClass = (stepId) => {
  if (isStepPassed(stepId)) {
    return 'bg-primary-600 text-white';
  }
  return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
};

const getStepSubtext = (stepId) => {
  if (stepId === 'new') return 'Lead created';
  if (stepId === 'docs') return `${getVerifiedDocsCount()} verified`;
  if (stepId === 'submitted') return loan.value?.preferredBank || 'Bank';
  if (stepId === 'review') return 'Credit Check';
  if (stepId === 'sanctioned') return loan.value?.sanctionedAmount ? `₹${(loan.value.sanctionedAmount / 100000).toFixed(1)}L` : 'Approval';
  if (stepId === 'disbursed') return loan.value?.disbursedAmount ? `₹${(loan.value.disbursedAmount / 100000).toFixed(1)}L` : 'Funds';
  if (stepId === 'commission') return 'Financials';
  return '';
};

const formatStage = (s) => {
  if (!s) return 'New';
  return s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStageBadgeClass = (stage) => {
  switch (stage) {
    case 'sanctioned':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    case 'fully_disbursed':
      return 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800';
    case 'partially_disbursed':
      return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    case 'query_raised':
      return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

const getStageDotClass = (stage) => {
  switch (stage) {
    case 'sanctioned':
      return 'bg-emerald-500';
    case 'fully_disbursed':
    case 'partially_disbursed':
      return 'bg-primary-500';
    case 'query_raised':
      return 'bg-amber-500';
    default:
      return 'bg-slate-400';
  }
};

const getDocBadgeClass = (status) => {
  switch (status) {
    case 'verified':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
    case 'received':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
    case 'rejected':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
};

// Handlers
const updateDocStatus = async (docId, status) => {
  try {
    await apiClient.patch(`/loans/${loan.value._id}/documents/${docId}`, { status });
    await fetchLoanDetails();
  } catch (err) {
    console.error('Error updating document status:', err);
  }
};

const handleBankAppSubmit = async (payload) => {
  isSubmitting.value = true;
  try {
    await apiClient.post(`/loans/${loan.value._id}/bank-applications`, payload);
    isBankAppModalOpen.value = false;
    await fetchLoanDetails();
  } catch (err) {
    console.error('Error submitting bank application:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const handleSanctionSubmit = async (payload) => {
  isSubmitting.value = true;
  try {
    await apiClient.post(`/loans/${loan.value._id}/sanction`, payload);
    isSanctionModalOpen.value = false;
    await fetchLoanDetails();
  } catch (err) {
    console.error('Error recording sanction:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDisbursementSubmit = async (payload) => {
  isSubmitting.value = true;
  try {
    await apiClient.post(`/loans/${loan.value._id}/disbursements`, payload);
    isDisbursementModalOpen.value = false;
    await fetchLoanDetails();
  } catch (err) {
    console.error('Error recording disbursement:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const handleQuerySubmit = async (payload) => {
  isSubmitting.value = true;
  try {
    await apiClient.post(`/loans/${loan.value._id}/queries`, payload);
    isQueryModalOpen.value = false;
    await fetchLoanDetails();
  } catch (err) {
    console.error('Error logging query:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const openResolveQueryModal = (q) => {
  selectedQuery.value = q;
  isResolveModalOpen.value = true;
};

const handleResolveQuerySubmit = async (payload) => {
  isSubmitting.value = true;
  try {
    await apiClient.patch(`/loans/${loan.value._id}/queries/${selectedQuery.value._id}/resolve`, payload);
    isResolveModalOpen.value = false;
    await fetchLoanDetails();
  } catch (err) {
    console.error('Error resolving query:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const handleActivitySubmit = async (payload) => {
  isSubmitting.value = true;
  try {
    await apiClient.post(`/loans/${loan.value._id}/activities`, payload);
    isActivityModalOpen.value = false;
    await fetchLoanDetails();
  } catch (err) {
    console.error('Error logging loan activity:', err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
