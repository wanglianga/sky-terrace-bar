<template>
  <div class="sky-background" :style="skyStyle">
    <div class="stars" v-if="showStars">
      <div v-for="i in 80" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>
    <div class="sun" v-if="showSun" :style="sunStyle"></div>
    <div class="moon" v-if="showMoon" :style="moonStyle">
      <div class="moon-crater c1"></div>
      <div class="moon-crater c2"></div>
      <div class="moon-crater c3"></div>
    </div>
    <div class="clouds-layer">
      <div class="cloud cloud1" :style="cloudStyle(1)"></div>
      <div class="cloud cloud2" :style="cloudStyle(2)"></div>
      <div class="cloud cloud3" :style="cloudStyle(3)"></div>
    </div>
    <div class="horizon-glow" :style="horizonGlowStyle"></div>
    <div class="city-silhouette">
      <svg viewBox="0 0 1200 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient :id="'cityGrad'" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :style="{ stopColor: cityTopColor }" />
            <stop offset="100%" :style="{ stopColor: cityBottomColor }" />
          </linearGradient>
        </defs>
        <path d="M0,200 L0,140 L40,140 L40,110 L80,110 L80,150 L120,150 L120,80 L160,80 L160,130 L200,130 L200,60 L240,60 L240,40 L280,40 L280,90 L320,90 L320,140 L360,140 L360,70 L400,70 L400,100 L440,100 L440,50 L480,50 L480,120 L520,120 L520,85 L560,85 L560,150 L600,150 L600,95 L640,95 L640,75 L680,75 L680,55 L720,55 L720,130 L760,130 L760,110 L800,110 L800,65 L840,65 L840,145 L880,145 L880,90 L920,90 L920,70 L960,70 L960,125 L1000,125 L1000,80 L1040,80 L1040,140 L1080,140 L1080,105 L1120,105 L1120,135 L1160,135 L1160,150 L1200,150 L1200,200 Z"
              :fill="`url(#cityGrad)`" />
      </svg>
      <div class="building-lights" :style="{ opacity: lightOpacity }">
        <div v-for="i in 60" :key="'l'+i" class="window-light" :style="getWindowLightStyle(i)"></div>
      </div>
    </div>
    <div class="terrace-floor">
      <div class="wood-pattern"></div>
      <div class="ambient-lights">
        <div v-for="i in 12" :key="'al'+i" class="ambient-light" :style="getAmbientLightStyle(i)"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getSkyPhase, store } from '../store/bookingStore'

const skyColors = {
  afternoon: { top: '#87CEEB', mid: '#B0E0E6', bottom: '#FFE4B5', sun: '#FFD700', sunY: 15 },
  sunset: { top: '#2d1b4e', mid: '#c94b6a', bottom: '#ff8c42', sun: '#FF6B35', sunY: 55 },
  blue: { top: '#1a1f3a', mid: '#4a6fa5', bottom: '#6e88a6', sun: '#FF8C42', sunY: 75 },
  night: { top: '#0a0e1a', mid: '#1a1f3a', bottom: '#2d1b4e', sun: null, sunY: 100 },
  latenight: { top: '#050a14', mid: '#0d1321', bottom: '#1a1033', sun: null, sunY: 100 }
}

const currentPhase = computed(() => skyColors[getSkyPhase.value] || skyColors.sunset)

const skyStyle = computed(() => ({
  background: `linear-gradient(180deg, ${currentPhase.value.top} 0%, ${currentPhase.value.mid} 45%, ${currentPhase.value.bottom} 85%)`
}))

const showSun = computed(() => currentPhase.value.sun !== null)
const showMoon = computed(() => ['night', 'latenight'].includes(getSkyPhase.value))
const showStars = computed(() => ['blue', 'night', 'latenight'].includes(getSkyPhase.value))

const sunStyle = computed(() => showSun.value ? {
  background: `radial-gradient(circle, ${currentPhase.value.sun} 0%, rgba(255,200,100,0.6) 40%, transparent 70%)`,
  bottom: `${100 - currentPhase.value.sunY}%`
} : {})

const moonStyle = computed(() => ({
  bottom: getSkyPhase.value === 'night' ? '65%' : '55%'
}))

const lightOpacity = computed(() => {
  const map = { afternoon: 0, sunset: 0.3, blue: 0.7, night: 1, latenight: 1 }
  return map[getSkyPhase.value] || 0.3
})

const cityTopColor = computed(() => {
  const map = { afternoon: '#4a5568', sunset: '#2d3748', blue: '#1a202c', night: '#0d1117', latenight: '#050810' }
  return map[getSkyPhase.value] || '#2d3748'
})

const cityBottomColor = computed(() => {
  const map = { afternoon: '#2d3748', sunset: '#1a202c', blue: '#0d1117', night: '#050810', latenight: '#020408' }
  return map[getSkyPhase.value] || '#1a202c'
})

const horizonGlowStyle = computed(() => {
  if (getSkyPhase.value === 'sunset') {
    return { background: 'radial-gradient(ellipse at 50% 80%, rgba(255,140,66,0.5) 0%, rgba(255,107,53,0.2) 30%, transparent 60%)' }
  }
  if (getSkyPhase.value === 'blue') {
    return { background: 'radial-gradient(ellipse at 50% 70%, rgba(74,111,165,0.4) 0%, transparent 50%)' }
  }
  return {}
})

function getStarStyle(i) {
  const seed = i * 137.5
  return {
    left: `${(seed * 7) % 100}%`,
    top: `${(seed * 3) % 50}%`,
    width: `${1 + (i % 3)}px`,
    height: `${1 + (i % 3)}px`,
    animationDelay: `${(i * 0.3) % 3}s`,
    opacity: 0.5 + (i % 5) * 0.1
  }
}

function cloudStyle(i) {
  const baseOpacities = { afternoon: 0.7, sunset: 0.4, blue: 0.2, night: 0.05, latenight: 0.02 }
  return {
    top: `${10 + i * 8}%`,
    left: `${-10 + i * 5}%`,
    opacity: baseOpacities[getSkyPhase.value] || 0.4,
    animationDuration: `${60 + i * 20}s`
  }
}

function getWindowLightStyle(i) {
  const seed = i * 73
  return {
    left: `${(seed * 11) % 98}%`,
    top: `${50 + (seed * 7) % 40}%`,
    width: `${2 + (i % 2) * 2}px`,
    height: `${3 + (i % 3) * 2}px`,
    animationDelay: `${(i * 0.7) % 5}s`,
    opacity: 0.7 + (i % 3) * 0.1
  }
}

function getAmbientLightStyle(i) {
  const positions = [
    { left: 5, top: 20 }, { left: 20, top: 10 }, { left: 35, top: 25 }, { left: 50, top: 5 },
    { left: 65, top: 20 }, { left: 80, top: 15 }, { left: 92, top: 30 }, { left: 10, top: 70 },
    { left: 30, top: 85 }, { left: 55, top: 75 }, { left: 75, top: 88 }, { left: 90, top: 65 }
  ]
  const pos = positions[i % positions.length]
  return {
    left: `${pos.left}%`,
    top: `${pos.top}%`,
    color: getSkyPhase.value === 'afternoon' ? '#fff4d6' : getSkyPhase.value === 'sunset' ? '#ffb366' : '#ffd700'
  }
}
</script>

<style scoped>
.sky-background {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 0;
  transition: background 3s ease;
}

.stars {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
  box-shadow: 0 0 4px white;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.sun {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  transition: bottom 3s ease, background 2s ease;
}

.moon {
  position: absolute;
  right: 15%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f5dc 0%, #ddd8c4 100%);
  box-shadow: 0 0 40px rgba(245, 245, 220, 0.4), inset -8px -8px 15px rgba(0,0,0,0.1);
  transition: bottom 3s ease;
}

.moon-crater {
  position: absolute;
  border-radius: 50%;
  background: rgba(180, 170, 150, 0.3);
}
.c1 { width: 18px; height: 18px; top: 15px; left: 20px; }
.c2 { width: 12px; height: 12px; top: 40px; left: 45px; }
.c3 { width: 10px; height: 10px; top: 55px; left: 25px; }

.clouds-layer {
  position: absolute;
  inset: 0;
}

.cloud {
  position: absolute;
  width: 200px;
  height: 60px;
  background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 100%);
  border-radius: 100px;
  filter: blur(2px);
  animation: cloudDrift linear infinite;
}

.cloud1::before, .cloud2::before, .cloud3::before {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}
.cloud1::before { width: 80px; height: 80px; top: -30px; left: 30px; }
.cloud2::before { width: 60px; height: 60px; top: -25px; left: 60px; }
.cloud3::before { width: 70px; height: 70px; top: -28px; left: 100px; }

@keyframes cloudDrift {
  0% { transform: translateX(-200px); }
  100% { transform: translateX(calc(100vw + 400px)); }
}

.horizon-glow {
  position: absolute;
  left: 0; right: 0;
  height: 50%;
  bottom: 15%;
  transition: background 2s ease;
}

.city-silhouette {
  position: absolute;
  bottom: 22%;
  left: 0; right: 0;
  height: 18%;
}

.city-silhouette svg {
  width: 100%;
  height: 100%;
}

.building-lights {
  position: absolute;
  inset: 0;
  transition: opacity 2s ease;
}

.window-light {
  position: absolute;
  background: #ffeb99;
  border-radius: 1px;
  box-shadow: 0 0 4px #ffd700;
  animation: windowFlicker 4s ease-in-out infinite;
}

@keyframes windowFlicker {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.6; }
}

.terrace-floor {
  position: absolute;
  bottom: 0;
  left: 0; right: 0;
  height: 22%;
  background: linear-gradient(180deg, #3d2b1f 0%, #2a1f14 100%);
  overflow: hidden;
}

.wood-pattern {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(139, 105, 20, 0.15) 0px,
    rgba(139, 105, 20, 0.15) 2px,
    transparent 2px,
    transparent 40px
  );
}

.ambient-lights {
  position: absolute;
  inset: 0;
}

.ambient-light {
  position: absolute;
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  box-shadow: 0 0 15px currentColor, 0 0 30px currentColor;
  animation: ambientPulse 2s ease-in-out infinite;
}

@keyframes ambientPulse {
  0%, 100% { opacity: 0.6; box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; }
  50% { opacity: 1; box-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }
}
</style>
