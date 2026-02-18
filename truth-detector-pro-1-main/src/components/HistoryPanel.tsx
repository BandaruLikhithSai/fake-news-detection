// HistoryPanel - displays past predictions from database
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, ShieldCheck, ShieldAlert } from "lucide-react";

const HistoryPanel = () => {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!predictions?.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No analyses yet. Try detecting some news!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {predictions.map((p) => (
        <div
          key={p.id}
          className={`flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
            p.prediction === "REAL"
              ? "border-success/20"
              : "border-destructive/20"
          }`}
        >
          {p.prediction === "REAL" ? (
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          ) : (
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {p.headline || p.article_text.substring(0, 80)}
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span
                className={`font-mono font-semibold ${
                  p.prediction === "REAL" ? "text-success" : "text-destructive"
                }`}
              >
                {p.prediction}
              </span>
              <span>{p.confidence}% confidence</span>
              {p.source_name && <span>· {p.source_name}</span>}
              <span>· {new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryPanel;
