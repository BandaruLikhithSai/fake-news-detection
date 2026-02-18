// ScanningAnimation - loading state while analyzing article
const ScanningAnimation = () => {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      {/* Scanning icon */}
      <div className="relative h-24 w-24">
        {/* Outer ring */}
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary" style={{ animationDuration: '2s' }} />
        {/* Inner ring */}
        <div className="absolute inset-3 animate-spin rounded-full border-2 border-primary/10 border-b-primary/60" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 animate-scan-pulse rounded-full bg-primary" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="font-heading text-lg font-semibold text-foreground">
          Analyzing Article
        </p>
        <p className="mt-1 text-sm text-muted-foreground animate-scan-pulse">
          Running NLP analysis and credibility checks...
        </p>
      </div>

      {/* Fake progress steps */}
      <div className="w-full max-w-xs space-y-2">
        {["Preprocessing text", "TF-IDF vectorization", "Running classifier", "Computing confidence"].map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-up"
            style={{ animationDelay: `${i * 0.4}s`, opacity: 0 }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-scan-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScanningAnimation;
