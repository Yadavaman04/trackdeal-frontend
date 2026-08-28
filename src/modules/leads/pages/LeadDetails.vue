<template>
  <div v-if="isLoading" class="animate-pulse space-y-6">
    <div class="h-20 bg-slate-200 dark:bg-slate-850 rounded-xl w-full"></div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 h-96 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
      <div class="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
    </div>
  </div>

  <div v-else-if="!lead" class="text-center py-12 text-slate-500">
    Lead profile not found.
  </div>

  <div v-else class="space-y-6">
    <!-- Breadcrumb -->
    <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center space-x-1.5 uppercase tracking-wider shrink-0">
      <router-link to="/app/leads" class="hover:text-primary transition-colors">Leads</router-link>
      <span>/</span>
      <span class="text-slate-700 dark:text-slate-350">{{ lead.firstName }} {{ lead.lastName || '' }}</span>
    </div>

    <!-- Header Block / Lead 360 Workspace -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
      <div class="flex items-center space-x-4">
        <!-- Lead Initials Avatar -->
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-base uppercase shrink-0">
          {{ (lead.firstName?.charAt(0) || '') + (lead.lastName?.charAt(0) || '') }}
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">
              {{ lead.firstName }} {{ lead.lastName || '' }}
            </h2>
            <span 
              class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
              :class="lead.qualification?.leadTemperature === 'hot' ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'"
            >
              <span>{{ lead.qualification?.leadTemperature === 'hot' ? '🔥 HOT' : '⚡ WARM' }}</span>
            </span>
            <LeadStageBadge :stage="lead.status" />
          </div>

          <div class="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
            <span class="font-medium text-slate-700 dark:text-slate-200">
              {{ lead.buyerRequirement?.propertyType?.join(', ') || lead.requirements?.propertyType?.join(', ') || '3 BHK Apartment' }}
            </span>
            <span>·</span>
            <span>{{ lead.buyerRequirement?.preferredLocation || lead.buyerRequirement?.locality || lead.requirements?.locations?.join(', ') || 'Pune / Mumbai' }}</span>
            <span>·</span>
            <span class="font-semibold text-indigo-600 dark:text-indigo-400">
              {{ lead.budgetMin || lead.budgetMax ? '₹' + (lead.budgetMin ? Number(lead.budgetMin).toLocaleString('en-IN') : '') + ' – ₹' + (lead.budgetMax ? Number(lead.budgetMax).toLocaleString('en-IN') : '') : 'Budget Flexible' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Bar -->
      <div class="flex flex-wrap items-center gap-2 self-end md:self-auto shrink-0">
        <a 
          v-if="!lead.isTransferred && lead.mobile"
          :href="`tel:${lead.mobile}`"
          class="px-3 py-1.8 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs transition-colors flex items-center gap-1.5"
        >
          <span>📞</span>
          <span>Call</span>
        </a>

        <a 
          v-if="!lead.isTransferred && lead.mobile"
          :href="`https://wa.me/${lead.mobile.replace(/[^0-9]/g, '')}`"
          target="_blank"
          class="px-3 py-1.8 rounded-xl font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs transition-colors flex items-center gap-1.5"
        >
          <span>💬</span>
          <span>WhatsApp</span>
        </a>

        <button 
          @click="isActivityCenterOpen = true"
          class="px-3.5 py-1.8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow-xs transition-all flex items-center gap-1.5"
        >
          <span>⚡</span>
          <span>+ Add Activity</span>
        </button>

        <button 
          v-if="lead.status !== 'won'"
          @click="isWonOpen = true"
          class="px-3.5 py-1.8 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-xs transition-all flex items-center gap-1"
        >
          <span>🤝</span>
          <span>Create Deal</span>
        </button>
      </div>
    </div>

    <!-- Lead Journey Progress Stepper (Section 25) -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
      <div class="flex items-center justify-between text-xs overflow-x-auto gap-2 pb-1">
        <div 
          v-for="(step, idx) in ['New', 'Contacted', 'Qualified', 'Property Shared', 'Site Visit', 'Negotiation', 'Booking', 'Closed']"
          :key="step"
          class="flex items-center gap-2 shrink-0 font-medium"
        >
          <div class="flex items-center gap-1.5">
            <span 
              class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              :class="idx <= getLeadStepIndex(lead.status) ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
            >
              {{ idx <= getLeadStepIndex(lead.status) ? '✓' : idx + 1 }}
            </span>
            <span :class="idx <= getLeadStepIndex(lead.status) ? 'text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-400'">
              {{ step }}
            </span>
          </div>
          <span v-if="idx < 7" class="text-slate-300 dark:text-slate-700 text-xs">➔</span>
        </div>
      </div>
    </div>

    <!-- Transferred Lead Banner -->
    <div 
      v-if="lead.isTransferred"
      class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 flex items-center justify-between shadow-xs"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
          📥
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-heading font-bold text-amber-900 dark:text-amber-200 text-sm">Transferred Lead</h4>
            <span class="px-2 py-0.2 text-[9px] font-bold rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 uppercase">External Partner</span>
          </div>
          <p class="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            Received from <strong class="font-semibold text-amber-950 dark:text-amber-150">{{ lead.receivedFrom?.organizationName || 'Partner Broker' }}</strong>
            <span v-if="lead.receivedFrom?.transferredByName"> (Transferred by {{ lead.receivedFrom.transferredByName }})</span>
            <span v-if="lead.receivedFrom?.remarks" class="italic ml-2 text-slate-500">— "{{ lead.receivedFrom.remarks }}"</span>
          </p>
        </div>
      </div>
      <div class="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold bg-amber-100/60 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg border border-amber-200/50">
        <span>🔒</span>
        <span>Customer Contact Info Protected</span>
      </div>
    </div>

    <!-- Main Workspace Grid (Left 8 cols, Right 4 cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Work & Details Area -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Profiles Cards & Requirements (Double columns) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Lead details card -->
          <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
            <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2 flex items-center justify-between">
              <span>{{ lead.isTransferred ? 'Transferred Origin Details' : 'Contact Profile Info' }}</span>
              <span v-if="lead.isTransferred" class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">📥 Transferred</span>
            </h4>
            
            <div v-if="lead.isTransferred" class="space-y-2 text-[11px]">
              <div class="flex justify-between"><span class="text-slate-400">Received From:</span><span class="font-bold text-slate-750 dark:text-slate-200">{{ lead.receivedFrom?.organizationName || 'Partner Broker' }}</span></div>
              <div v-if="lead.receivedFrom?.transferredByName" class="flex justify-between"><span class="text-slate-400">Transferred By:</span><span class="font-medium text-slate-750 dark:text-slate-250">{{ lead.receivedFrom.transferredByName }}</span></div>
              <div v-if="lead.receivedFrom?.transferredAt" class="flex justify-between"><span class="text-slate-400">Received Date:</span><span class="font-medium text-slate-750 dark:text-slate-250">{{ new Date(lead.receivedFrom.transferredAt).toLocaleDateString() }}</span></div>
              <div v-if="lead.receivedFrom?.remarks" class="flex justify-between"><span class="text-slate-400">Transfer Remarks:</span><span class="font-medium text-slate-750 dark:text-slate-250 italic">{{ lead.receivedFrom.remarks }}</span></div>
              <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-default text-[10px] text-slate-500 italic mt-2">
                🔒 Direct customer contact information is protected and managed by the original broker.
              </div>
            </div>

            <div v-else class="space-y-2 text-[11px]">
              <div class="flex justify-between"><span class="text-slate-400">Mobile:</span><span class="font-bold text-slate-750 dark:text-slate-200">{{ lead.mobile }}</span></div>
              <div v-if="lead.alternativeMobile" class="flex justify-between"><span class="text-slate-400">Alt Mobile:</span><span class="font-medium text-slate-750 dark:text-slate-250">{{ lead.alternativeMobile }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Email:</span><span class="font-medium text-slate-750 dark:text-slate-250">{{ lead.email || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Source:</span><span class="font-semibold text-slate-750 dark:text-slate-250 capitalize">{{ lead.source }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Owner Agent:</span><span class="font-semibold text-slate-750 dark:text-slate-250">{{ lead.assignedTo?.firstName || 'Me' }} {{ lead.assignedTo?.lastName || '' }}</span></div>
            </div>
          </div>

          <!-- Requirements details card -->
          <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
            <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-2">
              🏡 Buyer Requirement & Financial Profile
            </h4>
            <div class="space-y-2 text-[11px]">
              <div class="flex justify-between"><span class="text-slate-400">Property Types:</span><span class="font-bold text-slate-750 dark:text-slate-200 capitalize">{{ lead.buyerRequirement?.propertyType?.join(', ') || lead.requirements?.propertyType?.join(', ') || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">BHK / Config:</span><span class="font-bold text-slate-750 dark:text-slate-200">{{ lead.buyerRequirement?.bhk?.join(', ') || lead.requirements?.bhk?.join(', ') || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Preferred Location:</span><span class="font-semibold text-slate-750 dark:text-slate-200 capitalize">{{ lead.buyerRequirement?.preferredLocation || lead.buyerRequirement?.locality || lead.requirements?.locations?.join(', ') || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Possession & Purpose:</span><span class="font-medium text-slate-750 dark:text-slate-200 capitalize">{{ (lead.buyerRequirement?.possessionPreference || '—').replace('_', ' ') }} • {{ (lead.buyerRequirement?.purpose || '—').replace('_', ' ') }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Loan Required:</span><span class="font-bold uppercase" :class="lead.financialRequirement?.loanRequired === 'yes' ? 'text-blue-600' : 'text-slate-600'">{{ lead.financialRequirement?.loanRequired || 'Not Decided' }}</span></div>
              <div v-if="lead.financialRequirement?.loanRequired === 'yes'" class="flex justify-between items-center bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded-lg border border-blue-100 dark:border-blue-900/40">
                <div>
                  <span class="text-slate-400 block text-[10px]">Bank & Status:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ lead.financialRequirement?.preferredBank || 'Bank' }} ({{ (lead.financialRequirement?.loanStatus || 'Active').replace('_', ' ') }})</span>
                </div>
                <router-link to="/app/loans" class="px-2.5 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold shadow-xs hover:bg-blue-700 transition">
                  View Loan Case →
                </router-link>
              </div>
              <div v-if="lead.qualification" class="flex justify-between border-t border-default pt-1.5"><span class="text-slate-400">Lead Temperature:</span><span class="font-bold capitalize" :class="lead.qualification.leadTemperature === 'hot' ? 'text-red-500' : 'text-amber-500'">{{ lead.qualification.leadTemperature || 'Warm' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Transferred Channel Partners & Brokers Card -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-default pb-2">
            <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>🏢 Transferred Channel Partners & Brokers</span>
              <span v-if="transferredCPsCount > 0" class="px-2 py-0.2 rounded-full text-[10px] bg-accent-100 text-accent-700 font-bold">
                {{ transferredCPsCount }} Partner(s)
              </span>
            </h4>
            <button @click="isTransferOpen = true" class="text-caption font-semibold text-accent-600 hover:underline">
              + Transfer Lead
            </button>
          </div>

          <div v-if="transferredCPsList.length === 0" class="text-caption text-slate-400 text-center py-3">
            Not transferred to any Channel Partner or Broker yet. Click "+ Transfer Lead" above.
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="cp in transferredCPsList"
              :key="cp._id || cp"
              class="p-3 rounded-lg border border-default bg-slate-50/60 dark:bg-slate-800/40 space-y-1"
            >
              <div class="flex justify-between items-start">
                <router-link
                  :to="`/app/agents/${cp._id || cp}`"
                  class="font-bold text-body-sm text-slate-900 dark:text-slate-100 hover:underline truncate block"
                >
                  {{ cp.name || 'Channel Partner' }}
                </router-link>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Active
                </span>
              </div>
              <p class="text-caption text-slate-600 dark:text-slate-300 font-medium">
                🏢 {{ cp.officeName || 'CP' }}
              </p>
              <p class="text-micro text-slate-400">
                📞 {{ cp.phone || 'N/A' }} • 📍 {{ cp.city || 'CP' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Log outreach panels tabs -->
        <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4" v-if="lead.status !== 'won'">
          <div class="flex space-x-1 border-b border-default pb-2 shrink-0">
            <button 
              v-for="logTab in ['activity', 'note', 'whatsapp']" 
              :key="logTab"
              @click="activeLogTab = logTab"
              class="px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors"
              :class="activeLogTab === logTab ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-700'"
            >
              {{ logTab }} log
            </button>
          </div>

          <!-- Log Activity tab -->
          <div v-if="activeLogTab === 'activity'" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <select v-model="logType" class="bg-surface border border-default rounded-lg px-3 py-1.5 outline-none font-medium">
                <option value="call">Phone Call</option>
                <option value="meeting">Personal Meeting</option>
                <option value="email">Email Outreach</option>
              </select>
              <input v-model="logOutcome" type="text" placeholder="Outcome (e.g. connected, busy...)" class="bg-surface border border-default rounded-lg px-3 py-1.5 outline-none" />
            </div>
            <textarea v-model="logDescription" rows="2" placeholder="Summary notes of call or meeting..." class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none resize-none"></textarea>
            <button @click="submitActivityLog" class="bg-primary hover:bg-opacity-90 text-white font-bold px-4 py-1.5 rounded-lg">Log Interaction</button>
          </div>

          <!-- Log Note tab -->
          <div v-if="activeLogTab === 'note'" class="space-y-3 text-xs">
            <textarea v-model="noteContent" rows="2" placeholder="Write internal team notes here..." class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none resize-none"></textarea>
            <div class="flex items-center justify-between">
              <label class="flex items-center space-x-1.5 cursor-pointer">
                <input type="checkbox" v-model="noteIsPrivate" class="rounded border-default text-primary" />
                <span class="text-[10px] text-slate-500">Lock as Private Note</span>
              </label>
              <button @click="submitNoteLog" class="bg-primary hover:bg-opacity-90 text-white font-bold px-4 py-1.5 rounded-lg">Save Note</button>
            </div>
          </div>

          <!-- WhatsApp Workspace Simulator tab -->
          <div v-if="activeLogTab === 'whatsapp'">
            <WhatsAppWorkspace 
              :leadId="lead._id || lead.id" 
              :leadName="lead.firstName" 
              @logActivity="handleWhatsAppLog"
              @scheduleOutreach="handleWhatsAppSchedule"
            />
          </div>
        </div>

        <!-- Main Details Workspace Tabs (Overview, Activities, Tasks, Site Visits, Deals, Documents, Audit Timeline) -->
        <div class="bg-surface border border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
          <!-- Desktop Tabs Header -->
          <header class="hidden md:flex border-b border-default px-4 bg-slate-50 shrink-0">
            <button 
              v-for="wTab in workspaceTabs" 
              :key="wTab.id"
              @click="activeWorkspaceTab = wTab.id"
              class="px-4 py-3 border-b-2 font-heading text-xs font-bold transition-all relative top-[1px]"
              :class="[
                activeWorkspaceTab === wTab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              ]"
            >
              {{ wTab.name }}
            </button>
          </header>

          <!-- Mobile Tabs Picker Header -->
          <div class="md:hidden p-3 border-b border-default bg-slate-50 shrink-0 flex items-center justify-between">
            <!-- Primary Mobile Tabs -->
            <div class="flex space-x-1">
              <button 
                v-for="wTab in workspaceTabs.slice(0, 3)" 
                :key="wTab.id"
                @click="activeWorkspaceTab = wTab.id"
                class="px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all"
                :class="activeWorkspaceTab === wTab.id ? 'bg-primary text-white' : 'text-slate-500'"
              >
                {{ wTab.name.split(' ')[0] }}
              </button>
            </div>

            <!-- More Tabs selector -->
            <select 
              v-model="activeWorkspaceTab"
              class="bg-surface border border-default rounded px-2.5 py-1 text-[10px] font-semibold text-slate-700"
            >
              <option v-for="wTab in workspaceTabs.slice(3)" :key="wTab.id" :value="wTab.id">
                {{ wTab.name }}
              </option>
            </select>
          </div>

          <!-- Tab Content Area -->
          <div class="p-4 flex-1">
            <!-- 1. OVERVIEW TAB -->
            <div v-if="activeWorkspaceTab === 'overview'" class="space-y-4">
              <FollowUpPanel 
                :tasks="tasksList" 
                @complete="handleTaskComplete"
                @schedule="activeWorkspaceTab = 'tasks'; activeLogTab = 'activity'; isSchedulingOutreach = true"
              />
              <div class="border border-default rounded-xl p-4 bg-slate-50/50">
                <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Requirements Notes</h5>
                <p class="text-xs text-slate-600 leading-relaxed">{{ lead.requirements?.notes || 'No notes specified.' }}</p>
              </div>
            </div>

            <!-- 2. ACTIVITIES TAB -->
            <div v-else-if="activeWorkspaceTab === 'activities'" class="space-y-3">
              <div v-for="act in loggedActivities" :key="act.id || act._id" class="p-3 border border-default rounded-xl bg-slate-50/40 text-xs flex items-center justify-between">
                <div>
                  <span class="font-bold capitalize text-slate-800 dark:text-slate-200">{{ act.type }} outreach</span>
                  <p class="text-[10px] text-slate-400 mt-0.5">{{ act.description }}</p>
                </div>
                <span class="text-[10px] text-slate-400">{{ formatTime(act.createdAt) }}</span>
              </div>
              <div v-if="loggedActivities.length === 0" class="text-center py-8 text-slate-400 text-xs">
                No logged outreach logs.
              </div>
            </div>

            <!-- 3. TASKS TAB -->
            <div v-else-if="activeWorkspaceTab === 'tasks'" class="space-y-3">
              <div v-for="task in tasksList" :key="task._id || task.id" class="p-3 border border-default rounded-xl bg-slate-50/40 text-xs flex items-center justify-between">
                <div>
                  <h5 class="font-bold text-slate-800 dark:text-slate-100">{{ task.title }}</h5>
                  <p class="text-[10px] text-slate-400 mt-0.5">Due: {{ formatTime(task.dueDate) }}</p>
                </div>
                <span 
                  class="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                  :class="task.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                >
                  {{ task.status }}
                </span>
              </div>
              <div v-if="tasksList.length === 0" class="text-center py-8 text-slate-400 text-xs">
                No scheduled follow-up tasks.
              </div>
            </div>

            <!-- 4. SITE VISITS TAB -->
            <div v-else-if="activeWorkspaceTab === 'site_visits'" class="space-y-3">
              <div v-for="visit in siteVisits" :key="visit.id" class="p-3 border border-default rounded-xl bg-slate-50/40 text-xs flex items-center justify-between">
                <div>
                  <h5 class="font-bold text-slate-800 dark:text-slate-100">{{ visit.project }} Visit</h5>
                  <p class="text-[10px] text-slate-400 mt-0.5">Scheduled: {{ visit.date }}</p>
                </div>
                <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-50 text-blue-700">
                  {{ visit.status }}
                </span>
              </div>
              <div v-if="siteVisits.length === 0" class="text-center py-8 text-slate-400 text-xs">
                No site visits recorded.
              </div>
            </div>

            <!-- 5. DEALS TAB -->
            <div v-else-if="activeWorkspaceTab === 'deals'" class="space-y-3">
              <div v-if="lead.status === 'won'" class="p-4 border border-default rounded-xl bg-emerald-50/20 text-xs flex items-center justify-between">
                <div>
                  <h5 class="font-bold text-slate-800">Deal #DL-88301 (Initiated)</h5>
                  <p class="text-[10px] text-slate-400 mt-0.5">Conversion deal created on won transition.</p>
                </div>
                <router-link to="/app/deals" class="text-xs text-primary font-bold hover:underline">View Deal ➔</router-link>
              </div>
              <div v-else class="text-center py-8 text-slate-400 text-xs">
                Deals are created upon marking lead Won.
              </div>
            </div>

            <!-- 6. DOCUMENTS TAB -->
            <div v-else-if="activeWorkspaceTab === 'documents'" class="grid grid-cols-2 gap-3 text-xs">
              <div v-for="doc in documents" :key="doc.id" class="p-2.5 border border-default rounded-lg bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span class="font-bold text-slate-700 truncate block max-w-[120px]">{{ doc.name }}</span>
                  <span class="text-[9px] text-slate-400 block">{{ doc.size }}</span>
                </div>
                <button class="text-primary hover:underline">Download</button>
              </div>
              <div v-if="documents.length === 0" class="col-span-2 text-center py-8 text-slate-400">
                No KYC documents uploaded.
              </div>
            </div>

            <!-- 7. AUDIT TIMELINE TAB -->
            <div v-else-if="activeWorkspaceTab === 'timeline'">
              <LeadTimeline 
                :activities="loggedActivities" 
                :notes="loggedNotes" 
                :tasks="tasksList" 
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column Action Sidebar -->
      <div class="lg:col-span-4 shrink-0">
        <LeadCommandCenter 
          :lead="lead" 
          :activities="loggedActivities" 
          :tasks="tasksList" 
        />
      </div>
    </div>

    <!-- Modals & Drawers mounts -->
    <LeadEditDrawer 
      :isOpen="isEditOpen" 
      :lead="lead"
      @close="isEditOpen = false"
      @success="refetch"
      @merge="handleMergeTrigger"
    />

    <LeadTransferDrawer 
      :isOpen="isTransferOpen" 
      :lead="lead"
      @close="isTransferOpen = false"
      @success="refetch"
    />

    <LeadLostModal 
      :isOpen="isLostOpen" 
      :leadId="leadId"
      @close="isLostOpen = false"
      @success="refetch"
    />

    <LeadClosingModal 
      :isOpen="isWonOpen" 
      :lead="lead"
      @close="isWonOpen = false"
      @success="refetch"
    />

    <LeadReopenModal 
      :isOpen="isReopenOpen" 
      :leadId="leadId"
      @close="isReopenOpen = false"
      @success="refetch"
    />

    <LeadMergeModal
      v-if="isMergeOpen"
      :isOpen="isMergeOpen"
      :leadA="mergeLeadA"
      :leadB="mergeLeadB"
      @close="isMergeOpen = false"
      @success="handleMergeSuccess"
    />

    <!-- 360° Activity Center Drawer -->
    <LeadActivityCenter
      v-if="lead"
      :isOpen="isActivityCenterOpen"
      :lead="lead"
      :asDrawer="true"
      @close="isActivityCenterOpen = false"
    />

    <!-- Customer Profile History Modal -->
    <CustomerProfileModal
      :isOpen="isCustomerModalOpen"
      :customer="leadCustomer"
      :existingLeads="customerLeads"
      @close="isCustomerModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useQuery } from '@tanstack/vue-query';
import apiClient from '@/api/client';
import LeadStageBadge from '../components/LeadStageBadge.vue';
import LeadTimeline from '../components/LeadTimeline.vue';
import LeadActivityCenter from '../components/LeadActivityCenter.vue';
import WhatsAppWorkspace from '../components/WhatsAppWorkspace.vue';
import FollowUpPanel from '../components/FollowUpPanel.vue';
import LeadCommandCenter from '../components/LeadCommandCenter.vue';
import LeadEditDrawer from '../components/LeadEditDrawer.vue';
import LeadTransferDrawer from '../components/LeadTransferDrawer.vue';
import LeadLostModal from '../components/LeadLostModal.vue';
import LeadClosingModal from '../components/LeadClosingModal.vue';
import LeadReopenModal from '../components/LeadReopenModal.vue';
import LeadMergeModal from '../components/LeadMergeModal.vue';
import CustomerProfileModal from '../components/CustomerProfileModal.vue';
import {
  useLeadQuery,
  useCustomerLeadsQuery,
  useAddLeadNoteMutation,
  useLogLeadActivityMutation,
  useAddLeadFollowUpMutation,
} from '../queries';

const route = useRoute();
const router = useRouter();
const store = useStore();
const leadId = computed(() => route.params.id);

// Load lead details
const { data: leadData, isLoading, refetch } = useLeadQuery(leadId);
const lead = computed(() => leadData.value?.data || null);

// Customer Profile Modal & Linked Leads
const isCustomerModalOpen = ref(false);
const customerId = computed(() => lead.value?.customerId?._id || lead.value?.customerId || null);

const { data: customerHistoryData } = useCustomerLeadsQuery(customerId);
const customerLeads = computed(() => {
  if (customerHistoryData.value?.data?.leads) {
    return customerHistoryData.value.data.leads;
  }
  return [];
});

const leadCustomer = computed(() => {
  if (lead.value?.customerId && typeof lead.value.customerId === 'object') {
    return lead.value.customerId;
  }
  if (lead.value) {
    return {
      firstName: lead.value.firstName,
      lastName: lead.value.lastName,
      mobile: lead.value.mobile,
      email: lead.value.email,
      alternativeMobile: lead.value.alternativeMobile,
      createdAt: lead.value.createdAt,
    };
  }
  return null;
});

// Load linked tasks/follow-ups via /tasks?leadId=:id
const { data: tasksData, refetch: refetchTasks } = useQuery({
  queryKey: ['leads', leadId, 'tasks'],
  queryFn: () => apiClient.get('/tasks', { params: { leadId: leadId.value } }).then(res => res.data),
  enabled: !!leadId
});

const tasksList = computed(() => {
  return tasksData.value?.data || [];
});

const activeLogTab = ref('activity');
const activeWorkspaceTab = ref('overview');

// 1. Tab forms states
const logType = ref('call');
const logOutcome = ref('');
const logDescription = ref('');

const noteContent = ref('');
const noteIsPrivate = ref(false);

const workspaceTabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'activities', name: 'Activities' },
  { id: 'tasks', name: 'Follow-ups' },
  { id: 'site_visits', name: 'Site Visits' },
  { id: 'deals', name: 'Deals' },
  { id: 'documents', name: 'Documents' },
  { id: 'timeline', name: 'Audit Timeline' }
];

// Local timeline appends to support live updates in UI
const localActivities = ref([]);
const localNotes = ref([]);

const loggedActivities = computed(() => {
  // Combine database logs (if lead has activity logs, wait! lead detail doesn't include activity logs, so we combine local session logs)
  return localActivities.value;
});

const loggedNotes = computed(() => {
  return localNotes.value;
});

// Mock sub-items to make detail workspace look live and realistic
const siteVisits = ref([
  { id: 'sv-1', project: 'Prestige Heights', date: '2026-06-05 11:00 AM', status: 'scheduled' }
]);
const documents = ref([
  { id: 'doc-1', name: 'PAN_Card_Verification.pdf', size: '240 KB' },
  { id: 'doc-2', name: 'Aadhaar_KYC_Front.jpg', size: '480 KB' }
]);

// Actions overlays togglers
const isEditOpen = ref(false);
const isTransferOpen = ref(false);
const isLostOpen = ref(false);
const isWonOpen = ref(false);
const isReopenOpen = ref(false);
const isActivityCenterOpen = ref(false);

const { mutateAsync: addNote } = useAddLeadNoteMutation();
const { mutateAsync: logActivity } = useLogLeadActivityMutation();
const { mutateAsync: addFollowUp } = useAddLeadFollowUpMutation();

const submitActivityLog = async () => {
  if (!logDescription.value.trim()) return;

  try {
    const res = await logActivity({
      id: leadId.value,
      type: logType.value,
      description: logDescription.value,
      metadata: { outcome: logOutcome.value }
    });

    localActivities.value.push({
      id: res.data?._id || Date.now(),
      type: logType.value,
      description: logDescription.value,
      createdAt: new Date().toISOString(),
      metadata: { outcome: logOutcome.value }
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Interaction logged successfully.',
      type: 'success'
    });

    // Clear form
    logDescription.value = '';
    logOutcome.value = '';
    refetch(); // Invalidate main lead query
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to log outreach activity.',
      type: 'error'
    });
  }
};

const submitNoteLog = async () => {
  if (!noteContent.value.trim()) return;

  try {
    const res = await addNote({
      id: leadId.value,
      content: noteContent.value,
      isPrivate: noteIsPrivate.value
    });

    localNotes.value.push({
      id: res.data?._id || Date.now(),
      content: noteContent.value,
      isPrivate: noteIsPrivate.value,
      createdAt: new Date().toISOString()
    });

    store.dispatch('notifications/triggerToast', {
      message: 'Internal note added.',
      type: 'success'
    });

    // Clear form
    noteContent.value = '';
    noteIsPrivate.value = false;
    refetch();
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to save note.',
      type: 'error'
    });
  }
};

const handleWhatsAppLog = async ({ type, description, metadata }) => {
  try {
    const res = await logActivity({
      id: leadId.value,
      type,
      description,
      metadata
    });

    localActivities.value.push({
      id: res.data?._id || Date.now(),
      type,
      description,
      createdAt: new Date().toISOString(),
      metadata
    });

    refetch();
  } catch (error) {
    console.error('Failed to log WhatsApp activity:', error);
  }
};

const handleWhatsAppSchedule = async ({ scheduledAt, type, notes }) => {
  try {
    await addFollowUp({
      id: leadId.value,
      scheduledAt,
      type,
      notes
    });

    store.dispatch('notifications/triggerToast', {
      message: 'WhatsApp follow-up scheduled.',
      type: 'success'
    });
    refetchTasks();
    refetch();
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to schedule follow-up.',
      type: 'error'
    });
  }
};

const handleTaskComplete = async (taskId) => {
  try {
    await apiClient.post(`/tasks/${taskId}/complete`, { outcome: 'outreach connected' });
    store.dispatch('notifications/triggerToast', {
      message: 'Outreach follow-up task marked completed.',
      type: 'success'
    });
    refetchTasks();
    refetch();
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to complete task.',
      type: 'error'
    });
  }
};

const formatBudget = (budget) => {
  if (!budget) return '—';
  const formatNum = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString()}`;
  };
  return `${formatNum(budget.min || 0)} - ${formatNum(budget.max || 0)}`;
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isMergeOpen = ref(false);
const mergeLeadA = ref(null);
const mergeLeadB = ref(null);

const handleMergeTrigger = ({ leadA, leadB }) => {
  mergeLeadA.value = leadA;
  mergeLeadB.value = leadB;
  
  isEditOpen.value = false;
  isMergeOpen.value = true;
};

const handleMergeSuccess = () => {
  const survivorId = mergeLeadA.value?._id || mergeLeadA.value?.id;
  const deletedId = mergeLeadB.value?._id || mergeLeadB.value?.id;
  
  if (leadId.value === deletedId) {
    router.push(`/app/leads/${survivorId}`);
  } else {
    refetch();
    refetchTasks();
  }
};

const transferredCPsList = computed(() => {
  if (!lead.value) return [];
  if (Array.isArray(lead.value.agentIds) && lead.value.agentIds.length > 0) {
    return lead.value.agentIds;
  }
  if (lead.value.agentId) {
    return [lead.value.agentId];
  }
  return [];
});

const getLeadStepIndex = (status) => {
  const map = {
    new: 0,
    contacted: 1,
    qualified: 2,
    property_shared: 3,
    site_visit_scheduled: 4,
    site_visit_completed: 4,
    negotiation: 5,
    booked: 6,
    won: 7,
  };
  return map[status] ?? 0;
};

const transferredCPsCount = computed(() => transferredCPsList.value.length);
</script>
