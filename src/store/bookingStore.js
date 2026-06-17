import { reactive, computed, ref } from 'vue'
import { SEATS, ZONES, TIME_SLOTS, PACKAGES, WEATHER_INFO } from '../data/seatsData'

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
  priceModifications: {}
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
