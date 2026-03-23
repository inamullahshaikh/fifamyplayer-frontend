import { useEffect, useState } from "react";
import type { AwardRow, SeasonDataRow } from "../types/dashboard";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Request failed");
  return res.json() as Promise<T>;
}

export type AwardsPageApiState = {
  loading: boolean;
  error: string | null;
  awards: AwardRow[];
  seasonData: SeasonDataRow[];
};

const initial: AwardsPageApiState = {
  loading: true,
  error: null,
  awards: [],
  seasonData: [],
};

export function useAwardsPageApi(): AwardsPageApiState {
  const [state, setState] = useState<AwardsPageApiState>(initial);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const [awardsRaw, seasonRaw] = await Promise.all([
          fetchJson<AwardRow[]>("/api/season_awards"),
          fetchJson<SeasonDataRow[]>("/api/season_data"),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          awards: Array.isArray(awardsRaw) ? awardsRaw : [],
          seasonData: Array.isArray(seasonRaw) ? seasonRaw : [],
        });
      } catch {
        if (cancelled) return;
        setState({
          ...initial,
          loading: false,
          error: "Could not load awards data",
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
