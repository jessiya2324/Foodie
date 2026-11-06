import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3, MapPin, Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, Truck } from "lucide-react";
import { FoodCard, ImageWithSkeleton, RestaurantCard, RestaurantGrid, SectionHeading } from "../components/Common.jsx";
import { useFoodie } from "../context/FoodieContext.jsx";
import { allFoods, categories, findFood, restaurants } from "../data/food.js";
import { money } from "../utils/storage.js";

const heroImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=85";

export function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { orders } = useFoodie();
  const recentlyOrdered = useMemo(() => {
    const ids = [...new Set(orders.flatMap((order) => order.items.map((item) => item.foodId)))];
    return ids.map(findFood).filter(Boolean).slice(0, 4);
  }, [orders]);
  return <div>
    <section className="hero-section">
      <div className="site-container hero-content">
        <div className="max-w-xl">
          <span className="hero-kicker"><Sparkles size={14} /> GOOD FOOD, GOOD MOOD</span>
          <h1>Your next<br /><span>great meal</span><br />is right here.</h1>
          <p>From neighbourhood favourites to new discoveries, find something delicious for every kind of day.</p>
          <form className="hero-search" onSubmit={(e) => { e.preventDefault(); navigate(`/restaurants?q=${encodeURIComponent(query)}`); }}>
            <MapPin size={19} className="shrink-0 text-brand" /><span className="hidden text-sm font-bold text-stone-700 sm:block">Bengaluru</span><span className="hidden h-7 w-px bg-stone-200 sm:block" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Restaurant, dish or cuisine..." aria-label="Search for food" />
            <button type="submit"><Search size={17} /> <span className="hidden sm:inline">Find food</span></button>
          </form>
          <div className="hero-meta"><span><ShieldCheck size={16} /> Safe & contactless delivery</span><span><Truck size={16} /> At your door in ~30 min</span></div>
        </div>
        <div className="hero-visual"><ImageWithSkeleton src={heroImage} alt="A table filled with colourful freshly prepared food" /><div className="hero-floating-card"><div className="flex -space-x-2"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80" alt="" /><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80" alt="" /><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="" /></div><div><b>Good food travels.</b><small>Loved by 20k+ foodies</small></div><span className="floating-stars">★★★★★</span></div></div>
      </div>
    </section>
    <section className="site-container py-14 sm:py-16">
      <SectionHeading eyebrow="WHAT ARE YOU CRAVING?" title="Find your flavour" />
      <div className="category-grid">{categories.map((category) => <Link key={category.name} to={`/restaurants?q=${encodeURIComponent(category.query)}`} className="category-tile"><span>{category.icon}</span><b>{category.name}</b></Link>)}</div>
    </section>
    <section className="bg-[#fffaf7] py-14 sm:py-16"><div className="site-container"><SectionHeading eyebrow="HAND-PICKED FOR YOU" title="Popular near you" action="Explore all" /><RestaurantGrid items={restaurants.slice(0, 4)} /></div></section>
    <section className="site-container py-14 sm:py-16"><SectionHeading eyebrow="A CUT ABOVE THE REST" title="Top-rated restaurants" action="See all" /><RestaurantGrid items={[...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 4)} /></section>
    <section className="site-container py-14 sm:py-16"><SectionHeading eyebrow="A LITTLE SOMETHING EXTRA" title="Today's good deals" action="See all offers" to="/offers" /><div className="offer-grid">
      <Link to="/offers" className="deal-card deal-coral"><span>FIRST ORDER SPECIAL</span><b>₹150 off<br />your first bite</b><small>Use code <strong>WELCOME150</strong> · Min order ₹499</small><span className="deal-art">🍽️</span></Link>
      <Link to="/offers" className="deal-card deal-yellow"><span>GOOD FOOD, GOOD COMPANY</span><b>Buy one,<br />share one.</b><small>On select favourites today</small><span className="deal-art">🍔</span></Link>
    </div></section>
    <section className="bg-[#fffaf7] py-14 sm:py-16"><div className="site-container"><SectionHeading eyebrow="THE DISHES EVERYONE LOVES" title="Recommended for you" action="See all restaurants" /><div className="food-grid">{allFoods.filter((food) => food.popular).slice(0, 4).map((food) => <FoodCard key={food.id} food={food} restaurant={food.restaurant} />)}</div></div></section>
    {recentlyOrdered.length > 0 && <section className="site-container py-14"><SectionHeading eyebrow="PICK UP WHERE YOU LEFT OFF" title="Recently ordered" /><div className="food-grid">{recentlyOrdered.map((food) => <FoodCard key={food.id} food={food} restaurant={food.restaurant} />)}</div></section>}
    <section className="site-container py-14"><div className="join-banner"><div><p className="eyebrow text-white/70">A GOOD THING IS COOKING</p><h2>Make tonight<br />a little more delicious.</h2><p>Discover local gems and old favourites, all in one place.</p><Link to="/restaurants" className="white-button">Explore restaurants <ArrowRight size={16} /></Link></div><span className="join-emoji">🥘</span></div></section>
  </div>;
}

export function RestaurantListPage() {
  const [params, setParams] = useSearchParams();
  const queryFromUrl = params.get("q") || "";
  const [query, setQuery] = useState(queryFromUrl);
  const [ratingOnly, setRatingOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [fastOnly, setFastOnly] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => setQuery(queryFromUrl), [queryFromUrl]);
  const result = useMemo(() => {
    const term = query.toLowerCase().trim();
    const found = restaurants.filter((restaurant) => {
      const matches = !term || `${restaurant.name} ${restaurant.cuisine.join(" ")} ${restaurant.area} ${restaurant.menu.map((food) => food.name).join(" ")}`.toLowerCase().includes(term);
      return matches && (!ratingOnly || restaurant.rating >= 4) && (!vegOnly || restaurant.pureVeg) && (!fastOnly || restaurant.deliveryMins <= 25) && (priceRange === "all" || (priceRange === "under400" ? restaurant.priceForTwo < 400 : restaurant.priceForTwo >= 400));
    });
    if (sort === "rating") found.sort((a, b) => b.rating - a.rating);
    if (sort === "delivery") found.sort((a, b) => a.deliveryMins - b.deliveryMins);
    if (sort === "price") found.sort((a, b) => a.priceForTwo - b.priceForTwo);
    return found;
  }, [query, ratingOnly, vegOnly, fastOnly, priceRange, sort]);
  const applyQuery = (value) => { setQuery(value); setParams(value ? { q: value } : {}); };
  return <div className="site-container py-10 sm:py-14">
    <div className="mb-9"><p className="eyebrow">GOOD FOOD IS CLOSER THAN YOU THINK</p><h1 className="page-title">Restaurants near you</h1><p className="mt-2 text-stone-500">A few local favourites for your next delicious moment.</p></div>
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="list-search"><Search size={18} /><input value={query} onChange={(e) => applyQuery(e.target.value)} placeholder="Search restaurants, dishes, cuisines..." aria-label="Search restaurants" /></div>
      <div className="flex flex-wrap items-center gap-2"><button className="filter-toggle md:hidden" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16} /> Filters</button>
        <label className="sort-select">Sort by <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Recommended</option><option value="rating">Top rated</option><option value="delivery">Fastest delivery</option><option value="price">Price: low to high</option></select></label>
      </div>
    </div>
    <div className={`filter-row ${showFilters ? "filter-row-open" : ""}`}>
      <label className={`filter-chip ${ratingOnly ? "active" : ""}`}><input type="checkbox" checked={ratingOnly} onChange={(e) => setRatingOnly(e.target.checked)} /> ★ 4.0+</label>
      <label className={`filter-chip ${vegOnly ? "active" : ""}`}><input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /> Pure veg</label>
      <label className={`filter-chip ${fastOnly ? "active" : ""}`}><input type="checkbox" checked={fastOnly} onChange={(e) => setFastOnly(e.target.checked)} /> <Clock3 size={14} /> Under 25 min</label>
      <label className="sort-select">Price for two <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}><option value="all">Any price</option><option value="under400">Under ₹400</option><option value="400plus">₹400 and above</option></select></label>
      {(ratingOnly || vegOnly || fastOnly || priceRange !== "all" || query) && <button className="text-sm font-bold text-brand" onClick={() => { setRatingOnly(false); setVegOnly(false); setFastOnly(false); setPriceRange("all"); applyQuery(""); }}>Clear all</button>}
    </div>
    <p className="mb-5 text-sm text-stone-500">{result.length} restaurants {query && <>for <b className="text-ink">“{query}”</b></>}</p>
    <RestaurantGrid items={result} />
  </div>;
}

export function RestaurantPage() {
  const { id } = useParams();
  const restaurant = restaurants.find((item) => item.id === id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  if (!restaurant) return <NotFoundPage />;
  const menu = restaurant.menu.filter((food) => food.name.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || (filter === "veg" ? food.veg : !food.veg)));
  const sections = [...new Set(menu.map((food) => food.category))];
  return <div className="site-container py-8 sm:py-12">
    <Link to="/restaurants" className="back-link"><ArrowLeft size={16} /> All restaurants</Link>
    <div className="restaurant-hero-card"><ImageWithSkeleton src={restaurant.image} alt={restaurant.name} /><div className="restaurant-hero-overlay"><span className="hero-open">{restaurant.open ? "OPEN NOW" : "CLOSED"}</span><h1>{restaurant.name}</h1><p>{restaurant.cuisine.join(" · ")}</p></div></div>
    <div className="restaurant-info-row"><div className="flex flex-wrap gap-x-6 gap-y-3"><span className="rating-detail"><Star size={16} fill="currentColor" /> {restaurant.rating} <small>({restaurant.ratingCount.toLocaleString("en-IN")} ratings)</small></span><span><MapPin size={16} /> {restaurant.area}, Bengaluru</span><span><Clock3 size={16} /> {restaurant.deliveryMins} min</span><span><Truck size={16} /> {restaurant.fee ? money(restaurant.fee) : "Free"} delivery</span></div><span className="restaurant-offer">{restaurant.offer}</span></div>
    <div className="my-9 border-t border-stone-100 pt-8"><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">MADE FRESH, JUST FOR YOU</p><h2 className="section-title">Our menu</h2></div><div className="list-search menu-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this menu" aria-label="Search this menu" /></div></div>
      <div className="filter-row mb-7"><button onClick={() => setFilter("all")} className={`filter-chip ${filter === "all" ? "active" : ""}`}>All items</button><button onClick={() => setFilter("veg")} className={`filter-chip ${filter === "veg" ? "active" : ""}`}><span className="food-mark veg" /> Veg</button><button onClick={() => setFilter("nonveg")} className={`filter-chip ${filter === "nonveg" ? "active" : ""}`}><span className="food-mark nonveg" /> Non-veg</button><span className="ml-auto hidden items-center gap-1 text-xs text-stone-500 sm:flex"><Sparkles size={14} className="text-brand" /> Popular picks marked below</span></div>
      {sections.length ? sections.map((section) => <section key={section} className="mb-10"><div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3"><h3 className="text-lg font-extrabold">{section}</h3><span className="text-xs text-stone-400">{menu.filter((food) => food.category === section).length} items</span></div><div className="food-grid">{menu.filter((food) => food.category === section).map((food) => <FoodCard key={food.id} food={food} restaurant={restaurant} />)}</div></section>) : <p className="py-12 text-center text-stone-500">No dishes match your search.</p>}
    </div>
  </div>;
}

export function FoodPage() {
  const { id } = useParams();
  const found = findFood(id);
  const [quantity, setQuantity] = useState(1);
  const [extras, setExtras] = useState([]);
  const { addToCart } = useFoodie();
  const extrasList = [{ name: "Extra cheese", price: 40 }, { name: "Mint chutney", price: 25 }, { name: "Make it extra spicy", price: 0 }];
  if (!found) return <NotFoundPage />;
  const total = (found.price + extrasList.filter((item) => extras.includes(item.name)).reduce((sum, item) => sum + item.price, 0)) * quantity;
  const selectedFood = {
    ...found,
    price: found.price + extrasList.filter((item) => extras.includes(item.name)).reduce((sum, item) => sum + item.price, 0),
    customizations: extrasList.filter((item) => extras.includes(item.name)),
  };
  return <div className="site-container py-8 sm:py-12"><Link to={`/restaurants/${found.restaurant.id}`} className="back-link"><ArrowLeft size={16} /> {found.restaurant.name}</Link>
    <div className="food-detail-layout">
      <ImageWithSkeleton className="food-detail-image" src={found.image} alt={found.name} />
      <div className="food-detail-copy"><span className={`food-mark large ${found.veg ? "veg" : "nonveg"}`} /><p className="eyebrow mt-4">{found.category.toUpperCase()} · FROM {found.restaurant.name.toUpperCase()}</p><h1>{found.name}</h1><div className="food-detail-rating"><span className="rating-pill"><Star size={13} fill="currentColor" /> 4.6</span> <span>120+ happy bites</span></div><strong className="food-detail-price">{money(found.price)}</strong><p className="food-detail-description">{found.description} Prepared fresh to order with quality ingredients and plenty of care.</p>
        <div className="customize-box"><h3>Make it yours <small>Optional</small></h3>{extrasList.map((extra) => <label key={extra.name}><span><input type="checkbox" checked={extras.includes(extra.name)} onChange={(e) => setExtras((value) => e.target.checked ? [...value, extra.name] : value.filter((name) => name !== extra.name))} /> {extra.name}</span>{extra.price > 0 && <b>+{money(extra.price)}</b>}</label>)}</div>
        <div className="flex items-center gap-4 pt-5"><div className="quantity-control quantity-large"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><b>{quantity}</b><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button></div><button className="primary-button flex-1" onClick={() => addToCart(selectedFood, found.restaurant, quantity)}>Add to cart · {money(total)}</button></div>
      </div>
    </div>
    <div className="mt-16 border-t border-stone-100 pt-10"><SectionHeading title="You might also love" /><div className="food-grid">{found.restaurant.menu.filter((food) => food.id !== found.id).slice(0, 3).map((food) => <FoodCard key={food.id} food={food} restaurant={found.restaurant} />)}</div></div>
  </div>;
}

export function OffersPage() {
  const offers = [
    { code: "WELCOME150", title: "₹150 off your first order", text: "A warm welcome to the table. Get ₹150 off on orders above ₹499.", tone: "coral" },
    { code: "FOODIE10", title: "10% off, just because", text: "Save 10% on your next meal, up to ₹100. Minimum order ₹299.", tone: "yellow" },
    { code: "FREEDEL", title: "Delivery's on us", text: "Enjoy free delivery on orders above ₹399.", tone: "green" },
  ];
  const { notify } = useFoodie();
  return <div className="site-container py-12 sm:py-16"><p className="eyebrow">A LITTLE EXTRA JOY</p><h1 className="page-title">Offers worth a bite</h1><p className="mt-2 text-stone-500">Good food tastes even better with a great deal.</p><div className="offer-list">{offers.map((offer) => <article key={offer.code} className={`coupon-card coupon-${offer.tone}`}><div><span className="eyebrow">FOODIE EXCLUSIVE</span><h2>{offer.title}</h2><p>{offer.text}</p><small>Valid on select restaurants · One use per customer</small></div><div className="coupon-code"><span>USE CODE</span><b>{offer.code}</b><button onClick={() => { navigator.clipboard?.writeText(offer.code); notify(`${offer.code} copied — apply it at checkout`); }}>Copy code</button></div></article>)}</div><Link to="/restaurants" className="primary-button mt-9">Find something delicious <ArrowRight size={16} /></Link></div>;
}

export function InfoPage({ type = "about" }) {
  const [sent, setSent] = useState(false);
  const content = {
    about: { eyebrow: "A NOTE FROM OUR TABLE", title: "Food tastes better when it brings us together.", body: "Foodie started with a simple idea: great meals should be easy to find and a joy to share. We work with local kitchens, neighbourhood favourites, and curious new chefs to bring you more of what you love, one thoughtful delivery at a time." },
    privacy: { eyebrow: "YOUR TRUST MATTERS", title: "Privacy policy", body: "We only use the details you provide to support your Foodie experience, manage deliveries, and keep your account working. This demo stores profile, address, cart, and order information in your browser's local storage. No payment card data is stored. You can clear saved data by clearing your browser storage." },
    terms: { eyebrow: "THE SMALL PRINT", title: "Terms & conditions", body: "Foodie is a demonstration ordering experience. Restaurant availability, prices, delivery estimates, and payment outcomes are illustrative only. Orders and tracking are simulated and are not sent to restaurants or delivery partners. Please use only demo details." },
    faq: { eyebrow: "HERE TO HELP", title: "Frequently asked questions", body: "" },
  }[type];
  if (type === "contact") return <div className="site-container py-12 sm:py-16"><p className="eyebrow">WE'RE ALL EARS</p><h1 className="page-title">Say hello.</h1><p className="mt-2 text-stone-500">Questions, feedback, or a very good food recommendation? We're listening.</p><div className="contact-layout"><div><h2 className="text-xl font-extrabold">Get in touch</h2><p className="mt-3 leading-7 text-stone-500">hello@foodie.in<br />+91 80 4567 8900<br />Bengaluru, India</p><p className="mt-6 text-sm text-stone-400">Our small, friendly support team is around Monday–Saturday, 9am–6pm.</p></div>{sent ? <div className="success-panel"><span>✓</span><h2>Message sent!</h2><p>Thanks for reaching out. Our team will be in touch soon.</p></div> : <form className="form-card" onSubmit={(e) => { e.preventDefault(); setSent(true); }}><label>Your name<input required placeholder="e.g. Aanya Sharma" /></label><label>Email address<input required type="email" placeholder="you@example.com" /></label><label>How can we help?<textarea required rows="4" placeholder="Tell us what's on your mind..." /></label><button className="primary-button">Send message</button></form>}</div></div>;
  if (type === "faq") {
    const faqs = [["How do I place an order?", "Pick a restaurant, add your favourite dishes, then follow the cart and checkout steps. This demo simulates the order without contacting a restaurant."], ["Can I change my delivery address?", "Yes. Add and manage multiple saved addresses from the Addresses page, then choose one at checkout."], ["How does order tracking work?", "Tracking is simulated in this demo. The order moves through each stage automatically; it is not live GPS tracking."], ["Is my payment information saved?", "No. Payment details are used only in the demo form and are never saved. Never enter real card details here."], ["How do I cancel my order?", "Eligible orders can be cancelled in My Orders before the restaurant starts preparing them."] ];
    return <div className="site-container py-12 sm:py-16"><p className="eyebrow">{content.eyebrow}</p><h1 className="page-title">{content.title}</h1><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></div>;
  }
  return <div className="site-container py-16 sm:py-24"><div className="info-copy"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p>{content.body}</p>{type === "about" && <div className="mt-7 flex flex-wrap gap-3"><Link to="/restaurants" className="primary-button">Explore Foodie <ArrowRight size={16} /></Link><Link to="/contact" className="secondary-button">Get in touch</Link></div>}</div></div>;
}

export function NotFoundPage() {
  return <div className="not-found"><span>🍜</span><p className="eyebrow">OOPS, WRONG TABLE</p><h1>This page isn't on the menu.</h1><p>Let's get you back to something delicious.</p><Link to="/" className="primary-button mt-5">Back to home</Link></div>;
}
