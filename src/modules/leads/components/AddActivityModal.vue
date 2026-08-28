<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[200] flex items-start justify-end bg-black/50 backdrop-blur-xs"
      @click.self="$emit('close')"
    >
      <div class="relative h-full w-full max-w-2xl bg-surface shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-default">
        <!-- HEADER -->
        <div class="px-6 py-4 border-b border-default bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div
              v-if="step === 'form' && selectedConfig"
              class="w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs"
              :class="selectedConfig.colorClass"
            >
              <component :is="selectedConfig.icon" :size="18" weight="bold" />
            </div>
            <div>
              <h2 class="font-heading text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {{ isEditing ? 'Edit ' + (selectedConfig?.label || 'Activity') : (step === 'type' ? 'Select Activity Type' : selectedConfig?.label || 'Add Activity') }}
                <span v-if="isEditing" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  Editing
                </span>
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ lead?.firstName }} {{ lead?.lastName || '' }} • {{ step === 'type' ? 'Choose an interaction to record' : 'Fill in activity details' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="step === 'form' && !isEditing"
              @click="step = 'type'"
              class="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-default hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              ← Back
            </button>
            <button
              @click="$emit('close')"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- STEP 1: ACTIVITY SELECTION GRID (3 Cols Desktop, 2 Tablet, 1 Mobile) -->
        <div v-if="step === 'type'" class="flex-1 overflow-y-auto p-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="(config, typeKey) in activityConfig"
              :key="typeKey"
              @click="selectType(typeKey)"
              class="flex flex-col items-start p-3.5 rounded-xl border border-default hover:border-primary/50 bg-surface hover:bg-slate-50 dark:hover:bg-slate-850 hover:shadow-sm transition-all text-left group"
            >
              <div class="flex items-center justify-between w-full mb-2">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs group-hover:scale-105 transition-transform" :class="config.colorClass">
                  <component :is="config.icon" :size="16" weight="bold" />
                </div>
                <span class="text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors">→</span>
              </div>
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                {{ config.label }}
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {{ config.description }}
              </span>
            </button>
          </div>
        </div>

        <!-- STEP 2: DEDICATED ACTIVITY FORM -->
        <div v-else class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- Error alert -->
          <div v-if="errorMsg" class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <span class="text-base leading-none">⚠️</span>
            <div class="flex-1">{{ errorMsg }}</div>
          </div>

          <!-- SECTION 1: ACTIVITY DETAILS -->
          <div class="bg-surface rounded-xl border border-default p-4 space-y-4 shadow-2xs">
            <div class="flex items-center justify-between border-b border-default pb-2.5">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>📋</span> Activity Details
              </h3>
              <span class="text-[11px] font-medium text-slate-400">Fields marked * are required</span>
            </div>

            <!-- Date and Time Row -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="form-label">Activity Date *</label>
                <input v-model="form.activityDate" type="date" class="form-input w-full text-xs" required />
              </div>
              <div class="space-y-1">
                <label class="form-label">Activity Time</label>
                <input v-model="form.activityTime" type="time" class="form-input w-full text-xs" />
              </div>
            </div>

            <!-- TYPE-SPECIFIC FIELDS -->

            <!-- 1. PROPERTY VISIT -->
            <template v-if="selectedType === 'property_visit'">
              <div class="space-y-1">
                <label class="form-label">Visit Status</label>
                <select v-model="form.visitStatus" class="form-input w-full text-xs">
                  <option value="scheduled">Scheduled 📅</option>
                  <option value="completed">Completed ✅</option>
                  <option value="cancelled">Cancelled ❌</option>
                  <option value="rescheduled">Rescheduled 🔄</option>
                  <option value="no_show">No Show 🚫</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="form-label">Properties Shown (Select from portfolio)</label>
                <div v-if="propertiesLoading" class="text-xs text-slate-400 py-1.5">Loading properties portfolio...</div>
                <div v-else class="border border-default rounded-lg max-h-36 overflow-y-auto divide-y divide-default bg-slate-50/50 dark:bg-slate-900/50">
                  <label
                    v-for="prop in propertiesList"
                    :key="prop._id"
                    class="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs"
                  >
                    <input type="checkbox" :value="prop._id" v-model="form.propertiesShown" class="rounded border-default text-primary" />
                    <span class="font-medium text-slate-700 dark:text-slate-300">{{ prop.title }}</span>
                    <span class="text-slate-400 ml-auto">{{ prop.unitNumber || prop.propertyType }}</span>
                  </label>
                  <div v-if="propertiesList.length === 0" class="px-3 py-2 text-xs text-slate-400">No properties in portfolio</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Customer Attended?</label>
                  <select v-model="form.customerAttended" class="form-input w-full text-xs">
                    <option :value="true">Yes</option>
                    <option :value="false">No</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="form-label">Interest Level</label>
                  <select v-model="form.interestLevel" class="form-input w-full text-xs">
                    <option value="">Not Assessed</option>
                    <option value="very_interested">Very Interested 🔥</option>
                    <option value="interested">Interested ✅</option>
                    <option value="maybe">Maybe 🤔</option>
                    <option value="not_interested">Not Interested ❌</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Likes</label>
                  <input v-model="form.likes" type="text" class="form-input w-full text-xs" placeholder="What customer liked..." />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Dislikes</label>
                  <input v-model="form.dislikes" type="text" class="form-input w-full text-xs" placeholder="What customer disliked..." />
                </div>
              </div>
              <div class="space-y-1">
                <label class="form-label">Objections / Competitor Mentioned</label>
                <input v-model="form.objections" type="text" class="form-input w-full text-xs" placeholder="Objections or competitor property..." />
              </div>
            </template>

            <!-- 2. SITE VISIT -->
            <template v-else-if="selectedType === 'site_visit'">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Project Name</label>
                  <input v-model="form.projectName" type="text" class="form-input w-full text-xs" placeholder="e.g. Godrej River Royale" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Site Representative</label>
                  <input v-model="form.siteRepresentative" type="text" class="form-input w-full text-xs" placeholder="Representative name" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Site Location</label>
                  <input v-model="form.siteLocation" type="text" class="form-input w-full text-xs" placeholder="e.g. Baner, Pune" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Visit Status</label>
                  <select v-model="form.visitStatus" class="form-input w-full text-xs">
                    <option value="scheduled">Scheduled 📅</option>
                    <option value="completed">Completed ✅</option>
                    <option value="cancelled">Cancelled ❌</option>
                    <option value="rescheduled">Rescheduled 🔄</option>
                    <option value="no_show">No Show 🚫</option>
                  </select>
                </div>
              </div>
            </template>

            <!-- 3. PHONE CALL -->
            <template v-else-if="selectedType === 'call' || selectedType === 'phone_call'">
              <div class="grid grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Call Direction</label>
                  <select v-model="form.callType" class="form-input w-full text-xs">
                    <option value="outgoing">Outgoing 📞</option>
                    <option value="incoming">Incoming 📲</option>
                    <option value="missed">Missed 📵</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="form-label">Call Status</label>
                  <select v-model="form.callStatus" class="form-input w-full text-xs">
                    <option value="connected">Connected ✅</option>
                    <option value="no_answer">No Answer ❌</option>
                    <option value="busy">Busy ⏳</option>
                    <option value="switched_off">Switched Off 📴</option>
                    <option value="callback_requested">Call Back Requested 🔄</option>
                    <option value="invalid_number">Invalid Number ⚠️</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="form-label">Duration (mins)</label>
                  <input v-model="form.callDuration" type="number" min="0" class="form-input w-full text-xs" placeholder="5" />
                </div>
              </div>
            </template>

            <!-- 4. WHATSAPP -->
            <template v-else-if="selectedType === 'whatsapp'">
              <div class="space-y-1">
                <label class="form-label">Communication Type</label>
                <select v-model="form.communicationType" class="form-input w-full text-xs">
                  <option value="message_sent">Message Sent 📤</option>
                  <option value="message_received">Message Received 📥</option>
                  <option value="brochure_shared">Brochure Shared 📑</option>
                  <option value="property_shared">Property Shared 🏠</option>
                  <option value="followup_message">Follow-up Message 💬</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </template>

            <!-- 5. MEETING -->
            <template v-else-if="selectedType === 'meeting'">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Meeting Type</label>
                  <select v-model="form.meetingType" class="form-input w-full text-xs">
                    <option value="office">Office Meeting 🏢</option>
                    <option value="customer_location">Customer Location 📍</option>
                    <option value="video_meeting">Video Meeting 📹</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="form-label">Location / Meeting Link</label>
                  <input v-model="form.location" type="text" class="form-input w-full text-xs" placeholder="Google Meet link or Office" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Participants</label>
                  <input v-model="form.participants" type="text" class="form-input w-full text-xs" placeholder="e.g. Sales Head, Buyer, Spouse" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Outcome</label>
                  <input v-model="form.outcome" type="text" class="form-input w-full text-xs" placeholder="Key meeting outcome" />
                </div>
              </div>
            </template>

            <!-- 6. EMAIL -->
            <template v-else-if="selectedType === 'email'">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Email Type</label>
                  <select v-model="form.emailType" class="form-input w-full text-xs">
                    <option value="property_details">Property Details 🏠</option>
                    <option value="quotation">Quotation 💰</option>
                    <option value="followup">Follow-up 📅</option>
                    <option value="documentation">Documentation 📄</option>
                    <option value="general">General ✉️</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="form-label">Email Subject</label>
                  <input v-model="form.subject" type="text" class="form-input w-full text-xs" placeholder="Subject of the email" />
                </div>
              </div>
            </template>

            <!-- 7. FOLLOW-UP -->
            <template v-else-if="selectedType === 'follow_up'">
              <div class="grid grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Follow-up Type</label>
                  <select v-model="form.followUpType" class="form-input w-full text-xs">
                    <option value="call">Phone Call 📞</option>
                    <option value="whatsapp">WhatsApp 💬</option>
                    <option value="email">Email ✉️</option>
                    <option value="meeting">Meeting 🤝</option>
                    <option value="site_visit">Site Visit 🏗️</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="form-label">Priority</label>
                  <select v-model="form.priority" class="form-input w-full text-xs">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High 🔥</option>
                    <option value="urgent">Urgent ⚡</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="form-label">Status</label>
                  <select v-model="form.status" class="form-input w-full text-xs">
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </template>

            <!-- 8. PROPERTY SHARED -->
            <template v-else-if="selectedType === 'property_shared'">
              <div class="space-y-1">
                <label class="form-label">Select Property from Portfolio</label>
                <select v-model="form.propertyId" @change="onPropertySelect" class="form-input w-full text-xs">
                  <option value="">-- Choose from portfolio (Optional) --</option>
                  <option v-for="prop in propertiesList" :key="prop._id" :value="prop._id">
                    {{ prop.title }} • {{ prop.unitNumber || prop.configuration }} (₹{{ formatAmount(prop.price) }})
                  </option>
                </select>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Project / Property Name</label>
                  <input v-model="form.propertyName" type="text" class="form-input w-full text-xs" placeholder="e.g. Godrej River Royale" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Unit / Configuration</label>
                  <input v-model="form.configuration" type="text" class="form-input w-full text-xs" placeholder="e.g. 3 BHK" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Quoted Price (₹)</label>
                  <input v-model="form.quotedPrice" type="number" class="form-input w-full text-xs" placeholder="14500000" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="form-label">Sharing Method</label>
                <select v-model="form.sharingMethod" class="form-input w-full text-xs">
                  <option value="whatsapp">WhatsApp 💬</option>
                  <option value="email">Email ✉️</option>
                  <option value="sms">SMS 📱</option>
                  <option value="meeting">In-Person Meeting 🤝</option>
                  <option value="call">Phone Call 📞</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </template>

            <!-- 9. PROJECT PRESENTED -->
            <template v-else-if="selectedType === 'project_presented'">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Project Name</label>
                  <input v-model="form.projectName" type="text" class="form-input w-full text-xs" placeholder="e.g. Swarajya Residency" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Developer / Builder</label>
                  <input v-model="form.developerName" type="text" class="form-input w-full text-xs" placeholder="Builder / Developer" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Configuration & Price Range</label>
                  <input v-model="form.configuration" type="text" class="form-input w-full text-xs" placeholder="e.g. 2 & 3 BHK, ₹85L - 1.2Cr" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Presentation Method</label>
                  <select v-model="form.presentationMethod" class="form-input w-full text-xs">
                    <option value="brochure">Digital Brochure / PDF</option>
                    <option value="video">Project Video / 3D Walkthrough</option>
                    <option value="presentation">Slide Deck / PPT</option>
                    <option value="physical_sample">Sample Flat Visit</option>
                  </select>
                </div>
              </div>
            </template>

            <!-- 10. QUOTATION / RATE -->
            <template v-else-if="selectedType === 'quotation'">
              <div class="space-y-1">
                <label class="form-label">Select Property (Optional)</label>
                <select v-model="form.propertyId" @change="onPropertySelect" class="form-input w-full text-xs">
                  <option value="">-- Choose Property --</option>
                  <option v-for="prop in propertiesList" :key="prop._id" :value="prop._id">
                    {{ prop.title }} (₹{{ formatAmount(prop.price) }})
                  </option>
                </select>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Quoted Price (₹) *</label>
                  <input v-model="form.quotedPrice" type="number" class="form-input w-full text-xs font-bold text-primary" placeholder="8500000" required />
                </div>
                <div class="space-y-1">
                  <label class="form-label">List Price (₹)</label>
                  <input v-model="form.listPrice" type="number" class="form-input w-full text-xs" placeholder="9000000" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Discount (%)</label>
                  <input v-model="form.discount" type="number" step="0.1" class="form-input w-full text-xs" placeholder="5" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Offer Valid Until</label>
                  <input v-model="form.offerValidUntil" type="date" class="form-input w-full text-xs" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Total Estimated Cost (₹)</label>
                  <div class="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs font-bold text-primary flex items-center justify-between">
                    <span>Computed Total:</span>
                    <span>₹{{ formatAmount(computedTotal) }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 11. NEGOTIATION -->
            <template v-else-if="selectedType === 'negotiation'">
              <div class="grid grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Quoted Price (₹)</label>
                  <input v-model="form.quotedPrice" type="number" class="form-input w-full text-xs" placeholder="9000000" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Customer Offer (₹)</label>
                  <input v-model="form.customerExpectedPrice" type="number" class="form-input w-full text-xs text-amber-600 font-bold" placeholder="8200000" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Negotiated Price (₹)</label>
                  <input v-model="form.negotiatedPrice" type="number" class="form-input w-full text-xs text-emerald-600 font-bold" placeholder="8500000" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="form-label">Negotiation Status</label>
                <select v-model="form.negotiationStatus" class="form-input w-full text-xs">
                  <option value="started">Started 🏁</option>
                  <option value="in_progress">In Progress ⏳</option>
                  <option value="customer_considering">Customer Considering 🤔</option>
                  <option value="final_offer_sent">Final Offer Sent 📩</option>
                  <option value="accepted">Accepted 🎉</option>
                  <option value="rejected">Rejected ❌</option>
                </select>
              </div>
            </template>

            <!-- 12. BOOKING DISCUSSION -->
            <template v-else-if="selectedType === 'booking_discussion'">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Unit / Flat No.</label>
                  <input v-model="form.unitNumber" type="text" class="form-input w-full text-xs" placeholder="e.g. Unit 502" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Booking Amount (₹)</label>
                  <input v-model="form.bookingAmount" type="number" class="form-input w-full text-xs font-bold text-emerald-600" placeholder="100000" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Expected Booking Date</label>
                  <input v-model="form.expectedBookingDate" type="date" class="form-input w-full text-xs" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Discussion Status</label>
                  <select v-model="form.discussionStatus" class="form-input w-full text-xs">
                    <option value="token_discussed">Token Amount Discussed</option>
                    <option value="token_received">Token Received</option>
                    <option value="agreement_pending">Agreement Pending</option>
                    <option value="confirmed">Booking Confirmed</option>
                  </select>
                </div>
              </div>
            </template>

            <!-- 13. PAYMENT DISCUSSION -->
            <template v-else-if="selectedType === 'payment_discussion'">
              <div class="grid grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Payment Type</label>
                  <select v-model="form.paymentType" class="form-input w-full text-xs">
                    <option value="booking_amount">Booking Token</option>
                    <option value="down_payment">Down Payment</option>
                    <option value="installment">Installment / Slab</option>
                    <option value="balance_payment">Balance Payment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="form-label">Expected Amount (₹)</label>
                  <input v-model="form.expectedAmount" type="number" class="form-input w-full text-xs font-bold text-emerald-600" placeholder="500000" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Expected Date</label>
                  <input v-model="form.expectedPaymentDate" type="date" class="form-input w-full text-xs" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="form-label">Payment Status</label>
                <select v-model="form.paymentStatus" class="form-input w-full text-xs">
                  <option value="pending">Pending ⏳</option>
                  <option value="received">Received ✅</option>
                  <option value="partially_paid">Partially Paid 🟡</option>
                  <option value="delayed">Delayed ⚠️</option>
                </select>
              </div>
            </template>

            <!-- 14. LOAN DISCUSSION -->
            <template v-else-if="selectedType === 'loan_discussion'">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Loan Required?</label>
                  <select v-model="form.loanRequired" class="form-input w-full text-xs">
                    <option :value="true">Yes</option>
                    <option :value="false">No</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="form-label">Required Loan Amount (₹)</label>
                  <input v-model="form.loanAmount" type="number" class="form-input w-full text-xs font-bold" placeholder="5000000" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Preferred Bank / Partner</label>
                  <input v-model="form.preferredBank" type="text" class="form-input w-full text-xs" placeholder="e.g. HDFC, SBI, ICICI" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Loan Status</label>
                  <select v-model="form.loanStatus" class="form-input w-full text-xs">
                    <option value="not_started">Not Started</option>
                    <option value="docs_collected">Documents Collected</option>
                    <option value="applied">Applied / In Review</option>
                    <option value="sanctioned">Sanctioned 🎉</option>
                    <option value="disbursed">Disbursed 💰</option>
                    <option value="rejected">Rejected ❌</option>
                  </select>
                </div>
              </div>
            </template>

            <!-- 15. REGISTRATION -->
            <template v-else-if="selectedType === 'registration' || selectedType === 'registration_discussion'">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Registration Date</label>
                  <input v-model="form.registrationDate" type="date" class="form-input w-full text-xs" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Registration Amount (₹)</label>
                  <input v-model="form.registrationAmount" type="number" class="form-input w-full text-xs font-bold" placeholder="450000" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="form-label">Registration Status</label>
                <select v-model="form.registrationStatus" class="form-input w-full text-xs">
                  <option value="planned">Planned 🗓️</option>
                  <option value="docs_pending">Documents Pending 📑</option>
                  <option value="scheduled">Scheduled 📅</option>
                  <option value="completed">Completed ✅</option>
                  <option value="cancelled">Cancelled ❌</option>
                </select>
              </div>
            </template>

            <!-- 16. REMINDER -->
            <template v-else-if="selectedType === 'reminder'">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="form-label">Reminder Title *</label>
                  <input v-model="form.reminderTitle" type="text" class="form-input w-full text-xs font-bold" placeholder="e.g. Call customer regarding sanction letter" required />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Priority</label>
                  <select v-model="form.priority" class="form-input w-full text-xs">
                    <option value="medium">Medium</option>
                    <option value="high">High 🔥</option>
                    <option value="urgent">Urgent ⚡</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </template>

            <!-- 17. NOTE -->
            <template v-else-if="selectedType === 'note'">
              <div class="space-y-1">
                <label class="form-label">Note Title (Optional)</label>
                <input v-model="form.noteTitle" type="text" class="form-input w-full text-xs" placeholder="e.g. Client Background Note" />
              </div>
              <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
                <input type="checkbox" v-model="form.isPrivate" class="rounded border-default text-primary" />
                🔒 Private note (only visible to your internal team)
              </label>
            </template>

            <!-- 18. OTHER ACTIVITY -->
            <template v-else-if="selectedType === 'other'">
              <div class="space-y-1">
                <label class="form-label">Activity Name *</label>
                <input v-model="form.activityName" type="text" class="form-input w-full text-xs font-bold" placeholder="e.g. Site Cab Arranged / Document Collected" required />
              </div>
            </template>
          </div>

          <!-- SECTION 2: SUMMARY & CUSTOMER RESPONSE -->
          <div class="bg-surface rounded-xl border border-default p-4 space-y-4 shadow-2xs">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-default pb-2.5 flex items-center gap-1.5">
              <span>✍️</span> Summary & Notes
            </h3>
            <div class="space-y-1">
              <label class="form-label">Summary / Interaction Notes *</label>
              <textarea
                v-model="form.summary"
                rows="3"
                class="form-input w-full text-xs resize-y min-h-[75px]"
                placeholder="Key details, conversation summary, or remarks..."
                required
              ></textarea>
            </div>
            <div v-if="selectedType !== 'note' && selectedType !== 'reminder'" class="space-y-1">
              <label class="form-label">Customer Response / Feedback</label>
              <textarea
                v-model="form.customerResponse"
                rows="2"
                class="form-input w-full text-xs resize-y min-h-[55px]"
                placeholder="How did the customer respond or what was their feedback?"
              ></textarea>
            </div>
          </div>

          <!-- SECTION 3: NEXT FOLLOW-UP -->
          <div class="bg-surface rounded-xl border border-default p-4 space-y-3 shadow-2xs">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-default pb-2 flex items-center gap-1.5">
              <span>📅</span> Next Follow-up (Auto-schedules in Calendar/Tasks)
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="form-label">Next Follow-up Date & Time</label>
                <input v-model="form.nextFollowUpAt" type="datetime-local" class="form-input w-full text-xs" />
              </div>
              <div class="space-y-1">
                <label class="form-label">Follow-up Type</label>
                <select v-model="form.nextFollowUpType" class="form-input w-full text-xs">
                  <option value="call">Phone Call 📞</option>
                  <option value="whatsapp">WhatsApp 💬</option>
                  <option value="meeting">Meeting 🤝</option>
                  <option value="site_visit">Site Visit 🏗️</option>
                  <option value="email">Email ✉️</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div v-if="step === 'form'" class="px-6 py-4 border-t border-default bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-3 shrink-0">
          <button
            @click="$emit('close')"
            class="btn btn-secondary btn-sm text-xs px-4"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            :disabled="saving"
            class="btn btn-primary btn-sm text-xs font-bold px-5 flex items-center gap-2 shadow-sm"
          >
            <span v-if="saving" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>{{ isEditing ? 'Update Activity' : `✓ Save ${selectedConfig?.label || 'Activity'}` }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import apiClient from '@/api/client';
import {
  logLeadActivity,
  updateLeadActivity,
  createVisit,
  updateVisit,
  createQuotation,
  updateQuotation,
  addLeadNote,
  updateLeadNote,
  addLeadFollowUp,
  updateLeadFollowUp,
} from '../api/endpoints';

import {
  PhPhone,
  PhChatCircleDots,
  PhUsers,
  PhHouseLine,
  PhBuildings,
  PhEnvelopeSimple,
  PhCalendarCheck,
  PhShareNetwork,
  PhProjectorScreenChart,
  PhReceipt,
  PhScales,
  PhBookmarkSimple,
  PhCreditCard,
  PhBank,
  PhStamp,
  PhBell,
  PhNotePencil,
  PhSparkle,
} from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  lead: { type: Object, default: null },
  editItem: { type: Object, default: null },
});

const emit = defineEmits(['close', 'saved']);

const step = ref('type');
const selectedType = ref('');
const saving = ref(false);
const errorMsg = ref('');
const propertiesList = ref([]);
const propertiesLoading = ref(false);

const isEditing = computed(() => !!props.editItem);

const activityConfig = {
  phone_call: {
    label: 'Phone Call',
    icon: PhPhone,
    description: 'Log incoming or outgoing calls',
    colorClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: PhChatCircleDots,
    description: 'Message, brochure, or details sent',
    colorClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  meeting: {
    label: 'Meeting',
    icon: PhUsers,
    description: 'Office, video, or in-person meetup',
    colorClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  },
  property_visit: {
    label: 'Property Visit',
    icon: PhHouseLine,
    description: 'Record customer visit to properties',
    colorClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  site_visit: {
    label: 'Site Visit',
    icon: PhBuildings,
    description: 'Project site visit with representative',
    colorClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  },
  property_shared: {
    label: 'Property Shared',
    icon: PhShareNetwork,
    description: 'Share unit details & pricing',
    colorClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  },
  project_presented: {
    label: 'Project Presented',
    icon: PhProjectorScreenChart,
    description: 'Present project / developer details',
    colorClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  },
  quotation: {
    label: 'Quotation / Rate',
    icon: PhReceipt,
    description: 'Track price quotation & discounts',
    colorClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  },
  negotiation: {
    label: 'Negotiation',
    icon: PhScales,
    description: 'Price discussion & counter offers',
    colorClass: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  },
  booking_discussion: {
    label: 'Booking Discussion',
    icon: PhBookmarkSimple,
    description: 'Token, unit allocation & date',
    colorClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  },
  payment_discussion: {
    label: 'Payment Discussion',
    icon: PhCreditCard,
    description: 'Down payment & installments',
    colorClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  loan_discussion: {
    label: 'Loan Discussion',
    icon: PhBank,
    description: 'Bank eligibility, sanction & status',
    colorClass: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  },
  registration: {
    label: 'Registration',
    icon: PhStamp,
    description: 'Registration date, slot & status',
    colorClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  },
  follow_up: {
    label: 'Follow-up',
    icon: PhCalendarCheck,
    description: 'Schedule next customer touchpoint',
    colorClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  email: {
    label: 'Email',
    icon: PhEnvelopeSimple,
    description: 'Email communication & proposals',
    colorClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  reminder: {
    label: 'Reminder',
    icon: PhBell,
    description: 'Set a task or alarm for team',
    colorClass: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  },
  note: {
    label: 'Internal Note',
    icon: PhNotePencil,
    description: 'Quick internal remark / log',
    colorClass: 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
  },
  other: {
    label: 'Other Activity',
    icon: PhSparkle,
    description: 'Custom activity or interaction',
    colorClass: 'bg-neutral-50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800',
  },
};

const selectedConfig = computed(() => activityConfig[selectedType.value] || null);

// Form state
const form = ref({});

function getDefaultTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // "HH:mm"
}

function getDefaultDate() {
  return new Date().toISOString().split('T')[0];
}

function resetForm() {
  form.value = {
    activityDate: getDefaultDate(),
    activityTime: getDefaultTime(),
    summary: '',
    customerResponse: '',
    nextFollowUpAt: '',
    nextFollowUpType: 'call',
    status: 'completed',
    // Property Visit
    visitStatus: 'scheduled',
    propertiesShown: [],
    customerAttended: false,
    interestLevel: '',
    likes: '',
    dislikes: '',
    objections: '',
    // Site Visit
    projectName: '',
    siteLocation: '',
    siteRepresentative: '',
    // Phone Call
    callType: 'outgoing',
    callStatus: 'connected',
    callDuration: '',
    // WhatsApp
    communicationType: 'message_sent',
    // Meeting
    meetingType: 'office',
    location: '',
    participants: '',
    outcome: '',
    // Email
    emailType: 'property_details',
    subject: '',
    // Follow-up
    followUpType: 'call',
    priority: 'medium',
    // Property Shared
    propertyId: '',
    propertyName: '',
    configuration: '',
    quotedPrice: '',
    sharingMethod: 'whatsapp',
    // Project Presented
    developerName: '',
    presentationMethod: 'brochure',
    // Quotation
    listPrice: '',
    discount: '',
    discountAmount: '',
    offerValidUntil: '',
    // Negotiation
    customerExpectedPrice: '',
    negotiatedPrice: '',
    negotiationStatus: 'in_progress',
    // Booking
    unitNumber: '',
    bookingAmount: '',
    expectedBookingDate: '',
    discussionStatus: 'token_discussed',
    // Payment
    paymentType: 'booking_amount',
    expectedAmount: '',
    expectedPaymentDate: '',
    paymentStatus: 'pending',
    // Loan
    loanRequired: true,
    loanAmount: '',
    preferredBank: '',
    loanStatus: 'not_started',
    // Registration
    registrationDate: '',
    registrationAmount: '',
    registrationStatus: 'planned',
    // Reminder
    reminderTitle: '',
    // Note
    noteTitle: '',
    isPrivate: false,
    // Other
    activityName: '',
  };
}

const computedTotal = computed(() => {
  const qp = Number(form.value.quotedPrice) || 0;
  const disc = Number(form.value.discount) || 0;
  if (disc > 0 && qp > 0) {
    return qp - (qp * disc / 100);
  }
  return qp;
});

function formatAmount(n) {
  if (!n) return '0';
  return Number(n).toLocaleString('en-IN');
}

function selectType(typeKey) {
  selectedType.value = typeKey;
  resetForm();
  step.value = 'form';
  errorMsg.value = '';
}

function onPropertySelect() {
  const p = propertiesList.value.find(item => item._id === form.value.propertyId);
  if (p) {
    form.value.propertyName = p.title || '';
    form.value.configuration = p.configuration || p.propertyType || '';
    form.value.quotedPrice = p.price || '';
    form.value.listPrice = p.price || '';
  }
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

// Prefill form when editing
function prefillEditData(item) {
  resetForm();
  if (!item) return;

  const rawType = item.type || item._type || 'other';
  selectedType.value = rawType === 'call' ? 'phone_call' : rawType;
  step.value = 'form';

  form.value.summary = item.summary || item.description || item.content || item.notes || '';
  form.value.customerResponse = item.customerResponse || item.customerFeedback || '';
  form.value.activityDate = item.activityDate ? new Date(item.activityDate).toISOString().split('T')[0] : (item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : getDefaultDate());
  form.value.activityTime = item.activityTime || getDefaultTime();
  form.value.status = item.status || item.visitStatus || 'completed';

  if (item.metadata) {
    Object.assign(form.value, item.metadata);
  }
  if (item.propertiesShown) {
    form.value.propertiesShown = Array.isArray(item.propertiesShown) ? item.propertiesShown.map(p => p._id || p) : [];
  }
  if (item.quotedPrice) form.value.quotedPrice = item.quotedPrice;
  if (item.listPrice) form.value.listPrice = item.listPrice;
  if (item.discount) form.value.discount = item.discount;
  if (item.nextFollowUpAt) {
    form.value.nextFollowUpAt = new Date(item.nextFollowUpAt).toISOString().slice(0, 16);
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    loadProperties();
    if (props.editItem) {
      prefillEditData(props.editItem);
    } else {
      step.value = 'type';
      selectedType.value = '';
      resetForm();
      errorMsg.value = '';
    }
  }
}, { immediate: true });

async function handleSave() {
  if (!form.value.summary || !form.value.summary.trim()) {
    errorMsg.value = 'Please provide Summary / Notes for this activity.';
    return;
  }

  const leadId = props.lead?._id || props.lead?.id;
  if (!leadId) {
    errorMsg.value = 'Lead identifier missing.';
    return;
  }

  saving.value = true;
  errorMsg.value = '';

  try {
    const actType = selectedType.value === 'phone_call' ? 'call' : selectedType.value;

    const payload = {
      id: leadId,
      leadId,
      type: actType,
      activityDate: form.value.activityDate,
      activityTime: form.value.activityTime,
      summary: form.value.summary.trim(),
      description: form.value.summary.trim(),
      customerResponse: form.value.customerResponse?.trim() || '',
      nextFollowUpAt: form.value.nextFollowUpAt || null,
      status: form.value.status || form.value.visitStatus || 'completed',
      metadata: {
        ...form.value,
        propertiesShown: form.value.propertiesShown,
        computedTotal: computedTotal.value,
      },
    };

    if (isEditing.value) {
      const activityId = props.editItem?._id || props.editItem?.id;
      if (props.editItem._type === 'visit') {
        await updateVisit({ leadId, visitId: activityId, ...payload });
      } else if (props.editItem._type === 'quotation') {
        await updateQuotation({ leadId, quotationId: activityId, ...payload });
      } else if (props.editItem._type === 'note') {
        await updateLeadNote({ leadId, noteId: activityId, content: form.value.summary, title: form.value.noteTitle, isPrivate: form.value.isPrivate });
      } else if (props.editItem._type === 'followup') {
        await updateLeadFollowUp({ leadId, followUpId: activityId, notes: form.value.summary, status: form.value.status });
      } else {
        await updateLeadActivity({ leadId, activityId, ...payload });
      }
    } else {
      // Create new activity
      if (actType === 'property_visit' || actType === 'site_visit') {
        await createVisit(leadId, {
          visitDate: form.value.activityDate,
          visitTime: form.value.activityTime,
          visitStatus: form.value.visitStatus || 'scheduled',
          propertiesShown: form.value.propertiesShown || [],
          customerAttended: form.value.customerAttended || false,
          interestLevel: form.value.interestLevel || null,
          customerFeedback: form.value.customerResponse || form.value.summary,
          likes: form.value.likes,
          dislikes: form.value.dislikes,
          objections: form.value.objections,
          nextAction: form.value.nextAction,
          followUpDate: form.value.nextFollowUpAt || null,
          internalNotes: form.value.summary,
        });
      } else if (actType === 'quotation') {
        await createQuotation(leadId, {
          propertyId: form.value.propertyId || null,
          quotedPrice: Number(form.value.quotedPrice) || 0,
          listPrice: Number(form.value.listPrice) || null,
          discount: Number(form.value.discount) || 0,
          totalEstimatedCost: computedTotal.value,
          offerValidUntil: form.value.offerValidUntil || null,
          customerInterest: form.value.interestLevel || 'interested',
          customerFeedback: form.value.customerResponse,
          notes: form.value.summary,
        });
      } else if (actType === 'note') {
        await addLeadNote({ id: leadId, content: form.value.summary, title: form.value.noteTitle, isPrivate: form.value.isPrivate });
      } else if (actType === 'follow_up') {
        await addLeadFollowUp({
          id: leadId,
          scheduledAt: form.value.nextFollowUpAt || form.value.activityDate,
          type: form.value.followUpType || 'call',
          notes: form.value.summary,
        });
      } else {
        await logLeadActivity(payload);
      }
    }

    emit('saved');
    emit('close');
  } catch (err) {
    errorMsg.value = err.response?.data?.error?.message || err.message || 'Failed to save activity.';
  } finally {
    saving.value = false;
  }
}
</script>
