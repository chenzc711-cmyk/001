const store = require('../../utils/store')
const emptyForm = { id: '', date: '', orderNo: '', expressCompany: '', expressNo: '', name: '', spec: '', quantity: '', status: '', remark: '' }

Page({
  data: { form: { ...emptyForm }, list: [], filtered: [], startDate: '', endDate: '', selectedIds: [], selectedMap: {}, allSelected: false },
  onShow() { this.refresh() },
  refresh() { this.setData({ list: store.read('returns') }); this.applyFilter() },
  onInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }) },
  onPicker(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }) },
  onFilter(e) { this.setData({ [e.currentTarget.dataset.field]: e.detail.value }); this.applyFilter() },
  clearFilter() { this.setData({ startDate: '', endDate: '' }); this.applyFilter() },
  applyFilter() { const { list, startDate, endDate } = this.data; const filtered = list.filter(item => (!startDate || item.date >= startDate) && (!endDate || item.date <= endDate)); this.setData({ filtered }); this.syncSelection(this.data.selectedIds.filter(id => filtered.some(item => item.id === id))) },
  save() {
    const form = this.data.form
    if (!form.date || !form.orderNo || !form.name) { wx.showToast({ title: '请填写日期、订单号和商品', icon: 'none' }); return }
    const quantity = Number(form.quantity || 0)
    const old = form.id ? this.data.list.find(item => item.id === form.id) : null
    if (old) store.adjustStock({ name: old.name, spec: old.spec, delta: -Number(old.quantity || 0) })
    store.upsert('returns', { ...form, quantity })
    store.adjustStock({ name: form.name, spec: form.spec, delta: quantity, remark: '由退货入库自动创建' })
    wx.showToast({ title: form.id ? '已保存' : '已登记', icon: 'success' })
    this.resetForm(); this.refresh()
  },
  edit(e) { const item = this.data.list.find(row => row.id === e.currentTarget.dataset.id); if (item) this.setData({ form: { ...item } }) },
  resetForm() { this.setData({ form: { ...emptyForm } }) },
  onSelectChange(e) { this.syncSelection(e.detail.value) },
  toggleSelectAll() { this.syncSelection(this.data.allSelected ? [] : this.data.filtered.map(item => item.id)) },
  syncSelection(ids) { const selectedMap = {}; ids.forEach(id => { selectedMap[id] = true }); this.setData({ selectedIds: ids, selectedMap, allSelected: ids.length > 0 && ids.length === this.data.filtered.length }) },
  deleteSelected() { if (!this.data.selectedIds.length) { wx.showToast({ title: '请先选择记录', icon: 'none' }); return } store.removeMany('returns', this.data.selectedIds); this.syncSelection([]); this.refresh() }
})
