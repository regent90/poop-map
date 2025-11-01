import React, { useEffect, useState, useCallback } from 'react';
import { PoopBombEffect, PoopAttack } from '../types';
import { POOP_BOMB_EFFECTS, RARITY_COLORS } from '../config/poopItems';
import { soundManager } from '../utils/soundEffects';

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
  rotationSpeed: number;
  scale: number;
  scaleSpeed: number;
  emoji: string;
  opacity: number;
  color: string;
  trail: { x: number; y: number }[];
  life: number;
  maxLife: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
  }[];
}

export const PoopBombAnimation: React.FC<PoopBombAnimationProps> = ({ attack, onComplete }) => {
  const [particles, setParticles] = useState<PoopParticle[]>([]);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [showMessage, setShowMessage] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [flashColor, setFlashColor] = useState('');
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'buildup' | 'explosion' | 'finale'>('intro');

  const effect = POOP_BOMB_EFFECTS[attack.itemUsed.type];
  const rarityColor = RARITY_COLORS[attack.itemUsed.rarity];

  // 根據道具類型選擇 emoji 和顏色
  const getEffectConfig = (type: string) => {
    switch (type) {
      case 'golden_poop':
        return {
          emojis: ['✨', '🌟', '💫', '💰', '🏆', '⭐', '🔥', '💎'],
          colors: ['#FFD700', '#FFA500', '#FFFF00', '#FF6347'],
          bgGradient: 'from-yellow-400 via-orange-500 to-red-500',
        };
      case 'rainbow_poop':
        return {
          emojis: ['🌈', '🦄', '🎨', '🎊', '🎉', '🌟', '✨', '💫'],
          colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
          bgGradient: 'from-pink-500 via-purple-500 to-indigo-500',
        };
      case 'stinky_poop':
        return {
          emojis: ['💩', '🤢', '☠️', '💀', '🌪️', '💥', '⚡', '🔥'],
          colors: ['#8B4513', '#654321', '#2F4F2F', '#800080'],
          bgGradient: 'from-gray-900 via-purple-900 to-black',
        };
      default:
        return {
          emojis: ['💩', '💨', '💥', '🌟', '✨'],
          colors: ['#8B4513', '#A0522D', '#D2691E'],
          bgGradient: 'from-brown-500 via-yellow-600 to-orange-500',
        };
    }
  };

  const config = getEffectConfig(attack.itemUsed.type);

  // 創建更絢爛的粒子
  const createParticles = useCallback((): PoopParticle[] => {
    const newParticles: PoopParticle[] = [];
    
    for (let i = 0; i < effect.particles; i++) {
      const angle = (Math.PI * 2 * i) / effect.particles + Math.random() * 0.5;
      const speed = Math.random() * 8 + 4;
      const life = Math.random() * 3000 + 2000;
      
      newParticles.push({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        scale: Math.random() * 1.5 + 0.5,
        scaleSpeed: (Math.random() - 0.5) * 0.02,
        emoji: config.emojis[Math.floor(Math.random() * config.emojis.length)],
        opacity: 1,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        trail: [],
        life: life,
        maxLife: life,
      });
    }
    
    return newParticles;
  }, [effect.particles, config]);

  // 創建煙火效果
  const createFirework = useCallback((x: number, y: number): Firework => {
    const particles = [];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = Math.random() * 6 + 2;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        life: 60,
      });
    }
    
    return {
      id: Date.now() + Math.random(),
      x,
      y,
      particles,
    };
  }, [config.colors]);

  // 更新粒子位置和效果
  const updateParticles = useCallback((prevParticles: PoopParticle[]): PoopParticle[] => {
    return prevParticles.map(particle => {
      // 更新軌跡
      const newTrail = [...particle.trail, { x: particle.x, y: particle.y }];
      if (newTrail.length > 10) newTrail.shift();

      const newLife = particle.life - 16;
      const lifeRatio = newLife / particle.maxLife;

      return {
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.98, // 空氣阻力
        vy: particle.vy * 0.98 + 0.2, // 重力
        rotation: particle.rotation + particle.rotationSpeed,
        scale: Math.max(0.1, particle.scale + particle.scaleSpeed),
        opacity: Math.max(0, lifeRatio),
        trail: newTrail,
        life: newLife,
      };
    }).filter(particle => particle.life > 0 && particle.opacity > 0.01);
  }, []);

  // 更新煙火
  const updateFireworks = useCallback((prevFireworks: Firework[]): Firework[] => {
    return prevFireworks.map(firework => ({
      ...firework,
      particles: firework.particles.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.1,
        life: p.life - 1,
      })).filter(p => p.life > 0),
    })).filter(firework => firework.particles.length > 0);
  }, []);

  // 屏幕震動效果
  const triggerShake = useCallback((intensity: number) => {
    setShakeIntensity(intensity);
    setTimeout(() => setShakeIntensity(0), 500);
  }, []);

  // 閃光效果
  const triggerFlash = useCallback((color: string) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(''), 200);
  }, []);

  useEffect(() => {
    const phases = [
      { phase: 'intro', duration: 1500 },
      { phase: 'buildup', duration: 1000 },
      { phase: 'explosion', duration: 2000 },
      { phase: 'finale', duration: 1500 },
    ];

    let currentIndex = 0;
    
    const phaseTimer = () => {
      if (currentIndex < phases.length) {
        const currentPhaseData = phases[currentIndex];
        setCurrentPhase(currentPhaseData.phase as any);
        
        if (currentPhaseData.phase === 'buildup') {
          triggerShake(5);
        } else if (currentPhaseData.phase === 'explosion') {
          setShowMessage(false);
          setIsAnimating(true);
          setParticles(createParticles());
          triggerShake(15);
          triggerFlash(rarityColor);
          
          // 播放音效
          soundManager.playAttackSound(attack.itemUsed.type);
          
          // 創建多個煙火
          setTimeout(() => {
            for (let i = 0; i < 5; i++) {
              setTimeout(() => {
                setFireworks(prev => [...prev, createFirework(
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerHeight * 0.7
                )]);
              }, i * 300);
            }
          }, 500);
        }
        
        currentIndex++;
        if (currentIndex < phases.length) {
          setTimeout(phaseTimer, currentPhaseData.duration);
        } else {
          setTimeout(onComplete, 1000);
        }
      }
    };

    phaseTimer();
  }, [createParticles, createFirework, rarityColor, triggerShake, triggerFlash, onComplete]);

  useEffect(() => {
    if (!isAnimating) return;

    const animationInterval = setInterval(() => {
      setParticles(updateParticles);
      setFireworks(updateFireworks);
    }, 16); // 60 FPS

    return () => clearInterval(animationInterval);
  }, [isAnimating, updateParticles, updateFireworks]);

  if (!showMessage && !isAnimating && currentPhase === 'intro') return null;

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      style={{
        transform: `translate(${(Math.random() - 0.5) * shakeIntensity}px, ${(Math.random() - 0.5) * shakeIntensity}px)`,
      }}
    >
      {/* 動態背景 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} transition-opacity duration-1000`} 
           style={{ opacity: isAnimating ? 0.4 : 0.2 }} />
      
      {/* 背景粒子效果 */}
      {isAnimating && (
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 10}px`,
                animation: `poopRain ${Math.random() * 3 + 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {config.emojis[Math.floor(Math.random() * config.emojis.length)]}
            </div>
          ))}
        </div>
      )}
      
      {/* 脈衝波效果 */}
      {currentPhase === 'explosion' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute border-4 rounded-full"
              style={{
                borderColor: rarityColor,
                width: `${(i + 1) * 200}px`,
                height: `${(i + 1) * 200}px`,
                animation: `fireworkBurst ${2 + i * 0.5}s ease-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* 閃光效果 */}
      {flashColor && (
        <div 
          className="absolute inset-0 animate-ping"
          style={{ backgroundColor: flashColor, opacity: 0.6 }}
        />
      )}
      
      {/* 攻擊訊息 */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center transform transition-all duration-500"
            style={{
              animation: currentPhase === 'buildup' ? 'bounce 0.5s infinite' : 'pulse 2s infinite',
              borderColor: rarityColor,
              borderWidth: '4px',
              boxShadow: `0 0 30px ${rarityColor}`,
            }}
          >
            <div 
              className="text-8xl mb-6 animate-spin"
              style={{ animationDuration: '2s' }}
            >
              {attack.itemUsed.icon}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              💥 便便攻擊來襲！💥
            </h2>
            <p className="text-xl text-gray-600 mb-3">
              <span className="font-bold text-purple-600">{attack.fromUserName}</span> 向你發射了
            </p>
            <p 
              className="text-2xl font-bold mb-4"
              style={{ color: rarityColor }}
            >
              {attack.itemUsed.name}
            </p>
            {attack.message && (
              <p className="text-lg text-gray-500 italic bg-gray-100 p-3 rounded-lg">
                💬 "{attack.message}"
              </p>
            )}
            {currentPhase === 'buildup' && (
              <div className="mt-4 text-red-500 font-bold text-xl animate-pulse">
                ⚠️ 準備衝擊！⚠️
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 粒子動畫 */}
      {isAnimating && particles.map(particle => (
        <div key={particle.id}>
          {/* 粒子軌跡 */}
          {particle.trail.map((point, index) => (
            <div
              key={index}
              className="absolute pointer-events-none"
              style={{
                left: point.x,
                top: point.y,
                width: '4px',
                height: '4px',
                backgroundColor: particle.color,
                borderRadius: '50%',
                opacity: (index / particle.trail.length) * particle.opacity * 0.5,
              }}
            />
          ))}
          
          {/* 主粒子 */}
          <div
            className={`absolute pointer-events-none select-none ${
              attack.itemUsed.type === 'rainbow_poop' ? 'rainbow-pulse' : ''
            } ${
              attack.itemUsed.type === 'golden_poop' ? 'golden-shimmer' : ''
            }`}
            style={{
              left: particle.x,
              top: particle.y,
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
              opacity: particle.opacity,
              fontSize: '3rem',
              textShadow: `0 0 15px ${particle.color}, 0 0 30px ${particle.color}`,
              filter: `drop-shadow(0 0 8px ${particle.color}) brightness(1.2)`,
            }}
          >
            {particle.emoji}
          </div>
        </div>
      ))}
      
      {/* 煙火效果 */}
      {fireworks.map(firework => (
        <div key={firework.id}>
          {firework.particles.map((particle, index) => (
            <div
              key={index}
              className="absolute pointer-events-none"
              style={{
                left: particle.x,
                top: particle.y,
                width: '6px',
                height: '6px',
                backgroundColor: particle.color,
                borderRadius: '50%',
                opacity: particle.life / 60,
                boxShadow: `0 0 10px ${particle.color}`,
              }}
            />
          ))}
        </div>
      ))}
      
      {/* 特殊效果層 */}
      {isAnimating && (
        <>
          {effect.type === 'poop_tornado' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="poop-tornado text-9xl opacity-90" style={{ 
                textShadow: '0 0 30px #8B4513, 0 0 60px #8B4513',
                filter: 'drop-shadow(0 0 20px #8B4513)'
              }}>
                🌪️
              </div>
              {/* 龍捲風粒子 */}
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl opacity-70"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${i * 18}deg) translateY(-${100 + i * 10}px)`,
                    animation: `spin ${0.5 + i * 0.1}s linear infinite`,
                  }}
                >
                  💩
                </div>
              ))}
            </div>
          )}
          
          {effect.type === 'poop_explosion' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="poop-explosion text-9xl opacity-90" style={{
                textShadow: '0 0 40px #FF4500, 0 0 80px #FF4500',
                filter: 'drop-shadow(0 0 25px #FF4500)'
              }}>
                💥
              </div>
              {/* 爆炸波紋 */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute border-4 border-orange-500 rounded-full opacity-60"
                  style={{
                    width: `${(i + 1) * 100}px`,
                    height: `${(i + 1) * 100}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: `fireworkBurst ${1 + i * 0.2}s ease-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
          
          {effect.type === 'golden_shower' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="golden-shimmer text-9xl opacity-90" style={{ 
                color: '#FFD700',
                textShadow: '0 0 50px #FFD700, 0 0 100px #FFD700',
                filter: 'drop-shadow(0 0 30px #FFD700)'
              }}>
                ✨
              </div>
              {/* 金色光芒 */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-70"
                  style={{
                    width: '4px',
                    height: '200px',
                    left: '50%',
                    top: '50%',
                    transformOrigin: 'center bottom',
                    transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                    animation: 'pulse 1s ease-in-out infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* 邊框光效 */}
      {isAnimating && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            border: `4px solid ${rarityColor}`,
            borderRadius: '20px',
            boxShadow: `inset 0 0 50px ${rarityColor}, 0 0 50px ${rarityColor}`,
            animation: 'pulse 1s infinite',
          }}
        />
      )}
    </div>
  );
};