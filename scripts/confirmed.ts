import { db } from "./db";

let orderId: number | null = window.location.hash
  ? parseInt(window.location.hash.slice(1))
  : null;

if (orderId == null) throw new Error("Invalid order id");

const order = await db.order.get(orderId);
if (order == undefined) throw new Error("Invalid order");

console.log(order);

const orderDetailsSlot = document.querySelector<HTMLDivElement>(
  "#order-details-slot"
)!;
orderDetailsSlot.innerHTML = `
        <p class="md:text-xl">Name: ${order.userDetails.name}</p>
        <p class="md:text-xl">Email: ${order.userDetails.email}</p>
        <p class="md:text-xl">Phone: ${order.userDetails.phone}</p>
        <p class="md:text-xl">Address: ${order.userDetails.address}</p>
        <p class="md:text-xl">Order total: <span class="!font-mono">₹${
          order.totalPrice
        }</span></p>
        <p class="md:text-xl">Order date: ${new Intl.DateTimeFormat("en-IN", {
          dateStyle: "full",
          timeStyle: "medium",
        }).format(order.orderDate)}</p>
`;
