<template>
  <div class="space-y-6">
    <div v-for="(group, gIdx) in groupedEvents" :key="group.day || gIdx" class="space-y-3">
      <!-- Date header -->
      <div class="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider pl-8">
        {{ group.day }}
      </div>

      <div class="relative pl-8 space-y-4">
        <!-- Vertical connector line across the group -->
        <span 
          class="absolute top-2 left-4 -ml-px h-full w-0.5 bg-neutral-100 dark:bg-neutral-800" 
          aria-hidden="true"
        ></span>

        <div 
          v-for="(event, eventIdx) in group.items" 
          :key="event.id || eventIdx"
          class="relative flex space-x-3 items-start"
        >
          <!-- Bullet Icon Container -->
          <div class="absolute -left-8 flex items-center justify-center">
            <span class="h-8 w-8 rounded-full bg-neutral-25 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 z-10 shadow-sm">
              <component :is="getIcon(event.type || event.icon)" class="w-4 h-4" />
            </span>
          </div>

          <!-- Content bubble -->
          <div class="flex-1 min-w-0 bg-surface dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-3 shadow-xs">
            <div class="flex items-start justify-between space-x-4">
              <div>
                <p class="text-caption text-neutral-800 dark:text-neutral-300">
                  <span class="font-medium text-neutral-900 dark:text-neutral-50">
                    {{ event.user || 'System' }}
                  </span>
                  {{ event.content }}
                  <span v-if="event.target" class="font-medium text-accent-600 dark:text-accent-400">
                    {{ event.target }}
                  </span>
                </p>
                <!-- Optional details field -->
                <p v-if="event.details" class="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 font-mono">
                  {{ event.details }}
                </p>
              </div>
              <div class="text-right text-[10px] whitespace-nowrap text-neutral-400 font-medium pt-0.5">
                <time :datetime="event.datetime">{{ event.time }}</time>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  PhNote, 
  PhPhone, 
  PhEnvelope, 
  PhCalendar, 
  PhCheckSquare, 
  PhUser, 
  PhClock,
  PhQuestion,
  PhHouse,
  PhHandshake,
  PhCurrencyInr,
  PhPlusCircle,
  PhFileText
} from '@phosphor-icons/vue';

const props = defineProps({
  events: { type: Array, required: true }
});

const groupedEvents = computed(() => {
  const groups = {};
  props.events.forEach(event => {
    // Determine the day label
    let dayLabel = 'Other';
    if (event.datetime) {
      try {
        const dateObj = new Date(event.datetime);
        const todayObj = new Date();
        
        const isToday = todayObj.toDateString() === dateObj.toDateString();
        
        const yesterdayObj = new Date();
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
        const isYesterday = yesterdayObj.toDateString() === dateObj.toDateString();

        if (isToday) {
          dayLabel = 'Today';
        } else if (isYesterday) {
          dayLabel = 'Yesterday';
        } else {
          dayLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      } catch (e) {
        dayLabel = event.date || 'Earlier';
      }
    } else {
      dayLabel = event.date || 'Earlier';
    }

    if (!groups[dayLabel]) {
      groups[dayLabel] = [];
    }
    groups[dayLabel].push(event);
  });

  // Convert to array of { day, items }
  return Object.keys(groups).map(day => ({
    day,
    items: groups[day]
  }));
});

const getIcon = (type) => {
  if (!type) return PhNote;
  const t = type.toLowerCase();
  if (t.includes('call') || t.includes('phone')) return PhPhone;
  if (t.includes('email') || t.includes('mail')) return PhEnvelope;
  if (t.includes('meeting') || t.includes('schedule') || t.includes('visit') || t.includes('calendar')) return PhCalendar;
  if (t.includes('task') || t.includes('todo') || t.includes('check')) return PhCheckSquare;
  if (t.includes('user') || t.includes('assign') || t.includes('owner')) return PhUser;
  if (t.includes('deal') || t.includes('contract') || t.includes('handshake')) return PhHandshake;
  if (t.includes('pay') || t.includes('collect') || t.includes('invoice') || t.includes('commission') || t.includes('money')) return PhCurrencyInr;
  if (t.includes('create') || t.includes('add') || t.includes('new')) return PhPlusCircle;
  if (t.includes('property') || t.includes('house') || t.includes('flat')) return PhHouse;
  if (t.includes('status') || t.includes('stage') || t.includes('update')) return PhFileText;
  return PhNote;
};
</script>
