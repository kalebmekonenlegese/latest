import pathlib
import re

root = pathlib.Path('.')
pages = sorted(root.glob('*.html'))

nav_items = [
    ('index.html', 'home'),
    ('rooms.html', 'rooms'),
    ('restaurant.html', 'dining'),
    ('events.html', 'events'),
    ('gallery.html', 'gallery'),
    ('about.html', 'about us'),
    ('contact.html', 'contact us'),
]

page_active_map = {
    'index.html': 'index.html',
    'hotel.html': 'index.html',
    'rooms.html': 'rooms.html',
    'standard-room.html': 'rooms.html',
    'deluxe-room.html': 'rooms.html',
    'executive-suite.html': 'rooms.html',
    'family-room.html': 'rooms.html',
    'restaurant.html': 'restaurant.html',
    'dining-experience.html': 'restaurant.html',
    'events.html': 'events.html',
    'weddings.html': 'events.html',
    'conferences.html': 'events.html',
    'gallery.html': 'gallery.html',
    'virtual-tour.html': 'gallery.html',
    'about.html': 'about.html',
    'ai-assistant.html': 'about.html',
    'careers.html': 'about.html',
    'sustainability.html': 'about.html',
    'transportation.html': 'about.html',
    'blog.html': 'about.html',
    'privacy.html': 'about.html',
    'terms.html': 'about.html',
    'cookie-policy.html': 'about.html',
    'contact.html': 'contact.html',
    'faq.html': 'contact.html',
    'offers.html': 'contact.html',
    'booking.html': 'contact.html',
    'reviews.html': 'contact.html',
    'spa-wellness.html': 'gallery.html',
}

offer_links = [
    ('rooms.html', 'rooms'),
    ('restaurant.html', 'dining'),
    ('events.html', 'events'),
    ('gallery.html', 'gallery'),
    ('facilities.html', 'facilities'),
    ('offers.html', 'offers'),
    ('faq.html', 'faq'),
]

footer_quick = [
    ('index.html', 'Home'),
    ('rooms.html', 'Rooms'),
    ('restaurant.html', 'Dining'),
    ('events.html', 'Events'),
    ('gallery.html', 'Gallery'),
    ('about.html', 'About Us'),
    ('contact.html', 'Contact'),
    ('booking.html', 'Book Now'),
]

footer_explore = [
    ('ai-assistant.html', 'AI Concierge'),
    ('virtual-tour.html', 'Virtual Tour'),
    ('sustainability.html', 'Sustainability'),
    ('transportation.html', 'Transportation'),
    ('weddings.html', 'Weddings'),
    ('attractions.html', 'Attractions'),
    ('spa-wellness.html', 'Spa & Wellness'),
    ('hotel.html', 'Hotel'),
]

footer_more = [
    ('standard-room.html', 'Standard Room'),
    ('deluxe-room.html', 'Deluxe Room'),
    ('executive-suite.html', 'Executive Suite'),
    ('family-room.html', 'Family Room'),
    ('dining-experience.html', 'Dining Experience'),
    ('blog.html', 'Blog'),
    ('careers.html', 'Careers'),
    ('facilities.html', 'Facilities'),
]

header_template = '''<header class="topbar">
    <div class="topbar-inner">
      <div class="logo">
        <img loading="lazy" decoding="async" width="56" height="56" src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=120&q=80" alt="Hatsey Kaleb Hotel logo">
        <span class="logo-title">Hatsey Kaleb Hotel</span>
      </div>
      <nav id="primary-navigation" class="nav" aria-label="Primary navigation">
'''

footer_template = '''<footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><text x="50%" y="70%" text-anchor="middle" font-size="62" font-family="Arial" font-weight="700" fill="#111">H</text></svg>
          <div>
            <strong style="color:var(--text);">Hatsey Kaleb Hotel</strong>
            <p>Warm hospitality in Tigray — comfort, events, and dining.</p>
          </div>
        </div>
      </div>
      <div class="footer-links">
        <h3 style="color:var(--text); margin-top:0;">Quick Links</h3>
        <ul>
'''

footer_template_mid = '''        </ul>
      </div>
      <div class="footer-links">
        <h3 style="color:var(--text); margin-top:0;">Explore</h3>
        <ul>
'''

footer_template_end = '''        </ul>
      </div>
      <div class="footer-links">
        <h3 style="color:var(--text); margin-top:0;">More</h3>
        <ul>
'''

footer_template_tail = '''        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div>© 2025 Hatsey Kaleb Hotel. All rights reserved.</div>
      <div><a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms</a> · <a href="cookie-policy.html">Cookies</a></div>
      <div class="social-links">
        <a href="https://facebook.com/hatseykalebhotel" target="_blank" rel="noopener">facebook</a>
        <a href="https://instagram.com/hatseykalebhotel" target="_blank" rel="noopener">instagram</a>
        <a href="https://wa.me/251914754143" target="_blank" rel="noopener">whatsapp</a>
      </div>
    </div>
  </footer>
'''

header_pattern = re.compile(r'<header class="topbar">.*?</header>\s*', re.DOTALL)
footer_pattern = re.compile(r'<footer class="site-footer".*?</footer>\s*', re.DOTALL)

for path in pages:
    text = path.read_text(encoding='utf-8')
    base = path.name
    active_target = page_active_map.get(base, None)

    header_html = header_template
    for href, label in nav_items:
        active_attr = ' class="active"' if active_target == href else ''
        header_html += f'        <a href="{href}"{active_attr}>{label}</a>\n'
    header_html += '''      </nav>
      <button class="menu-toggle" type="button" aria-controls="primary-navigation" aria-expanded="false" aria-label="Toggle main navigation">
        <span class="hamburger" aria-hidden="true"></span>
        <span>menu</span>
      </button>
      <div class="language-menu">
        <button type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="language-list" aria-label="Language selector">lang <span class="icon" aria-hidden="true">⌵</span></button>
        <div id="language-list" class="language-list" role="menu" aria-label="Language selection">
          <a href="?lang=en" data-lang="en" role="menuitem">🇬🇧 English</a>
          <a href="?lang=am" data-lang="am" role="menuitem">🇪🇹 አማርኛ</a>
          <a href="?lang=ti" data-lang="ti" role="menuitem">🇪🇹 ትግርኛ</a>
        </div>
      </div>
      <div class="top-actions">
        <button type="button" aria-label="Sign up">sign up</button>
        <button type="button" aria-label="Sign in">sign in</button>
      </div>
    </div>
    <div class="offering-bar">
      <div class="offer-links">
'''
    for href, label in offer_links:
        header_html += f'        <a href="{href}">{label}</a>\n'
    header_html += '''      </div>
    </div>
  </header>
'''

    footer_html = footer_template
    for href, label in footer_quick:
        footer_html += f'          <li><a href="{href}">{label}</a></li>\n'
    footer_html += footer_template_mid
    for href, label in footer_explore:
        footer_html += f'          <li><a href="{href}">{label}</a></li>\n'
    footer_html += footer_template_end
    for href, label in footer_more:
        footer_html += f'          <li><a href="{href}">{label}</a></li>\n'
    footer_html += footer_template_tail

    new_text = text
    if header_pattern.search(new_text):
        new_text = header_pattern.sub(header_html, new_text, count=1)
    else:
        print('HEADER NOT FOUND', base)
    if footer_pattern.search(new_text):
        new_text = footer_pattern.sub(footer_html, new_text, count=1)
    else:
        print('FOOTER NOT FOUND', base)

    new_text = new_text.replace('href="/privacy"', 'href="privacy.html"').replace('href="/terms"', 'href="terms.html"')
    path.write_text(new_text, encoding='utf-8')
    print('UPDATED', base)
