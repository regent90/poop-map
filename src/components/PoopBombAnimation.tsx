import React, { useEffect, useState, useCallback } from 'react';
import { PoopBombEffect, PoopAttack } from '../types';
import { POOP_BOMB_EFFECTS, RARITY_COLORS, POOP_ITEM_CONFIGS } from '../config/poopItems';
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
  imageUrl: string; // 改用圖片路徑
  opacity: number;
  color: string;
  trail: { x: number; y: number }[];
  life: number;
  maxLife: number;
  bounceCount: number;
  wigglePhase: number;
  cuteness: number;
  isGiggling: boolean;
  heartBeat: number;
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
  const itemImageUrl = POOP_ITEM_CONFIGS[attack.itemUsed.type]?.imageUrl;

  // 顏色配置 - 這是唯一保留的部分，用於光效和軌跡
  const getEffectConfig = (type: string) => {
    switch (type) {
      case 'golden_poop':
        return {
          colors: ['#FFD700', '#FFA500', '#FFFF00', '#FF69B4'],
          bgGradient: 'from-yellow-400 via-pink-400 to-orange-500',
        };
      case 'rainbow_poop':
        return {
          colors: ['#FF69B4', '#FF1493', '#00CED1', '#32CD32', '#FFD700', '#FF6347'],
          bgGradient: 'from-pink-400 via-purple-400 to-blue-400',
        };
      case 'stinky_poop':
        return {
          colors: ['#8B4513', '#654321', '#2F4F2F', '#800080', '#228B22'],
          bgGradient: 'from-green-600 via-brown-600 to-purple-900',
        };
      default:
        return {
          colors: ['#8B4513', '#A0522D', '#D2691E', '#FF69B4'],
          bgGradient: 'from-brown-400 via-orange-400 to-pink-400',
        };
    }
  };

  const config = getEffectConfig(attack.itemUsed.type);

  // 創建 3D 圖片粒子
  const createParticles = useCallback((): PoopParticle[] => {
    const newParticles: PoopParticle[] = [];

    // 如果找不到圖片，就不生成粒子 (避免報錯)
    if (!itemImageUrl) return [];

    for (let i = 0; i < effect.particles; i++) {
      const angle = (Math.PI * 2 * i) / effect.particles + Math.random() * 0.5;
      const speed = Math.random() * 6 + 3;
      const life = Math.random() * 4000 + 3000;

      newParticles.push({
        id: i,
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        scale: Math.random() * 0.5 + 0.2, // 粒子圖示小一點
        scaleSpeed: (Math.random() - 0.5) * 0.01,
        imageUrl: itemImageUrl, // 使用道具圖片
        opacity: 1,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        trail: [],
        life: life,
        maxLife: life,
        bounceCount: 0,
        wigglePhase: Math.random() * Math.PI * 2,
        cuteness: Math.random() * 0.5 + 0.5,
        isGiggling: Math.random() > 0.7,
        heartBeat: 0,
      });
    }

    return newParticles;
  }, [effect.particles, config, itemImageUrl]);

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

  // 更新粒子位置和醜萌效果
  const updateParticles = useCallback((prevParticles: PoopParticle[]): PoopParticle[] => {
    return prevParticles.map(particle => {
      // 更新軌跡
      const newTrail = [...particle.trail, { x: particle.x, y: particle.y }];
      if (newTrail.length > 8) newTrail.shift(); // 稍微短一點的軌跡

      const newLife = particle.life - 16;
      const lifeRatio = newLife / particle.maxLife;

      // 醜萌的搖擺效果
      const wiggleX = Math.sin(particle.wigglePhase) * particle.cuteness * 2;
      const wiggleY = Math.cos(particle.wigglePhase * 0.7) * particle.cuteness * 1;

      // 彈跳效果
      let newVy = particle.vy;
      let newBounceCount = particle.bounceCount;
      if (particle.y > window.innerHeight - 100 && particle.vy > 0 && particle.bounceCount < 3) {
        newVy = -Math.abs(particle.vy) * 0.6; // 彈跳，但每次減弱
        newBounceCount++;
      }

      // 心跳效果
      const heartBeat = Math.sin(Date.now() * 0.01 + particle.id) * 0.1 + 1;

      // 咯咯笑效果（輕微震動）
      const giggleX = particle.isGiggling ? Math.sin(Date.now() * 0.02 + particle.id) * 1 : 0;
      const giggleY = particle.isGiggling ? Math.cos(Date.now() * 0.03 + particle.id) * 0.5 : 0;

      return {
        ...particle,
        x: particle.x + particle.vx + wiggleX + giggleX,
        y: particle.y + newVy + wiggleY + giggleY,
        vx: particle.vx * 0.99, // 稍微少一點的空氣阻力，讓它們飄得更久
        vy: newVy * 0.99 + 0.15, // 稍微輕一點的重力
        rotation: particle.rotation + particle.rotationSpeed * particle.cuteness,
        scale: Math.max(0.2, (particle.scale + particle.scaleSpeed) * heartBeat),
        opacity: Math.max(0, lifeRatio * (0.8 + particle.cuteness * 0.2)),
        trail: newTrail,
        life: newLife,
        bounceCount: newBounceCount,
        wigglePhase: particle.wigglePhase + 0.1,
        heartBeat: heartBeat,
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

      {/* 醜萌背景粒子效果 */}
      {isAnimating && (
        <div className="absolute inset-0">
          {/* 飄落的便便和愛心 - 簡化為飄落的裝飾 */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`poop-${i}`}
              className="absolute opacity-40 mix-blend-overlay"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 15 + 15}px`,
                animation: `cuteFloat ${Math.random() * 4 + 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {/* 只保留星星和愛心作為裝飾 */}
              {['💖', '✨', '🌟', '💫', '⚪'][Math.floor(Math.random() * 5)]}
            </div>
          ))}

          {/* 彩虹泡泡效果 */}
          {attack.itemUsed.type === 'rainbow_poop' && Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`bubble-${i}`}
              className="absolute rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 30 + 10}px`,
                background: `linear-gradient(45deg, ${config.colors[i % config.colors.length]}, rgba(255, 255, 255, 0.3))`,
                animation: `cuteBounce ${Math.random() * 2 + 1}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
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

      {/* 醜萌攻擊訊息 */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="bg-gradient-to-br from-pink-100 via-white to-yellow-100 rounded-3xl p-8 shadow-2xl max-w-md mx-4 text-center transform transition-all duration-500 border-4"
            style={{
              animation: currentPhase === 'buildup' ? 'bounce 0.5s infinite' : 'pulse 2s infinite',
              borderColor: rarityColor,
              boxShadow: `0 0 40px ${rarityColor}, inset 0 0 20px rgba(255, 192, 203, 0.3)`,
            }}
          >
            {/* 裝飾性愛心 */}
            <div className="absolute -top-4 -left-4 text-pink-400 text-2xl animate-pulse">💖</div>
            <div className="absolute -top-4 -right-4 text-pink-400 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>💖</div>

            <div
              className="mb-6 relative flex justify-center"
              style={{
                animation: currentPhase === 'buildup' ? 'bounce 0.3s infinite' : 'spin 3s linear infinite',
              }}
            >
              {/* 替換原本的 Emoji 為圖片 */}
              {POOP_ITEM_CONFIGS[attack.itemUsed.type]?.imageUrl ? (
                <img
                  src={POOP_ITEM_CONFIGS[attack.itemUsed.type].imageUrl}
                  alt={attack.itemUsed.name}
                  className="w-32 h-32 object-contain drop-shadow-2xl rounded-full"
                  style={{
                    filter: `drop-shadow(0 0 10px ${rarityColor})`,
                  }}
                />
              ) : (
                <span className="text-8xl">{attack.itemUsed.icon}</span>
              )}

              {/* 閃爍星星 */}
              <div className="absolute -top-2 -right-2 text-2xl animate-ping">✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-ping" style={{ animationDelay: '0.3s' }}>⭐</div>
            </div>

            <h2 className="text-3xl font-bold mb-3" style={{
              background: `linear-gradient(45deg, ${rarityColor}, #FF69B4, ${rarityColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
              animation: 'gradient 2s ease infinite'
            }}>
              💩✨ 超萌便便攻擊來襲！✨💩
            </h2>

            <div className="mb-4 p-3 bg-pink-50 rounded-2xl border-2 border-pink-200">
              <p className="text-lg text-gray-700 mb-2">
                <span className="font-bold text-purple-600">{attack.fromUserName}</span>
                <span className="text-pink-500"> (◕‿◕) </span>
                向你發射了
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: rarityColor }}
              >
                {attack.itemUsed.name}
              </p>
            </div>

            {attack.message && (
              <div className="bg-gradient-to-r from-yellow-100 to-pink-100 p-4 rounded-2xl border-2 border-yellow-200 mb-4">
                <p className="text-lg text-gray-600 italic">
                  💬 "{attack.message}"
                </p>
                <div className="text-sm text-pink-500 mt-2">(´∀｀)♡</div>
              </div>
            )}

            {currentPhase === 'buildup' && (
              <div className="mt-4 p-3 bg-red-100 rounded-2xl border-2 border-red-300">
                <div className="text-red-500 font-bold text-xl animate-bounce">
                  ⚠️ 萌萌衝擊準備中！⚠️
                </div>
                <div className="text-sm text-red-400 mt-1">{'(>_<)'}</div>
              </div>
            )}

            {/* 底部裝飾 */}
            <div className="flex justify-center space-x-2 mt-4">
              <span className="text-2xl animate-bounce">🌟</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>💫</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>💖</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</span>
            </div>
          </div>
        </div>
      )}

      {/* 粒子動畫 - 改為渲染圖片 */}
      {isAnimating && particles.map(particle => (
        <div key={particle.id}>
          {/* 粒子軌跡 - 保持用 CSS 繪製的光點，這樣比較好看 */}
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

          {/* 3D 圖片粒子 */}
          <div
            className={`absolute pointer-events-none select-none ${attack.itemUsed.type === 'rainbow_poop' ? 'rainbow-pulse' : ''
              } ${attack.itemUsed.type === 'golden_poop' ? 'golden-shimmer' : ''
              }`}
            style={{
              left: particle.x - 40, // Adjust for image center (assuming 80px width)
              top: particle.y - 40,  // Adjust for image center (assuming 80px height)
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
              opacity: particle.opacity,
              width: '80px', // 固定圖片大小
              height: '80px',
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* 使用 img 標籤渲染 3D 圖片 */}
            <img
              src={particle.imageUrl}
              alt="particle"
              className="w-full h-full object-contain drop-shadow-lg"
              style={{
                filter: `drop-shadow(0 0 5px ${particle.color})`, // 為圖片加上對應顏色的光暈
              }}
            />
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