// pages/UserRecord/UserRecord.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userRecords: []
  },

  initData: function() {
    this.setData({
      unionId: app.globalData.unionId,
      userData: app.globalData.userData,
      isLoggedIn: app.globalData.isLoggedIn
    });
  },

  switchPage: function(event) {
    wx.switchTab({
      url: event.currentTarget.dataset.path
    });
  },

  getUserRecords: function(recordNum) {
    wx.showLoading({
			title: '加载中...',
		});

    wx.request({
      url: `https://api.hulunbuirshell.com/api/record/user/${recordNum}`,
      success: res => {
        wx.hideLoading();
        console.log(res);
        if(res.data.code !== 200) {
          throw(err => {
            console.log(err);
            console.log(res);
          })
        } else {
          this.setData({
            userRecords: res.data.data
          })
        }
      },
      fail: err => {
        wx.hideLoading();
        console.log(err);
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.initData();
    if(app.globalData.isLoggedIn) {
      this.getUserRecords(app.globalData.userData.record_num);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})