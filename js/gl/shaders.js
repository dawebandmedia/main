/* ==========================================================================
   GLSL shaders
   - hero particles  : the DA + orbit mark, mouse-reactive, morphs into a timeline
   - hero background : cinematic noise + the blue rim light from the cover photo
   - gallery planes  : liquid hover distortion, chromatic aberration, scroll bend
   - wipe            : the orbit dot bursts into a full-screen transition
   ========================================================================== */

/* 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT) */
export const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

/* ---------------- Hero particles ---------------- */
// aType: 0 = letters, 1 = orbit arc, 2 = satellite dot, 3 = orbit ring, 4 = dust
export const heroVertex = /* glsl */ `
uniform float uTime;
uniform float uIntro;      // 0 -> 1 : particles burst out of the preloader dot and assemble
uniform float uMorph;      // 0 -> 1 : orbit flattens into a timeline as you scroll
uniform vec3  uMouse;      // xy = pointer in mark space, z = strength
uniform float uLineY;      // y of the timeline line (mark space)
uniform float uLineHalfW;  // half width of the timeline line (mark space)
uniform float uPlayX;      // x of the playhead on the line (mark space)
uniform vec3  uBurst;      // where the intro burst starts (mark space)
uniform vec2  uRing;       // center of the orbit ring
uniform float uSize;
uniform float uPR;

attribute vec3 aRandom;
attribute float aType;
attribute float aScale;
attribute float aAngle;

varying float vAlpha;
varying float vType;
varying float vGlow;
varying float vRand;

${noise}

vec3 rotX(vec3 p, float a){ float c=cos(a), s=sin(a); return vec3(p.x, c*p.y - s*p.z, s*p.y + c*p.z); }
vec3 rotZ(vec3 p, float a){ float c=cos(a), s=sin(a); return vec3(c*p.x - s*p.y, s*p.x + c*p.y, p.z); }

void main() {
  vec3 target = position;
  float alpha = 1.0;
  vGlow = 0.0;

  if (aType < 0.5) {
    // letters: a gentle living drift
    target += 0.012 * vec3(
      snoise(position * 2.2 + vec3(uTime * 0.18)),
      snoise(position * 2.2 + vec3(11.0, uTime * 0.18, 0.0)),
      snoise(position * 2.2 + vec3(0.0, 23.0, uTime * 0.18)));
    alpha = 0.78;
  } else if (aType < 1.5) {
    // orbit arc: light pulses travel along it; ends fade like the logo
    vGlow = pow(0.5 + 0.5 * sin(aAngle * 26.0 - uTime * 2.6), 10.0);
    alpha = smoothstep(0.0, 0.2, aAngle) * smoothstep(1.0, 0.8, aAngle) * 0.9;
  } else if (aType < 2.5) {
    // satellite dot: breathes
    alpha = aScale < 3.0 ? 0.95 : 0.1;   // large particles form a soft halo
    vGlow = 1.0;
  } else if (aType < 3.5) {
    // orbit ring: a tilted ellipse that slowly turns
    float a = aAngle + uTime * (0.05 + aRandom.x * 0.03);
    vec3 p = vec3(cos(a) * position.x, position.y, sin(a) * position.x);
    p = rotX(p, 1.22);
    p = rotZ(p, -0.38);
    target = vec3(uRing, 0.0) + p;
    alpha = 0.35 + 0.35 * aRandom.y;
    alpha *= 0.55 + 0.45 * smoothstep(-0.6, 0.6, p.z);   // the back of the ring is dimmer
  } else {
    // dust: slow float and twinkle
    target += 0.18 * vec3(snoise(position * 0.6 + vec3(uTime * 0.05)), snoise(position * 0.6 + vec3(7.0, uTime * 0.05, 3.0)), 0.0);
    alpha = 0.15 + 0.35 * abs(sin(uTime * (0.4 + aRandom.x) + aRandom.y * 6.28));
  }

  // pointer: particles part around the cursor and lift towards the camera
  vec2 dm = target.xy - uMouse.xy;
  float dist = length(dm);
  float f = smoothstep(0.7, 0.0, dist) * uMouse.z;
  target.xy += normalize(dm + 1e-4) * f * 0.3;
  target.z += f * (0.25 + aRandom.z * 0.5);

  // intro: burst from the preloader dot, swirl, settle
  float delay = aRandom.y * 0.45 + (aType > 2.5 ? 0.2 : 0.0);
  float p = clamp((uIntro - delay) / 0.55, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - p, 3.0);
  vec3 start = uBurst + (aRandom - 0.5) * 0.15;
  vec3 swirl = vec3(cos(aRandom.x * 6.2831), sin(aRandom.x * 6.2831), aRandom.z - 0.5) * sin(p * 3.1416) * (0.6 + aRandom.y * 1.4);
  vec3 pos = mix(start, target, e) + swirl;
  alpha *= smoothstep(0.0, 0.08, p);

  // scroll: orbit -> timeline. Particles scatter, then line up; the dot becomes the playhead
  float m = clamp((uMorph - aRandom.x * 0.3) / 0.7, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 linePos = vec3((aRandom.x * 2.0 - 1.0) * uLineHalfW, uLineY + (aRandom.y - 0.5) * 0.01, 0.0);
  if (aType > 1.5 && aType < 2.5) linePos = vec3(uPlayX + (aRandom.x - 0.5) * 0.06, uLineY + (aRandom.y - 0.5) * 0.06, 0.0);
  vec3 scatter = vec3(snoise(vec3(aRandom.xy * 5.0, 1.0)), snoise(vec3(aRandom.yz * 5.0, 2.0)), snoise(vec3(aRandom.zx * 5.0, 3.0)));
  pos = mix(pos, linePos, m) + scatter * sin(m * 3.1416) * 0.7;
  if (aType > 3.5) alpha *= 1.0 - m;           // dust fades away
  alpha *= mix(1.0, 0.85, m);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float size = uSize * aScale;
  if (aType > 1.5 && aType < 2.5) size *= 1.0 + 0.18 * sin(uTime * 2.2);
  gl_PointSize = size * uPR * (7.5 / -mv.z);

  vAlpha = alpha;
  vType = aType;
  vRand = aRandom.z;
}
`;

export const heroFragment = /* glsl */ `
uniform vec3 uCream;
uniform vec3 uIce;
uniform vec3 uBlue;
varying float vAlpha;
varying float vType;
varying float vGlow;
varying float vRand;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.05, d);
  vec3 col = uCream;
  if (vType > 0.5 && vType < 1.5) col = mix(uCream, uIce, vGlow) + vGlow * 0.4;
  else if (vType > 1.5 && vType < 2.5) col = mix(uIce, uBlue, 0.35) + 0.25;
  else if (vType > 2.5 && vType < 3.5) col = mix(uIce, uBlue, vRand * 0.8);
  else if (vType > 3.5) col = mix(uCream, uIce, vRand);
  gl_FragColor = vec4(col, a * vAlpha);
}
`;

/* ---------------- Hero background ---------------- */
export const bgVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`;

export const bgFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uMorph;
varying vec2 vUv;
${noise}
float fbm(vec3 p){ float f = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ f += a * snoise(p); p *= 2.03; a *= 0.5; } return f; }
void main() {
  vec2 uv = vUv;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);
  float n = fbm(vec3(p * 1.25, uTime * 0.035));
  vec3 night = vec3(0.039, 0.047, 0.067);
  vec3 blue = vec3(0.239, 0.482, 1.0);
  vec3 ice = vec3(0.663, 0.776, 1.0);
  // the cover photo's rim light: strong bottom-right, faint top-left
  float rim  = smoothstep(1.05, 0.0, distance(uv, vec2(0.95, -0.08)) + n * 0.28);
  float rim2 = smoothstep(0.85, 0.0, distance(uv, vec2(0.02, 1.08)) + n * 0.22);
  float hover = smoothstep(0.4, 0.0, distance(uv * vec2(uRes.x / uRes.y, 1.0), uMouse * vec2(uRes.x / uRes.y, 1.0)));
  vec3 col = night;
  col += blue * rim * 0.34 * (1.0 - uMorph * 0.6);
  col += ice * rim2 * 0.05;
  col += blue * hover * 0.05;
  col += (n * 0.5 + 0.5) * 0.014;
  col *= 1.0 - 0.38 * pow(distance(uv, vec2(0.5)), 2.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------------- Gallery planes ---------------- */
export const galleryVertex = /* glsl */ `
uniform float uVelocity;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  // the reel bends with the speed of the horizontal scroll
  p.y += sin(uv.x * 3.1416) * uVelocity * 0.06;
  p.x += (uv.y - 0.5) * uVelocity * 0.03;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const galleryFragment = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uPlane;      // plane size in px
uniform vec2 uImage;      // image size in px
uniform float uHover;
uniform vec2 uMouse;      // pointer in uv
uniform float uVelocity;
uniform float uTime;
uniform float uReveal;
uniform float uOpacity;
uniform float uRadius;
varying vec2 vUv;
${noise}

float roundedBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }

void main() {
  // object-fit: cover
  vec2 ratio = vec2(
    min((uPlane.x / uPlane.y) / (uImage.x / uImage.y), 1.0),
    min((uPlane.y / uPlane.x) / (uImage.y / uImage.x), 1.0));
  vec2 uv = vec2(vUv.x * ratio.x + (1.0 - ratio.x) * 0.5, vUv.y * ratio.y + (1.0 - ratio.y) * 0.5);

  // hover zoom + liquid ripple around the pointer
  uv = (uv - 0.5) * (1.0 - 0.07 * uHover) + 0.5;
  vec2 aspect = vec2(uPlane.x / uPlane.y, 1.0);
  float d = distance(vUv * aspect, uMouse * aspect);
  float ripple = smoothstep(0.42, 0.0, d) * uHover;
  float n = snoise(vec3(vUv * 3.5, uTime * 0.5));
  uv += vec2(n, -n) * 0.018 * ripple;
  uv += normalize(vUv - uMouse + 1e-4) * ripple * 0.012 * sin(d * 28.0 - uTime * 5.0);

  // chromatic aberration from speed and hover
  float shift = 0.004 * uHover + abs(uVelocity) * 0.018;
  vec3 col;
  col.r = texture2D(uTex, uv + vec2(shift, 0.0)).r;
  col.g = texture2D(uTex, uv).g;
  col.b = texture2D(uTex, uv - vec2(shift, 0.0)).b;

  // calmer at rest, full color on hover
  float grey = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(grey), col, 0.82 + 0.18 * uHover) * (0.88 + 0.12 * uHover);

  // noise-dissolve reveal with a blue edge
  float nn = snoise(vec3(vUv * 2.6, 3.0)) * 0.5 + 0.5;
  float r = uReveal * 1.25 - 0.1;
  float mask = smoothstep(nn - 0.04, nn + 0.04, r);
  float edge = smoothstep(0.07, 0.0, abs(r - nn)) * (1.0 - smoothstep(0.85, 1.0, uReveal));
  col += vec3(0.239, 0.482, 1.0) * edge * 1.4;

  // rounded corners
  vec2 px = (vUv - 0.5) * uPlane;
  float box = roundedBox(px, uPlane * 0.5, uRadius);
  float corner = 1.0 - smoothstep(-1.0, 0.5, box);

  float a = max(mask, edge) * corner * uOpacity;
  gl_FragColor = vec4(col * a, a);
}
`;

/* ---------------- Wipe transition (raw WebGL1) ---------------- */
export const wipeVertex = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const wipeFragment = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform vec2 uOrigin;     // 0..1, origin of the burst (y up)
uniform float uProgress;  // 0..1
uniform float uPhase;     // 0 = cover (circle fills), 1 = reveal (hole opens)
uniform float uTime;
${noise}
void main() {
  float ar = uRes.x / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y;
  vec2 o = uOrigin * vec2(ar, 1.0);
  float d = distance(p, o);
  float maxD = length(vec2(ar, 1.0)) + 0.35;
  float n = snoise(vec3(p * 2.2, uTime * 0.6)) * 0.07 + snoise(vec3(p * 7.0, uTime)) * 0.02;
  float r = uProgress * maxD;
  float edge = r - (d + n * smoothstep(0.0, 0.15, uProgress));
  float inside = smoothstep(-0.003, 0.003, edge);
  float fill = mix(inside, 1.0 - inside, uPhase);
  float live = step(0.001, uProgress) * step(uProgress, 0.999);
  float rim = smoothstep(0.012, 0.0, abs(edge)) * live;

  vec3 night = vec3(0.039, 0.047, 0.067);
  vec3 blue  = vec3(0.239, 0.482, 1.0);
  vec3 cream = vec3(0.937, 0.922, 0.890);
  // a blue band trails the edge, deep night behind it
  vec3 col = mix(blue, night, smoothstep(0.0, 0.28, abs(edge)));
  col = mix(col, cream, rim);
  float a = max(fill, rim);
  gl_FragColor = vec4(col * a, a);
}
`;
