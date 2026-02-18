// SourcesPanel - displays source reliability tracking
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Globe, AlertTriangle, CheckCircle } from "lucide-react";

const SourcesPanel = () => {
  const { data: sources, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .order("total_checks", { ascending: false })
        .limit(50);
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

  if (!sources?.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Globe className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No sources tracked yet. Add a source name when analyzing articles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sources.map((s) => (
        <div
          key={s.id}
          className={`flex items-center gap-3 rounded-lg border p-3 ${
            s.is_unreliable ? "border-destructive/30 bg-destructive/5" : "border-border"
          }`}
        >
          {s.is_unreliable ? (
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          ) : (
            <CheckCircle className="h-5 w-5 shrink-0 text-success" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
              {s.is_unreliable && (
                <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                  Unreliable
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{s.total_checks} checks</span>
              <span>{s.fake_count} fake</span>
              <span className="font-mono">{Number(s.reliability_score).toFixed(0)}% reliable</span>
            </div>
          </div>
          {/* Reliability bar */}
          <div className="h-8 w-8 shrink-0">
            <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className="stroke-muted"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className={s.is_unreliable ? "stroke-destructive" : "stroke-success"}
                strokeWidth="3"
                strokeDasharray={`${Number(s.reliability_score)}, 100`}
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SourcesPanel;
