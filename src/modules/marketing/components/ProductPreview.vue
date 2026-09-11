<template>
  <div class="product-preview">
    <div class="preview-chrome">
      <span class="preview-dots" aria-hidden="true"><i></i><i></i><i></i></span
      ><span>TrackDeal workspace</span
      ><span class="demo-label">Illustrative data</span>
    </div>
    <div class="preview-body">
      <aside class="preview-sidebar" aria-label="Preview sections">
        <div class="preview-brand">
          <AppIcon name="buildings" :size="20" /> <strong>TrackDeal</strong>
        </div>
        <span class="preview-section-label">WORKSPACE</span>
        <button
          v-for="item in sections"
          :key="item.value"
          :class="{ selected: active === item.value }"
          :aria-pressed="active === item.value"
          @click="active = item.value"
        >
          <AppIcon :name="item.icon" :size="16" />{{ item.label
          }}<AppIcon
            v-if="active === item.value"
            name="arrowRight"
            :size="13"
            class="ml-auto"
          />
        </button>
        <div class="preview-user">
          <span>JD</span>
          <div><strong>Jordan Davis</strong><small>Workspace owner</small></div>
        </div>
      </aside>
      <div class="preview-content">
        <div class="preview-mobile-nav">
          <SegmentedControl
            v-model="active"
            :options="sections"
            label="Product preview"
          />
        </div>
        <div class="preview-heading">
          <div>
            <p>Your business, at a glance</p>
            <h3>{{ currentTitle }}</h3>
          </div>
          <span class="preview-date">September overview</span>
        </div>
        <template v-if="active === 'pipeline'">
          <div class="preview-metrics">
            <div v-for="metric in metrics" :key="metric.label">
              <span>{{ metric.label }}</span
              ><strong>{{ metric.value }}</strong
              ><small>{{ metric.detail }}</small>
            </div>
          </div>
          <div class="preview-panels">
            <section class="preview-chart">
              <div class="preview-panel-title">
                <h4>Sales pipeline</h4>
                <span>76 opportunities</span>
              </div>
              <PipelineChart :items="pipeline" />
            </section>
            <section class="preview-agenda">
              <div class="preview-panel-title">
                <h4>Up next</h4>
                <span>Today</span>
              </div>
              <div v-for="task in tasks" :key="task.name" class="preview-task">
                <span class="task-symbol"
                  ><AppIcon :name="task.icon" :size="16"
                /></span>
                <div>
                  <strong>{{ task.name }}</strong
                  ><small>{{ task.detail }}</small>
                </div>
                <time>{{ task.time }}</time>
              </div>
            </section>
          </div>
          <div class="preview-bottom">
            <span
              ><i></i> Everything in one place. Every next step in sight.</span
            ><AppIcon name="checkCircle" :size="17" />
          </div>
        </template>
        <template v-else-if="active === 'properties'">
          <p class="preview-description">
            A considered shortlist for every buyer.
          </p>
          <div class="preview-property-grid">
            <article
              v-for="(property, index) in properties"
              :key="property.name"
            >
              <div
                class="property-art"
                :class="`property-art-${index}`"
                aria-hidden="true"
              >
                <div></div>
                <div></div>
                <div></div>
              </div>
              <span class="property-status">Available</span>
              <h4>{{ property.name }}</h4>
              <p>{{ property.detail }}</p>
              <strong>{{ property.price }}</strong>
            </article>
          </div>
        </template>
        <template v-else>
          <div class="preview-metrics">
            <div>
              <span>Commission earned</span><strong>₹18.4 L</strong
              ><small>Across 12 closed deals</small>
            </div>
            <div>
              <span>Collected</span><strong>₹14.2 L</strong
              ><small>Payments received</small>
            </div>
            <div>
              <span>Outstanding</span><strong>₹4.2 L</strong
              ><small>Receivables to follow up</small>
            </div>
          </div>
          <section class="preview-chart revenue-chart">
            <div class="preview-panel-title">
              <h4>Monthly collections</h4>
              <span>₹ in lakhs</span>
            </div>
            <PipelineChart
              label="Illustrative monthly collections in lakhs"
              :items="revenue"
            />
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import PipelineChart from "@/components/ui/PipelineChart.vue";
const active = ref("pipeline");
const sections = [
  { value: "pipeline", label: "Overview", icon: "chart" },
  { value: "properties", label: "Properties", icon: "house" },
  { value: "revenue", label: "Revenue", icon: "currency" },
];
const currentTitle = computed(
  () =>
    ({
      pipeline: "A little clarity. A lot of possibility.",
      properties: "Find their next place.",
      revenue: "Good relationships. Real returns.",
    })[active.value],
);
const metrics = [
  {
    label: "Active pipeline",
    value: "₹8.6 Cr",
    detail: "From first hello to final handshake",
  },
  { label: "Open leads", value: "76", detail: "Relationships in the making" },
  { label: "Site visits", value: "12", detail: "Scheduled this week" },
];
const pipeline = [
  { label: "New", value: 28 },
  { label: "Qualified", value: 22 },
  { label: "Site visit", value: 16 },
  { label: "Negotiation", value: 10 },
];
const revenue = [
  { label: "Apr", value: 1.4 },
  { label: "May", value: 1.8 },
  { label: "Jun", value: 2.1 },
  { label: "Jul", value: 2.5 },
  { label: "Aug", value: 2.9 },
  { label: "Sep", value: 3.5 },
];
const tasks = [
  {
    name: "Aarav Mehta",
    detail: "Site visit · The Palm Residences",
    time: "10:30",
    icon: "house",
  },
  {
    name: "Priya Shah",
    detail: "Follow-up · 2 BHK in Bandra",
    time: "12:00",
    icon: "phone",
  },
  {
    name: "Rohan Kapoor",
    detail: "Booking discussion",
    time: "14:30",
    icon: "handshake",
  },
];
const properties = [
  {
    name: "The Palm Residences",
    detail: "Bandra West · 3 BHK",
    price: "₹2.4 Cr",
  },
  { name: "Parkside Living", detail: "Powai · 2 BHK", price: "₹1.6 Cr" },
  { name: "The Courtyard", detail: "Thane · 2 BHK", price: "₹95 L" },
];
</script>
