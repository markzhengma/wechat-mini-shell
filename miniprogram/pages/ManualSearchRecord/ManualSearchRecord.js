// pages/ManualSearchRecord/ManualSearchRecord.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  findUserRecord: function(recordNum) {
    wx.showLoading();
    wx.request({
      url: `https://api.hulunbuirshell.com/api/record/user/${recordNum}`,
      success: (res) => {
        wx.hideLoading();
        if(res.data.code !== 200) {
          console.log(res);
          Dialog.alert({
            title: "用户记录查询错误",
            message: "【错误信息】" + JSON.stringify(res.data)
          });
        } else {
          this.setData({
            targetUserRecord: res.data.data
          })
        }
      },
      fail: err => {
        wx.hideLoading();
        console.log(err);
        Dialog.alert({
          title: "用户记录查询错误",
          message: "【错误信息】" + JSON.stringify(err)
        });
      }
    })
  },

  showRecordPopup: function(e) {
    this.setData({
      isShowRecordPopup: true,
      selectedRecord: e.currentTarget.dataset.record
    });
  },
  closeRecordPopup: function() {
    this.setData({
      isShowRecordPopup: false,
      selectedRecord: ""
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let that = this;
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('manualSearchUser', function(data) {
      that.setData({
        targetUserInfo: data.data
      });
      that.findUserRecord(that.data.targetUserInfo.record_num);
    })
    console.log(app.globalData);
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