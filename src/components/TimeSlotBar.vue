<template>
  <div class="time-slot-bar">
    <div class="slots-track">
      <div
        v-for="slot in TIME_SLOTS"
        :key="slot.id"
        class="slot-item"
        :class="{ active: store.selectedTimeSlot?.id === slot.id, premium: slot.isPremium }"
        @click="selectTimeSlot(slot)"
      >
        <div class="slot-sky-icon">{{ getSkyIcon(slot.skyPhase) }}</div>
        <div class="slot-name">{{ slot.name }}</div>
        <div class="slot-time">{{ slot.time }}</div>
        <div class="slot-price" :class="{ high: slot.priceFactor > 1, low: slot.priceFactor < 1 }">
          {{ slot.priceFactor === 1 ? '标准价' : `x${slot.priceFactor}` }}
        </div>
        <div v-if="slot.isPremium" class="premium-badge">热门</div>
      </div>
    </div>
    <div class="sky-indicator-bar">
      <div class="sky-gradient-track"></div>
      <div class="current-marker" :style="markerStyle">
        <div class="marker-dot"></div>
        <div class="marker-label">{{ store.selectedTimeSlot?.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TIME_SLOTS } from '../data/seatsData'
import { store, selectTimeSlot } from '../store/bookingStore'

const skyIcons = {
  afternoon: '☀️',
  sunset: '🌇',
  blue: '🌆',
  night: '🌃',
  latenight: '🌙'
}

function getSkyIcon(phase) {
  return skyIcons[phase] || '✨'
}

const markerStyle = computed(() => {
  const idx = TIME_SLOTS.findIndex(s => s.id === store.selectedTimeSlot?.id)
  const pct = idx >= 0 ? (idx + 0.5) * (100 / TIME_SLOTS.length) : 50
  return { left: `${pct}%` }
})
</script>

<style scoped>
.time-slot-bar {
  background: rgba(15, 20, 35, 0.8);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 14px;
  border: 1px solid rgba(255, 180, 100, 0.12);
}

.slots-track {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.slot-item {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 10px 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slot-item:hover {
  background: rgba(255, 140, 66, 0.08);
  border-color: rgba(255, 140, 66, 0.3);
  transform: translateY(-2px);
}

.slot-item.active {
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.25), rgba(255, 92, 138, 0.2));
  border-color: #ff8c42;
  box-shadow: 0 4px 20px rgba(255, 140, 66, 0.25);
}

.slot-item.premium::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ffd700, #ff8c42, #ff5c8a);
  border-radius: 12px 12px 0 0;
}

.slot-sky-icon {
  font-size: 22px;
  margin-bottom: 4px;
}

.slot-name {
  font-size: 12px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.slot-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.slot-price {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  display: inline-block;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
}

.slot-price.high {
  color: #ff8c42;
  background: rgba(255, 140, 66, 0.15);
}

.slot-price.low {
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}

.premium-badge {
  position: absolute;
  top: -6px;
  right: -4px;
  background: linear-gradient(135deg, #ffd700, #ff8c42);
  color: #1a0e00;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 6px;
}

.sky-indicator-bar {
  position: relative;
  height: 20px;
}

.sky-gradient-track {
  position: absolute;
  inset: 6px 0;
  border-radius: 10px;
  background: linear-gradient(90deg,
    #87CEEB 0%,
    #B0E0E6 15%,
    #ff8c42 35%,
    #c94b6a 50%,
    #4a6fa5 65%,
    #1a1f3a 80%,
    #0a0e1a 100%
  );
  opacity: 0.6;
}

.current-marker {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: left 0.5s ease;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  border: 3px solid #ff8c42;
  box-shadow: 0 0 12px rgba(255, 140, 66, 0.6);
}

.marker-label {
  margin-top: 2px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}
</style>
