'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Background3D() {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    // 建立場景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    containerRef.current.appendChild(renderer.domElement);

    // 設定攝影機
    camera.position.set(0, 6, 20);
    camera.lookAt(0, 7, 0); // 讓攝影機稍微往下看

    // 計算螢幕的世界座標寬度
    const screenWidthAtDepth =
      Math.tan((camera.fov * Math.PI) / 360) *
      Math.abs(camera.position.z - 0) *
      2 *
      camera.aspect;

    // **讓網格足夠大，確保看不到邊界**
    const gridSize = screenWidthAtDepth * 5; // 放大 5 倍，讓它左右無限延伸
    const gridDivisions = Math.floor(gridSize / 10); // 保持格子的均勻度

    // **建立霓虹紫色的網格**
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions);
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff }); // 霓虹紫色
    gridHelper.material = gridMaterial;

    // **讓網格更低**
    gridHelper.position.set(0, -10, 0);
    scene.add(gridHelper);

    // **創建星空背景**
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    for (let i = 0; i < 15000; i++) {
      starsVertices.push(
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(100)
      );
    }

    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02, // 小顆一點
      sizeAttenuation: true, // 讓遠的星星變小
      transparent: true,
      depthWrite: false, // 避免星星被遮擋
      blending: THREE.AdditiveBlending, // 讓星星有發光感
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // **動畫循環**
    function animate() {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0001;
      renderer.render(scene, camera);
    }
    animate();

    // **確保視窗變更時適應畫面**
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    // **清理函數**
    return () => {
      // window.removeEventListener('resize', handleResize)
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
}
