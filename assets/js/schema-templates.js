/**
 * SEO Schema Templates
 * Reusable JSON-LD structured data for different page types
 */

export const HOTEL_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  '@id': 'https://hatseykalebhotel.com',
  name: 'Hatsey Kaleb Hotel',
  description:
    'Luxury hotel offering comfortable rooms, fine dining, event spaces, and warm hospitality in Tigray, Ethiopia.',
  image: ['https://hatseykalebhotel.com/images/hotel-hero.svg'],
  url: 'https://hatseykalebhotel.com/',
  telephone: '+251914754143',
  email: 'reservations@hatseykalebhotel.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Abiy Adi',
    addressLocality: 'Abiy Adi',
    postalCode: '1001',
    addressCountry: 'ET',
    addressRegion: 'Tigray'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 13.6259237,
    longitude: 38.9940929,
    name: 'Hatsey Kaleb Hotel Location'
  },
  sameAs: [
    'https://www.facebook.com/hatseykalebhotel',
    'https://www.instagram.com/hatseykalebhotel',
    'https://www.twitter.com/hatseykaleb'
  ],
  priceRange: '$$',
  starRating: {
    '@type': 'Rating',
    ratingValue: '4.5',
    bestRating: '5'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.5',
    reviewCount: '328',
    bestRating: '5',
    worstRating: '1'
  },
  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://hatseykalebhotel.com/booking.html'
    }
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59'
  },
  amenityFeature: [
    'Free WiFi',
    'Restaurant',
    'Spa',
    'Conference Rooms',
    'Swimming Pool',
    'Parking',
    '24/7 Room Service'
  ],
  checkinTime: '14:00',
  checkoutTime: '11:00',
  petsAllowed: true,
  member: [
    {
      '@type': 'ProgramMembership',
      programName: 'Hotel Loyalty Program',
      url: 'https://hatseykalebhotel.com/loyalty'
    }
  ]
};

export const BREADCRUMB_SCHEMA = (breadcrumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export const FAQ_SCHEMA = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export const ROOM_SCHEMA = (room) => ({
  '@context': 'https://schema.org',
  '@type': 'HotelRoom',
  name: room.name,
  description: room.description,
  image: room.images,
  url: room.url,
  occupancy: {
    '@type': 'QuantitativeValue',
    minValue: room.minOccupancy,
    maxValue: room.maxOccupancy
  },
  amenityFeature: room.amenities || [],
  floorSize: {
    '@type': 'QuantitativeValue',
    value: room.squareFeet,
    unitCode: 'FTK'
  },
  offers: {
    '@type': 'Offer',
    price: room.price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: room.bookingUrl
  },
  beds: room.beds || 1,
  numberOfBathroomsTotal: room.bathrooms || 1
});

export const RESTAURANT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Hatsey Kaleb Hotel Restaurant',
  description: 'Fine dining restaurant offering Ethiopian and international cuisine.',
  url: 'https://hatseykalebhotel.com/restaurant.html',
  image: 'https://hatseykalebhotel.com/images/restaurant-hero.svg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Abiy Adi',
    addressLocality: 'Abiy Adi',
    postalCode: '1001',
    addressCountry: 'ET'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 13.6259237,
    longitude: 38.9940929
  },
  telephone: '+251914754143',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '22:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '07:00',
      closes: '23:00'
    }
  ],
  cuisineType: ['Ethiopian', 'International'],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    reviewCount: '156'
  },
  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://hatseykalebhotel.com/restaurant.html'
    }
  }
};

export const EVENT_SCHEMA = (event) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: event.name,
  description: event.description,
  startDate: event.startDate,
  endDate: event.endDate,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Hatsey Kaleb Hotel',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Abiy Adi',
      addressLocality: 'Abiy Adi',
      addressCountry: 'ET'
    }
  },
  image: event.image,
  organizer: {
    '@type': 'Organization',
    name: 'Hatsey Kaleb Hotel',
    url: 'https://hatseykalebhotel.com'
  },
  offers: {
    '@type': 'Offer',
    url: 'https://hatseykalebhotel.com/booking.html',
    price: event.price || '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/PreOrder',
    validFrom: new Date().toISOString().split('T')[0]
  }
});

export const REVIEW_SCHEMA = (review) => ({
  '@context': 'https://schema.org',
  '@type': 'Review',
  '@id': `https://hatseykalebhotel.com/reviews#review-${review.id}`,
  itemReviewed: {
    '@type': 'Hotel',
    name: 'Hatsey Kaleb Hotel',
    url: 'https://hatseykalebhotel.com'
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: review.rating,
    bestRating: '5'
  },
  name: review.title,
  reviewBody: review.comment,
  author: {
    '@type': 'Person',
    name: review.authorName
  },
  datePublished: review.datePublished,
  publisher: {
    '@type': 'Organization',
    name: 'Hatsey Kaleb Hotel'
  }
});

export const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Hatsey Kaleb Hotel',
  description:
    'Luxury hotel with comfortable rooms, fine dining, spa, and event spaces in Tigray, Ethiopia.',
  image: ['https://hatseykalebhotel.com/images/hotel-hero.svg'],
  url: 'https://hatseykalebhotel.com/',
  telephone: '+251914754143',
  email: 'info@hatseykalebhotel.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Abiy Adi',
    addressLocality: 'Abiy Adi',
    postalCode: '1001',
    addressCountry: 'ET',
    addressRegion: 'Tigray'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 13.6259237,
    longitude: 38.9940929
  },
  sameAs: [
    'https://www.facebook.com/hatseykalebhotel',
    'https://www.instagram.com/hatseykalebhotel',
    'https://www.twitter.com/hatseykaleb'
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59'
  },
  priceRange: '$$',
  areaServed: ['Tigray', 'Ethiopia', 'East Africa'],
  foundingDate: '2020',
  employee: {
    '@type': 'EmployeeRole',
    title: 'Hotel Staff',
    numberOfEmployees: '50+'
  }
};

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hatsey Kaleb Hotel',
  url: 'https://hatseykalebhotel.com',
  logo: 'https://hatseykalebhotel.com/images/logo.svg',
  description: 'Premium hotel providing luxury accommodation and services in Tigray, Ethiopia.',
  foundingDate: '2020',
  founder: {
    '@type': 'Person',
    name: 'Hatsey Kaleb Hotel Management'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    telephone: '+251914754143',
    email: 'support@hatseykalebhotel.com',
    areaServed: ['ET'],
    availableLanguage: ['en', 'am']
  },
  sameAs: [
    'https://www.facebook.com/hatseykalebhotel',
    'https://www.instagram.com/hatseykalebhotel',
    'https://www.twitter.com/hatseykaleb'
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Abiy Adi',
    addressLocality: 'Abiy Adi',
    postalCode: '1001',
    addressCountry: 'ET'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.5',
    reviewCount: '328'
  }
};

export const META_TAGS = {
  chargeSet: 'UTF-8',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5.0',
  description:
    'Luxury hotel in Tigray, Ethiopia offering comfortable rooms, fine dining, spa services, and event spaces.',
  keywords:
    'hotel tigray, accommodation tigray, luxury hotel ethiopia, hatsey kaleb hotel, abiy adi hotel',
  author: 'Hatsey Kaleb Hotel',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  'format-detection': 'telephone=no',
  'app-mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-status-bar-style': 'black-translucent'
};

export default {
  HOTEL_SCHEMA,
  BREADCRUMB_SCHEMA,
  FAQ_SCHEMA,
  ROOM_SCHEMA,
  RESTAURANT_SCHEMA,
  EVENT_SCHEMA,
  REVIEW_SCHEMA,
  LOCAL_BUSINESS_SCHEMA,
  ORGANIZATION_SCHEMA,
  META_TAGS
};
