import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "../pages/AuthPages.jsx";
import { FoodPage, HomePage, InfoPage, NotFoundPage, OffersPage, RestaurantListPage, RestaurantPage } from "../pages/BrowsePages.jsx";
import { AddressesPage, CartPage, CheckoutPage, OrderConfirmationPage, OrdersPage, PaymentPage, ProfilePage, TrackingPage, WishlistPage } from "../pages/OrderPages.jsx";

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/restaurants" element={<RestaurantListPage />} />
    <Route path="/restaurants/:id" element={<RestaurantPage />} />
    <Route path="/food/:id" element={<FoodPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/payment" element={<PaymentPage />} />
    <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
    <Route path="/track/:id" element={<TrackingPage />} />
    <Route path="/orders" element={<OrdersPage />} />
    <Route path="/wishlist" element={<WishlistPage />} />
    <Route path="/addresses" element={<AddressesPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
    <Route path="/offers" element={<OffersPage />} />
    <Route path="/about" element={<InfoPage type="about" />} />
    <Route path="/contact" element={<InfoPage type="contact" />} />
    <Route path="/faq" element={<InfoPage type="faq" />} />
    <Route path="/privacy" element={<InfoPage type="privacy" />} />
    <Route path="/terms" element={<InfoPage type="terms" />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
