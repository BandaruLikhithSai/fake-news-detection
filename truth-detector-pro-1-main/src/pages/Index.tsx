// Main detection page - Fake News Detection System
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Scan, History, Globe, Newspaper } from "lucide-react";
import { toast } from "sonner";
import AnalysisResult from "@/components/AnalysisResult";
import ScanningAnimation from "@/components/ScanningAnimation";
import HistoryPanel from "@/components/HistoryPanel";
import SourcesPanel from "@/components/SourcesPanel";

type Tab = "detect" | "history" | "sources";

interface Result {
  prediction: "REAL" | "FAKE";
  confidence: number;
  probability_score: number;
  reasoning: string;
  source_name?: string | null;
}

const Index = () => {
  const [text, setText] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("detect");

  // Handle form submission - sends text to edge function for analysis
  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error("Please enter a news article or headline to analyze.");
      return;
    }
    if (text.trim().length < 10) {
      toast.error("Please enter at least 10 characters for meaningful analysis.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-news", {
        body: { text: text.trim(), source_name: sourceName.trim() || null },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data as Result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tabs = [
    { id: "detect" as Tab, label: "Detect", icon: Scan },
    { id: "history" as Tab, label: "History", icon: History },
    { id: "sources" as Tab, label: "Sources", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ background: "var(--gradient-hero)" }}>
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10" style={{ boxShadow: "var(--glow-primary)" }}>
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold tracking-tight text-foreground">
              Fake News Detector
            </h1>
            <p className="text-xs text-muted-foreground">AI-powered credibility analysis</p>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto flex px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto max-w-2xl px-4 py-8">
        {activeTab === "detect" && (
          <div className="space-y-6">
            {/* Input area */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-6" style={{ background: "var(--gradient-card)" }}>
              <div>
                <label className="text-sm font-medium text-foreground">
                  News Article or Headline
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your news article or headline here for credibility analysis..."
                  className="mt-2 min-h-[160px] w-full resize-y rounded-lg border border-border bg-background/50 p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isAnalyzing}
                />
              </div>

              {/* Optional source name */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Source Name <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g., CNN, BBC, Unknown Blog..."
                  className="mt-2 w-full rounded-lg border border-border bg-background/50 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isAnalyzing}
                />
              </div>

              {/* Analyze button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-heading text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ boxShadow: "var(--glow-primary)" }}
              >
                <Scan className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze Article"}
              </button>
            </div>

            {/* Loading animation */}
            {isAnalyzing && <ScanningAnimation />}

            {/* Result display */}
            {result && !isAnalyzing && (
              <AnalysisResult
                prediction={result.prediction}
                confidence={result.confidence}
                probabilityScore={result.probability_score}
                reasoning={result.reasoning}
                sourceName={result.source_name}
              />
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="rounded-xl border border-border bg-card p-6" style={{ background: "var(--gradient-card)" }}>
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">Analysis History</h2>
            <HistoryPanel />
          </div>
        )}

        {activeTab === "sources" && (
          <div className="rounded-xl border border-border bg-card p-6" style={{ background: "var(--gradient-card)" }}>
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">Source Reliability</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Sources with less than 50% reliability are marked as unreliable.
            </p>
            <SourcesPanel />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
