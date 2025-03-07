import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CyberCursor.css';

const CyberCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [showEnergyPulse, setShowEnergyPulse] = useState(false);
  
  // 移動方向を追跡
  const directionRef = useRef({ x: 1, y: 0 });
  const isMovingRef = useRef(false);
  const velocityRef = useRef(0);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  // 動き状態の遷移を追跡 (0=停止、1=動いている)
  const transitionStateRef = useRef(0);
  // 最後の動き検知時間
  const lastMovementTimeRef = useRef(0);
  
  // 蜘蛛の足の本数
  const legCount = 8;
  
  // アニメーション用のタイムスタンプ
  const timeRef = useRef(0);
  const [forceRender, setForceRender] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  // 蜘蛛の体のサイズ
  const bodySize = 10;
  
  // SVGサイズ設定 - 基本サイズと動作時サイズ
  const baseSize = 100; // 停止時のSVGサイズ
  const activeSize = 150; // 動作時のSVGサイズ
  const svgSize = 150; 
  
  // 蜘蛛の"追従"遅延用の位置
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const spiderPositionRef = useRef({ x: 0, y: 0 });
  
  // アニメーションループ
  const updateAnimation = useCallback(() => {
    timeRef.current += 0.01;
    const currentTime = performance.now();
    
    // 蜘蛛の位置をターゲット(マウス)位置に遅延追従させる
    const targetPos = targetPositionRef.current;
    const spiderPos = spiderPositionRef.current;
    
    // 遅延率 - 小さいほど速く追いつく
    const followSpeed = 0.1;
    
    // マウスと蜘蛛の距離を計算
    const dx = targetPos.x - spiderPos.x;
    const dy = targetPos.y - spiderPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 動いているか判定
    const isMoving = distance > 1;
    isMovingRef.current = isMoving;
    
    // 速度を更新（距離に応じて）
    velocityRef.current = Math.min(1, distance / 40);
    
    // 動き状態の遷移更新
    if (isMoving) {
      lastMovementTimeRef.current = currentTime;
      // 徐々に遷移状態を1に近づける (動いている状態)
      transitionStateRef.current = Math.min(1, transitionStateRef.current + 0.02);
    } else {
      // 最後の動きから一定時間経過したら遷移状態を0に戻す (停止状態)
      const timeSinceLastMovement = currentTime - lastMovementTimeRef.current;
      
      if (timeSinceLastMovement > 100) { // 300ms以上動きがなければ停止と判断
        // ゆっくりと遷移状態を0に近づける
        transitionStateRef.current = Math.max(0, transitionStateRef.current - 0.1);
      }
    }
    
    if (distance > 0.1) {
      // マウスに向かって移動
      spiderPositionRef.current = {
        x: spiderPos.x + dx * followSpeed,
        y: spiderPos.y + dy * followSpeed
      };
      
      // 動きの方向を更新
      if (distance > 5) {
        directionRef.current = {
          x: dx / distance,
          y: dy / distance
        };
      }
    }
    
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
      const newPosition = { x: e.clientX, y: e.clientY };
      setPosition(newPosition);
      
      // マウス位置をターゲット位置として設定
      targetPositionRef.current = newPosition;
      
      // 初回の場合は蜘蛛の位置も設定
      if (spiderPositionRef.current.x === 0 && spiderPositionRef.current.y === 0) {
        spiderPositionRef.current = newPosition;
      }
      
      // 速い動きでパルスエフェクト
      const lastPos = lastPositionRef.current;
      const dx = newPosition.x - lastPos.x;
      const dy = newPosition.y - lastPos.y;
      const moveDistance = Math.sqrt(dx * dx + dy * dy);
      
      // パルス発火閾値を調整
      if (moveDistance > 25 && Math.random() < 0.2) {
        triggerPulseEffect();
      }
      
      // 最後の位置を更新
      lastPositionRef.current = newPosition;
      // 動き検出時に最終移動時間を更新
      if (moveDistance > 0.5) {
        lastMovementTimeRef.current = performance.now();
      }
    };

    // エネルギーパルスエフェクト発火関数
    const triggerPulseEffect = () => {
      setShowEnergyPulse(true);
      setTimeout(() => {
        setShowEnergyPulse(false);
      }, 400);
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
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // サイバースパイダーの脚を生成
  const generateSpiderLegs = useCallback(() => {
    const paths = [];
    const time = timeRef.current;
    const velocity = velocityRef.current;
    const direction = directionRef.current;
    
    // 動いているかどうかで脚の動きを変える
    const isMoving = isMovingRef.current;
    const moveIntensity = Math.min(1, velocity * 1.5);
    
    // 遷移状態を使って脚の長さを調整
    const transitionState = transitionStateRef.current;
    
    // 脚の長さの基本値と最大値
    const minLegLength = 15;  // 停止時の脚の長さ
    const maxLegLength = 25;  // 動作時の脚の長さ
    const baseLegLength = minLegLength + (maxLegLength - minLegLength) * transitionState;
    const maxLegLengthBonus = 15 * transitionState;  // 動作時のみボーナス長を追加
    
    // クリック時は脚を短くする
    const clickModifier = clicked ? 0.7 : 1;
    
    // 蜘蛛の脚を生成
    for (let i = 0; i < legCount; i++) {
      // 角度計算
      const angleStep = (Math.PI * 2) / legCount;
      let baseAngle = i * angleStep;
      
      // 動いている場合、方向に応じて脚の配置を調整
      if (isMoving) {
        // 進行方向に応じて基本角度をシフト (脚を進行方向に向ける)
        const moveAngle = Math.atan2(direction.y, direction.x);
        // 進行方向への配置調整の強度
        const directionBias = 0.5 * moveIntensity * transitionState;
        
        // 基本角度と進行方向を加重平均
        baseAngle = baseAngle * (1 - directionBias) + 
                    (moveAngle + (i % 2 === 0 ? Math.PI : 0)) * directionBias;
      }
      
      // 時間経過でわずかに揺らす (脚の動き)
      const phase = isMoving ? time * 5 : time;
      const legWave = isMoving ? 
        Math.sin(phase + i * Math.PI * 0.25) * 0.3 * moveIntensity * transitionState : 
        Math.sin(phase + i * Math.PI * 0.5) * 0.1;
      
      const angle = baseAngle + legWave;
      
      // 脚の長さ - 動きに応じて変化
      const legLengthMultiplier = 1 + 
        (isMoving ? Math.sin(phase * 0.5 + i * Math.PI) * 0.3 * moveIntensity * transitionState : 0);
      
      // 左右の脚で長さを少し変える
      const lengthVariation = i % 2 === 0 ? 1.1 : 0.9;
      
      const legLength = (baseLegLength + maxLegLengthBonus * velocity) * 
                      legLengthMultiplier * clickModifier * lengthVariation;
      
      // 脚のジョイント (2関節)
      // 第1関節 (付け根)
      const joint1Length = legLength * 0.5;
      const joint1X = Math.cos(angle) * joint1Length;
      const joint1Y = Math.sin(angle) * joint1Length;
      
      // 第2関節 (先端) - より動きのある角度
      const joint2Angle = angle + (isMoving ? 
        Math.sin(phase * 2 + i) * 0.6 * moveIntensity * transitionState : 
        Math.sin(time + i * 0.7) * 0.2);
      
      const joint2Length = legLength * 0.7;
      const joint2X = joint1X + Math.cos(joint2Angle) * joint2Length;
      const joint2Y = joint1Y + Math.sin(joint2Angle) * joint2Length;
      
      // パスを作成
      const path = `M0,0 L${joint1X},${joint1Y} L${joint2X},${joint2Y}`;
      paths.push(path);
    }
    
    return paths;
  }, [forceRender, clicked]);

  // 蜘蛛の体の中心から相対的な位置
  const spiderPos = spiderPositionRef.current;
  const centerX = spiderPos.x;
  const centerY = spiderPos.y;

  // 遷移状態に基づくSVGのサイズと不透明度の計算
  const transitionState = transitionStateRef.current;
  const currentSize = baseSize + (activeSize - baseSize) * transitionState;
  const currentOpacity = 0.4 + 0.6 * transitionState; // 0.4～1.0の間で不透明度変化

  return (
    <>
      {/* カーソル中心のドット */}
      <div 
        className="cyber-cursor"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          width: '6px',
          height: '6px',
          backgroundColor: 'rgba(0, 255, 255, 0.9)',
          boxShadow: '0 0 10px 2px rgba(0, 255, 255, 0.7)',
          borderRadius: '50%',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)'
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
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
      
      {/* サイバースパイダーのSVG */}
      <svg 
        style={{ 
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 9995,
          left: `${centerX}px`, 
          top: `${centerY}px`,
          transform: 'translate(-50%, -50%)',
          filter: 'drop-shadow(0 0 3px rgba(0, 255, 255, 0.7))',
          opacity: currentOpacity, // 動作状態に応じて不透明度を変化
          transition: 'opacity 0.2s ease' // 不透明度の変化を滑らかに
        }}
        width={currentSize}
        height={currentSize}
        viewBox={`-${svgSize/2} -${svgSize/2} ${svgSize} ${svgSize}`}
      >
        <defs>
          {/* 脚のためのグラデーション */}
          <linearGradient id="leg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(20, 215, 215, 0.95)" />
            <stop offset="100%" stopColor="rgba(0, 255, 255, 0.4)" />
          </linearGradient>
          
          {/* クリック時のグラデーション */}
          <linearGradient id="leg-gradient-active" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 200, 50, 0.95)" />
            <stop offset="100%" stopColor="rgba(255, 165, 0, 0.4)" />
          </linearGradient>
          
          {/* グローエフェクト */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* 蜘蛛の脚 */}
        {generateSpiderLegs().map((path, index) => (
          <path
            key={index}
            d={path}
            stroke={clicked ? "url(#leg-gradient-active)" : "url(#leg-gradient)"}
            strokeWidth={1 + 0.5 * transitionState} // 停止時は細く
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
            className="spider-leg"
          />
        ))}
        
        {/* 蜘蛛の体 */}
        <circle
          cx="0"
          cy="0"
          r={bodySize * (clicked ? 1.2 : 1) * (0.8 + 0.2 * transitionState)} // 停止時は小さく
          fill={clicked ? "rgba(255, 165, 0, 0.8)" : "rgba(0, 210, 210, 0.8)"}
          filter="url(#glow)"
          className="spider-body"
        />
        
        {/* 中心の小さいハイライト */}
        <circle
          cx="0"
          cy="0"
          r={bodySize * 0.4 * (0.8 + 0.2 * transitionState)} // 停止時は小さく
          fill={clicked ? "rgba(255, 220, 150, 0.9)" : "rgba(150, 255, 255, 0.9)"}
          className="spider-core"
        />
      </svg>
    </>
  );
};

export default CyberCursor;