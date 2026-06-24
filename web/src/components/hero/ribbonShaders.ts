// GLSL shaders untuk wave ribbon — deformasi noise prosedural + tampilan
// glass/neon. Noise: simplex 3D (Ashima/Stefan Gustavson).

const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
varying vec2 vUv;
varying float vNoise;
varying vec3 vNormalV;
varying vec3 vViewDir;

${simplexNoise}

void main() {
  vUv = uv;
  vec3 pos = position;

  // Dua lapis noise → gelombang organik bergerak
  float n1 = snoise(vec3(pos.x * 0.8 + uTime * 0.18, pos.y * 1.1, uTime * 0.12));
  float n2 = snoise(vec3(pos.x * 2.2, pos.y * 1.8 - uTime * 0.1, uTime * 0.22));
  float disp = n1 * uAmplitude + n2 * (uAmplitude * 0.35);
  pos.z += disp;
  // sedikit lengkung pita
  pos.z += (1.0 - pow(abs(uv.y - 0.5) * 2.0, 2.0)) * 0.12;
  vNoise = disp;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  vNormalV = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const fragmentShader = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying float vNoise;
varying vec3 vNormalV;
varying vec3 vViewDir;

// Palet neon: pink -> purple -> blue
vec3 palette(float t) {
  vec3 pink   = vec3(1.00, 0.18, 0.57);
  vec3 purple = vec3(0.55, 0.36, 1.00);
  vec3 blue   = vec3(0.23, 0.51, 1.00);
  vec3 c = mix(pink, purple, smoothstep(0.0, 0.5, t));
  c = mix(c, blue, smoothstep(0.5, 1.0, t));
  return c;
}

void main() {
  // Fresnel → kesan kaca (tepi lebih terang)
  float fresnel = pow(1.0 - max(dot(normalize(vNormalV), normalize(vViewDir)), 0.0), 2.2);

  float t = fract(vUv.x * 1.2 + vNoise * 0.35 + uTime * 0.04);
  vec3 neon = palette(t);

  // Base kaca keputihan + emissive neon yang menguat di tepi (fresnel)
  vec3 glass = mix(vec3(0.93, 0.95, 1.0), neon, 0.45);
  vec3 emissive = neon * (0.55 + fresnel * 1.6);
  vec3 color = glass + emissive;

  // Bloom akan menangkap bagian paling terang
  gl_FragColor = vec4(color, 1.0);
}
`;
