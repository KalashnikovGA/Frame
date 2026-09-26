import * as THREE from "three";

const vert = /* glsl */ `
  varying vec2 vPos;
  varying vec2 vUv;
  void main() {
    vPos = position.xy;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Тёплое пятно света на столе под рамкой. Аддитивное, без записи глубины. */
export function createPoolMaterial(color: string) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 0 },
      uHalfW: { value: 1 },
      uFront: { value: 1 },
      uBack: { value: 0.5 },
      uRipple: { value: 1 },
      uRippleAmp: { value: 0 },
    },
    vertexShader: vert,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity, uHalfW, uFront, uBack, uRipple, uRippleAmp;
      varying vec2 vPos;
      varying vec2 vUv;
      void main() {
        vec2 e = min(vUv, 1.0 - vUv);
        float fade = smoothstep(0.0, 0.22, e.x) * smoothstep(0.0, 0.22, e.y);
        float x = vPos.x;
        float z = -vPos.y; // вперёд от рамки
        float zz = z > 0.0 ? z / uFront : -z / uBack;
        float xx = max(abs(x) - uHalfW * 0.62, 0.0) / (uHalfW * 0.55);
        float d = xx * xx + zz * zz;
        float core = exp(-d * 5.0);
        float wide = exp(-d * 1.1) * 0.32;
        float edge = exp(-(zz * zz) * 60.0) * step(abs(x), uHalfW * 0.9) * 0.6;
        // волна света, расходящаяся от основания
        float rd = length(vec2(max(abs(x) - uHalfW * 0.5, 0.0), z * 1.25));
        float rr = uRipple * 2.6;
        float ring = exp(-pow((rd - rr) * 5.0, 2.0)) * (1.0 - uRipple) * uRippleAmp * smoothstep(0.0, 0.08, uRipple);
        vec3 c = uColor * ((core + wide + edge) * uIntensity + ring * 0.9) * fade;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

/** Мягкая контактная тень под основанием — дешевле настоящих теней. */
export function createShadowMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uHalfW: { value: 1 }, uHalfD: { value: 0.2 }, uOpacity: { value: 0.6 } },
    vertexShader: vert,
    fragmentShader: /* glsl */ `
      uniform float uHalfW, uHalfD, uOpacity;
      varying vec2 vPos;
      void main() {
        vec2 q = abs(vPos) - vec2(uHalfW, uHalfD);
        float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
        float a = (1.0 - smoothstep(-0.05, 0.28, d)) * 0.7 + (1.0 - smoothstep(-0.1, 1.1, d)) * 0.3;
        gl_FragColor = vec4(0.0, 0.0, 0.0, a * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
}

/** Тёплое зарево за рамкой. Аддитивное, гаснет к столу, чтобы не было линии горизонта. */
export function createHaloMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color("#3b2415") },
      uAmount: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vY = w.y;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uAmount;
      varying vec2 vUv;
      varying float vY;
      void main() {
        vec2 p = (vUv - vec2(0.5, 0.45)) * vec2(1.7, 1.0);
        float g = exp(-dot(p, p) * 7.0) * smoothstep(0.0, 1.1, vY);
        gl_FragColor = vec4(uColor * g * uAmount, 1.0);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    toneMapped: false,
  });
}
