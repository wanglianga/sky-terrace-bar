<template>
  <div class="sunset-recommendation">
    <div class="section-header">
      <div class="header-left">
        <span class="header-icon">🌅</span>
        <h3 class="section-title">晚霞观景推荐</h3>
      </div>
      <button class="toggle-btn" @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
      </button>
    </div>

    <div v-if="expanded" class="recommendation-content">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">📅 日期</label>
          <input type="date" v-model="localDate" class="date-input" @change="onDateChange" />
        </div>
        <div class="filter-group">
          <label class="filter-label">☁️ 云量</label>
          <div class="cloud-options">
            <button
              v-for="cloud in CLOUD_COVERAGE_OPTIONS"
              :key="cloud.id"
              class="cloud-btn"
              :class="{ active: store.selectedCloudCoverage === cloud.id }"
              @click="setCloudCoverage(cloud.id)"
              :title="cloud.description"
            >
              <span class="cloud-icon">{{ cloud.icon }}</span>
              <span class="cloud-name">{{ cloud.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="sunset-summary">
        <div class="summary-item">
          <span class="summary-icon">🌇</span>
          <div class="summary-text">
            <div class="summary-value">{{ dateFactor.sunsetTime }}</div>
            <div class="summary-label">日落时间</div>
          </div>
        </div>
        <div class="summary-item">
          <span class="summary-icon">✨</span>
          <div class="summary-text">
            <div class="summary-value">{{ dateFactor.goldenHour }}分钟</div>
            <div class="summary-label">黄金时段</div>
          </div>
        </div>
        <div class="summary-item">
          <span class="summary-icon">☁️</span>
          <div class="summary-text">
            <div class="summary-value">{{ currentCloud.cloudPercent }}%</div>
            <div class="summary-label">云量</div>
          </div>
        </div>
        <div class="summary-item">
          <span class="summary-icon">🎯</span>
          <div class="summary-text">
            <div class="summary-value">{{ currentCloud.description }}</div>
            <div class="summary-label">观赏条件</div>
          </div>
        </div>
      </div>

      <div class="zone-cards">
        <div
          v-for="zone in sortedZones"
          :key="zone.id"
          class="zone-rank-card"
          :class="{ closed: isZoneClosed(zone.id), indoor: zone.isIndoor }"
          :style="{ '--zone-color': zone.color }"
          @click="handleZoneClick(zone)"
        >
          <div class="rank-badge" :style="{ background: getQualityLabel(calculateSunsetScore(zone)).color }">
            #{{ zone.rank }}
          </div>

          <div v-if="isZoneClosed(zone.id)" class="closed-overlay">
            <div class="closed-badge">
              <span class="closed-icon">🔒</span>
              <span>临时关闭</span>
            </div>
            <div v-if="getZoneRelocation(zone.id)" class="relocation-hint">
              <span>👉 迁移至</span>
              <span class="relocation-zone">{{ getRelocationZoneName(zone.id) }}</span>
            </div>
          </div>

          <div class="zone-card-header">
            <div class="zone-name">{{ zone.name }}</div>
            <div class="quality-tag" :style="{ color: getQualityLabel(calculateSunsetScore(zone)).color }">
              {{ getQualityLabel(calculateSunsetScore(zone)).label }}
            </div>
          </div>

          <div class="score-bar">
            <div class="score-fill" :style="{ width: calculateSunsetScore(zone) + '%', background: getQualityLabel(calculateSunsetScore(zone)).color }"></div>
            <span class="score-text">{{ calculateSunsetScore(zone) }}分</span>
          </div>

          <div class="stars-row">
            <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= getQualityLabel(calculateSunsetScore(zone)).stars }">★</span>
          </div>

          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-icon">📸</span>
              <div class="metric-info">
                <div class="metric-value">{{ zone.sunsetQuality.photoAngle }}°</div>
                <div class="metric-label">拍照角度</div>
              </div>
            </div>
            <div class="metric-item">
              <span class="metric-icon">🌞</span>
              <div class="metric-info">
                <div class="metric-value">{{ backlightLabels[zone.sunsetQuality.backlightLevel] }}</div>
                <div class="metric-label">逆光程度</div>
              </div>
            </div>
            <div class="metric-item">
              <span class="metric-icon">⏱️</span>
              <div class="metric-info">
                <div class="metric-value">{{ zone.sunsetQuality.goldenHourDuration + zone.sunsetQuality.blueHourDuration }}分钟</div>
                <div class="metric-label">可用时长</div>
              </div>
            </div>
            <div class="metric-item">
              <span class="metric-icon">👥</span>
              <div class="metric-info">
                <div class="metric-value">{{ getZoneAvailable(zone.id) }}/{{ getZoneTotal(zone.id) }}</div>
                <div class="metric-label">空位数</div>
              </div>
            </div>
          </div>

          <div class="occlusion-info">
            <span class="occlusion-label">🏢 楼体遮挡</span>
            <div class="occlusion-bar">
              <div class="occlusion-fill" :style="{ width: zone.sunsetQuality.buildingOcclusion + '%' }"></div>
            </div>
            <span class="occlusion-value">{{ zone.sunsetQuality.buildingOcclusion }}%</span>
          </div>
        </div>
      </div>

      <div class="compare-tip">
        <span class="tip-icon">💡</span>
        <span>点击区域卡片可快速切换查看对应座位图，S级区域为当日最佳晚霞观赏位</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ZONES, CLOUD_COVERAGE_OPTIONS } from '../data/seatsData'
import {
  store,
  seatsByZone,
  selectZone,
  setCloudCoverage,
  setSelectedDate,
  calculateSunsetScore,
  getSunsetQualityLabel,
  isZoneClosed,
  getZoneRelocation
} from '../store/bookingStore'

const emit = defineEmits(['zone-select'])

const expanded = ref(true)
const localDate = ref(store.selectedDate)

const backlightLabels = {
  high: '强逆光',
  medium: '中度',
  low: '轻微',
  none: '无逆光'
}

const dateFactor = computed(() => {
  const month = new Date(store.selectedDate).getMonth() + 1
  const factors = [
    { month: 1, factor: 0.7, sunsetTime: '17:20', goldenHour: 30 },
    { month: 2, factor: 0.8, sunsetTime: '17:50', goldenHour: 35 },
    { month: 3, factor: 0.9, sunsetTime: '18:20', goldenHour: 40 },
    { month: 4, factor: 1.0, sunsetTime: '18:45', goldenHour: 45 },
    { month: 5, factor: 1.05, sunsetTime: '19:05', goldenHour: 48 },
    { month: 6, factor: 1.1, sunsetTime: '19:20', goldenHour: 50 },
    { month: 7, factor: 1.08, sunsetTime: '19:15', goldenHour: 48 },
    { month: 8, factor: 1.0, sunsetTime: '18:50', goldenHour: 45 },
    { month: 9, factor: 0.95, sunsetTime: '18:10', goldenHour: 40 },
    { month: 10, factor: 0.85, sunsetTime: '17:30', goldenHour: 35 },
    { month: 11, factor: 0.75, sunsetTime: '17:00', goldenHour: 30 },
    { month: 12, factor: 0.65, sunsetTime: '16:50', goldenHour: 25 }
  ]
  return factors.find(f => f.month === month) || factors[5]
})

const currentCloud = computed(() => {
  return CLOUD_COVERAGE_OPTIONS.find(c => c.id === store.selectedCloudCoverage) || CLOUD_COVERAGE_OPTIONS[1]
})

const sortedZones = computed(() => {
  const zones = ZONES.filter(z => !z.isIndoor).map(zone => ({
    ...zone,
    score: calculateSunsetScore(zone)
  }))
  zones.sort((a, b) => b.score - a.score)
  return zones.map((z, i) => ({ ...z, rank: i + 1 }))
})

function getQualityLabel(score) {
  return getSunsetQualityLabel(score)
}

function getZoneAvailable(zoneId) {
  return (seatsByZone.value[zoneId] || []).filter(s => s.status === 'available').length
}

function getZoneTotal(zoneId) {
  return (seatsByZone.value[zoneId] || []).length
}

function getRelocationZoneName(zoneId) {
  const targetId = getZoneRelocation(zoneId)
  const targetZone = ZONES.find(z => z.id === targetId)
  return targetZone?.name || '室内包厢区'
}

function onDateChange() {
  setSelectedDate(localDate.value)
}

function handleZoneClick(zone) {
  if (isZoneClosed(zone.id)) return
  selectZone(zone.id)
  emit('zone-select', zone.id)
}
</script>

<style scoped>
.sunset-recommendation {
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.08), rgba(255, 92, 138, 0.05));
  border: 1px solid rgba(255, 140, 66, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 140, 66, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 22px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.toggle-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.recommendation-content {
  padding: 14px 16px;
}

.filter-row {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.date-input {
  padding: 7px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 12px;
  outline: none;
}

.cloud-options {
  display: flex;
  gap: 6px;
}

.cloud-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.cloud-btn:hover {
  background: rgba(255, 215, 0, 0.08);
  border-color: rgba(255, 215, 0, 0.3);
}

.cloud-btn.active {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.5);
  color: #ffd700;
}

.cloud-icon {
  font-size: 18px;
}

.cloud-name {
  font-size: 10px;
  font-weight: 500;
}

.sunset-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-icon {
  font-size: 20px;
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-value {
  font-size: 13px;
  font-weight: 700;
  color: white;
}

.summary-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
}

.zone-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.zone-rank-card {
  position: relative;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  overflow: hidden;
}

.zone-rank-card:hover:not(.closed) {
  border-color: var(--zone-color);
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.zone-rank-card.closed {
  opacity: 0.6;
  cursor: not-allowed;
}

.rank-badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 800;
  color: #1a1a2e;
  border-radius: 0 0 10px 0;
}

.closed-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 5;
  backdrop-filter: blur(2px);
}

.closed-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #fca5a5;
}

.closed-icon {
  font-size: 16px;
}

.relocation-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  font-size: 11px;
  color: #6ee7b7;
}

.relocation-zone {
  font-weight: 700;
  color: #34d399;
}

.zone-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  margin-top: 4px;
}

.zone-name {
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.quality-tag {
  font-size: 11px;
  font-weight: 700;
}

.score-bar {
  position: relative;
  height: 18px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 9px;
  overflow: hidden;
  margin-bottom: 6px;
}

.score-fill {
  height: 100%;
  border-radius: 9px;
  transition: width 0.5s ease;
}

.score-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.stars-row {
  display: flex;
  gap: 2px;
  margin-bottom: 10px;
}

.star {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.15);
}

.star.filled {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.metric-icon {
  font-size: 14px;
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.metric-value {
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.metric-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
}

.occlusion-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.occlusion-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.occlusion-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.occlusion-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
  border-radius: 3px;
}

.occlusion-value {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
  min-width: 28px;
  text-align: right;
}

.compare-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 215, 0, 0.06);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: 10px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.tip-icon {
  font-size: 16px;
  flex-shrink: 0;
}

@media (max-width: 560px) {
  .sunset-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  .zone-cards {
    grid-template-columns: 1fr;
  }
}
</style>
