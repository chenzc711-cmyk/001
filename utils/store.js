const KEYS = {
  inventories: 'sfds_inventories',
  inbounds: 'sfds_inbounds',
  returns: 'sfds_returns',
  outbounds: 'sfds_outbounds',
  costs: 'sfds_costs'
}

const seedInventories = [
  {
    id: 'seed-1',
    category: '女装',
    name: '拾纷云感针织衫',
    spec: '米白 / M',
    price: 129,
    quantity: 86,
    supplier: '杭州云仓供应链',
    remark: '天猫主推款',
    warning: 30,
    createdAt: Date.now()
  },
  {
    id: 'seed-2',
    category: '配饰',
    name: '法式丝绒发箍',
    spec: '黑色 / 均码',
    price: 39,
    quantity: 18,
    supplier: '义乌拾光饰品',
    remark: '低库存预警样例',
    warning: 25,
    createdAt: Date.now()
  }
]

function read(key) {
  const value = wx.getStorageSync(KEYS[key])
  if (value) return value
  if (key === 'inventories') {
    wx.setStorageSync(KEYS.inventories, seedInventories)
    return seedInventories
  }
  return []
}

function write(key, value) {
  wx.setStorageSync(KEYS[key], value)
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function upsert(key, item) {
  const list = read(key)
  if (item.id) {
    const next = list.map(row => row.id === item.id ? { ...row, ...item, updatedAt: Date.now() } : row)
    write(key, next)
    return next
  }
  const next = [{ ...item, id: createId(key), createdAt: Date.now() }, ...list]
  write(key, next)
  return next
}

function removeMany(key, ids) {
  const next = read(key).filter(item => ids.indexOf(item.id) === -1)
  write(key, next)
  return next
}

function adjustStock({ name, spec, supplier, price, delta, category = '未分类', remark = '系统自动维护', warning = 10 }) {
  const inventories = read('inventories')
  const index = inventories.findIndex(item => item.name === name && item.spec === spec)
  if (index >= 0) {
    inventories[index] = {
      ...inventories[index],
      price: Number(price || inventories[index].price || 0),
      quantity: Math.max(0, Number(inventories[index].quantity || 0) + Number(delta || 0)),
      supplier: supplier || inventories[index].supplier,
      updatedAt: Date.now()
    }
  } else if (Number(delta || 0) > 0) {
    inventories.unshift({
      id: createId('inventories'),
      category,
      name,
      spec,
      price: Number(price || 0),
      quantity: Number(delta || 0),
      supplier,
      remark,
      warning: Number(warning || 0),
      createdAt: Date.now()
    })
  }
  write('inventories', inventories)
}

function todayText() {
  const now = new Date()
  return formatDate(now)
}

function monthText() {
  return todayText().slice(0, 7)
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

module.exports = {
  read,
  write,
  upsert,
  removeMany,
  adjustStock,
  todayText,
  monthText,
  money
}
