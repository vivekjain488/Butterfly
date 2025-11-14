import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function AttractorVisualization({ params, mixing, isAnimating, showControls = false }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup - light theme
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFEFBF7); // Light background
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0xFEFBF7, 1);
    mount.appendChild(renderer.domElement);

    // Add subtle lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x7DD3C0, 0.8, 100);
    pointLight.position.set(25, 25, 25);
    scene.add(pointLight);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Generate Lorenz attractor points
    const generateLorenzAttractor = (sigma, rho, beta, numPoints = 5000) => {
      const points = [];
      let x = 1, y = 1, z = 1;
      const dt = 0.01;

      for (let i = 0; i < numPoints; i++) {
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;

        x += dx * dt;
        y += dy * dt;
        z += dz * dt;

        points.push(new THREE.Vector3(x, y, z));
      }

      return points;
    };

    // Create particle system with pastel colors
    const points = generateLorenzAttractor(
      params.lorenz_sigma,
      params.lorenz_rho,
      params.lorenz_beta
    );

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create gradient colors based on position - pastel theme
    const colors = new Float32Array(points.length * 3);
    points.forEach((point, i) => {
      const t = i / points.length;
      // Pastel color gradient: mint -> lavender -> pink
      colors[i * 3] = 0.49 + t * 0.51;     // R: 125-255 -> mint to pink
      colors[i * 3 + 1] = 0.83 - t * 0.15; // G: 211-168 -> mint to lavender
      colors[i * 3 + 2] = 0.75 + t * 0.25; // B: 192-255 -> mint to pink
    });
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Add trajectory line with pastel color
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x7DD3C0, // Pastel mint
      transparent: true,
      opacity: 0.4
    });
    const line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);

    // Animation loop
    let rotationSpeed = 0.001;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Rotate attractor
      if (isAnimating) {
        rotationSpeed = 0.005; // Faster when encrypting
        particles.rotation.y += rotationSpeed;
        particles.rotation.x += rotationSpeed * 0.5;
      } else {
        rotationSpeed = 0.001; // Slow ambient rotation
        particles.rotation.y += rotationSpeed;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mount) return;
      
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mount && renderer.domElement) {
        try { mount.removeChild(renderer.domElement); } catch (e) { /* ignore */ }
      }
      geometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, [params, isAnimating]);

  return (
    <div className="relative w-full h-full pointer-events-auto">
      <div ref={mountRef} className="w-full h-full pointer-events-auto" />
      
      {showControls && (
        <div className="absolute top-4 right-4 glass-card p-4 text-xs rounded-2xl border-2 border-primary/20 bg-white/95 backdrop-blur-sm">
          <p className="text-primary font-bold mb-3 flex items-center gap-2">
            <span className="animate-wiggle">📐</span>
            <span>Lorenz Parameters</span>
          </p>
          <div className="space-y-2">
            <p className="text-text-secondary flex items-center gap-2">
              <span className="text-primary font-bold">σ</span>
              <span>=</span>
              <span className="font-bold text-primary">{params.lorenz_sigma.toFixed(2)}</span>
            </p>
            <p className="text-text-secondary flex items-center gap-2">
              <span className="text-primary font-bold">ρ</span>
              <span>=</span>
              <span className="font-bold text-primary">{params.lorenz_rho.toFixed(2)}</span>
            </p>
            <p className="text-text-secondary flex items-center gap-2">
              <span className="text-primary font-bold">β</span>
              <span>=</span>
              <span className="font-bold text-primary">{params.lorenz_beta.toFixed(2)}</span>
            </p>
          </div>
          {isAnimating && (
            <p className="text-primary mt-3 flex items-center gap-2 animate-pulse-soft font-semibold pt-3 border-t border-primary/20">
              <span className="animate-spin">🔄</span>
              <span>Encrypting...</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AttractorVisualization;
