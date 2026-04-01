import { useEffect, useState } from "react";
import type { SeasonDataRow, TrophyRow } from "../types/dashboard";
import { apiFetch } from "../lib/api";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error("Request failed");
  return res.json() as Promise<T>;
}

export type TrophyCabinetApiState = {
  loading: boolean;
  error: string | null;
  clubTrophies: TrophyRow[];
  intTrophies: TrophyRow[];
  /** Used to resolve which club you played for each season (for By season cards). */
  seasonData: SeasonDataRow[];
};

const initial: TrophyCabinetApiState = {
  loading: true,
  error: null,
  clubTrophies: [],
  intTrophies: [],
  seasonData: [],
};

export function useTrophyCabinetApi(): TrophyCabinetApiState {
  const [state, setState] = useState<TrophyCabinetApiState>(initial);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const [seasonRaw, clubRaw, intRaw] = await Promise.all([
          fetchJson<SeasonDataRow[]>("/api/season_data"),
          fetchJson<TrophyRow[]>("/api/season_trophies"),
          fetchJson<TrophyRow[]>("/api/int_trophies"),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          seasonData: Array.isArray(seasonRaw) ? seasonRaw : [],
          clubTrophies: Array.isArray(clubRaw) ? clubRaw : [],
          intTrophies: Array.isArray(intRaw) ? intRaw : [],
        });
      } catch {
        if (cancelled) return;
        setState({
          ...initial,
          loading: false,
          error: "Could not load trophy data",
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
