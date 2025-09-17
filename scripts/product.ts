import { db } from "./db";
import { products } from "./productList";

let productId: number | null = window.location.hash
  ? parseInt(window.location.hash.slice(1))
  : null;

const cartItemCount =
  document.querySelector<HTMLSpanElement>("#cart-item-count")!;

cartItemCount.innerHTML = String((await db.cartItems.toArray()).length);

const product = products.find((p) => p.id === productId);
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

// DOM nodes
const imageContainer = document.querySelector<HTMLDivElement>(
  "#image-container div"
)!;
const productDetailsContainer =
  document.querySelector<HTMLDivElement>("#details-container")!;

console.log(product?.img);
imageContainer.innerHTML = `<img src=${product?.img} alt=${product?.name} class="h-full w-full object-contain rounded-md hover:scale-[1.08] transition-all duration-300" />`;

// Top details
const topDetailsDiv = document.createElement("div");
topDetailsDiv.innerHTML = `
        <h1 class="text-3xl lg:text-5xl font-bold mb-2">${product?.name}</h1>
        <div class="flex justify-between items-center mb-5">
          <div class="flex items-center gap-1">
            <p class="lg:text-xl text-gray-600 line-through">₹${
              product?.mrp
            }</p>
            <p class="text-xl lg:text-2xl font-bold">₹${
              product?.currentPrice
            }</p>
          </div>
          <div>${Array.from({ length: product?.rating! }, () => "⭐").join(
            ""
          )}</div>
        </div>`;

productDetailsContainer.appendChild(topDetailsDiv);

const descriptionDiv = document.createElement("div");
descriptionDiv.innerHTML = `
        <div class="mb-3">
          <p class="text-lg lg:text-xl font-semibold">Description</p>
          <p class="text-lg">
          ${product?.description}
          </p>
        </div>
`;
productDetailsContainer.appendChild(descriptionDiv);

const featuresDiv = document.createElement("div");
featuresDiv.innerHTML = `
        <div class="mb-3">
          <p class="text-lg lg:text-xl font-semibold">Features</p>
          <ul class="list-disc px-4">
          ${product?.features
            .map((f) => `<li class="lg:text-lg">${f}</li>`)
            .join("\n")}
          </ul>
        </div>
`;
productDetailsContainer.appendChild(featuresDiv);

const quantityUpButton =
  document.querySelector<HTMLButtonElement>(".quantity-up")!;
const quantityDownButton =
  document.querySelector<HTMLButtonElement>(".quantity-down")!;
const quantityCounter =
  document.querySelector<HTMLInputElement>(".quantity-counter")!;

quantityUpButton.addEventListener("click", () => {
  quantityCounter.value = String(
    Math.min(parseInt(quantityCounter.value) + 1, 100)
  );
  quantityCounter.dispatchEvent(new Event("change", { bubbles: true }));
});
quantityDownButton.addEventListener("click", () => {
  quantityCounter.value = String(
    Math.max(parseInt(quantityCounter.value) - 1, 1)
  );
  quantityCounter.dispatchEvent(new Event("change", { bubbles: true }));
});

quantityCounter.addEventListener("change", async () => {
  quantityCounter.reportValidity();
});

const addToCartBtn =
  document.querySelector<HTMLButtonElement>("#add-to-cart-btn")!;

addToCartBtn.addEventListener("click", async (e) => {
  if (product != undefined) {
    await db.cartItems.add({
      productId: productId!,
      quantity: parseInt(quantityCounter.value),
    });
  }
  animateFlyToCart(e, document.querySelector("img")!);
});
