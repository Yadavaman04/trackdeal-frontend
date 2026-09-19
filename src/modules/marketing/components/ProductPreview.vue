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
          <AppIcon name="graduation" :size="20" /> <strong>TrackDeal</strong>
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
          <div><strong>Jordan Davis</strong><small>Institute owner</small></div>
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
            <p>Your institute, at a glance</p>
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
                <h4>Admissions pipeline</h4>
                <span>76 inquiries</span>
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
        <template v-else-if="active === 'classes'">
          <p class="preview-description">
            A considered batch for every student.
          </p>
          <div class="preview-property-grid">
            <article v-for="(batch, index) in classes" :key="batch.name">
              <div
                class="property-art"
                :class="`property-art-${index}`"
                aria-hidden="true"
              >
                <div></div>
                <div></div>
                <div></div>
              </div>
              <span class="property-status">{{ batch.status }}</span>
              <h4>{{ batch.name }}</h4>
              <p>{{ batch.detail }}</p>
              <strong>{{ batch.seats }}</strong>
            </article>
          </div>
        </template>
        <template v-else>
          <div class="preview-metrics">
            <div>
              <span>Enrolled students</span><strong>248</strong
              ><small>Across 12 active batches</small>
            </div>
            <div>
              <span>Fees collected</span><strong>₹14.2 L</strong
              ><small>This term</small>
            </div>
            <div>
              <span>Pending follow-ups</span><strong>18</strong
              ><small>Inquiries to close</small>
            </div>
          </div>
          <section class="preview-chart revenue-chart">
            <div class="preview-panel-title">
              <h4>Monthly enrollments</h4>
              <span>New students</span>
            </div>
            <PipelineChart
              label="Illustrative monthly enrollments"
              :items="enrollments"
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
  { value: "classes", label: "Classes", icon: "chalkboard" },
  { value: "enrollments", label: "Enrollments", icon: "graduation" },
];
const currentTitle = computed(
  () =>
    ({
      pipeline: "A little clarity. A lot of possibility.",
      classes: "Find their next class.",
      enrollments: "Good counselling. Real enrollments.",
    })[active.value],
);
const metrics = [
  {
    label: "Active inquiries",
    value: "76",
    detail: "From first call to confirmed seat",
  },
  { label: "Open students", value: "248", detail: "Learning with your team" },
  { label: "Demo classes", value: "12", detail: "Scheduled this week" },
];
const pipeline = [
  { label: "New", value: 28 },
  { label: "Counselling", value: 22 },
  { label: "Demo class", value: 16 },
  { label: "Enrolled", value: 10 },
];
const enrollments = [
  { label: "Apr", value: 14 },
  { label: "May", value: 18 },
  { label: "Jun", value: 21 },
  { label: "Jul", value: 25 },
  { label: "Aug", value: 29 },
  { label: "Sep", value: 35 },
];
const tasks = [
  {
    name: "Aarav Mehta",
    detail: "Demo class · Foundation Batch",
    time: "10:30",
    icon: "chalkboard",
  },
  {
    name: "Priya Shah",
    detail: "Follow-up · Class 10 Science",
    time: "12:00",
    icon: "phone",
  },
  {
    name: "Rohan Kapoor",
    detail: "Admission discussion",
    time: "14:30",
    icon: "graduation",
  },
];
const classes = [
  {
    name: "Foundation Batch",
    detail: "Grade 10 · Mon–Fri 6–8 pm",
    seats: "12 seats left",
    status: "Open",
  },
  {
    name: "JEE Intensive",
    detail: "Grade 12 · Weekend",
    seats: "4 seats left",
    status: "Filling",
  },
  {
    name: "Spoken English",
    detail: "Adults · Evening",
    seats: "Seats open",
    status: "Open",
  },
];
</script>
