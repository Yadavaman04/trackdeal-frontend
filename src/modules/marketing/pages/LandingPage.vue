<template>
  <div class="landing-page">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <header class="landing-nav landing-container">
      <router-link to="/" class="landing-brand" aria-label="TrackDeal home"
        ><span><AppIcon name="graduation" :size="21" weight="bold" /></span
        >TrackDeal<span class="brand-period">.</span></router-link
      >
      <nav class="landing-links" aria-label="Main navigation">
        <a href="#platform">Platform</a><a href="#workflow">How it works</a
        ><a href="#questions">FAQs</a>
      </nav>
      <router-link to="/login" class="landing-signin"
        >Sign in <AppIcon name="arrowRight" :size="15"
      /></router-link>
      <button
        class="landing-menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="landing-mobile-menu"
        :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? "Close" : "Menu"
        }}<AppIcon :name="menuOpen ? 'close' : 'add'" :size="17" />
      </button>
    </header>
    <nav
      v-if="menuOpen"
      id="landing-mobile-menu"
      class="landing-mobile-menu"
      aria-label="Mobile navigation"
      @keydown.esc="menuOpen = false"
    >
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        @click="menuOpen = false"
        >{{ link.label }}<AppIcon name="arrowRight" :size="16" /></a
      ><router-link to="/login"
        >Sign in <AppIcon name="arrowRight" :size="16"
      /></router-link>
    </nav>

    <main id="main-content">
      <section class="landing-hero landing-container">
        <div class="hero-intro">
          <span class="hero-kicker"
            ><i></i> Built for institutes, coaching centres, and tutors</span
          >
          <h1>Great counselling.<br />Even better <em>admissions.</em></h1>
          <p>
            From the first inquiry to a confirmed seat.<br
              class="desktop-break"
            />
            Bring student leads, classes, and your team together in one calm
            workspace.
          </p>
          <div class="hero-actions">
            <router-link
              to="/login"
              class="landing-button landing-button-primary"
              >Open your workspace
              <AppIcon name="arrowRight" :size="17" /></router-link
            ><a href="#preview" class="landing-button landing-button-secondary"
              ><AppIcon name="eye" :size="18" /> Explore the platform</a
            >
          </div>
          <span class="hero-footnote"
            >Made for independent tutors, coaching institutes, and campus
            teams.</span
          >
        </div>
        <div class="hero-margin-note" aria-hidden="true">
          <span>LESS CHASING</span>
          <div></div>
          <span>MORE LEARNING</span>
        </div>
        <div id="preview" class="hero-preview"><ProductPreview /></div>
        <div class="platform-strip">
          <p>
            One connected workspace.<br /><strong
              >Your entire admissions journey.</strong
            >
          </p>
          <span><AppIcon name="users" :size="20" /> Student inquiries</span
          ><span><AppIcon name="chalkboard" :size="20" /> Classes & batches</span
          ><span
            ><AppIcon name="graduation" :size="20" /> Students & follow-ups</span
          >
        </div>
      </section>

      <section id="platform" class="landing-features landing-container">
        <div class="landing-section-heading">
          <div>
            <span class="landing-eyebrow">ROOM TO FOCUS</span>
            <h2>Everything you need.<br /><em>Space to do your best.</em></h2>
          </div>
          <p>
            A thoughtful home for the inquiries, batches, and people behind
            every admission.
          </p>
        </div>
        <div class="landing-bento">
          <BentoCard class="feature-leads"
            ><div class="feature-icon"><AppIcon name="users" :size="22" /></div>
            <h3>See the student.<br />Know the next step.</h3>
            <p>
              Keep course interest, counselling notes, and follow-ups together.
              Pick up every inquiry right where you left it.
            </p>
            <div class="feature-contact">
              <span class="contact-avatar">PS</span>
              <div>
                <strong>Priya Shah</strong
                ><span>Interested in Class 10 Science</span>
              </div>
              <span class="contact-status">Counselling</span>
            </div>
            <div class="feature-reminder">
              <AppIcon name="calendar" :size="16" /><span
                >Next up: demo class for Foundation Batch</span
              ><AppIcon name="checkCircle" :size="17" /></div
          ></BentoCard>
          <BentoCard
            ><div class="feature-icon">
              <AppIcon name="chalkboard" :size="22" />
            </div>
            <h3>The right class.<br />For the right student.</h3>
            <p>
              Match inquiries to batches with seats, timings, and faculty. Keep
              your timetable organized and your shortlists relevant.
            </p>
            <div class="feature-tags">
              <span>Grade 10</span><span>Evening batch</span
              ><span>Seats open</span>
            </div>
            <div class="feature-match">
              <AppIcon name="checkCircle" :size="20" /><span
                >A more considered class match.</span
              >
            </div></BentoCard
          >
          <BentoCard
            ><div class="feature-icon">
              <AppIcon name="graduation" :size="22" />
            </div>
            <h3>Clarity, all the way<br />to enrollment.</h3>
            <p>
              Follow admissions, fee reminders, and tasks with a clear view of
              what is moving and what needs attention.
            </p>
            <div class="feature-progress">
              <div>
                <span>Admission journey</span
                ><AppIcon name="handshake" :size="18" />
              </div>
              <span class="feature-progress-line"></span>
              <div>
                <span>First inquiry</span><span>Confirmed seat</span>
              </div>
            </div></BentoCard
          >
        </div>
      </section>

      <section id="workflow" class="landing-workflow">
        <div class="landing-container workflow-inner">
          <div>
            <span class="landing-eyebrow">A NATURAL FLOW</span>
            <h2>Less chasing.<br /><em>More teaching.</em></h2>
            <p>
              Give every inquiry a clear path forward, from first interest to a
              lasting student relationship.
            </p>
            <router-link to="/login" class="workflow-link"
              >Find your flow <AppIcon name="arrowRight" :size="18"
            /></router-link>
          </div>
          <ol>
            <li v-for="step in steps" :key="step.number">
              <span>{{ step.number }}</span>
              <div>
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
              <AppIcon :name="step.icon" :size="24" />
            </li>
          </ol>
        </div>
      </section>

      <section id="questions" class="landing-faq landing-container">
        <div>
          <span class="landing-eyebrow">A FEW GOOD QUESTIONS</span>
          <h2>A little more<br /><em>clarity.</em></h2>
        </div>
        <div class="faq-list">
          <details v-for="faq in faqs" :key="faq.question">
            <summary>
              {{ faq.question }}<AppIcon name="add" :size="18" />
            </summary>
            <p>{{ faq.answer }}</p>
          </details>
        </div>
      </section>

      <section class="landing-cta landing-container">
        <div class="cta-mark"><AppIcon name="graduation" :size="30" /></div>
        <span class="landing-eyebrow">YOUR NEXT CHAPTER</span>
        <h2>Make room for<br /><em>your next great class.</em></h2>
        <router-link to="/login" class="landing-button landing-button-primary"
          >Go to your workspace <AppIcon name="arrowRight" :size="17"
        /></router-link>
        <p>Good work starts with a little clarity.</p>
      </section>
    </main>
    <footer class="landing-footer landing-container">
      <router-link to="/" class="landing-brand"
        ><span><AppIcon name="graduation" :size="18" weight="bold" /></span
        >TrackDeal<span class="brand-period">.</span></router-link
      >
      <p>Thoughtfully built for education.</p>
      <span>© {{ new Date().getFullYear() }} TrackDeal</span
      ><a href="#main-content">Back to top ↑</a>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import BentoCard from "@/components/ui/BentoCard.vue";
import ProductPreview from "../components/ProductPreview.vue";
import "../styles/landing.css";
const menuOpen = ref(false);
const links = [
  { href: "#platform", label: "Platform" },
  { href: "#workflow", label: "How it works" },
  { href: "#questions", label: "FAQs" },
];
const steps = [
  {
    number: "01",
    title: "Start with a conversation",
    description:
      "Capture every student inquiry, understand their course needs, and give your team the full picture.",
    icon: "users",
  },
  {
    number: "02",
    title: "Place them in the right class",
    description:
      "Match students to batches, coordinate demo classes, and keep the next follow-up in sight.",
    icon: "chalkboard",
  },
  {
    number: "03",
    title: "Bring it all together",
    description:
      "Move from counselling to enrollment, and stay on top of tasks, attendance, and fee follow-ups.",
    icon: "graduation",
  },
];
const faqs = [
  {
    question: "Who is TrackDeal built for?",
    answer:
      "TrackDeal brings student inquiries, classes, enrollments, and follow-ups together for independent tutors, coaching institutes, and multi-campus teams.",
  },
  {
    question: "Can I use it between counselling sessions?",
    answer:
      "Yes. The workspace adapts to mobile screens so you can review student details, check class seats, and keep track of follow-ups on the go.",
  },
  {
    question: "What can I manage in one workspace?",
    answer:
      "Manage student leads, classes and batches, enrolled students, tasks, and reports. Available modules depend on your organization’s settings and your role.",
  },
  {
    question: "How do I access my institute’s workspace?",
    answer:
      "Sign in with your organization name and existing account. If you are joining a team, ask your workspace administrator for an invitation and use the invitation link to set up your account.",
  },
];
</script>
