// Initialize an empty cart array 
let cart = [];

if (window.location.pathname.includes('index.html')) {
  localStorage.removeItem('cart')
}

function updateLocalStorage() {
localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to add movies to the cart
function addToCart(movie, price, quantity, date, time) {
  const qty = parseInt(quantity, 10); 
  if (isNaN(qty) || qty <= 0) { 
    showAlert("Please enter a valid quantity!"); 
    return; 
  }

  // Check if the movie already exists in the cart
  const existingMovie = cart.find(item => item.name === movie && item.date === date && item.time === time); 
  if (existingMovie) {
    existingMovie.quantity += qty; 
  }
  else {
    cart.push({name: movie, price, quantity: qty, date, time}); 
  }
  updateCart(); 
  updateLocalStorage();

  // Reset quantity input field for the movie after adding to cart
  const quantityInput = document.getElementById(`quantity-${movie.split(' ')[0].toLowerCase()}`);
  quantityInput.value = 1; // Reset the value to 1

  alert(`${movie} added to the cart successfully!`);
}

// Function to update the cart display on the page
function updateCart() {
  const cartMovies = document.getElementById('cart-movies'); 
  const totalPrice = document.getElementById('total-price'); 
  cartMovies.innerHTML = ''; 
  let total = 0; 

  // Loop through the cart and display each movie's details
  cart.forEach((movie, index) => {
    const row = document.createElement('tr'); 
    row.innerHTML = `
      <td>${movie.name}</td> 
      <td>${movie.price}</td>
      <td>
        <input type="number" min="1" value="${movie.quantity}" 
               onchange="updateQuantity(${index}, this.value)"> 
      </td>
      <td>${movie.date}</td>
      <td>${movie.time}</td>
      <td>${(movie.price * movie.quantity).toFixed(2)}</td> 
      <td>
        <button onclick="removeItem(${index})">Remove</button> 
      </td>
    `;
    cartMovies.appendChild(row); 
    total += movie.price * movie.quantity; 
  });

  totalPrice.textContent = `Rs. ${total.toFixed(2)}`; 
}

// Function to update the quantity of a movie in the cart
function updateQuantity(index, newQuantity) {
  const quantity = parseInt(newQuantity, 10); 
  if (quantity > 0) { 
    cart[index].quantity = quantity; 
    updateCart(); 
    updateLocalStorage();
  } 
  else {
    alert("Quantity must be at least 1"); 
    updateCart(); 
  }
}

// Function to remove a movie from the cart
function removeItem(index) {
  cart.splice(index, 1); 
  updateCart(); 
  updateLocalStorage();
}

// Function to proceed to the checkout page
function proceedToCheckout() {
  if (cart.length === 0) { 
    alert("Your cart is empty. Add movies to proceed."); 
    return; 
  }
  // Save the current cart data in local storage for the checkout page
  localStorage.setItem('cart', JSON.stringify(cart));
  window.location.href = 'Checkout.html'; 
}

// Function to load the cart details from local storage on the checkout page
function loadCartFromStorage() {
  const storedCart = localStorage.getItem('cart'); 
  if (storedCart) {
    cart = JSON.parse(storedCart); 
    displayCheckout(); 
  }
}

// Function to display the order details on the checkout page
function displayCheckout() {
    const checkoutMovies = document.getElementById('checkout-movies'); 
    const checkoutTotal = document.getElementById('checkout-total'); 
    checkoutMovies.innerHTML = ''; 
    let total = 0; 
  
    // Loop through the cart and display each movie's details
    cart.forEach(movie => {
      const row = document.createElement('tr'); 
      row.innerHTML = `
        <td>${movie.name}</td> 
        <td>${movie.price}</td>
        <td>${movie.quantity}</td> 
        <td>${movie.date}</td>
        <td>${movie.time}</td>
        <td>${(movie.price * movie.quantity).toFixed(2)}</td> 
      `;
      checkoutMovies.appendChild(row); 
      total += movie.price * movie.quantity; 
    });
  
    checkoutTotal.textContent = `Rs. ${total.toFixed(2)}`; 
}

// Function to save the current order to favourites
function saveAsFavourites() {
  if (cart.length === 0) {
    alert("Please add movies to the cart before saving to favourites!");
  } 
  else {
    localStorage.setItem('favourites', JSON.stringify(cart)); 
    alert('Favourites saved!');
  }
}
  
// Function to load saved favourites and apply them to the cart
function applyFavourites() {
    const savedFavourites = localStorage.getItem('favourites'); 
    if (savedFavourites) {
      const favourites = JSON.parse(savedFavourites);
      favourites.forEach(favMovie => {
        const existingMovie = cart.find(item => item.name === favMovie.name && item.date === favMovie.date && item.time === favMovie.time);
        if (existingMovie) {
          existingMovie.quantity += favMovie.quantity;
        } 
        else {
          cart.push(favMovie);
        }
      });
      updateCart(); 
      updateLocalStorage();
      alert('Favourites applied successfully!');
    } 
    else {
      alert('No favourites found!');
    }
}

// Load the cart on the checkout page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  loadCartFromStorage();
  populateMovieDropdown();
  document.getElementById('movie-select').addEventListener('change', renderSeatMap);
});

document.addEventListener('click', function(event) {
  
  if (event.target.classList.contains('add-to-cart')) {
    const button = event.target;
    const movieName = button.getAttribute('data-movie');
    const price = parseFloat(button.getAttribute('data-price'));
    const quantityId = button.getAttribute('data-quantity-id');
    const dateId = button.getAttribute('data-date-id');
    const timeId = button.getAttribute('data-time-id');
    const quantity = document.getElementById(quantityId).value;
    const date = document.getElementById(dateId).value;
    const time = document.getElementById(timeId).value;
    addToCart(movieName, price, quantity, date, time);
  }

  if (event.target.id === 'proceed-to-checkout') {
    proceedToCheckout();
  }

  if (event.target.id === 'save-as-favourites') {
    saveAsFavourites();
  }
    
  if (event.target.id === 'apply-favourites') {
    applyFavourites();

  }
});  

const bookedSeatsByMovie = {}; 
let selectedSeatType = {};
let selectedSeats = [];
let seatPrice = 0;

// Generate dropdown from cart
function populateMovieDropdown() {
  const select = document.getElementById("movie-select");
  select.innerHTML = '<option value="">-- Select a movie --</option>';
  cart.forEach(movie => {
    const option = document.createElement("option");
    option.value = `${movie.name}_${movie.date}_${movie.time}`;
    option.textContent = `${movie.name} (${movie.date}) (${movie.time})`;
    select.appendChild(option);
  });
}

function getSeatType(seatId) {
  const row = seatId.charAt(0);
  if (['A', 'B'].includes(row)) return 'VIP';
  if (['C', 'D'].includes(row)) return 'Premium';
  return 'Standard'; // row E
}

function getSeatPrice(basePrice, seatId) {
  const seatType = getSeatType(seatId);
  if (seatType === "VIP") return basePrice + 600;
  if (seatType === "Premium") return basePrice + 300;
  return basePrice; // Standard
}

function renderSeatMap() {
  const selectedMovieName = document.getElementById("movie-select").value;
  const seatContainer = document.getElementById("seat-map");
  seatContainer.innerHTML = ''; // Clear previous map

  if (!selectedMovieName) return;

  const [name, date, time] = selectedMovieName.split('_');
  const movie = cart.find(item =>
    item.name === name &&
    item.date === date &&
    item.time === time
  );

  if (!movie) return;

  selectedSeats = [];
  seatPrice = movie.price;

  const rows = ['A', 'B', 'C', 'D', 'E']; 
  const cols = 10;

  const selectedKey = `${movie.name}_${movie.date}_${movie.time}`;
  const bookedSeatsData = JSON.parse(localStorage.getItem('bookedSeats')) || {};
  const movieBookedSeats = bookedSeatsData[selectedKey] || [];

  // Load previously selected seats from localStorage
  const selectedSeatsData = JSON.parse(localStorage.getItem('selectedSeats')) || {};
  const previouslySelected = selectedSeatsData[selectedKey] || [];

  rows.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'seat-row';

    for (let col = 1; col <= cols; col++) {
      const seatId = `${row}${col}`;
      const seatDiv = document.createElement('div');
      seatDiv.className = 'seat';
      seatDiv.textContent = seatId;

      if (movieBookedSeats.includes(seatId)) {
        seatDiv.classList.add('booked');
        seatDiv.style.pointerEvents = 'none';
      } else if (previouslySelected.includes(seatId)) {
        selectedSeats.push(seatId);
        seatDiv.classList.add("selected");
        seatDiv.addEventListener('click', () => toggleSeat(seatDiv, seatId, movie));
      } else {
        seatDiv.addEventListener('click', () => toggleSeat(seatDiv, seatId, movie));
      }

      rowDiv.appendChild(seatDiv);
    }

    seatContainer.appendChild(rowDiv);
  });
  refreshSeatDetails();
}

function toggleSeat(seatElement, seatId, movie) {
  const key = `${movie.name}_${movie.date}_${movie.time}`;
  const seatType = getSeatType(seatId);  
  const existingSeatType = selectedSeats.length > 0 ? getSeatType(selectedSeats[0]) : null;

  const bookedSeatsData = JSON.parse(localStorage.getItem('bookedSeats')) || {};
  const bookedSeatsByMovie = bookedSeatsData[key] || [];
  if (bookedSeatsByMovie.includes(seatId)) {

    return;
  }

  if (existingSeatType && seatType !== existingSeatType) {
    alert(`You can only select seats of one type (${existingSeatType}). Please deselect current seats to choose ${seatType} seats.`);
    return;
  }

  const index = selectedSeats.indexOf(seatId);
  let selectedData = JSON.parse(localStorage.getItem('selectedSeats')) || {};
  if (!selectedData[key]) selectedData[key] = [];

  if (index > -1) {
    selectedSeats.splice(index, 1);
    seatElement.classList.remove("selected");
    selectedData[key] = selectedData[key].filter(s => s !== seatId);
  } else {
    if (selectedSeats.length >= movie.quantity) {
      alert("You've selected the maximum number of seats for this movie.");
      return;
    }
    selectedSeats.push(seatId);
    seatElement.classList.add("selected");
    selectedData[key].push(seatId);
  }

  localStorage.setItem('selectedSeats', JSON.stringify(selectedData));
  refreshSeatDetails();
}

function refreshSeatDetails() {
  const selectedMovieName = document.getElementById("movie-select").value;
  if (!selectedMovieName) return;

  const movieRow = Array.from(document.querySelectorAll("#checkout-table tbody tr"))
  .find(row => selectedMovieName === `${row.cells[0].textContent}_${row.cells[3].textContent}_${row.cells[4].textContent}`);

  if (!movieRow) return;

  const [name, date, time] = selectedMovieName.split('_');
  const movie = cart.find(item =>
    item.name === name &&
    item.date === date &&
    item.time === time
  );

  if (!movie) 
    return;

  const key = `${movie.name}_${movie.date}_${movie.time}`;
  const selectedData = JSON.parse(localStorage.getItem('selectedSeats')) || {};
  const currentSelected = selectedData[key] || [];

  let total = 0;
  currentSelected.forEach(seatId => {
    total += getSeatPrice(movie.price, seatId);
  });

  const quantity = currentSelected.length;
  const pricePerSeat = quantity > 0 ? total / quantity : movie.price;

  movieRow.cells[1].textContent = `${pricePerSeat.toFixed(2)}`; 
  movieRow.cells[2].textContent = quantity; 
  movieRow.cells[5].textContent = `${(pricePerSeat * quantity).toFixed(2)}`; 

  updateCheckoutTotal();
}

function updateCheckoutTotal() {
  const rows = document.querySelectorAll("#checkout-table tbody tr");
  let checkoutTotal = 0;

  rows.forEach(row => {
    const totalCell = row.cells[5];
    const amount = parseFloat(totalCell.textContent);
    if (!isNaN(amount)) {
      checkoutTotal += amount;
    }
  });

  const checkoutTotalElement = document.getElementById("checkout-total");
  if (checkoutTotalElement) {
    checkoutTotalElement.textContent = `Rs. ${checkoutTotal.toFixed(2)}`;
  }
}

function generateBookingReference() {
  return 'REF' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}

// Function to handle payment validation and completion
function handlePayment(event) {
  event.preventDefault();

  const selectedData = JSON.parse(localStorage.getItem('selectedSeats')) || {};
  const bookedData = JSON.parse(localStorage.getItem('bookedSeats')) || {};

  const incompleteSelections = [];
  
  const allSeatsSelected = cart.every(movie => {
    const key = `${movie.name}_${movie.date}_${movie.time}`;
    const seats = selectedData[key] || [];
    const expectedQuantity = movie.quantity;

    if (seats.length < expectedQuantity) {
      incompleteSelections.push({
        name: movie.name,
        expected: expectedQuantity,
        selected: seats.length
      });
      return false;
    }
    return true;
  });

if (!allSeatsSelected) {
  const errorMessages = incompleteSelections.map(item =>
    `Movie: ${item.name}\nTickets in cart: ${item.expected}, Seats selected: ${item.selected}\nYou need to select ${item.expected - item.selected} more seat(s).`
  ).join('\n\n');

  alert("Seat selection incomplete:\n\n" + errorMessages);
  return;
}

  const summary = [];

  cart.forEach(movie => {
    const key = `${movie.name}_${movie.date}_${movie.time}`;
    const seats = selectedData[key];

    // Book the seats
    if (!bookedData[key]) bookedData[key] = [];
    bookedData[key] = [...bookedData[key], ...seats];

    // Save for confirmation message
    summary.push({
      name: movie.name,
      date: movie.date,
      time: movie.time,
      seats: seats
    });
    
    // Clear selected seats
    delete selectedData[key]; 
  });

  localStorage.setItem('bookedSeats', JSON.stringify(bookedData));
  localStorage.setItem('selectedSeats', JSON.stringify(selectedData));

  // Continue with form validation...
  const fullName = document.getElementById("full-name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const cardType = document.getElementById("card-type").value.trim();
  const cardNumber = document.getElementById("card-number").value.trim();
  const expireMonth = parseInt(document.getElementById("expire-month").value, 10);
  const expireYear = parseInt(document.getElementById("expire-year").value, 10);
  const cvv = document.getElementById("cvv").value.trim();

  if (!fullName || !phone || !email || !cardType || !cardNumber || !expireMonth || !expireYear || !cvv) {
    showAlert("Please complete all fields!", "error");
    return;
  }

  if (phone.length !== 10 || !/^\d+$/.test(phone)) {
    showAlert("Invalid phone number!", "error");
    return;
  }

  if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
    showAlert("Invalid card number!", "error");
    return;
  }

  if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
    showAlert("Invalid CVV!", "error");
    return;
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  if (expireYear < currentYear || (expireYear === currentYear && expireMonth < currentMonth)) {
    showAlert("Invalid expiration date!", "error");
    return;
  }

  const reference = generateBookingReference();
  
  let message = `Thank you for your booking!\n\nBooking Reference: ${reference}\n\n`;
  summary.forEach(item => {
    message += `Movie: ${item.name}\nDate: ${item.date}\nTime: ${item.time}\nSeats: ${item.seats.join(', ')}\n\n`;
  });

  alert(message);

  const formSection = document.getElementById("checkout-form");
  formSection.style.display = "none";

  const confirmationMessage = document.createElement("div");
  confirmationMessage.className = "confirmation";
  confirmationMessage.innerHTML = `
    <p>Your booking has been placed successfully.</p>
    <p>We appreciate you choosing us and look forward to serving you again!</p>
  `;
  const footer = document.querySelector("footer"); 
  document.body.insertBefore(confirmationMessage, footer);

  const checkoutTableRows = document.querySelectorAll("#checkout-table tbody tr");
  checkoutTableRows.forEach(row => {
    row.cells[2].textContent = '0'; // Quantity
    row.cells[5].textContent = '0.00'; // Total
  });

  updateCheckoutTotal();      
  populateMovieDropdown();    
  renderSeatMap(); 
}




  
