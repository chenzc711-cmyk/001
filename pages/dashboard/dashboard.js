const store = require('../../utils/store')

Page({
  data: {
    stats: [],
    month: {},
    warningItems: []
  },
  onShow() {
    if (!wx.getStorageSync('sfds_authed')) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.refresh()
  },
  refresh() {
    const inventories = store.read('inventories')
    const inbounds = store.read('inbounds')
    const returns = store.read('returns')
    const outbounds = store.read('outbounds')
    const costs = store.read('costs')
    const today = store.todayText()
    const month = store.monthText()
    const stockQty = inventories.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    const stockAmount = inventories.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0)
    const warningItems = inventories.filter(item => Number(item.quantity || 0) <= Number(item.warning || 0))
    const supplierBalance = inventories.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0) + costs.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const todayOut = outbounds.filter(item => item.date === today)
    const todayIn = inbounds.filter(item => item.date === today)
    const monthIn = inbounds.filter(item => item.date && item.date.indexOf(month) === 0)
    const monthOut = outbounds.filter(item => item.date && item.date.indexOf(month) === 0)
    const sumQty = list => list.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    const sumAmount = list => list.reduce((sum, item) => sum + Number(item.total || (Number(item.quantity || 0) * Number(item.price || 0))), 0)

    this.setData({
      warningItems,
      month: {
        inQty: sumQty(monthIn),
        inAmount: store.money(sumAmount(monthIn)),
        outQty: sumQty(monthOut),
        outAmount: store.money(sumAmount(monthOut))
      },
      stats: [
        { label: '商品数量', value: inventories.length, extra: '已建档 SKU' },
        { label: '库存数量', value: stockQty, extra: '当前在库件数' },
        { label: '库存总金额', value: `¥${store.money(stockAmount)}`, extra: '按商品单价估算' },
        { label: '库存预警', value: warningItems.length, extra: '需及时补货', warn: warningItems.length > 0 },
        { label: '供应商货款余额', value: `¥${store.money(supplierBalance)}`, extra: '库存货值 + 成本登记' },
        { label: '今日出库', value: `${sumQty(todayOut)} 件`, extra: `金额 ¥${store.money(sumAmount(todayOut))}` },
        { label: '今日入库', value: `${sumQty(todayIn)} 件`, extra: `金额 ¥${store.money(sumAmount(todayIn))}` },
        { label: '退货入库', value: returns.length, extra: '累计退货记录' }
      ]
    })
  }
})
