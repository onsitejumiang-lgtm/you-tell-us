import { Lightbulb } from "lucide-react";

interface SuggestProductBannerProps {
  onClick: () => void;
}

const SuggestProductBanner = ({ onClick }: SuggestProductBannerProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-banner text-banner-foreground py-3 px-4 flex items-center justify-center gap-3 cursor-pointer transition-all hover:brightness-110 group"
    >
      <Lightbulb className="w-5 h-5 animate-pulse" />
      <span className="text-sm font-semibold tracking-wide uppercase">
        Can't find what you need? Suggest a product!
      </span>
      <span className="text-xs font-medium opacity-80 hidden sm:inline border border-banner-foreground/30 rounded-full px-3 py-0.5 group-hover:opacity-100 transition-opacity">
        Tell us →
      </span>
    </button>
  );
};

export default SuggestProductBanner;
