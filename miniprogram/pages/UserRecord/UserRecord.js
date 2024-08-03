// pages/UserRecord/UserRecord.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userRecords: [],
    isSortedAsc: false,
    minDate: '',
    startDate: '',
    endDate: '',
    timePickerList: [
      '全部',
      '近1个月',
      '近3个月',
      '近6个月',
      '近1年'
    ],
    timePickerMap: [
      -120,
      -1,
      -3,
      -6,
      -12
    ]
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
        if(res.data.code !== 200) {
          throw(err => {
            console.log(err);
            console.log(res);
          })
        } else {
          let minDate = res.data.data[res.data.data.length-1].date;
          this.setData({
            userRecords: res.data.data,
            minDate: minDate,
            startDate: minDate,
            endDate: this.formatDate(new Date())
          })
        }
      },
      fail: err => {
        wx.hideLoading();
        console.log(err);
      }
    })
  },

  sortUserRecordsBetweenDates: function() {
    wx.showLoading({
			title: '加载中...',
		});

    wx.request({
      url: `https://api.hulunbuirshell.com/api/record/user-date-sort/${app.globalData.userData.record_num}?start=${this.data.startDate}&end=${this.data.endDate}&sort=${this.data.isSortedAsc ? 1 : -1}`,
      success: res => {
        wx.hideLoading();
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

  changeSort: function() {
    this.setData({
      isSortedAsc: !this.data.isSortedAsc
    });

    this.sortUserRecordsBetweenDates();
  },

  formatDate(date) {
    let paramsDate = new Date(date),
      month = '' + (paramsDate.getMonth() + 1),
      day = '' + paramsDate.getDate(),
      year = paramsDate.getFullYear();
      
    if (month.length < 2) 
    month = '0' + month;
    if (day.length < 2) 
    day = '0' + day;
    
    return [year, month, day].join('-');
  },

  addMonths: function(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
  },

  showOrHideTimePicker: function() {
    this.setData({
      isShowTimePicker: !this.data.isShowTimePicker
    })
  },

  confirmStartDate: function(e) {
    let { index } = e.detail;

    if(index === 0) {
      this.setData({
        startDate: this.data.minDate
      });
    } else {
      let startDate = this.addMonths(new Date(), this.data.timePickerMap[index]);
      
      this.setData({
        startDate: this.formatDate(startDate)
      });
    }
    this.showOrHideTimePicker();
    this.sortUserRecordsBetweenDates();
  },

  resetStartDate: function() {
    this.setData({
      startDate: this.data.minDate
    });
    this.sortUserRecordsBetweenDates();
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