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
import { Upload, CheckCircle, Lightbulb } from "lucide-react";
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

    // In a real app, this would send to an API
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
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Thank you!</h3>
            <p className="text-muted-foreground text-center text-sm">
              We've added your suggestion to our hunting list. We'll do our best to source it!
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg">Suggest a Product</DialogTitle>
                  <DialogDescription className="text-xs">
                    Help us stock what you need
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="productName" className="text-sm font-medium">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="productName"
                  name="productName"
                  placeholder="e.g. Dyson Airwrap Styler"
                  required
                  maxLength={200}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="productUse" className="text-sm font-medium">
                  What would you use it for? <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="productUse"
                  name="productUse"
                  placeholder="e.g. Hair styling for everyday use"
                  required
                  maxLength={500}
                  className="resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="brand" className="text-sm font-medium">
                    Brand <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="brand"
                    name="brand"
                    placeholder="e.g. Dyson"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Expected Price <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    placeholder="e.g. $150"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Image / Video <span className="text-muted-foreground text-xs">(optional)</span>
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
                  className="w-full border-2 border-dashed border-border rounded-lg py-4 flex flex-col items-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-medium">
                    {fileName || "Click to upload a reference image or video"}
                  </span>
                </button>
              </div>

              <Button type="submit" className="w-full" size="lg">
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
