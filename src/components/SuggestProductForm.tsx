import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle, Package, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const schema = z.object({
  product_name: z.string().trim().min(1, "Product name is required").max(200),
  intended_use: z.string().trim().min(1, "Please tell us what you'll use it for").max(1000),
  preferred_brand: z.string().trim().max(100).optional().or(z.literal("")),
  expected_price: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount"),
});

const SuggestProductForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const resetAll = () => {
    setSubmitted(false);
    setFile(null);
    setSubmitting(false);
    formRef.current?.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      product_name: fd.get("product_name"),
      intended_use: fd.get("intended_use"),
      preferred_brand: fd.get("preferred_brand") ?? "",
      expected_price: fd.get("expected_price") ?? "",
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setSubmitting(true);
    try {
      let media_url: string | null = null;
      let media_type: "image" | "video" | null = null;

      if (file) {
        if (file.size > MAX_FILE_BYTES) {
          toast.error("File must be 10 MB or smaller");
          setSubmitting(false);
          return;
        }
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) {
          toast.error("Only image or video files are allowed");
          setSubmitting(false);
          return;
        }
        media_type = isImage ? "image" : "video";
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `suggestion-media/${crypto.randomUUID()}.${ext}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, file, { contentType: file.type });
        media_url = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "product_suggestions"), {
        user_id: auth.currentUser?.uid ?? null,
        product_name: parsed.data.product_name,
        intended_use: parsed.data.intended_use,
        preferred_brand: parsed.data.preferred_brand?.trim() || null,
        expected_price: parsed.data.expected_price ? Number(parsed.data.expected_price) : null,
        currency: "NGN",
        media_url,
        media_type,
        status: "new",
        created_at: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error("Suggestion submission failed:", err);
      toast.error(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 px-6 border rounded-sm bg-card">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-success" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Thanks!</h3>
        <p className="text-muted-foreground text-center text-sm">
          We'll try to source this for you.
        </p>
        <Button
          onClick={resetAll}
          className="mt-2 rounded-sm uppercase font-bold text-xs"
          size="sm"
        >
          Suggest another
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-sm bg-card overflow-hidden">
      <div className="bg-primary px-5 py-4 flex items-center gap-3">
        <Package className="w-5 h-5 text-primary-foreground" />
        <div>
          <h2 className="text-base font-bold text-primary-foreground leading-tight">
            Suggest a Product
          </h2>
          <p className="text-xs text-primary-foreground/80">
            Tell us what to source for you
          </p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="space-y-1">
          <Label htmlFor="product_name" className="text-xs font-semibold uppercase tracking-wide">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="product_name"
            name="product_name"
            placeholder="e.g. Samsung Galaxy S24 Ultra"
            required
            maxLength={200}
            disabled={submitting}
            className="rounded-sm h-10 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="intended_use" className="text-xs font-semibold uppercase tracking-wide">
            Intended Use <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="intended_use"
            name="intended_use"
            placeholder="e.g. Personal phone for everyday use"
            required
            maxLength={1000}
            disabled={submitting}
            className="resize-none h-20 rounded-sm text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="preferred_brand" className="text-xs font-semibold uppercase tracking-wide">
              Brand <span className="text-muted-foreground font-normal normal-case">(optional)</span>
            </Label>
            <Input
              id="preferred_brand"
              name="preferred_brand"
              placeholder="e.g. Samsung"
              maxLength={100}
              disabled={submitting}
              className="rounded-sm h-10 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="expected_price" className="text-xs font-semibold uppercase tracking-wide">
              Price ₦ <span className="text-muted-foreground font-normal normal-case">(optional)</span>
            </Label>
            <Input
              id="expected_price"
              name="expected_price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="150000"
              disabled={submitting}
              className="rounded-sm h-10 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold uppercase tracking-wide">
            Image / Video <span className="text-muted-foreground font-normal normal-case">(optional, max 10 MB)</span>
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={submitting}
            className="hidden"
          />
          {file ? (
            <div className="w-full border border-border rounded-sm py-2 px-3 flex items-center justify-between text-sm">
              <span className="truncate text-foreground">{file.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-muted-foreground hover:text-destructive ml-2"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="w-full border border-dashed border-border rounded-sm py-4 flex flex-col items-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span className="text-xs">Upload a reference image or video</span>
            </button>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full rounded-sm font-bold uppercase tracking-wide text-sm"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Suggestion"
          )}
        </Button>
      </form>
    </div>
  );
};

export default SuggestProductForm;
