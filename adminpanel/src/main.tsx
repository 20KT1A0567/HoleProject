import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./whatsapp.css";

const API = "http://localhost:5000/api";
const unwrap = async <T,>(response: Response): Promise<T> => {
  const json = await response.json();
  return json.data ?? json;
};
type Product = { id:string; name:string; brand:string; categoryName:string; price:number; stock:number; store:string };
type Store = { id:string; name:string; city:string; address:string; ordersCount:number; sales:number; rating:number; status:string };
type Order = { id:string; customer:string; store:string; amount:number; status:string };
type Stat = { label:string; value:string; change:string; icon:string; color:string };
type Dashboard = { stats:Stat[]; sales:number[]; products:Product[]; stores:Store[]; orders:Order[] };
type Banner = { id?:string; title:string; subtitle:string; mediaType:string; mediaUrl:string; active?:boolean };
type CampaignStatus = { campaignId:string; status:string; totalRows:number; processed:number; sent:number; failed:number; skipped:number; results:{rowNumber:number; name:string; phoneNumber:string; status:string; message:string}[] };

const rupee = (n:number) => `₹${n.toLocaleString("en-IN")}`;
const icons:Record<string,string> = { bag:"🛍", rupee:"₹", box:"◇", users:"♙", store:"▣" };

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("admin-theme") || "dark");
  const [token, setToken] = useState(localStorage.getItem("admin-token") || "");
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState<Dashboard>({ stats:[], sales:[], products:[], stores:[], orders:[] });
  const refresh = () => fetch(`${API}/dashboard`).then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => { document.body.className = theme; localStorage.setItem("admin-theme", theme); }, [theme]);
  if (!token) return <AdminLogin setToken={setToken} />;
  return <div className="shell"><Sidebar page={page} setPage={setPage}/><main className="main"><Topbar theme={theme} setTheme={setTheme}/>{page === "whatsapp" ? <WhatsAppCampaign token={token}/> : page === "banners" ? <Banners token={token}/> : page === "products" ? <Products products={data.products}/> : page === "orders" ? <Orders orders={data.orders}/> : page === "stores" ? <Stores stores={data.stores}/> : <DashboardView data={data}/>}</main></div>;
}

function AdminLogin({setToken}:{setToken:(token:string)=>void}) {
  const [identifier, setIdentifier] = useState("admin@vrtechnologies.in");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const login = async () => {
    const response = await fetch(`${API}/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ identifier, password }) });
    if (!response.ok) { setError("Invalid admin login"); return; }
    const data = await unwrap<{token:string}>(response);
    localStorage.setItem("admin-token", data.token);
    setToken(data.token);
  };
  return <section className="admin-login"><div className="login-box"><div className="brand"><span>VR</span><b>TECHNOLOGIES</b><small>ADMIN PANEL</small></div><h1>Admin Login</h1><input value={identifier} onChange={e=>setIdentifier(e.target.value)} /><input value={password} onChange={e=>setPassword(e.target.value)} type="password" /><button className="primary" onClick={login}>Login</button><p>{error}</p></div></section>;
}

function Sidebar({page,setPage}:{page:string; setPage:(p:string)=>void}) {
  const items = [["dashboard","▱","Dashboard"],["products","▤","Products"],["categories","▧","Categories"],["brands","▦","Brands"],["orders","🛒","Orders"],["customers","♙","Customers"],["stores","⌘","Stores"],["stock","⬡","Stock Management"],["inventory","▣","Inventory"],["banners","▧","Banners"],["whatsapp","☏","WhatsApp Campaigns"],["coupons","⚙","Coupons"],["reviews","✵","Reviews"],["reports","♜","Reports"],["analytics","▥","Sales & Analytics"],["users","♙","Users & Roles"],["settings","⚙","Settings"]];
  return <aside className="sidebar"><a className="brand"><span>VR</span><b>TECHNOLOGIES</b><small>ADMIN PANEL</small></a><nav>{items.map(([id,icon,label]) => <button key={id} className={page===id?"active":""} onClick={() => setPage(id)}><span>{icon}</span>{label}</button>)}</nav><section className="quick"><h4>Quick Actions</h4><button onClick={() => setPage("products")}>＋ Add New Product</button><button>＋ Add New Store</button><button onClick={() => setPage("banners")}>＋ Create Banner</button><button>＋ Add Coupon</button></section><section className="help"><h3>Need Help?</h3><p>If you need any help we are here!</p><button>Contact Support</button></section></aside>;
}

function Topbar({theme,setTheme}:{theme:string; setTheme:(t:string)=>void}) {
  return <header className="topbar"><button className="hamb">☰</button><select><option>🏬 All Stores</option></select><input className="search" placeholder="Search products, orders, customers..." /><button className="theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "☀" : "☾"}</button><button className="bell">🔔<b>8</b></button><div className="admin"><div className="avatar"/><b>Admin</b><span>Super Admin</span>⌄</div></header>;
}

function DashboardView({data}:{data:Dashboard}) {
  return <section className="content"><div className="title"><div><h1>Dashboard</h1><p>Welcome back, Admin! Here's what's happening with your store.</p></div><div className="date">17 May 2025 - 24 May 2025 📅</div></div><section className="stats">{data.stats.map(s => <div className="stat" key={s.label}><div className={`badge ${s.color}`}>{icons[s.icon]}</div><div><small>{s.label}</small><h2>{s.value}</h2><span>↑ {s.change}</span> <small>vs last week</small></div></div>)}</section><section className="dashboard-grid"><Card title="Sales Overview" action="This Week"><div className="chart line-chart"><Line sales={data.sales}/></div><p className="green-text">● Sales (₹)</p></Card><Card title="Order Overview"><div className="donut"><div><b>1,248</b><small>Total Orders</small></div></div></Card><Card title="Sales by Stores" action="This Week"><div className="chart bars">{[85,64,51,39].map((h,i)=><i key={i} style={{height:`${h}%`}}/> )}</div><div className="bar-labels"><span>Ameerpet</span><span>KPHB</span><span>Dilsukhnagar</span><span>Guntur</span></div></Card><Card title="Recent Orders"><OrdersTable orders={data.orders}/></Card><Card title="Low Stock Alert"><table><tbody>{data.products.slice(0,4).map(p => <tr key={p.id}><td><i className="mini-laptop"/> {p.name}</td><td>{p.store}</td><td className="low">{p.stock}</td></tr>)}</tbody></table></Card><Card title="Store Summary"><table><tbody>{data.stores.map(s => <tr key={s.id}><td>{s.name.split(" - ")[1]}</td><td>{s.ordersCount}</td><td>{rupee(s.sales)}</td><td><Status value={s.status}/></td></tr>)}</tbody></table></Card><Card title="Top Selling Products" wide><table><tbody>{data.products.slice(0,4).map((p,i)=><tr key={p.id}><td>{i+1}</td><td><i className="mini-laptop"/> {p.name}</td><td>{[156,132,118,88][i]}</td><td>{rupee([513442,420648,355602,237312][i])}</td><td>{p.store}</td></tr>)}</tbody></table></Card><Card title="Quick Reports"><div className="reports">{["Sales Report","Orders Report","Stock Report","Customer Report","Download Reports"].map((r,i)=><div className="report" key={r}><div className={`badge ${["green","blue","purple","orange","teal"][i]}`}>{["▥","🛍","◇","♙","↓"][i]}</div><p>{r}</p></div>)}</div></Card><Card title="Stores Overview" wide><div className="stores">{data.stores.map(s => <StoreMini key={s.id} store={s}/>)}</div></Card><Card title="Recent Activities"><p>New order #ORD1254 received <small>2 mins ago</small></p><p>Stock updated for Lenovo ThinkPad T480 <small>15 mins ago</small></p><p>New customer Rahul Kumar registered <small>1 hour ago</small></p><p>Order #ORD1253 shipped <small>2 hours ago</small></p></Card></section></section>;
}

function Card({title, action, wide=false, children}:{title:string; action?:string; wide?:boolean; children:React.ReactNode}) {
  return <div className={`card ${wide ? "wide" : ""}`}><div className="card-head"><h3>{title}</h3>{action ? <select><option>{action}</option></select> : <a>View All</a>}</div>{children}</div>;
}
function Line({sales}:{sales:number[]}) {
  const points = sales.map((v,i) => `${20+i*55},${190-v/900}`).join(" ");
  return <svg viewBox="0 0 780 220" preserveAspectRatio="none"><polyline points={points} fill="none" stroke="#7bc52f" strokeWidth="4"/><polygon points={`${points} 735,210 20,210`} fill="#7bc52f22"/>{sales.map((v,i)=><circle key={i} cx={20+i*55} cy={190-v/900} r="5" fill="#7bc52f"/>)}</svg>;
}
function Status({value}:{value:string}) { return <span className={`status ${value.toLowerCase()}`}>{value}</span>; }
function OrdersTable({orders}:{orders:Order[]}) { return <table><tbody>{orders.map(o => <tr key={o.id}><td>{o.id}</td><td>{o.customer}</td><td>{o.store}</td><td>{rupee(o.amount)}</td><td><Status value={o.status}/></td></tr>)}</tbody></table>; }
function StoreMini({store}:{store:Store}) { return <div className="store-card"><div className="store-img"/><div><b>{store.name.split(" - ")[1]}</b> <Status value={store.status}/><p>Orders <b>{store.ordersCount}</b></p><p>Sales <b>{rupee(store.sales)}</b></p><p>Rating ⭐ {store.rating}</p></div></div>; }
function Products({products}:{products:Product[]}) { return <section className="content"><div className="title"><h1>Products</h1><button className="primary">＋ Add Product</button></div><div className="card"><table><thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Store</th><th>Stock</th><th>Status</th></tr></thead><tbody>{products.map(p => <tr key={p.id}><td><i className="mini-laptop"/> {p.name}</td><td>{p.brand}</td><td>{p.categoryName}</td><td>{rupee(p.price)}</td><td>{p.store}</td><td>{p.stock}</td><td><Status value="Active"/></td></tr>)}</tbody></table></div></section>; }
function Orders({orders}:{orders:Order[]}) { return <section className="content"><div className="title"><h1>Orders</h1></div><div className="card"><OrdersTable orders={orders}/></div></section>; }
function Stores({stores}:{stores:Store[]}) { return <section className="content"><div className="title"><h1>Stores</h1><button className="primary">＋ Add Store</button></div><div className="stores">{stores.map(s => <div className="card" key={s.id}><StoreMini store={s}/><p>{s.address}</p></div>)}</div></section>; }

function Banners({token}:{token:string}) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<Banner>({ title:"UP TO 40% OFF ON REFURBISHED LAPTOPS", subtitle:"Top Brands | Tested Quality | Warranty Included", mediaType:"image", mediaUrl:"" });
  const load = () => fetch(`${API}/banners`).then(unwrap<Banner[]>).then(setBanners).catch(() => {});
  useEffect(() => {
    load();
  }, []);
  const save = async () => {
    let mediaUrl = form.mediaUrl;
    if (file) {
      const body = new FormData();
      body.append("file", file);
      mediaUrl = (await fetch(`${API}/admin/media/upload`, { method:"POST", headers:{Authorization:`Bearer ${token}`}, body }).then(unwrap<{url:string}>)).url;
    }
    await fetch(`${API}/admin/banners`, { method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body:JSON.stringify({ ...form, mediaUrl }) });
    load();
  };
  return <section className="content"><div className="title"><h1>Banners</h1><button className="primary" onClick={save}>Save Banner</button></div><section className="form-grid"><div className="card form"><h3>Create Image / Video Banner</h3><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><textarea value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})}/><select value={form.mediaType} onChange={e=>setForm({...form,mediaType:e.target.value})}><option value="image">Image Banner</option><option value="video">Video Banner</option></select><input type="file" accept="image/*,video/*" onChange={e => { const f=e.target.files?.[0] || null; setFile(f); setPreview(f ? URL.createObjectURL(f) : ""); }}/><p>Images and videos upload through Spring Boot. Local mode saves in backend/uploads; S3 mode uses AWS env settings.</p></div><div className="card"><h3>Preview</h3><div className="preview">{preview ? (file?.type.startsWith("video") ? <video src={preview} controls/> : <img src={preview}/>) : "Select image or video"}</div></div></section><div className="card banner-list">{banners.map(b => <div className="banner-item" key={b.id}><div><b>{b.title}</b><p>{b.subtitle}</p><small>{b.mediaType.toUpperCase()} · {b.mediaUrl || "Generated hero"}</small></div><Status value={b.active ? "Active" : "Inactive"}/></div>)}</div></section>;
}

function WhatsAppCampaign({token}:{token:string}) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [recipientsFile, setRecipientsFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [busy, setBusy] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  const [status, setStatus] = useState<CampaignStatus | null>(null);
  const [error, setError] = useState("");
  const previewUrl = videoFile ? URL.createObjectURL(videoFile) : videoUrl;

  const uploadVideo = async () => {
    if (!videoFile) return videoUrl;
    const body = new FormData();
    body.append("file", videoFile);
    body.append("folder", "whatsapp/promos");
    const data = await fetch(`${API}/admin/upload/video`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body
    }).then(unwrap<{url:string}>);
    setVideoUrl(data.url);
    return data.url;
  };

  const loadStatus = async (id = campaignId) => {
    if (!id) return;
    const data = await fetch(`${API}/admin/notifications/whatsapp-campaigns/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(unwrap<CampaignStatus>);
    setStatus(data);
  };

  useEffect(() => {
    if (!campaignId) return;
    const timer = window.setInterval(() => loadStatus(campaignId).catch(() => {}), 3000);
    return () => window.clearInterval(timer);
  }, [campaignId]);

  const send = async () => {
    setError("");
    if (!recipientsFile) { setError("Upload CSV/XLSX recipients file"); return; }
    if (!videoFile && !videoUrl) { setError("Upload p2.mp4 or paste video URL"); return; }
    setBusy(true);
    try {
      const uploadedVideoUrl = await uploadVideo();
      const body = new FormData();
      body.append("file", recipientsFile);
      body.append("headerMediaUrl", uploadedVideoUrl);
      body.append("activeOnly", String(activeOnly));
      const started = await fetch(`${API}/admin/notifications/whatsapp-campaigns/app-video-v1`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body
      }).then(unwrap<{campaignId:string; message:string}>);
      setCampaignId(started.campaignId);
      await loadStatus(started.campaignId);
    } catch (e:any) {
      setError(e?.message || "Campaign failed");
    } finally {
      setBusy(false);
    }
  };

  return <section className="content"><div className="title"><div><h1>WhatsApp Campaigns</h1><p>Send Meta template pg_app_video_v1 with video header</p></div><button className="primary" disabled={busy} onClick={send}>{busy ? "Sending..." : "Send Campaign"}</button></div><section className="form-grid"><div className="card form"><h3>Template Setup</h3><label>Template name</label><input value="pg_app_video_v1" readOnly/><label>Video header</label><input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)}/><input placeholder="Or paste public MP4 URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}/><label>Recipients CSV/XLSX</label><input type="file" accept=".csv,.xlsx" onChange={e => setRecipientsFile(e.target.files?.[0] || null)}/><label className="check"><input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)}/> Send only Active rows</label><p>Columns: Phone Number, Name, Var1, Active. If Var1 is empty, Name is used for Hi {"{{1}}"}.</p>{error && <p className="error">{error}</p>}</div><div className="card"><h3>WhatsApp Preview</h3><div className="wa-preview">{previewUrl ? <video src={previewUrl} controls muted/> : <div className="wa-video">Video header</div>}<div className="wa-body"><p>Hi pgname,</p><p>Discover Anusha Bazaar 🛒</p><p>Order groceries easily with fast delivery and great offers.</p><p>Tap below to install the app and start ordering today.</p><button>Visit App</button><button>Instagram</button></div></div></div></section>{status && <div className="card campaign-status"><div className="card-head"><h3>Status: {status.status}</h3><button onClick={() => loadStatus()} className="primary">Refresh</button></div><section className="stats mini-stats">{[["Processed",status.processed],["Sent",status.sent],["Failed",status.failed],["Skipped",status.skipped],["Total",status.totalRows]].map(([label,value]) => <div className="stat" key={label}><div><small>{label}</small><h2>{value}</h2></div></div>)}</section><table><tbody>{status.results?.map(r => <tr key={`${r.rowNumber}-${r.phoneNumber}`}><td>{r.rowNumber}</td><td>{r.name || r.phoneNumber}</td><td>{r.status}</td><td>{r.message}</td></tr>)}</tbody></table></div>}</section>;
}

createRoot(document.getElementById("root")!).render(<App />);
