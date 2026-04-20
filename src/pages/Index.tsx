import SuggestProductForm from "@/components/SuggestProductForm";

const Index = () => {
  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Can't find what you're looking for?
          </h1>
          <p className="text-sm text-muted-foreground">
            Tell us what you'd like us to stock and we'll try to source it for you.
          </p>
        </header>

        <SuggestProductForm />
      </div>
    </main>
  );
};

export default Index;
