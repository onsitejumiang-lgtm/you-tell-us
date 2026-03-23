import { useState } from "react";
import SuggestProductBanner from "@/components/SuggestProductBanner";
import SuggestProductForm from "@/components/SuggestProductForm";

const Index = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Suggest Product Banner - drop this into any page/layout */}
      <SuggestProductBanner onClick={() => setFormOpen(true)} />

      {/* Page content placeholder */}
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-muted-foreground text-sm">
          Your store content goes here. The banner above appears on every page.
        </p>
      </div>

      {/* Form Modal */}
      <SuggestProductForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
};

export default Index;
