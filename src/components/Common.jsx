import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, MapPin, Menu, Search, ShoppingBag, Star, X } from "lucide-react";
import { useFoodie } from "../context/FoodieContext.jsx";
import { allFoods, restaurants } from "../data/food.js";
import { money } from "../utils/storage.js";
import foodieMark from "../assets/foodie-mark.svg";

export function Header() {
  const { cart, user } = useFoodie();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState(() => localStorage.getItem("foodie-location") || "Bengaluru");
  const [editingLocation, setEditingLocation] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const updateSearch = (value) => {
    setSearch(value);
    if (!value.trim()) return setSuggestions([]);
    const term = value.toLowerCase();
    const matches = [
      ...restaurants.filter((restaurant) => restaurant.name.toLowerCase().includes(term)).slice(0, 3).map((restaurant) => ({ label: restaurant.name, path: `/restaurants/${restaurant.id}`, detail: restaurant.cuisine.slice(0, 2).join(", ") })),
      ...allFoods.filter((food) => food.name.toLowerCase().includes(term)).slice(0, 3).map((food) => ({ label: food.name, path: `/food/${food.id}`, detail: food.restaurant.name })),
    ];
    setSuggestions(matches);
  };
  const submitSearch = (event) => {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/restaurants?q=${encodeURIComponent(search.trim())}`);
    setSuggestions([]);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-100 bg-white/95 backdrop-blur">
      <div className="site-container flex h-[76px] items-center gap-5">
        <button className="icon-btn md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link to="/" className="brand-mark shrink-0" aria-label="Foodie home">
          <img className="brand-icon" src={foodieMark} alt="" /><span>foodie<span className="brand-dot">.</span></span>
        </Link>
        <div className="location-wrap hidden shrink-0 items-center gap-2 lg:flex">
          <MapPin size={18} className="text-brand" />
          {editingLocation ? (
            <input autoFocus className="location-input" value={location} onChange={(e) => setLocation(e.target.value)} onBlur={() => { localStorage.setItem("foodie-location", location); setEditingLocation(false); }} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} aria-label="Delivery location" />
          ) : (
            <button className="location-button" onClick={() => setEditingLocation(true)}><span>Deliver to</span><strong>{location}</strong></button>
          )}
        </div>
        <div className="relative hidden min-w-0 flex-1 md:block">
          <form onSubmit={submitSearch} className="search-field">
            <Search size={18} className="text-stone-400" />
            <input value={search} onChange={(e) => updateSearch(e.target.value)} onFocus={() => search && updateSearch(search)} placeholder="Search restaurants or dishes" aria-label="Search restaurants or dishes" />
            {search && <button type="button" className="text-stone-400" onClick={() => { setSearch(""); setSuggestions([]); }} aria-label="Clear search"><X size={16} /></button>}
          </form>
          {suggestions.length > 0 && <div className="search-suggestions">{suggestions.map((item) => <button key={item.path} onClick={() => { navigate(item.path); setSearch(""); setSuggestions([]); }}><Search size={15} /><span><b>{item.label}</b><small>{item.detail}</small></span><ArrowRight size={15} /></button>)}</div>}
        </div>
        <nav className="hidden items-center gap-6 lg:flex">
          <NavLink to="/restaurants" className="nav-link">Explore</NavLink>
          <NavLink to="/offers" className="nav-link">Offers</NavLink>
          <NavLink to="/wishlist" className="nav-link nav-icon-link"><Heart size={18} /> Saved</NavLink>
          <NavLink to={user ? "/profile" : "/login"} className="nav-link">{user ? user.name.split(" ")[0] : "Sign in"}</NavLink>
          <Link to="/cart" className="cart-link"><ShoppingBag size={18} /><span>Cart</span>{count > 0 && <b>{count}</b>}</Link>
        </nav>
        <Link to="/cart" className="icon-btn relative lg:hidden" aria-label={`Cart, ${count} items`}><ShoppingBag size={21} />{count > 0 && <span className="cart-badge">{count}</span>}</Link>
      </div>
      <div className="site-container pb-3 md:hidden">
        <div className="relative"><form onSubmit={submitSearch} className="search-field"><Search size={18} className="text-stone-400" /><input value={search} onChange={(e) => updateSearch(e.target.value)} placeholder="Search food or restaurants" aria-label="Search food or restaurants" /></form>
          {suggestions.length > 0 && <div className="search-suggestions">{suggestions.map((item) => <button key={item.path} onClick={() => { navigate(item.path); setSearch(""); setSuggestions([]); }}><Search size={15} /><span><b>{item.label}</b><small>{item.detail}</small></span><ArrowRight size={15} /></button>)}</div>}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs lg:hidden"><MapPin size={15} className="text-brand" />Deliver to {editingLocation ? <input autoFocus className="location-input" value={location} onChange={(e) => setLocation(e.target.value)} onBlur={() => { localStorage.setItem("foodie-location", location); setEditingLocation(false); }} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} aria-label="Delivery location" /> : <button className="font-bold" onClick={() => setEditingLocation(true)}>{location} <span className="text-brand">Change</span></button>}</div>
      </div>
      {menuOpen && <div className="mobile-menu lg:hidden">
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-brand-soft p-3 text-sm text-brand"><MapPin size={17} /> Delivering to <b className="text-ink">{location}</b></div>
        <Link onClick={() => setMenuOpen(false)} to="/restaurants">Explore restaurants</Link>
        <Link onClick={() => setMenuOpen(false)} to="/offers">Offers</Link>
        <Link onClick={() => setMenuOpen(false)} to="/wishlist">Wishlist</Link>
        <Link onClick={() => setMenuOpen(false)} to="/orders">My orders</Link>
        <Link onClick={() => setMenuOpen(false)} to={user ? "/profile" : "/login"}>{user ? "My profile" : "Sign in"}</Link>
      </div>}
    </header>
  );
}

export function Footer() {
  return <footer className="mt-20 bg-[#211f1e] text-stone-300">
    <div className="site-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <div><Link to="/" className="brand-mark text-white"><img className="brand-icon" src={foodieMark} alt="" /><span>foodie<span className="brand-dot">.</span></span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-stone-400">Good food, good mood. Bringing your neighbourhood's favourite flavours right to your door.</p><p className="mt-4 text-sm text-stone-400">Made with <span className="text-brand">♥</span> in India</p></div>
      <div><h3 className="footer-title">Discover</h3><div className="footer-links"><Link to="/restaurants">Restaurants</Link><Link to="/offers">Offers & deals</Link><Link to="/wishlist">Your wishlist</Link><Link to="/orders">Track an order</Link></div></div>
      <div><h3 className="footer-title">Foodie</h3><div className="footer-links"><Link to="/about">About us</Link><Link to="/contact">Contact us</Link><Link to="/faq">FAQs</Link><Link to="/privacy">Privacy policy</Link></div></div>
      <div><h3 className="footer-title">Get in touch</h3><p className="text-sm leading-7 text-stone-400">hello@foodie.in<br />+91 80 4567 8900<br />Bengaluru, India</p><div className="mt-5 flex gap-3"><a className="social-link" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a><a className="social-link" href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">f</a><a className="social-link" href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">x</a></div></div>
    </div>
    <div className="border-t border-white/10"><div className="site-container flex flex-col justify-between gap-2 py-4 text-xs text-stone-500 sm:flex-row"><span>© {new Date().getFullYear()} Foodie Technologies. All rights reserved.</span><div className="flex gap-4"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div></div></div>
  </footer>;
}

export function PageShell({ children }) {
  const { toast } = useFoodie();
  return <><Header /><main className="min-h-[65vh]">{children}</main><Footer />{toast && <div className="toast-message" role="status">{toast}</div>}</>;
}

export function ImageWithSkeleton({ src, alt, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  return <div className={`image-skeleton ${loaded ? "loaded" : ""} ${className}`}>
    <img src={src} alt={alt} loading="lazy" onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} />
  </div>;
}

export function SectionHeading({ eyebrow, title, action, to = "/restaurants" }) {
  return <div className="mb-6 flex items-end justify-between gap-4"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 className="section-title">{title}</h2></div>{action && <Link to={to} className="text-sm font-bold text-brand hover:underline">{action} <ArrowRight size={15} className="ml-1 inline" /></Link>}</div>;
}

export function RestaurantCard({ restaurant }) {
  const { wishlist, toggleWishlist } = useFoodie();
  const saved = wishlist.some((item) => item.key === `restaurant:${restaurant.id}`);
  return <article className="restaurant-card group">
    <div className="restaurant-image-wrap">
      <Link to={`/restaurants/${restaurant.id}`}><ImageWithSkeleton src={restaurant.image} alt={restaurant.name} className="restaurant-image" /></Link>
      <span className={`restaurant-open-badge ${restaurant.open ? "open" : "closed"}`}>{restaurant.open ? "OPEN" : "CLOSED"}</span>
      <img className="restaurant-logo" src={restaurant.logo} alt={`${restaurant.name} logo`} loading="lazy" />
      <span className="offer-ribbon">{restaurant.offer}</span>
      <button className={`save-button ${saved ? "saved" : ""}`} onClick={() => toggleWishlist("restaurant", restaurant.id)} aria-label={saved ? "Remove from wishlist" : "Save restaurant"}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>
    </div>
    <Link to={`/restaurants/${restaurant.id}`} className="block p-4">
      <div className="flex items-start justify-between gap-2"><h3 className="restaurant-name">{restaurant.name}</h3><span className="rating-pill"><Star size={12} fill="currentColor" /> {restaurant.rating}</span></div>
      <p className="mt-1 truncate text-sm text-stone-500">{restaurant.cuisine.join(" · ")}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-stone-500"><span>{restaurant.deliveryMins} min · {restaurant.fee ? money(restaurant.fee) + " delivery" : "Free delivery"}</span><span>₹{restaurant.priceForTwo} for two</span></div>
    </Link>
  </article>;
}

export function FoodCard({ food, restaurant, compact = false }) {
  const { cart, addToCart, setQuantity, wishlist, toggleWishlist } = useFoodie();
  const amount = cart.restaurantId === restaurant.id ? cart.items.find((item) => item.foodId === food.id && !(item.customizations || []).length)?.quantity || 0 : 0;
  const saved = wishlist.some((item) => item.key === `food:${food.id}`);
  return <article className={`food-card ${compact ? "food-card-compact" : ""}`}>
    <div className="food-photo-wrap"><Link to={`/food/${food.id}`}><ImageWithSkeleton src={food.image} alt={food.name} /></Link><button onClick={() => toggleWishlist("food", food.id)} className={`food-heart ${saved ? "saved" : ""}`} aria-label={saved ? "Remove from favourites" : "Add to favourites"}><Heart size={16} fill={saved ? "currentColor" : "none"} /></button></div>
    <div className="food-card-content"><div className="flex items-center gap-1"><span className={`food-mark ${food.veg ? "veg" : "nonveg"}`} aria-label={food.veg ? "Vegetarian" : "Non vegetarian"} /></div><Link to={`/food/${food.id}`} className="food-name">{food.name}</Link><p className="food-description">{food.description}</p><div className="mt-auto flex items-center justify-between pt-3"><strong>{money(food.price)}</strong>{amount ? <div className="quantity-control"><button onClick={() => setQuantity(`${food.id}:`, amount - 1)} aria-label="Decrease quantity">−</button><b>{amount}</b><button onClick={() => setQuantity(`${food.id}:`, amount + 1)} aria-label="Increase quantity">+</button></div> : <button className="add-button" onClick={() => addToCart(food, restaurant)}>ADD <span>+</span></button>}</div></div>
  </article>;
}

export function EmptyState({ icon: Icon = ShoppingBag, title, text, action, to = "/" }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={28} /></div><h2>{title}</h2><p>{text}</p>{action && <Link className="primary-button mt-5" to={to}>{action}</Link>}</div>;
}

export function RestaurantGrid({ items }) {
  if (!items.length) return <EmptyState icon={Search} title="No restaurants found" text="Try changing your search or filters to find something delicious." action="Browse all restaurants" to="/restaurants" />;
  return <div className="restaurant-grid">{items.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>;
}
