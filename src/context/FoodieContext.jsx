import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { makeId, readStorage, writeStorage } from "../utils/storage.js";

const FoodieContext = createContext(null);

export function FoodieProvider({ children }) {
  const [cart, setCartState] = useState(() => readStorage("foodie-cart", { restaurantId: null, items: [], instructions: "", coupon: "" }));
  const cartRef = useRef(cart);
  const setCart = (next) => {
    const updated = typeof next === "function" ? next(cartRef.current) : next;
    cartRef.current = updated;
    setCartState(updated);
  };
  const [wishlist, setWishlist] = useState(() => readStorage("foodie-wishlist", []));
  const [addresses, setAddresses] = useState(() => {
    const saved = readStorage("foodie-addresses", []);
    return (Array.isArray(saved) ? saved : []).map((address, index) => ({
      ...address,
      isDefault: address.isDefault ?? index === 0,
    }));
  });
  const [orders, setOrders] = useState(() => readStorage("foodie-orders", []));
  const [user, setUser] = useState(() => readStorage("foodie-user", null));
  const [toast, setToast] = useState("");

  useEffect(() => writeStorage("foodie-cart", cart), [cart]);
  useEffect(() => writeStorage("foodie-wishlist", wishlist), [wishlist]);
  useEffect(() => writeStorage("foodie-addresses", addresses), [addresses]);
  useEffect(() => writeStorage("foodie-orders", orders), [orders]);
  useEffect(() => writeStorage("foodie-user", user), [user]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const addToCart = (food, restaurant, quantity = 1) => {
    const currentCart = cartRef.current;
    const customizations = food.customizations || [];
    const key = `${food.id}:${customizations.map((item) => item.name).sort().join("|")}`;
    const cartItem = { key, foodId: food.id, quantity, unitPrice: food.price, customizations };
    if (currentCart.restaurantId && currentCart.restaurantId !== restaurant.id) {
      const replace = window.confirm("Your cart has items from another restaurant. Clear it and add this item?");
      if (!replace) return false;
      setCart({ restaurantId: restaurant.id, items: [cartItem], instructions: "", coupon: "" });
      setToast(`${food.name} added to your cart`);
      return true;
    }
    setCart((current) => {
      const existing = current.items.find((item) => (item.key || `${item.foodId}:`) === key);
      const items = existing
        ? current.items.map((item) => (item.key || `${item.foodId}:`) === key ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current.items, cartItem];
      return { ...current, restaurantId: restaurant.id, items };
    });
    setToast(`${food.name} added to your cart`);
    return true;
  };

  const setQuantity = (foodKey, quantity) => {
    setCart((current) => {
      const matches = (item) => item.key
        ? item.key === foodKey || (item.key === `${item.foodId}:` && foodKey === item.foodId)
        : item.foodId === foodKey;
      const items = quantity <= 0
        ? current.items.filter((item) => !matches(item))
        : current.items.map((item) => matches(item) ? { ...item, quantity } : item);
      return { ...current, items, restaurantId: items.length ? current.restaurantId : null };
    });
  };
  const clearCart = () => setCart({ restaurantId: null, items: [], instructions: "", coupon: "" });
  const toggleWishlist = (type, id) => {
    const key = `${type}:${id}`;
    setWishlist((current) => current.some((item) => item.key === key)
      ? current.filter((item) => item.key !== key)
      : [...current, { key, type, id }]);
  };
  const saveAddress = (address) => {
    setAddresses((current) => {
      const id = address.id || makeId("ADDR");
      const exists = current.some((item) => item.id === id);
      const hasOtherDefault = current.some((item) => item.id !== id && item.isDefault);
      const saved = { ...address, id, isDefault: Boolean(address.isDefault || !hasOtherDefault) };
      const updated = current.map((item) => item.id === id
        ? saved
        : saved.isDefault ? { ...item, isDefault: false } : item);
      return exists ? updated : [...updated, saved];
    });
  };
  const deleteAddress = (id) => setAddresses((current) => {
    const remaining = current.filter((address) => address.id !== id);
    if (!remaining.length || remaining.some((address) => address.isDefault)) return remaining;
    return remaining.map((address, index) => ({ ...address, isDefault: index === 0 }));
  });
  const updateOrder = (orderId, update) =>
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, ...update } : order));
  const placeOrder = (details) => {
    const order = { ...details, id: makeId("FD"), createdAt: new Date().toISOString(), statusIndex: 0, status: "Order placed" };
    setOrders((current) => [order, ...current]);
    clearCart();
    return order;
  };

  const value = useMemo(() => ({
    cart, setCart, addToCart, setQuantity, clearCart,
    wishlist, toggleWishlist,
    addresses, saveAddress, deleteAddress,
    orders, setOrders, updateOrder, placeOrder,
    user, setUser, toast, notify: setToast,
  }), [cart, wishlist, addresses, orders, user, toast]);

  return <FoodieContext.Provider value={value}>{children}</FoodieContext.Provider>;
}

export const useFoodie = () => {
  const context = useContext(FoodieContext);
  if (!context) throw new Error("useFoodie must be used within FoodieProvider");
  return context;
};
