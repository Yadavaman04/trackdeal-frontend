<template>
  <div class="space-y-6 text-xs">
    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 font-medium">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 capitalize">
          <PhTrendUp :size="20" class="text-primary" />
          <span>{{ reportTitle }} Analytics Report</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Dynamic database metrics compilation and data visualization dashboard.
        </p>
      </div>

      <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
        <button 
          @click="shareReport"
          class="btn btn-sm btn-secondary text-xs h-8 px-3"
        >
          <PhShare :size="13" />
          <span>Share Report</span>
        </button>
        <router-link 
          to="/app/reports/dashboard"
          class="btn btn-sm btn-secondary text-xs h-8 px-3 shrink-0"
        >
          <PhBookOpen :size="13" />
          <span>Back to Library</span>
        </router-link>
      </div>
    </div>

    <!-- KPIs Ribbon -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPIWidget 
        v-for="kpi in reportKpis" 
        :key="kpi.title"
        :title="kpi.title"
        :value="kpi.value"
        :description="kpi.description"
        :trend="kpi.trend"
        :trendDirection="kpi.trendDirection"
      />
    </div>

    <!-- Visualization charts grids -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6" v-if="reportType !== 'forecast'">
      <AnalyticsChart 
        v-for="chart in reportCharts"
        :key="chart.title"
        :title="chart.title"
        :subtitle="chart.subtitle"
        :type="chart.type"
        :chartData="chart.data"
      />
    </div>

    <!-- Special Forecast View -->
    <div v-else class="space-y-6">
      <ForecastChart />
    </div>

    <!-- Dynamic report data lists details -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-default pb-2">
        <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 uppercase text-[9px] tracking-wider">
          Compiled Tabular Records
        </h4>
        <span class="text-[9px] font-mono text-slate-450">Sample Rows: {{ records.length }}</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
              <th v-for="col in tableHeaders" :key="col" class="py-2.5 px-3 capitalize">{{ col }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default text-slate-655 font-medium">
            <tr v-for="(row, idx) in records" :key="idx">
              <td v-for="col in tableHeaders" :key="col" class="py-2.5 px-3">
                <span v-if="col.toLowerCase().includes('value') || col.toLowerCase().includes('commission') || col.toLowerCase().includes('receivable') || col.toLowerCase().includes('revenue')" class="font-bold font-heading text-slate-800 dark:text-slate-100">
                  {{ formatCurrency(row[col]) }}
                </span>
                <span v-else class="text-slate-700 dark:text-slate-350">
                  {{ row[col] }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { PhTrendUp, PhShare, PhBookOpen } from '@phosphor-icons/vue';
import KPIWidget from '../components/KPIWidget.vue';
import AnalyticsChart from '../components/AnalyticsChart.vue';
import ForecastChart from '../components/ForecastChart.vue';

const route = useRoute();
const store = useStore();

const reportType = computed(() => route.params.type || 'leads');

const reportTitle = computed(() => {
  const mapping = {
    leads: 'Lead Funnel & Source',
    sales: 'Sales Deals Pipeline',
    properties: 'Inventory & Projects Aging',
    commissions: 'Expected vs Collected Commission',
    performance: 'Agent SLA & Compliance',
    forecast: 'Revenue Forecast'
  };
  return mapping[reportType.value] || reportType.value;
});

const reportKpis = computed(() => {
  const t = reportType.value;
  
  if (t === 'leads') {
    return [
      { title: 'Total Leads Sourced', value: '450', description: 'Leads registered in period', trend: '12%', trendDirection: 'up' },
      { title: 'Funnel Conversion Rate', value: '24.2%', description: 'Leads converted to won deals', trend: '3.4%', trendDirection: 'up' },
      { title: 'Lost Leads Count', value: '82', description: 'Leads marked lost', trend: '2.1%', trendDirection: 'down' },
      { title: 'Avg Response SLA', value: '1.8 Hrs', description: 'Outreach response speed', trend: '15%', trendDirection: 'up' }
    ];
  } else if (t === 'sales') {
    return [
      { title: 'Won Deals Count', value: '38', description: 'Confirmed B2B bookings', trend: '18%', trendDirection: 'up' },
      { title: 'Deal Win Rate', value: '72.4%', description: 'Booking conversions target met', trend: '5.2%', trendDirection: 'up' },
      { title: 'Average Sales Cycle', value: '42 Days', description: 'Lead-to-booking calendar days', trend: '4 Days', trendDirection: 'up' },
      { title: 'Gross Deal Volume', value: '₹12,45,00,000', description: 'Base contract value sum', trend: '11%', trendDirection: 'up' }
    ];
  } else if (t === 'properties') {
    return [
      { title: 'Total Listings units', value: '180', description: 'Units catalog inventory', trend: '25%', trendDirection: 'up' },
      { title: 'Available inventory', value: '84', description: 'Available for reservation', trend: '12%', trendDirection: 'down' },
      { title: 'Active Hold Reservations', value: '18', description: 'Units locked under SLA hold', trend: '10%', trendDirection: 'up' },
      { title: 'Average aging period', value: '15 Days', description: 'Avg hold duration before sold', trend: '2 Days', trendDirection: 'down' }
    ];
  } else if (t === 'commissions') {
    return [
      { title: 'Expected Revenue', value: '₹55,00,000', description: 'Sum of won deal values commissions', trend: '12%', trendDirection: 'up' },
      { title: 'Collected Revenue', value: '₹45,00,000', description: 'Gross bank cleared collections', trend: '15%', trendDirection: 'up' },
      { title: 'Outstanding collections', value: '₹22,50,000', description: 'Outstanding raised invoice balances', trend: '4%', trendDirection: 'up' },
      { title: 'Clawbacks exposures', value: '₹3,60,000', description: 'Cancelled deals recovery values', trend: '10%', trendDirection: 'down' }
    ];
  } else if (t === 'performance') {
    return [
      { title: 'SLA Compliance Rate', value: '94.2%', description: 'Follow-ups met inside 2 hours', trend: '2.5%', trendDirection: 'up' },
      { title: 'Agent follow-up met', value: '284', description: 'Met outreach follow-ups count', trend: '11%', trendDirection: 'up' },
      { title: 'Branch Productivity', value: '₹4.2 Cr', description: 'Avg sales closed volume per branch', trend: '8%', trendDirection: 'up' },
      { title: 'WhatsApp compliance', value: '98.5%', description: 'Outreach messaging compliance', trend: '1.2%', trendDirection: 'up' }
    ];
  } else {
    // forecast
    return [
      { title: '30 Day forecast', value: '₹18,50,000', description: 'Expected commission clearings', trend: '15%', trendDirection: 'up' },
      { title: '60 Day forecast', value: '₹24,50,000', description: 'Agreement milestone payments expected', trend: '10%', trendDirection: 'up' },
      { title: '90 Day forecast', value: '₹12,00,000', description: 'Registration clearings expected', trend: '5%', trendDirection: 'up' },
      { title: 'Total Forecast Value', value: '₹55,00,000', description: 'Total probability weighted forecast', trend: '11%', trendDirection: 'up' }
    ];
  }
});

const reportCharts = computed(() => {
  const t = reportType.value;
  
  if (t === 'leads') {
    return [
      {
        title: 'Lead Conversion Funnel',
        subtitle: 'Conversion stages statistics',
        type: 'funnel',
        data: [
          { label: 'Sourced Leads', value: 450, percent: 100 },
          { label: 'Outreach Contacted', value: 380, percent: 84 },
          { label: 'Site Visit Scheduled', value: 240, percent: 53 },
          { label: 'Token Paid', value: 120, percent: 26 },
          { label: 'Won Deals', value: 110, percent: 24 }
        ]
      },
      {
        title: 'Lead Source Performance',
        subtitle: 'Sourced channels ratio comparison',
        type: 'donut',
        data: [
          { label: 'WhatsApp Campaign', value: 180, percent: 40, color: '#10b981' },
          { label: 'Google Search Ads', value: 135, percent: 30, color: '#3b82f6' },
          { label: 'Organic Referrals', value: 90, percent: 20, color: '#a855f7' },
          { label: 'Direct Walk-In', value: 45, percent: 10, color: '#f59e0b' }
        ]
      }
    ];
  } else if (t === 'sales') {
    return [
      {
        title: 'Sales Booking Funnel',
        subtitle: 'Confirmed deals milestones funnel',
        type: 'funnel',
        data: [
          { label: 'Reservations Holds', value: 120, percent: 100 },
          { label: 'Token Deposits Cleared', value: 90, percent: 75 },
          { label: 'Builder Allotment Letters', value: 85, percent: 70 },
          { label: 'Agreement Contracts Signed', value: 50, percent: 41 },
          { label: 'Registration Done', value: 38, percent: 31 }
        ]
      },
      {
        title: 'Sales win rate Trends',
        subtitle: 'Monthly win rate trends',
        type: 'line',
        data: [
          { label: 'Jan', value: 65 },
          { label: 'Feb', value: 68 },
          { label: 'Mar', value: 74 },
          { label: 'Apr', value: 70 },
          { label: 'May', value: 72 }
        ]
      }
    ];
  } else if (t === 'properties') {
    return [
      {
        title: 'Listings Status Ratio',
        subtitle: 'Current unit inventory distributions',
        type: 'donut',
        data: [
          { label: 'Available', value: 84, percent: 46, color: '#10b981' },
          { label: 'Reserved Holds', value: 18, percent: 10, color: '#f59e0b' },
          { label: 'Blocked Waitlist', value: 12, percent: 7, color: '#3b82f6' },
          { label: 'Sold Units', value: 66, percent: 37, color: '#ef4444' }
        ]
      },
      {
        title: 'Active Holds Aging Trend',
        subtitle: 'Average holds duration trend (days)',
        type: 'line',
        data: [
          { label: 'Wk 1', value: 12 },
          { label: 'Wk 2', value: 15 },
          { label: 'Wk 3', value: 18 },
          { label: 'Wk 4', value: 14 }
        ]
      }
    ];
  } else if (t === 'commissions') {
    return [
      {
        title: 'Billing Invoice Distributions',
        subtitle: 'Billing collection stage values ratios',
        type: 'donut',
        data: [
          { label: 'Expected Unbilled', value: 1800000, percent: 32, color: '#94a3b8' },
          { label: 'Invoiced Outstanding', value: 2250000, percent: 41, color: '#3b82f6' },
          { label: 'Collected Paid', value: 1500000, percent: 27, color: '#10b981' }
        ]
      },
      {
        title: 'Collections Revenue Trend',
        subtitle: 'Cleared bank deposits trends (INR)',
        type: 'line',
        data: [
          { label: 'Jan', value: 1200000 },
          { label: 'Feb', value: 1800000 },
          { label: 'Mar', value: 2400000 },
          { label: 'Apr', value: 3100000 },
          { label: 'May', value: 4500000 }
        ]
      }
    ];
  } else {
    // performance
    return [
      {
        title: 'Outreach compliance ratio',
        subtitle: 'Met compliance target channels ratio',
        type: 'donut',
        data: [
          { label: 'WhatsApp SLA Met', value: 180, percent: 63, color: '#10b981' },
          { label: 'Phone call Followup Met', value: 74, percent: 26, color: '#3b82f6' },
          { label: 'Email response Met', value: 30, percent: 11, color: '#f59e0b' }
        ]
      },
      {
        title: 'SLA Response Speed Trend',
        subtitle: 'Average reply time speed (minutes)',
        type: 'line',
        data: [
          { label: 'Jan', value: 120 },
          { label: 'Feb', value: 95 },
          { label: 'Mar', value: 82 },
          { label: 'Apr', value: 75 },
          { label: 'May', value: 68 }
        ]
      }
    ];
  }
});

const tableHeaders = computed(() => {
  const t = reportType.value;
  if (t === 'leads') {
    return ['source', 'leadsCount', 'conversionRate', 'responseSla'];
  } else if (t === 'sales') {
    return ['dealNumber', 'clientName', 'unitCode', 'value', 'stage'];
  } else if (t === 'properties') {
    return ['projectName', 'unitCode', 'status', 'carpetArea', 'value'];
  } else if (t === 'commissions') {
    return ['invoiceNumber', 'builderName', 'grossCommission', 'tdsAmount', 'netReceivable', 'status'];
  } else if (t === 'performance') {
    return ['agentName', 'branchName', 'leadsAssigned', 'dealsClosed', 'slaCompliance'];
  } else {
    return ['bucket', 'probability', 'revenueValue', 'branchShare'];
  }
});

const records = computed(() => {
  const t = reportType.value;
  if (t === 'leads') {
    return [
      { source: 'WhatsApp Campaigns', leadsCount: 180, conversionRate: '28%', responseSla: '1.2 Hrs' },
      { source: 'Google Ads Search', leadsCount: 135, conversionRate: '22%', responseSla: '1.8 Hrs' },
      { source: 'Organic Referrals', leadsCount: 90, conversionRate: '35%', responseSla: '2.5 Hrs' }
    ];
  } else if (t === 'sales') {
    return [
      { dealNumber: 'DL-9842', clientName: 'Amit Sharma', unitCode: 'Unit 802', value: 7200000, stage: 'Booking Confirmed' },
      { dealNumber: 'DL-10928', clientName: 'Rohan Mehta', unitCode: 'Unit 102', value: 9800000, stage: 'Agreement Signed' },
      { dealNumber: 'DL-88390', clientName: 'Sunita Nair', unitCode: 'Unit 504', value: 12000000, stage: 'Commission Eligible' }
    ];
  } else if (t === 'properties') {
    return [
      { projectName: 'Skyway Prestige', unitCode: '802', status: 'Reserved', carpetArea: '1240 sqft', value: 7200000 },
      { projectName: 'Skyway Prestige', unitCode: '102', status: 'Sold', carpetArea: '1450 sqft', value: 9800000 },
      { projectName: 'Prestige Heights Block A', unitCode: '504', status: 'Available', carpetArea: '1850 sqft', value: 12000000 }
    ];
  } else if (t === 'commissions') {
    return [
      { invoiceNumber: 'INV-SK-88301', builderName: 'Skyway Builders Group', grossCommission: 180000, tdsAmount: 18000, netReceivable: 194400, status: 'paid' },
      { invoiceNumber: 'INV-SK-88302', builderName: 'Skyway Builders Group', grossCommission: 270000, tdsAmount: 27000, netReceivable: 291600, status: 'sent' },
      { invoiceNumber: 'INV-PR-92840', builderName: 'Prestige Developers', grossCommission: 540000, tdsAmount: 54000, netReceivable: 583200, status: 'acknowledged' }
    ];
  } else if (t === 'performance') {
    return [
      { agentName: 'Agent Priya Sharma', branchName: 'Bangalore HQ', leadsAssigned: 48, dealsClosed: 12, slaCompliance: '96%' },
      { agentName: 'Agent Ravi Kumar', branchName: 'Bangalore HQ', leadsAssigned: 36, dealsClosed: 8, slaCompliance: '92%' },
      { agentName: 'Agent Anjali Mehta', branchName: 'Mumbai Office', leadsAssigned: 42, dealsClosed: 9, slaCompliance: '94%' }
    ];
  } else {
    return [
      { bucket: '30 Days Expected', probability: '85%', revenueValue: 1850000, branchShare: 'Bangalore (75%)' },
      { bucket: '60 Days Expected', probability: '60%', revenueValue: 2450000, branchShare: 'Bangalore (50%)' },
      { bucket: '90 Days Expected', probability: '90%', revenueValue: 1200000, branchShare: 'Mumbai (40%)' }
    ];
  }
});

const shareReport = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    store.dispatch('notifications/triggerToast', {
      message: 'Report deep-link copied to clipboard. Ready to share.',
      type: 'success'
    });
  });
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>
