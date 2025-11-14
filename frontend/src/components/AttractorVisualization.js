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

    // Scene setup
    const scene = new THREE.Scene();
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
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

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

    // Create particle system
    const points = generateLorenzAttractor(
      params.lorenz_sigma,
      params.lorenz_rho,
      params.lorenz_beta
    );

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create gradient colors based on position
    const colors = new Float32Array(points.length * 3);
    points.forEach((point, i) => {
      const t = i / points.length;
      colors[i * 3] = 0; // R
      colors[i * 3 + 1] = t; // G (teal gradient)
      colors[i * 3 + 2] = 1 - t; // B
    });
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Add trajectory line
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00FFE1,
      transparent: true,
      opacity: 0.3
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
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {showControls && (
        <div className="absolute top-4 right-4 glass-card p-3 text-xs">
          <p className="text-teal-neon font-bold mb-2">Lorenz Parameters</p>
          <p className="text-teal-dark">σ = {params.lorenz_sigma.toFixed(2)}</p>
          <p className="text-teal-dark">ρ = {params.lorenz_rho.toFixed(2)}</p>
          <p className="text-teal-dark">β = {params.lorenz_beta.toFixed(2)}</p>
          {isAnimating && (
            <p className="text-teal-neon mt-2 animate-pulse">🔄 Encrypting...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AttractorVisualization;
