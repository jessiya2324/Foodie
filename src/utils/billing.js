import { findFood, restaurants } from "../data/food.js";

export function getCartSummary(cart) {
  const items = cart.items.map((item) => {
    const found = findFood(item.foodId);
    return found ? {
      ...found,
      price: item.unitPrice ?? found.price,
      quantity: item.quantity,
      cartKey: item.key || item.foodId,
      customizations: item.customizations || [],
    } : null;
  }).filter(Boolean);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const restaurant = restaurants.find((item) => item.id === cart.restaurantId) || items[0]?.restaurant || null;
  const deliveryFee = subtotal ? restaurant?.fee || 0 : 0;
  const platformFee = subtotal ? 5 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const code = cart.coupon?.toUpperCase();
  const discount = code === "WELCOME150" && subtotal >= 499
    ? Math.min(150, subtotal)
    : code === "FOODIE10" && subtotal >= 299
      ? Math.min(100, Math.round(subtotal * 0.1))
      : code === "FREEDEL" && subtotal >= 399
        ? deliveryFee
        : 0;
  return { items, restaurant, subtotal, deliveryFee: Math.max(0, deliveryFee - (code === "FREEDEL" ? discount : 0)), platformFee, taxes, discount, total: subtotal + deliveryFee + platformFee + taxes - discount };
}
