import { useState } from "react";
import SuggestProductBanner from "@/components/SuggestProductBanner";
import SuggestProductForm from "@/components/SuggestProductForm";
import { ShoppingBag, Search, Heart, User, ChevronRight } from "lucide-react";

const categories = [
  { name: "Electronics", count: 234 },
  { name: "Home & Living", count: 189 },
  { name: "Fashion", count: 312 },
  { name: "Beauty", count: 156 },
  { name: "Sports", count: 98 },
  { name: "Books", count: 445 },
];

const Index = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Suggest Product Banner - sticky at top */}
      <SuggestProductBanner onClick={() => setFormOpen(true)} />

      {/* Nav */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            STORE<span className="text-primary">.</span>
          </h1>
          <div className="hidden md:flex items-center gap-1 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search products..."
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Heart className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
            <User className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
            <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
          Shop with confidence
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
          Discover What You<br />
          <span className="text-primary">Actually Need</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Browse our curated categories or suggest a product we should carry.
          Your input shapes what we stock next.
        </p>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="group bg-card border border-border rounded-xl p-6 flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{cat.count} products</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* Form Modal */}
      <SuggestProductForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
};

export default Index;
