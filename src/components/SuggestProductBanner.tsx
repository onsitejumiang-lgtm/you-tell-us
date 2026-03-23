import { Lightbulb } from "lucide-react";

interface SuggestProductBannerProps {
  onClick: () => void;
}

const SuggestProductBanner = ({ onClick }: SuggestProductBannerProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-foreground py-2 px-4 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
    >
      <Lightbulb className="w-4 h-4 text-primary" />
      <span className="text-xs font-medium text-primary-foreground tracking-wide">
        Can't find what you're looking for?
      </span>
      <span className="text-xs font-bold text-primary underline underline-offset-2">
        Suggest a Product
      </span>
    </button>
  );
};

export default SuggestProductBanner;
