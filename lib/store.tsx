"use client";

// Global app state, saved to localStorage so a page refresh keeps your data.
// Usage in any client component:
//   const { profile, setProfile } = useStore();

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type {
  AnalysisResult,
  Evaluation,
  InterviewReport,
  Roadmap,
  UserProfile,
} from "./types";

interface StoreData {
  profile: UserProfile | null;
  analysis: AnalysisResult | null;
  roadmap: Roadmap | null;
  evaluations: Record<string, Evaluation>; // key = project id
  interviewReport: InterviewReport | null;
}

interface Store extends StoreData {
  loaded: boolean; // false until localStorage has been read
  setProfile: (p: UserProfile | null) => void;
  setAnalysis: (a: AnalysisResult | null) => void;
  setRoadmap: (r: Roadmap | null) => void;
  setEvaluation: (projectId: string, e: Evaluation) => void;
  setInterviewReport: (r: InterviewReport | null) => void;
  reset: () => void;
}

const STORAGE_KEY = "skillgap-ai";

const emptyData: StoreData = {
  profile: null,
  analysis: null,
  roadmap: null,
  evaluations: {},
  interviewReport: null,
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(emptyData);
  const [loaded, setLoaded] = useState(false);

  // Load once when the app starts
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData({ ...emptyData, ...JSON.parse(saved) });
    } catch {
      // ignore broken/unavailable storage
    }
    setLoaded(true);
  }, []);

  // Save whenever data changes
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data, loaded]);

  const store: Store = {
    ...data,
    loaded,
    setProfile: (profile) => setData((d) => ({ ...d, profile })),
    setAnalysis: (analysis) => setData((d) => ({ ...d, analysis })),
    setRoadmap: (roadmap) => setData((d) => ({ ...d, roadmap })),
    setEvaluation: (projectId, e) =>
      setData((d) => ({ ...d, evaluations: { ...d.evaluations, [projectId]: e } })),
    setInterviewReport: (interviewReport) => setData((d) => ({ ...d, interviewReport })),
    reset: () => setData(emptyData),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}
