const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    nowDate: '2019-9-31',
    x: 0,
    y: 0,
    hidden: true,
    ctx: ""
  },

  onLoad: function() {
    let nowDate = new Date()
    console.log(nowDate)
    this.setData({
      nowDate: `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`
    })
    const ctx = wx.createCanvasContext('myCanvas')
    this.setData({
      ctx: ctx
    })
  },
  start(e) {
    this.setData({
      hidden: false,
      x: e.touches[0].x,
      y: e.touches[0].y
    })
  },
  move(e) {
    this.setData({
      x: e.touches[0].x,
      y: e.touches[0].y
    })
  },
  end(e) {
    this.setData({
      hidden: true
    })
  }
})