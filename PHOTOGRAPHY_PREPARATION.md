# Photography Preparation

## Current Status

- 🟢 Phase 3B (Photography & Content): 95–100% complete, since the placeholders have been replaced with real photos and the hero video.
- The remaining work is no longer a project phase so much as ongoing website maintenance, including adding new guest reviews, refreshing seasonal photography, updating promotions, and monitoring analytics and SEO.
- From a developer’s perspective, the next improvements would be increasing Lighthouse performance from roughly 77 to 90+, setting up Google Analytics and Google Search Console, adding structured hotel schema, optimizing caching and CDN delivery, and connecting the booking system to a real backend if required.
- Otherwise, the website is ready to launch.

This site is ready for a professional photography handoff without changing page layouts or CSS. The canonical shot registry lives in `assets/config/photography-manifest.js`; its semantic paths are the future asset contract.

## Asset Contract

For each scene, deliver the original plus responsive derivatives at 320, 480, 640, 900, 1200, and 1600 pixels wide where the page uses responsive `<picture>` markup. Keep AVIF and WebP derivatives alongside the source image. Use the existing `npm run optimize` pipeline after copying source files into the matching `assets/images/` folder.

Recommended delivery rules:

- Hero and editorial landscape: 16:9, minimum 2400 x 1350.
- Room and food detail: 4:3 or 3:2, minimum 2000 x 1500.
- Staff portraits: 4:5, minimum 1600 x 2000.
- Gallery and destination master files: minimum 3000px on the long edge.
- Keep faces, important architecture, and cultural details inside the central safe crop for responsive cover images.
- Record model, location, consent, usage rights, date, and photographer for every identifiable person or restricted site.

## Planned Library

| Area | Canonical files |
| --- | --- |
| Hotel | `hotel/exterior-hero.webp`, `hotel/lobby-reception.webp`, `hotel/sunset-night.webp` |
| Rooms | `rooms/standard-room-01.webp`, `rooms/deluxe-room-01.webp`, `rooms/executive-suite-01.webp`, `rooms/bathroom-01.webp` |
| Restaurant | `restaurant/dining-room.webp`, `restaurant/breakfast-buffet.webp`, `restaurant/tigrayan-cuisine.webp` |
| Spa | `spa/spa-treatment.webp`, `spa/fitness-center.webp` |
| Events | `events/conference-hall.webp`, `events/wedding-venue.webp` |
| Services | `services/airport-transfer.webp`, `services/parking-ev-charging.webp` |
| Staff | `staff/front-desk.webp`, `staff/concierge.webp` |
| Experiences | `experiences/coffee-ceremony.webp`, `experiences/guest-arrival.webp` |
| Attractions | `attractions/gheralta-mountains.webp`, `attractions/historical-sites.webp`, `attractions/drone-aerial.webp` |

The full subject, composition, alt text, orientation, aspect ratio, and minimum resolution brief is in the manifest. Existing placeholder images remain in place until the real files are approved, so the site does not develop broken image states during the shoot.

## Editorial Sets

Build the gallery from complete sets rather than isolated hero images:

- Rooms: hero, bed detail, window/view, bathroom, amenity, evening light.
- Restaurant: room atmosphere, breakfast service, coffee ceremony, cuisine, chef or service moment.
- Spa: treatment, material detail, quiet room, fitness center, wellness ritual.
- Events: conference wide shot, detail, wedding wide shot, table setting, service team.
- Destination: Gheralta landscape, heritage architecture, market texture, guided day trip, sunset/night pair.

The current gallery and lightbox components can accept these sets through the existing `<picture>` and `data-full` structure. Only the asset paths need to change when the corresponding files arrive.

## Video Handoff

Reserve future video work for licensed, silent, short-form footage: hotel arrival, drone context, coffee ceremony, restaurant atmosphere, nature, and evening ambiance. Any hero loop should be 10–15 seconds, muted, under 3 MB where practical, and paired with an equivalent still poster. Do not add video files until footage, permissions, captions or descriptive alternatives, and reduced-motion behavior are approved.
