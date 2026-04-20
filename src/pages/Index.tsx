import { useState } from "react";
import SuggestProductBanner from "@/components/SuggestProductBanner";
import SuggestProductForm from "@/components/SuggestProductForm";

const Index = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Suggest Product Banner - drop this into any page/layout */}
      <SuggestProductBanner onClick={() => setFormOpen(true)} />


      {/* Form Modal */}
      <SuggestProductForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
};

export default Index;
