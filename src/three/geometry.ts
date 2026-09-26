import * as THREE from "three";

/**
 * Размеры рамки 10″ в единицах сцены (1 = 10 см).
 * Экран 4:3, бортик ≈15 мм, клин: снизу толще, сверху тоньше.
 */
export const DIMS = {
  W: 2.33,
  H: 1.82,
  radius: 0.17,
  bevel: 0.035,
  depthBottom: 0.38,
  depthTop: 0.15,
  screenW: 2.03,
  screenH: 1.52,
  screenR: 0.03,
  /** наклон назад, рад */
  tilt: 0.1,
};

export type Dims = typeof DIMS;

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/**
 * Корпус: скруглённый бокс, у которого задняя грань наклонена (клин).
 * Координаты: x ∈ [−W/2, W/2], y ∈ [0, H], лицевая сторона смотрит в +z (z = bevel).
 */
export function createBodyGeometry(d: Dims = DIMS) {
  const b = d.bevel;
  const shape = roundedRect(d.W - 2 * b, d.H - 2 * b, d.radius - b);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 1,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 6,
    curveSegments: 20,
    steps: 1,
  });

  const pos = g.attributes.position as THREE.BufferAttribute;
  const nor = g.attributes.normal as THREE.BufferAttribute;
  const slope = (d.depthTop - d.depthBottom) / d.H; // dL/dy
  const n = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) + d.H / 2;
    let z = pos.getZ(i) - 1; // лицевая крышка оказывается в z = +b
    const L = d.depthBottom - 2 * b + slope * y; // толщина средней части
    n.fromBufferAttribute(nor, i);

    if (z < 0 && z >= -1 - 1e-6) {
      // средняя часть: z' = z·L(y); нормаль — через обратную транспонированную матрицу Якоби
      const zz = z;
      z = zz * L;
      n.set(n.x, n.y - (n.z * zz * slope) / L, n.z / L);
    } else if (z < -1) {
      // задняя фаска сохраняет свою толщину
      z = z + 1 - L;
      n.set(n.x, n.y + slope * n.z, n.z);
    }
    n.normalize();
    pos.setXYZ(i, pos.getX(i), y, z);
    nor.setXYZ(i, n.x, n.y, n.z);
  }
  pos.needsUpdate = true;
  nor.needsUpdate = true;
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

/** Экран: скруглённый прямоугольник 4:3 с UV 0…1, центр в (0, H/2). */
export function createScreenGeometry(d: Dims = DIMS) {
  const g = new THREE.ShapeGeometry(roundedRect(d.screenW, d.screenH, d.screenR), 12);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / d.screenW + 0.5, pos.getY(i) / d.screenH + 0.5);
    pos.setY(i, pos.getY(i) + d.H / 2);
  }
  return g;
}

/** Ваза для масштаба: профиль вращения. */
export function createVaseGeometry() {
  const pts = [
    [0.0, 0],
    [0.34, 0],
    [0.4, 0.05],
    [0.52, 0.45],
    [0.56, 0.9],
    [0.5, 1.35],
    [0.34, 1.75],
    [0.24, 2.05],
    [0.23, 2.3],
    [0.27, 2.45],
    [0.25, 2.48],
    [0.2, 2.35],
    [0.19, 2.1],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 64);
}
