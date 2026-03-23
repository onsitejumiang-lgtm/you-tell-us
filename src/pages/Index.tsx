import { useState } from "react";
import SuggestProductBanner from "@/components/SuggestProductBanner";
import SuggestProductForm from "@/components/SuggestProductForm";
import { ShoppingCart, Search, User, HelpCircle, ChevronRight, Smartphone, Home, Zap, Shirt, Heart, Monitor, Baby, Gamepad2, ShoppingBag, MoreHorizontal } from "lucide-react";

const categories = [
  { name: "Phones & Tablets", icon: Smartphone },
  { name: "Health & Beauty", icon: Heart },
  { name: "Home & Office", icon: Home },
  { name: "Electronics", icon: Monitor },
  { name: "Fashion", icon: Shirt },
  { name: "Supermarket", icon: ShoppingBag },
  { name: "Computing", icon: Monitor },
  { name: "Baby Products", icon: Baby },
  { name: "Gaming", icon: Gamepad2 },
  { name: "Other categories", icon: MoreHorizontal },
];

const flashDeals = [
  { name: "Oraimo Power Bank 20000mAh", price: "₦8,500", oldPrice: "₦15,000", discount: "-43%", items: "142 items left" },
  { name: "Hisense 32\" LED TV", price: "₦89,900", oldPrice: "₦125,000", discount: "-28%", items: "56 items left" },
  { name: "Nivea Body Lotion 400ml", price: "₦2,350", oldPrice: "₦3,500", discount: "-33%", items: "200 items left" },
  { name: "Tecno Spark 20 Pro+", price: "₦132,000", oldPrice: "₦165,000", discount: "-20%", items: "89 items left" },
];

const Index = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top utility bar */}
      <div className="bg-foreground">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-1">
          <span className="text-xs text-muted-foreground">Sell on Jumia</span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>JUMIA PAY</span>
            <span>DELIVERY</span>
          </div>
        </div>
      </div>

      {/* Suggest Product Banner */}
      <SuggestProductBanner onClick={() => setFormOpen(true)} />

      {/* Main Nav */}
      <header className="bg-card shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center gap-4 px-4 py-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-extrabold text-primary tracking-tight">JUMIA</span>
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center">
            <div className="relative w-full flex">
              <input
                className="w-full h-10 pl-4 pr-4 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded-l-sm"
                placeholder="Search products, brands and categories"
              />
              <button className="bg-primary text-primary-foreground px-5 h-10 text-sm font-bold rounded-r-sm flex items-center gap-1.5 hover:brightness-110 transition-all">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

          {/* Account / Help / Cart */}
          <div className="flex items-center gap-5 text-sm text-foreground">
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">Account</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Help</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden lg:inline">Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content area */}
      <div className="max-w-[1200px] mx-auto px-4 mt-4">
        <div className="flex gap-4">
          {/* Sidebar categories */}
          <aside className="hidden md:block w-56 flex-shrink-0 bg-card rounded-sm shadow-sm">
            <ul>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <li key={cat.name}>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors group">
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="flex-1 text-left">{cat.name}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Main banner */}
          <div className="flex-1">
            {/* Hero banner */}
            <div className="bg-primary rounded-sm overflow-hidden relative h-[280px] flex items-center justify-center">
              <div className="text-center text-primary-foreground z-10">
                <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-80">
                  MAR 23 – MAR 29
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-2">
                  Brand Day Deals
                </h2>
                <p className="text-lg font-semibold opacity-90 mb-4">
                  UP TO <span className="text-2xl">50% OFF</span>
                </p>
                <button className="bg-card text-foreground font-bold text-sm px-6 py-2.5 rounded-sm hover:bg-secondary transition-colors">
                  SHOP NOW →
                </button>
              </div>
              {/* Decorative circles */}
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary-foreground/10" />
              <div className="absolute -left-5 -bottom-5 w-28 h-28 rounded-full bg-primary-foreground/5" />
            </div>

            {/* Quick links row */}
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mt-4">
              {["Awoof Deals", "Clearance", "Men's Fashion", "Buy 2 Pay 1", "Top Picks", "Flash Sales", "New Arrivals"].map((label) => (
                <div key={label} className="bg-card rounded-sm p-3 flex flex-col items-center gap-1.5 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flash Sales */}
        <section className="mt-6 mb-8">
          <div className="bg-primary rounded-t-sm px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary-foreground" />
              <span className="text-sm font-bold text-primary-foreground uppercase">Flash Sales</span>
            </div>
            <span className="text-xs text-primary-foreground font-medium">
              Time Left: <strong>05h : 23m : 41s</strong>
            </span>
            <button className="text-xs text-primary-foreground font-bold hover:underline">See All →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
            {flashDeals.map((deal) => (
              <div key={deal.name} className="bg-card p-3 flex flex-col cursor-pointer hover:shadow-md transition-shadow group">
                {/* Placeholder product image */}
                <div className="w-full aspect-square bg-secondary rounded-sm mb-2 flex items-center justify-center relative">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                  <span className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    {deal.discount}
                  </span>
                </div>
                <p className="text-xs text-foreground font-medium truncate group-hover:text-primary transition-colors">{deal.name}</p>
                <p className="text-sm font-bold text-foreground mt-1">{deal.price}</p>
                <p className="text-xs text-muted-foreground line-through">{deal.oldPrice}</p>
                {/* Stock bar */}
                <div className="mt-2 w-full bg-secondary rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: "60%" }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{deal.items}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Form Modal */}
      <SuggestProductForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
};

export default Index;
