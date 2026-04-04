'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const mouseVec = new THREE.Vector2(0, 0);

/**
 * 4D Core Intelligence Sphere
 * - Swirling translucent sphere of intersecting laser light
 * - Floating holographic data points
 * - Complex geometric patterns that shift
 * - Mouse reactive pulsing energy
 */
export default function CoreIntelligenceSphere({
  autoRotate = true,
  mouseReact = true,
  size = 1,
  color = '#BFF549',
  accentColor = '#60A5FA',
}: {
  autoRotate?: boolean;
  mouseReact?: boolean;
  size?: number;
  color?: string;
  accentColor?: string;
}) {
  const group = useRef<THREE.Group>(null);
  const innerSphere = useRef<THREE.Mesh>(null);
  const outerRing1 = useRef<THREE.Mesh>(null);
  const outerRing2 = useRef<THREE.Mesh>(null);
  const outerRing3 = useRef<THREE.Mesh>(null);
  const laserGeo1 = useRef<THREE.Mesh>(null);
  const laserGeo2 = useRef<THREE.Mesh>(null);
  const laserGeo3 = useRef<THREE.Mesh>(null);
  const dataPoints = useRef<THREE.Points>(null);
  const hologramMesh = useRef<THREE.Mesh>(null);

  // Shader material for main sphere
  const sphereMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(color) },
      uAccent: { value: new THREE.Color(accentColor) },
      uOpacity: { value: 0.15 },
      uPulse: { value: 0 },
    },
    vertexShader: `
      uniform float uTime, uPulse;
      varying vec3 vN, vW;
      varying vec2 vU;
      void main() {
        vU = uv;
        vec3 pos = position + normal * sin(uTime * 2.0 + position.x * 4.0) * 0.05 * uPulse;
        vN = normalize(normalMatrix * normal);
        vW = (modelMatrix * vec4(pos, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime, uOpacity, uPulse;
      uniform vec3 uColor, uAccent;
      uniform vec2 uMouse;
      varying vec3 vN, vW;
      varying vec2 vU;
      void main() {
        vec3 vd = normalize(cameraPosition - vW);
        float f = pow(1.0 - max(dot(vd, vN), 0.0), 3.0);
        // Grid pattern
        float grid = step(0.95, fract(vU.x * 20.0 + uTime * 0.3)) + step(0.95, fract(vU.y * 20.0 + uTime * 0.2));
        // Mouse glow
        float mg = smoothstep(0.4, 0.0, length((vU - 0.5) - uMouse * 0.3));
        // Combine
        vec3 c = mix(uColor, uAccent, sin(uTime * 0.5) * 0.5 + 0.5);
        c = c * f * 2.0 + vec3(grid) * uColor * 0.5;
        c += uColor * mg * 0.8 * (0.5 + uPulse * 0.5);
        float a = (f * 0.3 + grid * 0.15 + mg * 0.2) * uOpacity * (0.3 + uPulse * 0.7);
        gl_FragColor = vec4(c, a);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  // Data points geometry
  const dataGeom = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.8 + Math.random() * 0.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 0.02 + Math.random() * 0.04;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    return g;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Update main sphere shader
    if (sphereMat.uniforms) {
      sphereMat.uniforms.uTime.value = t;
      sphereMat.uniforms.uMouse.value.lerp(mouseVec, 0.05);
      sphereMat.uniforms.uPulse.value = 0.5 + Math.sin(t * 2) * 0.5;
    }

    // Rotate entire group
    if (group.current && autoRotate) {
      group.current.rotation.y += delta * 0.1;
      group.current.rotation.x = Math.sin(t * 0.15) * 0.05;
    }

    // Inner sphere — breathing
    if (innerSphere.current) {
      const scale = 0.35 + Math.sin(t * 1.5) * 0.05;
      innerSphere.current.scale.setScalar(scale * size);
      innerSphere.current.rotation.y -= delta * 0.3;
    }

    // Outer rings — intersecting lasers
    if (outerRing1.current) {
      outerRing1.current.rotation.x += delta * 0.15;
      outerRing1.current.rotation.z += delta * 0.1;
      outerRing1.current.scale.setScalar(size * (0.7 + Math.sin(t * 0.8) * 0.1));
    }
    if (outerRing2.current) {
      outerRing2.current.rotation.y += delta * 0.12;
      outerRing2.current.rotation.z += delta * 0.08;
      outerRing2.current.scale.setScalar(size * (0.8 + Math.sin(t * 0.6) * 0.1));
    }
    if (outerRing3.current) {
      outerRing3.current.rotation.x += delta * 0.09;
      outerRing3.current.rotation.y += delta * 0.14;
      outerRing3.current.scale.setScalar(size * (0.9 + Math.sin(t * 0.4) * 0.1));
    }

    // Laser geometries — intersecting energy lines
    if (laserGeo1.current) {
      laserGeo1.current.rotation.y += delta * 0.25;
      laserGeo1.current.rotation.x = Math.sin(t * 0.3) * 0.5;
    }
    if (laserGeo2.current) {
      laserGeo2.current.rotation.y -= delta * 0.2;
      laserGeo2.current.rotation.z = Math.cos(t * 0.25) * 0.5;
    }
    if (laserGeo3.current) {
      laserGeo3.current.rotation.x += delta * 0.18;
      laserGeo3.current.rotation.z += delta * 0.22;
    }

    // Data points — floating holographic
    if (dataPoints.current) {
      dataPoints.current.rotation.y -= delta * 0.05;
      dataPoints.current.rotation.x += delta * 0.03;
      const p = dataPoints.current.geometry.attributes.position.array as Float32Array;
      const ph = dataPoints.current.geometry.attributes.phase?.array as Float32Array;
      for (let i = 0; i < p.length; i += 3) {
        const phaseIdx = Math.floor(i / 3);
        const phase = ph ? ph[phaseIdx] : 0;
        p[i] += Math.sin(t * 0.5 + phase) * 0.0005;
        p[i + 1] += Math.cos(t * 0.4 + phase) * 0.0005;
        p[i + 2] += Math.sin(t * 0.3 + phase) * 0.0005;
      }
      dataPoints.current.geometry.attributes.position.needsUpdate = true;
    }

    // Hologram mesh — translucent geometric surface
    if (hologramMesh.current) {
      hologramMesh.current.rotation.y += delta * 0.08;
      hologramMesh.current.material && ((hologramMesh.current.material as THREE.MeshBasicMaterial).opacity = 0.03 + Math.sin(t) * 0.02);
    }
  });

  return (
    <group ref={group} scale={size}>
      {/* Main sphere with custom grid shader */}
      <mesh ref={innerSphere}>
        <icosahedronGeometry args={[1, 4]} />
        <primitive attach="material" object={sphereMat} />
      </mesh>

      {/* Outer shell — translucent wireframe */}
      <mesh ref={hologramMesh}>
        <icosahedronGeometry args={[1.3, 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} wireframe={true} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Intersecting laser rings */}
      <mesh ref={outerRing1} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.5, 0.008, 8, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={outerRing2} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <torusGeometry args={[1.7, 0.006, 8, 128]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={outerRing3} rotation={[Math.PI / 6, Math.PI / 3, 0]}>
        <torusGeometry args={[1.9, 0.004, 8, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Laser geometries — intersecting energy lines */}
      <mesh ref={laserGeo1}>
        <torusKnotGeometry args={[0.6, 0.005, 128, 16, 2, 3]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={laserGeo2}>
        <torusKnotGeometry args={[0.5, 0.004, 128, 16, 3, 5]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={laserGeo3}>
        <torusKnotGeometry args={[0.7, 0.003, 128, 16, 5, 7]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Floating holographic data points */}
      <points ref={dataPoints} geometry={dataGeom}>
        <pointsMaterial size={0.03} color={color} transparent opacity={0.7} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* Core glow — pulsing center */}
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
