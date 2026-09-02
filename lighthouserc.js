module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:8080/",
        "http://localhost:8080/booking.html",
        "http://localhost:8080/rooms.html",
        "http://localhost:8080/contact.html",
        "http://localhost:8080/hotel.html"
      ],

      settings: {
        chromeFlags: "--no-sandbox --headless",
        preset: "desktop"
      }
    },

    assert: {
      assertions: {
        "categories:performance": [
          "error",
          {
            minScore: 0.9
          }
        ]
      }
    },

    upload: {
      target: "temporary-public-storage"
    }
  }
};