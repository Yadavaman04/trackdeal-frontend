<template>
  <header class="lead-summary">
    <nav class="lead-breadcrumb" aria-label="Breadcrumb">
      <router-link to="/app/leads">Leads</router-link
      ><span aria-hidden="true">/</span
      ><span aria-current="page">{{ fullName }}</span>
    </nav>
    <div class="lead-summary-main">
      <div class="lead-identity">
        <div class="lead-avatar">{{ initials }}</div>
        <div class="min-w-0">
          <div class="lead-name-row">
            <h1>{{ fullName }}</h1>
            <LeadStageBadge :stage="lead.status" /><span
              v-if="lead.qualification?.leadTemperature === 'hot'"
              class="lead-intent"
              ><AppIcon name="flame" :size="13" /> High intent</span
            >
          </div>
          <p class="lead-subtitle">
            <span>{{ propertyTypes }}</span
            ><span v-if="location"
              ><AppIcon name="mapPin" :size="13" />{{ location }}</span
            >
          </p>
        </div>
      </div>
      <div class="lead-actions">
        <a
          v-if="!lead.isTransferred && lead.mobile"
          :href="`tel:${lead.mobile}`"
          class="btn-md btn-secondary"
          ><AppIcon name="phone" :size="16" />Call</a
        ><a
          v-if="!lead.isTransferred && lead.mobile"
          :href="`https://wa.me/${String(lead.mobile).replace(/[^0-9]/g, '')}`"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-md btn-secondary"
          ><AppIcon name="note" :size="16" />WhatsApp</a
        ><button
          type="button"
          class="btn-md btn-primary"
          @click="$emit('activity')"
        >
          <AppIcon name="add" :size="16" />Add activity</button
        ><button
          v-if="lead.status !== 'won'"
          type="button"
          class="btn-md btn-secondary"
          @click="$emit('deal')"
        >
          <AppIcon name="handshake" :size="16" />Create deal
        </button>
      </div>
    </div>
    <div class="lead-summary-facts">
      <div>
        <span>Budget</span><strong>{{ budgetLabel }}</strong>
      </div>
      <div>
        <span>Preferred configuration</span><strong>{{ configuration }}</strong>
      </div>
      <div>
        <span>Assigned to</span><strong>{{ owner }}</strong>
      </div>
      <div>
        <span>Lead source</span><strong>{{ humanize(lead.source) }}</strong>
      </div>
    </div>
    <div class="lead-journey">
      <div class="journey-heading">
        <span>Lead journey</span
        ><span>{{
          stageIndex >= 0
            ? `${stageIndex + 1} of ${stages.length} stages`
            : humanize(lead.status)
        }}</span>
      </div>
      <ol aria-label="Lead progress">
        <li
          v-for="(stage, index) in stages"
          :key="stage"
          :class="{
            complete: index < stageIndex || lead.status === 'won',
            current: index === stageIndex,
          }"
          :aria-current="index === stageIndex ? 'step' : undefined"
        >
          <span class="journey-dot"
            ><AppIcon
              v-if="index < stageIndex || lead.status === 'won'"
              name="check"
              :size="11"
            /><template v-else>{{ index + 1 }}</template></span
          ><span>{{ stage }}</span>
        </li>
      </ol>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import LeadStageBadge from "./LeadStageBadge.vue";
const props = defineProps({ lead: { type: Object, required: true } });
defineEmits(["activity", "deal"]);
const humanize = (value) =>
  value
    ? String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Not specified";
const joinValues = (value) => (Array.isArray(value) ? value.join(", ") : value);
const requirement = computed(
  () => props.lead.buyerRequirement || props.lead.requirements || {},
);
const fullName = computed(() =>
  [props.lead.firstName, props.lead.lastName].filter(Boolean).join(" "),
);
const initials = computed(
  () => `${props.lead.firstName?.[0] || ""}${props.lead.lastName?.[0] || ""}`,
);
const propertyTypes = computed(() =>
  humanize(joinValues(requirement.value.propertyType)),
);
const location = computed(
  () =>
    requirement.value.preferredLocation ||
    requirement.value.locality ||
    joinValues(requirement.value.locations),
);
const configuration = computed(
  () => joinValues(requirement.value.bhk) || "Not specified",
);
const owner = computed(
  () =>
    [props.lead.assignedTo?.firstName, props.lead.assignedTo?.lastName]
      .filter(Boolean)
      .join(" ") || "Unassigned",
);
const budgetLabel = computed(() => {
  const budget = props.lead.budget || props.lead.requirements?.budget || {};
  const min = Number(
    props.lead.budgetMin || budget.minBudget || budget.min || 0,
  );
  const max = Number(
    props.lead.budgetMax || budget.maxBudget || budget.max || 0,
  );
  const format = (n) =>
    n >= 10000000
      ? `₹${+(n / 10000000).toFixed(2)} Cr`
      : n >= 100000
        ? `₹${+(n / 100000).toFixed(2)} L`
        : `₹${n.toLocaleString("en-IN")}`;
  return min && max
    ? `${format(min)} – ${format(max)}`
    : max
      ? `Up to ${format(max)}`
      : min
        ? `From ${format(min)}`
        : "Not specified";
});
const stages = [
  "New",
  "Contacted",
  "Qualified",
  "Property shared",
  "Site visit",
  "Negotiation",
  "Booking",
  "Closed",
];
const stageIndex = computed(
  () =>
    ({
      new: 0,
      contacted: 1,
      qualified: 2,
      property_shared: 3,
      site_visit_scheduled: 4,
      site_visit_completed: 4,
      negotiation: 5,
      booked: 6,
      won: 7,
    })[props.lead.status] ?? -1,
);
</script>

<style scoped>
.lead-summary {
  padding-bottom: 4px;
}
.lead-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: hsl(var(--neutral-400));
  margin-bottom: 28px;
}
.lead-breadcrumb a:hover {
  color: hsl(var(--accent-600));
}
.lead-breadcrumb [aria-current] {
  color: hsl(var(--neutral-700));
}
.lead-summary-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.lead-identity {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}
.lead-avatar {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border: 1px solid hsl(var(--accent-200) / 0.6);
  background: hsl(var(--accent-50));
  color: hsl(var(--accent-600));
  border-radius: 16px;
  font-size: 18px;
  font-weight: 600;
  text-transform: uppercase;
}
.lead-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
h1 {
  color: hsl(var(--neutral-900));
  font-size: 25px;
  line-height: 1.3;
  font-weight: 650;
  letter-spacing: -0.04em;
  overflow-wrap: anywhere;
}
.lead-intent {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: hsl(var(--danger-text));
}
.lead-subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: hsl(var(--neutral-500));
  margin-top: 7px;
}
.lead-subtitle span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.lead-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lead-actions .btn-md {
  font-size: 12px;
  padding-inline: 13px;
  white-space: nowrap;
}
.lead-summary-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 27px;
  padding: 22px 0;
  border-block: 1px solid hsl(var(--neutral-100));
}
.lead-summary-facts > div {
  padding: 0 24px;
  border-right: 1px solid hsl(var(--neutral-100));
}
.lead-summary-facts > div:first-child {
  padding-left: 0;
}
.lead-summary-facts > div:last-child {
  border: 0;
}
.lead-summary-facts span {
  display: block;
  font-size: 11px;
  color: hsl(var(--neutral-500));
}
.lead-summary-facts strong {
  display: block;
  font-size: 13px;
  font-weight: 550;
  color: hsl(var(--neutral-900));
  margin-top: 7px;
  overflow-wrap: anywhere;
}
.lead-journey {
  padding: 22px 0 10px;
}
.journey-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: hsl(var(--neutral-500));
  margin-bottom: 17px;
}
.journey-heading > span:first-child {
  font-weight: 600;
  color: hsl(var(--neutral-700));
}
ol {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}
li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: hsl(var(--neutral-400));
  position: relative;
}
.journey-dot {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 100%;
  border: 1px solid hsl(var(--neutral-200));
  font-size: 9px;
}
li.complete {
  color: hsl(var(--neutral-500));
}
li.complete .journey-dot {
  border-color: hsl(var(--accent-200));
  color: hsl(var(--accent-600));
  background: hsl(var(--accent-50));
}
li.current {
  color: hsl(var(--accent-600));
  font-weight: 650;
}
li.current .journey-dot {
  color: #fff;
  background: hsl(var(--accent-600));
  border-color: hsl(var(--accent-600));
  box-shadow: 0 0 0 3px hsl(var(--accent-100));
}
@media (max-width: 1250px) {
  .lead-summary-main {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }
}
@media (max-width: 767px) {
  .lead-breadcrumb {
    margin-bottom: 22px;
  }
  h1 {
    font-size: 22px;
  }
  .lead-avatar {
    width: 48px;
    height: 48px;
  }
  .lead-actions {
    width: 100%;
  }
  .lead-actions > * {
    flex: 1;
    min-height: 44px;
  }
  .lead-summary-facts {
    grid-template-columns: 1fr 1fr;
    gap: 22px 16px;
  }
  .lead-summary-facts > div {
    padding: 0;
    border: 0;
  }
  ol {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px 6px;
  }
  li {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    font-size: 10px;
  }
}
</style>
