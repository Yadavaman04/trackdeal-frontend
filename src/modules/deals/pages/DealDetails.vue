<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="animate-pulse space-y-6">
    <div class="h-20 bg-slate-200 dark:bg-slate-850 rounded-xl w-full"></div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 h-96 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
      <div class="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
    </div>
  </div>

  <!-- Empty state -->
  <div v-else-if="!deal" class="text-center py-12 text-slate-500 bg-surface border border-default rounded-xl flex items-center justify-center gap-2">
    <PhWarning :size="16" class="text-red-500" />
    <span>Deal file profile not found.</span>
  </div>

  <!-- Main View -->
  <div v-else class="space-y-6 text-xs">
    <!-- Breadcrumb -->
    <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center space-x-1.5 uppercase tracking-wider shrink-0">
      <router-link to="/app/deals" class="hover:text-primary transition-colors">Deals</router-link>
      <span>/</span>
      <span class="text-slate-700 dark:text-slate-350">{{ dealNumber }}</span>
    </div>

    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-heading text-lg font-extrabold text-primary uppercase shrink-0">
          DL
        </div>
        <div>
          <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {{ dealNumber }}
          </h2>
          <div class="flex flex-wrap items-center gap-2 mt-1">
            <span 
              class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
              :class="getStageBadgeClass(deal.status)"
            >
              ● {{ formatStageName(deal.status) }}
            </span>
            <span class="text-[10px] text-slate-400 font-medium">Health: <b class="text-emerald-500">{{ deal.healthScore || 90 }}%</b></span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap items-center gap-2.5 self-end md:self-auto shrink-0">
        <!-- Stepper wizard trigger -->
        <button 
          @click="isWizardOpen = true"
          class="btn-md btn-secondary"
        >
          <PhTable :size="14" />
          <span>Booking Wizard</span>
        </button>

        <!-- Cancel deal trigger -->
        <button 
          v-if="deal.status !== 'cancelled' && deal.status !== 'deal_closed'"
          @click="isCancelOpen = true"
          class="btn-md btn-danger-outline"
        >
          <PhXCircle :size="14" />
          <span>Cancel Deal</span>
        </button>

        <!-- Dropdown transition -->
        <div class="relative inline-block text-left" v-if="deal.status !== 'cancelled'">
          <select 
            :value="deal.status" 
            @change="handleStageTransition" 
            class="bg-primary text-white text-xs font-bold px-3.5 py-1.8 rounded-lg outline-none cursor-pointer"
          >
            <option value="draft">Reserved / Draft</option>
            <option value="token_received">Token Received</option>
            <option value="booking_confirmed">Booking Confirmed</option>
            <option value="agreement_executed">Agreement Executed</option>
            <option value="registration_completed">Registration Completed</option>
            <option value="commission_eligible">Commission Eligible</option>
            <option value="deal_closed">Closed Won</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left & Center Workspace -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Main Tab Switcher -->
        <div class="bg-surface border border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
          <!-- Desktop Tabs Header -->
          <header class="hidden md:flex border-b border-default px-4 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto shrink-0 scrollbar-none">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-4 py-3 border-b-2 font-heading text-xs font-bold transition-all relative top-[1px] shrink-0"
              :class="[
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              ]"
            >
              {{ tab.name }}
            </button>
          </header>

          <!-- Mobile Tabs Picker -->
          <div class="md:hidden p-3 border-b border-default bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-between">
            <div class="flex space-x-1">
              <button 
                v-for="tab in tabs.slice(0, 3)" 
                :key="tab.id"
                @click="activeTab = tab.id"
                class="px-2.5 py-1.5 rounded text-[10px] font-bold uppercase transition-all"
                :class="activeTab === tab.id ? 'bg-primary text-white' : 'text-slate-500'"
              >
                {{ tab.mobileName || tab.name.split(' ')[0] }}
              </button>
            </div>
            <select 
              v-model="activeTab"
              class="bg-surface border border-default rounded px-2 py-1 text-[10px] font-semibold text-slate-700"
            >
              <option v-for="tab in tabs.slice(3)" :key="tab.id" :value="tab.id">
                {{ tab.name }}
              </option>
            </select>
          </div>

          <!-- Tab Content Area -->
          <div class="p-4 flex-1">
            <!-- 1. OVERVIEW TAB -->
            <div v-if="activeTab === 'overview'" class="space-y-4">
              <!-- General Info Card -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-900 p-4 rounded-xl border border-default">
                <div>
                  <span class="text-slate-400 font-bold block text-[8px] uppercase">Base Value</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200 text-sm font-heading">{{ formatCurrency(deal.dealValue) }}</span>
                </div>
                <div>
                  <span class="text-slate-400 font-bold block text-[8px] uppercase">Expected Commission</span>
                  <span class="font-bold text-emerald-600 text-sm font-heading">{{ formatCurrency(deal.commissionAmount) }} ({{ deal.commissionPercentage }}%)</span>
                </div>
                <div>
                  <span class="text-slate-400 font-bold block text-[8px] uppercase">Est. Close Target</span>
                  <span class="font-semibold text-slate-800 dark:text-slate-250">{{ formatDate(deal.closeDate || deal.createdAt) }}</span>
                </div>
                <div>
                  <span class="text-slate-400 font-bold block text-[8px] uppercase">Sourcing Agent</span>
                  <span class="font-semibold text-slate-800 dark:text-slate-250">{{ deal.assignedTo?.firstName || 'Staff' }}</span>
                </div>
              </div>

              <!-- Stage progress timeline view -->
              <div class="border border-default rounded-xl p-4 bg-surface space-y-4">
                <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Milestone Stage Tracker</h4>
                <div class="relative flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                  <!-- Connector bar -->
                  <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>
                  
                  <div 
                    v-for="st in timelineStages" 
                    :key="st.key"
                    class="flex flex-col items-center space-y-1.5 bg-surface px-1"
                  >
                    <span 
                      class="w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold"
                      :class="getStageCheckCircleClass(st.key)"
                    >
                      <PhCheck v-if="isStageCompleted(st.key)" :size="8" />
                      <span v-else>{{ st.num }}</span>
                    </span>
                    <span :class="deal.status === st.key ? 'text-primary font-extrabold' : ''">{{ st.label }}</span>
                  </div>
                </div>
              </div>

              <!-- Notes Summary -->
              <div class="border border-default rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30">
                <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 mb-2">Transaction Summary / Notes</h4>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {{ deal.notes || 'No description notes provided on creation.' }}
                </p>
              </div>
            </div>

            <!-- 2. CUSTOMER & CO-APPLICANTS -->
            <div v-else-if="activeTab === 'customer'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Primary buyer info -->
                <div class="bg-surface border border-default rounded-xl p-4 space-y-2">
                  <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">Primary Purchaser Profile</h4>
                  <div class="space-y-2 font-medium">
                    <div class="flex justify-between"><span class="text-slate-400">FullName:</span><span class="text-slate-800 dark:text-slate-100 font-bold">{{ deal.customer?.name || deal.customer?.firstName || 'Amit Sharma' }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Mobile:</span><span class="text-slate-700 dark:text-slate-200 font-mono">{{ deal.customer?.mobile || '+91 99887 76655' }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Email Address:</span><span class="text-slate-700 dark:text-slate-250">{{ deal.customer?.email || 'amit.sharma@gmail.com' }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">KYC Status:</span><span class="text-emerald-500 font-bold flex items-center gap-1"><PhCheckCircle :size="12" /> Verified</span></div>
                  </div>
                </div>

                <!-- Co-Applicants Splits ratios -->
                <div class="bg-surface border border-default rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">Purchaser Splits Split</h4>
                    <div class="space-y-2 pt-2">
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="text-slate-500 font-semibold">Primary Share:</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">50%</span>
                      </div>
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="text-slate-500 font-semibold">Co-Applicant Share (Rohan Mehta):</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">30%</span>
                      </div>
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="text-slate-500 font-semibold">Joint Share (Sunita Mehta):</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">20%</span>
                      </div>
                    </div>
                  </div>
                  <div class="border-t border-dashed border-default pt-2 flex justify-between items-center text-[10px] font-bold text-emerald-500">
                    <span>Total Ownership Split:</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. PROPERTY DETAILS -->
            <div v-else-if="activeTab === 'property'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Linked Unit -->
                <div class="bg-surface border border-default rounded-xl p-4 space-y-2">
                  <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">Linked Unit Spec</h4>
                  <div class="space-y-2 font-medium">
                    <div class="flex justify-between"><span class="text-slate-400">Unit Number:</span><span class="font-bold text-slate-800 dark:text-slate-100">{{ deal.unit?.unitNumber || deal.unitCode || 'Unit 802' }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Tower Block:</span><span class="font-bold text-slate-700 dark:text-slate-200">Tower A (Prestige)</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Config:</span><span class="text-slate-700 dark:text-slate-250">3 BHK (Premium Facing East)</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">SBA Area:</span><span class="text-slate-700 dark:text-slate-250">1,450 sqft</span></div>
                  </div>
                </div>

                <!-- Project Specs -->
                <div class="bg-surface border border-default rounded-xl p-4 space-y-2">
                  <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">Project Developer Specs</h4>
                  <div class="space-y-2 font-medium">
                    <div class="flex justify-between"><span class="text-slate-400">Developer Company:</span><span class="font-bold text-slate-800 dark:text-slate-100">{{ deal.project?.name || deal.projectTitle || 'Skyway Builders Group' }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Project Locality:</span><span class="text-slate-700 dark:text-slate-200">Whitefield Extension, Bangalore</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">RERA Registration:</span><span class="text-slate-500 font-mono text-[9px]">PRM/KA/RERA/1251/310/PR/180524/001802</span></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. PAYMENTS TRACKER -->
            <div v-else-if="activeTab === 'payments'">
              <PaymentTracker :dealId="dealId" :payments="deal.payments || []" />
            </div>

            <!-- 5. DOCUMENTS CHECKLIST -->
            <div v-else-if="activeTab === 'documents'" class="space-y-4">
              <div class="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 p-3 rounded-lg leading-relaxed flex items-start gap-2">
                <PhMegaphone :size="14" class="text-indigo-500 shrink-0 mt-0.5" />
                <span><strong>Slab Validation Trigger</strong>: Transitioning to <em>Commission Eligible</em> status requires both "Signed Sale Agreement" and "Registration Certificate" files to be uploaded and verified.</span>
              </div>

              <div class="bg-surface border border-default rounded-xl overflow-hidden">
                <table class="w-full text-xs text-left">
                  <thead>
                    <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50 dark:bg-slate-900/50">
                      <th class="py-2.5 px-3">Document Code</th>
                      <th class="py-2.5 px-3">Milestone Stage</th>
                      <th class="py-2.5 px-3 text-center">Status</th>
                      <th class="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-default text-slate-655 font-medium">
                    <tr v-for="doc in docChecklist" :key="doc.type">
                      <td class="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{{ doc.name }}</td>
                      <td class="py-3 px-3 capitalize text-slate-450">{{ doc.stage.replace('_', ' ') }}</td>
                      <td class="py-3 px-3 text-center">
                        <span 
                          class="px-2 py-0.5 rounded text-[8px] font-bold uppercase inline-flex items-center gap-1"
                          :class="doc.status === 'verified' ? 'bg-emerald-50 text-emerald-700' : doc.status === 'uploaded' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-500'"
                        >
                          <span class="w-1 h-1 rounded-full bg-current"></span>
                          <span>{{ doc.status }}</span>
                        </span>
                      </td>
                      <td class="py-3 px-3 text-right space-x-1.5 shrink-0">
                        <button 
                          v-if="doc.status === 'missing'"
                          @click="simulateUpload(doc.type)"
                          class="text-primary hover:underline font-bold text-[10px] inline-flex items-center gap-1"
                        >
                          <PhUpload :size="10" />
                          <span>Upload Scanned Copy</span>
                        </button>
                        <button 
                          v-if="doc.status === 'uploaded'"
                          @click="simulateVerify(doc.type)"
                          class="text-emerald-600 hover:underline font-bold text-[10px] inline-flex items-center gap-1"
                        >
                          <PhCheck :size="10" />
                          <span>Manager Verify</span>
                        </button>
                        <span v-if="doc.status === 'verified'" class="text-slate-400 italic text-[10px]">Verified</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 6. LOAN MORTGAGE -->
            <div v-else-if="activeTab === 'loan'" class="space-y-4">
              <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-default">
                Home Mortgage Loan Progress
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3.5">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mortgage Provider Bank *</label>
                    <input 
                      v-model="loanData.bankName" 
                      type="text" 
                      placeholder="e.g. HDFC Bank, SBI" 
                      class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sanctioned Loan Amount (INR) *</label>
                    <input 
                      v-model.number="loanData.loanAmount" 
                      type="number" 
                      class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div class="space-y-3.5">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Application File Status *</label>
                    <select v-model="loanData.status" class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary font-medium">
                      <option value="pending">Not Applied / Draft</option>
                      <option value="in_process">Under Bank Verification</option>
                      <option value="sanctioned">Sanctioned Letter Issued</option>
                      <option value="disbursed">First Installment Disbursed</option>
                      <option value="rejected">Mortgage File Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tripartite Agreement Signed *</label>
                    <select v-model="loanData.tripartiteSigned" class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary font-medium">
                      <option :value="false">No (Pending Draft Layout)</option>
                      <option :value="true">Yes (Fully Executed & Uploaded)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-dashed border-default flex justify-end">
                <button 
                  @click="saveLoanMortgage"
                  class="btn-md btn-primary"
                >
                  <PhFloppyDisk :size="14" />
                  <span>Save Mortgage Status</span>
                </button>
              </div>
            </div>

            <!-- 7. TASKS -->
            <div v-else-if="activeTab === 'tasks'" class="space-y-4">
              <!-- Add Task Form inline -->
              <div class="bg-slate-55/30 border border-default p-3 rounded-lg flex items-center gap-3">
                <input 
                  v-model="newTaskTitle" 
                  type="text" 
                  placeholder="Create new follow-up checklist item..." 
                  class="flex-1 bg-surface border border-default rounded px-2.5 py-1.5 outline-none"
                />
                <button 
                  @click="addTask"
                  class="btn-md btn-primary shrink-0"
                >
                  + Add Item
                </button>
              </div>

              <!-- List -->
              <div class="space-y-2">
                <div 
                  v-for="task in tasksList" 
                  :key="task._id || task.id" 
                  class="p-3 border border-default rounded-xl bg-slate-50/40 text-xs flex items-center justify-between font-medium"
                >
                  <div class="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      :checked="task.status === 'completed'" 
                      @change="toggleTaskComplete(task)"
                      class="rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <span :class="task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'">
                      {{ task.title }}
                    </span>
                  </div>
                  <span 
                    class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                    :class="task.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                  >
                    {{ task.status }}
                  </span>
                </div>

                <div v-if="tasksList.length === 0" class="text-center py-8 text-slate-400 italic">
                  No active follow-up tasks registered.
                </div>
              </div>
            </div>

            <!-- 8. ACTIVITIES / SPOC MEETING -->
            <div v-else-if="activeTab === 'activities'" class="space-y-4">
              <!-- Log outreach -->
              <div class="bg-slate-55/30 border border-default p-3 rounded-lg space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <select v-model="newActivity.type" class="bg-surface border border-default rounded px-2.5 py-1.5 outline-none font-medium">
                    <option value="call">Call logged with SPOC</option>
                    <option value="meeting">Sync Meeting conducted</option>
                    <option value="email">Email correspondence sent</option>
                  </select>
                  <input 
                    v-model="newActivity.outcome" 
                    type="text" 
                    placeholder="Outcome results..." 
                    class="bg-surface border border-default rounded px-2.5 py-1.5 outline-none"
                  />
                </div>
                <textarea 
                  v-model="newActivity.description" 
                  rows="2" 
                  placeholder="Milestone log summary details..." 
                  class="w-full bg-surface border border-default rounded px-2.5 py-1.5 outline-none resize-none"
                ></textarea>
                <div class="flex justify-end">
                  <button @click="logActivity" class="btn-md btn-primary">Log Activity</button>
                </div>
              </div>

              <!-- List -->
              <div class="space-y-2.5">
                <div v-for="act in localActivities" :key="act.id" class="p-3 border border-default rounded-xl bg-slate-50/40 text-xs flex items-center justify-between font-medium">
                  <div>
                    <span class="font-bold capitalize text-slate-800 dark:text-slate-200">{{ act.type.replace('_', ' ') }}</span>
                    <p class="text-[10px] text-slate-400 mt-0.5">{{ act.description }}</p>
                  </div>
                  <span class="text-[9px] text-slate-400 font-mono">{{ formatDate(act.createdAt) }}</span>
                </div>
                
                <div v-if="localActivities.length === 0" class="text-center py-8 text-slate-400 italic">No activity logs saved.</div>
              </div>
            </div>

            <!-- 9. COMMISSION SPLITS -->
            <div v-else-if="activeTab === 'splits'" class="space-y-5">
              <!-- Splits Table -->
              <div class="bg-surface border border-default rounded-xl p-4 space-y-3">
                <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">Agent commission splits breakdown</h4>
                <div class="space-y-2.5 text-[10px] font-semibold">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-500">Allocated Sourcing Agent Share (60%):</span>
                    <span class="font-bold text-slate-800 dark:text-slate-200">{{ formatCurrency(deal.commissionAmount * 0.6) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-500">TrackDeal HQ Platform Service Share (30%):</span>
                    <span class="font-bold text-slate-800 dark:text-slate-200">{{ formatCurrency(deal.commissionAmount * 0.3) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-500">External Sourcing Broker Share (10%):</span>
                    <span class="font-bold text-slate-800 dark:text-slate-200">{{ formatCurrency(deal.commissionAmount * 0.1) }}</span>
                  </div>
                  <div class="border-t border-dashed border-default pt-2 flex justify-between items-center text-xs font-bold text-emerald-500">
                    <span>Total Expected Commission Payout:</span>
                    <span>{{ formatCurrency(deal.commissionAmount) }} (100% split targets)</span>
                  </div>
                </div>
              </div>

              <!-- Billing schedule Invoices -->
              <div class="bg-surface border border-default rounded-xl p-4 space-y-3">
                <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">Developer Billing invoice schedules</h4>
                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left">
                    <thead>
                      <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                        <th class="py-2">Milestone / Invoice Code</th>
                        <th class="py-2">Schedule trigger</th>
                        <th class="py-2 text-right">Value Amount</th>
                        <th class="py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-default text-slate-655 font-medium">
                      <tr>
                        <td class="py-2.5 font-bold text-slate-800 dark:text-slate-200">#INV-9842 (Agreement Clear)</td>
                        <td class="py-2.5 text-slate-450">Agreement executed & verified</td>
                        <td class="py-2.5 text-right font-semibold">{{ formatCurrency(deal.commissionAmount * 0.5) }}</td>
                        <td class="py-2.5 text-center">
                          <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-50 text-emerald-700">● Cleared Paid</span>
                        </td>
                      </tr>
                      <tr>
                        <td class="py-2.5 font-bold text-slate-800 dark:text-slate-200">#INV-10982 (Registration Slot)</td>
                        <td class="py-2.5 text-slate-450">Govt deed registration completed</td>
                        <td class="py-2.5 text-right font-semibold">{{ formatCurrency(deal.commissionAmount * 0.5) }}</td>
                        <td class="py-2.5 text-center">
                          <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-50 text-blue-750">● Draft Pending</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 10. AUDIT TRAIL -->
            <div v-else-if="activeTab === 'timeline'" class="space-y-4">
              <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-default">
                Milestone Audit Log
              </h4>
              
              <div class="relative pl-6 space-y-5 border-l border-default">
                <div 
                  v-for="log in auditTimeline" 
                  :key="log.time"
                  class="relative"
                >
                  <!-- timeline dot -->
                  <span class="absolute -left-[30px] top-0.5 w-2 h-2 rounded-full bg-primary border-4 border-surface outline outline-default"></span>
                  <div class="font-medium">
                    <span class="text-slate-450 text-[9px] font-mono block">{{ formatDate(log.time) }}</span>
                    <p class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{{ log.title }}</p>
                    <p class="text-[10px] text-slate-500 mt-0.5" v-if="log.notes">{{ log.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column Action Sidebar -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Deal Health Summary -->
        <DealHealthCard 
          :score="deal.healthScore || 92" 
          :riskPercent="deal.status === 'draft' ? 35 : 15" 
        />

        <!-- Deal Risks Checklist alerts -->
        <DealRiskPanel />

        <!-- Developer Coordination Center SPOC -->
        <BuilderCoordinationPanel />
      </div>
    </div>

    <!-- Booking Confirmation Stepper Wizard -->
    <BookingWizard
      v-if="deal"
      :isOpen="isWizardOpen"
      :deal="deal"
      @close="isWizardOpen = false"
      @success="handleWizardSuccess"
    />

    <!-- Cancellation Drawer -->
    <DealCancellationDrawer
      v-if="deal"
      :isOpen="isCancelOpen"
      :deal="deal"
      @close="isCancelOpen = false"
      @success="handleCancelSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useQuery } from '@tanstack/vue-query';
import apiClient from '@/api/client';
import DealHealthCard from '../components/DealHealthCard.vue';
import DealRiskPanel from '../components/DealRiskPanel.vue';
import BuilderCoordinationPanel from '../components/BuilderCoordinationPanel.vue';
import PaymentTracker from '../components/PaymentTracker.vue';
import BookingWizard from '../components/BookingWizard.vue';
import DealCancellationDrawer from '../components/DealCancellationDrawer.vue';
import { 
  useDealQuery, 
  useTransitionStageMutation,
  useUploadDocumentMutation,
  useVerifyDocumentMutation
} from '../queries';

// Phosphor icons
import { 
  PhWarning, PhTable, PhXCircle, PhCheck, 
  PhCheckCircle, PhMegaphone, PhUpload, PhFloppyDisk 
} from '@phosphor-icons/vue';

const route = useRoute();
const router = useRouter();
const store = useStore();

const dealId = computed(() => route.params.id);

// Load main deal file details
const { data: dealData, isLoading, refetch } = useDealQuery(dealId);
const deal = computed(() => {
  const d = dealData.value?.data || dealData.value;
  if (!d) return null;
  
  // Safe fallbacks to keep UI robust
  return {
    ...d,
    dealNumber: d.dealNumber || `#DL-${dealId.value.substring(18).toUpperCase()}`,
    dealValue: d.dealValue || d.askingPrice || 7200000,
    commissionPercentage: d.commissionPercentage || 2.5,
    commissionAmount: d.commissionAmount || (d.dealValue || 7200000) * 0.025,
    healthScore: d.healthScore || 92,
    status: d.status || 'token_received',
    payments: d.payments || []
  };
});

const dealNumber = computed(() => deal.value?.dealNumber || '');

const activeTab = ref('overview');

const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'customer', name: 'Buyer & Co-App', mobileName: 'Buyer' },
  { id: 'property', name: 'Property Spec', mobileName: 'Property' },
  { id: 'payments', name: 'Payments Ledger', mobileName: 'Payments' },
  { id: 'documents', name: 'KYC & Contracts', mobileName: 'KYC' },
  { id: 'loan', name: 'Mortgage Loan', mobileName: 'Mortgage' },
  { id: 'tasks', name: 'Checklist Items', mobileName: 'Tasks' },
  { id: 'activities', name: 'SPOC Outreach', mobileName: 'Outreach' },
  { id: 'splits', name: 'Commissions', mobileName: 'Splits' },
  { id: 'timeline', name: 'Audit Timeline', mobileName: 'Audit' }
];

const timelineStages = [
  { num: 1, key: 'draft', label: 'Reserved' },
  { num: 2, key: 'token_received', label: 'Token Received' },
  { num: 3, key: 'booking_confirmed', label: 'Booking' },
  { num: 4, key: 'agreement_executed', label: 'Agreement' },
  { num: 5, key: 'registration_completed', label: 'Registration' },
  { num: 6, key: 'commission_eligible', label: 'Eligible' },
  { num: 7, key: 'deal_closed', label: 'Closed Won' }
];

// Interactive Modal togglers
const isWizardOpen = ref(false);
const isCancelOpen = ref(false);

// Local lists
const localActivities = ref([
  { id: 'a1', type: 'call', description: 'Log follow-up call with primary customer Amit Sharma.', createdAt: '2026-06-02T10:00:00Z' },
  { id: 'a2', type: 'meeting', description: 'Met with builder SPOC Amit Gupta to review registration schedule.', createdAt: '2026-06-03T11:00:00Z' }
]);

const newActivity = ref({
  type: 'call',
  description: '',
  outcome: ''
});

// Document verification checklist state
const docChecklist = ref([
  { type: 'primary_kyc_pan', name: 'Primary Buyer PAN Card', stage: 'draft', status: 'verified' },
  { type: 'primary_kyc_aadhaar', name: 'Primary Aadhaar Card', stage: 'draft', status: 'verified' },
  { type: 'token_receipt', name: 'Earnest Token Receipt Copy', stage: 'token_received', status: 'verified' },
  { type: 'allotment_letter', name: 'Builder Allotment Letter', stage: 'booking_confirmed', status: 'uploaded' },
  { type: 'sale_agreement', name: 'Signed Sale Agreement Contract', stage: 'agreement_executed', status: 'missing' },
  { type: 'registration_deed', name: 'Government Registration Certificate', stage: 'registration_completed', status: 'missing' }
]);

// Mortgage details state
const loanData = ref({
  bankName: 'HDFC Bank',
  loanAmount: 5000000,
  status: 'in_process',
  tripartiteSigned: false
});

// Audit Timeline history
const auditTimeline = ref([
  { time: '2026-06-01T09:00:00Z', title: 'Deal File Draft created.', notes: 'Deal created manually.' },
  { time: '2026-06-02T10:15:00Z', title: 'Transitioned to: Token Received', notes: 'Checked-in token money deposit. Reference UPI-TX-9842.' },
  { time: '2026-06-04T08:30:00Z', title: 'Allotment Letter Uploaded', notes: 'Allotment copy uploaded by sourcing agent.' }
]);

// Tasks List details linked to dealId
const { data: tasksData, refetch: refetchTasks } = useQuery({
  queryKey: ['deals', dealId, 'tasks'],
  queryFn: () => apiClient.get('/tasks', { params: { dealId: dealId.value } }).then(res => res.data),
  enabled: !!dealId
});

const tasksList = computed(() => {
  return tasksData.value?.data || [];
});

const newTaskTitle = ref('');

// Load initial tasks
onMounted(() => {
  refetchTasks();
});

// Stepper / stage verification checks
const isStageCompleted = (stageKey) => {
  const order = ['draft', 'token_received', 'booking_initiated', 'booking_confirmed', 'agreement_executed', 'registration_completed', 'commission_eligible', 'deal_closed', 'commission_received'];
  const currentIndex = order.indexOf(deal.value?.status);
  const targetIndex = order.indexOf(stageKey);
  
  if (deal.value?.status === 'commission_received' && stageKey === 'deal_closed') return true;
  if (deal.value?.status === 'booking_initiated' && stageKey === 'booking_confirmed') return false;

  return targetIndex < currentIndex;
};

const getStageCheckCircleClass = (stageKey) => {
  if (deal.value?.status === stageKey) {
    return 'border-primary text-primary font-bold bg-white dark:bg-slate-900 shadow-md';
  }
  if (isStageCompleted(stageKey)) {
    return 'border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
  }
  return 'border-slate-300 text-slate-400 bg-slate-50 dark:bg-slate-800';
};

// Stage Transitions
const { mutateAsync: transitionStage } = useTransitionStageMutation();

const handleStageTransition = async (evt) => {
  const newStage = evt.target.value;
  
  // Strict check rules
  if (newStage === 'booking_confirmed') {
    isWizardOpen.value = true;
    return;
  }
  if (newStage === 'commission_eligible') {
    const allVerified = docChecklist.value
      .filter(d => d.stage === 'draft' || d.stage === 'token_received' || d.stage === 'booking_confirmed' || d.stage === 'agreement_executed' || d.stage === 'registration_completed')
      .every(d => d.status === 'verified');
    if (!allVerified) {
      store.dispatch('notifications/triggerToast', {
        message: 'Closing Blocked: All milestones documentation (Agreement, Registration) must be uploaded & verified.',
        type: 'error'
      });
      return;
    }
  }
  if (newStage === 'deal_closed') {
    // outstanding check
    const outstanding = deal.value?.outstandingAmount || 0;
    if (outstanding > 0) {
      store.dispatch('notifications/triggerToast', {
        message: 'Closing Blocked: Total outstanding invoices must be paid before deal closure.',
        type: 'error'
      });
      return;
    }
  }

  try {
    await transitionStage({
      id: dealId.value,
      stage: newStage,
      notes: `Manual transition to stage ${newStage}`
    });
    
    auditTimeline.value.unshift({
      time: new Date().toISOString(),
      title: `Transitioned to: ${formatStageName(newStage)}`,
      notes: `Manually updated stage.`
    });

    store.dispatch('notifications/triggerToast', {
      message: `Deal transitioned to ${formatStageName(newStage)} successfully.`,
      type: 'success'
    });
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: err.response?.data?.message || 'Failed to update deal stage.',
      type: 'error'
    });
  }
};

// Document checklists mutations
const { mutateAsync: uploadDoc } = useUploadDocumentMutation();
const { mutateAsync: verifyDoc } = useVerifyDocumentMutation();

const simulateUpload = async (docType) => {
  try {
    await uploadDoc({
      id: dealId.value,
      docType,
      fileId: 'f-simulated-' + Date.now()
    });

    const docItem = docChecklist.value.find(d => d.type === docType);
    if (docItem) docItem.status = 'uploaded';

    store.dispatch('notifications/triggerToast', {
      message: 'Scanned document copy uploaded.',
      type: 'success'
    });
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to upload document.',
      type: 'error'
    });
  }
};

const simulateVerify = async (docType) => {
  try {
    await verifyDoc({
      id: dealId.value,
      docType
    });

    const docItem = docChecklist.value.find(d => d.type === docType);
    if (docItem) docItem.status = 'verified';

    store.dispatch('notifications/triggerToast', {
      message: 'Document checklist verified by manager.',
      type: 'success'
    });
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to verify document.',
      type: 'error'
    });
  }
};

// Log Mortgage Info
const saveLoanMortgage = () => {
  if (!loanData.value.bankName || !loanData.value.loanAmount) {
    store.dispatch('notifications/triggerToast', {
      message: 'Please complete all required mortgage fields.',
      type: 'error'
    });
    return;
  }
  
  auditTimeline.value.unshift({
    time: new Date().toISOString(),
    title: 'Mortgage Loan Details Modified',
    notes: `Bank: ${loanData.value.bankName}, Amount: ${formatCurrency(loanData.value.loanAmount)}, Status: ${loanData.value.status}`
  });

  store.dispatch('notifications/triggerToast', {
    message: 'Home mortgage details successfully updated.',
    type: 'success'
  });
};

// Log follow-up activities
const logActivity = () => {
  if (!newActivity.value.description.trim()) return;
  
  localActivities.value.unshift({
    id: 'a-' + Date.now(),
    type: newActivity.value.type,
    description: newActivity.value.description,
    createdAt: new Date().toISOString()
  });

  newActivity.value.description = '';
  newActivity.value.outcome = '';

  store.dispatch('notifications/triggerToast', {
    message: 'Activity log saved successfully.',
    type: 'success'
  });
};

// Add follow-up task
const addTask = async () => {
  if (!newTaskTitle.value.trim()) return;

  try {
    await apiClient.post('/tasks', {
      title: newTaskTitle.value,
      dealId: dealId.value,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    });

    newTaskTitle.value = '';
    store.dispatch('notifications/triggerToast', {
      message: 'Checklist task item created.',
      type: 'success'
    });
    refetchTasks();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to create task item.',
      type: 'error'
    });
  }
};

const toggleTaskComplete = async (task) => {
  const isCompleted = task.status === 'completed';
  const newStatus = isCompleted ? 'pending' : 'completed';

  try {
    if (newStatus === 'completed') {
      await apiClient.post(`/tasks/${task._id || task.id}/complete`, { outcome: 'deal details step check' });
    } else {
      await apiClient.patch(`/tasks/${task._id || task.id}`, { status: 'pending' });
    }

    store.dispatch('notifications/triggerToast', {
      message: `Task marked ${newStatus}.`,
      type: 'success'
    });
    refetchTasks();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to update task state.',
      type: 'error'
    });
  }
};

// Successful Wizard finish callback
const handleWizardSuccess = () => {
  // Sync page state
  refetch();
  
  // mark allotment verified
  const allotmentItem = docChecklist.value.find(d => d.type === 'allotment_letter');
  if (allotmentItem) allotmentItem.status = 'verified';

  auditTimeline.value.unshift({
    time: new Date().toISOString(),
    title: 'Booking Validation Wizard completed',
    notes: 'Buyer KYC ownership split verified. Earnest token cleared.'
  });
};

// Cancellation success callback
const handleCancelSuccess = () => {
  refetch();
  router.push('/app/deals');
};

// Formatting utilities
const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const formatDate = (val) => {
  if (!val) return '';
  return new Date(val).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatStageName = (stage) => {
  if (!stage) return '';
  const mapping = {
    'draft': 'Reserved / Draft',
    'token_received': 'Token Received',
    'booking_initiated': 'Booking Initiating',
    'booking_confirmed': 'Booking Confirmed',
    'agreement_executed': 'Agreement Executed',
    'registration_completed': 'Registration Completed',
    'commission_eligible': 'Commission Eligible',
    'deal_closed': 'Closed Won',
    'commission_received': 'Closed Won',
    'cancelled': 'Cancelled'
  };
  return mapping[stage] || stage.replace(/_/g, ' ');
};

const getStageBadgeClass = (stage) => {
  switch (stage) {
    case 'draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    case 'token_received': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20';
    case 'booking_initiated':
    case 'booking_confirmed': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20';
    case 'agreement_executed': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/20';
    case 'registration_completed': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20';
    case 'commission_eligible': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20';
    case 'deal_closed':
    case 'commission_received': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40';
    case 'cancelled': return 'bg-red-50 text-red-500 dark:bg-red-950/20';
    default: return 'bg-slate-100 text-slate-600';
  }
};
</script>
