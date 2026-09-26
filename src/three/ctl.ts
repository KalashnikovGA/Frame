import type { Species } from "@/config/pricing";

export type AnchorName = "screen" | "wedge" | "base" | "grain" | "touch";

/**
 * Состояние сцены, которым управляют секции (GSAP тянет числа, сцена читает их каждый кадр).
 * Обычный изменяемый объект: никаких перерисовок React.
 */
export type SceneCtl = {
  /** поворот рамки, рад */
  rotY: number;
  rotX: number;
  /** камера и точка, куда она смотрит */
  camX: number;
  camY: number;
  camZ: number;
  tgtX: number;
  tgtY: number;
  tgtZ: number;
  fov: number;
  /** сдвиг кадра в долях экрана (композиция без поворота камеры) */
  shiftX: number;
  shiftY: number;
  /** если экран уже этого соотношения — камера отъезжает, чтобы всё влезло */
  minAspect: number;
  /** насколько рамка следует за курсором, 0…1 */
  pointer: number;
  /** лёгкое «парение» камеры, 0…1 */
  drift: number;

  /** свет под рамкой: базовый уровень, дыхание, реакция на голос, вспышка */
  glow: number;
  breath: number;
  voice: number;
  flash: number;

  /** яркость экрана 0…1 и переход вечер → ночь 0…1 */
  screen: number;
  night: number;
  /** пульс «коснитесь, чтобы ответить» 0…1 */
  pulse: number;

  species: Species;
  scale: number;
  photo: number;
  caption: string | null;
  props: { vase: boolean; books: boolean };

  anchors: AnchorName[];
  /** экранные координаты якорей (px внутри холста), обновляются сценой */
  projected: Partial<Record<AnchorName, { x: number; y: number }>>;
  onScreenTap?: () => void;
};

export function createCtl(p: Partial<SceneCtl> = {}): SceneCtl {
  return {
    rotY: 0,
    rotX: 0,
    camX: 0,
    camY: 1.1,
    camZ: 6.2,
    tgtX: 0,
    tgtY: 0.9,
    tgtZ: 0,
    fov: 30,
    shiftX: 0,
    shiftY: 0,
    minAspect: 1,
    pointer: 0,
    drift: 0,
    glow: 0.3,
    breath: 0,
    voice: 0,
    flash: 0,
    screen: 1,
    night: 0,
    pulse: 0,
    species: "birch",
    scale: 1,
    photo: 0,
    caption: null,
    props: { vase: false, books: false },
    anchors: [],
    projected: {},
    ...p,
  };
}
