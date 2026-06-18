<template>
  <div class="staff-view">
    <SkyBackground />
    <div class="content-overlay">
      <header class="staff-header">
        <div class="header-left">
          <div class="staff-badge">📋 店员管理终端</div>
          <h1 class="venue-title">Sky Terrace 38 · 运营控制台</h1>
        </div>
        <div class="header-stats">
          <div class="stat-card success">
            <div class="stat-num">{{ availableSeatsCount }}</div>
            <div class="stat-label">空位</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-num">{{ heldCount }}</div>
            <div class="stat-label">保留中</div>
          </div>
          <div class="stat-card info">
            <div class="stat-num">{{ reservedCount }}</div>
            <div class="stat-label">已预订</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-num">{{ occupiedCount }}</div>
            <div class="stat-label">已入座</div>
          </div>
          <div class="stat-card total">
            <div class="stat-num">{{ totalSeatsCount }}</div>
            <div class="stat-label">总座位</div>
          </div>
        </div>
      </header>

      <section class="staff-layout">
        <aside class="staff-sidebar">
          <div class="sidebar-section">
            <h3 class="side-title">快速操作</h3>
            <div class="quick-actions">
              <button class="action-btn" @click="mode = 'hold'" :class="{ active: mode === 'hold' }">
                <span>⏰</span>
                <div>
                  <div class="action-name">迟到保留</div>
                  <div class="action-desc">暂留座位等客</div>
                </div>
              </button>
              <button class="action-btn" @click="mode = 'combine'" :class="{ active: mode === 'combine' }">
                <span>🔗</span>
                <div>
                  <div class="action-name">临时拼桌</div>
                  <div class="action-desc">多桌合并扩容</div>
                </div>
              </button>
              <button class="action-btn" @click="mode = 'move'" :class="{ active: mode === 'move' }">
                <span>🏠</span>
                <div>
                  <div class="action-name">室内迁移</div>
                  <div class="action-desc">天气变动转场</div>
                </div>
              </button>
              <button class="action-btn" @click="mode = 'price'" :class="{ active: mode === 'price' }">
                <span>💎</span>
                <div>
                  <div class="action-name">包厢改价</div>
                  <div class="action-desc">临时价格调整</div>
                </div>
              </button>
              <button class="action-btn" @click="mode = 'closezone'" :class="{ active: mode === 'closezone' }">
                <span>🚧</span>
                <div>
                  <div class="action-name">区域关闭</div>
                  <div class="action-desc">临时关闭露台</div>
                </div>
              </button>
            </div>
          </div>

          <div class="sidebar-section" v-if="mode === 'hold' && selectedSeats.length > 0">
            <h3 class="side-title">⏰ 保留设置</h3>
            <div class="hold-config">
              <div class="seats-preview">{{ selectedSeats.map(s => s.name).join(', ') }}</div>
              <div class="time-options">
                <label>保留时长：</label>
                <select v-model="holdMinutes" class="time-select">
                  <option :value="5">5分钟</option>
                  <option :value="10">10分钟</option>
                  <option :value="15" selected>15分钟</option>
                  <option :value="30">30分钟</option>
                  <option :value="60">60分钟</option>
                </select>
              </div>
              <div class="customer-inputs">
                <input type="text" v-model="holdCustomer" placeholder="客户姓名/手机" class="text-input" />
                <input type="text" v-model="holdRemark" placeholder="备注（选填）" class="text-input" />
              </div>
              <div class="op-btns">
                <button class="op-btn primary" @click="executeHold">确认保留</button>
                <button class="op-btn" @click="clearSelection">取消</button>
              </div>
            </div>
          </div>

          <div class="sidebar-section" v-if="mode === 'combine'">
            <h3 class="side-title">🔗 拼桌操作</h3>
            <div v-if="selectedSeats.length < 2" class="mode-hint">
              请在座位图上点击选择 <strong>2个以上</strong> 相邻座位进行拼桌
            </div>
            <div v-else class="combine-preview">
              <div class="combine-info">
                <div class="combine-label">选中座位：</div>
                <div class="combine-seats">
                  <span v-for="s in selectedSeats" :key="s.id" class="seat-chip">{{ s.name }}</span>
                </div>
                <div class="combine-result">
                  <strong>合并后容量：{{ combineTotalCapacity }} 人</strong>
                </div>
              </div>
              <div class="op-btns">
                <button class="op-btn primary" @click="executeCombine">确认拼桌</button>
                <button class="op-btn" @click="clearSelection">取消</button>
              </div>
            </div>
          </div>

          <div class="sidebar-section" v-if="mode === 'move'">
            <h3 class="side-title">🏠 室内迁移</h3>
            <div v-if="selectedSeats.length === 0" class="mode-hint">
              请在座位图上点击选择需要迁移的室外座位
            </div>
            <div v-else class="move-preview">
              <div class="move-info">
                <div class="move-label">待迁移：</div>
                <div class="move-seats">
                  <span v-for="s in selectedSeats" :key="s.id" class="seat-chip outdoor">{{ s.name }}</span>
                </div>
                <div class="move-hint">
                  ✓ 将自动分配到 <span style="color:#9b59b6;font-weight:600">室内包厢区</span> 空位
                </div>
              </div>
              <div class="op-btns">
                <button class="op-btn primary" @click="executeMove">执行迁移</button>
                <button class="op-btn" @click="clearSelection">取消</button>
              </div>
            </div>
            <div class="moved-list" v-if="movedSeats.length">
              <h4 class="list-title">已迁移记录</h4>
              <div v-for="s in movedSeats" :key="s.id" class="moved-item">
                <span class="moved-name">{{ s._previousName || s.name }} → 室内</span>
                <button class="revert-btn" @click="revertOne(s.id)">↩️ 还原</button>
              </div>
            </div>
          </div>

          <div class="sidebar-section" v-if="mode === 'price'">
            <h3 class="side-title">💎 包厢改价</h3>
            <div v-if="!priceSeat" class="mode-hint">
              请在座位图上点击一个座位进行临时改价
            </div>
            <div v-else class="price-config">
              <div class="price-seat-info">
                <div class="seat-name-lg">{{ priceSeat.name }}</div>
                <div class="price-info-row">
                  <span>原价：</span>
                  <span class="orig-price">¥{{ getSeatEffectivePrice(priceSeat) }}</span>
                </div>
                <div class="price-input-row">
                  <span>临时价：</span>
                  <input type="number" v-model.number="newPriceValue" class="price-input" min="0" />
                </div>
              </div>
              <div class="preset-prices">
                <button v-for="(p, i) in presetPrices" :key="i" class="preset-btn" @click="newPriceValue = p">¥{{ p }}</button>
              </div>
              <div class="op-btns">
                <button class="op-btn primary" @click="executePriceChange">确认改价</button>
                <button class="op-btn" @click="resetPrice">重置原价</button>
                <button class="op-btn" @click="priceSeat = null">取消</button>
              </div>
            </div>
          </div>

          <div class="sidebar-section" v-if="mode === 'closezone'">
            <h3 class="side-title">🚧 区域关闭管理</h3>
            <div class="closezone-list">
              <div
                v-for="zone in ZONES.filter(z => !z.isIndoor)"
                :key="zone.id"
                class="zone-close-item"
                :class="{ closed: isZoneClosed(zone.id) }"
              >
                <div class="zone-close-info">
                  <span class="zone-dot" :style="{ background: zone.color }"></span>
                  <span class="zone-close-name">{{ zone.name }}</span>
                  <span class="zone-close-status" :class="{ on: isZoneClosed(zone.id) }">
                    {{ isZoneClosed(zone.id) ? '已关闭' : '营业中' }}
                  </span>
                </div>
                <div class="zone-close-actions">
                  <button
                    v-if="!isZoneClosed(zone.id)"
                    class="close-zone-btn"
                    @click="closeZoneAndSetRelocation(zone.id)"
                  >
                    关闭
                  </button>
                  <button v-else class="open-zone-btn" @click="openOneZone(zone.id)">
                    开启
                  </button>
                </div>
                <div v-if="isZoneClosed(zone.id)" class="relocation-setting">
                  <label class="relocate-label">迁移至：</label>
                  <select
                    v-model="relocationTargets[zone.id]"
                    class="relocate-select"
                    @change="setRelocationForZone(zone.id)"
                  >
                    <option v-for="tz in getRelocatableZones(zone.id)" :key="tz.id" :value="tz.id">
                      {{ tz.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="closed-summary" v-if="closedZoneCount > 0">
              <span>当前关闭 {{ closedZoneCount }} 个区域</span>
              <button class="open-all-btn" @click="openAllZones">全部开启</button>
            </div>
          </div>

          <div class="sidebar-section mode-info" v-if="mode">
            <div class="info-bar" :class="mode">
              <span class="info-text">{{ modeHint }}</span>
              <button class="clear-btn" @click="clearSelection">清除选择</button>
            </div>
          </div>
        </aside>

        <main class="staff-main">
          <div class="zone-selector-bar">
            <button
              v-for="zone in ZONES" :key="zone.id"
              class="zone-btn"
              :class="{ active: activeZoneId === zone.id, indoor: zone.isIndoor, closed: isZoneClosed(zone.id) }"
              :style="{ '--zc': zone.color }"
              @click="activeZoneId = zone.id"
            >
              <span class="zone-name">{{ zone.name }}</span>
              <span class="zone-sub" v-if="!isZoneClosed(zone.id)">{{ getZoneAvail(zone.id) }}/{{ getZoneTotal(zone.id) }}</span>
              <span class="zone-sub closed" v-else>已关闭</span>
              <span v-if="isZoneClosed(zone.id) && getZoneRelocation(zone.id)" class="zone-relocate">
                → {{ getRelocName(zone.id) }}
              </span>
            </button>
          </div>

          <div class="seat-map-area staff-map">
            <SeatMap
              :zone-id="activeZoneId"
              :staff-mode="true"
              @seat-click="handleStaffSeatClick"
            />
          </div>

          <div class="legend-bar">
            <div class="legend-item available"><span class="dot"></span>可预订</div>
            <div class="legend-item occupied"><span class="dot"></span>已入座</div>
            <div class="legend-item reserved"><span class="dot"></span>已预订</div>
            <div class="legend-item held"><span class="dot"></span>保留中</div>
            <div class="legend-item combined"><span class="dot"></span>已拼桌</div>
            <div class="legend-item selected"><span class="dot"></span>已选中</div>
            <div class="legend-item warn"><span class="dot"></span>遮挡风险</div>
            <div class="legend-item wind"><span class="dot"></span>风力较强</div>
          </div>

          <div class="tables-panel">
            <h3 class="panel-title">📋 当前桌台状态</h3>
            <div class="tables-grid">
              <div
                v-for="seat in displayedTables"
                :key="seat.id"
                class="table-card"
                :class="seat.status"
              >
                <div class="tc-header">
                  <span class="tc-name">{{ seat.name }}</span>
                  <span class="tc-status" :class="seat.status">{{ getStatusLabel(seat.status) }}</span>
                </div>
                <div class="tc-info">
                  <span>👥 {{ getSeatPeople(seat) }}人</span>
                  <span>💰 ¥{{ getSeatEffectivePrice(seat) }}</span>
                </div>
                <div v-if="seat.status === 'reserved'" class="tc-reservation">
                  👤 {{ seat.reservation?.customerName }} · {{ seat.reservation?.time }}
                </div>
                <div v-if="seat.status === 'held' && seat.heldUntil" class="tc-held">
                  ⏳ {{ getTimeRemaining(seat.heldUntil) }}
                </div>
                <div v-if="seat.status === 'occupied'" class="tc-arrived">
                  ✅ 到店 {{ getArrivedAgo(seat.occupiedBy?.arrivedAt) }}
                </div>
                <div class="tc-actions">
                  <button v-if="seat.status === 'held'" class="tc-btn release" @click="releaseOne(seat.id)">释放</button>
                  <button v-if="seat.status === 'available'" class="tc-btn hold" @click="quickHold(seat.id)">速留</button>
                  <button v-if="seat._moved" class="tc-btn revert" @click="revertOne(seat.id)">还原</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import SkyBackground from '../components/SkyBackground.vue'
import SeatMap from '../components/SeatMap.vue'
import { ZONES } from '../data/seatsData'
import {
  store,
  seatsByZone,
  availableSeatsCount, totalSeatsCount,
  holdSeat, releaseSeat,
  combineSeats,
  moveToIndoor, revertMoveToIndoor,
  modifySeatPrice, getSeatEffectivePrice,
  closeZone, openZone, setZoneRelocation, isZoneClosed, getZoneRelocation
} from '../store/bookingStore'

const mode = ref('hold')
const activeZoneId = ref('west')
const selectedSeats = reactive([])
const priceSeat = ref(null)
const holdMinutes = ref(15)
const holdCustomer = ref('')
const holdRemark = ref('')
const newPriceValue = ref(0)
const presetPrices = [188, 288, 388, 588, 888, 1288, 1888]
const relocationTargets = reactive({})

const heldCount = computed(() => store.seats.filter(s => s.status === 'held').length)
const reservedCount = computed(() => store.seats.filter(s => s.status === 'reserved').length)
const occupiedCount = computed(() => store.seats.filter(s => s.status === 'occupied').length)
const movedSeats = computed(() => store.seats.filter(s => s._moved))

const combineTotalCapacity = computed(() => selectedSeats.reduce((a, s) => a + (s.capacity || 0), 0))

const closedZoneCount = computed(() => store.closedZones.length)

const modeHint = computed(() => {
  const hints = {
    hold: '当前模式：【迟到保留】 - 点击可选座位进行保留',
    combine: '当前模式：【临时拼桌】 - 选择2个以上座位合并',
    move: '当前模式：【室内迁移】 - 选择室外座位迁入室内',
    price: '当前模式：【包厢改价】 - 点击座位修改价格',
    closezone: '当前模式：【区域关闭】 - 管理露台区域开放状态'
  }
  return hints[mode.value] || ''
})

function getRelocatableZones(zoneId) {
  return ZONES.filter(z => z.id !== zoneId)
}

function closeZoneAndSetRelocation(zoneId) {
  closeZone(zoneId)
  const defaultTarget = ZONES.find(z => z.isIndoor)?.id || 'indoor'
  if (!relocationTargets[zoneId]) {
    relocationTargets[zoneId] = defaultTarget
  }
  setZoneRelocation(zoneId, relocationTargets[zoneId])
}

function openOneZone(zoneId) {
  openZone(zoneId)
  delete relocationTargets[zoneId]
}

function setRelocationForZone(zoneId) {
  setZoneRelocation(zoneId, relocationTargets[zoneId])
}

function openAllZones() {
  for (const zid of [...store.closedZones]) {
    openZone(zid)
    delete relocationTargets[zid]
  }
}

function getRelocName(zoneId) {
  const targetId = getZoneRelocation(zoneId)
  const targetZone = ZONES.find(z => z.id === targetId)
  return targetZone?.name || '室内'
}

const displayedTables = computed(() => {
  return store.seats.filter(s => !s._hidden && s.status !== 'combined').slice(0, 30)
})

function getZoneAvail(zid) {
  return (seatsByZone.value[zid] || []).filter(s => s.status === 'available').length
}

function getZoneTotal(zid) {
  return (seatsByZone.value[zid] || []).length
}

function clearSelection() {
  selectedSeats.length = 0
  priceSeat.value = null
  holdCustomer.value = ''
  holdRemark.value = ''
}

function handleStaffSeatClick(seat) {
  if (mode.value === 'price') {
    priceSeat.value = seat
    newPriceValue.value = getSeatEffectivePrice(seat)
    return
  }
  if (seat.status === 'occupied' && mode.value !== 'move') return
  if (seat.status === 'combined') return

  const idx = selectedSeats.findIndex(s => s.id === seat.id)
  if (idx > -1) {
    selectedSeats.splice(idx, 1)
  } else {
    selectedSeats.push(seat)
  }

  if (mode.value === 'hold' && selectedSeats.length === 1 && seat.status === 'available') {
    holdMinutes.value = 15
  }
}

function executeHold() {
  for (const s of selectedSeats) {
    if (s.status === 'available') {
      holdSeat(s.id, holdMinutes.value)
    }
  }
  alert(`已保留 ${selectedSeats.length} 个座位，时长 ${holdMinutes.value} 分钟`)
  clearSelection()
}

function quickHold(id) {
  holdSeat(id, 15)
}

function executeCombine() {
  if (selectedSeats.length < 2) return
  combineSeats(selectedSeats.map(s => s.id))
  alert(`拼桌成功！合并 ${selectedSeats.length} 桌，总容量 ${combineTotalCapacity.value} 人`)
  clearSelection()
}

function executeMove() {
  let count = 0
  for (const s of selectedSeats) {
    if (!s._moved && s.zoneId !== 'indoor') {
      s._previousName = s.name
      moveToIndoor(s.id)
      count++
    }
  }
  alert(`已迁移 ${count} 个座位至室内`)
  clearSelection()
}

function revertOne(id) {
  revertMoveToIndoor(id)
}

function executePriceChange() {
  if (!priceSeat.value || !newPriceValue.value) return
  modifySeatPrice(priceSeat.value.id, newPriceValue.value)
  alert(`${priceSeat.value.name} 价格已更新为 ¥${newPriceValue.value}`)
  priceSeat.value = null
}

function resetPrice() {
  if (!priceSeat.value) return
  delete store.priceModifications[priceSeat.value.id]
  newPriceValue.value = getSeatEffectivePrice(priceSeat.value)
}

function releaseOne(id) {
  releaseSeat(id)
}

function getStatusLabel(st) {
  return { available: '可预订', occupied: '已入座', reserved: '已预订', held: '保留中', combined: '已拼桌' }[st] || ''
}

function getSeatPeople(seat) {
  if (seat.occupiedBy) return seat.occupiedBy.people
  if (seat.reservation) return seat.reservation.people
  return seat.capacity
}

function getTimeRemaining(dtStr) {
  const left = new Date(dtStr) - Date.now()
  if (left <= 0) return '已到期'
  return `${Math.floor(left / 60000)}分${Math.floor((left % 60000) / 1000)}秒`
}

function getArrivedAgo(dtStr) {
  if (!dtStr) return ''
  const ago = Date.now() - new Date(dtStr)
  const mins = Math.floor(ago / 60000)
  if (mins < 60) return `${mins}分钟前`
  return `${Math.floor(mins / 60)}小时${mins % 60}分前`
}
</script>

<style scoped>
.staff-view {
  position: relative;
  min-height: 100vh;
}

.content-overlay {
  position: relative;
  z-index: 1;
  padding: 16px;
}

.staff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
  background: rgba(10, 15, 30, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  border: 1px solid rgba(255, 180, 100, 0.15);
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.staff-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.15));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #93c5fd;
  margin-bottom: 6px;
}

.venue-title {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffd700, #ff8c42);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-card {
  padding: 10px 16px;
  border-radius: 12px;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  min-width: 64px;
}

.stat-num {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
}
.stat-card.success .stat-num { color: #34d399; }
.stat-card.warning .stat-num { color: #60a5fa; }
.stat-card.info .stat-num { color: #fbbf24; }
.stat-card.danger .stat-num { color: #f87171; }
.stat-card.total .stat-num { color: #fff; }

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.staff-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
}

.staff-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sidebar-section {
  background: rgba(12, 15, 25, 0.85);
  backdrop-filter: blur(14px);
  border-radius: 16px;
  padding: 14px;
  border: 1px solid rgba(255, 180, 100, 0.1);
}

.side-title {
  font-size: 14px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  transition: all 0.25s;
}

.action-btn:hover {
  border-color: rgba(255, 140, 66, 0.4);
  background: rgba(255, 140, 66, 0.06);
}

.action-btn.active {
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.18), rgba(255, 92, 138, 0.12));
  border-color: rgba(255, 140, 66, 0.5);
  box-shadow: 0 4px 14px rgba(255, 140, 66, 0.15);
}

.action-btn > span:first-child { font-size: 22px; }
.action-name { font-size: 13px; font-weight: 700; color: white; }
.action-desc { font-size: 11px; color: rgba(255, 255, 255, 0.45); margin-top: 1px; }

.mode-hint {
  padding: 14px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px dashed rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
}

.seats-preview {
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.time-options {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.time-select, .text-input, .price-input {
  flex: 1;
  padding: 7px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 12px;
  outline: none;
}

.customer-inputs {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 12px;
}

.op-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.op-btn {
  flex: 1;
  min-width: 80px;
  padding: 9px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.op-btn.primary {
  background: linear-gradient(135deg, #ff8c42, #ff5c8a);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.3);
}

.op-btn:hover { filter: brightness(1.1); }

.combine-preview, .move-preview, .price-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.combine-label, .move-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.combine-seats, .move-seats {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;
}

.seat-chip {
  padding: 4px 9px;
  background: rgba(255, 140, 66, 0.12);
  border: 1px solid rgba(255, 140, 66, 0.3);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #ffb384;
}

.seat-chip.outdoor {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.combine-result {
  padding: 8px 10px;
  background: rgba(155, 89, 182, 0.1);
  border: 1px solid rgba(155, 89, 182, 0.3);
  border-radius: 8px;
  font-size: 13px;
  color: #d8b4fe;
  text-align: center;
}

.move-hint {
  padding: 7px 10px;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.moved-list {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.list-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 8px;
}

.moved-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 9px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 7px;
  font-size: 11px;
  margin-bottom: 5px;
}

.moved-name { color: rgba(255, 255, 255, 0.7); }

.revert-btn {
  padding: 3px 7px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  font-size: 10px;
  color: #93c5fd;
}

.seat-name-lg {
  font-size: 18px;
  font-weight: 800;
  color: #ffd700;
  margin-bottom: 8px;
}

.price-info-row, .price-input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.orig-price {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.35);
}

.price-input { width: 100px; text-align: right; font-size: 14px; font-weight: 700; }

.preset-prices {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.preset-btn {
  padding: 7px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  color: #ffd700;
}

.mode-info {
  background: rgba(255, 140, 66, 0.05) !important;
  border-color: rgba(255, 140, 66, 0.2) !important;
}

.closezone-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zone-close-item {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  transition: all 0.2s;
}

.zone-close-item.closed {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.zone-close-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.zone-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.zone-close-name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.zone-close-status {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.1);
  color: #6ee7b7;
  font-weight: 600;
}

.zone-close-status.on {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.zone-close-actions {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.close-zone-btn, .open-zone-btn {
  flex: 1;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
}

.close-zone-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.close-zone-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.open-zone-btn {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.open-zone-btn:hover {
  background: rgba(16, 185, 129, 0.2);
}

.relocation-setting {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
}

.relocate-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.relocate-select {
  flex: 1;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 11px;
  outline: none;
}

.closed-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.open-all-btn {
  padding: 5px 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #6ee7b7;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.open-all-btn:hover {
  background: rgba(16, 185, 129, 0.2);
}

.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  background: rgba(255, 140, 66, 0.08);
}

.info-text { color: rgba(255, 255, 255, 0.7); font-weight: 500; }

.clear-btn {
  padding: 5px 10px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 7px;
  color: #fca5a5;
  font-size: 11px;
}

.staff-main {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-selector-bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 12px;
  background: rgba(12, 15, 25, 0.85);
  backdrop-filter: blur(14px);
  border-radius: 16px;
  border: 1px solid rgba(255, 180, 100, 0.1);
}

.zone-btn {
  padding: 10px 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: all 0.25s;
  color: rgba(255, 255, 255, 0.65);
}

.zone-btn:hover { border-color: var(--zc); }

.zone-btn.active {
  background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,140,66,0.08));
  border-color: var(--zc);
  box-shadow: 0 0 0 1px var(--zc), 0 4px 14px color-mix(in srgb, var(--zc) 25%, transparent);
  color: white;
}

.zone-btn.closed {
  opacity: 0.5;
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.zone-sub.closed {
  color: #f87171;
}

.zone-relocate {
  display: block;
  font-size: 9px;
  color: #6ee7b7;
  margin-top: 2px;
}

.zone-name { display: block; font-size: 13px; font-weight: 700; color: inherit; }
.zone-sub { display: block; font-size: 10px; opacity: 0.65; margin-top: 3px; }

.seat-map-area {
  background: rgba(12, 15, 25, 0.85);
  backdrop-filter: blur(14px);
  border-radius: 16px;
  padding: 14px;
  border: 1px solid rgba(255, 180, 100, 0.1);
}

.legend-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 10px 14px;
  background: rgba(12, 15, 25, 0.85);
  border-radius: 12px;
  border: 1px solid rgba(255, 180, 100, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.dot {
  width: 10px; height: 10px; border-radius: 50%;
}
.legend-item.available .dot { background: #10b981; }
.legend-item.occupied .dot { background: #ef4444; }
.legend-item.reserved .dot { background: #f59e0b; }
.legend-item.held .dot { background: #3b82f6; animation: pulse 2s infinite; }
.legend-item.combined .dot { background: #8b5cf6; }
.legend-item.selected .dot { background: #ffd700; box-shadow: 0 0 8px #ffd700; }
.legend-item.warn .dot { background: #ff6b6b; border: 2px double; }
.legend-item.wind .dot { background: #60a5fa; }

@keyframes pulse { 50% { opacity: 0.4; } }

.tables-panel {
  background: rgba(12, 15, 25, 0.85);
  backdrop-filter: blur(14px);
  border-radius: 16px;
  padding: 14px;
  border: 1px solid rgba(255, 180, 100, 0.1);
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
}

.table-card {
  padding: 11px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.2s;
}

.table-card.available { border-left: 3px solid #10b981; }
.table-card.occupied { border-left: 3px solid #ef4444; background: rgba(239, 68, 68, 0.04); }
.table-card.reserved { border-left: 3px solid #f59e0b; background: rgba(245, 158, 11, 0.04); }
.table-card.held { border-left: 3px solid #3b82f6; background: rgba(59, 130, 246, 0.04); }

.tc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.tc-name { font-size: 13px; font-weight: 700; color: white; }

.tc-status {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 8px;
  font-weight: 600;
}
.tc-status.available { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; }
.tc-status.occupied { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
.tc-status.reserved { background: rgba(245, 158, 11, 0.15); color: #fcd34d; }
.tc-status.held { background: rgba(59, 130, 246, 0.15); color: #93c5fd; }

.tc-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 6px;
}

.tc-reservation, .tc-held, .tc-arrived {
  padding: 5px 7px;
  border-radius: 6px;
  font-size: 10px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.65);
}

.tc-held { color: #93c5fd; font-family: monospace; }

.tc-actions {
  display: flex;
  gap: 5px;
}

.tc-btn {
  flex: 1;
  padding: 5px 6px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 600;
  transition: all 0.2s;
}
.tc-btn.release { background: rgba(239, 68, 68, 0.12); color: #fca5a5; }
.tc-btn.hold { background: rgba(59, 130, 246, 0.12); color: #93c5fd; }
.tc-btn.revert { background: rgba(16, 185, 129, 0.12); color: #6ee7b7; }
.tc-btn:hover { filter: brightness(1.2); }

@media (max-width: 1100px) {
  .staff-layout { grid-template-columns: 1fr; }
}
</style>
