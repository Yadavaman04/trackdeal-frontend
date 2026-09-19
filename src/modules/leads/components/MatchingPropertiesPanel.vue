<template>
  <div class="matching-panel section-panel p-5 space-y-5">
    <header class="matching-header">
      <div>
        <AppIcon name="house" :size="17" />
        <h2>Property matches</h2>
      </div>
      <p>A shortlist based on buyer preferences.</p>
    </header>
    <SegmentedControl
      v-model="activeFilter"
      label="Property filter"
      :options="[
        { value: 'matched', label: 'Matched', count: matchedItems.length },
        {
          value: 'all',
          label: 'All available',
          count: availablePortfolio.length,
        },
      ]"
    />

    <!-- Requirements Quick Tag Bar -->
    <div
      v-if="leadRequirementSummary.length > 0"
      class="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400"
    >
      <span class="text-slate-400 font-semibold uppercase text-[9px]"
        >Target:</span
      >
      <span
        v-for="(tag, idx) in leadRequirementSummary"
        :key="idx"
        class="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 font-medium"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="py-8 text-center text-slate-400 text-xs animate-pulse"
    >
      Scanning property portfolio for matches...
    </div>

    <!-- Properties Match List -->
    <div v-else class="space-y-3 max-h-[380px] overflow-y-auto pr-1">
      <div
        v-for="item in displayList"
        :key="item._id || item.id"
        class="bg-slate-50/80 dark:bg-slate-900/80 border border-default rounded-xl p-3 text-xs hover:border-primary/50 transition-all space-y-2"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <router-link
                :to="`/app/properties/${item._id || item.id}`"
                target="_blank"
                class="font-bold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors truncate block"
              >
                {{ item.title }}
              </router-link>
              <span
                v-if="item.matchScore"
                class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0"
              >
                {{ item.matchScore }}% Match
              </span>
            </div>

            <div
              class="flex items-center gap-2 text-[10px] text-slate-500 mt-1 flex-wrap"
            >
              <span
                v-if="item.type"
                class="capitalize font-semibold text-slate-700 dark:text-slate-300"
              >
                {{ item.type }}
              </span>
              <span v-if="item.bhk">• {{ item.bhk }} BHK</span>
              <span v-if="item.area?.carpet || item.area?.builtUp"
                >• {{ item.area.carpet || item.area.builtUp }}
                {{ item.area.unit || "sqft" }}</span
              >
              <span
                v-if="getLocationText(item)"
                class="inline-flex items-center gap-1"
                ><AppIcon name="mapPin" :size="11" />
                {{ getLocationText(item) }}</span
              >
            </div>
          </div>

          <div class="text-right shrink-0">
            <span class="text-xs font-bold text-primary font-heading block">
              {{ formatPrice(item.price) }}
            </span>
            <span
              class="text-[9px] font-bold px-1.5 py-0.5 rounded capitalize inline-block mt-1"
              :class="getStatusBadgeClass(item.status)"
            >
              {{ item.status || "available" }}
            </span>
          </div>
        </div>

        <!-- Action bar -->
        <div
          class="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px]"
        >
          <span
            v-if="item.project?.name"
            class="text-slate-400 truncate max-w-[160px]"
          >
            <AppIcon name="buildings" :size="12" class="inline" />
            {{ item.project.name }}
          </span>
          <span v-else class="text-slate-400">Independent Unit</span>

          <div class="flex items-center gap-1.5">
            <router-link
              :to="`/app/properties/${item._id || item.id}`"
              target="_blank"
              class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-0.5"
            >
              <span>View</span>
              <span>↗</span>
            </router-link>
            <button
              type="button"
              @click="handleReserve(item)"
              class="px-2.5 py-1 rounded bg-primary hover:bg-opacity-95 text-white font-bold transition-all shadow-2xs"
            >
              Reserve Unit
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="displayList.length === 0"
        class="matching-empty text-center text-text-muted text-xs space-y-3"
        style="border-color: hsl(var(--neutral-200))"
      >
        <AppIcon name="house" :size="26" class="mx-auto" weight="duotone" />
        <p class="font-medium text-slate-600 dark:text-slate-300">
          {{
            activeFilter === "matched"
              ? "No matches just yet."
              : "Your portfolio is ready for its first property."
          }}
        </p>
        <p
          v-if="activeFilter === 'matched' && availablePortfolio.length > 0"
          class="text-[10px] text-slate-400"
        >
          Switch to
          <a
            href="#"
            @click.prevent="activeFilter = 'all'"
            class="text-primary underline font-bold"
            >All Available ({{ availablePortfolio.length }})</a
          >
          to view all inventory.
        </p>
        <router-link v-if="availablePortfolio.length === 0" to="/app/properties" class="btn-sm btn-secondary mt-3">
          Explore portfolio <AppIcon name="arrowRight" :size="13" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import { useStore } from "vuex";
import { usePropertiesQuery } from "@/modules/properties/queries";

const props = defineProps({
  lead: { type: Object, default: null },
  requirements: { type: Object, default: () => ({}) },
  buyerRequirement: { type: Object, default: () => ({}) },
  budget: { type: Object, default: () => ({}) },
});

const store = useStore();
const activeFilter = ref("matched");

// Fetch live properties from user's property portfolio
const { data: propertiesData, isLoading } = usePropertiesQuery();

const allPortfolioProperties = computed(() => {
  const data = propertiesData.value?.data || propertiesData.value;
  return Array.isArray(data) ? data : [];
});

const availablePortfolio = computed(() => {
  return allPortfolioProperties.value.filter(
    (p) => p.status === "available" || !p.status,
  );
});

// Normalized Requirement Parameters
const targetPropertyTypes = computed(() => {
  const req =
    props.lead?.buyerRequirement ||
    props.buyerRequirement ||
    props.lead?.requirements ||
    props.requirements ||
    {};
  const types = req.propertyType || [];
  return Array.isArray(types) ? types.map((t) => String(t).toLowerCase()) : [];
});

const targetBhk = computed(() => {
  const req =
    props.lead?.buyerRequirement ||
    props.buyerRequirement ||
    props.lead?.requirements ||
    props.requirements ||
    {};
  const bhkArr = req.bhk || [];
  return Array.isArray(bhkArr)
    ? bhkArr
        .map((b) => parseInt(String(b).replace(/[^0-9]/g, "")))
        .filter(Boolean)
    : [];
});

const targetBudget = computed(() => {
  const b =
    props.lead?.budget ||
    props.budget ||
    props.lead?.requirements?.budget ||
    props.requirements?.budget ||
    {};
  return {
    min: b.minBudget || b.min || 0,
    max: b.maxBudget || b.max || 999999999,
  };
});

const targetLocation = computed(() => {
  const req =
    props.lead?.buyerRequirement ||
    props.buyerRequirement ||
    props.lead?.requirements ||
    props.requirements ||
    {};
  const loc =
    req.preferredLocation ||
    req.locality ||
    req.preferredProject ||
    (req.locations ? req.locations.join(" ") : "") ||
    "";
  return loc.toLowerCase().trim();
});

const leadRequirementSummary = computed(() => {
  const tags = [];
  if (targetPropertyTypes.value.length > 0) {
    tags.push(
      targetPropertyTypes.value
        .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
        .join(", "),
    );
  }
  if (targetBhk.value.length > 0) {
    tags.push(targetBhk.value.map((b) => `${b} BHK`).join(", "));
  }
  if (
    targetBudget.value.min > 0 ||
    (targetBudget.value.max > 0 && targetBudget.value.max < 999999999)
  ) {
    tags.push(
      formatBudgetRange(targetBudget.value.min, targetBudget.value.max),
    );
  }
  if (targetLocation.value) {
    tags.push(targetLocation.value);
  }
  return tags;
});

// Matched Properties against the live portfolio
const matchedItems = computed(() => {
  if (availablePortfolio.value.length === 0) return [];

  const types = targetPropertyTypes.value;
  const bhkList = targetBhk.value;
  const budget = targetBudget.value;
  const location = targetLocation.value;

  const results = [];

  for (const prop of availablePortfolio.value) {
    let score = 0;
    let maxScore = 0;

    // 1. Property Type match (Weight: 35)
    if (types.length > 0) {
      maxScore += 35;
      const propType = (prop.type || "").toLowerCase();
      if (types.includes(propType)) {
        score += 35;
      }
    }

    // 2. BHK match (Weight: 30)
    if (bhkList.length > 0) {
      maxScore += 30;
      const propBhk = prop.bhk ? parseInt(prop.bhk) : null;
      if (propBhk && bhkList.includes(propBhk)) {
        score += 30;
      }
    }

    // 3. Budget match (Weight: 25)
    if (budget.min > 0 || (budget.max > 0 && budget.max < 999999999)) {
      maxScore += 25;
      const price = prop.price || 0;
      const minWithTolerance = budget.min * 0.85;
      const maxWithTolerance = budget.max * 1.15;
      if (price >= minWithTolerance && price <= maxWithTolerance) {
        score += 25;
      }
    }

    // 4. Location / Project match (Weight: 10)
    if (location) {
      maxScore += 10;
      const propLoc =
        `${prop.location?.area || ""} ${prop.location?.city || ""} ${prop.location?.address || ""} ${prop.title || ""} ${prop.project?.name || ""}`.toLowerCase();
      if (
        propLoc.includes(location) ||
        location.split(" ").some((w) => w.length > 2 && propLoc.includes(w))
      ) {
        score += 10;
      }
    }

    const calculatedMatchPercent =
      maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;

    // If criteria specified, require at least 50% match score
    if (maxScore === 0 || calculatedMatchPercent >= 50) {
      results.push({
        ...prop,
        matchScore: maxScore > 0 ? calculatedMatchPercent : null,
      });
    }
  }

  // Sort by highest match score first, then price
  return results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
});

const displayList = computed(() => {
  if (activeFilter.value === "matched") {
    return matchedItems.value;
  }
  return availablePortfolio.value;
});

const getLocationText = (item) => {
  if (!item.location) return "";
  if (typeof item.location === "string") return item.location;
  return (
    [item.location.area, item.location.city].filter(Boolean).join(", ") ||
    item.location.address ||
    ""
  );
};

const formatPrice = (val) => {
  if (!val && val !== 0) return "Price On Request";
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Number(val).toLocaleString("en-IN")}`;
};

const formatBudgetRange = (min, max) => {
  const fmt = (v) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
    return `₹${v.toLocaleString("en-IN")}`;
  };
  if (min > 0 && max < 999999999) return `${fmt(min)} - ${fmt(max)}`;
  if (min > 0) return `Min ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "available":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200";
    case "reserved":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200";
    case "sold":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200";
    default:
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200";
  }
};

const handleReserve = (item) => {
  store.dispatch("notifications/triggerToast", {
    message: `Reserving unit '${item.title}' initiated for this customer.`,
    type: "success",
  });
};
</script>

<style scoped>
.matching-header > div {
  display: flex;
  align-items: center;
  gap: 9px;
  color: hsl(var(--neutral-400));
}
.matching-header h2 {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--neutral-900));
  letter-spacing: -0.02em;
}
.matching-header p {
  font-size: 11px;
  color: hsl(var(--neutral-500));
  margin-top: 8px;
}
.matching-empty {
  padding: 32px 14px;
  border-radius: 10px;
  background: hsl(var(--neutral-25));
}
</style>
