// List of products shown on the kiosk.
const products = [
    { id: 1, name: "Coffee", price: 45, icon: "&#9749;" },
    { id: 2, name: "Sandwich", price: 50, icon: "&#129386;" },
    { id: 3, name: "Soft Drink", price: 35, icon: "&#129380;" },
    { id: 4, name: "Cookies", price: 25, icon: "&#127850;" },
    { id: 5, name: "Bottled Water", price: 20, icon: "&#128167;" },
    { id: 6, name: "Chocolate", price: 25, icon: "&#127851;" }
];

// The cart starts empty. Items are added here when products are tapped.
let cart = [];

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const transactionTotal = document.getElementById("transactionTotal");
const summaryButton = document.getElementById("summaryButton");
const itemSelectionScreen = document.getElementById("itemSelectionScreen");
const orderSummaryScreen = document.getElementById("orderSummaryScreen");
const paymentScreen = document.getElementById("paymentScreen");
const summaryItems = document.getElementById("summaryItems");
const summaryTotal = document.getElementById("summaryTotal");
const paymentTotal = document.getElementById("paymentTotal");
const backToItemsButton = document.getElementById("backToItemsButton");
const continuePaymentButton = document.getElementById("continuePaymentButton");
const backToSummaryButton = document.getElementById("backToSummaryButton");

function formatPeso(amount) {
    return "\u20B1" + amount.toFixed(2);
}

function calculateTotal() {
    let totalPrice = 0;

    cart.forEach(function(item) {
        totalPrice += item.price * item.quantity;
    });

    return totalPrice;
}

// Shows one screen and hides the other screens.
function showScreen(screenToShow) {
    itemSelectionScreen.classList.add("hidden");
    orderSummaryScreen.classList.add("hidden");
    paymentScreen.classList.add("hidden");

    screenToShow.classList.remove("hidden");
    window.scrollTo(0, 0);
}

// Creates the large product buttons from the products array.
function displayProducts() {
    productGrid.innerHTML = "";

    products.forEach(function(product) {
        const productButton = document.createElement("button");
        productButton.className = "product-card";
        productButton.innerHTML = `
            <span class="product-icon">${product.icon}</span>
            <span class="product-name">${product.name}</span>
            <span class="product-price">${formatPeso(product.price)}</span>
        `;

        productButton.addEventListener("click", function() {
            addToCart(product.id);
        });

        productGrid.appendChild(productButton);
    });
}

// Adds a product to the cart or increases quantity if it is already there.
function addToCart(productId) {
    const product = products.find(function(item) {
        return item.id === productId;
    });

    const existingCartItem = cart.find(function(item) {
        return item.id === productId;
    });

    if (existingCartItem) {
        existingCartItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    displayCart();
}

// Changes quantity. If quantity reaches zero, the item is removed.
function changeQuantity(productId, changeAmount) {
    const cartItem = cart.find(function(item) {
        return item.id === productId;
    });

    if (!cartItem) {
        return;
    }

    cartItem.quantity += changeAmount;

    if (cartItem.quantity <= 0) {
        removeFromCart(productId);
    } else {
        displayCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(function(item) {
        return item.id !== productId;
    });

    displayCart();
}

// Rebuilds the cart area and recalculates totals every time the cart changes.
function displayCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tap a product to add it here.</p>';
    }

    cart.forEach(function(item) {
        const subtotal = item.price * item.quantity;
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <div class="cart-item-top">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">${formatPeso(item.price)}</span>
            </div>
            <div class="cart-controls">
                <button class="quantity-button minus-button" type="button">&minus;</button>
                <span class="quantity-value">Qty: ${item.quantity}</span>
                <button class="quantity-button plus-button" type="button">+</button>
            </div>
            <p class="cart-item-subtotal">Subtotal: ${formatPeso(subtotal)}</p>
            <button class="remove-button" type="button">Remove</button>
        `;

        cartItem.querySelector(".minus-button").addEventListener("click", function() {
            changeQuantity(item.id, -1);
        });

        cartItem.querySelector(".plus-button").addEventListener("click", function() {
            changeQuantity(item.id, 1);
        });

        cartItem.querySelector(".remove-button").addEventListener("click", function() {
            removeFromCart(item.id);
        });

        cartItems.appendChild(cartItem);
    });

    updateTotals();
}

function updateTotals() {
    let totalQuantity = 0;

    cart.forEach(function(item) {
        totalQuantity += item.quantity;
    });

    cartCount.textContent = totalQuantity === 1 ? "1 item" : totalQuantity + " items";
    transactionTotal.textContent = formatPeso(calculateTotal());
}

// Builds the order summary from the current cart.
function displayOrderSummary() {
    summaryItems.innerHTML = "";

    if (cart.length === 0) {
        summaryItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    }

    cart.forEach(function(item) {
        const subtotal = item.price * item.quantity;
        const summaryItem = document.createElement("div");
        summaryItem.className = "summary-item";
        summaryItem.innerHTML = `
            <span class="summary-name">${item.name}</span>
            <span>${formatPeso(item.price)}</span>
            <span>Qty: ${item.quantity}</span>
            <strong>${formatPeso(subtotal)}</strong>
        `;

        summaryItems.appendChild(summaryItem);
    });

    summaryTotal.textContent = formatPeso(calculateTotal());
}

function goToOrderSummary() {
    displayOrderSummary();
    showScreen(orderSummaryScreen);
}

function goToPayment() {
    paymentTotal.textContent = formatPeso(calculateTotal());
    showScreen(paymentScreen);
}

summaryButton.addEventListener("click", goToOrderSummary);
backToItemsButton.addEventListener("click", function() {
    showScreen(itemSelectionScreen);
});
continuePaymentButton.addEventListener("click", goToPayment);
backToSummaryButton.addEventListener("click", function() {
    displayOrderSummary();
    showScreen(orderSummaryScreen);
});

displayProducts();
displayCart();
