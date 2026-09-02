#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PAGES_TO_CHECK = [
  'index.html',
  'about.html',
  'rooms.html',
  'booking.html',
  'ai-assistant.html',
  'contact.html',
  'reviews.html',
  'gallery.html'
];

console.log('🔍 AUDITING IMAGES FOR ALT TEXT\n');

for (const page of PAGES_TO_CHECK) {
  const filePath = path.join(__dirname, '..', page);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${page} not found`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find all img tags
  const imgRegex = /<img[^>]*>/g;
  const imgTags = content.match(imgRegex) || [];

  let imagesWithAlt = 0;
  let imagesWithoutAlt = [];

  for (const tag of imgTags) {
    if (tag.includes('alt=') || tag.includes("alt='") || tag.includes('alt="')) {
      imagesWithAlt++;
    } else {
      imagesWithoutAlt.push(tag.substring(0, 100));
    }
  }

  console.log(`\n📄 ${page}`);
  console.log(`  Total <img> tags: ${imgTags.length}`);
  console.log(`  With alt text: ${imagesWithAlt}`);
  console.log(`  Missing alt text: ${imagesWithoutAlt.length}`);

  if (imagesWithoutAlt.length > 0) {
    console.log(`\n  Images missing alt text:`);
    for (const img of imagesWithoutAlt) {
      console.log(`    ${img}...`);
    }
  }
}
