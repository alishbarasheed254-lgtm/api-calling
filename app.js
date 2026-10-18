var productContainer = document.getElementById("productContainer");
var searchInput = document.getElementById("searchInput");
var categoryFilter = document.getElementById("categoryFilter");
var sortFilter = document.getElementById("sortFilter");
var productCount = document.getElementById("productCount");
var message = document.getElementById("message");
var pagination = document.getElementById("pagination");
var cartCount = document.getElementById("cartCount");

var products = [];
var filteredProducts = [];
var currentPage = 1;
var productsPerPage = 8;

var cart = JSON.parse(localStorage.getItem("blushCart") || "[]");
var favorites = JSON.parse(localStorage.getItem("blushFavorites") || "[]");

// API CALLING
async function getData() {
    try {
        message.style.display = "block";
        message.innerHTML = "Loading your pretty products... ♡";

        var response = await fetch("https://dummyjson.com/products?limit=0");

        if (!response.ok) {
            throw new Error("API request failed: " + response.status);
        }

        var data = await response.json();

        // Products array response ke andar hai
        products = data.products;

        // Categories automatically load hongi
        var categories = [];

        products.forEach(function(product) {
            if (!categories.includes(product.category)) {
                categories.push(product.category);
            }
        });

        categories.sort();

        categories.forEach(function(category) {
            var option = document.createElement("option");
            option.value = category;
            option.textContent = category.replaceAll("-", " ");
            categoryFilter.appendChild(option);
        });

        message.style.display = "none";

        applyFilters();
        updateCartCount();

        console.log("API data:", data);
        console.log("Products array:", products);

    } catch (error) {
        message.style.display = "block";
        message.textContent =
            "Oops! Products load nahi hue. Please try again. ♡";

        console.error("API Error:", error);
    }
}

// SEARCH + CATEGORY + SORT
function applyFilters() {
    var searchText = searchInput.value.toLowerCase().trim();
    var selectedCategory = categoryFilter.value;

    filteredProducts = products.filter(function(product) {
        var matchesSearch =
            product.title.toLowerCase().includes(searchText);

        var matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (sortFilter.value === "low") {
        filteredProducts.sort(function(a, b) {
            return a.price - b.price;
        });
    } else if (sortFilter.value === "high") {
        filteredProducts.sort(function(a, b) {
            return b.price - a.price;
        });
    } else if (sortFilter.value === "az") {
        filteredProducts.sort(function(a, b) {
            return a.title.localeCompare(b.title);
        });
    }

    currentPage = 1;
    renderProducts();
}

// DISPLAY PRODUCT CARDS
function renderProducts() {
    productContainer.innerHTML = "";

    productCount.textContent =
        filteredProducts.length + " products ♡";

    if (filteredProducts.length === 0) {
        productContainer.innerHTML =
            '<div class="col-12 text-center py-5">' +
            '<h4>No products found ♡</h4>' +
            '<p>Try another search or category.</p></div>';

        pagination.innerHTML = "";
        return;
    }

    var start = (currentPage - 1) * productsPerPage;
    var end = start + productsPerPage;
    var pageProducts = filteredProducts.slice(start, end);

    pageProducts.forEach(function(product) {
        var isFavorite = favorites.includes(product.id);

        var col = document.createElement("div");
        col.className = "col-6 col-md-4 col-lg-3";

        col.innerHTML = `
            <div class="product-card">
                <div class="product-image">
                    <img
                        src="${product.thumbnail}"
                        alt="${product.title}"
                        loading="lazy"
                    >

                    <button class="favorite-btn ${isFavorite ? "active" : ""}"
                        aria-label="Toggle favourite">
                        <i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
                    </button>
                </div>

                <div class="product-info">
                    <h3 class="product-title"></h3>

                    <p class="product-category"></p>

                    <div class="product-price">
                        $${product.price.toFixed(2)}
                    </div>

                    <div class="product-rating">
                        <i class="fa-solid fa-star"></i>
                        ${product.rating} / 5
                    </div>

                    <button class="add-btn">
                        <i class="fa-solid fa-bag-shopping"></i>
                        Add to Bag ♡
                    </button>
                </div>
            </div>
        `;

        // API text ko safely display karna
        col.querySelector(".product-title").textContent =
            product.title;

        col.querySelector(".product-category").textContent =
            product.category.replaceAll("-", " ");

        col.querySelector(".favorite-btn").addEventListener(
            "click", function() {
                toggleFavorite(product.id);
            }
        );

        col.querySelector(".add-btn").addEventListener(
            "click", function() {
                addToCart(product.id);
            }
        );

        productContainer.appendChild(col);
    });

    renderPagination();
}

// FAVORITES
function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(function(item) {
            return item !== id;
        });
    } else {
        favorites.push(id);
    }

    localStorage.setItem(
        "blushFavorites",
        JSON.stringify(favorites)
    );

    renderProducts();
}

// CART
function addToCart(id) {
    cart.push(id);

    localStorage.setItem(
        "blushCart",
        JSON.stringify(cart)
    );

    updateCartCount();
}

function updateCartCount() {
    cartCount.textContent = cart.length;
}

// PAGINATION
function renderPagination() {
    pagination.innerHTML = "";

    var totalPages = Math.ceil(
        filteredProducts.length / productsPerPage
    );

    if (totalPages <= 1) {
        return;
    }

    var previous = document.createElement("button");
    previous.className = "page-btn";
    previous.textContent = "‹";
    previous.disabled = currentPage === 1;

    previous.addEventListener("click", function() {
        currentPage--;
        renderProducts();
    });

    pagination.appendChild(previous);

    for (var i = 1; i <= totalPages; i++) {
        var pageButton = document.createElement("button");
        pageButton.className = "page-btn";

        if (i === currentPage) {
            pageButton.classList.add("active");
        }

        pageButton.textContent = i;
        pageButton.addEventListener("click", function() {
            currentPage = Number(this.textContent);
            renderProducts();
        });

        pagination.appendChild(pageButton);
    }

    var next = document.createElement("button");
    next.className = "page-btn";
    next.textContent = "›";
    next.disabled = currentPage === totalPages;

    next.addEventListener("click", function() {
        currentPage++;
        renderProducts();
    });

    pagination.appendChild(next);
}

// EVENT LISTENERS
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
sortFilter.addEventListener("change", applyFilters);

// START
getData();