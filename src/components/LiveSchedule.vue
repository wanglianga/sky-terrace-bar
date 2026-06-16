<template>
  <div class="live-section">
    <div class="section-header">
      <h3 class="section-title">🎤 驻唱安排</h3>
      <div class="current-time" v-if="currentTimeSlot">{{ currentTimeSlot.time }}</div>
    </div>
    <div class="live-timeline">
      <div
        v-for="(item, idx) in LIVE_SCHEDULE"
        :key="idx"
        class="live-item"
        :class="{ active: isNowPlaying(item), upcoming: isUpcoming(item) }"
      >
        <div class="live-time-col">
          <div class="live-time">{{ item.time }}</div>
          <div class="live-duration">{{ item.duration }}分钟</div>
        </div>
        <div class="live-content">
          <div class="live-artist">{{ item.artist }}</div>
          <div class="live-meta">
            <span class="style-tag">{{ item.style }}</span>
            <span class="zone-tag">📍 {{ getZoneName(item.zone) }}</span>
          </div>
        </div>
        <div class="live-indicator">
          <div v-if="isNowPlaying(item)" class="now-playing">
            <div class="bars">
              <span></span><span></span><span></span>
            </div>
            <span class="playing-text">演出中</span>
          </div>
          <div v-else-if="isUpcoming(item)" class="upcoming-tag">即将开始</div>
          <div v-else class="played-tag">已结束</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { LIVE_SCHEDULE, ZONES } from '../data/seatsData'
import { store, currentTime } from '../store/bookingStore'

const currentTimeSlot = computed(() => store.selectedTimeSlot)

function getZoneName(zoneId) {
  return ZONES.find(z => z.id === zoneId)?.name || zoneId
}

function parseTime(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function isNowPlaying(item) {
  const slot = store.selectedTimeSlot
  if (!slot) return false
  const slotParts = slot.time.split(' - ')
  const start = parseTime(slotParts[0])
  const end = parseTime(slotParts[1])
  const itemStart = parseTime(item.time)
  const itemEnd = itemStart + item.duration
  return (start <= itemStart && itemStart < end) || (itemStart < start && itemEnd > start)
}

function isUpcoming(item) {
  const slot = store.selectedTimeSlot
  if (!slot) return false
  const slotParts = slot.time.split(' - ')
  const slotStart = parseTime(slotParts[0])
  const itemStart = parseTime(item.time)
  return itemStart > slotStart && itemStart < parseTime(slotParts[1])
}
</script>

<style scoped>
.live-section {
  padding: 14px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
  padding: 0 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.current-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.live-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.live-item {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.3s;
}

.live-item.active {
  background: linear-gradient(135deg, rgba(255, 92, 138, 0.12), rgba(255, 140, 66, 0.08));
  border-color: rgba(255, 92, 138, 0.3);
  box-shadow: 0 4px 15px rgba(255, 92, 138, 0.1);
}

.live-item.upcoming {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.2);
}

.live-time-col { text-align: center; }

.live-time {
  font-size: 15px;
  font-weight: 700;
  color: white;
  font-family: 'SF Mono', monospace;
}

.live-duration {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.live-artist {
  font-size: 13px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.live-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.style-tag {
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(255, 140, 66, 0.15);
  color: #ffb384;
  font-size: 10px;
  font-weight: 600;
}

.zone-tag {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.now-playing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.bars span {
  width: 3px;
  background: linear-gradient(180deg, #ff5c8a, #ff8c42);
  border-radius: 2px;
  animation: barBounce 0.8s ease-in-out infinite;
}

.bars span:nth-child(1) { height: 8px; animation-delay: 0s; }
.bars span:nth-child(2) { height: 14px; animation-delay: 0.2s; }
.bars span:nth-child(3) { height: 10px; animation-delay: 0.4s; }

@keyframes barBounce {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}

.playing-text {
  font-size: 9px;
  color: #ff5c8a;
  font-weight: 700;
}

.upcoming-tag {
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.played-tag {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
}
</style>
