<template>
  <component
    :is="resolvedIcon"
    :size="size"
    :weight="weight"
    aria-hidden="true"
    focusable="false"
  />
</template>

<script setup>
import { computed } from 'vue';
import {
  PhArrowRight, PhArrowsClockwise, PhArrowsLeftRight, PhBank, PhBuildings, PhCalendarBlank,
  PhChalkboardTeacher, PhChartBar, PhCheck, PhCheckCircle, PhCircle, PhClipboardText,
  PhCreditCard, PhCurrencyInr, PhDownloadSimple, PhEnvelopeSimple,
  PhEye, PhFileText, PhFlame, PhGearSix, PhGraduationCap, PhHandshake, PhHouseLine, PhKey, PhLightbulb,
  PhLightning, PhLockKey, PhMagnifyingGlass, PhMapPin, PhNotePencil, PhPause, PhPlay,
  PhPenNib, PhPhone, PhPlus, PhPrinter, PhScroll, PhSquaresFour,
  PhShieldWarning, PhSignOut, PhSnowflake, PhStar, PhTarget, PhTrendUp,
  PhTrophy, PhUploadSimple, PhUser, PhUsersThree, PhWarning, PhX,
} from '@phosphor-icons/vue';

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 16 },
  weight: { type: String, default: 'regular' },
});

const icons = {
  add: PhPlus, agreements: PhScroll, arrowRight: PhArrowRight, bank: PhBank,
  buildings: PhBuildings, calendar: PhCalendarBlank, chalkboard: PhChalkboardTeacher, chart: PhChartBar,
  check: PhCheck, checkCircle: PhCheckCircle, clipboard: PhClipboardText, close: PhX,
  modules: PhSquaresFour, move: PhArrowsLeftRight, pause: PhPause, play: PhPlay,
  creditCard: PhCreditCard, currency: PhCurrencyInr,
  download: PhDownloadSimple, email: PhEnvelopeSimple, eye: PhEye, file: PhFileText,
  flame: PhFlame, settings: PhGearSix, graduation: PhGraduationCap, handshake: PhHandshake, house: PhHouseLine, key: PhKey,
  lightbulb: PhLightbulb, lightning: PhLightning, lock: PhLockKey,
  mapPin: PhMapPin, note: PhNotePencil, payment: PhCreditCard, pen: PhPenNib,
  phone: PhPhone, printer: PhPrinter, refresh: PhArrowsClockwise,
  search: PhMagnifyingGlass, shieldWarning: PhShieldWarning,
  signOut: PhSignOut, snowflake: PhSnowflake, star: PhStar,
  target: PhTarget, trend: PhTrendUp, trophy: PhTrophy,
  upload: PhUploadSimple, user: PhUser, users: PhUsersThree, warning: PhWarning,
};

const resolvedIcon = computed(() => icons[props.name] || PhCircle);
</script>
