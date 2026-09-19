# UI refresh

The public landing page is `/`. Existing authentication remains at `/login`; the authenticated workspace remains under `/app`. Landing preview data is illustrative and is never used in live workspace queries.

## Design references

- [Godly](https://godly.design): editorial typography, generous spacing, and restrained visual hierarchy.
- [Aceternity Bento Grid](https://ui.aceternity.com/components/bento-grid): modular feature composition, adapted in `BentoCard.vue`.
- [Kokonut UI](https://kokonutui.com/docs): compact navigation and interaction treatment, adapted in `SegmentedControl.vue`.
- [Bklit](https://bklit.com): minimal chart presentation, adapted in `PipelineChart.vue`. The live dashboard uses actual stage counts with a zero baseline.

These references provide React components (Godly is a gallery). This Vue 3 / Tailwind 3 application uses original Vue implementations of their design patterns; no React packages or upstream component code were installed or copied. This is an adaptation, not a direct library integration.

## Shared conventions

Neutral text and surfaces, green for primary actions, and semantic colors for status. Flat workspace background, subdued panel shadows, consistent controls, and readable information groups. Lead contact details respect existing transferred-lead restrictions.

Responsive layouts support 320px and larger screens. Lead stages wrap on mobile; workspace sections scroll within their own navigation; preview tabs remain available on phones. Controls include visible focus, descriptive labels, pressed/current states, reduced-motion support, and mobile form text sized to avoid input zoom.

## Verification

Run `npm run build` to compile the application. Verify `/`, `/login`, `/app/dashboard`, and a lead profile at desktop and mobile widths. Exercise preview sections, FAQs, mobile navigation, lead workspace sections, editing, property filters, and activity drawers. Confirm both themes and transferred-lead privacy with representative test data.

`scripts/ui-smoke.cjs` runs Chrome browser checks with Playwright and isolated API fixtures. Provide Playwright through `PLAYWRIGHT_MODULE` when it is not installed locally, and optionally set `UI_BASE_URL` (defaults to `http://127.0.0.1:5173`). Screenshots are saved to the ignored `artifacts/ui/` directory. The smoke test covers 320, 390, 768, 1024, and 1440px widths; it does not validate real backend writes.
