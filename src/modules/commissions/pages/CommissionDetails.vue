<template>
  <div class="space-y-6 text-xs">
    <!-- Loading State -->
    <div v-if="loading" class="p-8 space-y-4 animate-pulse">
      <div class="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
      <div class="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="!commission" class="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
      <AppIcon name="warning" :size="30" class="mx-auto text-amber-500" weight="duotone" />
      <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Commission Record Not Found</h3>
      <router-link to="/app/commissions" class="btn-md btn-primary inline-flex">
        Return to Commissions
      </router-link>
    </div>

    <!-- Details Content -->
    <div v-else class="space-y-6">
      <!-- Header Banner -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2.5 flex-wrap">
            <router-link to="/app/commissions" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              ← Commissions
            </router-link>
            <span class="text-slate-300 dark:text-slate-700">/</span>
            <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {{ commission.commissionNumber || 'COM-' + commission._id.slice(-4).toUpperCase() }}
            </span>
            <span 
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              :class="getStatusBadgeClass(commission.paymentStatus)"
            >
              {{ formatStatusLabel(commission.paymentStatus) }}
            </span>
          </div>

          <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>{{ customerName }}</span>
            <span class="text-slate-400 font-normal text-sm">· {{ projectOrPropertyName }}</span>
          </h2>
        </div>

        <div class="flex items-center gap-3 shrink-0 flex-wrap">
          <button 
            v-if="commission.totalCommissionOutstanding > 0"
            @click="paymentModalOpen = true"
            class="px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <span class="inline-flex items-center gap-1.5"><AppIcon name="payment" :size="14" /> Record payment</span>
          </button>
          <button 
            @click="loadCommission"
            class="px-3.5 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            ⟳ Refresh
          </button>
        </div>
      </div>

      <!-- Financial Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Final Deal Value</span>
          <span class="text-base font-bold text-slate-800 dark:text-slate-100 block">
            ₹{{ Number(commission.finalDealValue || commission.dealId?.dealValue || 0).toLocaleString('en-IN') }}
          </span>
          <span class="text-[10px] text-slate-400">Agreed Property Value</span>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Commission Rate</span>
          <span class="text-base font-bold text-indigo-600 dark:text-indigo-400 block">
            {{ commission.commissionRate || 2 }}%
          </span>
          <span class="text-[10px] text-slate-400 capitalize">{{ commission.commissionType || 'percentage' }} Type</span>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">Expected Total</span>
          <span class="text-base font-extrabold text-slate-800 dark:text-slate-100 block">
            ₹{{ Number(commission.totalCommissionExpected || 0).toLocaleString('en-IN') }}
          </span>
          <span class="text-[10px] text-slate-400">Total Brokerage Due</span>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">Total Received</span>
          <span class="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block">
            ₹{{ Number(commission.totalCommissionCollected || 0).toLocaleString('en-IN') }}
          </span>
          <span class="text-[10px] text-emerald-500 font-semibold">{{ collectionPercentage }}% cleared</span>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">Balance Outstanding</span>
          <span class="text-base font-extrabold text-amber-600 dark:text-amber-400 block">
            ₹{{ Number(commission.totalCommissionOutstanding || 0).toLocaleString('en-IN') }}
          </span>
          <span class="text-[10px] text-slate-400">Due {{ formatDate(commission.expectedPaymentDate) }}</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="border-b border-slate-200 dark:border-slate-800 flex space-x-6">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="pb-3 text-xs font-bold transition-all relative"
          :class="activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
        >
          {{ tab.name }}
          <span v-if="tab.count !== undefined" class="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Tab 1: Overview & Deal Details -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Deal Valuation Info Card -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 class="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            Deal & Property Information
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-slate-400 block">Deal Number</span>
              <span class="font-mono font-bold text-slate-800 dark:text-slate-100">{{ commission.dealId?.dealNumber || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Customer</span>
              <span class="font-semibold text-slate-800 dark:text-slate-100">{{ customerName }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Project Name</span>
              <span class="font-semibold text-slate-800 dark:text-slate-100">{{ commission.projectId?.name || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Unit Number</span>
              <span class="font-semibold text-slate-800 dark:text-slate-100">{{ commission.unitNumber || 'Standard Unit' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Property Configuration</span>
              <span class="font-semibold text-slate-800 dark:text-slate-100">{{ commission.propertyId?.configuration || commission.propertyId?.title || 'Residential' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Closing Date</span>
              <span class="font-semibold text-slate-800 dark:text-slate-100">{{ formatDate(commission.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Paying Entity & Terms Card -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 class="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            Paying Party & Terms
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-slate-400 block">Commission Payable By</span>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 inline-block mt-0.5">
                {{ formatPartyType(commission.payablePartyType) }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block">Paying Entity Name</span>
              <span class="font-bold text-slate-800 dark:text-slate-100">{{ commission.payablePartyName || 'Developer' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Expected Due Date</span>
              <span class="font-semibold text-slate-800 dark:text-slate-100">{{ formatDate(commission.expectedPaymentDate) }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">TDS Withholding (194H)</span>
              <span class="font-semibold text-slate-800 dark:text-slate-100">{{ commission.tdsPercentage || 5 }}%</span>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span class="text-slate-400 block mb-1">Payment Terms</span>
            <p class="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-slate-700 dark:text-slate-200 font-medium">
              {{ commission.paymentTerms || 'Standard 30 Days Net on Registration' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tab 2: Payment Schedule / Milestones -->
      <div v-else-if="activeTab === 'milestones'" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-4 bg-slate-50/70 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 class="font-bold text-slate-800 dark:text-slate-100">Milestone Payment Schedule</h3>
          <span class="text-[11px] text-slate-400">4 Staged Milestones</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-[10px] font-bold uppercase text-slate-400 bg-slate-50/40 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th class="py-3 px-4">Milestone</th>
                <th class="py-3 px-4">Expected Amount</th>
                <th class="py-3 px-4">Expected Date</th>
                <th class="py-3 px-4">Received Amount</th>
                <th class="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="m in commission.milestones" :key="m._id || m.milestoneName" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                  {{ m.milestoneName }}
                </td>
                <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                  ₹{{ Number(m.expectedAmount || 0).toLocaleString('en-IN') }}
                </td>
                <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  {{ formatDate(m.expectedDate) }}
                </td>
                <td class="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{{ Number(m.receivedAmount || 0).toLocaleString('en-IN') }}
                </td>
                <td class="py-3.5 px-4">
                  <span 
                    class="px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                    :class="getStatusBadgeClass(m.status)"
                  >
                    {{ m.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Payments Received Ledger -->
      <div v-else-if="activeTab === 'payments'" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden space-y-0">
        <div class="p-4 bg-slate-50/70 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 class="font-bold text-slate-800 dark:text-slate-100">Payments Received Ledger</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Chronological record of partial and full payments received</p>
          </div>
          <button 
            v-if="commission.totalCommissionOutstanding > 0"
            @click="paymentModalOpen = true"
            class="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            + Record Payment
          </button>
        </div>

        <div v-if="!commission.payments || commission.payments.length === 0" class="p-12 text-center space-y-2">
          <span class="text-3xl">⏱️</span>
          <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">No Payments Recorded Yet</h4>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            Use the "+ Record Payment" button to record cheque deposits, NEFT transfers, or UPI payments.
          </p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-[10px] font-bold uppercase text-slate-400 bg-slate-50/40 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th class="py-3 px-4">Payment Date</th>
                <th class="py-3 px-4">Amount Received</th>
                <th class="py-3 px-4">Payment Method</th>
                <th class="py-3 px-4">Transaction Ref / UTR</th>
                <th class="py-3 px-4">Received From</th>
                <th class="py-3 px-4">Bank Account</th>
                <th class="py-3 px-4">TDS (194H)</th>
                <th class="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="p in commission.payments" :key="p._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                  {{ formatDate(p.paymentDate) }}
                </td>
                <td class="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{{ Number(p.amount || 0).toLocaleString('en-IN') }}
                </td>
                <td class="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-200">
                  {{ p.paymentMethod || 'Bank Transfer' }}
                </td>
                <td class="py-3.5 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  {{ p.referenceNumber || 'N/A' }}
                </td>
                <td class="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                  {{ p.receivedFrom || commission.payablePartyName || 'Developer' }}
                </td>
                <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                  {{ p.bankAccount || 'Main Account' }}
                </td>
                <td class="py-3.5 px-4">
                  <span v-if="p.tdsDeducted" class="text-amber-600 dark:text-amber-400 font-semibold">
                    -₹{{ Number(p.tdsAmount || 0).toLocaleString('en-IN') }}
                  </span>
                  <span v-else class="text-slate-400">—</span>
                </td>
                <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                  {{ p.notes || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 4: Documents & Notes -->
      <div v-else-if="activeTab === 'documents'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 class="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            Attached Documents
          </h3>

          <div class="space-y-2">
            <div class="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-2">
                <AppIcon name="file" :size="15" />
                <div>
                  <div class="font-bold text-slate-800 dark:text-slate-200">Commission_Agreement.pdf</div>
                  <div class="text-[10px] text-slate-400">Signed with {{ commission.payablePartyName }}</div>
                </div>
              </div>
              <span class="text-indigo-600 dark:text-indigo-400 font-bold">Verified</span>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-2">
                <AppIcon name="clipboard" :size="15" />
                <div>
                  <div class="font-bold text-slate-800 dark:text-slate-200">B2B_Invoice_INV-001.pdf</div>
                  <div class="text-[10px] text-slate-400">Tax Invoice with GST details</div>
                </div>
              </div>
              <span class="text-indigo-600 dark:text-indigo-400 font-bold">Generated</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 class="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            Financial Remarks & History
          </h3>
          <p class="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl leading-relaxed">
            {{ commission.notes || commission.remarks || 'Commission created automatically upon closing deal. Payment milestones and clearance ledger active.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Record Payment Drawer -->
    <Teleport to="body">
      <Transition name="drawer-slide">
        <div v-if="paymentModalOpen" class="fixed inset-0 z-[1000] flex justify-end overflow-hidden" style="background-color: rgba(9, 14, 26, 0.6); backdrop-filter: blur(3px);" @click.self="paymentModalOpen = false">
          <div class="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full h-full flex flex-col overflow-hidden text-xs">
            <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50 shrink-0">
              <div>
                <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <AppIcon name="payment" :size="15" />
                  <span>Record Commission Payment</span>
                </h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ commission?.commissionNumber }} · {{ commission?.payablePartyName }}
                </p>
              </div>
              <button @click="paymentModalOpen = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Close"><AppIcon name="close" :size="15" weight="bold" /></button>
            </div>

            <form @submit.prevent="submitPayment" class="p-5 space-y-4 flex-1 overflow-y-auto">
          <div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex justify-between items-center text-amber-700 dark:text-amber-300">
            <div>
              <span class="text-[10px] font-bold uppercase block">Current Outstanding</span>
              <span class="text-base font-extrabold">₹{{ Number(commission?.totalCommissionOutstanding || 0).toLocaleString('en-IN') }}</span>
            </div>
            <span class="text-xs font-semibold">Expected: ₹{{ Number(commission?.totalCommissionExpected || 0).toLocaleString('en-IN') }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Date *</label>
              <input v-model="paymentForm.paymentDate" type="date" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Received (₹) *</label>
              <input v-model.number="paymentForm.amount" type="number" min="1" :max="commission?.totalCommissionOutstanding" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method *</label>
              <select v-model="paymentForm.paymentMethod" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100">
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transaction Ref / UTR *</label>
              <input v-model="paymentForm.referenceNumber" type="text" placeholder="e.g. UTR987654321" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Received From</label>
              <input v-model="paymentForm.receivedFrom" type="text" placeholder="e.g. Builder Accounts" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deposited Bank Account</label>
              <input v-model="paymentForm.bankAccount" type="text" placeholder="e.g. HDFC 00123" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100" />
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
              <input type="checkbox" v-model="paymentForm.tdsDeducted" class="rounded text-indigo-600" />
              <span>TDS Deducted (Section 194H)</span>
            </label>
            <div v-if="paymentForm.tdsDeducted" class="flex-1 flex items-center gap-2">
              <label class="text-slate-400">TDS Amount (₹):</label>
              <input v-model.number="paymentForm.tdsAmount" type="number" class="w-28 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1" />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Remarks</label>
            <textarea v-model="paymentForm.notes" rows="2" placeholder="e.g. Milestone 1 payment cleared" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button type="button" @click="paymentModalOpen = false" class="px-4 py-2 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
            <button type="submit" :disabled="savingPayment" class="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all">
              <span v-if="savingPayment">Recording...</span>
              <span v-else>Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</Teleport>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchCommissionById, recordCommissionPayment } from '../api/endpoints';
import Swal from 'sweetalert2';

const route = useRoute();
const commissionId = route.params.id;

const loading = ref(true);
const commission = ref(null);
const activeTab = ref('overview');

const paymentModalOpen = ref(false);
const savingPayment = ref(false);
const paymentForm = ref({
  paymentDate: new Date().toISOString().slice(0, 10),
  amount: 0,
  paymentMethod: 'Bank Transfer',
  referenceNumber: '',
  receivedFrom: '',
  bankAccount: '',
  tdsDeducted: false,
  tdsAmount: 0,
  notes: '',
});

const customerName = computed(() => {
  const c = commission.value?.customerId || commission.value?.dealId?.customer;
  if (!c) return 'Customer';
  if (typeof c === 'string') return c;
  return c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Customer';
});

const projectOrPropertyName = computed(() => {
  const p = commission.value?.projectId || commission.value?.dealId?.project;
  const prop = commission.value?.propertyId || commission.value?.dealId?.property;
  if (p && typeof p === 'object') return p.name || 'Project';
  if (prop && typeof prop === 'object') return prop.title || 'Property';
  return 'Property / Unit';
});

const collectionPercentage = computed(() => {
  const exp = Number(commission.value?.totalCommissionExpected || 0);
  const col = Number(commission.value?.totalCommissionCollected || 0);
  if (exp <= 0) return 0;
  return Math.min(100, Math.round((col / exp) * 100));
});

const tabs = computed(() => [
  { id: 'overview', name: 'Overview & Valuation' },
  { id: 'milestones', name: 'Payment Schedule', count: commission.value?.milestones?.length || 4 },
  { id: 'payments', name: 'Payments Received', count: commission.value?.payments?.length || 0 },
  { id: 'documents', name: 'Documents & Notes' },
]);

async function loadCommission() {
  loading.value = true;
  try {
    const res = await fetchCommissionById(commissionId);
    commission.value = res?.data || res;
    if (commission.value) {
      paymentForm.value.amount = commission.value.totalCommissionOutstanding || 0;
      paymentForm.value.receivedFrom = commission.value.payablePartyName || '';
    }
  } catch (err) {
    console.error('Failed to load commission:', err);
  } finally {
    loading.value = false;
  }
}

function formatPartyType(t) {
  const map = {
    builder: 'Builder / Developer',
    seller: 'Property Seller',
    customer: 'Customer / Buyer',
    channel_partner: 'Channel Partner',
    broker: 'Broker',
    other: 'Other',
  };
  return map[t] || t || 'Builder';
}

function formatDate(d) {
  if (!d) return 'Not Set';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatStatusLabel(s) {
  const map = {
    unpaid: 'UNPAID',
    partially_paid: 'PARTIALLY PAID',
    fully_paid: 'FULLY PAID',
    overdue: 'OVERDUE',
  };
  return map[s] || String(s).toUpperCase();
}

function getStatusBadgeClass(s) {
  switch (s) {
    case 'fully_paid':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    case 'partially_paid':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    case 'overdue':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
  }
}

async function submitPayment() {
  if (!commission.value) return;
  savingPayment.value = true;
  try {
    await recordCommissionPayment({
      id: commission.value._id,
      ...paymentForm.value,
    });
    paymentModalOpen.value = false;
    await loadCommission();
  } catch (err) {
    Swal.fire({ text: err.response?.data?.error?.message || err.message || 'Failed to record payment.', icon: 'error' });
  } finally {
    savingPayment.value = false;
  }
}

onMounted(() => {
  loadCommission();
});
</script>

<style scoped>
.drawer-slide-enter-active { transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-slide-leave-active { transition: transform 180ms cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }
</style>
