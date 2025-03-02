import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CyberCursor.css';

const CyberCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [showEnergyPulse, setShowEnergyPulse] = useState(false);
  const [idleTimer, setIdleTimer] = useState<number | null>(null);
  
  // 移動方向を追跡
  const directionRef = useRef({ x: 1, y: 0 });
  const isMovingRef = useRef(false);
  const velocityRef = useRef(0);
  
  // 移行状態を記録するための状態
  const transitionStateRef = useRef(0); // 0: 完全静止状態、1: 完全移動状態
  
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

  // SVGサイズを動的に調整するための参照
  const svgSizeRef = useRef({
    width: 300,
    height: 300,
    viewBox: "-150 -150 300 300"
  });
  
  // アニメーションループ
  const updateAnimation = useCallback(() => {
    timeRef.current += 0.01;
    
    // 移動状態の更新
    if (isMovingRef.current && velocityRef.current > 0.1) {
      // 動いている場合、遷移状態を動きの方向へ徐々に上げる
      transitionStateRef.current = Math.min(1, transitionStateRef.current + 0.05);
    } else {
      // 静止している場合、遷移状態を静止状態へ徐々に下げる
      transitionStateRef.current = Math.max(0, transitionStateRef.current - 0.02);
    }
    
    // 移動が止まったら徐々に速度を減衰させる
    if (!isMovingRef.current && velocityRef.current > 0) {
      velocityRef.current = Math.max(0, velocityRef.current - 0.03); // 減衰速度を遅くして自然に
    }

    // SVGサイズを動的に調整
    const transitionState = transitionStateRef.current;
    const baseSize = 112.5; // 基本サイズ（静止時）- 75%に縮小
    const maxSize = 300;  // 最大サイズ（移動時）
    const sizeRange = maxSize - baseSize;
    const currentSize = baseSize + (sizeRange * transitionState);
    const halfSize = currentSize / 2;
    
    svgSizeRef.current = {
      width: currentSize,
      height: currentSize,
      viewBox: `-${halfSize} -${halfSize} ${currentSize} ${currentSize}`
    };
    
    // 再レンダリングを強制
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
      // 前の位置を保存
      setPrevPosition(position);
      const newPosition = { x: e.clientX, y: e.clientY };
      setPosition(newPosition);
      
      // 移動距離と方向を計算
      const dx = newPosition.x - position.x;
      const dy = newPosition.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 有意な動きがあった場合のみ方向を更新
      if (distance > 3) {
        isMovingRef.current = true;
        
        // 新しい方向ベクトル（正規化）
        const newDirection = {
          x: dx / distance,
          y: dy / distance
        };
        
        // 現在の方向と新しい方向を補間（よりなめらかな変化）
        directionRef.current = {
          x: directionRef.current.x * 0.8 + newDirection.x * 0.2,
          y: directionRef.current.y * 0.8 + newDirection.y * 0.2
        };
        
        // 速度を更新（移動距離に応じて）
        velocityRef.current = Math.min(1, distance / 20);
      } else {
        isMovingRef.current = false;
      }

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

  // テンタクルのパス生成 - 移行状態を考慮して生成
  const generateTentaclePaths = useCallback(() => {
    const paths = [];
    const time = timeRef.current;
    const direction = directionRef.current;
    const velocity = velocityRef.current;
    const transitionState = transitionStateRef.current; // 移行状態 0-1
    
    // イージング関数で移行をよりスムーズに
    const easeTransition = (t: number) => {
      // イーズインアウト二次関数
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };
    
    const easedTransition = easeTransition(transitionState);
    
    // 移動方向の角度を計算
    const moveAngle = Math.atan2(direction.y, direction.x);
    
    // 複数のテンタクルを生成
    for (let i = 0; i < tentacleCount; i++) {
      // 静止状態の角度 - 360度均等分布
      const staticAngle = (i / tentacleCount) * Math.PI * 2;
      
      // 移動状態の角度 - 進行方向の反対側に集中
      const spread = 2.4; // 扇形の広さ
      const movingAngle = moveAngle + Math.PI + (i / (tentacleCount - 1) - 0.5) * spread;
      
      // 移行状態に応じて2つの角度を補間
      const baseAngle = staticAngle * (1 - easedTransition) + movingAngle * easedTransition;
      
      // 時間経過で少しずつ揺らぎを加える
      const angle = baseAngle + Math.sin(time * 0.5 + i * 0.3) * (0.2 - 0.1 * easedTransition);
      
      // テンタクルの長さ - 移動速度と移行状態に応じて調整
      // 静止時は最小長の50%程度まで縮小
      const staticMultiplier = 0.5; // 静止時の長さ倍率
      const moveMultiplier = 1 + velocity * 2 * easedTransition; // 移動時の長さ倍率
      const lengthMultiplier = staticMultiplier + (moveMultiplier - staticMultiplier) * easedTransition;
      
      const length = tentacleLengthMin + 
                    (clicked ? tentacleLengthMax * 1.6 : tentacleLengthMax) * 
                    lengthMultiplier *
                    (0.6 + 0.4 * Math.sin(time * 2 + i * 0.7));
                    
      // 各テンタクルの制御点の数 - 速度と移行状態に応じて変化
      const controlPoints = Math.max(3, Math.floor(3 + velocity * 3 * easedTransition));
      
      let path = `M0,0 `;
      
      // 各テンタクルは複数の制御点を持つ曲線で描く
      for (let j = 1; j <= controlPoints; j++) {
        // 各点の位置（距離）
        const segmentLength = (j / controlPoints) * length;
        
        // うねうね動くための角度オフセット - 移行状態に応じて減少
        const waveStrength = 0.5 * (1 - easedTransition * 0.5); // 静止時ほど大きくうねる
        const waveOffset = 
          Math.sin(time * 3 + i * 0.5 + j * 0.8) * waveStrength * 
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
          
          // 制御点を計算 - 移動方向にやや曲げる（移行状態に応じて）
          const bendFactor = velocity * 5 * easedTransition; // 移行状態による影響
          const directionInfluence = j / controlPoints; // 先端ほど方向の影響が強い
          
          const cpX = prevX + (x - prevX) * 0.5 + 
                    Math.sin(time * 2 + i * 1.5) * 10 * (1 - easedTransition * 0.5) +
                    direction.x * bendFactor * directionInfluence;
          const cpY = prevY + (y - prevY) * 0.5 + 
                    Math.cos(time * 2 + i * 1.5) * 10 * (1 - easedTransition * 0.5) +
                    direction.y * bendFactor * directionInfluence;
          
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
          opacity: 0.7 + transitionStateRef.current * 0.3 // 動きに応じて透明度も変化
        }}
        width={svgSizeRef.current.width}
        height={svgSizeRef.current.height}
        viewBox={svgSizeRef.current.viewBox}
      >
        {/* グラデーション定義 */}
        <defs>
          {gradientIds.current.map((id, index) => {
            // 移行状態を考慮したグラデーション方向の設定
            const moveAngle = Math.atan2(directionRef.current.y, directionRef.current.x);
            const transitionState = transitionStateRef.current;
            
            // 静止状態の角度（均等分布）
            const staticAngle = (index / tentacleCount) * Math.PI * 2;
            
            // 移動状態の角度（方向性）
            const movingAngle = moveAngle + Math.PI + (index / (tentacleCount - 1) - 0.5) * 2.4;
            
            // 移行状態に応じて補間
            const gradientAngle = staticAngle * (1 - transitionState) + movingAngle * transitionState;
              
            return (
              <linearGradient 
                key={id} 
                id={id} 
                gradientUnits="userSpaceOnUse"
                x1="0" y1="0" 
                x2={Math.cos(gradientAngle) * 150}
                y2={Math.sin(gradientAngle) * 150}
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
            );
          })}
        </defs>
        
        {generateTentaclePaths().map((path, index) => (
          <path
            key={index}
            d={path}
            stroke={`url(#${gradientIds.current[index % gradientIds.current.length]})`}
            strokeWidth={(2 - (index % 3) * 0.5) * (0.7 + transitionStateRef.current * 0.3)} // 動きに応じて線幅も変化
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