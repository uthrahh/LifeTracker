import type { EnvironmentState, SceneProps } from "./types";
import { BeachScene } from "./scenes/BeachScene";
import { SpaceScene } from "./scenes/SpaceScene";
import { RainforestScene } from "./scenes/RainforestScene";
import { CityScene } from "./scenes/CityScene";
import { FieldsScene } from "./scenes/FieldsScene";

const SCENES: Record<EnvironmentState["scene"], React.ComponentType<SceneProps>> = {
  beach: BeachScene,
  space: SpaceScene,
  rainforest: RainforestScene,
  city: CityScene,
  fields: FieldsScene,
};

/**
 * Pure presentational dispatcher: receives fully-derived state and renders
 * the matching scene. No per-page hard-coding of time/weather logic here —
 * that all lives in useEnvironmentState.
 */
export function EnvironmentRenderer({ scene, timeOfDay, weather, reducedMotion }: EnvironmentState) {
  const Scene = SCENES[scene];
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <Scene timeOfDay={timeOfDay} weather={weather} reducedMotion={reducedMotion} />
    </div>
  );
}
