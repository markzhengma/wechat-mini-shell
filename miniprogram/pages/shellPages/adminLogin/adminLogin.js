// miniprogram/pages/adminLogin/adminLogin.js

const app = getApp();

Page({

      /**
       * Page initial data
       */
      data: {

      },

      adminLogin: function (event) {
            wx.cloud.callFunction({
                  name: 'adminLogin',
                  data: {
                        admin_name: event.detail.value.admin_name,
                        pass: event.detail.value.pass
                  },
                  success: (res) => {
                        if (res.result) {
                              app.globalData.adminData = res.result;
                              wx.navigateTo({
                                    url: '/pages/shellPages/adminPage/adminPage',
                              })
                        } else {
                              wx.showModal({
                                    title: '出错了！',
                                    content: '请检查您的管理员登录权限',
                              })
                        }
                  },
                  fail: () => {
                        console.error
                  }
            })
      },

      /**
       * Lifecycle function--Called when page load
       */
      onLoad: function (options) {

      },

      /**
       * Lifecycle function--Called when page is initially rendered
       */
      onReady: function () {

      },

      /**
       * Lifecycle function--Called when page show
       */
      onShow: function () {

      },

      /**
       * Lifecycle function--Called when page hide
       */
      onHide: function () {

      },

      /**
       * Lifecycle function--Called when page unload
       */
      onUnload: function () {

      },

      /**
       * Page event handler function--Called when user drop down
       */
      onPullDownRefresh: function () {

      },

      /**
       * Called when page reach bottom
       */
      onReachBottom: function () {

      },

      /**
       * Called when user click on the top right corner to share
       */
      onShareAppMessage: function () {

      }
})