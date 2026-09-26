import type { EnvironmentScene } from "@luma/types";
import type { TimeOfDay } from "@luma/utils";

export interface WeatherState {
  /** 0-1 rain intensity; only Rainforest currently uses this. */
  rainIntensity: number;
  cloudCover: number; // 0-1
}

export interface EnvironmentState {
  scene: EnvironmentScene;
  timeOfDay: TimeOfDay;
  weather: WeatherState;
  reducedMotion: boolean;
}

export interface SceneProps {
  timeOfDay: TimeOfDay;
  weather: WeatherState;
  reducedMotion: boolean;
}
