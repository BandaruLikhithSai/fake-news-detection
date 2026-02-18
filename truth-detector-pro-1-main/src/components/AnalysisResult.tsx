// AnalysisResult component - displays prediction result with visual feedback
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface AnalysisResultProps {
  prediction: "REAL" | "FAKE";
  confidence: number;
  probabilityScore: number;
  reasoning: string;
  sourceName?: string | null;
}

const AnalysisResult = ({ prediction, confidence, probabilityScore, reasoning, sourceName }: AnalysisResultProps) => {
  const isReal = prediction === "REAL";

  return (
    <div className="animate-fade-up space-y-6">
      {/* Main verdict */}
      <div
        className={`relative overflow-hidden rounded-xl border p-8 text-center ${
          isReal
            ? "border-success/30 bg-success/5"
            : "border-destructive/30 bg-destructive/5"
        }`}
        style={{
          boxShadow: isReal ? "var(--glow-real)" : "var(--glow-fake)",
        }}
      >
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          {isReal ? (
            <ShieldCheck className="h-16 w-16 text-success" />
          ) : (
            <ShieldAlert className="h-16 w-16 text-destructive" />
          )}
        </div>

        {/* Prediction label */}
        <h2
          className={`font-heading text-3xl font-bold tracking-tight ${
            isReal ? "text-success" : "text-destructive"
          }`}
        >
          {isReal ? "REAL NEWS" : "FAKE NEWS"}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">{reasoning}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Confidence */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Confidence
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">
            {confidence}%
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isReal ? "bg-success" : "bg-destructive"
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* Probability Score */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Probability Score
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">
            {probabilityScore.toFixed(4)}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isReal ? "bg-success" : "bg-destructive"
              }`}
              style={{ width: `${probabilityScore * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Source info */}
      {sourceName && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Source:</span>
          <span className="font-medium text-foreground">{sourceName}</span>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;
