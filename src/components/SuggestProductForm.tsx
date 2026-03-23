import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle, Package } from "lucide-react";
import { toast } from "sonner";

interface SuggestProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SuggestProductForm = ({ open, onOpenChange }: SuggestProductFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productName = formData.get("productName") as string;

    if (!productName?.trim()) {
      toast.error("Please enter a product name.");
      return;
    }

    console.log("Product suggestion:", {
      productName: formData.get("productName"),
      productUse: formData.get("productUse"),
      brand: formData.get("brand"),
      price: formData.get("price"),
      file: formData.get("file"),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFileName(null);
      onOpenChange(false);
    }, 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) { setSubmitted(false); setFileName(null); } }}>
      <DialogContent className="sm:max-w-md rounded-sm p-0 overflow-hidden gap-0">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 px-6">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-success" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Thank you!</h3>
            <p className="text-muted-foreground text-center text-sm">
              Your suggestion has been added to our sourcing list. We'll do our best to make it available!
            </p>
          </div>
        ) : (
          <>
            {/* Orange header bar */}
            <div className="bg-primary px-5 py-4 flex items-center gap-3">
              <Package className="w-5 h-5 text-primary-foreground" />
              <div>
                <DialogHeader className="p-0 space-y-0">
                  <DialogTitle className="text-base font-bold text-primary-foreground">
                    Suggest a Product
                  </DialogTitle>
                  <DialogDescription className="text-xs text-primary-foreground/80">
                    Tell us what to source for you
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="productName" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="productName"
                  name="productName"
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  required
                  maxLength={200}
                  className="rounded-sm h-10 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="productUse" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  What will you use it for? <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="productUse"
                  name="productUse"
                  placeholder="e.g. Personal phone for everyday use"
                  required
                  maxLength={500}
                  className="resize-none h-16 rounded-sm text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="brand" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Brand <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                  </Label>
                  <Input
                    id="brand"
                    name="brand"
                    placeholder="e.g. Samsung"
                    maxLength={100}
                    className="rounded-sm h-10 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="price" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Price <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    placeholder="e.g. ₦150,000"
                    maxLength={50}
                    className="rounded-sm h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Image / Video <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-border rounded-sm py-3 flex flex-col items-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-xs">
                    {fileName || "Upload a reference image or video"}
                  </span>
                </button>
              </div>

              <Button type="submit" className="w-full rounded-sm font-bold uppercase tracking-wide text-sm" size="lg">
                Submit Suggestion
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SuggestProductForm;
