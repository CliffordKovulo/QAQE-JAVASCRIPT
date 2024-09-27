let events = [];
let favoriteEvents = JSON.parse(localStorage.getItem('favorites')) || [];
let cart = []; // Global cart array

// Fetch events from JSON server asynchronously
async function fetchEvents() {
    try {
        const response = await fetch('http://localhost:3000/events');
        if (!response.ok) throw new Error('Failed to fetch events data');
        const data = await response.json();
        events = data;
        displayEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Display events dynamically
function displayEvents(events) {
    const eventContainer = document.getElementById('event-list');
    eventContainer.innerHTML = ''; // Clear previous content

    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.classList.add('event-card');
        eventCard.innerHTML = `
            <img data-src="${event.imageUrl}" alt="${event.title}">
            <h2>${event.title}</h2>
            <p>Price: $${event.price}</p>
            <p>Date: ${event.date}</p>
            <p>Location: ${event.location}</p>
            <button class="favorite-btn" data-id="${event.id}">
                ${favoriteEvents.includes(event.id) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            <button class="add-to-cart-btn" data-id="${event.id}">Add to Cart</button>
        `;
        eventContainer.appendChild(eventCard);
    });

    setupLazyLoading();
    setupFavoriteButtons();
    setupCartButtons(); // Call to set up "Add to Cart" buttons
}

// Setup add-to-cart buttons
function setupCartButtons() {
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');
    cartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const eventId = parseInt(this.getAttribute('data-id'));
            addToCart(eventId);
        });
    });
}

// Add item to the cart
function addToCart(eventId) {
    const event = events.find(item => item.id === eventId);
    const existingItem = cart.find(item => item.id === eventId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...event, quantity: 1 });
    }

    updateCartUI(); // Update the cart UI after adding item
}

// Update cart UI
function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = ''; // Clear the cart UI

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <h3>${item.title} (${item.quantity})</h3>
            <p>Price: $${item.price * item.quantity}</p>
            <button onclick="increaseCartItem(${item.id})">+</button>
            <button onclick="decreaseCartItem(${item.id})">-</button>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartContainer.appendChild(cartItem);
    });

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    document.getElementById('cart-total').textContent = `Total: $${cartTotal}`;
}

// Increase item quantity in the cart
function increaseCartItem(eventId) {
    const item = cart.find(item => item.id === eventId);
    if (item) {
        item.quantity += 1;
    }
    updateCartUI();
}

// Decrease item quantity in the cart
function decreaseCartItem(eventId) {
    const item = cart.find(item => item.id === eventId);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
    } else {
        removeFromCart(eventId);
    }
    updateCartUI();
}

// Remove item from the cart
function removeFromCart(eventId) {
    cart = cart.filter(item => item.id !== eventId);
    updateCartUI();
}

// Handle filtering by location
document.getElementById('location-filter').addEventListener('change', function () {
    const filterBy = this.value;
    const filteredEvents = filterBy === 'all' ? events : events.filter(event => event.location.includes(filterBy));
    displayEvents(filteredEvents);
});

// Handle sorting by price or date
document.getElementById('sort').addEventListener('change', function () {
    const sortBy = this.value;
    const sortedEvents = [...events].sort((a, b) => {
        if (sortBy === 'price') {
            return a.price - b.price;
        } else if (sortBy === 'date') {
            return new Date(a.date) - new Date(b.date);
        }
    });
    displayEvents(sortedEvents);
});

// Setup favorite buttons for adding/removing favorites
function setupFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const eventId = parseInt(this.getAttribute('data-id'));
            toggleFavorite(eventId);
            displayEvents(events); // Re-render events to reflect favorite changes
        });
    });
}

// Toggle favorite events and update localStorage
function toggleFavorite(eventId) {
    if (favoriteEvents.includes(eventId)) {
        favoriteEvents = favoriteEvents.filter(id => id !== eventId);
    } else {
        favoriteEvents.push(eventId);
    }
    localStorage.setItem('favorites', JSON.stringify(favoriteEvents));
}

// Lazy load images for better performance
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => observer.observe(img));
}

// Initialize the page by fetching events
fetchEvents();
