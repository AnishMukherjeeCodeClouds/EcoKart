import Dexie, { type EntityTable } from "dexie";

type Product = {
  id: number;
  productId: number;
  quantity: number;
};

type User = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type Order = {
  id: number;
  userDetails: User;
  totalPrice: number;
  orderDate?: Date;
};

const db = new Dexie("EcoKartDB") as Dexie & {
  cartItems: EntityTable<Product, "id">;
  order: EntityTable<Order, "id">;
};

db.version(1).stores({
  cartItems: "++id, productId, quantity",
  order: "++id, userDetails",
});

db.order.hook("creating", (_, obj) => {
  obj.orderDate = new Date();
});

export { db };
