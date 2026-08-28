<template>
  <div class="space-y-6 text-xs font-sans">
    <!-- Header Block with Greeting, Quick Actions & Date Filter -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>{{ greeting }}, {{ userName }}</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Here's what's happening with your real estate business today · {{ formattedToday }}
        </p>
      </div>

      <!-- Actions & Date Range Controls -->
      <div class="flex items-center gap-3 shrink-0 flex-wrap">
        <!-- Date Filter Selector -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button 
            v-for="period in ['today', 'this_week', 'this_month', 'this_quarter', 'this_year']"
            :key="period"
            @click="setPeriod(period)"
            class="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
            :class="selectedPeriod === period ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
          >
            {{ formatPeriodLabel(period) }}
          </button>
        </div>

        <!-- + New Lead Primary Action -->
        <router-link 
          to="/app/leads"
          class="px-3.5 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-1.5 text-xs"
        >
          <span class="font-bold text-sm">+</span>
          <span>New Lead</span>
        </router-link>
      </div>
    </div>

    <!-- 4 Primary Operational & Financial KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Active Leads -->
      <router-link 
        to="/app/leads"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group block space-y-1"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600">Active Leads</span>
          <span class="text-slate-400 group-hover:text-indigo-600 text-sm">👥</span>
        </div>
        <span class="text-2xl font-bold text-slate-900 dark:text-slate-100 block">
          {{ kpis.activeLeads || 0 }}
        </span>
        <span class="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
          <span>+{{ kpis.newLeadsThisMonth || 0 }}</span>
          <span class="text-slate-400">new this month</span>
        </span>
      </router-link>

      <!-- 2. Active Deals -->
      <router-link 
        to="/app/deals"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group block space-y-1"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600">Active Deals</span>
          <span class="text-slate-400 group-hover:text-indigo-600 text-sm">🤝</span>
        </div>
        <span class="text-2xl font-bold text-slate-900 dark:text-slate-100 block">
          {{ kpis.activeDeals || 0 }}
        </span>
        <span class="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
          ₹{{ formatCompact(kpis.activePipelineValue || 0) }} pipeline value
        </span>
      </router-link>

      <!-- 3. Properties Inventory -->
      <router-link 
        to="/app/properties"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group block space-y-1"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600">Properties</span>
          <span class="text-slate-400 group-hover:text-indigo-600 text-sm">🏢</span>
        </div>
        <span class="text-2xl font-bold text-slate-900 dark:text-slate-100 block">
          {{ kpis.activeProperties || 0 }}
        </span>
        <span class="text-[11px] text-slate-500 font-medium">
          {{ kpis.activeProperties || 0 }} units available
        </span>
      </router-link>

      <!-- 4. Receivables -->
      <router-link 
        to="/app/commissions/receivables"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group block space-y-1"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600">Receivable</span>
          <span class="text-slate-400 group-hover:text-indigo-600 text-sm">💰</span>
        </div>
        <span class="text-2xl font-bold text-slate-900 dark:text-slate-100 block">
          ₹{{ formatCompact(kpis.commissionReceivable || 0) }}
        </span>
        <span class="text-[11px] font-medium" :class="kpis.commissionOverdue > 0 ? 'text-red-500' : 'text-slate-400'">
          {{ kpis.commissionOverdue > 0 ? '₹' + formatCompact(kpis.commissionOverdue) + ' overdue' : 'All accounts on track' }}
        </span>
      </router-link>
    </div>

    <!-- Section 10: Today's Priorities Operational Strip -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2.5">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 class="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
          <span>⚡</span>
          <span>Today's Priorities</span>
        </h3>
        <span class="text-[10px] text-slate-400 font-medium">What needs your immediate attention today</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <!-- 1. Follow-ups Due -->
        <router-link 
          to="/app/tasks"
          class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200/70 dark:border-slate-700/60 transition-all flex items-center justify-between"
        >
          <div>
            <span class="text-[10px] text-slate-400 font-semibold uppercase block">Follow-ups Due</span>
            <span class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ kpis.followupsDueTodayCount || 0 }} Due</span>
          </div>
          <span class="text-indigo-600 font-bold">→</span>
        </router-link>

        <!-- 2. Site Visits -->
        <router-link 
          to="/app/tasks"
          class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/70 dark:border-slate-700/60 transition-all flex items-center justify-between"
        >
          <div>
            <span class="text-[10px] text-slate-400 font-semibold uppercase block">Site Visits</span>
            <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ kpis.siteVisitsScheduledCount || 0 }} Scheduled</span>
          </div>
          <span class="text-emerald-600 font-bold">→</span>
        </router-link>

        <!-- 3. Meetings -->
        <router-link 
          to="/app/tasks"
          class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 border border-slate-200/70 dark:border-slate-700/60 transition-all flex items-center justify-between"
        >
          <div>
            <span class="text-[10px] text-slate-400 font-semibold uppercase block">Meetings</span>
            <span class="text-sm font-bold text-purple-600 dark:text-purple-400">2 Meetings</span>
          </div>
          <span class="text-purple-600 font-bold">→</span>
        </router-link>

        <!-- 4. Hot Leads -->
        <router-link 
          to="/app/leads"
          class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50/60 dark:hover:bg-red-950/30 border border-slate-200/70 dark:border-slate-700/60 transition-all flex items-center justify-between"
        >
          <div>
            <span class="text-[10px] text-slate-400 font-semibold uppercase block">Hot Leads</span>
            <span class="text-sm font-bold text-red-500">{{ kpis.hotLeads || 0 }} Need Attention</span>
          </div>
          <span class="text-red-500 font-bold">→</span>
        </router-link>

        <!-- 5. Overdue Payments -->
        <router-link 
          to="/app/commissions/receivables"
          class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 border border-slate-200/70 dark:border-slate-700/60 transition-all flex items-center justify-between"
        >
          <div>
            <span class="text-[10px] text-slate-400 font-semibold uppercase block">Overdue Payments</span>
            <span class="text-sm font-bold text-amber-600 dark:text-amber-400">{{ kpis.overdueFollowupsCount || 0 }} Overdue</span>
          </div>
          <span class="text-amber-600 font-bold">→</span>
        </router-link>
      </div>
    </div>

    <!-- Section 11: Sales Pipeline Conversion Funnel -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>📈</span>
            <span>Sales Pipeline Funnel</span>
          </h3>
          <p class="text-[11px] text-slate-400">Opportunity flow and estimated value across lead stages</p>
        </div>
        <router-link to="/app/leads" class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
          View Pipeline Board →
        </router-link>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <router-link 
          v-for="stage in pipelineStages" 
          :key="stage.key"
          to="/app/leads"
          class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 transition-all text-center space-y-1 block group"
        >
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate group-hover:text-indigo-600">
            {{ stage.label }}
          </span>
          <span class="text-lg font-bold text-slate-900 dark:text-slate-100 block">
            {{ getStageCount(stage.key) }}
          </span>
          <span class="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 block truncate">
            ₹{{ formatCompact(getStageValue(stage.key)) }}
          </span>
        </router-link>
      </div>
    </div>

    <!-- Section: Loan Management & Banking Operations Strip -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div>
          <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>🏦</span>
            <span>Home Loan Pipeline & Banking Operations</span>
          </h3>
          <p class="text-[10px] text-slate-400">Real-time status of loan cases, bank submissions, sanctions & disbursements</p>
        </div>
        <router-link to="/app/loans" class="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
          Manage Loans →
        </router-link>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <router-link to="/app/loans" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-blue-400 transition block space-y-0.5">
          <span class="text-[10px] text-slate-400 font-semibold uppercase">Active Loan Files</span>
          <div class="text-base font-extrabold text-slate-900 dark:text-white font-mono">{{ loanSummary.activeCases || 0 }} Cases</div>
          <span class="text-[10px] text-blue-600 font-medium">In Bank Pipeline</span>
        </router-link>

        <router-link to="/app/loans" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-emerald-400 transition block space-y-0.5">
          <span class="text-[10px] text-slate-400 font-semibold uppercase">Sanctioned</span>
          <div class="text-base font-extrabold text-emerald-600 font-mono">{{ loanSummary.sanctionedCount || 0 }} Approved</div>
          <span class="text-[10px] text-emerald-700 dark:text-emerald-400/80 font-medium">₹{{ formatCompact(loanSummary.totalSanctionedAmount || 0) }} Sanctioned</span>
        </router-link>

        <router-link to="/app/loans" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-purple-400 transition block space-y-0.5">
          <span class="text-[10px] text-slate-400 font-semibold uppercase">Disbursed This Month</span>
          <div class="text-base font-extrabold text-purple-600 font-mono">₹{{ formatCompact(loanSummary.disbursedThisMonth || 0) }}</div>
          <span class="text-[10px] text-slate-400 font-medium">Total: ₹{{ formatCompact(loanSummary.totalDisbursedAmount || 0) }}</span>
        </router-link>

        <router-link to="/app/commissions" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-amber-400 transition block space-y-0.5">
          <span class="text-[10px] text-slate-400 font-semibold uppercase">Loan Comm. Receivable</span>
          <div class="text-base font-extrabold text-amber-600 font-mono">₹{{ formatCompact(loanSummary.commissionReceivable || 0) }}</div>
          <span class="text-[10px] text-amber-700 dark:text-amber-400/80 font-medium">Auto-synced</span>
        </router-link>
      </div>
    </div>

    <!-- Section 12 & 15 & 16: Today's Follow-ups & Hot Leads / Visits Row -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Today's Follow-ups Widget -->
      <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>⏰</span>
                <span>Today's Follow-ups</span>
              </h3>
              <p class="text-[11px] text-slate-400">Scheduled client touches, calls, and site visits</p>
            </div>
            <router-link to="/app/tasks" class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              All Tasks →
            </router-link>
          </div>

          <!-- Follow-ups List -->
          <div class="mt-3 space-y-2.5 max-h-[340px] overflow-y-auto">
            <div v-if="todayFollowups.length === 0 && overdueFollowups.length === 0" class="py-12 text-center text-slate-400 space-y-1">
              <span class="text-2xl">✨</span>
              <p class="font-semibold text-slate-600 dark:text-slate-300">All follow-ups completed!</p>
              <p class="text-[11px]">No pending calls or visits scheduled for today.</p>
            </div>

            <div 
              v-for="task in [...overdueFollowups, ...todayFollowups]" 
              :key="task.id"
              class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 rounded-xl flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors"
            >
              <div class="space-y-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 dark:text-slate-100 truncate">{{ task.leadName }}</span>
                  <span class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {{ task.type }}
                  </span>
                  <span v-if="task.temperature === 'hot'" class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-red-500/10 text-red-600">
                    HOT
                  </span>
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>🕒 {{ task.dueTime || '11:00 AM' }}</span>
                  <span>·</span>
                  <span class="truncate">{{ task.title }}</span>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <router-link 
                  to="/app/tasks"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                >
                  Reschedule
                </router-link>
                <router-link 
                  to="/app/tasks"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Complete
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <router-link to="/app/tasks" class="text-slate-500 hover:text-indigo-600 font-semibold text-xs">
            + Schedule New Follow-up
          </router-link>
        </div>
      </div>

      <!-- Right: Hot Leads & Upcoming Visits -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Hot Leads Card -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-red-600 flex items-center gap-1">
              <span>🔥</span>
              <span>Hot Leads (High Intent)</span>
            </h3>
            <router-link to="/app/leads" class="text-[11px] text-indigo-600 hover:underline font-semibold">
              View All →
            </router-link>
          </div>

          <div v-if="recentLeads.length === 0" class="py-6 text-center text-slate-400">
            <span class="text-xs">No hot leads currently flagged.</span>
          </div>

          <div v-else class="space-y-2">
            <router-link 
              v-for="lead in recentLeads.slice(0, 4)" 
              :key="lead.id"
              :to="`/app/leads/${lead.id}`"
              class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors block"
            >
              <div class="space-y-0.5">
                <div class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{{ lead.name }}</span>
                  <span class="px-1.5 py-0.2 rounded text-[8px] font-bold bg-red-500/10 text-red-600">HOT</span>
                </div>
                <div class="text-[10px] text-slate-400">{{ lead.requirement }}</div>
              </div>
              <span class="text-[10px] font-semibold text-slate-500 capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {{ (lead.stage || 'new').replace(/_/g, ' ') }}
              </span>
            </router-link>
          </div>
        </div>

        <!-- Upcoming Site Visits Card -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <span>🚗</span>
              <span>Upcoming Site Visits</span>
            </h3>
            <router-link to="/app/tasks" class="text-[11px] text-indigo-600 hover:underline font-semibold">
              View All →
            </router-link>
          </div>

          <div class="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
            <div class="space-y-0.5">
              <div class="font-bold text-slate-900 dark:text-slate-100 text-xs">Today · 4:30 PM</div>
              <div class="text-[11px] text-slate-500">Neha Sharma · Godrej River Royale (3 BHK)</div>
            </div>
            <router-link to="/app/tasks" class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
              Complete Visit
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 13 & 14 & 17: Monthly Performance & Financial Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Monthly Performance Chart Card -->
      <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📊</span>
              <span>Sales & Commission Performance</span>
            </h3>
            <p class="text-[11px] text-slate-400">Deal volume and revenue realization trend</p>
          </div>

          <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-semibold">
            <button 
              v-for="range in ['3M', '6M', '12M']" 
              :key="range"
              @click="chartRange = range"
              class="px-2 py-0.5 rounded-md transition-all"
              :class="chartRange === range ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs font-bold' : 'text-slate-500'"
            >
              {{ range }}
            </button>
          </div>
        </div>

        <!-- Metric Bars -->
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span class="text-[10px] text-slate-400 font-semibold uppercase block">Deals Closed</span>
            <span class="text-base font-bold text-slate-900 dark:text-slate-100">{{ kpis.closedDealsPeriodCount || 0 }} Deals</span>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span class="text-[10px] text-slate-400 font-semibold uppercase block">Deal Value</span>
            <span class="text-base font-bold text-slate-900 dark:text-slate-100">₹{{ formatCompact(kpis.closedDealsPeriodValue || 0) }}</span>
          </div>
          <div class="p-3 bg-emerald-500/10 rounded-xl text-emerald-700 dark:text-emerald-400">
            <span class="text-[10px] font-semibold uppercase block">Commission Received</span>
            <span class="text-base font-extrabold">₹{{ formatCompact(kpis.commissionReceived || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- Financial Snapshot & Expected Collections -->
      <div class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>💎</span>
              <span>Financial Snapshot</span>
            </h3>
            <router-link to="/app/commissions" class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              View Financials →
            </router-link>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-3">
            <div class="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <span class="text-slate-400 block text-[10px] font-semibold uppercase">Earned</span>
              <span class="text-base font-extrabold text-slate-900 dark:text-slate-100">
                ₹{{ formatCompact(kpis.commissionEarned || 0) }}
              </span>
            </div>
            <div class="bg-emerald-500/10 p-3 rounded-xl text-emerald-700 dark:text-emerald-400">
              <span class="block text-[10px] font-semibold uppercase">Received</span>
              <span class="text-base font-extrabold">
                ₹{{ formatCompact(kpis.commissionReceived || 0) }}
              </span>
            </div>
            <div class="bg-amber-500/10 p-3 rounded-xl text-amber-700 dark:text-amber-400">
              <span class="block text-[10px] font-semibold uppercase">Outstanding</span>
              <span class="text-base font-extrabold">
                ₹{{ formatCompact(kpis.commissionReceivable || 0) }}
              </span>
            </div>
            <div class="bg-red-500/10 p-3 rounded-xl text-red-700 dark:text-red-400">
              <span class="block text-[10px] font-semibold uppercase">Overdue</span>
              <span class="text-base font-extrabold">
                ₹{{ formatCompact(kpis.commissionOverdue || 0) }}
              </span>
            </div>
          </div>

          <!-- Collection Progress Bar -->
          <div class="space-y-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
            <div class="flex justify-between text-[11px] font-semibold">
              <span class="text-slate-500">Collection Progress</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-bold">{{ kpis.collectionRate || 0 }}%</span>
            </div>
            <div class="bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" :style="`width: ${Math.min(100, kpis.collectionRate || 0)}%`"></div>
            </div>
          </div>
        </div>

        <div class="pt-2 text-center">
          <router-link to="/app/commissions/receivables" class="text-indigo-600 font-semibold text-xs hover:underline">
            Open Receivables Ledger ("Who Owes Us") →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { fetchBrokerDashboard } from '../api/endpoints';
import apiClient from '@/api/client';

const store = useStore();

const selectedPeriod = ref('this_month');
const chartRange = ref('6M');
const loading = ref(true);

const kpis = ref({
  activeLeads: 0,
  activeProperties: 0,
  activeDeals: 0,
  activePipelineValue: 0,
  closedDealsPeriodCount: 0,
  closedDealsPeriodValue: 0,
  commissionReceivable: 0,
  commissionReceived: 0,
  commissionEarned: 0,
  commissionOverdue: 0,
  expectedThisMonth: 0,
  collectionRate: 0,
  followupsDueTodayCount: 0,
  overdueFollowupsCount: 0,
  siteVisitsScheduledCount: 0,
});

const salesPipeline = ref({});
const leadSources = ref({});
const leadTemperatures = ref({ hot: 0, warm: 0, cold: 0 });
const todayFollowups = ref([]);
const overdueFollowups = ref([]);
const expectedCollections = ref([]);
const recentLeads = ref([]);
const loanSummary = ref({
  activeCases: 0,
  sanctionedCount: 0,
  disbursedThisMonth: 0,
  totalSanctionedAmount: 0,
  totalDisbursedAmount: 0,
  commissionReceivable: 0,
});

const userName = computed(() => {
  const user = store.state.auth.currentUser;
  return user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Sameer';
});

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
});

const formattedToday = computed(() => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

const pipelineStages = [
  { key: 'new', label: 'New' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'property_shared', label: 'Prop Shared' },
  { key: 'site_visit', label: 'Site Visit' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'booking', label: 'Booking' },
  { key: 'closed_won', label: 'Closed' },
];

function formatPeriodLabel(p) {
  const map = {
    today: 'Today',
    this_week: 'This Week',
    this_month: 'This Month',
    this_quarter: 'This Quarter',
    this_year: 'This Year',
  };
  return map[p] || p;
}

function setPeriod(p) {
  selectedPeriod.value = p;
  loadDashboardData();
}

function getPeriodDates() {
  const now = new Date();
  let start = new Date();
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  if (selectedPeriod.value === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  } else if (selectedPeriod.value === 'this_week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
  } else if (selectedPeriod.value === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (selectedPeriod.value === 'this_quarter') {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    start = new Date(now.getFullYear(), quarterMonth, 1);
  } else if (selectedPeriod.value === 'this_year') {
    start = new Date(now.getFullYear(), 0, 1);
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

async function loadDashboardData() {
  loading.value = true;
  try {
    const dates = getPeriodDates();
    const [res, loanRes] = await Promise.allSettled([
      fetchBrokerDashboard(dates),
      apiClient.get('/loans/summary'),
    ]);

    if (res.status === 'fulfilled') {
      const data = res.value?.data || res.value;
      if (data) {
        if (data.kpis) kpis.value = data.kpis;
        if (data.salesPipeline) salesPipeline.value = data.salesPipeline;
        if (data.leadSources) leadSources.value = data.leadSources;
        if (data.leadTemperatures) leadTemperatures.value = data.leadTemperatures;
        if (data.todayFollowups) todayFollowups.value = data.todayFollowups;
        if (data.overdueFollowups) overdueFollowups.value = data.overdueFollowups;
        if (data.expectedCollections) expectedCollections.value = data.expectedCollections;
        if (data.recentLeads) recentLeads.value = data.recentLeads;
      }
    }

    if (loanRes.status === 'fulfilled') {
      loanSummary.value = loanRes.value?.data?.data || loanRes.value?.data || loanSummary.value;
    }
  } catch (err) {
    console.error('Failed to load broker dashboard:', err);
  } finally {
    loading.value = false;
  }
}

function getStageCount(key) {
  return salesPipeline.value[key]?.count || 0;
}

function getStageValue(key) {
  return salesPipeline.value[key]?.value || 0;
}

function formatCompact(val) {
  const n = Number(val) || 0;
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)} K`;
  return n.toLocaleString('en-IN');
}

onMounted(() => {
  loadDashboardData();
});
</script>
