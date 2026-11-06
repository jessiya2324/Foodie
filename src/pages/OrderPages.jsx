import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Clock3, Download, MapPin, Minus, Plus, ShieldCheck, ShoppingBag, Star, Trash2, Truck, Wallet } from "lucide-react";
import { EmptyState, FoodCard, RestaurantCard, SectionHeading } from "../components/Common.jsx";
import { useFoodie } from "../context/FoodieContext.jsx";
import { allFoods, findFood, restaurants } from "../data/food.js";
import { getCartSummary } from "../utils/billing.js";
import { isValidEmail, isValidMobile, makeId, money } from "../utils/storage.js";

const stages = ["Order placed", "Restaurant accepted", "Food preparing", "Out for delivery", "Delivered"];
const paymentMethods = ["UPI", "Google Pay", "PhonePe", "Credit Card", "Debit Card", "Net Banking", "Cash on Delivery"];

function BillSummary({ summary, compact = false }) {
  return <div className={`bill-summary ${compact ? "bill-compact" : ""}`}><h3>Bill details</h3><div><span>Item total</span><span>{money(summary.subtotal)}</span></div><div><span>Delivery fee</span><span>{summary.deliveryFee ? money(summary.deliveryFee) : <b className="text-green-600">FREE</b>}</span></div><div><span>Platform fee</span><span>{money(summary.platformFee)}</span></div><div><span>Taxes & restaurant charges</span><span>{money(summary.taxes)}</span></div>{summary.discount > 0 && <div className="discount-line"><span>Coupon discount</span><span>−{money(summary.discount)}</span></div>}<div className="bill-total"><b>To pay</b><b>{money(summary.total)}</b></div></div>;
}

export function CartPage() {
  const { cart, setCart, setQuantity, clearCart } = useFoodie();
  const summary = getCartSummary(cart);
  const [coupon, setCoupon] = useState(cart.coupon || "");
  const [couponMessage, setCouponMessage] = useState("");
  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    const supported = ["WELCOME150", "FOODIE10", "FREEDEL"];
    if (!supported.includes(code)) return setCouponMessage("That code isn't recognised. Try FOODIE10.");
    setCart((current) => ({ ...current, coupon: code }));
    setCouponMessage(summary.discount ? `${code} applied — you're saving ${money(summary.discount)}!` : `Code saved. Add a little more to unlock ${code}.`);
  };
  if (!summary.items.length) return <div className="site-container py-12"><EmptyState icon={ShoppingBag} title="Your cart is waiting for something good" text="Pick a favourite from one of our neighbourhood restaurants and we'll take it from here." action="Explore restaurants" to="/restaurants" /></div>;
  return <div className="site-container py-10 sm:py-14"><p className="eyebrow">ALMOST THERE</p><h1 className="page-title">Your cart</h1><p className="mt-2 text-stone-500">A very good meal is just a few steps away.</p>
    <div className="checkout-layout mt-8"><div className="space-y-5">
      <div className="panel-card"><div className="flex items-center justify-between border-b border-stone-100 pb-4"><div><p className="text-xs font-bold uppercase tracking-wider text-stone-400">FROM</p><h2 className="mt-1 text-lg font-extrabold">{summary.restaurant?.name}</h2><p className="text-sm text-stone-500">{summary.restaurant?.area}, Bengaluru</p></div><Link to={`/restaurants/${summary.restaurant?.id}`} className="text-sm font-bold text-brand">Add more</Link></div>
        <div className="divide-y divide-stone-100">{summary.items.map((item) => <div key={item.cartKey} className="cart-item"><img src={item.image} alt={item.name} /><div className="min-w-0 flex-1"><span className={`food-mark ${item.veg ? "veg" : "nonveg"}`} /><h3>{item.name}</h3><p>{money(item.price)} each{item.customizations.length ? ` · ${item.customizations.map((extra) => extra.name).join(", ")}` : ""}</p></div><div className="quantity-control"><button onClick={() => setQuantity(item.cartKey, item.quantity - 1)} aria-label={`Remove one ${item.name}`}>{item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={14} />}</button><b>{item.quantity}</b><button onClick={() => setQuantity(item.cartKey, item.quantity + 1)} aria-label={`Add one ${item.name}`}><Plus size={14} /></button></div><strong className="cart-item-total">{money(item.price * item.quantity)}</strong></div>)}</div>
        <label className="instruction-field">Cooking instructions <span>Optional</span><textarea rows="2" placeholder="Anything you'd like the kitchen to know?" value={cart.instructions} onChange={(e) => setCart((current) => ({ ...current, instructions: e.target.value }))} /></label>
      </div>
      <div className="panel-card"><h3 className="panel-heading">Offers & coupons</h3><div className="coupon-input"><input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter coupon code" aria-label="Coupon code" /><button onClick={applyCoupon}>Apply</button></div>{couponMessage && <p className={`mt-2 text-xs ${summary.discount ? "text-green-600" : "text-stone-500"}`}>{couponMessage}</p>}<p className="mt-3 text-xs text-stone-400">Try WELCOME150, FOODIE10 or FREEDEL</p></div>
    </div><aside className="checkout-aside"><BillSummary summary={summary} /><Link to="/checkout" className="primary-button mt-5 w-full">Proceed to checkout <ArrowRight size={17} /></Link><button className="mt-3 w-full text-sm font-semibold text-stone-400 hover:text-red-500" onClick={() => { if (window.confirm("Remove all items from your cart?")) clearCart(); }}>Clear cart</button><div className="secure-note"><ShieldCheck size={16} /> Safe and secure checkout</div></aside></div>
  </div>;
}

export function AddressesPage() {
  const { addresses, saveAddress, deleteAddress, notify } = useFoodie();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const openForm = (address = {}) => { setEditing(address.id || "new"); setForm({ name: "", mobile: "", house: "", street: "", landmark: "", city: "Bengaluru", state: "Karnataka", pincode: "", type: "Home", ...address }); setError(""); };
  const submit = (event) => {
    event.preventDefault();
    if (!isValidMobile(form.mobile)) return setError("Enter a valid 10-digit Indian mobile number.");
    if (!/^\d{6}$/.test(form.pincode)) return setError("Enter a valid 6-digit pincode.");
    const saved = { ...form, id: editing === "new" ? makeId("ADDR") : editing };
    saveAddress(saved);
    setEditing(null);
    notify("Address saved");
    if (params.get("return") === "checkout") navigate("/checkout");
  };
  return <div className="site-container py-10 sm:py-14"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">WHERE SHOULD WE MEET YOU?</p><h1 className="page-title">Your addresses</h1><p className="mt-2 text-stone-500">Save a few spots for easier, happier deliveries.</p></div><button className="primary-button self-start sm:self-auto" onClick={() => openForm()}><Plus size={17} /> Add new address</button></div>
    {!addresses.length && !editing ? <div className="py-4"><EmptyState icon={MapPin} title="No saved addresses yet" text="Add your home, work, or favourite place to get started." action="Add your first address" /></div> : <div className="address-grid">{addresses.map((address) => <article key={address.id} className="address-card"><div className="flex items-start justify-between"><span className="address-type">{address.type}</span><div className="flex gap-2"><button onClick={() => openForm(address)} className="small-action">Edit</button><button onClick={() => { if (window.confirm("Delete this saved address?")) deleteAddress(address.id); }} className="small-action danger">Delete</button></div></div><h3>{address.name}</h3><p>{address.house}, {address.street}{address.landmark ? `, near ${address.landmark}` : ""}<br />{address.city}, {address.state} {address.pincode}</p><small>+91 {address.mobile}</small></article>)}</div>}
    {editing && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}><form className="address-modal form-card" onSubmit={submit}><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">DELIVERY DETAILS</p><h2 className="text-xl font-extrabold">{editing === "new" ? "Add an address" : "Edit address"}</h2></div><button type="button" className="small-action" onClick={() => setEditing(null)}>Close</button></div>
      <div className="form-grid"><label>Full name<input required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Mobile number<input required inputMode="numeric" maxLength="10" value={form.mobile || ""} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} /></label><label>House / flat number<input required value={form.house || ""} onChange={(e) => setForm({ ...form, house: e.target.value })} /></label><label>Street / area<input required value={form.street || ""} onChange={(e) => setForm({ ...form, street: e.target.value })} /></label><label>Landmark <span>Optional</span><input value={form.landmark || ""} onChange={(e) => setForm({ ...form, landmark: e.target.value })} /></label><label>City<input required value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label><label>State<input required value={form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value })} /></label><label>Pincode<input required inputMode="numeric" maxLength="6" value={form.pincode || ""} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} /></label></div>
      <label className="mt-4">Address type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Home</option><option>Work</option><option>Other</option></select></label>{error && <p className="form-error">{error}</p>}<button className="primary-button mt-5 w-full">{editing === "new" ? "Save address" : "Update address"}</button></form></div>}
  </div>;
}

export function CheckoutPage() {
  const { cart, addresses, user, setCart } = useFoodie();
  const [selected, setSelected] = useState(addresses[0]?.id || "");
  const [mobile, setMobile] = useState(user?.mobile || addresses[0]?.mobile || "");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const summary = getCartSummary(cart);
  useEffect(() => { if (!addresses.some((address) => address.id === selected)) setSelected(addresses[0]?.id || ""); }, [addresses, selected]);
  const continueToPayment = () => {
    if (!summary.items.length) return setError("Your cart is empty.");
    if (!selected) return setError("Please add and select a delivery address.");
    if (!isValidMobile(mobile)) return setError("Enter a valid 10-digit contact number.");
    navigate("/payment", { state: { addressId: selected, mobile, instructions } });
  };
  return <div className="site-container py-10 sm:py-14"><p className="eyebrow">ONE LAST THING</p><h1 className="page-title">Delivery details</h1><div className="checkout-layout mt-8"><div className="space-y-5">
    <div className="panel-card"><div className="flex items-center justify-between"><h2 className="panel-heading">Delivery address</h2><Link to="/addresses?return=checkout" className="text-sm font-bold text-brand">Manage addresses</Link></div>
      {addresses.length ? <div className="address-select-list">{addresses.map((address) => <label key={address.id} className={selected === address.id ? "selected" : ""}><input type="radio" name="address" checked={selected === address.id} onChange={() => { setSelected(address.id); setMobile(address.mobile); }} /><span className="address-type">{address.type}</span><b>{address.name}</b><small>{address.house}, {address.street}, {address.city} {address.pincode}</small></label>)}</div> : <div className="empty-address"><MapPin size={22} /><p>Add a delivery address to continue.</p><Link to="/addresses?return=checkout" className="secondary-button">Add address</Link></div>}
      <label className="mt-5">Delivery contact number<input inputMode="numeric" maxLength="10" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" /></label>
    </div>
    <div className="panel-card"><label className="instruction-field"><h3 className="panel-heading">Delivery instructions <span>Optional</span></h3><textarea rows="3" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="E.g. Please leave it at the door..." /></label></div>
    <div className="panel-card"><h2 className="panel-heading">{summary.restaurant?.name}</h2><div className="checkout-items">{summary.items.map((item) => <div key={item.cartKey}><span>{item.quantity} × {item.name}</span><b>{money(item.price * item.quantity)}</b></div>)}</div></div>
    {error && <p className="form-error">{error}</p>}<button onClick={continueToPayment} className="primary-button w-full sm:w-auto">Continue to payment <ArrowRight size={17} /></button>
  </div><aside className="checkout-aside"><BillSummary summary={summary} /><div className="secure-note"><ShieldCheck size={16} /> Your payment details are never stored</div></aside></div></div>;
}

export function PaymentPage() {
  const { cart, addresses, user, placeOrder, notify } = useFoodie();
  const location = window.history.state?.usr || {};
  const [method, setMethod] = useState("UPI");
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [bank, setBank] = useState("");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();
  const summary = getCartSummary(cart);
  const address = addresses.find((item) => item.id === location.addressId) || addresses[0];
  const isCard = method === "Credit Card" || method === "Debit Card";
  const submit = (event) => {
    event.preventDefault();
    if (!summary.items.length) return setError("Your cart is empty.");
    if (!address) return setError("Please add a delivery address before paying.");
    if (method === "UPI" && !/^[\w.-]+@[\w.-]+$/.test(upi)) return setError("Enter a valid UPI ID, for example name@bank.");
    if (isCard && (!/^\d{16}$/.test(card.number.replace(/\s/g, "")) || !card.name.trim() || !/^\d{2}\/\d{2}$/.test(card.expiry) || !/^\d{3,4}$/.test(card.cvv))) return setError("Enter valid demo card details. Card details are not saved.");
    if (method === "Net Banking" && !bank) return setError("Select your bank.");
    setError("");
    setPaying(true);
    window.setTimeout(() => {
      const order = placeOrder({
        restaurant: summary.restaurant,
        items: summary.items.map((item) => ({ cartKey: item.cartKey, foodId: item.id, name: item.name, image: item.image, price: item.price, quantity: item.quantity, veg: item.veg, customizations: item.customizations })),
        address: { ...address, mobile: location.mobile || address.mobile },
        deliveryInstructions: location.instructions || "",
        paymentMethod: method,
        bill: { subtotal: summary.subtotal, deliveryFee: summary.deliveryFee, platformFee: summary.platformFee, taxes: summary.taxes, discount: summary.discount, total: summary.total, coupon: cart.coupon },
        customer: user?.name || address.name,
      });
      notify(method === "Cash on Delivery" ? "Order placed — pay when it arrives!" : "Payment successful — your order is placed!");
      navigate(`/order-confirmation/${order.id}`);
    }, 850);
  };
  return <div className="site-container py-10 sm:py-14"><p className="eyebrow">SAFE & SECURE CHECKOUT</p><h1 className="page-title">Choose payment</h1><div className="checkout-layout mt-8"><form className="panel-card payment-card" onSubmit={submit}><div className="mb-5 rounded-xl bg-green-50 p-3 text-sm text-green-700"><ShieldCheck size={17} className="mr-2 inline" />Demo payment only. Never enter real card details.</div>
    <div className="payment-methods">{paymentMethods.map((item) => <label key={item} className={method === item ? "selected" : ""}><input type="radio" name="method" value={item} checked={method === item} onChange={() => { setMethod(item); setError(""); }} /><span className="payment-method-icon">{item === "Cash on Delivery" ? "₹" : item.includes("Card") ? "▰" : item === "Net Banking" ? "⌂" : "↗"}</span><b>{item}</b>{method === item && <Check size={16} className="ml-auto text-brand" />}</label>)}</div>
    {method === "UPI" && <label className="mt-5">UPI ID<input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="yourname@bank" autoComplete="off" /></label>}
    {(method === "Google Pay" || method === "PhonePe") && <div className="payment-note"><Wallet size={19} /><p>You'll be securely redirected to {method} in a real checkout. For this demo, continue to simulate your payment.</p></div>}
    {isCard && <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2">Card number<input inputMode="numeric" autoComplete="off" maxLength="19" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16) })} placeholder="1234 5678 9012 3456" /></label><label className="sm:col-span-2">Name on card<input autoComplete="off" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></label><label>Expiry (MM/YY)<input autoComplete="off" maxLength="5" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" /></label><label>CVV<input inputMode="numeric" autoComplete="off" maxLength="4" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })} placeholder="•••" /></label></div>}
    {method === "Net Banking" && <label className="mt-5">Choose your bank<select value={bank} onChange={(e) => setBank(e.target.value)}><option value="">Select a bank</option><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option></select></label>}
    {error && <p className="form-error mt-4">{error}</p>}<button disabled={paying} className="primary-button mt-6 w-full">{paying ? "Processing demo payment..." : `Pay ${money(summary.total)}`} <ArrowRight size={17} /></button><p className="mt-3 text-center text-xs text-stone-400">Demo flow only · No actual payment will be charged</p>
  </form>  <aside className="checkout-aside"><h3 className="mb-4 text-lg font-extrabold">Order summary</h3><p className="mb-3 text-sm font-semibold">{summary.restaurant?.name}</p><div className="checkout-items">{summary.items.map((item) => <div key={item.cartKey}><span>{item.quantity} × {item.name}</span><b>{money(item.price * item.quantity)}</b></div>)}</div><BillSummary summary={summary} compact /></aside></div></div>;
}

function InvoiceButton({ order }) {
  const download = () => {
    const text = [`FOODIE — DEMO INVOICE`, `Order: ${order.id}`, `Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`, `Restaurant: ${order.restaurant.name}`, "", ...order.items.map((item) => `${item.quantity} x ${item.name} — ${money(item.price * item.quantity)}`), "", `Total paid: ${money(order.bill.total)}`, `Payment: ${order.paymentMethod}`, "This is a demo invoice."].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    link.download = `foodie-invoice-${order.id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return <button className="secondary-button" onClick={download}><Download size={16} /> Download invoice</button>;
}

export function OrderConfirmationPage() {
  const { id } = useParams();
  const { orders } = useFoodie();
  const order = orders.find((item) => item.id === id);
  if (!order) return <div className="site-container py-12"><EmptyState title="We couldn't find that order" text="Your order may have expired from this browser." action="Go to my orders" to="/orders" /></div>;
  return <div className="site-container py-10 sm:py-14"><div className="confirmation-card"><div className="confirmation-check"><Check size={32} /></div><p className="eyebrow">IT'S OFFICIALLY HAPPENING</p><h1>Your order is on its way!</h1><p>We've let <b>{order.restaurant.name}</b> know. Time to get excited.</p><div className="confirmation-eta"><Clock3 size={18} /><div><b>{order.restaurant.deliveryMins} min</b><small>Estimated delivery</small></div></div></div>
    <div className="order-detail-card"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-5"><div><p className="eyebrow">ORDER ID</p><h2 className="text-lg font-extrabold">{order.id}</h2></div><span className="order-status-pill">Order placed</span></div><div className="py-5"><h3 className="mb-4 font-extrabold">{order.restaurant.name}</h3>{order.items.map((item) => <div className="order-line" key={item.cartKey || item.foodId}><span>{item.quantity} × {item.name}{item.customizations?.length ? ` · ${item.customizations.map((extra) => extra.name).join(", ")}` : ""}</span><b>{money(item.price * item.quantity)}</b></div>)}</div><div className="border-t border-stone-100 py-5"><h3 className="mb-2 font-bold">Delivering to</h3><p className="text-sm leading-6 text-stone-500">{order.address.name}, {order.address.house}, {order.address.street}, {order.address.city} {order.address.pincode}<br />+91 {order.address.mobile}</p>    <p className="mt-3 text-sm text-stone-500">Payment · {order.paymentMethod} <b className="ml-2 text-green-600">{order.paymentMethod === "Cash on Delivery" ? `Due on delivery · ${money(order.bill.total)}` : `Paid ${money(order.bill.total)}`}</b></p></div><div className="flex flex-wrap gap-3"><Link to={`/track/${order.id}`} className="primary-button">Track your order <ArrowRight size={16} /></Link><InvoiceButton order={order} /></div></div></div>;
}

export function TrackingPage() {
  const { id } = useParams();
  const { orders, updateOrder } = useFoodie();
  const order = orders.find((item) => item.id === id);
  useEffect(() => {
    if (!order || order.statusIndex >= stages.length - 1) return undefined;
    const timer = window.setTimeout(() => updateOrder(order.id, { statusIndex: order.statusIndex + 1, status: stages[order.statusIndex + 1] }), 12000);
    return () => window.clearTimeout(timer);
  }, [order?.id, order?.statusIndex]);
  if (!order) return <div className="site-container py-12"><EmptyState title="No order to track" text="Place an order and come back here to follow its demo journey." action="Explore restaurants" to="/restaurants" /></div>;
  const current = Math.min(order.statusIndex || 0, stages.length - 1);
  const progress = ["Order placed", "Restaurant accepted", "Food preparing", "Out for delivery", "Delivered"];
  return <div className="site-container py-10 sm:py-14"><p className="eyebrow">YOUR ORDER, AT A GLANCE</p><h1 className="page-title">Order tracking</h1><div className="tracking-layout mt-8"><div className="panel-card"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-stone-500">Order {order.id}</p><h2 className="mt-1 text-2xl font-extrabold">{progress[current]}</h2></div><div className="tracking-plate">🍲</div></div><p className="mt-2 text-stone-500">{current === 4 ? "Your meal has arrived. Enjoy every bite!" : `Estimated delivery in ${Math.max(0, order.restaurant.deliveryMins - current * 5)} minutes`}</p>
      <div className="tracking-steps">{progress.map((stage, index) => <div key={stage} className={`tracking-step ${index <= current ? "complete" : ""} ${index === current ? "current" : ""}`}><span className="step-dot">{index < current ? <Check size={14} /> : index + 1}</span><div><b>{stage}</b>{index === current && <small>{index === 0 ? "Your order is with the restaurant" : "Updated just now · Demo status"}</small>}</div></div>)}</div>
      <div className="demo-notice"><ShieldCheck size={16} /> This is a simulated order journey, not live GPS tracking.</div>
    </div><aside className="space-y-5"><div className="panel-card"><p className="eyebrow">YOUR RESTAURANT</p><h3 className="mt-1 font-extrabold">{order.restaurant.name}</h3><p className="mt-1 text-sm text-stone-500">{order.restaurant.area}, Bengaluru</p><p className="mt-4 flex items-center gap-2 text-sm"><Clock3 size={16} className="text-brand" /> {order.restaurant.deliveryMins} min estimated</p></div><div className="panel-card partner-card"><div className="partner-avatar">👨🏽‍🦱</div><div><p className="eyebrow">DEMO DELIVERY PARTNER</p><h3 className="font-extrabold">Arjun Kumar</h3><p className="mt-1 flex items-center gap-1 text-sm text-stone-500"><Star size={13} fill="currentColor" className="text-amber-500" /> 4.9 · Partner ID FD-204</p></div></div><Link to="/orders" className="secondary-button w-full">View all orders</Link></aside></div></div>;
}

export function OrdersPage() {
  const { orders, updateOrder, addToCart, notify } = useFoodie();
  const downloadOrder = (order) => {
    const text = [`FOODIE — DEMO INVOICE`, `Order: ${order.id}`, `Restaurant: ${order.restaurant.name}`, ...order.items.map((item) => `${item.quantity} x ${item.name} — ${money(item.price * item.quantity)}`), `Total: ${money(order.bill.total)}`].join("\n");
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    anchor.download = `foodie-invoice-${order.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };
  const reorder = (order) => {
    const restaurant = restaurants.find((item) => item.id === order.restaurant.id);
    if (!restaurant) return notify("This restaurant is no longer available.");
    order.items.forEach((item) => {
      const food = restaurant.menu.find((dish) => dish.id === item.foodId);
      if (food) addToCart({ ...food, price: item.price, customizations: item.customizations || [] }, restaurant, item.quantity);
    });
    notify("Your favourites are back in the cart");
  };
  if (!orders.length) return <div className="site-container py-12"><EmptyState icon={ShoppingBag} title="No orders yet" text="Your next favourite meal is just around the corner." action="Find a restaurant" to="/restaurants" /></div>;
  const currentOrders = orders.filter((order) => order.statusIndex < stages.length - 1);
  const pastOrders = orders.filter((order) => order.statusIndex >= stages.length - 1);
  const renderOrders = (items) => items.map((order) => <article className="past-order-card" key={order.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString("en-IN")} · {order.id}</p><h3 className="mt-1 font-extrabold">{order.restaurant.name}</h3><p className="mt-1 text-sm text-stone-500">{order.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}</p></div><span className={`order-status-pill ${order.status === "Delivered" ? "delivered" : ""}`}>{order.status}</span></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4"><b>{money(order.bill.total)}</b><div className="flex flex-wrap gap-2">{order.statusIndex < 2 && <button className="small-action danger" onClick={() => { if (window.confirm("Cancel this demo order?")) updateOrder(order.id, { statusIndex: 4, status: "Cancelled" }); }}>Cancel order</button>}{order.statusIndex < 4 && <Link className="small-action" to={`/track/${order.id}`}>Track order</Link>}<button className="small-action" onClick={() => reorder(order)}>Reorder</button><button className="small-action" onClick={() => downloadOrder(order)}>Invoice</button></div></div></article>);
  return <div className="site-container py-10 sm:py-14"><p className="eyebrow">ALL YOUR GOOD EATS</p><h1 className="page-title">My orders</h1>{currentOrders.length > 0 && <section className="mt-8"><h2 className="mb-4 text-xl font-extrabold">On the way</h2><div className="order-list">{renderOrders(currentOrders)}</div></section>}{pastOrders.length > 0 && <section className="mt-10"><h2 className="mb-4 text-xl font-extrabold">Past orders</h2><div className="order-list">{renderOrders(pastOrders)}</div></section>}</div>;
}

export function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useFoodie();
  const savedRestaurants = wishlist.filter((item) => item.type === "restaurant").map((item) => restaurants.find((restaurant) => restaurant.id === item.id)).filter(Boolean);
  const savedFoods = wishlist.filter((item) => item.type === "food").map((item) => findFood(item.id)).filter(Boolean);
  if (!wishlist.length) return <div className="site-container py-12"><EmptyState icon={Star} title="Save the good stuff" text="Tap the heart on a restaurant or dish to keep it close for next time." action="Find your favourites" to="/restaurants" /></div>;
  return <div className="site-container py-10 sm:py-14"><p className="eyebrow">THE ONES YOU LOVE</p><h1 className="page-title">Your wishlist</h1>{savedRestaurants.length > 0 && <section className="mt-8"><SectionHeading title="Saved restaurants" /><div className="restaurant-grid">{savedRestaurants.map((restaurant) => <div className="relative" key={restaurant.id}><RestaurantCard restaurant={restaurant} /><button className="remove-saved" onClick={() => toggleWishlist("restaurant", restaurant.id)} aria-label={`Remove ${restaurant.name}`}><Trash2 size={15} /></button></div>)}</div></section>}{savedFoods.length > 0 && <section className="mt-10"><SectionHeading title="Favourite dishes" /><div className="food-grid">{savedFoods.map((food) => <div key={food.id} className="relative"><FoodCard food={food} restaurant={food.restaurant} /><button className="remove-saved" onClick={() => toggleWishlist("food", food.id)} aria-label={`Remove ${food.name}`}><Trash2 size={15} /></button></div>)}</div></section>}</div>;
}

export function ProfilePage() {
  const { user, setUser, orders, notify } = useFoodie();
  const [form, setForm] = useState(user || {});
  const navigate = useNavigate();
  if (!user) return <div className="site-container py-12"><EmptyState title="Sign in to see your profile" text="Your saved details and order history live here." action="Sign in" to="/login" /></div>;
  return <div className="site-container py-10 sm:py-14"><p className="eyebrow">YOUR FOODIE ACCOUNT</p><h1 className="page-title">My profile</h1><div className="profile-layout"><form className="form-card" onSubmit={(e) => { e.preventDefault(); setUser(form); notify("Profile updated"); }}><h2 className="panel-heading mb-5">Personal details</h2><label>Full name<input required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email address<input type="email" required value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Mobile number<input inputMode="numeric" maxLength="10" value={form.mobile || ""} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} /></label><button className="primary-button mt-5">Save changes</button></form><div className="profile-side"><Link to="/orders" className="profile-shortcut"><ShoppingBag /><div><b>{orders.length} orders</b><small>See your order history</small></div><ArrowRight /></Link><Link to="/addresses" className="profile-shortcut"><MapPin /><div><b>Your addresses</b><small>Manage delivery addresses</small></div><ArrowRight /></Link><button className="secondary-button mt-6 w-full" onClick={() => { setUser(null); navigate("/"); }}>Log out</button></div></div></div>;
}
