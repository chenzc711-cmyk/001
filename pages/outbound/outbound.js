const store = require('../../utils/store')
const emptyForm = { id: '', date: '', name: '', spec: '', quantity: '', price: '', total: 0, remark: '' }
const emptyCostForm = { id: '', date: '', amount: '', purpose: '', category: '', remark: '' }

Page({
  data: {
    form: { ...emptyForm }, computedTotal: '0.00', list: [], filtered: [], startDate: '', endDate: '', selectedIds: [], selectedMap: {}, allSelected: false,
    costForm: { ...emptyCostForm }, costCategories: ['代发成本', '采购成本', '人工成本', '其他成本'], costCategoryIndex: 0, costs: [], costSelectedIds: [], costSelectedMap: {}, costAllSelected: false
  },
  onShow() { this.refresh(); this.refreshCosts() },
  refresh() { this.setData({ list: store.read('outbounds') }); this.applyFilter() },
  refreshCosts() { const costs = store.read('costs'); this.setData({ costs }); this.syncCostSelection(this.data.costSelectedIds.filter(id => costs.some(item => item.id === id))) },
  onInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }); this.updateTotal() },
  onPicker(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }) },
  updateTotal() { this.setData({ computedTotal: store.money(Number(this.data.form.quantity || 0) * Number(this.data.form.price || 0)) }) },
  onFilter(e) { this.setData({ [e.currentTarget.dataset.field]: e.detail.value }); this.applyFilter() },
  clearFilter() { this.setData({ startDate: '', endDate: '' }); this.applyFilter() },
  applyFilter() { const { list, startDate, endDate } = this.data; const filtered = list.filter(item => (!startDate || item.date >= startDate) && (!endDate || item.date <= endDate)); this.setData({ filtered }); this.syncSelection(this.data.selectedIds.filter(id => filtered.some(item => item.id === id))) },
  save() {
    const form = this.data.form
    if (!form.date || !form.name || !form.spec) { wx.showToast({ title: '请填写日期、商品和规格', icon: 'none' }); return }
    const quantity = Number(form.quantity || 0)
    const price = Number(form.price || 0)
    const old = form.id ? this.data.list.find(item => item.id === form.id) : null
    if (old) store.adjustStock({ name: old.name, spec: old.spec, price: old.price, delta: Number(old.quantity || 0) })
    store.upsert('outbounds', { ...form, quantity, price, total: store.money(quantity * price) })
    store.adjustStock({ name: form.name, spec: form.spec, price, delta: -quantity })
    wx.showToast({ title: form.id ? '已保存' : '已出库', icon: 'success' })
    this.resetForm(); this.refresh()
  },
  edit(e) { const item = this.data.list.find(row => row.id === e.currentTarget.dataset.id); if (item) this.setData({ form: { ...item }, computedTotal: item.total }) },
  resetForm() { this.setData({ form: { ...emptyForm }, computedTotal: '0.00' }) },
  onSelectChange(e) { this.syncSelection(e.detail.value) },
  toggleSelectAll() { this.syncSelection(this.data.allSelected ? [] : this.data.filtered.map(item => item.id)) },
  syncSelection(ids) { const selectedMap = {}; ids.forEach(id => { selectedMap[id] = true }); this.setData({ selectedIds: ids, selectedMap, allSelected: ids.length > 0 && ids.length === this.data.filtered.length }) },
  deleteSelected() { if (!this.data.selectedIds.length) { wx.showToast({ title: '请先选择记录', icon: 'none' }); return } store.removeMany('outbounds', this.data.selectedIds); this.syncSelection([]); this.refresh() },
  onCostInput(e) { this.setData({ [`costForm.${e.currentTarget.dataset.field}`]: e.detail.value }) },
  onCostPicker(e) { this.setData({ [`costForm.${e.currentTarget.dataset.field}`]: e.detail.value }) },
  onCostCategory(e) { const index = Number(e.detail.value); this.setData({ costCategoryIndex: index, 'costForm.category': this.data.costCategories[index] }) },
  saveCost() { const form = this.data.costForm; if (!form.date || !form.amount || !form.purpose) { wx.showToast({ title: '请填写支出时间、金额和用途', icon: 'none' }); return } store.upsert('costs', { ...form, amount: Number(form.amount || 0), category: form.category || this.data.costCategories[0] }); wx.showToast({ title: form.id ? '已保存' : '已登记', icon: 'success' }); this.resetCostForm(); this.refreshCosts() },
  editCost(e) { const item = this.data.costs.find(row => row.id === e.currentTarget.dataset.id); if (item) this.setData({ costForm: { ...item }, costCategoryIndex: Math.max(0, this.data.costCategories.indexOf(item.category)) }) },
  resetCostForm() { this.setData({ costForm: { ...emptyCostForm }, costCategoryIndex: 0 }) },
  onCostSelectChange(e) { this.syncCostSelection(e.detail.value) },
  toggleCostSelectAll() { this.syncCostSelection(this.data.costAllSelected ? [] : this.data.costs.map(item => item.id)) },
  syncCostSelection(ids) { const costSelectedMap = {}; ids.forEach(id => { costSelectedMap[id] = true }); this.setData({ costSelectedIds: ids, costSelectedMap, costAllSelected: ids.length > 0 && ids.length === this.data.costs.length }) },
  deleteSelectedCosts() { if (!this.data.costSelectedIds.length) { wx.showToast({ title: '请先选择成本记录', icon: 'none' }); return } store.removeMany('costs', this.data.costSelectedIds); this.syncCostSelection([]); this.refreshCosts() }
})
