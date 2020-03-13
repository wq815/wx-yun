const app = getApp()
import utils from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    nowDate:'2019-9-31'
  },

  onLoad:function(){
    let nowDate = new Date()
    console.log(nowDate)
    this.setData({
      nowDate: `${nowDate.getFullYear()}-${nowDate.getMonth()+1}-${nowDate.getDate()}`
    })
  },

  inputEditTitle: function(event) {
    let dataset = event.currentTarget.dataset.name
    this.setData({
      title: event.detail.value
    })
  },

  inputEditContent: function (event) {
    let dataset = event.currentTarget.dataset.name
    this.setData({
      content: event.detail.value
    })
  },

  submitArticle: function() {
    const db = wx.cloud.database()
    let createTime = new Date()
    createTime = utils.formatTime(createTime)
    console.log(createTime)
    db.collection('Articles').add({
      data: {
        content: this.data.content ? this.data.content:'什么都没有留下',
        createTime:createTime,
        userName: app.globalData.userInfo ? app.globalData.userInfo.nickName:'匿名用户'
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 1000
        })
        wx.navigateBack()
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '发布失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
})