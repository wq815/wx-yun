//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    isLogin:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    countSingIn: 0,
    articlesList: ''
  },

  onLoad: function() {
    this.onGetOpenid()
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    if (app.globalData.userInfo) {
      this.setData({
        avatarUrl: res.userInfo.avatarUrl,
        userInfo: res.userInfo
      })
      app.globalData.userInfo = res.userInfo
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        app.globalData.userInfo = res.userInfo
        this.setData({
          avatarUrl: res.userInfo.avatarUrl,
          userInfo: res.userInfo,
          isLogin: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          this.setData({
            avatarUrl: res.userInfo.avatarUrl,
            userInfo: res.userInfo
          })
          app.globalData.userInfo = res.userInfo
        }
      })
    }
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           this.setData({
    //             avatarUrl: res.userInfo.avatarUrl,
    //             userInfo: res.userInfo
    //           })
    //           app.globalData.userInfo = res.userInfo
    //           this.onGetOpenid()
    //           this.onQueryUserArticle()
    //           this.onQueryAllArticle()
    //         }
    //       })
    //     }
    //   }
    // })
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      isLogin: true
    })
  },
  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        this.onQueryUserArticle()
        this.onQueryAllArticle()
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  onQueryUserArticle: function() {
    const db = wx.cloud.database()
    db.collection('Articles').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        this.setData({
          countSingIn: res.data.length
        })
      }
    })
  },

  onQueryAllArticle: function() {
    const db = wx.cloud.database()
    db.collection('Articles').orderBy('createTime', 'desc').get({
      success: res => {
        // console.log(res)
        this.setData({
          articlesList: res.data
        })
        wx.hideLoading()
        wx.stopPullDownRefresh()
      }
    })
  },

  // 上传图片
  doUpload: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  onShow: function() {
    wx.showLoading({
      title: '加载中',
    })
    this.onQueryAllArticle()
    this.onQueryUserArticle()
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作 
    wx.showLoading({
      title: '加载中',
    })
    this.onQueryAllArticle()
    this.onQueryUserArticle()
  },

})