# Soil Loop requirements review

Reviewed against the four project documents supplied on 23 October 2026. The documents describe product requirements and examples; sample statistics and named real-world partners were not imported as verified operational data.

## Core loop

| Requirement | Result in this version |
| --- | --- |
| Block-specific accepted / ask-first / rejected rules | Retained the pilot list and partner label; clarified tea-bag packaging and partner authority. |
| Storage and preparation guidance | Covered caddy, remove packaging, drain liquids, refrigerate or freeze after one day. |
| Static location and schedule | Retained static locations; separated resident drop-off hours from collector pickup time. |
| Optional participation check-in, no personal kilograms | Retained counts; full / closed bins block check-in and accidental repeat clicks are rejected. |
| Champion bin checks and education | Added a checklist and cleaning action record; open issues reach collectors and operators and can be marked handled. |
| Collection time, weight, method, contamination and destination | Validated inputs, explicit Malaysia time, optional real collection photo, clear missed / delayed confirmation. |
| Rejection and partial acceptance | Added accepted weight separately from gross weight. Only accepted material enters diversion and batch input. |
| Every accepted collection linked to an eligible batch | Matching partner required; ready / failed batches cannot receive new scraps. |
| Create and track batches | Added batch creation; source blocks and input weight accumulate from collection records. Expected date can be revised. |
| Quality and actual output | Ready requires accepted input, passed quality, notes, actual ready date and output. Output cannot drop below recorded use. |
| Garden demand and use | Added requests, remaining stock, garden/date selection and request fulfilment through actual garden use. |
| Resident sees what happened | Replaced hardcoded Batch 12 and first-garden story with all linked batches and all linked garden updates. |
| Weekly/monthly impact | Added all-time, current-month and rolling-seven-day block metrics with personal check-in counts. |
| Honest impact and confidence | Separate weighed / estimated accepted totals; batch output remains shared and distinct from block contributions. |
| Programme oversight | Added registered-resident participation, repeat participation, supported gardens, alerts, overdue batches, supply and demand. |
| Real photos and videos alongside illustrations | Photo upload / URL, video file URL, credits, description/transcript, no autoplay and unavailable-media fallback. Optional programme media slots are wired into sorting/drop-off/compost pages. |

## Deliberate limits

- This remains a browser-local hackathon demonstration. Demo role switching is not production authentication. Changes are not shared across devices.
- Existing stored data is preserved. Old collections without a separate accepted weight retain the original convention: completed, non-rejected weight was accepted. Historical contamination quantities cannot be reconstructed.
- The Sunday 8 AM–12 PM drop-off window is the supplied example, clearly part of the demo programme. Confirm actual partner hours before a pilot.
- No AI recognition, GPS, IoT, household weight, carbon credits, monetary rewards or automated real-world expansion recommendation was added. The supplied files make these optional or defer them.
- Reminder delivery, language localization and production onboarding remain future work; they are not needed for the supplied minimum believable loop.
- The next batch stage after ready is represented by garden-use records and remaining stock, rather than a separate editable “distributed” status.
- Real photographs and footage are pending the project team's assets. No AI or unrelated stock image is presented as evidence of the programme. See `public/media/README.md` for the shot list and integration instructions.

## Verification

The 12 automated tests and lint checks pass. The production build and desktop / 390-pixel mobile browser walkthrough were also checked. In the browser, a 2 kg collection with 1.5 kg accepted increased the linked batch and resident diversion by exactly 1.5 kg. Recording 1 kg of garden use reduced stock from 5 kg to 4 kg after refresh, and the new journal entry appeared for residents. No browser console errors or warnings were captured during this walkthrough. The local preview's walkthrough entries are explicitly labelled as demo records.

`npm test` exercises real store operations in isolated browser-storage fixtures: partial/rejected/missed loads, invalid numbers and destinations, batch creation and quality, stock limits, bin availability, persistence failures, old-data hydration, media validation, garden requests and Malaysia time.

The project uses Webpack with Tailwind's official PostCSS adapter because the installed Turbopack build failed to start its CSS worker on this Windows host. The existing Fraunces and Nunito Sans Latin fonts are self-hosted with their OFL licenses, removing build-time font downloads.

For an isolated build cache in PowerShell:

```powershell
$env:SOIL_LOOP_VERIFY = '1'
npm run build
npm start
```

Omit `SOIL_LOOP_VERIFY` for normal `.next` builds. The verification build directory is ignored by Git.
