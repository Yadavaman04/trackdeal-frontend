<template>
  <!-- Overlay -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[200] flex items-start justify-end bg-black/40 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="relative h-full w-full max-w-xl bg-surface shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-default bg-gradient-to-r from-primary/5 to-accent/5 flex items-center justify-between shrink-0">
          <div>
            <h2 class="font-heading text-sm font-bold text-slate-800 dark:text-slate-100">
              {{ step === 'type' ? '+ Add Activity' : activityConfig[selectedType]?.label || 'Add Activity' }}
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ lead?.firstName }} {{ lead?.lastName || '' }} • {{ step === 'type' ? 'Select activity type' : 'Fill in the details' }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="step === 'form'"
              @click="step = 'type'"
              class="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded border border-default hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            >
              ← Back
            </button>
            <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
              ✕
            </button>
          </div>
        </div>

        <!-- Step 1: Type Selector -->
        <div v-if="step === 'type'" class="flex-1 overflow-y-auto p-5">
          <div class="grid grid-cols-3 gap-2.5">
            <button
              v-for="(config, type) in activityConfig"
              :key="type"
              @click="selectType(type)"
              class="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-default hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 group"
            >
              <span class="text-2xl">{{ config.icon }}</span>
              <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight group-hover:text-primary transition-colors">{{ config.label }}</span>
            </button>
          </div>
        </div>

        <!-- Step 2: Dynamic Form -->
        <div v-else class="flex-1 overflow-y-auto p-5 space-y-4">
          <!-- Error message -->
          <div v-if="errorMsg" class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs text-red-700 dark:text-red-300">
            ⚠️ {{ errorMsg }}
          </div>

          <!-- PROPERTY / SITE VISIT FORM -->
          <template v-if="selectedType === 'property_visit' || selectedType === 'site_visit'">
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2 space-y-1">
                <label class="form-label">Visit Date *</label>
                <input v-model="form.visitDate" type="date" class="form-input w-full" required />
              </div>
              <div class="space-y-1">
                <label class="form-label">Visit Time</label>
                <input v-model="form.visitTime" type="time" class="form-input w-full" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Visit Status</label>
                <select v-model="form.visitStatus" class="form-input w-full">
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
            </div>
            <div class="space-y-1">
              <label class="form-label">Properties Shown (select multiple)</label>
              <div v-if="propertiesLoading" class="text-xs text-slate-400 py-2">Loading properties...</div>
              <div v-else class="border border-default rounded-lg max-h-40 overflow-y-auto divide-y divide-default">
                <label
                  v-for="prop in propertiesList"
                  :key="prop._id"
                  class="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs"
                >
                  <input type="checkbox" :value="prop._id" v-model="form.propertiesShown" class="rounded border-default text-primary" />
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ prop.title }}</span>
                  <span class="text-slate-400 ml-auto">{{ prop.unitNumber }}</span>
                </label>
                <div v-if="propertiesList.length === 0" class="px-3 py-3 text-xs text-slate-400">No properties found</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="form-label">Customer Attended?</label>
                <select v-model="form.customerAttended" class="form-input w-full">
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="form-label">Interest Level</label>
                <select v-model="form.interestLevel" class="form-input w-full">
                  <option value="">Not Assessed</option>
                  <option value="very_interested">Very Interested 🔥</option>
                  <option value="interested">Interested ✅</option>
                  <option value="maybe">Maybe 🤔</option>
                  <option value="not_interested">Not Interested ❌</option>
                </select>
              </div>
            </div>
            <div class="space-y-1">
              <label class="form-label">Customer Feedback</label>
              <textarea v-model="form.customerFeedback" rows="2" class="form-input w-full resize-none" placeholder="What did the customer say?"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="form-label">Likes</label>
                <input v-model="form.likes" type="text" class="form-input w-full" placeholder="What they liked..." />
              </div>
              <div class="space-y-1">
                <label class="form-label">Dislikes</label>
                <input v-model="form.dislikes" type="text" class="form-input w-full" placeholder="What they disliked..." />
              </div>
            </div>
            <div class="space-y-1">
              <label class="form-label">Objections</label>
              <input v-model="form.objections" type="text" class="form-input w-full" placeholder="Customer objections or concerns..." />
            </div>
            <div class="space-y-1">
              <label class="form-label">Competitor Property Mentioned</label>
              <input v-model="form.competitorPropertyMentioned" type="text" class="form-input w-full" placeholder="e.g. XYZ Heights 3 BHK" />
            </div>
            <div class="space-y-1">
              <label class="form-label">Next Action</label>
              <input v-model="form.nextAction" type="text" class="form-input w-full" placeholder="What is the next step?" />
            </div>
            <div class="space-y-1">
              <label class="form-label">Follow-up Date</label>
              <input v-model="form.followUpDate" type="datetime-local" class="form-input w-full" />
            </div>
            <div class="space-y-1">
              <label class="form-label">Internal Notes</label>
              <textarea v-model="form.internalNotes" rows="2" class="form-input w-full resize-none" placeholder="Private notes for the team..."></textarea>
            </div>
          </template>

          <!-- CALL FORM -->
          <template v-else-if="selectedType === 'call'">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="form-label">Call Date *</label>
                <input v-model="form.callDate" type="date" class="form-input w-full" required />
              </div>
              <div class="space-y-1">
                <label class="form-label">Call Time</label>
                <input v-model="form.callTime" type="time" class="form-input w-full" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Call Type</label>
                <select v-model="form.callType" class="form-input w-full">
                  <option value="outgoing">Outgoing</option>
                  <option value="incoming">Incoming</option>
                  <option value="missed">Missed</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="form-label">Call Status</label>
                <select v-model="form.callStatus" class="form-input w-full">
                  <option value="connected">Connected</option>
                  <option value="no_answer">No Answer</option>
                  <option value="busy">Busy</option>
                  <option value="switched_off">Switched Off</option>
                  <option value="callback_requested">Call Back Requested</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="form-label">Duration (minutes)</label>
                <input v-model="form.callDuration" type="number" min="0" class="form-input w-full" placeholder="5" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Interest Level</label>
                <select v-model="form.interestLevel" class="form-input w-full">
                  <option value="">—</option>
                  <option value="very_interested">Very Interested 🔥</option>
                  <option value="interested">Interested ✅</option>
                  <option value="maybe">Maybe 🤔</option>
                  <option value="not_interested">Not Interested ❌</option>
                </select>
              </div>
            </div>
            <div class="space-y-1">
              <label class="form-label">Call Summary *</label>
              <textarea v-model="form.description" rows="3" class="form-input w-full resize-none" placeholder="What was discussed?" required></textarea>
            </div>
            <div class="space-y-1">
              <label class="form-label">Customer Response</label>
              <input v-model="form.customerResponse" type="text" class="form-input w-full" placeholder="How did the customer respond?" />
            </div>
            <div class="space-y-1">
              <label class="form-label">Next Follow-up Date & Time</label>
              <input v-model="form.followUpDate" type="datetime-local" class="form-input w-full" />
            </div>
          </template>

          <!-- WHATSAPP FORM -->
          <template v-else-if="selectedType === 'whatsapp'">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="form-label">Date *</label>
                <input v-model="form.callDate" type="date" class="form-input w-full" required />
              </div>
              <div class="space-y-1">
                <label class="form-label">Time</label>
                <input v-model="form.callTime" type="time" class="form-input w-full" />
              </div>
              <div class="col-span-2 space-y-1">
                <label class="form-label">Message Type</label>
                <select v-model="form.messageType" class="form-input w-full">
                  <option value="text">Text Message</option>
                  <option value="property">Property Details</option>
                  <option value="project">Project Brochure</option>
                  <option value="price">Price Sheet</option>
                  <option value="location">Location/Map</option>
                  <option value="payment">Payment Details</option>
                  <option value="reminder">Reminder</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div class="space-y-1">
              <label class="form-label">Message Summary *</label>
              <textarea v-model="form.description" rows="3" class="form-input w-full resize-none" placeholder="What was shared/discussed?" required></textarea>
            </div>
            <div class="space-y-1">
              <label class="form-label">Customer Response</label>
              <input v-model="form.customerResponse" type="text" class="form-input w-full" placeholder="How did the customer reply?" />
            </div>
            <div class="space-y-1">
              <label class="form-label">Next Follow-up</label>
              <input v-model="form.followUpDate" type="datetime-local" class="form-input w-full" />
            </div>
          </template>

          <!-- MEETING FORM -->
          <template v-else-if="selectedType === 'meeting'">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="form-label">Meeting Date *</label>
                <input v-model="form.callDate" type="date" class="form-input w-full" required />
              </div>
              <div class="space-y-1">
                <label class="form-label">Meeting Time</label>
                <input v-model="form.callTime" type="time" class="form-input w-full" />
              </div>
              <div class="col-span-2 space-y-1">
                <label class="form-label">Meeting Type</label>
                <select v-model="form.meetingType" class="form-input w-full">
                  <option value="office">Office Meeting</option>
                  <option value="site">Site Meeting</option>
                  <option value="customer_home">Customer Home</option>
                  <option value="online">Online / Video Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div class="space-y-1">
              <label class="form-label">Meeting Purpose</label>
              <input v-model="form.meetingPurpose" type="text" class="form-input w-full" placeholder="e.g. Budget discussion, Project presentation..." />
            </div>
            <div class="space-y-1">
              <label class="form-label">Discussion Summary *</label>
              <textarea v-model="form.description" rows="3" class="form-input w-full resize-none" placeholder="What was discussed?" required></textarea>
            </div>
            <div class="space-y-1">
              <label class="form-label">Customer Concerns / Objections</label>
              <textarea v-model="form.objections" rows="2" class="form-input w-full resize-none" placeholder="Customer concerns raised..."></textarea>
            </div>
            <div class="space-y-1">
              <label class="form-label">Next Action</label>
              <input v-model="form.nextAction" type="text" class="form-input w-full" placeholder="What is the next step?" />
            </div>
            <div class="space-y-1">
              <label class="form-label">Next Follow-up</label>
              <input v-model="form.followUpDate" type="datetime-local" class="form-input w-full" />
            </div>
          </template>

          <!-- QUOTATION FORM -->
          <template v-else-if="selectedType === 'quotation'">
            <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-300">
              💡 A new quotation record will be created — previous quotations are never overwritten.
            </div>
            <div class="space-y-1">
              <label class="form-label">Property (optional)</label>
              <select v-model="form.propertyId" class="form-input w-full">
                <option value="">— Select Property —</option>
                <option v-for="p in propertiesList" :key="p._id" :value="p._id">{{ p.title }} {{ p.unitNumber ? `(${p.unitNumber})` : '' }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="form-label">List Price (₹)</label>
                <input v-model="form.listPrice" type="number" class="form-input w-full" placeholder="8500000" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Quoted Price (₹) *</label>
                <input v-model="form.quotedPrice" type="number" class="form-input w-full" placeholder="8200000" required />
              </div>
              <div class="space-y-1">
                <label class="form-label">Price / Sq Ft (₹)</label>
                <input v-model="form.pricePerSqFt" type="number" class="form-input w-full" placeholder="9500" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Configuration</label>
                <input v-model="form.configuration" type="text" class="form-input w-full" placeholder="3 BHK, 1250 sqft" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Discount (%)</label>
                <input v-model="form.discount" type="number" min="0" max="100" class="form-input w-full" placeholder="3" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Discount Amount (₹)</label>
                <input v-model="form.discountAmount" type="number" class="form-input w-full" placeholder="0" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Parking (₹)</label>
                <input v-model="form.parkingCharges" type="number" class="form-input w-full" placeholder="0" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Floor Rise (₹)</label>
                <input v-model="form.floorRise" type="number" class="form-input w-full" placeholder="0" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Maintenance (₹)</label>
                <input v-model="form.maintenance" type="number" class="form-input w-full" placeholder="0" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Other Charges (₹)</label>
                <input v-model="form.otherCharges" type="number" class="form-input w-full" placeholder="0" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Stamp Duty Est. (₹)</label>
                <input v-model="form.stampDutyEstimate" type="number" class="form-input w-full" placeholder="0" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Registration Est. (₹)</label>
                <input v-model="form.registrationEstimate" type="number" class="form-input w-full" placeholder="0" />
              </div>
            </div>
            <!-- Total computed -->
            <div class="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex justify-between items-center">
              <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Estimated Cost</span>
              <span class="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                ₹{{ formatAmount(computedTotal) }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="form-label">Offer Valid Until</label>
                <input v-model="form.offerValidUntil" type="date" class="form-input w-full" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Customer Interest</label>
                <select v-model="form.customerInterest" class="form-input w-full">
                  <option value="">—</option>
                  <option value="very_interested">Very Interested</option>
                  <option value="interested">Interested</option>
                  <option value="maybe">Maybe</option>
                  <option value="not_interested">Not Interested</option>
                </select>
              </div>
            </div>
            <div class="space-y-1">
              <label class="form-label">Payment Plan</label>
              <input v-model="form.paymentPlan" type="text" class="form-input w-full" placeholder="e.g. Construction Linked Plan, Down Payment..." />
            </div>
            <div class="space-y-1">
              <label class="form-label">Customer Feedback</label>
              <textarea v-model="form.customerFeedback" rows="2" class="form-input w-full resize-none" placeholder="What was the customer's response?"></textarea>
            </div>
            <div class="space-y-1">
              <label class="form-label">Notes</label>
              <textarea v-model="form.notes" rows="2" class="form-input w-full resize-none" placeholder="Additional notes..."></textarea>
            </div>
          </template>

          <!-- FOLLOW-UP FORM -->
          <template v-else-if="selectedType === 'follow_up'">
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2 space-y-1">
                <label class="form-label">Follow-up Date & Time *</label>
                <input v-model="form.followUpDate" type="datetime-local" class="form-input w-full" required />
              </div>
              <div class="space-y-1">
                <label class="form-label">Follow-up Type</label>
                <select v-model="form.followUpType" class="form-input w-full">
                  <option value="call">Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="meeting">Meeting</option>
                  <option value="visit">Site Visit</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="form-label">Reminder Before</label>
                <select v-model="form.reminderBefore" class="form-input w-full">
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="1440">1 day</option>
                </select>
              </div>
            </div>
            <div class="space-y-1">
              <label class="form-label">Notes / Purpose *</label>
              <textarea v-model="form.description" rows="3" class="form-input w-full resize-none" placeholder="What should be done in this follow-up?" required></textarea>
            </div>
          </template>

          <!-- NOTE FORM -->
          <template v-else-if="selectedType === 'note'">
            <div class="space-y-1">
              <label class="form-label">Note *</label>
              <textarea v-model="form.description" rows="5" class="form-input w-full resize-none" placeholder="Write your note here..." required></textarea>
            </div>
            <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
              <input type="checkbox" v-model="form.isPrivate" class="rounded border-default text-primary" />
              🔒 Private note (only visible to your team)
            </label>
          </template>

          <!-- GENERIC / OTHER ACTIVITY FORM -->
          <template v-else>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="form-label">Date *</label>
                <input v-model="form.callDate" type="date" class="form-input w-full" required />
              </div>
              <div class="space-y-1">
                <label class="form-label">Time</label>
                <input v-model="form.callTime" type="time" class="form-input w-full" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="form-label">Summary / Notes *</label>
              <textarea v-model="form.description" rows="4" class="form-input w-full resize-none" placeholder="Describe the activity..." required></textarea>
            </div>
            <div class="space-y-1">
              <label class="form-label">Customer Response</label>
              <input v-model="form.customerResponse" type="text" class="form-input w-full" placeholder="How did the customer respond?" />
            </div>
            <div class="space-y-1">
              <label class="form-label">Next Follow-up</label>
              <input v-model="form.followUpDate" type="datetime-local" class="form-input w-full" />
            </div>
          </template>
        </div>

        <!-- Footer: Save Button -->
        <div v-if="step === 'form'" class="px-5 py-3 border-t border-default bg-surface/80 backdrop-blur-sm shrink-0 flex gap-3">
          <button
            @click="$emit('close')"
            class="flex-1 btn btn-secondary btn-sm text-sm"
          >
            Cancel
          </button>
          <button
            @click="saveActivity"
            :disabled="saving"
            class="flex-1 btn btn-primary btn-sm text-sm font-bold"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>✓ Save {{ activityConfig[selectedType]?.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import apiClient from '@/api/client';
import { createVisit, createQuotation, logLeadActivity, addLeadFollowUp, addLeadNote } from '../api/endpoints';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  lead: { type: Object, default: null },
});

const emit = defineEmits(['close', 'saved']);

const step = ref('type');
const selectedType = ref('');
const saving = ref(false);
const errorMsg = ref('');
const propertiesList = ref([]);
const propertiesLoading = ref(false);

const activityConfig = {
  property_visit: { label: 'Property Visit', icon: '🏠' },
  site_visit: { label: 'Site Visit', icon: '🏗️' },
  call: { label: 'Phone Call', icon: '📞' },
  whatsapp: { label: 'WhatsApp', icon: '💬' },
  meeting: { label: 'Meeting', icon: '🤝' },
  email: { label: 'Email', icon: '✉️' },
  follow_up: { label: 'Follow-up', icon: '📅' },
  property_shared: { label: 'Property Shared', icon: '📤' },
  project_presented: { label: 'Project Presented', icon: '🏢' },
  quotation: { label: 'Quotation / Rate', icon: '💰' },
  negotiation: { label: 'Negotiation', icon: '🤜' },
  booking_discussion: { label: 'Booking Discussion', icon: '📋' },
  payment_discussion: { label: 'Payment Discussion', icon: '💳' },
  loan_discussion: { label: 'Loan Discussion', icon: '🏦' },
  registration_discussion: { label: 'Registration', icon: '📝' },
  note: { label: 'Note', icon: '📓' },
  reminder: { label: 'Reminder', icon: '🔔' },
  other: { label: 'Other Activity', icon: '📌' },
};

// Form state
const form = ref({});

function resetForm() {
  form.value = {
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '',
    visitStatus: 'scheduled',
    propertiesShown: [],
    projectsShown: [],
    customerAttended: false,
    interestLevel: '',
    customerFeedback: '',
    likes: '',
    dislikes: '',
    objections: '',
    competitorPropertyMentioned: '',
    nextAction: '',
    followUpDate: '',
    internalNotes: '',
    description: '',
    callDate: new Date().toISOString().split('T')[0],
    callTime: '',
    callType: 'outgoing',
    callStatus: 'connected',
    callDuration: '',
    customerResponse: '',
    messageType: 'text',
    meetingType: 'office',
    meetingPurpose: '',
    followUpType: 'call',
    reminderBefore: '30',
    isPrivate: false,
    propertyId: '',
    listPrice: '',
    quotedPrice: '',
    pricePerSqFt: '',
    configuration: '',
    discount: '',
    discountAmount: '',
    parkingCharges: '',
    floorRise: '',
    maintenance: '',
    otherCharges: '',
    stampDutyEstimate: '',
    registrationEstimate: '',
    offerValidUntil: '',
    customerInterest: '',
    paymentPlan: '',
    notes: '',
  };
}

const computedTotal = computed(() => {
  return (Number(form.value.quotedPrice) || 0)
    + (Number(form.value.otherCharges) || 0)
    + (Number(form.value.parkingCharges) || 0)
    + (Number(form.value.floorRise) || 0)
    + (Number(form.value.maintenance) || 0)
    + (Number(form.value.stampDutyEstimate) || 0)
    + (Number(form.value.registrationEstimate) || 0);
});

function formatAmount(n) {
  if (!n) return '0';
  return Number(n).toLocaleString('en-IN');
}

function selectType(type) {
  selectedType.value = type;
  resetForm();
  step.value = 'form';
  errorMsg.value = '';
}

async function loadProperties() {
  if (propertiesList.value.length > 0) return;
  propertiesLoading.value = true;
  try {
    const res = await apiClient.get('/properties', { params: { limit: 100 } });
    propertiesList.value = res.data?.data || [];
  } catch {
    propertiesList.value = [];
  } finally {
    propertiesLoading.value = false;
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    step.value = 'type';
    selectedType.value = '';
    resetForm();
    errorMsg.value = '';
  }
});

watch(step, (val) => {
  if (val === 'form') {
    const needsProperties = ['property_visit', 'site_visit', 'quotation', 'property_shared'].includes(selectedType.value);
    if (needsProperties) loadProperties();
  }
});

const leadId = computed(() => props.lead?._id || props.lead?.id);

async function saveActivity() {
  saving.value = true;
  errorMsg.value = '';
  try {
    if (selectedType.value === 'property_visit' || selectedType.value === 'site_visit') {
      if (!form.value.visitDate) throw new Error('Visit date is required');
      await createVisit(leadId.value, {
        visitDate: form.value.visitDate,
        visitTime: form.value.visitTime,
        visitStatus: form.value.visitStatus,
        propertiesShown: form.value.propertiesShown,
        customerAttended: form.value.customerAttended,
        interestLevel: form.value.interestLevel,
        customerFeedback: form.value.customerFeedback,
        likes: form.value.likes,
        dislikes: form.value.dislikes,
        objections: form.value.objections,
        competitorPropertyMentioned: form.value.competitorPropertyMentioned,
        nextAction: form.value.nextAction,
        followUpDate: form.value.followUpDate || null,
        internalNotes: form.value.internalNotes,
      });
    } else if (selectedType.value === 'quotation') {
      if (!form.value.quotedPrice) throw new Error('Quoted price is required');
      await createQuotation(leadId.value, {
        propertyId: form.value.propertyId || null,
        listPrice: Number(form.value.listPrice) || null,
        quotedPrice: Number(form.value.quotedPrice),
        pricePerSqFt: Number(form.value.pricePerSqFt) || null,
        configuration: form.value.configuration,
        discount: Number(form.value.discount) || 0,
        discountAmount: Number(form.value.discountAmount) || 0,
        parkingCharges: Number(form.value.parkingCharges) || 0,
        floorRise: Number(form.value.floorRise) || 0,
        maintenance: Number(form.value.maintenance) || 0,
        otherCharges: Number(form.value.otherCharges) || 0,
        stampDutyEstimate: Number(form.value.stampDutyEstimate) || 0,
        registrationEstimate: Number(form.value.registrationEstimate) || 0,
        totalEstimatedCost: computedTotal.value,
        offerValidUntil: form.value.offerValidUntil || null,
        paymentPlan: form.value.paymentPlan,
        customerInterest: form.value.customerInterest,
        customerFeedback: form.value.customerFeedback,
        notes: form.value.notes,
      });
    } else if (selectedType.value === 'follow_up') {
      if (!form.value.followUpDate) throw new Error('Follow-up date is required');
      await addLeadFollowUp({
        id: leadId.value,
        scheduledAt: form.value.followUpDate,
        type: form.value.followUpType || 'call',
        notes: form.value.description,
      });
    } else if (selectedType.value === 'note') {
      if (!form.value.description) throw new Error('Note content is required');
      const { addLeadNote: addNote } = await import('../api/endpoints');
      await addNote({ id: leadId.value, content: form.value.description, isPrivate: form.value.isPrivate });
    } else {
      // Generic activity log for all other types
      if (!form.value.description) throw new Error('Please provide a summary/description');
      const metadata = {
        callDate: form.value.callDate,
        callTime: form.value.callTime,
        callType: form.value.callType,
        callStatus: form.value.callStatus,
        callDuration: form.value.callDuration,
        interestLevel: form.value.interestLevel,
        customerResponse: form.value.customerResponse,
        messageType: form.value.messageType,
        meetingType: form.value.meetingType,
        meetingPurpose: form.value.meetingPurpose,
        nextAction: form.value.nextAction,
        objections: form.value.objections,
      };
      await logLeadActivity({ id: leadId.value, type: selectedType.value, description: form.value.description, metadata });

      // Also schedule follow-up if followUpDate is set
      if (form.value.followUpDate) {
        await addLeadFollowUp({ id: leadId.value, scheduledAt: form.value.followUpDate, type: 'call', notes: `Follow-up after ${selectedType.value}` });
      }
    }

    emit('saved');
    emit('close');
  } catch (err) {
    errorMsg.value = err?.response?.data?.error?.message || err.message || 'Failed to save activity';
  } finally {
    saving.value = false;
  }
}
</script>
