<template>
  <div class="birthday-decor-preview">
    <div class="section-header">
      <div class="header-left">
        <span class="header-icon">🎂</span>
        <h3 class="section-title">生日布置预览</h3>
      </div>
      <button class="toggle-btn" :class="{ active: store.birthdayDecor.enabled }" @click="toggleBirthdayDecor">
        {{ store.birthdayDecor.enabled ? '已开启' : '开启布置' }}
      </button>
    </div>

    <div v-if="store.birthdayDecor.enabled" class="decor-content">
      <div class="decor-items-section">
        <div class="section-subtitle">选择布置项目</div>
        <div class="decor-items-grid">
          <div
            v-for="item in BIRTHDAY_DECOR_ITEMS"
            :key="item.id"
            class="decor-item-card"
            :class="{ selected: isSelected(item.id), disabled: !canSelectItem(item) }"
            @click="handleItemClick(item)"
          >
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-name">{{ item.name }}</div>
            <div class="item-price" v-if="item.price > 0">+¥{{ item.price }}</div>
            <div class="item-price free" v-else>免费</div>
            <div class="item-time">⏱️ {{ item.setupTime }}分钟</div>
          </div>
        </div>
      </div>

      <div v-if="selectedItems.length > 0" class="preview-section">
        <div class="section-subtitle">📐 桌面摆放预览</div>
        <div class="table-preview-container">
          <div class="table-preview" :style="tableStyle">
            <div class="table-surface">
              <div
                v-for="item in selectedItems"
                :key="item.id"
                class="decor-item-on-table"
                :class="['pos-' + item.position]"
                :title="item.name"
              >
                <span class="item-icon-small">{{ item.icon }}</span>
              </div>
            </div>
            <div class="table-label">{{ seatTypeName }} · {{ tableWidth }}×{{ tableDepth }}cm</div>
          </div>

          <div class="entrance-path">
            <div class="path-label">
              <span class="path-icon">🚪</span>
              <span>入场动线</span>
            </div>
            <div class="path-diagram">
              <div class="path-line"></div>
              <div class="path-dot start">入口</div>
              <div class="path-dot mid">礼宾台</div>
              <div class="path-dot end">座位</div>
            </div>
            <div class="path-desc">
              从38层电梯厅进入，由专属礼宾引导至座位，沿途经过<span class="highlight">景观走廊</span>，布置将在您到达前 <strong>{{ totalSetupTime }}分钟</strong> 完成
            </div>
          </div>
        </div>

        <div class="decor-summary">
          <div class="summary-row">
            <span class="summary-label">布置项目</span>
            <span class="summary-value">{{ selectedItems.length }} 项</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">布置费用</span>
            <span class="summary-value price">¥{{ totalDecorPrice }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">准备时间</span>
            <span class="summary-value">{{ totalSetupTime }} 分钟</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">桌面占用</span>
            <span class="summary-value" :class="{ warn: !decorFit.fits }">{{ decorFit.currentCount }}/{{ maxDecorItems }} 项</span>
          </div>
        </div>
      </div>

      <div v-if="!decorFit.fits && betterZones.length > 0" class="upgrade-section">
        <div class="upgrade-header">
          <span class="upgrade-icon">💡</span>
          <span class="upgrade-title">桌面容量不足？试试相邻区域</span>
        </div>
        <div class="zone-alternatives">
          <div
            v-for="alt in betterZones"
            :key="alt.zoneId"
            class="alt-zone-card"
            :style="{ '--zone-color': alt.zoneColor }"
            @click="$emit('switch-zone', alt.zoneId)"
          >
            <div class="alt-zone-name">{{ alt.zoneName }}</div>
            <div class="alt-zone-stats">
              <span class="alt-stat">💰 低消 ¥{{ alt.minSpend }}</span>
              <span class="alt-stat">🌅 观景 {{ alt.sunsetScore }}分</span>
              <span class="alt-stat">💺 {{ alt.availableCount }}空位</span>
            </div>
            <div class="alt-zone-tag" v-if="alt.fitsBetter">
              ✅ 可容纳全部布置
            </div>
            <button class="alt-switch-btn">换到此区 →</button>
          </div>
        </div>
        <div class="upgrade-note">
          换区后低消和视野可能有所变化，布置可完整摆放
        </div>
      </div>

      <div class="custom-text-section" v-if="hasProjection">
        <div class="section-subtitle">✏️ 定制文字 (投影/灯牌)</div>
        <input
          type="text"
          v-model="store.birthdayDecor.customText"
          class="custom-text-input"
          placeholder="例如：生日快乐 Sarah"
          maxlength="20"
        />
        <div class="char-count">{{ store.birthdayDecor.customText.length }}/20</div>
      </div>

      <div class="decor-tips">
        <div class="tip-item">
          <span class="tip-dot">•</span>
          <span>生日当天出示身份证，赠送香槟 1 瓶 + 免费基础布置</span>
        </div>
        <div class="tip-item">
          <span class="tip-dot">•</span>
          <span>请提前至少 2 小时预订布置，确保准备充分</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BIRTHDAY_DECOR_ITEMS, SEAT_TYPES } from '../data/seatsData'
import {
  store,
  toggleBirthdayDecor,
  toggleDecorItem,
  getSelectedDecorItems,
  getTotalDecorPrice,
  getTotalSetupTime,
  checkDecorFit,
  getBetterDecorZones
} from '../store/bookingStore'

const props = defineProps({
  seat: { type: Object, default: null }
})

defineEmits(['switch-zone'])

const selectedItems = computed(() => getSelectedDecorItems())
const totalDecorPrice = computed(() => getTotalDecorPrice())
const totalSetupTime = computed(() => getTotalSetupTime())

const seatTypeInfo = computed(() => {
  return SEAT_TYPES.find(t => t.id === props.seat?.type) || SEAT_TYPES[4]
})

const seatTypeName = computed(() => seatTypeInfo.value.name)
const tableWidth = computed(() => seatTypeInfo.value.tableWidth || 100)
const tableDepth = computed(() => seatTypeInfo.value.tableDepth || 100)
const maxDecorItems = computed(() => seatTypeInfo.value.maxDecorItems || 3)

const decorFit = computed(() => {
  if (props.seat) {
    return checkDecorFit(props.seat)
  }
  return { fits: true, currentCount: selectedItems.value.length, message: '' }
})

const betterZones = computed(() => {
  if (props.seat && !decorFit.value.fits) {
    return getBetterDecorZones(props.seat)
  }
  return []
})

const hasProjection = computed(() => {
  return selectedItems.value.some(i => i.id === 'projection' || i.id === 'lightsign')
})

const tableStyle = computed(() => {
  const w = Math.min(280, tableWidth.value * 2)
  const h = Math.min(160, tableDepth.value * 2)
  return {
    width: w + 'px',
    height: h + 'px'
  }
})

function isSelected(itemId) {
  return store.birthdayDecor.selectedItems.includes(itemId)
}

function canSelectItem(item) {
  if (!props.seat) return true
  if (item.requires && item.requires.length > 0) {
    const seatOk = item.requires.includes(props.seat.type)
    const zoneOk = item.requires.includes(props.seat.zoneId)
    return seatOk || zoneOk
  }
  return true
}

function handleItemClick(item) {
  if (!canSelectItem(item)) return
  toggleDecorItem(item.id)
}
</script>

<style scoped>
.birthday-decor-preview {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.06), rgba(255, 92, 138, 0.04));
  border: 1px solid rgba(155, 89, 182, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(155, 89, 182, 0.06);
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
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #9b59b6, #ff5c8a);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
}

.decor-content {
  padding: 14px 16px;
}

.section-subtitle {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.decor-items-section {
  margin-bottom: 16px;
}

.decor-items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.decor-item-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.decor-item-card:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(155, 89, 182, 0.4);
  transform: translateY(-2px);
}

.decor-item-card.selected {
  background: rgba(155, 89, 182, 0.15);
  border-color: #9b59b6;
  box-shadow: 0 0 0 2px rgba(155, 89, 182, 0.2);
}

.decor-item-card.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.item-icon {
  font-size: 24px;
}

.item-name {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.item-price {
  font-size: 10px;
  font-weight: 700;
  color: #ff8c42;
}

.item-price.free {
  color: #10b981;
}

.item-time {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
}

.preview-section {
  margin-bottom: 14px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.table-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.table-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(139, 105, 20, 0.2), rgba(100, 70, 10, 0.1));
  border: 2px solid rgba(139, 105, 20, 0.4);
  border-radius: 14px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
}

.table-surface {
  position: relative;
  width: 85%;
  height: 75%;
  background: radial-gradient(ellipse at center, rgba(255, 200, 100, 0.08) 0%, transparent 70%);
  border-radius: 10px;
}

.decor-item-on-table {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  animation: itemAppear 0.3s ease;
}

@keyframes itemAppear {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.item-icon-small {
  font-size: 18px;
}

.pos-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pos-center-left {
  top: 50%;
  left: 15%;
  transform: translateY(-50%);
}

.pos-center-right {
  top: 50%;
  right: 15%;
  transform: translateY(-50%);
}

.pos-table-top {
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 20%;
}

.pos-corners {
  top: 20%;
  right: 10%;
}

.pos-perimeter {
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 10%;
  background: linear-gradient(90deg, transparent, rgba(255, 100, 150, 0.3), transparent);
}

.pos-backdrop {
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 15%;
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.4), transparent);
}

.pos-wall {
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 20%;
  background: linear-gradient(0deg, rgba(155, 89, 182, 0.3), transparent);
}

.table-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.entrance-path {
  width: 100%;
  padding-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.path-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10px;
}

.path-icon {
  font-size: 14px;
}

.path-diagram {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 10px;
}

.path-line {
  position: absolute;
  top: 50%;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, #10b981, #ffd700, #ff8c42);
  transform: translateY(-50%);
  opacity: 0.5;
}

.path-dot {
  position: relative;
  z-index: 1;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.6);
  border: 1.5px solid;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.path-dot.start {
  border-color: #10b981;
  color: #6ee7b7;
}

.path-dot.mid {
  border-color: #ffd700;
  color: #ffd700;
}

.path-dot.end {
  border-color: #ff8c42;
  color: #ffb384;
}

.path-desc {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

.highlight {
  color: #ffd700;
  font-weight: 600;
}

.decor-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.summary-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.summary-value {
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.summary-value.price {
  color: #ff8c42;
}

.summary-value.warn {
  color: #f87171;
}

.upgrade-section {
  margin-bottom: 14px;
  padding: 12px;
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 12px;
}

.upgrade-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.upgrade-icon {
  font-size: 18px;
}

.upgrade-title {
  font-size: 13px;
  font-weight: 700;
  color: #ffd700;
}

.zone-alternatives {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.alt-zone-card {
  position: relative;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.alt-zone-card:hover {
  border-color: var(--zone-color);
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
}

.alt-zone-name {
  font-size: 13px;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
}

.alt-zone-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.alt-stat {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.alt-zone-tag {
  font-size: 10px;
  font-weight: 600;
  color: #6ee7b7;
  margin-bottom: 6px;
}

.alt-switch-btn {
  width: 100%;
  padding: 6px;
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.2), rgba(255, 92, 138, 0.15));
  border: 1px solid rgba(255, 140, 66, 0.3);
  border-radius: 8px;
  color: #ffb384;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.alt-switch-btn:hover {
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.3), rgba(255, 92, 138, 0.25));
}

.upgrade-note {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
}

.custom-text-section {
  margin-bottom: 14px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.custom-text-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.custom-text-input:focus {
  border-color: #9b59b6;
}

.char-count {
  text-align: right;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 4px;
}

.decor-tips {
  padding: 10px 12px;
  background: rgba(16, 185, 129, 0.04);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 10px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.6;
  margin-bottom: 4px;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-dot {
  color: #10b981;
  font-weight: 700;
}

@media (max-width: 480px) {
  .decor-items-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
