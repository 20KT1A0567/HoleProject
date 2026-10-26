import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = "http://localhost:5000/api";
const unwrap = async <T,>(response: Response): Promise<T> => {
  const json = await response.json();
  return json.data ?? json;
};

type Product = { id:string; name:string; brand:string; categoryName:string; cpu:string; ram:string; storage:string; price:number; mrp:number; discount:number; rating:number; reviews:number; stock:number; store:string; accent:string; imageUrl?:string };
type Store = { id:string; name:string; city:string; address:string; ordersCount:number; sales:number; rating:number; status:string };
type CartItem = { id:string; qty:number };

const rupee = (n:number) => `₹${n.toLocaleString("en-IN")}`;
const Laptop = ({ accent = "#172033" }: { accent?: string }) => <div className="laptop" style={{ "--accent": accent } as React.CSSProperties} />;

function App() {
  const [route, setRoute] = useState(location.hash.replace("#", "") || "home");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem("vr-cart") || "[]"));
  const [user, setUser] = useState<{phone:string} | null>(() => JSON.parse(localStorage.getItem("vr-user") || "null"));

  useEffect(() => {
    Promise.all([fetch(`${API}/products`).then(unwrap<Product[]>), fetch(`${API}/stores`).then(unwrap<Store[]>)])
      .then(([p, s]) => { setProducts(p); setStores(s); })
      .catch(() => setProducts([]));
    const onHash = () => setRoute(location.hash.replace("#", "") || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => localStorage.setItem("vr-cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("vr-user", JSON.stringify(user)), [user]);

  const addCart = (id:string) => setCart(items => {
    const found = items.find(item => item.id === id);
    return found ? items.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item) : [...items, { id, qty: 1 }];
  });
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const content = route.startsWith("listing") ? <Listing products={products} addCart={addCart} /> :
    route.startsWith("product") ? <ProductDetail products={products} addCart={addCart} id={route.split("/")[1]} /> :
    route === "cart" ? <Cart products={products} cart={cart} setCart={setCart} user={user} /> :
    route === "login" ? <Login setUser={setUser} /> :
    route === "register" ? <Register setUser={setUser} /> :
    route === "wishlist" ? <Wishlist products={products} /> :
    route === "orders" ? <Orders user={user} /> :
    route === "stores" ? <StoresPage stores={stores} /> :
    route === "contact" ? <Contact products={products} /> :
    <Home products={products} stores={stores} addCart={addCart} />;

  return <><Header count={count} user={user} /><main>{content}</main><Footer /></>;
}

function Header({ count, user }:{ count:number; user:{phone:string}|null }) {
  return <><div className="top-strip"><span>6 Months Warranty</span><span>Quality Checked</span><span>7 Days Easy Returns</span><span>Fast & Safe Delivery</span><b>Store Locator · Track Order · Help & Support</b></div>
    <header className="site-header"><a className="brand" href="#home"><span>VR</span><b>TECHNOLOGIES</b><small>REFURBISHED, RELIABLE. READY FOR YOU.</small></a><div className="search"><input placeholder="Search laptops, brands, models..." /><button>⌕</button></div><div className="deliver"><small>Deliver to</small><b>KPHB, Hyderabad</b></div><a href="#login" className="login-link">♙ <span>{user ? "Signed In" : "Sign In"}<b>{user?.phone || "My Account"}</b></span></a><a href="#cart" className="cart-link">🛒<b>{count}</b><span>Cart</span></a></header>
    <nav className="nav"><button>☰ All Categories</button><a href="#listing">Laptops</a><a href="#listing">Desktops</a><a href="#listing">Accessories</a><a href="#stores">Stores</a><a href="#wishlist">Wishlist</a><a href="#orders">Orders</a><a href="#contact">Contact</a></nav></>;
}

function ProductCard({ product, addCart }:{ product:Product; addCart:(id:string)=>void }) {
  return <article className="product-card" onDoubleClick={() => location.hash = `product/${product.id}`}><span className="discount">{product.discount}% OFF</span><span className="heart">♡</span><div className="product-art"><Laptop accent={product.accent} /></div><h3>{product.name}</h3><p>{product.cpu} / {product.ram} / {product.storage}</p><div><span className="price">{rupee(product.price)}</span><span className="mrp">{rupee(product.mrp)}</span></div><div className="stars">★★★★★ <span>{product.rating} ({product.reviews})</span></div><button className="add" onClick={() => addCart(product.id)}>🛒 Add to Cart</button></article>;
}

function Home({ products, stores, addCart }:{ products:Product[]; stores:Store[]; addCart:(id:string)=>void }) {
  return <><section className="hero"><span className="eyebrow">BEST DEALS ON REFURBISHED LAPTOPS</span><h1>UP TO <span>40% OFF</span><br/>ON REFURBISHED LAPTOPS</h1><p>Top Brands | Tested Quality | Warranty Included</p><button onClick={() => location.hash = "listing"}>SHOP NOW ❯</button><div className="hero-features"><span>6 Months Warranty</span><span>Quality Checked</span><span>7 Days Returns</span><span>Fast Delivery</span></div><div className="dots"><i/><i/><i/><i/></div></section>
    <section className="categories">{["LAPTOPS","DESKTOPS","ACCESSORIES","MONITORS"].map((c,i)=><a key={c} href="#listing" className="category"><div className={["device","tower","keyboard","monitor"][i]} /><b>{c}<span>Explore Now ❯</span></b></a>)}</section>
    <Title title="FEATURED LAPTOPS" link="View All ❯" /><section className="grid">{products.slice(0,5).map(p => <ProductCard key={p.id} product={p} addCart={addCart} />)}</section>
    <section className="feature-bar">{["6 Months Warranty|On all Products","Quality Checked|100+ Tests Passed","7 Days Easy Returns|No Questions Asked","Fast & Safe Delivery|Across Hyderabad","Best Prices|Unbeatable Deals"].map(f => { const [a,b]=f.split("|"); return <div key={a}><b>{a}</b><span>{b}</span></div>;})}</section>
    <Title title="AVAILABLE AT YOUR NEARBY STORES" link="View All Stores ❯" /><section className="store-grid">{stores.slice(0,2).map(s => <StoreCard key={s.id} store={s} />)}<div className="store check"><h3>Check product availability at stores</h3><p>Select a store to see real-time stock</p><button>Choose Store</button></div></section>
    <Title title="TODAY'S BEST DEALS" link="View All Deals" /><section className="deals"><Deal title="Under ₹30,000" /><Deal title="Gaming Laptops" dark /><Deal title="Accessories Deals" /></section></>;
}

function Title({title, link}:{title:string; link:string}) { return <div className="section-head"><h2>{title}</h2><a>{link}</a></div>; }
function StoreCard({ store }:{ store:Store }) { return <div className="store"><div className="store-img" /><div><h3>{store.name}</h3><p>{store.address}</p><p><b>{store.status}</b> · 10:00 AM - 9:00 PM</p><p>⌖ 5 km away · ☏ 93981 23456</p><button>View Store</button></div></div>; }
function Deal({ title, dark=false }:{title:string; dark?:boolean}) { return <div className={`deal ${dark ? "dark" : ""}`}><div><h3>{title}</h3><p>Best refurbished tech at great prices</p><b>SHOP NOW</b></div><div className="device" /></div>; }

function Listing({ products, addCart }:{ products:Product[]; addCart:(id:string)=>void }) {
  return <section className="listing"><aside className="filters"><h4>FILTERS</h4>{["Laptops","Ultrabooks","Gaming Laptops","Lenovo","HP","Dell","Asus","4 GB","8 GB","16 GB"].map(x => <label key={x}><input type="checkbox" /> {x}</label>)}<button>Apply</button></aside><section><div className="listing-top"><h2>Showing 1-{products.length} of 120 results</h2><select><option>Sort By: Popularity</option></select></div><div className="grid">{products.map(p => <ProductCard key={p.id} product={p} addCart={addCart} />)}</div></section></section>;
}

function ProductDetail({ products, id, addCart }:{ products:Product[]; id?:string; addCart:(id:string)=>void }) {
  const p = products.find(x => x.id === id) || products[0];
  if (!p) return <div className="panel">Loading product...</div>;
  return <section className="detail"><div className="detail-card"><div><div className="detail-image"><Laptop accent={p.accent}/></div><div className="thumbs"><span><Laptop accent={p.accent}/></span><span><Laptop accent={p.accent}/></span><span><Laptop accent={p.accent}/></span></div></div><div><p>Home › Laptops › {p.name}</p><h1>{p.name}</h1><p>{p.cpu} / {p.ram} / {p.storage}</p><div className="stars">★★★★★ {p.rating} ({p.reviews} Reviews)</div><div><span className="price">{rupee(p.price)}</span><span className="mrp">{rupee(p.mrp)}</span><b> {p.discount}% OFF</b></div><p className="stock">In Stock · {p.store} Store</p><div className="actions"><button onClick={() => addCart(p.id)}>Add to Cart</button><button onClick={() => { addCart(p.id); location.hash = "cart"; }}>Buy Now</button></div><div className="tabs"><b>DESCRIPTION</b><p>The {p.name} is a reliable business laptop with powerful performance, durability, and great battery backup.</p><ul><li>{p.cpu}</li><li>{p.ram} DDR4 RAM</li><li>{p.storage}</li><li>Windows 10 Pro</li></ul></div></div></div></section>;
}

function Cart({ products, cart, setCart, user }:{ products:Product[]; cart:CartItem[]; setCart:React.Dispatch<React.SetStateAction<CartItem[]>>; user:{phone:string}|null }) {
  const rows = cart.map(i => ({ ...i, product: products.find(p => p.id === i.id) })).filter((x): x is CartItem & {product:Product} => Boolean(x.product));
  const subtotal = useMemo(() => rows.reduce((s, i) => s + i.product.price * i.qty, 0), [rows]);
  const qty = (id:string, d:number) => setCart(items => items.map(i => i.id === id ? { ...i, qty:i.qty+d } : i).filter(i => i.qty > 0));
  const place = async () => { await fetch(`${API}/orders`, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ customer:user?.phone || "Guest", store:"KPHB", amount:subtotal }) }); setCart([]); alert("Order placed successfully"); location.hash = "home"; };
  return <section className="cart-layout"><div className="panel"><h2>My Cart ({rows.length} items)</h2>{rows.map(i => <div className="cart-item" key={i.id}><Laptop accent={i.product.accent}/><div><h3>{i.product.name}</h3><p>{i.product.cpu} / {i.product.ram}</p><b>{rupee(i.product.price)}</b></div><div><button onClick={() => qty(i.id,-1)}>−</button> {i.qty} <button onClick={() => qty(i.id,1)}>+</button></div></div>)}<input placeholder="Enter coupon code" /><button>Apply</button></div><aside className="panel checkout"><h3>PRICE DETAILS</h3><p>Total MRP <span>{rupee(subtotal + 4000)}</span></p><p>Discount <span>-₹4,000</span></p><p>Shipping <span>FREE</span></p><hr/><p className="total">Total Amount <span>{rupee(subtotal)}</span></p><button onClick={place}>Continue to Checkout</button></aside></section>;
}

function Login({ setUser }:{ setUser:(user:{phone:string})=>void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("123456");
  const [msg, setMsg] = useState("");
  const send = async () => { const res = await fetch(`${API}/auth/request-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ phone }) }).then(unwrap<{demoOtp:string}>); setMsg(`Demo OTP sent: ${res.demoOtp}`); };
  const verify = async () => { const res = await fetch(`${API}/auth/verify-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ phone, otp }) }); if(res.ok){ setUser({ phone }); location.hash = "home"; } else setMsg("Invalid OTP"); };
  return <section className="login-layout"><div className="login-card"><h2>Welcome Back!</h2><p>Login based on phone number and OTP</p><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Enter phone number" /><button onClick={send}>Send OTP</button><input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter OTP" /><button onClick={verify}>Login</button><p>{msg}</p></div><div className="login-visual"><Laptop /></div></section>;
}

function Register({ setUser }:{ setUser:(user:{phone:string})=>void }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"" });
  const [msg, setMsg] = useState("");
  const register = async () => {
    const response = await fetch(`${API}/auth/register`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    if (response.ok) { setUser({ phone: form.phone }); location.hash = "home"; } else setMsg("Could not create account");
  };
  return <section className="login-layout"><div className="login-card"><h2>Create Account</h2><input placeholder="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button onClick={register}>Register</button><p>{msg}</p></div><div className="login-visual"><Laptop /></div></section>;
}

function Wishlist({ products }:{ products:Product[] }) {
  return <section className="page-panel"><Title title="WISHLIST" link="Saved Products" /><div className="grid">{products.slice(0,4).map(p => <ProductCard key={p.id} product={p} addCart={() => undefined}/>)}</div></section>;
}

function Orders({ user }:{ user:{phone:string}|null }) {
  return <section className="page-panel"><div className="panel"><h2>Order History</h2><p>{user ? `Orders for ${user.phone}` : "Login to view your orders."}</p>{["ORD1254","ORD1253","ORD1252"].map((id,i)=><div className="cart-item" key={id}><Laptop/><div><h3>{id}</h3><p>{["Confirmed","Processing","Delivered"][i]} · KPHB Store</p></div><b>{rupee([32999,28999,39999][i])}</b></div>)}</div></section>;
}

function StoresPage({ stores }:{ stores:Store[] }) {
  return <section className="page-panel"><Title title="STORE LOCATOR" link="Hyderabad & Andhra Pradesh" /><div className="store-grid">{stores.map(s => <StoreCard key={s.id} store={s}/>)}</div><div className="map">Hyderabad Store Map · Ameerpet · KPHB · Dilsukhnagar · Guntur</div></section>;
}

function Contact({ products }:{ products:Product[] }) {
  const [msg, setMsg] = useState("");
  const submit = async () => {
    await fetch(`${API}/enquiries`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:"Website Customer", phone:"9100012345", productId:products[0]?.id, message:"I want to know more about this product" }) });
    setMsg("Enquiry submitted. Our team will follow up.");
  };
  return <section className="login-layout"><div className="login-card"><h2>Contact VR Technologies</h2><p>WhatsApp: 91000 12345</p><p>Email: support@vrtechnologies.in</p><button onClick={submit}>Submit Product Enquiry</button><a className="whatsapp" href="https://wa.me/919100012345">Open WhatsApp</a><p>{msg}</p></div><div className="login-visual"><Laptop /></div></section>;
}

function Footer() {
  return <footer className="footer"><div><h2><span>VR</span> TECHNOLOGIES</h2><p>Refurbished. Reliable. Ready for You.</p><p>High quality refurbished laptops and desktops with warranty and support.</p></div>{["SHOP","CUSTOMER SERVICE","ABOUT US","CONTACT US"].map(h => <div key={h}><h4>{h}</h4><a>Laptops</a><a>Track Order</a><a>Returns & Refunds</a><a>Privacy Policy</a></div>)}<div className="copy">© 2024 VR Technologies. All Rights Reserved. VISA · Mastercard · UPI · COD</div></footer>;
}

createRoot(document.getElementById("root")!).render(<App />);
