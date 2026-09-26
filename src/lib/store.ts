"use client";
import { create } from "zustand";
import { DEFAULT_MODEL, type Size, type Species } from "@/config/pricing";

export type StoryStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error";
export type Mode = "full" | "lite" | "static";

type State = {
  species: Species;
  size: Size;
  setSpecies: (s: Species) => void;
  setSize: (s: Size) => void;

  story: StoryStatus;
  caption: string | null;
  progress: number;

  /** Режим отрисовки: полная 3D-сцена, упрощённая или статичные кадры. */
  mode: Mode | null;
  reducedMotion: boolean;
  mobile: boolean;
};

export const useStore = create<State>((set) => ({
  species: DEFAULT_MODEL.species,
  size: DEFAULT_MODEL.size,
  setSpecies: (species) => set({ species }),
  setSize: (size) => set({ size }),

  story: "idle",
  caption: null,
  progress: 0,

  mode: null,
  reducedMotion: false,
  mobile: false,
}));
