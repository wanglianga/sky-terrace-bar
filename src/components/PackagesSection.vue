<template>
  <div class="packages-section">
    <div class="section-header">
      <h3 class="section-title">🥂 低消套餐</h3>
      <span class="hint">选择套餐可抵扣座位低消</span>
    </div>
    <div class="packages-grid">
      <div
        v-for="pkg in PACKAGES"
        :key="pkg.id"
        class="package-card"
        :class="{ selected: store.selectedPackageId === pkg.id, vip: pkg.vip }"
        :style="cardStyle(pkg)"
        @click="selectPackage(pkg.id)"
      >
        <div v-if="pkg.vip" class="vip-crown">👑</div>
        <div class="package-tag" :style="{ background: pkg.color }">{{ pkg.tag }}</div>
        <h4 class="package-name">{{ pkg.name }}</h4>
        <div class="package-price">
          <span class="currency">¥</span>
          <span class="amount">{{ pkg.price }}</span>
        </div>
        <div class="package-spend">低消基准</div>
        <div class="package-suitable">
          <span>👥</span> 适合 {{ pkg.suitableFor }} 人
        </div>
        <ul class="package-includes">
          <li v-for="(item, idx) in pkg.includes" :key="idx">
            <span class="check">✓</span> {{ item }}
          </li>
        </ul>
        <div class="select-indicator">
          <span v-if="store.selectedPackageId === pkg.id">已选</span>
          <span v-else>点击选择</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PACKAGES } from '../data/seatsData'
import { store, selectPackage } from '../store/bookingStore'

function cardStyle(pkg) {
  return {
    '--pkg-color': pkg.color,
    '--pkg-glow': `${pkg.color}33`
  }
}
</script>

<style scoped>
.packages-section {
  padding: 16px 0;
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

.hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.package-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 14px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.package-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--pkg-color);
  opacity: 0.6;
  transition: opacity 0.3s;
}

.package-card:hover {
  transform: translateY(-3px);
  border-color: var(--pkg-color);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 25px var(--pkg-glow);
}

.package-card:hover::before { opacity: 1; }

.package-card.selected {
  border-color: var(--pkg-color);
  background: linear-gradient(135deg, rgba(255,255,255,0.06), var(--pkg-glow));
  box-shadow: 0 0 0 2px var(--pkg-color), 0 8px 25px var(--pkg-glow);
}

.package-card.vip {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(155, 89, 182, 0.05));
}

.vip-crown {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
  animation: crownFloat 2s ease-in-out infinite;
}

@keyframes crownFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.package-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.package-name {
  font-size: 14px;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
}

.package-price {
  margin-bottom: 2px;
}

.currency {
  font-size: 12px;
  font-weight: 600;
  color: var(--pkg-color);
  vertical-align: top;
}

.amount {
  font-size: 22px;
  font-weight: 800;
  color: var(--pkg-color);
  line-height: 1;
}

.package-spend {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 8px;
}

.package-suitable {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.package-includes {
  list-style: none;
  margin-bottom: 12px;
  min-height: 72px;
}

.package-includes li {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  padding: 3px 0;
  line-height: 1.4;
}

.check {
  color: var(--pkg-color);
  font-weight: 700;
  flex-shrink: 0;
}

.select-indicator {
  text-align: center;
  padding: 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
}

.package-card.selected .select-indicator {
  background: var(--pkg-color);
  color: white;
}
</style>
