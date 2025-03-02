import React, { useState, useEffect, useCallback } from 'react';
import './CyberCursor.css';

const CyberCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const [lightningPattern, setLightningPattern] = useState(0);
  const [showEnergyPulse, setShowEnergyPulse] = useState(false);
  const [idleTimer, setIdleTimer] = useState<number | null>(null);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      // 前回の位置を保存
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
      
      // 移動速度に応じてエフェクト発生確率を調整
      if (distance > 10) {
        // 速い動き: 高確率でエフェクト発生
        if (Math.random() < 0.25) {
          triggerLightningEffect();
        }
      } else if (distance > 0) {
        // 遅い動き: 低確率でエフェクト発生
        if (Math.random() < 0.03) {
          triggerLightningEffect(true); // 小さめのエフェクト
        }
      }
      
      // 静止状態が続いた場合も時々エフェクト発生（アイドル時エフェクト）
      const newTimer = window.setTimeout(() => {
        if (Math.random() < 0.4) { // 40%の確率で発生
          triggerLightningEffect(true);
        }
      }, 2000); // 2秒間動きがない場合
      
      setIdleTimer(newTimer);
    };

    // エフェクト発火関数を共通化
    const triggerLightningEffect = (isSmall = false) => {
      setShowLightning(true);
      setLightningPattern(Math.floor(Math.random() * 5));
      
      // クリック時や特別な時は特殊効果
      if (clicked || Math.random() < 0.3) {
        setShowEnergyPulse(true);
        setTimeout(() => {
          setShowEnergyPulse(false);
        }, isSmall ? 300 : 500);
      }
      
      setTimeout(() => {
        setShowLightning(false);
      }, isSmall ? 150 : 250); // 小さいエフェクトは短く表示
    };

    const handleMouseDown = () => {
      setClicked(true);
      // クリック時には必ず雷を出現
      triggerLightningEffect();
    };
    
    const handleMouseUp = () => setClicked(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      // クリーンアップ
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position, prevPosition, clicked, idleTimer]);

  // getLightningPaths 関数は、小さめエフェクトをサポート
  const getLightningPaths = useCallback(() => {
    const paths = [];
    const directions = [
      [1, 1], [1, -1], [-1, 1], [-1, -1], [0, 1], [1, 0], [-1, 0], [0, -1]
    ];
    
    // メインの雷エフェクト - より複雑なパターン
    let path = `M0,0 `;
    let x = 0, y = 0;
    const segments = 6 + Math.floor(Math.random() * 4); // 6-9のセグメント
    
    for (let i = 0; i < segments; i++) {
      // より長い距離、よりジグザグに
      const angle = (Math.random() * Math.PI * 2) / 3; // ランダムな方向へ
      const length = 10 + Math.random() * 20;
      const zigzag = (Math.random() > 0.5 ? -1 : 1) * (7 + Math.random() * 15);
      
      if (i % 2 === 0) {
        x += Math.cos(angle) * length + zigzag;
        y += Math.sin(angle) * length;
      } else {
        x += Math.cos(angle) * length;
        y += Math.sin(angle) * length + zigzag;
      }
      path += `L${x},${y} `;
    }
    paths.push(path);
    
    // 分岐する雷1 - 必ず出現
    let branch1X = x * 0.4, branch1Y = y * 0.4; // メインパスの途中から分岐
    let branchPath1 = `M${branch1X},${branch1Y} `;
    const branchDir1 = directions[Math.floor(Math.random() * directions.length)];
    
    for (let i = 0; i < 3; i++) {
      const bAngle = Math.random() * Math.PI;
      branch1X += Math.cos(bAngle) * (10 + Math.random() * 15);
      branch1Y += Math.sin(bAngle) * (10 + Math.random() * 15);
      branchPath1 += `L${branch1X},${branch1Y} `;
    }
    paths.push(branchPath1);
    
    // 分岐する雷2 - よりランダム
    if (Math.random() > 0.3) {
      let branch2X = x * 0.7, branch2Y = y * 0.7; // メインパスの別の位置から分岐
      let branchPath2 = `M${branch2X},${branch2Y} `;
      
      for (let i = 0; i < 2; i++) {
        const bAngle = Math.random() * Math.PI * 1.5;
        branch2X += Math.cos(bAngle) * (8 + Math.random() * 10);
        branch2Y += Math.sin(bAngle) * (8 + Math.random() * 10);
        branchPath2 += `L${branch2X},${branch2Y} `;
      }
      paths.push(branchPath2);
    }
    
    return paths;
  }, [lightningPattern, clicked]);

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
      
      {/* 雷エフェクト */}
      {showLightning && (
        <svg 
          className="lightning-effect" 
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 9996,
            transform: 'translate(-50%, -50%)',
          }}
          width="200" 
          height="200" 
          viewBox="-100 -100 200 200"
        >
          {getLightningPaths().map((path, index) => (
            <path
              key={index}
              d={path}
              stroke={clicked ? "#ff8800" : "#ffeb3b"}
              strokeWidth={index === 0 ? "3" : "2"}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`lightning-path lightning-path-${index}`}
            />
          ))}
        </svg>
      )}
    </>
  );
};

export default CyberCursor;