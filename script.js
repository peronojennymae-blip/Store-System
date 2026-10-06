// List of products shown on the kiosk.

const SUPABASE_URL = "https://ynjbvwcszuftpgfxraqs.supabase.co";

const SUPABASE_KEY = "sb_publishable_h1BOGoCKbnFsbVX5mC3uPA_hfZYgkTB";

let db = null;

if (window.supabase) {
    db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
}

async function testDatabaseConnection() {
    if (!db) {
        console.log("Supabase library is not loaded yet.");
        return;
    }

    const { data, error } = await db
        .from("products")
        .select("*");

    if (error) {
        console.error("Database connection failed:", error);
        return;
    }

    console.log("Supabase connected successfully!");
    console.log(data);
}

testDatabaseConnection();


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
let completedTransaction = null;
let isProcessingPayment = false;

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const transactionTotal = document.getElementById("transactionTotal");
const cartError = document.getElementById("cartError");
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
const cashPaymentButton = document.getElementById("cashPaymentButton");
const qrPaymentButton = document.getElementById("qrPaymentButton");
const cardPaymentButton = document.getElementById("cardPaymentButton");
const cashScreen = document.getElementById("cashScreen");
const qrScreen = document.getElementById("qrScreen");
const cardScreen = document.getElementById("cardScreen");
const successScreen = document.getElementById("successScreen");
const cashTotal = document.getElementById("cashTotal");
const qrTotal = document.getElementById("qrTotal");
const cardTotal = document.getElementById("cardTotal");
const amountPaidInput = document.getElementById("amountPaidInput");
const cashError = document.getElementById("cashError");
const cashPayNowButton = document.getElementById("cashPayNowButton");
const confirmQrPaymentButton = document.getElementById("confirmQrPaymentButton");
const processCardPaymentButton = document.getElementById("processCardPaymentButton");
const cardProcessingMessage = document.getElementById("cardProcessingMessage");
const backToPaymentFromCashButton = document.getElementById("backToPaymentFromCashButton");
const backToPaymentFromQrButton = document.getElementById("backToPaymentFromQrButton");
const backToPaymentFromCardButton = document.getElementById("backToPaymentFromCardButton");
const successTotal = document.getElementById("successTotal");
const successAmountPaid = document.getElementById("successAmountPaid");
const successMethod = document.getElementById("successMethod");
const successChange = document.getElementById("successChange");
const successReference = document.getElementById("successReference");
const viewReceiptButton = document.getElementById("viewReceiptButton");
const receiptScreen = document.getElementById("receiptScreen");
const receiptReference = document.getElementById("receiptReference");
const receiptDate = document.getElementById("receiptDate");
const receiptMethod = document.getElementById("receiptMethod");
const receiptItems = document.getElementById("receiptItems");
const receiptTotal = document.getElementById("receiptTotal");
const receiptAmountPaid = document.getElementById("receiptAmountPaid");
const receiptChange = document.getElementById("receiptChange");
const newTransactionButton = document.getElementById("newTransactionButton");

const screens = [
    itemSelectionScreen,
    orderSummaryScreen,
    paymentScreen,
    cashScreen,
    qrScreen,
    cardScreen,
    successScreen,
    receiptScreen
];

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
    screens.forEach(function(screen) {
        screen.classList.add("hidden");
    });

    screenToShow.classList.remove("hidden");
    window.scrollTo(0, 0);
}

function displayTotal(element, amount) {
    element.textContent = formatPeso(amount);
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

    cartError.textContent = "";
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
    displayTotal(transactionTotal, calculateTotal());
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

    displayTotal(summaryTotal, calculateTotal());
}

function goToOrderSummary() {
    if (cart.length === 0) {
        cartError.textContent = "Please add at least one item before proceeding.";
        return;
    }

    cartError.textContent = "";
    displayOrderSummary();
    showScreen(orderSummaryScreen);
}

function goToPayment() {
    if (cart.length === 0) {
        showScreen(itemSelectionScreen);
        cartError.textContent = "Please add at least one item before payment.";
        return;
    }

    displayTotal(paymentTotal, calculateTotal());
    showScreen(paymentScreen);
}

function generateReferenceNumber() {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return "TXN-" + Date.now() + "-" + randomNumber;
}

function formatReceiptDate(dateValue) {
    return dateValue.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function createTransactionItems() {
    return cart.map(function(item) {
        return {
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        };
    });
}

async function saveTransactionToSupabase(transactionNumber, total, paymentMethod, amountPaid, changeAmount, items) {
    if (!db) {
        throw new Error("Supabase is not initialized.");
    }

    const { data: transaction, error: transactionError } = await db
        .from("transactions")
        .insert({
            transaction_number: transactionNumber,
            total: total,
            payment_method: paymentMethod,
            amount_paid: amountPaid,
            change_amount: changeAmount
        })
        .select("id")
        .single();

    if (transactionError) {
        console.error("Failed to save transaction to Supabase:", transactionError);
        throw transactionError;
    }

    if (!transaction || transaction.id === undefined || transaction.id === null) {
        throw new Error("Supabase saved the transaction but did not return its generated id.");
    }

    const transactionItems = items.map(function(item) {
        return {
            transaction_id: transaction.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.subtotal
        };
    });

    const { error: itemsError } = await db
        .from("transaction_items")
        .insert(transactionItems);

    if (itemsError) {
        console.error("Transaction was saved, but its items failed to save. Transaction id:", transaction.id, itemsError);
        throw itemsError;
    }

    console.info("Transaction and items saved successfully to Supabase.", {
        transactionId: transaction.id,
        transactionNumber: transactionNumber,
        itemCount: transactionItems.length
    });

    return transaction;
}

// Saves a completed payment before showing the existing success screen.
async function showPaymentSuccess(paymentMethod, amountPaid, changeAmount) {
    if (isProcessingPayment) {
        return;
    }

    if (cart.length === 0) {
        console.error("Cannot save a payment with an empty cart.");
        return;
    }

    isProcessingPayment = true;
    cashPayNowButton.disabled = true;
    confirmQrPaymentButton.disabled = true;
    processCardPaymentButton.disabled = true;

    const total = calculateTotal();
    const referenceNumber = generateReferenceNumber();
    const transactionDate = new Date();
    const items = createTransactionItems();

    try {
        const savedTransaction = await saveTransactionToSupabase(
            referenceNumber,
            total,
            paymentMethod,
            amountPaid,
            changeAmount,
            items
        );

        completedTransaction = {
            databaseId: savedTransaction.id,
            referenceNumber: referenceNumber,
            date: transactionDate,
            items: items,
            total: total,
            paymentMethod: paymentMethod,
            amountPaid: amountPaid,
            change: changeAmount
        };

        displayTotal(successTotal, total);
        displayTotal(successAmountPaid, amountPaid);
        successMethod.textContent = paymentMethod;
        displayTotal(successChange, changeAmount);
        successReference.textContent = referenceNumber;
        cardProcessingMessage.textContent = "";

        showScreen(successScreen);
    } catch (error) {
        console.error("Payment could not be fully saved to Supabase:", error);
        const errorMessage = "Payment could not be recorded. Check the browser console for details.";

        if (paymentMethod === "Cash") {
            cashError.textContent = errorMessage;
        } else if (paymentMethod === "Credit/Debit Card") {
            cardProcessingMessage.textContent = errorMessage;
        }
    } finally {
        isProcessingPayment = false;
        cashPayNowButton.disabled = false;
        confirmQrPaymentButton.disabled = false;
        processCardPaymentButton.disabled = false;
    }
}

function displayReceipt() {
    if (!completedTransaction) {
        return;
    }

    receiptReference.textContent = completedTransaction.referenceNumber;
    receiptDate.textContent = formatReceiptDate(completedTransaction.date);
    receiptMethod.textContent = completedTransaction.paymentMethod;
    displayTotal(receiptTotal, completedTransaction.total);
    displayTotal(receiptAmountPaid, completedTransaction.amountPaid);
    displayTotal(receiptChange, completedTransaction.change);
    receiptItems.innerHTML = "";

    completedTransaction.items.forEach(function(item) {
        const receiptItem = document.createElement("div");
        receiptItem.className = "receipt-item";
        receiptItem.innerHTML = `
            <span class="receipt-item-name">${item.name}</span>
            <span>Qty: ${item.quantity}</span>
            <span>${formatPeso(item.price)}</span>
            <strong>${formatPeso(item.subtotal)}</strong>
        `;

        receiptItems.appendChild(receiptItem);
    });

    showScreen(receiptScreen);
}

function startNewTransaction() {
    cart = [];
    completedTransaction = null;

    amountPaidInput.value = "";
    cashError.textContent = "";
    cartError.textContent = "";
    cardProcessingMessage.textContent = "";
    processCardPaymentButton.disabled = false;
    receiptItems.innerHTML = "";

    displayTotal(paymentTotal, 0);
    displayTotal(cashTotal, 0);
    displayTotal(qrTotal, 0);
    displayTotal(cardTotal, 0);
    displayTotal(summaryTotal, 0);
    displayTotal(successTotal, 0);
    displayTotal(successAmountPaid, 0);
    successMethod.textContent = "";
    displayTotal(successChange, 0);
    successReference.textContent = "";

    displayCart();
    showScreen(itemSelectionScreen);
}

function goToCashPayment() {
    displayTotal(cashTotal, calculateTotal());
    amountPaidInput.value = "";
    cashError.textContent = "";
    showScreen(cashScreen);
}

async function processCashPayment() {
    const total = calculateTotal();
    const amountPaid = Number(amountPaidInput.value);

    if (amountPaidInput.value === "" || isNaN(amountPaid)) {
        cashError.textContent = "Please enter a valid amount paid.";
        return;
    }

    if (amountPaid < 0) {
        cashError.textContent = "Amount paid cannot be negative.";
        return;
    }

    if (amountPaid < total) {
        cashError.textContent = "Insufficient payment. Please enter at least " + formatPeso(total) + ".";
        return;
    }

    await showPaymentSuccess("Cash", amountPaid, amountPaid - total);
}

function goToQrPayment() {
    displayTotal(qrTotal, calculateTotal());
    showScreen(qrScreen);
}

async function processQrPayment() {
    const total = calculateTotal();
    await showPaymentSuccess("QR Payment", total, 0);
}

function goToCardPayment() {
    displayTotal(cardTotal, calculateTotal());
    cardProcessingMessage.textContent = "";
    processCardPaymentButton.disabled = false;
    showScreen(cardScreen);
}

function processCardPayment() {
    const total = calculateTotal();

    cardProcessingMessage.textContent = "Processing payment...";
    processCardPaymentButton.disabled = true;

    setTimeout(function() {
        showPaymentSuccess("Credit/Debit Card", total, 0);
    }, 1200);
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
cashPaymentButton.addEventListener("click", goToCashPayment);
qrPaymentButton.addEventListener("click", goToQrPayment);
cardPaymentButton.addEventListener("click", goToCardPayment);
cashPayNowButton.addEventListener("click", processCashPayment);
confirmQrPaymentButton.addEventListener("click", processQrPayment);
processCardPaymentButton.addEventListener("click", processCardPayment);
backToPaymentFromCashButton.addEventListener("click", goToPayment);
backToPaymentFromQrButton.addEventListener("click", goToPayment);
backToPaymentFromCardButton.addEventListener("click", goToPayment);
viewReceiptButton.addEventListener("click", displayReceipt);
newTransactionButton.addEventListener("click", startNewTransaction);

displayProducts();
displayCart();
