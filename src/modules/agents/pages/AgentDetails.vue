<template>
  <div class="space-y-6">
    <!-- Top Breadcrumb & Actions Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <router-link
          to="/app/agents"
          class="p-2 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          style="border-color: hsl(var(--neutral-200)); color: hsl(var(--neutral-600));"
        >
          <PhArrowLeft :size="18" />
        </router-link>
        <div>
          <h1 class="text-title font-bold tracking-tight" style="color: hsl(var(--neutral-900));">
            {{ agent?.name || 'Agent Details' }}
          </h1>
          <p class="text-body-sm flex items-center gap-2" style="color: hsl(var(--neutral-400));">
            <span class="inline-flex items-center gap-1"><AppIcon name="buildings" :size="12" /> {{ agent?.officeName }}</span>
            <span>•</span>
            <span class="capitalize">{{ agent?.agentType?.replace(/_/g, ' ') }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="drawerOpen = true"
          class="h-9 px-3.5 rounded-lg border text-caption font-medium transition-colors flex items-center gap-1.5"
          style="border-color: hsl(var(--neutral-200)); color: hsl(var(--neutral-700));"
        >
          <PhPencilSimple :size="16" />
          <span>Edit Agent</span>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="p-12 text-center">
      <PhCircleNotch class="animate-spin mx-auto text-accent-600" :size="32" />
      <p class="mt-2 text-caption" style="color: hsl(var(--neutral-400));">Loading agent performance profile...</p>
    </div>

    <template v-else-if="agent">
      <!-- KPI Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <!-- Total Leads -->
        <div
          class="p-4 rounded-xl border shadow-xs"
          style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
        >
          <span class="text-caption font-medium block mb-1" style="color: hsl(var(--neutral-400));">Total Assigned</span>
          <span class="text-headline font-bold block" style="color: hsl(var(--neutral-900));">
            {{ agent.totalLeadsAssigned || 0 }}
          </span>
          <span class="text-micro" style="color: hsl(var(--neutral-400));">Lifetime transferred</span>
        </div>

        <!-- Active Leads -->
        <div
          class="p-4 rounded-xl border shadow-xs"
          style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
        >
          <span class="text-caption font-medium block mb-1" style="color: hsl(var(--neutral-400));">Active Pipeline</span>
          <span class="text-headline font-bold block text-blue-600">
            {{ agent.activeLeadsCount || 0 }}
          </span>
          <span class="text-micro text-blue-500">In progress</span>
        </div>

        <!-- Converted Leads -->
        <div
          class="p-4 rounded-xl border shadow-xs"
          style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
        >
          <span class="text-caption font-medium block mb-1" style="color: hsl(var(--neutral-400));">Converted Won</span>
          <span class="text-headline font-bold block text-emerald-600">
            {{ agent.convertedLeadsCount || 0 }}
          </span>
          <span class="text-micro text-emerald-500">Successful deals</span>
        </div>

        <!-- Lost Leads -->
        <div
          class="p-4 rounded-xl border shadow-xs"
          style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
        >
          <span class="text-caption font-medium block mb-1" style="color: hsl(var(--neutral-400));">Lost Deals</span>
          <span class="text-headline font-bold block text-rose-600">
            {{ agent.lostLeadsCount || 0 }}
          </span>
          <span class="text-micro text-rose-500">Closed lost</span>
        </div>

        <!-- Last Transferred -->
        <div
          class="p-4 rounded-xl border shadow-xs col-span-2 md:col-span-1"
          style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
        >
          <span class="text-caption font-medium block mb-1" style="color: hsl(var(--neutral-400));">Last Transferred</span>
          <span class="text-body-sm font-semibold block" style="color: hsl(var(--neutral-800));">
            {{ agent.lastTransferredAt ? formatDate(agent.lastTransferredAt) : 'Never' }}
          </span>
          <span class="text-micro" style="color: hsl(var(--neutral-400));">Recent activity</span>
        </div>
      </div>

      <!-- Main Section: Left Information & Right Assigned Leads -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Information Cards -->
        <div class="space-y-4">
          <!-- Overview Card -->
          <div
            class="p-5 rounded-xl border shadow-xs space-y-3"
            style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
          >
            <div class="flex items-center justify-between border-b pb-3" style="border-color: hsl(var(--neutral-100));">
              <h3 class="font-semibold text-body" style="color: hsl(var(--neutral-900));">
                Contact & Office Info
              </h3>
              <span
                class="px-2.5 py-0.5 rounded-full text-micro font-semibold capitalize"
                :style="{
                  backgroundColor: agent.status === 'active' ? 'hsl(var(--success-50))' : 'hsl(var(--neutral-100))',
                  color: agent.status === 'active' ? 'hsl(var(--success-700))' : 'hsl(var(--neutral-600))'
                }"
              >
                {{ agent.status }}
              </span>
            </div>

            <div class="space-y-2 text-caption">
              <div>
                <span class="block text-micro" style="color: hsl(var(--neutral-400));">Phone Number</span>
                <span class="font-medium inline-flex items-center gap-1.5" style="color: hsl(var(--neutral-800));"><AppIcon name="phone" :size="13" /> {{ agent.phone }}</span>
                <span v-if="agent.alternatePhone" class="text-micro ml-2" style="color: hsl(var(--neutral-500));">
                  (Alt: {{ agent.alternatePhone }})
                </span>
              </div>

              <div v-if="agent.email">
                <span class="block text-micro" style="color: hsl(var(--neutral-400));">Email Address</span>
                <span class="font-medium inline-flex items-center gap-1.5" style="color: hsl(var(--neutral-800));"><AppIcon name="email" :size="13" /> {{ agent.email }}</span>
              </div>

              <div>
                <span class="block text-micro" style="color: hsl(var(--neutral-400));">Address</span>
                <span class="font-medium" style="color: hsl(var(--neutral-800));">
                  <AppIcon name="mapPin" :size="13" class="inline" /> {{ agent.address }}, {{ agent.city }} {{ agent.pincode }}
                </span>
              </div>

              <div v-if="agent.contactPersonName">
                <span class="block text-micro" style="color: hsl(var(--neutral-400));">Contact Person</span>
                <span class="font-medium" style="color: hsl(var(--neutral-800));">
                  <AppIcon name="user" :size="13" class="inline" /> {{ agent.contactPersonName }} ({{ agent.contactPersonPhone || 'N/A' }})
                </span>
              </div>
            </div>
          </div>

          <!-- Business Registration Card -->
          <div
            class="p-5 rounded-xl border shadow-xs space-y-3"
            style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
          >
            <h3 class="font-semibold text-body border-b pb-3" style="border-color: hsl(var(--neutral-100)); color: hsl(var(--neutral-900));">
              Registration & Legal
            </h3>

            <div class="space-y-2 text-caption">
              <div>
                <span class="block text-micro" style="color: hsl(var(--neutral-400));">RERA Registration</span>
                <span class="font-mono text-body-sm font-semibold" style="color: hsl(var(--accent-700));">
                  {{ agent.reraNumber || 'Not provided' }}
                </span>
              </div>

              <div v-if="agent.registrationNumber">
                <span class="block text-micro" style="color: hsl(var(--neutral-400));">Registration No.</span>
                <span class="font-medium" style="color: hsl(var(--neutral-800));">{{ agent.registrationNumber }}</span>
              </div>

              <div v-if="agent.gstNumber">
                <span class="block text-micro" style="color: hsl(var(--neutral-400));">GSTIN</span>
                <span class="font-mono font-medium" style="color: hsl(var(--neutral-800));">{{ agent.gstNumber }}</span>
              </div>

              <div v-if="agent.panNumber">
                <span class="block text-micro" style="color: hsl(var(--neutral-400));">PAN Card</span>
                <span class="font-mono font-medium" style="color: hsl(var(--neutral-800));">{{ agent.panNumber }}</span>
              </div>

              <div>
                <span class="block text-micro" style="color: hsl(var(--neutral-400));">Specialization</span>
                <span class="font-medium capitalize" style="color: hsl(var(--neutral-800));">{{ agent.specialization }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Transferred Leads Table & Timeline -->
        <div class="lg:col-span-2 space-y-4">
          <div
            class="rounded-xl border overflow-hidden shadow-xs"
            style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
          >
            <div class="p-4 border-b flex items-center justify-between" style="border-color: hsl(var(--neutral-100));">
              <div>
                <h3 class="font-semibold text-body" style="color: hsl(var(--neutral-900));">
                  Transferred Leads History
                </h3>
                <p class="text-micro" style="color: hsl(var(--neutral-400));">
                  Leads currently assigned to this channel partner
                </p>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr
                    class="border-b text-micro uppercase tracking-wider font-semibold"
                    style="border-color: hsl(var(--neutral-100)); background-color: hsl(var(--neutral-50)); color: hsl(var(--neutral-500));"
                  >
                    <th class="px-4 py-3">Lead Name</th>
                    <th class="px-4 py-3">Contact</th>
                    <th class="px-4 py-3">Source</th>
                    <th class="px-4 py-3">Stage Status</th>
                    <th class="px-4 py-3">Transferred Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y" style="border-color: hsl(var(--neutral-100));">
                  <template v-if="isLeadsLoading">
                    <tr v-for="n in 3" :key="n" class="animate-pulse">
                      <td colspan="5" class="px-4 py-3">
                        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      </td>
                    </tr>
                  </template>

                  <template v-else-if="assignedLeads.length === 0">
                    <tr>
                      <td colspan="5" class="px-4 py-8 text-center text-caption" style="color: hsl(var(--neutral-400));">
                        No leads currently transferred to this agent.
                      </td>
                    </tr>
                  </template>

                  <tr v-for="lead in assignedLeads" :key="lead._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td class="px-4 py-3 font-semibold text-caption">
                      <router-link :to="`/app/leads/${lead._id}`" class="hover:underline" style="color: hsl(var(--neutral-900));">
                        {{ lead.firstName }} {{ lead.lastName }}
                      </router-link>
                    </td>
                    <td class="px-4 py-3 text-caption" style="color: hsl(var(--neutral-700));">
                      {{ lead.mobile }}
                    </td>
                    <td class="px-4 py-3 text-caption capitalize" style="color: hsl(var(--neutral-600));">
                      {{ lead.source?.replace(/_/g, ' ') }}
                    </td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded text-micro font-semibold capitalize" style="background-color: hsl(var(--accent-50)); color: hsl(var(--accent-700));">
                        {{ lead.status?.replace(/_/g, ' ') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-micro" style="color: hsl(var(--neutral-400));">
                      {{ formatDate(lead.updatedAt) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Create/Edit Drawer -->
    <AgentCreateDrawer
      :open="drawerOpen"
      :agent-data="agent"
      @close="drawerOpen = false"
      @saved="refetch"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  PhArrowLeft,
  PhPencilSimple,
  PhCircleNotch,
} from '@phosphor-icons/vue';
import { useAgentQuery, useAgentLeadsQuery } from '../queries';
import AgentCreateDrawer from '../components/AgentCreateDrawer.vue';

const route = useRoute();
const agentId = computed(() => route.params.id);

const drawerOpen = ref(false);

const { data: agentRes, isLoading, refetch } = useAgentQuery(agentId);
const { data: leadsRes, isLoading: isLeadsLoading } = useAgentLeadsQuery(agentId);

const agent = computed(() => agentRes.value?.data);
const assignedLeads = computed(() => leadsRes.value?.data || []);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
