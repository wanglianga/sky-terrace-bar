import { reactive, computed, ref } from 'vue'
import { SEATS, ZONES, TIME_SLOTS, PACKAGES, WEATHER_INFO, BIRTHDAY_DECOR_ITEMS, CLOUD_COVERAGE_OPTIONS, SUNSET_DATE_FACTORS, SEAT_TYPES } from '../data/seatsData'

export const store = reactive({
  seats: JSON.parse(JSON.stringify(SEATS)),
  selectedTimeSlot: TIME_SLOTS[1],
  selectedSeatIds: [],
  selectedZoneId: null,
  selectedPackageId: null,
  filterType: null,
  filterCapacity: null,
  viewMode: 'customer',
  rainCoverOpen: WEATHER_INFO.rainCoverOpen,
  heldSeats: {},
  combineRequests: [],
  priceModifications: {},
  closedZones: [],
  zoneRelocations: {},
  selectedCloudCoverage: 'light',
  selectedDate: new Date().toISOString().split('T')[0],
  birthdayDecor: {
    enabled: false,
    selectedItems: [],
    customText: ''
  },
  showSunsetRecommendation: true
})

export const currentTime = ref(new Date())

setInterval(() => {
  currentTime.value = new Date()
}, 1000)

export const getSkyPhase = computed(() => {
  return store.selectedTimeSlot?.skyPhase || 'sunset'
})

export const seatsByZone = computed(() => {
  const result = {}
  for (const z of ZONES) {
    result[z.id] = store.seats.filter(s => s.zoneId === z.id)
  }
  return result
})

export const availableSeatsCount = computed(() => {
  return store.seats.filter(s => s.status === 'available').length
})

export const totalSeatsCount = computed(() => store.seats.length)

export function selectTimeSlot(slot) {
  store.selectedTimeSlot = slot
}

export function toggleSeatSelection(seatId) {
  const idx = store.selectedSeatIds.indexOf(seatId)
  if (idx > -1) {
    store.selectedSeatIds.splice(idx, 1)
  } else {
    const seat = store.seats.find(s => s.id === seatId)
    if (seat && seat.status === 'available') {
      store.selectedSeatIds.push(seatId)
    }
  }
}

export function selectZone(zoneId) {
  store.selectedZoneId = store.selectedZoneId === zoneId ? null : zoneId
}

export function setFilterType(type) {
  store.filterType = store.filterType === type ? null : type
}

export function setFilterCapacity(cap) {
  store.filterCapacity = store.filterCapacity === cap ? null : cap
}

export function selectPackage(pkgId) {
  store.selectedPackageId = store.selectedPackageId === pkgId ? null : pkgId
}

export function toggleRainCover() {
  store.rainCoverOpen = !store.rainCoverOpen
}

export function holdSeat(seatId, minutes = 15) {
  const seat = store.seats.find(s => s.id === seatId)
  if (seat && seat.status === 'available') {
    seat.status = 'held'
    seat.heldUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString()
  }
}

export function releaseSeat(seatId) {
  const seat = store.seats.find(s => s.id === seatId)
  if (seat && seat.status === 'held') {
    seat.status = 'available'
    seat.heldUntil = null
  }
}

export function combineSeats(seatIds) {
  if (seatIds.length < 2) return
  const totalCap = seatIds.reduce((sum, id) => {
    const s = store.seats.find(x => x.id === id)
    return sum + (s?.capacity || 0)
  }, 0)
  const firstId = seatIds[0]
  const first = store.seats.find(s => s.id === firstId)
  if (first) {
    first._combined = seatIds
    first._originalCapacity = first.capacity
    first.capacity = totalCap
    first.status = 'available'
    for (const id of seatIds.slice(1)) {
      const s = store.seats.find(x => x.id === id)
      if (s) s.status = 'combined'
    }
  }
}

export function moveToIndoor(seatId) {
  const seat = store.seats.find(s => s.id === seatId)
  if (seat && !seat._moved) {
    seat._previousZone = seat.zoneId
    seat._previousX = seat.x
    seat._previousY = seat.y
    seat.zoneId = 'indoor'
    seat.x = 60 + Math.random() * 30
    seat.y = 50 + Math.random() * 30
    seat._moved = true
  }
}

export function revertMoveToIndoor(seatId) {
  const seat = store.seats.find(s => s.id === seatId)
  if (seat && seat._moved && seat._previousZone) {
    seat.zoneId = seat._previousZone
    seat.x = seat._previousX
    seat.y = seat._previousY
    seat._moved = false
    delete seat._previousZone
    delete seat._previousX
    delete seat._previousY
  }
}

export function modifySeatPrice(seatId, newPrice) {
  store.priceModifications[seatId] = newPrice
}

export function getSeatEffectivePrice(seat) {
  const modified = store.priceModifications[seat.id]
  if (modified) return modified
  const timeFactor = store.selectedTimeSlot?.priceFactor || 1
  const typeInfo = { railing: 1.5, high: 1.2, sofa: 1.3, bar: 1.0, table: 1.0, vip: 2.0 }
  const typeFactor = typeInfo[seat.type] || 1
  return Math.round(seat.basePrice * timeFactor * typeFactor)
}

export function getSelectedTotalPrice() {
  return store.selectedSeatIds.reduce((sum, id) => {
    const seat = store.seats.find(s => s.id === id)
    return sum + (seat ? getSeatEffectivePrice(seat) : 0)
  }, 0)
}

export function getSeatDeposit(seat) {
  return Math.round(getSeatEffectivePrice(seat) * 0.3)
}

export function getSelectedTotalDeposit() {
  return store.selectedSeatIds.reduce((sum, id) => {
    const seat = store.seats.find(s => s.id === id)
    return sum + (seat ? getSeatDeposit(seat) : 0)
  }, 0)
}

export function closeZone(zoneId) {
  if (!store.closedZones.includes(zoneId)) {
    store.closedZones.push(zoneId)
  }
}

export function openZone(zoneId) {
  const idx = store.closedZones.indexOf(zoneId)
  if (idx > -1) {
    store.closedZones.splice(idx, 1)
    delete store.zoneRelocations[zoneId]
  }
}

export function setZoneRelocation(zoneId, targetZoneId) {
  store.zoneRelocations[zoneId] = targetZoneId
}

export function getZoneRelocation(zoneId) {
  return store.zoneRelocations[zoneId] || null
}

export function isZoneClosed(zoneId) {
  return store.closedZones.includes(zoneId)
}

export function setCloudCoverage(cloudId) {
  store.selectedCloudCoverage = cloudId
}

export function setSelectedDate(dateStr) {
  store.selectedDate = dateStr
}

export function toggleBirthdayDecor() {
  store.birthdayDecor.enabled = !store.birthdayDecor.enabled
  if (!store.birthdayDecor.enabled) {
    store.birthdayDecor.selectedItems = []
    store.birthdayDecor.customText = ''
  }
}

export function toggleDecorItem(itemId) {
  const idx = store.birthdayDecor.selectedItems.indexOf(itemId)
  if (idx > -1) {
    store.birthdayDecor.selectedItems.splice(idx, 1)
  } else {
    store.birthdayDecor.selectedItems.push(itemId)
  }
}

export function getSelectedDecorItems() {
  return BIRTHDAY_DECOR_ITEMS.filter(item => store.birthdayDecor.selectedItems.includes(item.id))
}

export function getTotalDecorPrice() {
  return getSelectedDecorItems().reduce((sum, item) => sum + item.price, 0)
}

export function getTotalSetupTime() {
  return getSelectedDecorItems().reduce((sum, item) => sum + item.setupTime, 0)
}

export function getDateFactor() {
  const month = new Date(store.selectedDate).getMonth() + 1
  const factor = SUNSET_DATE_FACTORS.find(f => f.month === month)
  return factor || { factor: 1, sunsetTime: '18:30', goldenHour: 40 }
}

export function getCloudFactor() {
  return CLOUD_COVERAGE_OPTIONS.find(c => c.id === store.selectedCloudCoverage) || CLOUD_COVERAGE_OPTIONS[1]
}

export function calculateSunsetScore(zone) {
  if (!zone?.sunsetQuality || zone.isIndoor) return 0
  const q = zone.sunsetQuality
  const dateFactor = getDateFactor()
  const cloudFactor = getCloudFactor()
  const occlusionPenalty = q.buildingOcclusion * 0.5
  const cloudBonus = cloudFactor.sunsetEnhancement * (q.cloudEnhancement / 100) * 0.3
  const dateBonus = dateFactor.factor * 10
  const score = Math.min(100, Math.max(0,
    q.photoAngle * 0.35 +
    q.backlightScore * 0.2 +
    (q.goldenHourDuration + q.blueHourDuration) * 0.25 +
    cloudBonus +
    dateBonus -
    occlusionPenalty
  ))
  return Math.round(score)
}

export function getSunsetQualityLabel(score) {
  if (score >= 90) return { label: '极佳', color: '#ffd700', stars: 5 }
  if (score >= 75) return { label: '优秀', color: '#ff8c42', stars: 4 }
  if (score >= 60) return { label: '良好', color: '#10b981', stars: 3 }
  if (score >= 40) return { label: '一般', color: '#60a5fa', stars: 2 }
  return { label: '较差', color: '#9ca3af', stars: 1 }
}

export function checkDecorFit(seat) {
  const seatType = SEAT_TYPES.find(t => t.id === seat?.type)
  if (!seatType) return { fits: true, overflowItems: [], message: '' }
  const selectedItems = getSelectedDecorItems()
  const maxItems = seatType.maxDecorItems
  const overflowItems = selectedItems.filter(item => {
    if (item.requires && item.requires.length > 0) {
      return !item.requires.includes(seat.type) && !item.requires.includes(seat.zoneId)
    }
    return false
  })
  const countOverflow = selectedItems.length > maxItems
  const fits = !countOverflow && overflowItems.length === 0
  let message = ''
  if (countOverflow) {
    message = `桌面容量不足，最多可摆放 ${maxItems} 项布置，当前选择 ${selectedItems.length} 项`
  } else if (overflowItems.length > 0) {
    message = `${overflowItems.map(i => i.name).join('、')} 不适合此座位类型`
  }
  return { fits, overflowItems, countOverflow, maxItems, currentCount: selectedItems.length, message }
}

export function getAdjacentZoneOptions(zoneId) {
  const zone = ZONES.find(z => z.id === zoneId)
  if (!zone) return []
  return ZONES.filter(z => zone.adjacentZones?.includes(z.id) && !isZoneClosed(z.id))
}

export function getBetterDecorZones(seat) {
  const currentFit = checkDecorFit(seat)
  if (currentFit.fits) return []
  const zone = ZONES.find(z => z.id === seat.zoneId)
  const adjacentZones = zone?.adjacentZones || []
  const betterOptions = []
  for (const zId of adjacentZones) {
    const zSeats = store.seats.filter(s => s.zoneId === zId && s.status === 'available')
    if (zSeats.length > 0) {
      const sampleSeat = zSeats[0]
      const fit = checkDecorFit(sampleSeat)
      const z = ZONES.find(zone => zone.id === zId)
      if (fit.fits || fit.currentCount < currentFit.currentCount) {
        betterOptions.push({
          zoneId: zId,
          zoneName: z?.name || zId,
          zoneColor: z?.color || '#999',
          minSpend: z?.minSpend || 0,
          sunsetScore: calculateSunsetScore(z),
          availableCount: zSeats.length,
          fitsBetter: fit.fits
        })
      }
    }
  }
  return betterOptions.sort((a, b) => b.sunsetScore - a.sunsetScore)
}
