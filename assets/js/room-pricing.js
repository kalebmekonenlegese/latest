(function loadAuthoritativeRoomPricing() {
  const isStaticPreview = window.location.port === '5000';
  if (isStaticPreview) return;

  const apiBase = window.HotelAppConfig?.env?.VITE_API_URL || window.location.origin;
  fetch(`${apiBase}/api/availability/rooms`, { credentials: 'include' })
    .then((response) => {
      if (!response.ok) throw new Error('Room pricing request failed');
      return response.json();
    })
    .then(({ rooms = [] }) => {
      const prices = Object.fromEntries(rooms.map((room) => [room.roomType, room.pricePerNight]));
      document.querySelectorAll('[data-room-type]').forEach((element) => {
        const price = prices[element.dataset.roomType];
        if (price !== undefined) {
          element.textContent = element.classList.contains('price')
            ? `From $${price}${element.textContent.includes('/night') ? '/night' : ''}`
            : `$${price}+`;
        }
      });

      document.querySelectorAll('.room-card[data-room-id]').forEach((card) => {
        const roomType = `${card.dataset.roomId}-room` === 'executive-room'
          ? 'executive-suite'
          : `${card.dataset.roomId}-room`;
        const price = prices[roomType];
        if (price === undefined) return;
        card.dataset.price = price;
        const priceElement = card.querySelector('.price');
        if (priceElement) priceElement.textContent = `From $${price}/night`;
      });
    })
    .catch((error) => console.warn('Authoritative room pricing unavailable:', error));

})();
