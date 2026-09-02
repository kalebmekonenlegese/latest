# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: console.test.js >> hotel.html should not emit JavaScript errors
- Location: tests\console.test.js:7:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 34

- Array []
+ Array [
+   "Connecting to 'https://cdn.lordicon.com/bstjqmfc.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/bstjqmfc.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/ycykppwj.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/ycykppwj.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/drdusbzu.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/drdusbzu.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/cuksbukj.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/cuksbukj.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/ojgowmvw.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/ojgowmvw.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/ilttnvct.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/ilttnvct.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/twpfmtiv.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/twpfmtiv.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/kvabjivl.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/kvabjivl.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/cydywpjk.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/cydywpjk.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/mzcaikdp.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/mzcaikdp.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/rpvomrgr.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/rpvomrgr.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/itysowyb.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/itysowyb.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/jvucoldz.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/jvucoldz.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/cuksbukj.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/cuksbukj.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/puvaffet.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/puvaffet.json. Refused to connect because it violates the document's Content Security Policy.",
+   "Connecting to 'https://cdn.lordicon.com/dnoiydox.json' violates the following Content Security Policy directive: \"connect-src 'self' https://js.stripe.com https://*.stripe.com https://api.hatseykalebhotel.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms\". The action has been blocked.",
+   "Fetch API cannot load https://cdn.lordicon.com/dnoiydox.json. Refused to connect because it violates the document's Content Security Policy.",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - img "Hatsey Kaleb Hotel logo" [ref=e7]
        - generic [ref=e8]: Hatsey Kaleb Hotel
      - navigation "Primary navigation" [ref=e9]:
        - link "home" [ref=e10] [cursor=pointer]:
          - /url: index.html
        - link "rooms" [ref=e11] [cursor=pointer]:
          - /url: rooms.html
        - link "dining" [ref=e12] [cursor=pointer]:
          - /url: restaurant.html
        - link "events" [ref=e13] [cursor=pointer]:
          - /url: events.html
        - link "gallery" [ref=e14] [cursor=pointer]:
          - /url: gallery.html
        - link "about us" [ref=e15] [cursor=pointer]:
          - /url: about.html
        - link "contact us" [ref=e16] [cursor=pointer]:
          - /url: contact.html
      - button "Language selector" [ref=e18] [cursor=pointer]:
        - text: lang
        - generic [ref=e19]: ⌵
      - generic [ref=e20]:
        - button "Sign up" [ref=e21] [cursor=pointer]: sign up
        - button "Sign in" [ref=e22] [cursor=pointer]: sign in
    - generic [ref=e24]:
      - link "rooms" [ref=e25] [cursor=pointer]:
        - /url: rooms.html
      - link "dining" [ref=e26] [cursor=pointer]:
        - /url: restaurant.html
      - link "events" [ref=e27] [cursor=pointer]:
        - /url: events.html
      - link "gallery" [ref=e28] [cursor=pointer]:
        - /url: gallery.html
      - link "facilities" [ref=e29] [cursor=pointer]:
        - /url: facilities.html
      - link "offers" [ref=e30] [cursor=pointer]:
        - /url: offers.html
      - link "faq" [ref=e31] [cursor=pointer]:
        - /url: faq.html
  - main [ref=e32]:
    - generic [ref=e33]:
      - generic "Featured hotel images":
        - generic:
          - generic:
            - img "Hotel conference hall"
        - generic:
          - generic:
            - generic:
              - img "Hotel bedroom suite"
        - generic:
          - generic:
            - generic:
              - img "Hotel dining area"
        - generic:
          - generic:
            - generic:
              - img "Hotel welcoming lobby"
      - generic:
        - button "Previous slide" [ref=e34] [cursor=pointer]: ‹
        - button "Next slide" [ref=e35] [cursor=pointer]: ›
      - generic [ref=e36]:
        - heading "hatsey kaleb hotel" [level=1] [ref=e37]
        - paragraph [ref=e38]: Where every guest is treated like family. Enjoy comfortable rooms, modern event facilities, and warm Ethiopian hospitality in Tigray.
        - generic [ref=e39]:
          - button "book now!" [ref=e40] [cursor=pointer]
          - link "Explore Hatsey Kaleb Hotel" [ref=e41] [cursor=pointer]:
            - /url: "#about"
            - text: explore
    - generic [ref=e42]:
      - heading "Our Journey" [level=2] [ref=e43]
      - paragraph [ref=e44]: Hatsey Kaleb Hotel is a family-owned establishment founded to create a welcoming space for travelers seeking comfort, culture, and outstanding hospitality in Tigray.
      - generic [ref=e45]:
        - generic [ref=e46]:
          - heading "The Story Behind Hatsey Kaleb Hotel" [level=3] [ref=e47]
          - paragraph [ref=e48]: Hatsey Kaleb Hotel is dedicated to providing a welcoming and professional experience for guests. We specialize in hosting meetings, congresses, and events while ensuring comfort, security, and quality service.
          - paragraph [ref=e49]: With 20 comfortable rooms, a restaurant serving local delicacies, and flexible conference facilities, we offer more than just a place to stay — we offer a place where you belong.
          - paragraph [ref=e50]: Whether you are here for business, cultural exploration, or a peaceful retreat, our serene environment and warm Ethiopian hospitality make every stay memorable.
        - generic [ref=e51]:
          - img "Hotel exterior view" [ref=e53]
          - img "Hotel interior lounge" [ref=e55]
    - generic [ref=e56]:
      - heading "Why Choose Hatsey Kaleb Hotel?" [level=2] [ref=e57]
      - paragraph [ref=e58]: We blend tradition with modern comfort, delivering personalized service, clean accommodations, and event-ready facilities for business and leisure travelers alike.
      - generic [ref=e59]:
        - article [ref=e60]:
          - paragraph [ref=e62]: Free high-speed Wi-Fi throughout the hotel for all guests.
        - article [ref=e63]:
          - paragraph [ref=e65]: Standby power ensures your stay is comfortable even during outages.
        - article [ref=e66]:
          - paragraph [ref=e68]: Modern conference facilities with LCD access and event support.
        - article [ref=e69]:
          - paragraph [ref=e71]: Complimentary tea and coffee served fresh every morning.
        - article [ref=e72]:
          - paragraph [ref=e74]: Free secure parking for guests and event attendees.
        - article [ref=e75]:
          - paragraph [ref=e77]: TV and DStv access available in each room for entertainment.
        - article [ref=e78]:
          - paragraph [ref=e80]: Punctuality and attentive service from arrival to departure.
        - article [ref=e81]:
          - paragraph [ref=e83]: Personalized customer care tailored to each guest's needs.
        - article [ref=e84]:
          - paragraph [ref=e86]: Comfortable, well-appointed rooms with modern amenities.
        - article [ref=e87]:
          - paragraph [ref=e89]: 24/7 security cameras and attentive staff for extra peace of mind.
        - article [ref=e90]:
          - paragraph [ref=e92]: Fast room service and support throughout your stay.
        - article [ref=e93]:
          - paragraph [ref=e95]: Environmentally conscious operations and sustainability initiatives.
    - generic [ref=e96]:
      - heading "Rooms" [level=2] [ref=e97]
      - paragraph [ref=e98]: Choose from our comfortable room types, each designed to make your stay relaxing and productive.
      - generic [ref=e99]:
        - article [ref=e100]:
          - img "Standard hotel room" [ref=e103]
          - generic [ref=e104]:
            - heading "Standard Room" [level=3] [ref=e105]
            - paragraph [ref=e106]: Cozy and modern room with all the essential amenities for a restful stay.
            - generic [ref=e107]:
              - generic [ref=e108]: From $45
              - generic [ref=e109]: Free Wi‑Fi • Breakfast included
            - link "View Standard Room" [ref=e110] [cursor=pointer]:
              - /url: "#"
              - text: view room
        - article [ref=e111]:
          - img "Deluxe hotel room" [ref=e114]
          - generic [ref=e115]:
            - heading "Deluxe Room" [level=3] [ref=e116]
            - paragraph [ref=e117]: Spacious accommodation with upgraded comfort and premium bedding.
            - generic [ref=e118]:
              - generic [ref=e119]: From $65
              - generic [ref=e120]: City view • Complimentary breakfast
            - link "View Deluxe Room" [ref=e121] [cursor=pointer]:
              - /url: "#"
              - text: view room
        - article [ref=e122]:
          - img "Executive suite room" [ref=e125]
          - generic [ref=e126]:
            - heading "Executive Suite" [level=3] [ref=e127]
            - paragraph [ref=e128]: Beautifully appointed suite ideal for business travelers and guests seeking extra space.
            - generic [ref=e129]:
              - generic [ref=e130]: From $95
              - generic [ref=e131]: Separate living area • Work desk
            - link "View Executive Suite" [ref=e132] [cursor=pointer]:
              - /url: "#"
              - text: view room
        - article [ref=e133]:
          - img "Family room" [ref=e135]
          - generic [ref=e136]:
            - heading "Family Room" [level=3] [ref=e137]
            - paragraph [ref=e138]: Comfortable and bright room for families or groups who want extra space.
            - generic [ref=e139]:
              - generic [ref=e140]: From $80
              - generic [ref=e141]: Extra beds available • Kid-friendly
            - link "View Family Room" [ref=e142] [cursor=pointer]:
              - /url: "#"
              - text: view room
    - generic [ref=e143]:
      - heading "Book Your Stay" [level=2] [ref=e144]
      - paragraph [ref=e145]: Quickly preview availability and room guidance for your preferred dates. This booking preview is intended to help you explore options before confirming with our reservations team.
      - generic [ref=e146]:
        - generic [ref=e147]:
          - heading "Reservation Details" [level=3] [ref=e148]
          - paragraph [ref=e149]: Choose dates, guests, and room type. Rates shown are estimates — please contact our reservations team for confirmed availability and pricing.
          - list [ref=e150]:
            - listitem [ref=e151]: Flexible cancellation options
            - listitem [ref=e152]: Complimentary breakfast for most room types
            - listitem [ref=e153]: Free Wi‑Fi throughout the hotel
        - generic [ref=e154]:
          - generic [ref=e155]:
            - generic [ref=e156]:
              - generic [ref=e157]: Check-in
              - textbox "Check-in" [ref=e158]
            - generic [ref=e159]:
              - generic [ref=e160]: Check-out
              - textbox "Check-out" [ref=e161]
          - generic [ref=e162]:
            - generic [ref=e163]:
              - generic [ref=e164]: Adults
              - combobox "Number of adults" [ref=e165]:
                - option "1"
                - option "2" [selected]
                - option "3"
                - option "4"
            - generic [ref=e166]:
              - generic [ref=e167]: Children
              - combobox "Number of children" [ref=e168]:
                - option "0" [selected]
                - option "1"
                - option "2"
          - generic [ref=e169]:
            - generic [ref=e170]:
              - generic [ref=e171]: Room type
              - combobox "Room type" [ref=e172]:
                - option "Standard Room" [selected]
                - option "Deluxe Room"
                - option "Executive Suite"
                - option "Family Room"
            - generic [ref=e173]:
              - generic [ref=e174]: Promo code (optional)
              - textbox "Promo code (optional)" [ref=e175]:
                - /placeholder: PROMO2025
          - button "Check availability" [ref=e176] [cursor=pointer]
          - paragraph [ref=e177]: This booking preview offers estimated availability and pricing. For confirmed reservations, reach out to our reservations desk.
    - generic [ref=e178]:
      - heading "Special Service" [level=2] [ref=e179]
      - paragraph [ref=e180]: Discover the services that make Hatsey Kaleb Hotel the ideal choice for meetings, dining, and events.
      - generic [ref=e181]:
        - article [ref=e182]:
          - img "Conference room" [ref=e184]
          - generic [ref=e185]:
            - heading "Conference Room" [level=3] [ref=e187]
            - paragraph [ref=e188]: Spacious meeting hall equipped with audiovisual technology and high-speed internet.
            - button "More details about Conference Room" [ref=e189] [cursor=pointer]: more details
        - article [ref=e190]:
          - img "Restaurant dining area" [ref=e193]
          - generic [ref=e194]:
            - heading "Restaurant" [level=3] [ref=e196]
            - paragraph [ref=e197]: Enjoy local dishes and international favorites in a warm and inviting dining space.
            - button "More details about Restaurant" [ref=e198] [cursor=pointer]: more details
        - article [ref=e199]:
          - img "Event space" [ref=e201]
          - generic [ref=e202]:
            - heading "Events" [level=3] [ref=e204]
            - paragraph [ref=e205]: Flexible event spaces for weddings, conferences, and celebrations with full support.
            - button "More details about Events" [ref=e206] [cursor=pointer]: more details
        - article [ref=e207]:
          - img "Fine dining experience" [ref=e209]
          - generic [ref=e210]:
            - heading "Dining" [level=3] [ref=e212]
            - paragraph [ref=e213]: Savour refined meals in an elegant atmosphere, perfect for breakfast, lunch, and dinner.
            - button "More details about Dining" [ref=e214] [cursor=pointer]: more details
    - generic [ref=e215]:
      - heading "Guest Reviews" [level=2] [ref=e216]
      - paragraph [ref=e217]: Hear from our guests around the world.
      - generic "Guest testimonials" [ref=e218]:
        - generic [ref=e219]:
          - article [ref=e220]:
            - generic [ref=e221]:
              - img "Guest photo Sarah M." [ref=e223]
              - generic [ref=e224]: ★★★★★
            - generic [ref=e225]:
              - blockquote [ref=e226]: "\"Excellent service and a beautiful conference hall. The staff helped us organize our business event with care.\""
              - generic [ref=e227]:
                - strong [ref=e228]: Sarah M.
                - generic [ref=e229]: United Kingdom
          - article [ref=e230]:
            - generic [ref=e231]:
              - img [ref=e233]
              - generic [ref=e234]: ★★★★★
            - generic [ref=e235]:
              - blockquote [ref=e236]: "\"The rooms were clean, comfortable, and well appointed. Breakfast was delicious and the location was perfect.\""
              - generic [ref=e237]:
                - strong [ref=e238]: Daniel T.
                - generic [ref=e239]: United States
          - article [ref=e240]:
            - generic [ref=e241]:
              - img [ref=e243]
              - generic [ref=e244]: ★★★★★
            - generic [ref=e245]:
              - blockquote [ref=e246]: "\"Great value for meetings and events. The team made every detail easy and the venue felt welcoming.\""
              - generic [ref=e247]:
                - strong [ref=e248]: Fatima A.
                - generic [ref=e249]: Ethiopia
          - article [ref=e250]:
            - generic [ref=e251]:
              - img [ref=e253]
              - generic [ref=e254]: ★★★★★
            - generic [ref=e255]:
              - blockquote [ref=e256]: "\"Impeccable attention to detail and a calm, luxurious atmosphere. Highly recommended for business travelers.\""
              - generic [ref=e257]:
                - strong [ref=e258]: Marco R.
                - generic [ref=e259]: Italy
          - article [ref=e260]:
            - generic [ref=e261]:
              - img [ref=e263]
              - generic [ref=e264]: ★★★★★
            - generic [ref=e265]:
              - blockquote [ref=e266]: "\"A delightful stay — beautiful design, warm staff, and a memorable rooftop dining experience.\""
              - generic [ref=e267]:
                - strong [ref=e268]: Aisha K.
                - generic [ref=e269]: UAE
        - button "Previous testimonial" [ref=e270] [cursor=pointer]: ‹
        - button "Next testimonial" [ref=e271] [cursor=pointer]: ›
        - tablist "Testimonial navigation" [ref=e272]:
          - tab "Show testimonial 1" [selected] [ref=e273] [cursor=pointer]
          - tab "Show testimonial 2" [ref=e274] [cursor=pointer]
          - tab "Show testimonial 3" [ref=e275] [cursor=pointer]
          - tab "Show testimonial 4" [ref=e276] [cursor=pointer]
          - tab "Show testimonial 5" [ref=e277] [cursor=pointer]
    - generic [ref=e278]:
      - heading "Gallery" [level=2] [ref=e279]
      - paragraph [ref=e280]: Browse images of our rooms, events, dining, and hotel atmosphere.
      - generic [ref=e281]:
        - figure [ref=e282]:
          - link "View Hotel hallway" [ref=e283] [cursor=pointer]:
            - /url: "#"
            - img "Hotel hallway" [ref=e286]
            - generic [ref=e287]: Elegant hallway with warm lighting
        - figure [ref=e288]:
          - link "View Hotel bedroom" [ref=e289] [cursor=pointer]:
            - /url: "#"
            - img "Hotel bedroom" [ref=e292]
            - generic [ref=e293]: Comfortable bedroom with premium linens
        - figure [ref=e294]:
          - link "View Hotel dining table" [ref=e295] [cursor=pointer]:
            - /url: "#"
            - img "Hotel dining table" [ref=e298]
            - generic [ref=e299]: Intimate dining table setup
        - figure [ref=e300]:
          - link "View Hotel lounge seating" [ref=e301] [cursor=pointer]:
            - /url: "#"
            - img "Hotel lounge seating" [ref=e304]
            - generic [ref=e305]: Cozy lounge seating area
        - figure [ref=e306]:
          - link "View Event setup" [ref=e307] [cursor=pointer]:
            - /url: "#"
            - img "Event setup" [ref=e310]
            - generic [ref=e311]: Elegant event setup
        - figure [ref=e312]:
          - link "View Restaurant interior" [ref=e313] [cursor=pointer]:
            - /url: "#"
            - img "Restaurant interior" [ref=e315]
            - generic [ref=e316]: Stylish restaurant interior
    - generic [ref=e317]:
      - heading "Virtual Tour" [level=2] [ref=e318]
      - paragraph [ref=e319]: Explore polished previews of our rooms, dining, meeting hall, and hotel exterior while we prepare the full immersive 360° tour experience.
      - generic [ref=e320]:
        - article [ref=e321]:
          - link "Open room preview" [ref=e322] [cursor=pointer]:
            - /url: "#"
            - img "Room preview" [ref=e324]
            - generic [ref=e325]: ▶
            - generic [ref=e326]: Room preview
        - article [ref=e327]:
          - link "Open restaurant preview" [ref=e328] [cursor=pointer]:
            - /url: "#"
            - img "Restaurant preview" [ref=e330]
            - generic [ref=e331]: ▶
            - generic [ref=e332]: Restaurant preview
        - article [ref=e333]:
          - link "Open meeting hall preview" [ref=e334] [cursor=pointer]:
            - /url: "#"
            - img "Meeting hall preview" [ref=e336]
            - generic [ref=e337]: ▶
            - generic [ref=e338]: Meeting hall preview
        - article [ref=e339]:
          - link "Open hotel exterior preview" [ref=e340] [cursor=pointer]:
            - /url: "#"
            - img "Hotel exterior preview" [ref=e342]
            - generic [ref=e343]: ▶
            - generic [ref=e344]: Hotel exterior preview
    - generic [ref=e345]:
      - heading "Events" [level=2] [ref=e346]
      - paragraph [ref=e347]: Host meetings, weddings, and special events in our elegant event spaces supported by reliable catering and service.
      - generic [ref=e348]:
        - article [ref=e349]:
          - img "Business meeting room" [ref=e351]
          - generic [ref=e352]:
            - heading "Meetings & Conferences" [level=3] [ref=e353]
            - paragraph [ref=e354]: Fully equipped halls with audiovisual systems, seating layouts, and support for business gatherings.
            - button "more detail" [ref=e355] [cursor=pointer]
        - article [ref=e356]:
          - img "Wedding reception" [ref=e358]
          - generic [ref=e359]:
            - heading "Weddings & Celebrations" [level=3] [ref=e360]
            - paragraph [ref=e361]: Create meaningful moments with venue setup, catering, and a beautiful atmosphere for guests.
            - button "more detail" [ref=e362] [cursor=pointer]
    - generic [ref=e363]:
      - heading "Special Offers" [level=2] [ref=e364]
      - paragraph [ref=e365]: Take advantage of our latest offers for culture, events, relaxation, and local exploration.
      - generic [ref=e366]:
        - article [ref=e367]:
          - img "Cultural coffee ceremony" [ref=e369]
          - generic [ref=e370]:
            - heading "Cultural Experiences" [level=3] [ref=e371]
            - paragraph [ref=e372]: Enjoy authentic Ethiopian traditions, coffee ceremonies, and local music performances.
            - button "book now" [ref=e373] [cursor=pointer]
        - article [ref=e374]:
          - img "Event service setup" [ref=e376]
          - generic [ref=e377]:
            - heading "Event Service" [level=3] [ref=e378]
            - paragraph [ref=e379]: Book halls for weddings, conferences, or celebrations with decoration and catering support.
            - button "book now" [ref=e380] [cursor=pointer]
        - article [ref=e381]:
          - img "Relaxation lounge" [ref=e383]
          - generic [ref=e384]:
            - heading "Relaxation & Recreation" [level=3] [ref=e385]
            - paragraph [ref=e386]: Enjoy long-stay discounts, rooftop views, and relaxing amenities for a peaceful stay.
            - button "book now" [ref=e387] [cursor=pointer]
        - article [ref=e388]:
          - img "Guided local tour" [ref=e390]
          - generic [ref=e391]:
            - heading "Local Tours" [level=3] [ref=e392]
            - paragraph [ref=e393]: Explore nearby landmarks with guided tours and local recommendations for your visit.
            - button "book now" [ref=e394] [cursor=pointer]
    - generic [ref=e395]:
      - heading "FAQ" [level=2] [ref=e396]
      - generic [ref=e397]:
        - group [ref=e398]:
          - generic "What time is check-in and check-out?" [ref=e399] [cursor=pointer]
        - group [ref=e400]:
          - generic "Is breakfast included in my stay?" [ref=e401] [cursor=pointer]
        - group [ref=e402]:
          - generic "Do you offer free Wi-Fi?" [ref=e403] [cursor=pointer]
        - group [ref=e404]:
          - generic "Can I book an event or meeting room?" [ref=e405] [cursor=pointer]
        - group [ref=e406]:
          - generic "Do you offer airport shuttle services?" [ref=e407] [cursor=pointer]
    - generic [ref=e408]:
      - heading "Contact" [level=2] [ref=e409]
      - paragraph [ref=e410]: Reach out to us for bookings, questions, or event planning support.
      - generic [ref=e411]:
        - generic [ref=e412]:
          - heading "Contact & Reservations" [level=3] [ref=e413]
          - paragraph [ref=e414]: Quickly reach our team using your preferred method — we reply fast.
          - generic [ref=e415]:
            - link "Call Hatsey Kaleb Hotel" [ref=e416] [cursor=pointer]:
              - /url: tel:+251914754143
              - img [ref=e417]
              - text: +251 914 754 143
            - link "Chat on WhatsApp" [ref=e419] [cursor=pointer]:
              - /url: https://wa.me/251914754143?text=Hello%20Hatsey%20Kaleb%20Hotel
              - img [ref=e420]
              - text: WhatsApp
            - link "Telegram" [ref=e423] [cursor=pointer]:
              - /url: https://t.me/hatseykalebhotel
              - img [ref=e424]
              - text: Telegram
            - link "Email Hatsey Kaleb Hotel" [ref=e426] [cursor=pointer]:
              - /url: mailto:kalebmekonen.kb@gmail.com
              - img [ref=e427]
              - text: Email
          - generic [ref=e430]:
            - link "Facebook" [ref=e431] [cursor=pointer]:
              - /url: https://facebook.com/hatseykalebhotel
              - img [ref=e432]
              - generic [ref=e434]: Facebook
            - link "Instagram" [ref=e435] [cursor=pointer]:
              - /url: https://instagram.com/hatseykalebhotel
              - img [ref=e436]
              - generic [ref=e439]: Instagram
          - generic [ref=e440]:
            - generic [ref=e441]:
              - heading "Address" [level=4] [ref=e442]
              - paragraph [ref=e443]: Abiy Adi, Tigray, Ethiopia
            - generic [ref=e444]:
              - heading "Phone" [level=4] [ref=e445]
              - paragraph [ref=e446]:
                - link "+251 914 754 143" [ref=e447] [cursor=pointer]:
                  - /url: tel:+251914754143
            - generic [ref=e448]:
              - heading "Email" [level=4] [ref=e449]
              - paragraph [ref=e450]:
                - link "kalebmekonen.kb@gmail.com" [ref=e451] [cursor=pointer]:
                  - /url: mailto:kalebmekonen.kb@gmail.com
          - button "live chat" [ref=e453] [cursor=pointer]
        - generic [ref=e454]:
          - heading "Find Us" [level=3] [ref=e455]
          - paragraph [ref=e456]: Interactive map — drag, zoom, or open in Google Maps.
          - iframe [ref=e458]:
            
          - paragraph [ref=e459]:
            - text: Open in
            - link "Google Maps" [ref=e460] [cursor=pointer]:
              - /url: https://maps.google.com/?q=Hatsey+Kaleb+Hotel
  - contentinfo [ref=e461]:
    - generic [ref=e462]:
      - generic [ref=e464]:
        - img [ref=e465]:
          - generic [ref=e466]: H
        - generic [ref=e467]:
          - strong [ref=e468]: Hatsey Kaleb Hotel
          - paragraph [ref=e469]: Warm hospitality in Tigray — comfort, events, and dining.
      - generic [ref=e470]:
        - heading "Quick Links" [level=4] [ref=e471]
        - list [ref=e472]:
          - listitem [ref=e473]:
            - link "Home" [ref=e474] [cursor=pointer]:
              - /url: index.html
          - listitem [ref=e475]:
            - link "Rooms" [ref=e476] [cursor=pointer]:
              - /url: rooms.html
          - listitem [ref=e477]:
            - link "Dining" [ref=e478] [cursor=pointer]:
              - /url: restaurant.html
          - listitem [ref=e479]:
            - link "Events" [ref=e480] [cursor=pointer]:
              - /url: events.html
          - listitem [ref=e481]:
            - link "Gallery" [ref=e482] [cursor=pointer]:
              - /url: gallery.html
          - listitem [ref=e483]:
            - link "About Us" [ref=e484] [cursor=pointer]:
              - /url: about.html
          - listitem [ref=e485]:
            - link "Contact" [ref=e486] [cursor=pointer]:
              - /url: contact.html
          - listitem [ref=e487]:
            - link "Book Now" [ref=e488] [cursor=pointer]:
              - /url: booking.html
      - generic [ref=e489]:
        - heading "Explore" [level=4] [ref=e490]
        - list [ref=e491]:
          - listitem [ref=e492]:
            - link "AI Concierge" [ref=e493] [cursor=pointer]:
              - /url: ai-assistant.html
          - listitem [ref=e494]:
            - link "Virtual Tour" [ref=e495] [cursor=pointer]:
              - /url: virtual-tour.html
          - listitem [ref=e496]:
            - link "Sustainability" [ref=e497] [cursor=pointer]:
              - /url: sustainability.html
          - listitem [ref=e498]:
            - link "Transportation" [ref=e499] [cursor=pointer]:
              - /url: transportation.html
          - listitem [ref=e500]:
            - link "Weddings" [ref=e501] [cursor=pointer]:
              - /url: weddings.html
          - listitem [ref=e502]:
            - link "Attractions" [ref=e503] [cursor=pointer]:
              - /url: attractions.html
          - listitem [ref=e504]:
            - link "Spa & Wellness" [ref=e505] [cursor=pointer]:
              - /url: spa-wellness.html
          - listitem [ref=e506]:
            - link "Hotel" [ref=e507] [cursor=pointer]:
              - /url: hotel.html
      - generic [ref=e508]:
        - heading "More" [level=4] [ref=e509]
        - list [ref=e510]:
          - listitem [ref=e511]:
            - link "Standard Room" [ref=e512] [cursor=pointer]:
              - /url: standard-room.html
          - listitem [ref=e513]:
            - link "Deluxe Room" [ref=e514] [cursor=pointer]:
              - /url: deluxe-room.html
          - listitem [ref=e515]:
            - link "Executive Suite" [ref=e516] [cursor=pointer]:
              - /url: executive-suite.html
          - listitem [ref=e517]:
            - link "Family Room" [ref=e518] [cursor=pointer]:
              - /url: family-room.html
          - listitem [ref=e519]:
            - link "Dining Experience" [ref=e520] [cursor=pointer]:
              - /url: dining-experience.html
          - listitem [ref=e521]:
            - link "Blog" [ref=e522] [cursor=pointer]:
              - /url: blog.html
          - listitem [ref=e523]:
            - link "Careers" [ref=e524] [cursor=pointer]:
              - /url: careers.html
          - listitem [ref=e525]:
            - link "Facilities" [ref=e526] [cursor=pointer]:
              - /url: facilities.html
    - generic [ref=e527]:
      - generic [ref=e528]: © 2025 Hatsey Kaleb Hotel. All rights reserved.
      - generic [ref=e529]:
        - link "Privacy Policy" [ref=e530] [cursor=pointer]:
          - /url: privacy.html
        - text: ·
        - link "Terms" [ref=e531] [cursor=pointer]:
          - /url: terms.html
        - text: ·
        - link "Cookies" [ref=e532] [cursor=pointer]:
          - /url: cookie-policy.html
      - generic [ref=e533]:
        - link "facebook" [ref=e534] [cursor=pointer]:
          - /url: https://facebook.com/hatseykalebhotel
        - link "instagram" [ref=e535] [cursor=pointer]:
          - /url: https://instagram.com/hatseykalebhotel
        - link "whatsapp" [ref=e536] [cursor=pointer]:
          - /url: https://wa.me/251914754143
  - generic [ref=e537]:
    - button "Open AI Concierge" [ref=e538] [cursor=pointer]: 💬
    - dialog "Hotel Concierge Assistant" [ref=e539]:
      - region "Concierge header" [ref=e540]:
        - generic [ref=e541]:
          - strong [ref=e542]: Hatsey Concierge
          - text: How can I help?
        - generic [ref=e543]:
          - combobox "Choose language" [ref=e544]:
            - option "English" [selected]
            - option "አማርኛ"
            - option "ትግርኛ"
          - button "Close concierge" [ref=e545] [cursor=pointer]: ✕
      - generic [ref=e546]:
        - log [ref=e547]
        - generic [ref=e548]:
          - textbox "Ask concierge" [ref=e549]:
            - /placeholder: Ask about rooms, services, or bookings...
          - button "Send" [ref=e550] [cursor=pointer]
      - contentinfo [ref=e551]: AI Concierge (UI only) — Responses are simulated locally.
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | const { listHtmlPages, fileUrlFor, isIgnorableBrowserConsoleError } = require('./utils');
  3  | 
  4  | const pages = listHtmlPages();
  5  | 
  6  | for (const p of pages) {
  7  |   test(`${p} should not emit JavaScript errors`, async ({ page }) => {
  8  |     const jsErrors = [];
  9  | 
  10 |     // Capture uncaught JavaScript errors (not network errors)
  11 |     page.on('pageerror', e => {
  12 |       const message = e.message || '';
  13 |       if (!isIgnorableBrowserConsoleError(message)) {
  14 |         jsErrors.push(message);
  15 |       }
  16 |     });
  17 | 
  18 |     // Capture console.error() calls that are NOT ignored
  19 |     page.on('console', msg => {
  20 |       const message = msg.text() || '';
  21 |       if (msg.type() === 'error' && !isIgnorableBrowserConsoleError(message)) {
  22 |         jsErrors.push(message);
  23 |       }
  24 |     });
  25 | 
  26 |     const response = await page.goto(fileUrlFor(p), { waitUntil: 'domcontentloaded', timeout: 60000 });
  27 |     await expect(response && response.ok()).toBeTruthy();
  28 | 
> 29 |     expect(jsErrors).toEqual([], 'Page should not emit JavaScript errors. Note: known browser console warnings are ignored.');
     |                      ^ Error: expect(received).toEqual(expected) // deep equality
  30 |   });
  31 | }
  32 | 
```