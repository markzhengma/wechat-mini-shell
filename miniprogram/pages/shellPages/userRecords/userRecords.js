// miniprogram/pages/shellPages/userRecords/userRecords.js
const app = getApp();

Page({

      /**
       * Page initial data
       */
      data: {

      },

      /**
       * Lifecycle function--Called when page load
       */
      onLoad: function (options) {
            app.globalData.isLoading = false;
            this.setData({
                  userData: app.globalData.userData
            });
            wx.cloud.callFunction({
                  name: 'getUserRecordsByNum',
                  data: {
                        record_num: app.globalData.userData.record_num
                  },
                  success: (res) => {
                        this.setData({
                              userRecords: res.result.data
                        })
                  },
                  fail: console.error
            })
      },

      /**
       * Lifecycle function--Called when page is initially rendered
       */
      onReady: function () {
            console.log(this.data)
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