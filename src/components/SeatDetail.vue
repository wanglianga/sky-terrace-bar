<template>
  <div v-if="seat" class="seat-detail-panel">
    <div class="detail-header" :style="{ borderColor: zoneColor }">
      <div class="header-left">
        <div class="seat-type-icon">{{ getSeatIcon(seat.type) }}</div>
        <div>
          <h3 class="seat-title">{{ seat.name }}</h3>
          <div class="seat-type-name">{{ seatTypeName }}</div>
        </div>
      </div>
      <div class="status-badge" :class="seat.status">{{ statusText }}</div>
    </div>

    <div class="view-photo-section">
      <div class="view-image" :style="viewImageStyle">
        <img
          v-if="!photoLoadError"
          :src="viewPhotoUrl"
          :alt="zone?.name + '视野照片'"
          class="photo-img"
          @error="handlePhotoError"
        />
        <div v-else class="photo-fallback">
          <span class="fallback-icon">📷</span>
          <span class="fallback-text">{{ zone?.name }}视野</span>
        </div>
        <div class="view-overlay">
          <div class="view-tags">
            <span class="view-tag sunset" v-if="zone?.sunsetView >= 70">🌅 落日满分</span>
            <span class="view-tag skyline" v-if="zone?.citySkyline >= 80">🏙️ 天际线</span>
            <span class="view-tag river" v-if="seat.zoneId === 'south'">🌊 江景</span>
          </div>
        </div>
        <div class="photo-caption">{{ zone?.name }} · {{ zone?.direction }}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-icon">👥</div>
        <div class="info-content">
          <div class="info-label">可坐人数</div>
          <div class="info-value">最多 {{ seat.capacity }} 人</div>
        </div>
      </div>
      <div class="info-item">
        <div class="info-icon">💰</div>
        <div class="info-content">
          <div class="info-label">低消价格</div>
          <div class="info-value price" :style="{ color: zoneColor }">¥{{ effectivePrice }}</div>
        </div>
      </div>
      <div class="info-item">
        <div class="info-icon">⏰</div>
        <div class="info-content">
          <div class="info-label">到店窗口</div>
          <div class="info-value">{{ store.selectedTimeSlot?.time }}</div>
        </div>
      </div>
      <div class="info-item">
        <div class="info-icon">💳</div>
        <div class="info-content">
          <div class="info-label">预付订金 (有效低消×30%)</div>
          <div class="info-value">¥{{ effectiveDeposit }} <span class="tip">(到店可退)</span></div>
        </div>
      </div>
    </div>

    <div class="risk-section" v-if="seat.hasOcclusionRisk || seat.windFactor > 1 || !zone?.hasRainCover">
      <div class="section-label">⚠️ 注意事项</div>
      <div class="risk-list">
        <div class="risk-item" v-if="seat.hasOcclusionRisk">
          <span class="risk-icon">🌳</span>
          <span>部分视野存在遮挡（景观树/设备）</span>
        </div>
        <div class="risk-item" v-if="seat.windFactor > 1">
          <span class="risk-icon">💨</span>
          <span>风力较强，高层风感明显</span>
        </div>
        <div class="risk-item" v-if="!zone?.hasRainCover">
          <span class="risk-icon">🌧️</span>
          <span>无雨棚覆盖，雨天需迁移室内</span>
        </div>
      </div>
    </div>

    <div class="sunset-info-section" v-if="!zone?.isIndoor">
      <div class="section-label">� 晚霞观景质量</div>
      <div class="sunset-stats">
        <div class="sun-stat">
          <span class="stat-icon">📸</span>
          <div class="stat-text">
            <div class="stat-num">{{ zone?.sunsetQuality?.photoAngle || 0 }}°</div>
            <div class="stat-desc">拍照角度</div>
          </div>
        </div>
        <div class="sun-stat">
          <span class="stat-icon">🌞</span>
          <div class="stat-text">
            <div class="stat-num">{{ getBacklightText(zone?.sunsetQuality?.backlightLevel) }}</div>
            <div class="stat-desc">逆光程度</div>
          </div>
        </div>
        <div class="sun-stat">
          <span class="stat-icon">⏱️</span>
          <div class="stat-text">
            <div class="stat-num">{{ (zone?.sunsetQuality?.goldenHourDuration || 0) + (zone?.sunsetQuality?.blueHourDuration || 0) }}分钟</div>
            <div class="stat-desc">观景时长</div>
          </div>
        </div>
        <div class="sun-stat">
          <span class="stat-icon">🏢</span>
          <div class="stat-text">
            <div class="stat-num">{{ zone?.sunsetQuality?.buildingOcclusion || 0 }}%</div>
            <div class="stat-desc">楼体遮挡</div>
          </div>
        </div>
      </div>
    </div>

    <div class="birthday-section" v-if="seat.canBirthdayDecor">
      <BirthdayDecorPreview :seat="seat" @switch-zone="handleSwitchZone" />
    </div>

    <div class="night-atmosphere">
      <div class="section-label">🌙 夜景氛围</div>
      <div class="atmosphere-preview">
        <div class="atmo-item" :class="{ active: seat.zoneId !== 'indoor' }">
          <span class="atmo-icon">✨</span>
          <span>星空灯</span>
        </div>
        <div class="atmo-item active">
          <span class="atmo-icon">🎵</span>
          <span>背景音乐</span>
        </div>
        <div class="atmo-item" :class="{ active: seat.zoneId === 'east' }">
          <span class="atmo-icon">🔥</span>
          <span>调酒火焰秀</span>
        </div>
        <div class="atmo-item active">
          <span class="atmo-icon">🕯️</span>
          <span>烛光氛围</span>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button class="btn-cancel" @click="$emit('close')">返回</button>
      <button
        class="btn-confirm"
        :disabled="seat.status !== 'available'"
        @click="handleConfirm"
        :style="{ background: confirmBtnBg }"
      >
        {{ seat.status === 'available' ? `选择此座位 · 订金 ¥${effectiveDeposit} (有效低消×30%)` : statusText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ZONES, SEAT_TYPES } from '../data/seatsData'
import { store, getSeatEffectivePrice, getSeatDeposit, toggleSeatSelection, selectZone } from '../store/bookingStore'
import BirthdayDecorPreview from './BirthdayDecorPreview.vue'

watch(() => props.seat?.id, () => {
  resetPhotoError()
})

const props = defineProps({
  seat: { type: Object, default: null }
})

const emit = defineEmits(['close', 'confirm', 'switch-zone'])

const zone = computed(() => ZONES.find(z => z.id === props.seat?.zoneId))
const zoneColor = computed(() => zone.value?.color || '#ff6b35')
const seatTypeInfo = computed(() => SEAT_TYPES.find(t => t.id === props.seat?.type))
const seatTypeName = computed(() => seatTypeInfo.value?.name || '座位')
const effectivePrice = computed(() => props.seat ? getSeatEffectivePrice(props.seat) : 0)
const effectiveDeposit = computed(() => props.seat ? getSeatDeposit(props.seat) : 0)

const statusText = computed(() => {
  const map = { available: '可预订', occupied: '已入座', reserved: '已预订', held: '保留中', combined: '已拼桌' }
  return map[props.seat?.status] || ''
})

const confirmBtnBg = computed(() => `linear-gradient(135deg, ${zoneColor.value}, ${zoneColor.value}dd)`)

function getSeatIcon(type) {
  return seatTypeInfo.value?.icon || '🪑'
}

function getBacklightText(level) {
  const map = { high: '强逆光', medium: '中度', low: '轻微', none: '无逆光' }
  return map[level] || '未知'
}

function handleSwitchZone(zoneId) {
  selectZone(zoneId)
  emit('switch-zone', zoneId)
  emit('close')
}

const photoLoadError = ref(false)

const viewPhotoUrl = computed(() => {
  if (photoLoadError.value) {
    return fallbackPhotoUrl.value
  }
  return zone.value?.viewImage || fallbackPhotoUrl.value
})

const fallbackPhotoUrl = computed(() => {
  const zoneId = props.seat?.zoneId || 'west'
  const gradients = {
    west: 'linear-gradient(180deg, #2d1b4e 0%, #c94b6a 35%, #ff8c42 70%, #ffd700 100%)',
    north: 'linear-gradient(180deg, #1a1f3a 0%, #4a6fa5 40%, #718096 70%, #a0aec0 100%)',
    south: 'linear-gradient(180deg, #1e3a5f 0%, #2d5a87 35%, #3d7ab0 65%, #5ba3d4 100%)',
    east: 'linear-gradient(180deg, #3d1f5c 0%, #5c3d7a 40%, #8b5cf6 70%, #c4b5fd 100%)',
    indoor: 'linear-gradient(180deg, #1a1033 0%, #2d1b4e 35%, #4c1d95 65%, #7c3aed 100%)'
  }
  return ''
})

const viewImageStyle = computed(() => {
  if (photoLoadError.value) {
    const zoneId = props.seat?.zoneId || 'west'
    const gradients = {
      west: 'linear-gradient(180deg, #2d1b4e 0%, #c94b6a 35%, #ff8c42 70%, #ffd700 100%)',
      north: 'linear-gradient(180deg, #1a1f3a 0%, #4a6fa5 40%, #718096 70%, #a0aec0 100%)',
      south: 'linear-gradient(180deg, #1e3a5f 0%, #2d5a87 35%, #3d7ab0 65%, #5ba3d4 100%)',
      east: 'linear-gradient(180deg, #3d1f5c 0%, #5c3d7a 40%, #8b5cf6 70%, #c4b5fd 100%)',
      indoor: 'linear-gradient(180deg, #1a1033 0%, #2d1b4e 35%, #4c1d95 65%, #7c3aed 100%)'
    }
    return { background: gradients[zoneId] }
  }
  return {}
})

function handlePhotoError() {
  photoLoadError.value = true
}

function resetPhotoError() {
  photoLoadError.value = false
}

function handleConfirm() {
  if (props.seat) {
    if (!store.selectedSeatIds.includes(props.seat.id)) {
      toggleSeatSelection(props.seat.id)
    }
    emit('confirm')
  }
}
</script>

<style scoped>
.seat-detail-panel {
  background: rgba(15, 18, 28, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 2px solid;
  background: rgba(255, 255, 255, 0.02);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seat-type-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.seat-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.seat-type-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}
.status-badge.available { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.status-badge.occupied { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.status-badge.reserved { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.status-badge.held { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }

.view-photo-section {
  padding: 14px 18px;
}

.view-image {
  position: relative;
  height: 180px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  background: rgba(0,0,0,0.4);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.view-image:hover .photo-img {
  transform: scale(1.05);
}

.photo-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
}

.fallback-icon {
  font-size: 36px;
  opacity: 0.7;
}

.fallback-text {
  font-size: 13px;
  font-weight: 500;
}

.view-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.5) 100%);
  pointer-events: none;
}

.view-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
}

.view-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.3);
  color: white;
}

.photo-caption {
  position: absolute;
  bottom: 10px;
  right: 12px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0,0,0,0.6);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 18px 14px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-icon { font-size: 18px; }
.info-label { font-size: 10px; color: rgba(255, 255, 255, 0.45); margin-bottom: 2px; }
.info-value { font-size: 13px; font-weight: 600; color: white; }
.info-value.price { font-size: 16px; }
.info-value .tip { font-size: 10px; color: rgba(255, 255, 255, 0.4); font-weight: 400; }

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 10px;
}

.sunset-info-section, .risk-section, .birthday-section, .night-atmosphere {
  padding: 12px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.sunset-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.sun-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  background: rgba(255, 140, 66, 0.05);
  border: 1px solid rgba(255, 140, 66, 0.15);
  border-radius: 10px;
  text-align: center;
}

.sun-stat .stat-icon {
  font-size: 20px;
}

.sun-stat .stat-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sun-stat .stat-num {
  font-size: 13px;
  font-weight: 700;
  color: white;
}

.sun-stat .stat-desc {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
}

.risk-list { display: flex; flex-direction: column; gap: 6px; }

.risk-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.15);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.risk-icon { font-size: 14px; }

.birthday-options { display: flex; flex-direction: column; gap: 8px; }

.bday-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 140, 66, 0.05);
  border: 1px solid rgba(255, 140, 66, 0.15);
  border-radius: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
}

.bday-option:hover { background: rgba(255, 140, 66, 0.1); }
.bday-option input { accent-color: #ff8c42; }
.bday-option em { color: #ff8c42; font-style: normal; font-weight: 600; margin-left: 4px; }

.atmosphere-preview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.atmo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.2s;
}

.atmo-item.active {
  background: rgba(255, 215, 0, 0.08);
  border-color: rgba(255, 215, 0, 0.2);
  color: rgba(255, 215, 0, 0.9);
}

.atmo-icon { font-size: 18px; }

.action-bar {
  display: flex;
  gap: 10px;
  padding: 14px 18px 18px;
}

.btn-cancel {
  flex: 0 0 90px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-cancel:hover { background: rgba(255, 255, 255, 0.1); }

.btn-confirm {
  flex: 1;
  padding: 12px 18px;
  border-radius: 12px;
  color: white;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(255, 140, 66, 0.3);
}

.btn-confirm:disabled {
  background: rgba(100, 100, 100, 0.4) !important;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-confirm:hover:not(:disabled) { transform: translateY(-1px); }
</style>
