Page({
  data: {
    code: ''
  },
  onInput(e) {
    this.setData({ code: e.detail.value.trim() })
  },
  login() {
    const app = getApp()
    if (this.data.code === app.globalData.companyCode) {
      wx.setStorageSync('sfds_authed', true)
      wx.switchTab({ url: '/pages/dashboard/dashboard' })
      return
    }
    wx.showToast({ title: '公司代码错误', icon: 'none' })
  }
})
