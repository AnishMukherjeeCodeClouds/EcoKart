import { db } from "./db";
import { products } from "./productList";

const navbar = document.querySelector("header")!;

window.addEventListener("scroll", () => {
  if (window.scrollY >= window.innerHeight * 0.4) {
    navbar.classList.remove("opacity-0", "pointer-events-none");
    navbar.classList.add("opacity-100");
  } else {
    navbar.classList.add("opacity-0", "pointer-events-none");
    navbar.classList.remove("opacity-100");
  }
});

const cartItemCount =
  document.querySelector<HTMLSpanElement>("#cart-item-count")!;

cartItemCount.innerHTML = String((await db.cartItems.toArray()).length);

// DOM nodes
const productsGrid =
  document.querySelector<HTMLElementTagNameMap["section"]>("#products")!;
const productCategorySelect =
  document.querySelector<HTMLSelectElement>("#category-filter")!;
const productFilterClear =
  document.querySelector<HTMLParagraphElement>("#filter-clear")!;
const productSearchInput =
  document.querySelector<HTMLInputElement>("#product-search")!;

const productCategories = products.reduce(
  (prev, curr) => prev.add(curr.category),
  new Set<string>()
);

function redirectToProductPage(productId: (typeof products)[0]["id"]) {
  window.location.href = `/product.html#${productId}`;
}

function productHTML(product: (typeof products)[0]) {
  return `<div
          class="flex flex-col gap-2 rounded-md shadow-md shadow-black group h-full"
        >
          <div
            class="relative w-full aspect-[4/3] overflow-hidden rounded-md group-hover:[&>img]:scale-[1.08]"
          >
            <p
              class="absolute top-3 left-3 bg-red-500 text-white px-2 rounded-sm z-10"
            >
              ${Math.ceil(
                ((product.mrp - product.currentPrice) / product.mrp) * 100
              )}% off
            </p>
            <img
              class="h-full w-full object-cover rounded-md transition-all duration-300"
              src=${product.img}
              alt="${product.name}"
            />
          </div>
          <div class="grow flex flex-col justify-between">
            <div class="flex justify-between items-center px-4 sm:px-6">
              <div class="flex flex-col items-start">
                <p class="sm:text-sm md:text-lg font-medium max-w-[15ch]">${
                  product.name
                }</p>
                <p class="text-sm sm:text-base">${Array.from(
                  { length: product.rating },
                  () => "⭐"
                ).join("")}</p>
              </div>
              <div class="flex flex-col items-end">
                <p class="sm:text-lg md:text-xl font-bold !font-mono">₹${
                  product.currentPrice
                }</p>
                <p class="text-gray-600 text-xs sm:text-sm line-through !font-mono">
                  ₹${product.mrp}
                </p>
              </div>
            </div>
            <div class="flex mt-2 rounded-b-md">
              <button
                id="view-product"
                class="py-1 cursor-pointer text-center hover:italic hover:font-bold transition-all duration-300 bg-amber-700 basis-5/12 hover:bg-amber-800 text-white rounded-bl-md"
              >
                View
              </button>
              <button
              id="add-to-cart-btn"
                class="py-1 cursor-pointer text-center hover:italic hover:font-bold transition-all duration-300 bg-purple-400/40 hover:bg-purple-400/60 grow"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>`;
}

async function addToCart(product: (typeof products)[0]) {
  await db.cartItems.add({
    productId: product.id,
    quantity: 1,
  });
  // location.href = "/cart.html";
}

const navbarCart = document.querySelector<HTMLDivElement>("#cart")!;

function animateFlyToCart(event: MouseEvent, sourceImage: HTMLImageElement) {
  const cartRect = navbarCart.getBoundingClientRect();

  const flyingImg = sourceImage.cloneNode(true) as HTMLImageElement;
  flyingImg.style.position = "fixed";
  flyingImg.style.zIndex = "100000000";
  flyingImg.style.left = event.clientX + "px";
  flyingImg.style.top = event.clientY + "px";
  flyingImg.style.width = "50px";
  flyingImg.style.height = "50px";
  flyingImg.style.transition = "all 0.75s ease-in-out";

  document.body.appendChild(flyingImg);

  flyingImg.getBoundingClientRect();
  flyingImg.style.left = cartRect.left + cartRect.width / 2 + "px";
  flyingImg.style.top = cartRect.top + cartRect.height / 2 + "px";
  flyingImg.style.width = "0px";
  flyingImg.style.height = "0px";
  flyingImg.style.opacity = "0.5";

  flyingImg.addEventListener(
    "transitionend",
    () => {
      cartItemCount.innerHTML = String(parseInt(cartItemCount.innerHTML) + 1);
      flyingImg.remove();
    },
    { once: true }
  );
}

function renderProduct(p: (typeof products)[0]) {
  const productDiv = document.createElement("div");
  productDiv.innerHTML = productHTML(p);

  const viewBtn = productDiv.querySelector<HTMLDivElement>("#view-product");
  viewBtn?.addEventListener("click", () => redirectToProductPage(p.id));

  const addToCartBtn =
    productDiv.querySelector<HTMLDivElement>("#add-to-cart-btn");
  addToCartBtn?.addEventListener("click", async (e) => {
    await addToCart(p);
    animateFlyToCart(e, productDiv.querySelector("img")!);
  });

  productsGrid.appendChild(productDiv);
}

function replaceProductGrid(prods: typeof products) {
  productsGrid.innerHTML = "";
  if (prods.length === 0) {
    productsGrid.innerHTML = `<div class="text-center col-span-full mt-3 text-gray-700 text-2xl">No products found</div>`;
    return;
  }
  prods.forEach(renderProduct);
}

replaceProductGrid(products);

productCategories.forEach((pc) => {
  const categoryOption = new Option(pc, pc);
  productCategorySelect.appendChild(categoryOption);
});

function applyFilters() {
  const category = productCategorySelect.value;
  const search = productSearchInput.value.toLowerCase();

  const filtered = products.filter((p) => {
    const matchesCategory = !category || p.category === category;
    const matchesSearch = !search || p.name.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  replaceProductGrid(filtered);
}

productCategorySelect.addEventListener("change", applyFilters);

productSearchInput.addEventListener("input", applyFilters);

productFilterClear.addEventListener("click", () => {
  productCategorySelect.selectedIndex = 0;
  productSearchInput.value = "";
  applyFilters();
});
