<template>
  <div class="seat-map-container" :class="{ 'staff-mode': staffMode }">
    <div v-if="store.rainCoverOpen && !currentZone?.isIndoor" class="rain-cover-indicator" :class="{ open: store.rainCoverOpen }">
      <span class="rain-icon">☂️</span>
      <span>雨棚已展开</span>
    </div>
    <div class="zone-label" :style="{ color: currentZone?.color }">
      <div class="zone-title">
        <span class="zone-name">{{ currentZone?.name }}</span>
        <span class="zone-direction" v-if="!currentZone?.isIndoor">{{ currentZone?.direction }} · 视野指数 {{ currentZone?.citySkyline }}</span>
      </div>
      <div class="zone-stats">
        <span v-if="!currentZone?.isIndoor">🌬️ 风力: {{ currentZone?.windLevel }}</span>
        <span>💺 空位: {{ zoneAvailableCount }}</span>
        <span v-if="currentZone?.premium">⭐  premium区</span>
      </div>
    </div>
    <div class="terrace-area" :class="{ indoor: currentZone?.isIndoor }">
      <div v-if="!currentZone?.isIndoor" class="railing-edge">
        <div class="glass-panel" v-for="i in 12" :key="i"></div>
      </div>
      <div class="seats-layer">
        <div
          v-for="seat in zoneSeats"
          :key="seat.id"
          class="seat-block"
          :class="getSeatClasses(seat)"
          :style="getSeatStyle(seat)"
          @click="handleSeatClick(seat)"
        >
          <div class="seat-icon">{{ getSeatIcon(seat.type) }}</div>
          <div class="seat-label">{{ seat.name }}</div>
          <div class="seat-capacity">
            <span>👤</span> {{ seat.capacity }}
          </div>
          <div class="seat-price">¥{{ getSeatEffectivePrice(seat) }}</div>
          <div class="seat-warnings">
            <span v-if="seat.hasOcclusionRisk" class="warn-tag" title="部分视野有遮挡">⚠️</span>
            <span v-if="seat.windFactor > 1" class="wind-tag" title="风力较强">💨</span>
          </div>
          <div v-if="seat._combined" class="combined-badge">拼桌</div>
          <div v-if="staffMode && seat.status === 'held'" class="held-timer">
            {{ getHoldTimeLeft(seat) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { store, seatsByZone, selectZone, toggleSeatSelection, getSeatEffectivePrice } from '../store/bookingStore'
import { SEAT_TYPES, ZONES } from '../data/seatsData'

const props = defineProps({
  zoneId: { type: String, required: true },
  staffMode: { type: Boolean, default: false }
})

const emit = defineEmits(['seat-click'])

const currentZone = computed(() => ZONES.find(z => z.id === props.zoneId))

const zoneSeats = computed(() => {
  let seats = seatsByZone.value[props.zoneId] || []
  if (store.filterType) {
    seats = seats.filter(s => s.type === store.filterType)
  }
  if (store.filterCapacity) {
    seats = seats.filter(s => s.capacity >= store.filterCapacity)
  }
  return seats
})

const zoneAvailableCount = computed(() => (seatsByZone.value[props.zoneId] || []).filter(s => s.status === 'available').length)

function getSeatClasses(seat) {
  return {
    [`type-${seat.type}`]: true,
    [`status-${seat.status}`]: true,
    selected: store.selectedSeatIds.includes(seat.id),
    premium: seat.type === 'vip' || seat.type === 'railing',
    occluded: seat.hasOcclusionRisk,
    movable: props.staffMode && !store.getSkyPhase?.()
  }
}

function getSeatStyle(seat) {
  const zone = currentZone.value
  return {
    left: `${seat.x}%`,
    top: `${seat.y}%`,
    width: `${seat.width}%`,
    height: `${seat.height}%`,
    '--seat-color': zone?.color || '#ff6b35',
    '--seat-glow': seat.hasOcclusionRisk ? 'rgba(255,100,100,0.3)' : `rgba(${hexToRgb(zone?.color || '#ff6b35')},0.4)`
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '255,107,53'
}

function getSeatIcon(type) {
  const t = SEAT_TYPES.find(x => x.id === type)
  return t?.icon || '🪑'
}

function handleSeatClick(seat) {
  if (props.staffMode) {
    emit('seat-click', seat)
  } else {
    toggleSeatSelection(seat.id)
    emit('seat-click', seat)
  }
}

function getHoldTimeLeft(seat) {
  if (!seat.heldUntil) return ''
  const left = new Date(seat.heldUntil) - Date.now()
  if (left <= 0) return '已过期'
  const mins = Math.floor(left / 60000)
  const secs = Math.floor((left % 60000) / 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.seat-map-container {
  position: relative;
  background: rgba(20, 15, 10, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 200, 150, 0.15);
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.rain-cover-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 16px;
  font-size: 12px;
  color: #6ee7b7;
  z-index: 10;
}

.zone-label {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.zone-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 6px;
}

.zone-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
}

.zone-direction {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.zone-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.terrace-area {
  position: relative;
  height: 380px;
  margin: 16px;
  border-radius: 14px;
  background:
    repeating-linear-gradient(
      45deg,
      rgba(139, 105, 20, 0.08) 0px,
      rgba(139, 105, 20, 0.08) 8px,
      rgba(139, 105, 20, 0.04) 8px,
      rgba(139, 105, 20, 0.04) 16px
    ),
    rgba(60, 45, 30, 0.5);
  border: 1px solid rgba(139, 105, 20, 0.2);
  overflow: hidden;
}

.terrace-area.indoor {
  background:
    repeating-linear-gradient(
      90deg,
      rgba(155, 89, 182, 0.06) 0px,
      rgba(155, 89, 182, 0.06) 10px,
      transparent 10px,
      transparent 20px
    ),
    rgba(45, 27, 78, 0.4);
  border-color: rgba(155, 89, 182, 0.2);
}

.railing-edge {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 18px;
  display: flex;
  gap: 2px;
  padding: 3px 8px;
  background: linear-gradient(180deg, rgba(100, 200, 255, 0.15) 0%, transparent 100%);
  border-bottom: 2px solid rgba(150, 200, 255, 0.25);
}

.glass-panel {
  flex: 1;
  background: linear-gradient(180deg, rgba(200, 230, 255, 0.18) 0%, rgba(150, 200, 255, 0.06) 100%);
  border: 1px solid rgba(200, 230, 255, 0.15);
  border-radius: 2px;
}

.seats-layer {
  position: absolute;
  inset: 24px 8px 8px 8px;
}

.seat-block {
  position: absolute;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: rgba(40, 35, 30, 0.85);
  border: 2px solid var(--seat-color);
  box-shadow: 0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
  transition: all 0.25s ease;
  user-select: none;
}

.seat-block:hover:not(.status-occupied) {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 25px var(--seat-glow), inset 0 1px 0 rgba(255,255,255,0.1);
  z-index: 5;
}

.seat-block.status-available {
  background: rgba(30, 40, 30, 0.8);
}

.seat-block.status-occupied {
  background: rgba(60, 20, 20, 0.85);
  border-color: rgba(239, 68, 68, 0.6);
  opacity: 0.7;
  cursor: not-allowed;
}

.seat-block.status-reserved {
  background: rgba(60, 50, 20, 0.85);
  border-color: rgba(245, 158, 11, 0.6);
  opacity: 0.75;
}

.seat-block.status-held {
  background: rgba(20, 40, 60, 0.85);
  border-color: rgba(59, 130, 246, 0.7);
  animation: heldPulse 2s ease-in-out infinite;
}

.seat-block.status-combined {
  background: rgba(20, 20, 50, 0.85);
  border-style: dashed;
  opacity: 0.4;
  cursor: not-allowed;
}

@keyframes heldPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
}

.seat-block.selected {
  background: rgba(60, 50, 20, 0.95);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 0 0 3px var(--seat-color), 0 10px 30px var(--seat-glow);
  z-index: 10;
}

.seat-block.premium {
  border-width: 3px;
  background: linear-gradient(135deg, rgba(60, 40, 20, 0.9) 0%, rgba(40, 30, 15, 0.9) 100%);
}

.seat-block.occluded {
  border-style: double;
}

.seat-icon {
  font-size: 18px;
  line-height: 1;
}

.seat-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 2px;
}

.seat-capacity {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 1px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.seat-price {
  font-size: 11px;
  font-weight: 700;
  color: var(--seat-color);
  margin-top: 2px;
}

.seat-warnings {
  position: absolute;
  top: 2px;
  right: 4px;
  display: flex;
  gap: 2px;
  font-size: 10px;
}

.warn-tag, .wind-tag {
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
}

.combined-badge {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 8px;
  white-space: nowrap;
}

.held-timer {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(59, 130, 246, 0.9);
  color: white;
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 6px;
  font-family: monospace;
}
</style>
