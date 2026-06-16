export const ZONES = [
  {
    id: 'west',
    name: '落日主区',
    direction: '正西',
    description: '直面落日余晖，晚霞最佳观赏位',
    sunsetView: 100,
    citySkyline: 85,
    windLevel: '中等',
    hasRainCover: true,
    color: '#ff6b35',
    premium: true
  },
  {
    id: 'north',
    name: '天际线区',
    direction: '正北',
    description: '城市地标全景，摩天大楼尽收眼底',
    sunsetView: 60,
    citySkyline: 100,
    windLevel: '偏高',
    hasRainCover: true,
    color: '#00d4ff',
    premium: true
  },
  {
    id: 'south',
    name: '江景区',
    direction: '正南',
    description: '江景灯火，波光粼粼夜景优美',
    sunsetView: 70,
    citySkyline: 80,
    windLevel: '较低',
    hasRainCover: false,
    color: '#10b981',
    premium: false
  },
  {
    id: 'east',
    name: '吧台休闲区',
    direction: '正东',
    description: '紧邻吧台，调酒表演零距离',
    sunsetView: 30,
    citySkyline: 50,
    windLevel: '低',
    hasRainCover: true,
    color: '#ffd700',
    premium: false
  },
  {
    id: 'indoor',
    name: '室内包厢区',
    direction: '室内',
    description: '空调恒温，私密安静，不受天气影响',
    sunsetView: 20,
    citySkyline: 40,
    windLevel: '无',
    hasRainCover: true,
    color: '#9b59b6',
    premium: true,
    isIndoor: true
  }
]

export const SEAT_TYPES = [
  { id: 'railing', name: '靠栏杆位', icon: '🌅', desc: '紧贴露台边缘，无遮挡视野', priceMultiplier: 1.5 },
  { id: 'high', name: '高脚桌', icon: '🍸', desc: '高脚桌椅，适合小聚聊天', priceMultiplier: 1.2 },
  { id: 'sofa', name: '沙发角', icon: '🛋️', desc: '舒适沙发，宽敞私密', priceMultiplier: 1.3 },
  { id: 'bar', name: '吧台位', icon: '🍹', desc: '直面调酒师，互动体验', priceMultiplier: 1.0 },
  { id: 'table', name: '普通方桌', icon: '🪑', desc: '标准桌椅，经济实惠', priceMultiplier: 1.0 },
  { id: 'vip', name: 'VIP包厢', icon: '👑', desc: '独立空间，专属服务', priceMultiplier: 2.0 }
]

function generateSeats() {
  const seats = []
  let id = 1
  const zoneLayouts = {
    west: [
      { type: 'railing', count: 6, capacity: [2, 2, 2, 3, 2, 2], price: 888, x: 5, y: 10, step: 14 },
      { type: 'sofa', count: 3, capacity: [6, 4, 8], price: 1288, x: 15, y: 35, step: 28 },
      { type: 'high', count: 4, capacity: [2, 3, 2, 4], price: 588, x: 10, y: 55, step: 20 },
    ],
    north: [
      { type: 'railing', count: 5, capacity: [2, 2, 3, 2, 2], price: 688, x: 5, y: 10, step: 16 },
      { type: 'table', count: 6, capacity: [4, 4, 6, 4, 4, 6], price: 388, x: 12, y: 40, step: 14 },
      { type: 'sofa', count: 2, capacity: [4, 6], price: 988, x: 25, y: 70, step: 35 },
    ],
    south: [
      { type: 'railing', count: 4, capacity: [2, 2, 2, 2], price: 588, x: 5, y: 15, step: 18 },
      { type: 'high', count: 5, capacity: [2, 2, 3, 2, 2], price: 428, x: 12, y: 45, step: 16 },
      { type: 'table', count: 4, capacity: [4, 4, 4, 4], price: 288, x: 20, y: 70, step: 18 },
    ],
    east: [
      { type: 'bar', count: 8, capacity: [1, 1, 1, 1, 1, 1, 1, 1], price: 188, x: 5, y: 20, step: 10 },
      { type: 'high', count: 4, capacity: [2, 2, 2, 2], price: 368, x: 20, y: 50, step: 18 },
      { type: 'table', count: 2, capacity: [4, 4], price: 268, x: 30, y: 75, step: 28 },
    ],
    indoor: [
      { type: 'vip', count: 3, capacity: [10, 8, 12], price: 2888, x: 10, y: 20, step: 28 },
      { type: 'sofa', count: 2, capacity: [6, 8], price: 1588, x: 30, y: 55, step: 30 },
      { type: 'table', count: 3, capacity: [4, 6, 4], price: 688, x: 15, y: 80, step: 22 },
    ]
  }

  for (const zone of Object.keys(zoneLayouts)) {
    const layouts = zoneLayouts[zone]
    for (const layout of layouts) {
      for (let i = 0; i < layout.count; i++) {
        const random = Math.random()
        let status = 'available'
        if (random < 0.3) status = 'occupied'
        else if (random < 0.4) status = 'reserved'
        else if (random < 0.45) status = 'held'

        seats.push({
          id: `S${String(id).padStart(3, '0')}`,
          zoneId: zone,
          type: layout.type,
          name: `${ZONES.find(z => z.id === zone)?.name.slice(0, 2)}-${String(i + 1).padStart(2, '0')}`,
          capacity: layout.capacity[i],
          basePrice: layout.price,
          deposit: Math.round(layout.price * 0.3),
          status: status,
          x: layout.x + i * layout.step,
          y: layout.y,
          width: layout.type === 'railing' ? 10 : layout.type === 'vip' ? 18 : layout.type === 'sofa' ? 16 : 12,
          height: layout.type === 'railing' ? 8 : layout.type === 'vip' ? 14 : layout.type === 'sofa' ? 10 : 10,
          hasOcclusionRisk: Math.random() < 0.15 && zone !== 'indoor',
          windFactor: zone === 'north' ? 1.2 : zone === 'west' ? 1.0 : zone === 'south' ? 0.8 : 0.6,
          canBirthdayDecor: status !== 'occupied',
          heldUntil: status === 'held' ? new Date(Date.now() + Math.random() * 30 * 60 * 1000).toISOString() : null,
          reservation: status === 'reserved' ? {
            customerName: ['张先生', '李女士', '王总', '陈小姐', '刘先生'][Math.floor(Math.random() * 5)],
            phone: '138****' + Math.floor(1000 + Math.random() * 9000),
            time: '19:00',
            people: layout.capacity[i],
            depositPaid: true
          } : null,
          occupiedBy: status === 'occupied' ? {
            arrivedAt: new Date(Date.now() - Math.random() * 120 * 60 * 1000).toISOString(),
            people: Math.ceil(layout.capacity[i] * (0.5 + Math.random() * 0.5))
          } : null
        })
        id++
      }
    }
  }
  return seats
}

export const SEATS = generateSeats()

export const TIME_SLOTS = [
  { id: 'afternoon', name: '下午茶时段', time: '14:00 - 17:00', priceFactor: 0.7, skyPhase: 'afternoon', lightLevel: 1.0 },
  { id: 'golden', name: '黄金日落', time: '17:30 - 19:30', priceFactor: 1.5, skyPhase: 'sunset', lightLevel: 0.7, isPremium: true },
  { id: 'blue', name: '蓝调时刻', time: '19:30 - 20:30', priceFactor: 1.3, skyPhase: 'blue', lightLevel: 0.4, isPremium: true },
  { id: 'night1', name: '夜色撩人', time: '20:30 - 23:00', priceFactor: 1.0, skyPhase: 'night', lightLevel: 0.2 },
  { id: 'night2', name: '深夜微醺', time: '23:00 - 02:00', priceFactor: 0.8, skyPhase: 'latenight', lightLevel: 0.15 }
]

export const LIVE_SCHEDULE = [
  { time: '18:30', artist: '林夕·爵士弹唱', style: 'Jazz', zone: 'west', duration: 90 },
  { time: '20:30', artist: 'DJ Ray', style: 'House', zone: 'east', duration: 120 },
  { time: '22:30', artist: '乐队·夜空', style: 'Pop Rock', zone: 'north', duration: 90 }
]

export const PACKAGES = [
  {
    id: 'p1',
    name: '日落微醺',
    minSpend: 588,
    price: 588,
    includes: ['气泡酒 1瓶', '精选小食 2份', '水果拼盘 1份'],
    suitableFor: 2,
    tag: '情侣推荐',
    color: '#ff6b35'
  },
  {
    id: 'p2',
    name: '晚霞派对',
    minSpend: 1288,
    price: 1288,
    includes: ['红/白葡萄酒 2瓶', '特调鸡尾酒 4杯', '豪华小食拼盘', '生蚝半打'],
    suitableFor: 6,
    tag: '朋友聚会',
    color: '#ff5c8a'
  },
  {
    id: 'p3',
    name: '城市之光',
    minSpend: 2888,
    price: 2888,
    includes: ['香槟 1瓶', '精酿威士忌套餐', '全品类小食畅吃', '专属调酒师服务'],
    suitableFor: 10,
    tag: '商务宴请',
    color: '#ffd700',
    vip: true
  },
  {
    id: 'p4',
    name: '夜色专属',
    minSpend: 5888,
    price: 5888,
    includes: ['VIP包厢 4小时', '顶级香槟 2瓶', '私人管家服务', '生日/纪念日布置'],
    suitableFor: 12,
    tag: '至尊体验',
    color: '#9b59b6',
    vip: true
  }
]

export const FLOOR_INFO = {
  floor: 38,
  totalArea: '800㎡',
  capacity: 220,
  entrance: {
    description: '38层高空电梯厅，专属礼宾引导',
    openTime: '14:00 开始营业',
    dressCode: '建议商务休闲装，避免拖鞋短裤'
  }
}

export const WEATHER_INFO = {
  today: {
    temp: 28,
    condition: '晴',
    sunset: '19:12',
    windSpeed: 12,
    rainChance: 10,
    humidity: 65
  },
  rainCoverOpen: true
}
