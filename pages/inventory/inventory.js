const store = require('../../utils/store')

const emptyForm = {
  id: '',
  category: '',
  name: '',
  spec: '',
  price: '',
  quantity: '',
  supplier: '',
  remark: '',
  warning: ''
}

Page({
  data: {
    form: { ...emptyForm },
    list: [],
    selectedIds: [],
    selectedMap: {},
    allSelected: false
  },
  onShow() {
    this.refresh()
  },
  refresh() {
    const list = store.read('inventories')
    this.setData({ list })
    this.syncSelection(this.data.selectedIds.filter(id => list.some(item => item.id === id)))
  },
  onInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value })
  },
  save() {
    const form = this.data.form
    if (!form.name || !form.spec) {
      wx.showToast({ title: '请填写商品名称和规格', icon: 'none' })
      return
    }
    store.upsert('inventories', {
      ...form,
      price: Number(form.price || 0),
      quantity: Number(form.quantity || 0),
      warning: Number(form.warning || 0)
    })
    wx.showToast({ title: form.id ? '已保存' : '已添加', icon: 'success' })
    this.resetForm()
    this.refresh()
  },
  edit(e) {
    const item = this.data.list.find(row => row.id === e.currentTarget.dataset.id)
    if (item) this.setData({ form: { ...item } })
  },
  resetForm() {
    this.setData({ form: { ...emptyForm } })
  },
  onSelectChange(e) {
    this.syncSelection(e.detail.value)
  },
  toggleSelectAll() {
    const ids = this.data.allSelected ? [] : this.data.list.map(item => item.id)
    this.syncSelection(ids)
  },
  syncSelection(ids) {
    const selectedMap = {}
    ids.forEach(id => { selectedMap[id] = true })
    this.setData({ selectedIds: ids, selectedMap, allSelected: ids.length > 0 && ids.length === this.data.list.length })
  },
  deleteSelected() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({ title: '请先选择记录', icon: 'none' })
      return
    }
    store.removeMany('inventories', this.data.selectedIds)
    this.syncSelection([])
    this.refresh()
  }
})
