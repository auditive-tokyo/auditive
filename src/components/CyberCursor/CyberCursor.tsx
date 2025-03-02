import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CyberCursor.css';

const CyberCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [showEnergyPulse, setShowEnergyPulse] = useState(false);
  const [idleTimer, setIdleTimer] = useState<number | null>(null);
  
  // テンタクルの数
  const tentacleCount = 12;
  const tentacleLengthMin = 30;
  const tentacleLengthMax = 100;
  
  // アニメーション用のタイムスタンプ
  const timeRef = useRef(0);
  const [forceRender, setForceRender] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  
  // ユニークなグラデーションIDを生成
  const gradientIds = useRef(
    Array.from({ length: tentacleCount }, (_, i) => `tentacle-gradient-${i}`)
  );
  
  // アニメーションループ
  const updateAnimation = useCallback(() => {
    timeRef.current += 0.01;
    setForceRender(prev => prev + 1);
    
    animationFrameRef.current = requestAnimationFrame(updateAnimation);
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateAnimation);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateAnimation]);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setPrevPosition(position);
      setPosition({ x: e.clientX, y: e.clientY });
      
      // マウスの移動距離を計算
      const distance = Math.sqrt(
        Math.pow(e.clientX - prevPosition.x, 2) + 
        Math.pow(e.clientY - prevPosition.y, 2)
      );

      // マウス移動のたびにタイマーをクリア
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      
      // 速い動きでパルスエフェクト
      if (distance > 20 && Math.random() < 0.3) {
        triggerPulseEffect();
      }
      
      // 静止状態が続いた場合も時々エフェクト発生
      const newTimer = window.setTimeout(() => {
        if (Math.random() < 0.4) {
          triggerPulseEffect(true);
        }
      }, 2000);
      
      setIdleTimer(newTimer);
    };

    // エネルギーパルスエフェクト発火関数
    const triggerPulseEffect = (isSmall = false) => {
      setShowEnergyPulse(true);
      setTimeout(() => {
        setShowEnergyPulse(false);
      }, isSmall ? 300 : 500);
    };

    const handleMouseDown = () => {
      setClicked(true);
      triggerPulseEffect();
    };
    
    const handleMouseUp = () => setClicked(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position, prevPosition, clicked, idleTimer]);

  // テンタクルのパス生成
  const generateTentaclePaths = useCallback(() => {
    const paths = [];
    const time = timeRef.current;
    
    // 複数のテンタクルを生成
    for (let i = 0; i < tentacleCount; i++) {
      // 各テンタクルの角度を計算（均等に分布）
      const baseAngle = (i / tentacleCount) * Math.PI * 2;
      // 時間経過で少しずつ回転
      const angle = baseAngle + Math.sin(time * 0.5) * 0.2;
      
      // テンタクルの長さ（クリック時は長く）
      const length = tentacleLengthMin + 
                    (clicked ? tentacleLengthMax * 1.5 : tentacleLengthMax) * 
                    (0.6 + 0.4 * Math.sin(time * 2 + i * 0.7));
                    
      // 各テンタクルの制御点の数
      const controlPoints = 4;
      
      let path = `M0,0 `;
      
      // 各テンタクルは複数の制御点を持つ曲線で描く
      for (let j = 1; j <= controlPoints; j++) {
        // 各点の位置（距離）
        const segmentLength = (j / controlPoints) * length;
        
        // うねうね動くための角度オフセット
        const waveOffset = 
          Math.sin(time * 3 + i * 0.5 + j * 0.8) * 0.5 * 
          Math.min(1, j / 2); // 先端ほど大きくうねる
        
        // 各点の座標計算
        const x = Math.cos(angle + waveOffset) * segmentLength;
        const y = Math.sin(angle + waveOffset) * segmentLength;
        
        // 二次ベジェ曲線で滑らかに接続
        if (j === 1) {
          path += `Q${x * 0.5},${y * 0.5} ${x},${y} `;
        } else {
          const prevX = Math.cos(angle + Math.sin(time * 3 + i * 0.5 + (j-1) * 0.8) * 0.3 * Math.min(1, (j-1) / 2)) * 
                       ((j-1) / controlPoints) * length;
          const prevY = Math.sin(angle + Math.sin(time * 3 + i * 0.5 + (j-1) * 0.8) * 0.3 * Math.min(1, (j-1) / 2)) * 
                       ((j-1) / controlPoints) * length;
          
          // 制御点を計算
          const cpX = prevX + (x - prevX) * 0.5 + Math.sin(time * 2 + i * 1.5) * 10;
          const cpY = prevY + (y - prevY) * 0.5 + Math.cos(time * 2 + i * 1.5) * 10;
          
          path += `Q${cpX},${cpY} ${x},${y} `;
        }
      }
      
      paths.push(path);
    }
    
    return paths;
  }, [forceRender, clicked]);

  return (
    <>
      <div 
        className="cyber-cursor-glow"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
        }}
      />
      <div 
        className={`cyber-cursor ${clicked ? 'clicked' : ''}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px` 
        }}
      />
      <div 
        className="cyber-cursor-ring"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px` 
        }}
      />
      
      {/* エネルギーパルスエフェクト */}
      {showEnergyPulse && (
        <div 
          className="energy-pulse"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 9996,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      
      {/* テンタクルエフェクト */}
      <svg 
        className="tentacle-effect" 
        style={{ 
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 9995,
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
        width="300" 
        height="300" 
        viewBox="-150 -150 300 300"
      >
        {/* グラデーション定義 */}
        <defs>
          {gradientIds.current.map((id, index) => (
            <linearGradient 
              key={id} 
              id={id} 
              gradientUnits="userSpaceOnUse"
              x1="0" y1="0" 
              x2={Math.cos((index / tentacleCount) * Math.PI * 2) * 150}
              y2={Math.sin((index / tentacleCount) * Math.PI * 2) * 150}
            >
              <stop offset="0%" stopColor={clicked 
                ? `hsl(40, 100%, 60%)`
                : `hsl(53, 100%, 50%)`
              } stopOpacity="0.1" />
              <stop offset="50%" stopColor={clicked 
                ? `hsl(${40 + index * 4}, 100%, ${60 + index % 3 * 10}%)`
                : `hsl(${53 + index * 3}, 100%, ${50 + index % 3 * 10}%)`
              } stopOpacity="0.5" />
              <stop offset="100%" stopColor={clicked 
                ? `hsl(${40 + index * 4}, 100%, ${60 + index % 3 * 10}%)`
                : `hsl(${53 + index * 3}, 100%, ${50 + index % 3 * 10}%)`
              } stopOpacity="0.9" />
            </linearGradient>
          ))}
        </defs>
        
        {generateTentaclePaths().map((path, index) => (
          <path
            key={index}
            d={path}
            stroke={`url(#${gradientIds.current[index % gradientIds.current.length]})`}
            strokeWidth={3 - (index % 3) * 0.7}
            fill="none"
            strokeLinecap="round"
            className={`tentacle-path tentacle-path-${index % 5}`}
          />
        ))}
      </svg>
    </>
  );
};

export default CyberCursor;