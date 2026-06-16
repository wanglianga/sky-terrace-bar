<template>
  <div class="customer-view">
    <SkyBackground />
    <div class="content-overlay">
      <header class="page-header">
        <div class="venue-info">
          <div class="venue-logo">🌆</div>
          <div class="venue-text">
            <h1 class="venue-name">Sky Terrace 38</h1>
            <div class="venue-sub">城市露台酒吧 · {{ FLOOR_INFO.floor }}层高空</div>
          </div>
          <div class="weather-card">
            <div class="weather-temp">{{ WEATHER_INFO.today.temp }}°</div>
            <div class="weather-detail">
              <span>{{ WEATHER_INFO.today.condition }}</span>
              <span>🌅 日落 {{ WEATHER_INFO.today.sunset }}</span>
            </div>
            <button class="rain-toggle" :class="{ on: store.rainCoverOpen }" @click="toggleRainCover">
              <span>☂️</span>
              <span>{{ store.rainCoverOpen ? '雨棚开' : '雨棚关' }}</span>
            </button>
          </div>
        </div>
        <div class="entrance-hint">
          <span class="hint-icon">🛗</span>
          <span>{{ FLOOR_INFO.entrance.description }} · {{ FLOOR_INFO.entrance.openTime }}</span>
        </div>
      </header>

      <section class="time-section">
        <TimeSlotBar />
      </section>

      <section class="capacity-bar">
        <div class="capacity-label">
          <span class="label-icon">📊</span>
          <span>实时座位余量</span>
        </div>
        <div class="capacity-bar-track">
          <div class="capacity-bar-fill" :style="{ width: capacityPercent + '%' }"></div>
        </div>
        <div class="capacity-numbers">
          <span class="avail" v-for="zone in ZONES" :key="zone.id" :style="{ color: zone.color }">
            {{ zone.name.slice(0,2) }}: {{ getZoneAvailable(zone.id) }}
          </span>
        </div>
        <div class="capacity-total">
          共 {{ availableSeatsCount }} / {{ totalSeatsCount }} 空位
        </div>
      </section>

      <section v-if="detailSeat" class="detail-modal" @click.self="closeDetail">
        <div class="detail-wrap">
          <SeatDetail :seat="detailSeat" @close="closeDetail" @confirm="onSeatConfirm" />
        </div>
      </section>

      <section class="zones-section">
        <div class="section-head">
          <h2 class="section-title">📍 露台分区</h2>
          <div class="zone-filter">
            <button
              v-for="t in SEAT_TYPES" :key="t.id"
              class="filter-btn"
              :class="{ active: store.filterType === t.id }"
              @click="setFilterType(t.id)"
            >
              <span>{{ t.icon }}</span>
              <span>{{ t.name.slice(0, 2) }}</span>
            </button>
          </div>
        </div>

        <div class="zone-tabs">
          <button
            v-for="zone in ZONES" :key="zone.id"
            class="zone-tab"
            :class="{ active: store.selectedZoneId === zone.id, indoor: zone.isIndoor }"
            :style="getTabStyle(zone)"
            @click="selectZone(zone.id)"
          >
            <span class="tab-name">{{ zone.name }}</span>
            <span class="tab-count">{{ getZoneAvailable(zone.id) }}空</span>
          </button>
        </div>

        <div class="capacity-filter">
          <span class="filter-label">人数筛选：</span>
          <button
            v-for="n in [2, 4, 6, 8]" :key="n"
            class="cap-btn"
            :class="{ active: store.filterCapacity === n }"
            @click="setFilterCapacity(n)"
          >
            {{ n }}人+
          </button>
        </div>

        <div v-if="store.selectedZoneId" class="seat-map-wrap">
          <SeatMap :zone-id="store.selectedZoneId" @seat-click="onSeatClick" />
        </div>
        <div v-else class="no-zone-hint">
          <span class="hint-emoji">👆</span>
          <p>请选择上方分区查看座位图</p>
        </div>
      </section>

      <section class="packages-wrap">
        <PackagesSection />
      </section>

      <section class="live-wrap">
        <LiveSchedule />
      </section>

      <section class="tips-section">
        <div class="tip-cards">
          <div class="tip-card">
            <span class="tip-icon">💰</span>
            <h4>订金规则</h4>
            <p>预订需支付30%订金，到店后可抵扣消费；取消预订，迟到超30分钟订金不退</p>
          </div>
          <div class="tip-card">
            <span class="tip-icon">🎂</span>
            <h4>生日福利</h4>
            <p>生日当天出示身份证，赠送香槟1瓶+免费基础布置</p>
          </div>
        </div>
      </section>

      <footer v-if="store.selectedSeatIds.length > 0" class="sticky-footer">
        <div class="selected-summary">
          <div class="summary-left">
            <div class="selected-count">已选 {{ store.selectedSeatIds.length }} 个座位</div>
            <div class="selected-names">{{ selectedNames }}</div>
          </div>
          <div class="summary-right">
            <div class="total-price">
              <span>低消合计</span>
              <strong>¥{{ getSelectedTotalPrice() }}</strong>
            </div>
            <div class="deposit-note">订金 ¥{{ getSelectedTotalDeposit() }}</div>
          </div>
        </div>
        <button class="checkout-btn" @click="handleCheckout">
          立即预订 · 支付订金
        </button>
      </footer>
      <div :style="{ height: store.selectedSeatIds.length > 0 ? '100px' : '20px' }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SkyBackground from '../components/SkyBackground.vue'
import TimeSlotBar from '../components/TimeSlotBar.vue'
import SeatMap from '../components/SeatMap.vue'
import SeatDetail from '../components/SeatDetail.vue'
import PackagesSection from '../components/PackagesSection.vue'
import LiveSchedule from '../components/LiveSchedule.vue'
import { ZONES, SEAT_TYPES, FLOOR_INFO, WEATHER_INFO } from '../data/seatsData'
import {
  store,
  selectZone, setFilterType, setFilterCapacity, toggleRainCover,
  availableSeatsCount, totalSeatsCount,
  getSelectedTotalPrice, getSelectedTotalDeposit, seatsByZone,
  toggleSeatSelection
} from '../store/bookingStore'

const detailSeat = ref(null)

const capacityPercent = computed(() => {
  return Math.round((availableSeatsCount.value / totalSeatsCount.value) * 100)
})

const selectedNames = computed(() => {
  return store.selectedSeatIds.map(id => {
    const s = store.seats.find(x => x.id === id)
    return s?.name
  }).join('、')
})

function getZoneAvailable(zoneId) {
  return (seatsByZone.value[zoneId] || [])
    .filter(s => s.status === 'available').length
}

function getTabStyle(zone) {
  return {
    '--zone-color': zone.color,
    '--zone-glow': `${zone.color}33`
  }
}

function onSeatClick(seat) {
  detailSeat.value = seat
}

function closeDetail() {
  detailSeat.value = null
}

function onSeatConfirm() {
  detailSeat.value = null
}

function handleCheckout() {
  alert(`预订成功！\n\n座位：${selectedNames.value}\n时段：${store.selectedTimeSlot?.name}\n订金：¥${getSelectedTotalDeposit()}\n\n（演示模式，实际请对接支付系统）`)
}
</script>

<style scoped>
.customer-view {
  position: relative;
  min-height: 100vh;
}

.content-overlay {
  position: relative;
  z-index: 1;
  padding: 14px;
  max-width: 768px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 16px;
}

.venue-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.venue-logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff8c42, #ff5c8a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  box-shadow: 0 6px 20px rgba(255, 140, 66, 0.4);
  flex-shrink: 0;
}

.venue-text { flex: 1; min-width: 140px; }

.venue-name {
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffd700, #ff8c42);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.venue-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 3px;
}

.weather-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: rgba(20, 30, 50, 0.7);
  backdrop-filter: blur(12px);
  border-radius: 14px;
  border: 1px solid rgba(255, 200, 100, 0.15);
}

.weather-temp {
  font-size: 24px;
  font-weight: 800;
  color: #ffd700;
}

.weather-detail {
  display: flex;
  gap: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.rain-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  margin-top: 4px;
  transition: all 0.3s;
}

.rain-toggle.on {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
  color: #6ee7b7;
}

.entrance-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 200, 100, 0.1);
  border-radius: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.hint-icon { font-size: 14px; }

.time-section { margin-bottom: 14px; }

.capacity-bar {
  background: rgba(15, 20, 35, 0.8);
  backdrop-filter: blur(12px);
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 200, 100, 0.1);
}

.capacity-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.label-icon { font-size: 14px; }

.capacity-bar-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.capacity-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #ffd700, #ff8c42);
  border-radius: 4px;
  transition: width 0.5s ease;
  animation: fillGlow 2s ease-in-out infinite;
}

@keyframes fillGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.capacity-numbers {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.avail {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}

.capacity-total {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.detail-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.detail-wrap {
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 20px 20px 0 0;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.zones-section {
  background: rgba(12, 15, 25, 0.85);
  backdrop-filter: blur(14px);
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 200, 100, 0.1);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.zone-filter {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 5px 9px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  transition: all 0.2s;
}

.filter-btn.active {
  background: rgba(255, 140, 66, 0.15);
  border-color: rgba(255, 140, 66, 0.4);
  color: #ffb384;
}

.zone-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.zone-tab {
  padding: 8px 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: rgba(255, 255, 255, 0.65);
  transition: all 0.25s;
  font-size: 12px;
  font-weight: 500;
}

.zone-tab:hover {
  border-color: var(--zone-color);
  background: rgba(255, 255, 255, 0.05);
}

.zone-tab.active {
  background: linear-gradient(135deg, rgba(255,255,255,0.06), var(--zone-glow));
  border-color: var(--zone-color);
  color: white;
  box-shadow: 0 4px 14px var(--zone-glow);
}

.tab-name { font-size: 12px; font-weight: 600; }
.tab-count { font-size: 10px; opacity: 0.8; }

.capacity-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.cap-filter-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.cap-btn {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  transition: all 0.2s;
}

.cap-btn.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #93c5fd;
}

.seat-map-wrap {
  margin-top: 4px;
}

.no-zone-hint {
  padding: 50px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
}

.hint-emoji {
  font-size: 40px;
  display: block;
  margin-bottom: 10px;
}

.no-zone-hint p {
  font-size: 13px;
}

.packages-wrap, .live-wrap {
  background: rgba(12, 15, 25, 0.85);
  backdrop-filter: blur(14px);
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 200, 100, 0.1);
}

.tips-section {
  margin-bottom: 16px;
}

.tip-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.tip-card {
  padding: 14px;
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.08), rgba(255, 92, 138, 0.05));
  border: 1px solid rgba(255, 140, 66, 0.15);
  border-radius: 14px;
}

.tip-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}

.tip-card h4 {
  font-size: 13px;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
}

.tip-card p {
  font-size: 11px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.55);
}

.sticky-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 12, 20, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 140, 66, 0.2);
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  z-index: 150;
  animation: footerSlide 0.3s ease;
}

@keyframes footerSlide {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.selected-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.selected-count {
  font-size: 13px;
  font-weight: 700;
  color: #ffd700;
}

.selected-names {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-right { text-align: right; }

.total-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-price span {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.total-price strong {
  font-size: 20px;
  font-weight: 800;
  color: #ff8c42;
}

.deposit-note {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 2px;
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff5c8a 100%);
  border-radius: 14px;
  color: white;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 6px 25px rgba(255, 140, 66, 0.4);
  transition: all 0.2s;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 140, 66, 0.5);
}

.checkout-btn:active {
  transform: translateY(0);
}
</style>
