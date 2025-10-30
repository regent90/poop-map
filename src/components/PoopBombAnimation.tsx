import React, { useEffect, useState } from 'react';
import { PoopBombEffect, PoopAttack } from '../types';
import { POOP_BOMB_EFFECTS } from '../config/poopItems';

interface PoopBombAnimationProps {
  attack: PoopAttack;
  onComplete: () => void;
}

interface PoopParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  scale: number;
  emoji: string;
  opacity: number;
}

export const PoopBombAnimation: React.FC<PoopBombAnimationProps> = ({ attack, onComplete }) => {
  const [particles, setParticles] = useState<PoopParticle[]>([]);
  const [showMessage, setShowMessage] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const effect = POOP_BOMB_EFFECTS[attack.itemUsed.type];

  // 便便 emoji 列表
  const poopEmojis = ['💩', '🤎', '💨', '🌪️', '💥', '✨', '🌟', '💫'];
  
  // 根據道具類型選擇 emoji
  const getEmojiForType = (type: string): string[] => {
    switch (type) {
      case 'golden_poop':
        return ['✨', '🌟', '💫', '💰', '🏆'];
      case 'rainbow_poop':
        return ['🌈', '🦄', '🎨', '🎊', '🎉'];
      case 'stinky_poop':
        return ['💩', '🤢', '☠️', '💀', '🌪️'];
      default:
        return ['💩', '💨', '💥'];
    }
  };

  // 創建粒子
  const createParticles = (): PoopParticle[] => {
    const newParticles: PoopParticle[] = [];
    const emojis = getEmojiForType(attack.itemUsed.type);
    
    for (let i = 0; i < effect.particles; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        opacity: 1,
      });
    }
    
    return newParticles;
  };

  // 更新粒子位置
  const updateParticles = (prevParticles: PoopParticle[]): PoopParticle[] => {
    return prevParticles.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      rotation: particle.rotation + 5,
      vy: particle.vy + 0.1, // 重力效果
      opacity: particle.y > window.innerHeight ? 0 : particle.opacity,
    })).filter(particle => particle.y < window.innerHeight + 100);
  };

  useEffect(() => {
    // 顯示攻擊訊息 2 秒
    const messageTimer = setTimeout(() => {
      setShowMessage(false);
      setIsAnimating(true);
      setParticles(createParticles());
    }, 2000);

    return () => clearTimeout(messageTimer);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const animationInterval = setInterval(() => {
      setParticles(prev => {
        const updated = updateParticles(prev);
        if (updated.length === 0) {
          setIsAnimating(false);
          setTimeout(onComplete, 500);
        }
        return updated;
      });
    }, 16); // 60 FPS

    const completeTimer = setTimeout(() => {
      setIsAnimating(false);
      onComplete();
    }, effect.duration);

    return () => {
      clearInterval(animationInterval);
      clearTimeout(completeTimer);
    };
  }, [isAnimating, effect.duration, onComplete]);

  if (!showMessage && !isAnimating) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      
      {/* 攻擊訊息 */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-2xl max-w-sm mx-4 text-center animate-bounce">
            <div className="text-6xl mb-4">{attack.itemUsed.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              便便攻擊！💥
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              {attack.fromUserName} 向你丟了
            </p>
            <p className="text-xl font-bold text-purple-600 mb-3">
              {attack.itemUsed.name}
            </p>
            {attack.message && (
              <p className="text-sm text-gray-500 italic">
                "{attack.message}"
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* 粒子動畫 */}
      {isAnimating && particles.map(particle => (
        <div
          key={particle.id}
          className="absolute text-4xl pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            opacity: particle.opacity,
            transition: 'opacity 0.3s ease-out',
          }}
        >
          {particle.emoji}
        </div>
      ))}
      
      {/* 特殊效果 */}
      {isAnimating && effect.type === 'poop_tornado' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-9xl animate-spin">🌪️</div>
        </div>
      )}
      
      {isAnimating && effect.type === 'poop_explosion' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-9xl animate-pulse">💥</div>
        </div>
      )}
    </div>
  );
};