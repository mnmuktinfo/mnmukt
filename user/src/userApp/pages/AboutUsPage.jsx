import { useState, useRef, useEffect, useCallback } from "react";

/* ─── GLOBAL STYLES ────────────────────────────────────────────────────────── */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #0a0805;
  --surface: #131008;
  --card:    #1a1510;
  --card2:   #221c14;
  --border:  rgba(255,200,100,0.08);
  --gold:    #d4963a;
  --gold2:   #f0c060;
  --cream:   #f5ead8;
  --muted:   #7a6d58;
  --red:     #e05252;
  --green:   #4caf7d;
}

body {
  background: var(--bg);
  color: var(--cream);
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  overscroll-behavior: none;
}

::-webkit-scrollbar { width: 0; height: 0; }

@keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideUp  { from { transform:translateY(100%); }            to { transform:translateY(0); } }
@keyframes popIn    { 0%{transform:scale(0) rotate(-10deg);} 65%{transform:scale(1.12) rotate(2deg);} 100%{transform:scale(1) rotate(0);} }
@keyframes shimmer  { 0%{background-position:-400% 0;} 100%{background-position:400% 0;} }

.fade-up  { animation: fadeUp  0.45s cubic-bezier(.22,1,.36,1) both; }
.slide-up { animation: slideUp 0.42s cubic-bezier(.32,1.25,.45,1) both; }
.pop-in   { animation: popIn   0.5s  cubic-bezier(.34,1.56,.64,1) both; }

.d1{animation-delay:.05s} .d2{animation-delay:.10s} .d3{animation-delay:.15s}
.d4{animation-delay:.20s} .d5{animation-delay:.25s} .d6{animation-delay:.30s}

.item-card {
  transition: transform .25s ease, box-shadow .25s ease;
  will-change: transform;
}
.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 48px rgba(0,0,0,.55), 0 0 0 1px rgba(212,150,58,0.15);
}

.press { transition: transform .12s ease; }
.press:active { transform: scale(.94); }

.img-skeleton {
  background: linear-gradient(90deg, var(--card) 25%, var(--card2) 50%, var(--card) 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
`;

/* ─── MENU DATA ─────────────────────────────────────────────────────────────── */
const CATS = [
  { id: "all", icon: "✦", label: "All" },
  { id: "starters", icon: "🥗", label: "Starters" },
  { id: "mains", icon: "🍛", label: "Mains" },
  { id: "pizza", icon: "🍕", label: "Pizza" },
  { id: "burgers", icon: "🍔", label: "Burgers" },
  { id: "drinks", icon: "🥤", label: "Drinks" },
  { id: "desserts", icon: "🍮", label: "Desserts" },
];

const MENU = [
  {
    id: 1,
    cat: "starters",
    name: "Paneer Tikka",
    desc: "Smoky tandoor-grilled paneer in spiced yoghurt marinade",
    price: 219,
    veg: true,
    hot: true,
    popular: true,
    img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80",
  },
  {
    id: 2,
    cat: "starters",
    name: "Veg Spring Rolls",
    desc: "Crispy golden rolls with seasoned veggies & glass noodles",
    price: 129,
    veg: true,
    hot: false,
    popular: false,
    img: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80",
  },
  {
    id: 3,
    cat: "starters",
    name: "Chicken Wings",
    desc: "Crispy wings tossed in signature buffalo hot sauce",
    price: 279,
    veg: false,
    hot: true,
    popular: true,
    img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80",
  },
  {
    id: 4,
    cat: "starters",
    name: "Loaded Nachos",
    desc: "Tortilla chips, jalapeños, cheese sauce & fresh salsa",
    price: 179,
    veg: true,
    hot: false,
    popular: false,
    img: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80",
  },
  {
    id: 5,
    cat: "mains",
    name: "Butter Chicken",
    desc: "Tender chicken in silky tomato-cream sauce, best with naan",
    price: 319,
    veg: false,
    hot: false,
    popular: true,
    img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80",
  },
  {
    id: 6,
    cat: "mains",
    name: "Dal Makhani",
    desc: "Slow-cooked black lentils in rich buttery tomato gravy",
    price: 229,
    veg: true,
    hot: false,
    popular: true,
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
  },
  {
    id: 7,
    cat: "mains",
    name: "Pasta Alfredo",
    desc: "Penne in creamy white sauce with herbs & parmesan",
    price: 199,
    veg: true,
    hot: false,
    popular: false,
    img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80",
  },
  {
    id: 8,
    cat: "mains",
    name: "Mutton Rogan Josh",
    desc: "Kashmiri slow-braised mutton in aromatic whole spices",
    price: 399,
    veg: false,
    hot: true,
    popular: false,
    img: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&q=80",
  },
  {
    id: 9,
    cat: "pizza",
    name: "Margherita",
    desc: "Classic tomato base, fresh mozzarella & fragrant basil",
    price: 249,
    veg: true,
    hot: false,
    popular: true,
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80",
  },
  {
    id: 10,
    cat: "pizza",
    name: "BBQ Chicken Pizza",
    desc: "Smoky BBQ, grilled chicken, onions & bell peppers",
    price: 329,
    veg: false,
    hot: false,
    popular: true,
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  },
  {
    id: 11,
    cat: "pizza",
    name: "Farmhouse",
    desc: "Mushrooms, capsicum, corn, olives & extra cheese",
    price: 289,
    veg: true,
    hot: false,
    popular: false,
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
  },
  {
    id: 12,
    cat: "pizza",
    name: "Pepperoni Blast",
    desc: "Double pepperoni, extra cheese, spicy tomato sauce",
    price: 359,
    veg: false,
    hot: true,
    popular: false,
    img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80",
  },
  {
    id: 13,
    cat: "burgers",
    name: "Classic Chicken",
    desc: "Juicy chicken fillet, coleslaw, pickles & smoky mayo",
    price: 199,
    veg: false,
    hot: false,
    popular: true,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    id: 14,
    cat: "burgers",
    name: "Veg Burger",
    desc: "Crispy veggie patty, lettuce, tomato & thousand island",
    price: 149,
    veg: true,
    hot: false,
    popular: false,
    img: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=400&q=80",
  },
  {
    id: 15,
    cat: "burgers",
    name: "Paneer Melt",
    desc: "Grilled paneer, caramelised onions & sriracha cheese",
    price: 179,
    veg: true,
    hot: true,
    popular: false,
    img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80",
  },
  {
    id: 16,
    cat: "burgers",
    name: "French Fries",
    desc: "Golden crispy fries with our secret seasoning blend",
    price: 99,
    veg: true,
    hot: false,
    popular: true,
    img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
  },
  {
    id: 17,
    cat: "drinks",
    name: "Cold Coffee",
    desc: "Rich espresso blended with milk & vanilla ice cream",
    price: 129,
    veg: true,
    hot: false,
    popular: true,
    img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80",
  },
  {
    id: 18,
    cat: "drinks",
    name: "Mango Lassi",
    desc: "Thick yoghurt blended with fresh Alphonso mango",
    price: 109,
    veg: true,
    hot: false,
    popular: false,
    img: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80",
  },
  {
    id: 19,
    cat: "drinks",
    name: "Virgin Mojito",
    desc: "Mint, lime, sugar & sparkling water over crushed ice",
    price: 139,
    veg: true,
    hot: false,
    popular: true,
    img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80",
  },
  {
    id: 20,
    cat: "drinks",
    name: "Fresh Lime Soda",
    desc: "Zesty lime with soda, sweet or salty to your taste",
    price: 79,
    veg: true,
    hot: false,
    popular: false,
    img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80",
  },
  {
    id: 21,
    cat: "desserts",
    name: "Choc Lava Cake",
    desc: "Warm dark-chocolate cake with a molten gooey centre",
    price: 179,
    veg: true,
    hot: false,
    popular: true,
    img: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80",
  },
  {
    id: 22,
    cat: "desserts",
    name: "Gulab Jamun",
    desc: "Soft milk-solid dumplings in rose-cardamom syrup · 2 pcs",
    price: 99,
    veg: true,
    hot: false,
    popular: true,
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
  },
  {
    id: 23,
    cat: "desserts",
    name: "Kulfi Falooda",
    desc: "Traditional kulfi with vermicelli, basil seeds & rose syrup",
    price: 149,
    veg: true,
    hot: false,
    popular: false,
    img: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80",
  },
  {
    id: 24,
    cat: "desserts",
    name: "Cheesecake Slice",
    desc: "NY-style baked cheesecake with blueberry compote",
    price: 199,
    veg: true,
    hot: false,
    popular: false,
    img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80",
  },
];

/* ─── ATOMS ─────────────────────────────────────────────────────────────────── */
function VegBadge({ veg }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        borderRadius: 3,
        flexShrink: 0,
        border: `1.5px solid ${veg ? "#4caf7d" : "#e05252"}`,
      }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: veg ? "#4caf7d" : "#e05252",
        }}
      />
    </span>
  );
}

function QtyBtn({ qty, onDec, onInc, mini }) {
  const s = mini ? 28 : 32;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(212,150,58,.12)",
        border: "1px solid rgba(212,150,58,.25)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
      {["−", "＋"]
        .map((sym, i) => (
          <button
            key={sym}
            className="press"
            onClick={i === 0 ? onDec : onInc}
            style={{
              width: s,
              height: s,
              background: "none",
              border: "none",
              color: "#f0c060",
              fontSize: i === 0 ? 20 : 18,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}>
            {sym}
          </button>
        ))
        .reduce(
          (acc, el, i) => [
            ...acc,
            el,
            i === 0 && (
              <span
                key="n"
                style={{
                  minWidth: 24,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--cream)",
                }}>
                {qty}
              </span>
            ),
          ],
          [],
        )}
    </div>
  );
}

function LazyImg({ src, alt, style }) {
  const [ok, setOk] = useState(false);
  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }}>
      {!ok && (
        <div
          className="img-skeleton"
          style={{ position: "absolute", inset: 0 }}
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setOk(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: ok ? 1 : 0,
          transition: "opacity .4s ease",
        }}
      />
    </div>
  );
}

/* ─── FEATURED BANNER ───────────────────────────────────────────────────────── */
function FeaturedBanner({ item, qty, onAdd, onInc, onDec }) {
  return (
    <div
      style={{
        marginBottom: 24,
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
        height: 210,
        border: "1px solid rgba(212,150,58,.12)",
      }}>
      <LazyImg src={item.img} alt={item.name} style={{ height: 210 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg,rgba(10,8,5,.93) 38%,rgba(10,8,5,.25) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "22px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
        <div>
          <span
            style={{
              background: "linear-gradient(135deg,#d4963a,#f0c060)",
              color: "#0a0805",
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
            ⭐ Chef's Special
          </span>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              marginTop: 8,
              lineHeight: 1.15,
            }}>
            {item.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(245,234,216,.5)",
              marginTop: 4,
            }}>
            {item.desc}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 26,
              fontWeight: 700,
              color: "#f0c060",
            }}>
            ₹{item.price}
          </span>
          {qty === 0 ? (
            <button
              className="press"
              onClick={onAdd}
              style={{
                background: "linear-gradient(135deg,#d4963a,#f0c060)",
                border: "none",
                borderRadius: 12,
                color: "#0a0805",
                fontSize: 13,
                fontWeight: 700,
                padding: "9px 20px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(212,150,58,.45)",
              }}>
              Add to Cart
            </button>
          ) : (
            <QtyBtn qty={qty} onDec={onDec} onInc={onInc} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── MENU CARD ─────────────────────────────────────────────────────────────── */
function MenuCard({ item, qty, onAdd, onInc, onDec, delay }) {
  return (
    <div
      className={`item-card fade-up d${delay}`}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
      {/* image */}
      <div style={{ position: "relative" }}>
        <LazyImg src={item.img} alt={item.name} style={{ height: 148 }} />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: "linear-gradient(to top,var(--card),transparent)",
          }}
        />
        {/* badges */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}>
          {item.popular && (
            <span
              style={{
                background: "linear-gradient(135deg,#d4963a,#f0c060)",
                color: "#0a0805",
                fontSize: 9.5,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
                letterSpacing: "0.06em",
              }}>
              ⭐ Popular
            </span>
          )}
          {item.hot && (
            <span
              style={{
                background: "rgba(224,82,82,.9)",
                color: "#fff",
                fontSize: 9.5,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
                letterSpacing: "0.06em",
              }}>
              🌶 Spicy
            </span>
          )}
        </div>
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <VegBadge veg={item.veg} />
        </div>
      </div>

      {/* body */}
      <div
        style={{
          padding: "12px 13px 14px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: 3,
        }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontWeight: 700,
            fontSize: 16,
            color: "var(--cream)",
            lineHeight: 1.25,
          }}>
          {item.name}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--muted)",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
          {item.desc}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 10,
          }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#f0c060",
            }}>
            <span style={{ fontSize: 12, opacity: 0.65 }}>₹</span>
            {item.price}
          </span>
          {qty === 0 ? (
            <button
              className="press"
              onClick={onAdd}
              style={{
                background: "linear-gradient(135deg,#d4963a,#f0c060)",
                border: "none",
                borderRadius: 10,
                color: "#0a0805",
                fontSize: 12,
                fontWeight: 700,
                padding: "7px 14px",
                cursor: "pointer",
                letterSpacing: "0.05em",
                boxShadow: "0 4px 14px rgba(212,150,58,.35)",
              }}>
              ADD +
            </button>
          ) : (
            <QtyBtn qty={qty} onDec={onDec} onInc={onInc} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── CART DRAWER ───────────────────────────────────────────────────────────── */
function CartDrawer({ cart, onClose, onInc, onDec, onPlace }) {
  const items = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => ({ item: MENU.find((m) => m.id === +id), qty }));
  const sub = items.reduce((s, { item, qty }) => s + item.price * qty, 0);
  const gst = Math.round(sub * 0.05);
  const total = sub + gst;
  const count = items.reduce((s, { qty }) => s + qty, 0);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.65)",
          backdropFilter: "blur(5px)",
          zIndex: 40,
          animation: "fadeUp .25s ease both",
        }}
      />
      <div
        className="slide-up"
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: "var(--card)",
          borderRadius: "24px 24px 0 0",
          zIndex: 50,
          maxHeight: "85dvh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--border)",
          borderBottom: "none",
          boxShadow: "0 -20px 60px rgba(0,0,0,.75)",
        }}>
        {/* handle */}
        <div
          style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 4,
              background: "rgba(255,255,255,.1)",
            }}
          />
        </div>
        {/* head */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
          }}>
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--cream)",
              }}>
              Your Order
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>
              {count} item{count !== 1 ? "s" : ""} · Table 05
            </div>
          </div>
          <button
            className="press"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.06)",
              border: "none",
              width: 34,
              height: 34,
              borderRadius: 10,
              color: "var(--muted)",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            ✕
          </button>
        </div>
        {/* items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
          {items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "var(--muted)",
              }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
              <div>Your cart is empty</div>
            </div>
          ) : (
            items.map(({ item, qty }) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}>
                  <LazyImg
                    src={item.img}
                    alt={item.name}
                    style={{ width: 52, height: 52 }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--cream)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#f0c060",
                      marginTop: 2,
                      fontWeight: 700,
                    }}>
                    ₹{item.price * qty}
                  </div>
                </div>
                <QtyBtn
                  qty={qty}
                  onDec={() => onDec(item.id)}
                  onInc={() => onInc(item.id)}
                  mini
                />
              </div>
            ))
          )}
        </div>
        {/* bill */}
        {items.length > 0 && (
          <div
            style={{
              padding: "16px 20px 28px",
              borderTop: "1px solid var(--border)",
            }}>
            {[
              ["Subtotal", `₹${sub}`],
              ["GST (5%)", `₹${gst}`],
            ].map(([l, v]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "var(--muted)",
                  marginBottom: 6,
                }}>
                <span>{l}</span>
                <span>{v}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 17,
                fontWeight: 700,
                color: "var(--cream)",
                borderTop: "1px dashed rgba(255,255,255,.08)",
                paddingTop: 10,
                marginTop: 4,
                marginBottom: 16,
              }}>
              <span>Total</span>
              <span style={{ color: "#f0c060" }}>₹{total}</span>
            </div>
            <button
              className="press"
              onClick={onPlace}
              style={{
                width: "100%",
                padding: "16px 0",
                background: "linear-gradient(135deg,#d4963a,#f0c060)",
                border: "none",
                borderRadius: 16,
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 19,
                fontWeight: 700,
                color: "#0a0805",
                cursor: "pointer",
                letterSpacing: "0.04em",
                boxShadow: "0 8px 32px rgba(212,150,58,.45)",
              }}>
              Place Order →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── SUCCESS MODAL ─────────────────────────────────────────────────────────── */
function SuccessModal({ onClose }) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.8)",
          backdropFilter: "blur(8px)",
          zIndex: 60,
          animation: "fadeUp .25s ease both",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}>
        <div
          className="pop-in"
          style={{
            background: "var(--card)",
            border: "1px solid rgba(212,150,58,.2)",
            borderRadius: 28,
            padding: "40px 32px",
            textAlign: "center",
            maxWidth: 340,
            width: "100%",
            boxShadow:
              "0 32px 80px rgba(0,0,0,.85), 0 0 0 1px rgba(212,150,58,.1)",
          }}>
          <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 20 }}>
            🎉
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 30,
              fontWeight: 700,
              color: "var(--cream)",
              marginBottom: 8,
            }}>
            Order Placed!
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--muted)",
              lineHeight: 1.6,
              marginBottom: 24,
            }}>
            Your food will arrive shortly.
            <br />
            Sit back, relax & enjoy 🍽
          </div>
          <div
            style={{
              background: "rgba(212,150,58,.08)",
              border: "1px solid rgba(212,150,58,.2)",
              borderRadius: 16,
              padding: "16px 24px",
              marginBottom: 28,
            }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 42,
                fontWeight: 700,
                color: "#f0c060",
                lineHeight: 1,
              }}>
              25–30
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                marginTop: 4,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
              minutes estimated
            </div>
          </div>
          <button
            className="press"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "14px 0",
              background: "linear-gradient(135deg,#d4963a,#f0c060)",
              border: "none",
              borderRadius: 14,
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#0a0805",
              cursor: "pointer",
              boxShadow: "0 6px 24px rgba(212,150,58,.4)",
            }}>
            Done
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── ROOT APP ──────────────────────────────────────────────────────────────── */
export default function App() {
  const [cat, setCat] = useState("all");
  const [cart, setCart] = useState({});
  const [drawer, setDrawer] = useState(false);
  const [success, setSuccess] = useState(false);
  const catRef = useRef(null);

  const filtered = cat === "all" ? MENU : MENU.filter((m) => m.cat === cat);
  const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmt = Object.entries(cart).reduce((s, [id, qty]) => {
    const m = MENU.find((x) => x.id === +id);
    return s + (m ? m.price * qty : 0);
  }, 0);

  const setQty = useCallback((id, qty) => {
    setCart((p) => {
      const n = { ...p, [id]: Math.max(0, qty) };
      if (!n[id]) delete n[id];
      return n;
    });
  }, []);

  useEffect(() => {
    catRef.current
      ?.querySelector(`[data-cat="${cat}"]`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  }, [cat]);

  const featuredItem = MENU[4]; // Butter Chicken

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}>
      <style>{G}</style>

      {/* ── HEADER ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(10,8,5,.88)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--border)",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "linear-gradient(135deg,#d4963a,#f0c060)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                boxShadow: "0 4px 16px rgba(212,150,58,.4)",
              }}>
              🍴
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 21,
                  fontWeight: 700,
                  color: "var(--cream)",
                  lineHeight: 1,
                }}>
                The Spice Route
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginTop: 3,
                }}>
                Scan · Order · Enjoy
              </div>
            </div>
          </div>
          <div
            style={{
              background: "rgba(212,150,58,.1)",
              border: "1px solid rgba(212,150,58,.25)",
              borderRadius: 12,
              padding: "6px 14px",
              textAlign: "center",
            }}>
            <div
              style={{
                fontSize: 9,
                color: "var(--muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}>
              Table
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#f0c060",
                lineHeight: 1.1,
              }}>
              05
            </div>
          </div>
        </div>

        {/* category tabs */}
        <div
          ref={catRef}
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            padding: "0 20px 14px",
            scrollbarWidth: "none",
          }}>
          {CATS.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                data-cat={c.id}
                className="press"
                onClick={() => setCat(c.id)}
                style={{
                  whiteSpace: "nowrap",
                  padding: "8px 16px",
                  borderRadius: 50,
                  border: `1px solid ${active ? "transparent" : "var(--border)"}`,
                  background: active
                    ? "linear-gradient(135deg,#d4963a,#f0c060)"
                    : "rgba(255,255,255,.04)",
                  color: active ? "#0a0805" : "var(--muted)",
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  transition: "all .2s ease",
                  boxShadow: active
                    ? "0 4px 16px rgba(212,150,58,.35)"
                    : "none",
                }}>
                {c.icon} {c.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── BODY ── */}
      <main style={{ padding: "20px 16px 120px" }}>
        {/* featured banner */}
        {cat === "all" && (
          <FeaturedBanner
            item={featuredItem}
            qty={cart[featuredItem.id] || 0}
            onAdd={() => setQty(featuredItem.id, 1)}
            onInc={() =>
              setQty(featuredItem.id, (cart[featuredItem.id] || 0) + 1)
            }
            onDec={() =>
              setQty(featuredItem.id, (cart[featuredItem.id] || 0) - 1)
            }
          />
        )}

        {/* section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 22,
              fontStyle: "italic",
              color: "var(--gold)",
            }}>
            {CATS.find((c) => c.id === cat)?.label}
          </div>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {filtered.length} items
          </div>
        </div>

        {/* grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 14,
          }}>
          {filtered.map((item, i) => (
            <MenuCard
              key={item.id}
              item={item}
              delay={Math.min((i % 6) + 1, 6)}
              qty={cart[item.id] || 0}
              onAdd={() => setQty(item.id, 1)}
              onInc={() => setQty(item.id, (cart[item.id] || 0) + 1)}
              onDec={() => setQty(item.id, (cart[item.id] || 0) - 1)}
            />
          ))}
        </div>
      </main>

      {/* ── FLOATING CART ── */}
      {totalQty > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: 448,
            zIndex: 35,
            animation: "slideUp .4s cubic-bezier(.32,1.25,.45,1) both",
          }}>
          <button
            className="press"
            onClick={() => setDrawer(true)}
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#d4963a,#f0c060)",
              border: "none",
              borderRadius: 18,
              padding: "16px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              boxShadow:
                "0 12px 40px rgba(212,150,58,.55), 0 0 0 1px rgba(212,150,58,.3)",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  background: "rgba(10,8,5,.2)",
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#0a0805",
                }}>
                {totalQty}
              </span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0a0805",
                }}>
                View Cart
              </span>
            </div>
            <span
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#0a0805",
              }}>
              ₹{totalAmt} →
            </span>
          </button>
        </div>
      )}

      {/* drawers / modals */}
      {drawer && (
        <CartDrawer
          cart={cart}
          onClose={() => setDrawer(false)}
          onInc={(id) => setQty(id, (cart[id] || 0) + 1)}
          onDec={(id) => setQty(id, (cart[id] || 0) - 1)}
          onPlace={() => {
            setDrawer(false);
            setSuccess(true);
          }}
        />
      )}
      {success && (
        <SuccessModal
          onClose={() => {
            setSuccess(false);
            setCart({});
          }}
        />
      )}
    </div>
  );
}
