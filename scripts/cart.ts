import { db } from "./db";
import { products } from "./productList";

type PayerDetails = Record<
  | "payer-first-name"
  | "payer-last-name"
  | "payer-email"
  | "payer-phone"
  | "payer-addr",
  string
>;

// const cartHeadingSpan2 =
//   document.querySelectorAll<HTMLSpanElement>("#cart-heading span")[1];

const cartItems = await db.cartItems.toArray();
// cartHeadingSpan2.innerHTML = `${cartItems.length} items`;
const cartItemsExpanded = cartItems.map((ci) => {
  const targetProduct = products.find((p) => p.id === ci.productId)!;
  return {
    id: ci.id,
    productId: ci.productId,
    quantity: ci.quantity,
    name: targetProduct.name,
    price: targetProduct.currentPrice,
    img: targetProduct.img,
  };
});

const cartItemsHolder =
  document.querySelector<HTMLDivElement>("#cart-items-holder")!;
const cartSummaryHolder =
  document.querySelector<HTMLDivElement>("#cart-summary")!;

function renderCartItems() {
  cartItemsHolder.replaceChildren();
  cartItemsExpanded.forEach((ci, idx) => {
    const cartItemDiv = document.createElement("div");
    const cartItemContent = `
    <div class="shadow shadow-black rounded-md flex gap-3 p-5 bg-gray-100">
          <div class="w-[100px] aspect-[4/3] rounded-md ">
            <a
              href="/product.html#${ci.productId}"
            >
              <img
                class="h-full w-full object-cover rounded-md shadow-sm shadow-black"
                src=${ci.img}
                alt=${ci.name}
              />
            </a>
          </div>
          <div class="flex flex-col gap-2 justify-between py-2 grow">
            <div class="flex gap-3 items-start justify-between">
              <div class="flex gap-2 items-start">
                <p class="font-bold md:text-xl">${ci.name}</p>
              </div>
              <p class="text-lg md:text-xl !font-mono">₹${
                ci.price * ci.quantity
              }</p>
            </div>
            <div class="flex justify-between">
            <div class="flex items-center gap-2 md:gap-3">
              <p class="!font-mono text-gray-700 md:text-lg">₹${ci.price}</p>
              <div class="flex items-start shadow shadow-black rounded-md">
                <button class="quantity-down bg-gray-800 hover:bg-gray-600 cursor-pointer  rounded-l-md px-0.5">
                  <i class="fa-solid fa-minus text-white"></i>
                </button>
                <input
                  type="number"
                  value=${ci.quantity}
                  required
                  min="1"
                  max="50"
                  class="quantity-counter rounded-l-md outline-none focus:bg-white text-center w-[3ch] md:w-[5ch] !font-mono"
                />
                <button class="quantity-up bg-gray-800 hover:bg-gray-600 cursor-pointer rounded-r-md px-0.5">
                  <i class="fa-solid fa-plus text-white"></i>
                </button>
              </div>
            </div>
              <button class="remove-from-cart cursor-pointer">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
          <!-- <input type="number" value="3" min="1" class="" /> -->
        </div>`;
    cartItemDiv.innerHTML = cartItemContent;

    const quantityUpButton =
      cartItemDiv.querySelector<HTMLButtonElement>(".quantity-up")!;
    const quantityDownButton =
      cartItemDiv.querySelector<HTMLButtonElement>(".quantity-down")!;
    const quantityCounter =
      cartItemDiv.querySelector<HTMLInputElement>(".quantity-counter")!;

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
      if (!quantityCounter.checkValidity()) return;

      const currentQuantity = parseInt(quantityCounter.value);
      cartItemsExpanded[idx].quantity = currentQuantity;
      await db.cartItems.update(ci.id, { quantity: currentQuantity });

      renderCartItems();
      renderCartSummary();
    });

    const removeFromCartButton =
      cartItemDiv.querySelector<HTMLButtonElement>(".remove-from-cart")!;

    removeFromCartButton.addEventListener("click", async () => {
      cartItemsExpanded.splice(idx, 1);
      await db.cartItems.delete(ci.id);

      if (cartItemsExpanded.length === 0) {
        cleanupCart();
        return;
      }

      renderCartItems();
      renderCartSummary();
    });

    cartItemsHolder.appendChild(cartItemDiv);
  });
}

function renderCartSummary(discountAmount: number = 0) {
  cartSummaryHolder.replaceChildren();
  const summaryDiv = document.createElement("div");
  const subTotalCost = cartItemsExpanded.reduce(
    (prev, curr) => prev + curr.price * curr.quantity,
    0
  );
  const tax = Math.round((subTotalCost * 5) / 100);
  const shipping = 100;
  const summaryContent = `
        <div class="flex justify-between">
          <p class="text-lg">Subtotal</p>
          <p class="text-lg !font-mono">₹${subTotalCost}</p>
        </div>
        <div class="flex justify-between">
          <p class="text-lg">Tax (5%)</p>
          <p class="text-lg !font-mono">₹${tax}</p>
        </div>
        <div class="flex justify-between">
          <p class="text-lg">Shipping</p>
          <p class="text-lg !font-mono">₹${shipping}</p>
        </div>
        <div class="flex justify-between">
          <p class="text-lg">Discount</p>
          <p class="text-lg !font-mono">-₹${discountAmount}</p>
        </div>
        <hr class="mt-2" />
        <div class="flex justify-between">
          <p class="text-lg">Total</p>
          <p class="text-xl font-bold text-green-900 !font-mono">₹${
            subTotalCost + tax + shipping - discountAmount
          }</p>
        </div>
`;
  summaryDiv.innerHTML = summaryContent;
  cartSummaryHolder.appendChild(summaryDiv);
}

function cleanupCart() {
  const rightSideContainer =
    document.querySelector<HTMLDivElement>("#right-side")!;
  rightSideContainer.classList.add("!hidden");
  rightSideContainer.parentElement?.classList.add("lg:!grid-cols-1");
  cartItemsHolder.parentElement?.classList.add("grow", "h-full");

  cartItemsHolder.classList.add("justify-center", "items-center", "pt-3");
  cartItemsHolder.innerHTML = `
  <div class="space-y-4">
      <h1 class="text-2xl">Cart is empty</h1>
      <a href="/index.html"
        class="bg-amber-700 hover:bg-amber-800 hover:font-bold hover:italic
        transition-all duration-300 cursor-pointer py-2 text-center rounded-md
        w-full text-white mt-4 px-2"> Continue shopping
      </a>
  </div>`;
}

if (cartItemsExpanded.length > 0) {
  renderCartItems();
  renderCartSummary();
} else {
  cleanupCart();
}

const orderReviewDialog =
  document.querySelector<HTMLDialogElement>("#order-review")!;

// Discount
const discountForm = document.querySelector<HTMLFormElement>("#discount-form")!;
const discountCoupons: Record<string, number> = {
  Eco100: 100,
  Kart300: 300,
};

const appliedCoupons = new Set<string>();
let totalDiscountAmount = 0;

discountForm.addEventListener("submit", (e) => {
  e.preventDefault();
  discountForm.reportValidity();

  const couponCodeInput = discountForm.querySelector("input")!;
  couponCodeInput.reportValidity();
  if (
    couponCodeInput.value in discountCoupons &&
    !appliedCoupons.has(couponCodeInput.value)
  ) {
    appliedCoupons.add(couponCodeInput.value);
    totalDiscountAmount += discountCoupons[couponCodeInput.value];

    const subTotalCost = cartItemsExpanded.reduce(
      (prev, curr) => prev + curr.price * curr.quantity,
      0
    );
    const tax = Math.round((subTotalCost * 5) / 100);
    const shipping = 100;
    const total = subTotalCost + shipping + tax;

    if (total > totalDiscountAmount) renderCartSummary(totalDiscountAmount);
    else {
      appliedCoupons.delete(couponCodeInput.value);
      totalDiscountAmount -= discountCoupons[couponCodeInput.value];
    }
  }
  discountForm.reset();
});

const checkoutForm = document.querySelector<HTMLFormElement>("#checkout-form")!;
function populateReviewDialog(payerDetails: PayerDetails) {
  const itemsSlot =
    orderReviewDialog.querySelector<HTMLDivElement>("#items-slot")!;

  itemsSlot.innerHTML = cartItemsExpanded
    .map(
      (ci) => `
              <div class="grid grid-cols-6">
                <p class="col-span-3">${ci.name}</p>
                <p class="col-span-2 text-center !font-mono">${ci.quantity}</p>
                <p class="!font-mono">₹${ci.price * ci.quantity}</p>
              </div>
    `
    )
    .join("\n");

  const summarySlot =
    orderReviewDialog.querySelector<HTMLDivElement>("#summary-slot")!;

  const subTotalCost = cartItemsExpanded.reduce(
    (prev, curr) => prev + curr.price * curr.quantity,
    0
  );
  const taxCost = Math.round((subTotalCost * 5) / 100);
  const shippingCost = 100;

  summarySlot.innerHTML = `
              <div class="grid grid-cols-6">
                <p class="col-span-5">Subtotal</p>
                <p class="font-bold !font-mono">₹${subTotalCost}</p>
              </div>
              <div class="grid grid-cols-6">
                <p class="col-span-5">Tax</p>
                <p class="!font-mono">₹${taxCost}</p>
              </div>
              <div class="grid grid-cols-6">
                <p class="col-span-5">Shipping</p>
                <p class="!font-mono">₹${shippingCost}</p>
              </div>
              <div class="grid grid-cols-6">
                <p class="col-span-5">Discount</p>
                <p class="!font-mono">-₹${totalDiscountAmount}</p>
              </div>
              <hr class="my-2" />
              <div class="flex justify-between">
                <p class="font-bold">Total</p>
                <p class="font-bold text-lg text-green-900 !font-mono">₹${
                  subTotalCost + taxCost + shippingCost - totalDiscountAmount
                }</p>
              </div>
  `;

  const payerDetailsContainer =
    orderReviewDialog.querySelector<HTMLDivElement>(".payer-details")!;
  payerDetailsContainer.innerHTML = `
                <p class="col-span-2 text-lg text-gray-800">
                  Payer details
                </p>
                <p class="font-bold">Name</p>
                <p>${payerDetails["payer-first-name"]} ${payerDetails["payer-last-name"]}</p>
                <p class="font-bold">Email</p>
                <p title=${payerDetails["payer-email"]} class="truncate">${payerDetails["payer-email"]}</p>
                <p class="font-bold">Phone no.</p>
                <p>${payerDetails["payer-phone"]}</p>
                <p class="font-bold">Address</p>
                <p title=${payerDetails["payer-addr"]} class="truncate">${payerDetails["payer-addr"]}</p>
  `;

  const [confirmButton, cancelButton] =
    orderReviewDialog.querySelectorAll("button");
  cancelButton.addEventListener("click", () => {
    orderReviewDialog.close();
  });

  confirmButton.addEventListener("click", async () => {
    const orderId = await db.order.add({
      userDetails: {
        name:
          payerDetails["payer-first-name"] +
          " " +
          payerDetails["payer-last-name"],
        email: payerDetails["payer-email"],
        address: payerDetails["payer-addr"],
        phone: payerDetails["payer-phone"],
      },
      totalPrice: subTotalCost + taxCost + shippingCost - totalDiscountAmount,
    });
    checkoutForm.reset();
    await db.cartItems.clear();
    location.href = `/confirmed.html#${orderId}`;
  });
}

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const payerDetails = Object.fromEntries(
    new FormData(checkoutForm)
  ) as PayerDetails;
  populateReviewDialog(payerDetails);
  orderReviewDialog.showModal();
});
