// miniprogram/pages/shellPages/adminPage/adminPage.js
const app = getApp();
var sliderWidth = 96

Page({

      /**
       * Page initial data
       */
      data: {
            tabs: ["查找客户", "创建客户", "近期记录"],
            activeIndex: 0,
            sliderOffset: 0,
            sliderLeft: 0,
            findMethods: ['换油证号', '手机号', '车牌号'],
            methodIndex: 0,
            userRecords: ''
      },

      /**
       * Lifecycle function--Called when page load
       */
      onLoad: function (options) {
            console.log(app.globalData.adminData);
            app.globalData.userData = {};
            this.setData({
                  adminData: app.globalData.adminData
            });

            var that = this;
            wx.getSystemInfo({
                  success: function (res) {
                        that.setData({
                              sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                              sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                        });
                        // if (app.globalData.adminData.location === "总管理员" && app.globalData.is_super === true) {
                        //       that.setData({
                        //             tabs: this.tabs.push("下载")
                        //       })
                        // }
                  }
            });
      },
      tabClick: function (e) {
            this.setData({
                  sliderOffset: e.currentTarget.offsetLeft,
                  activeIndex: e.currentTarget.id
            });
      },

      bindPickerChange: function (e) {
            console.log('picker发送选择改变，携带值为', e.detail.value)
            this.setData({
                  methodIndex: parseInt(e.detail.value, 10)
            })
      },

      findUserRecords: function (event) {
            this.setData ({
                  userInfo: '',
                  userRecords: ''
            });
            if (event.detail.value.input !== ''){
                  switch (this.data.methodIndex) {
                        case 0:
                              wx.cloud.callFunction({
                                    name: 'getUserInfoByNum',
                                    data: {
                                          record_num: event.detail.value.input
                                    },
                                    success: (res) => {
                                          this.setData({
                                                userInfo: res.result.data[0]
                                          });
                                          wx.cloud.callFunction({
                                                name: 'getUserRecordsByNum',
                                                data: {
                                                      record_num: res.result.data[0].record_num
                                                },
                                                success: (data) => {
                                                      this.setData({
                                                            userRecords: data.result.data
                                                      })
                                                },
                                                fail: console.error
                                          })
                                    },
                                    fail: console.error
                              })
                              break;
                        case 1:
                              wx.cloud.callFunction({
                                    name: 'getUserInfoByPhone',
                                    data: {
                                          phone: parseInt(event.detail.value.input, 10)
                                    },
                                    success: (res) => {
                                          this.setData({
                                                userInfo: res.result.data[0]
                                          });
                                          wx.cloud.callFunction({
                                                name: 'getUserRecordsByNum',
                                                data: {
                                                      record_num: res.result.data[0].record_num
                                                },
                                                success: (data) => {
                                                      this.setData({
                                                            userRecords: data.result.data
                                                      })
                                                },
                                                fail: console.error
                                          })
                                    },
                                    fail: console.error
                              })
                              break;
                        case 2:
                              wx.cloud.callFunction({
                                    name: 'getUserInfoByPlate',
                                    data: {
                                          plate: event.detail.value.input
                                    },
                                    success: (res) => {
                                          this.setData({
                                                userInfo: res.result.data[0]
                                          });
                                          wx.cloud.callFunction({
                                                name: 'getUserRecordsByNum',
                                                data: {
                                                      record_num: res.result.data[0].record_num
                                                },
                                                success: (data) => {
                                                      this.setData({
                                                            userRecords: data.result.data
                                                      })
                                                },
                                                fail: console.error
                                          })
                                    },
                                    fail: console.error
                              })
                              break;
                        default:
                              break;
                  }
            }
      },

      createUserInfo: function(event) {
            console.log(this.data.adminData)
            wx.cloud.callFunction({
                  name: 'getNewRecordNum',
                  data: {
                        location_char: this.data.adminData.location_char
                  },
                  success: (data) => {
                        let newRecordNum = this.data.adminData.location_char + (parseInt(data.result.data[0].record_num.match(/\d+/g), 10) +1);
                        console.log('new number: ' + newRecordNum);
                        wx.cloud.callFunction({
                              name: 'createUserInfo',
                              data: {
                                    user_info: event.detail.value,
                                    record_num: newRecordNum
                              },
                              success: (data) => {
                                    this.setData({
                                          activeIndex: 0,
                                          methodIndex: 0
                                    });
                                    wx.cloud.callFunction({
                                          name: 'getUserInfoByNum',
                                          data: {
                                                record_num: newRecordNum
                                          },
                                          success: (res) => {
                                                this.setData({
                                                      userInfo: res.result.data[0]
                                                });
                                                wx.cloud.callFunction({
                                                      name: 'getUserRecordsByNum',
                                                      data: {
                                                            record_num: res.result.data[0].record_num
                                                      },
                                                      success: (data) => {
                                                            this.setData({
                                                                  userRecords: data.result.data
                                                            })
                                                      },
                                                      fail: console.error
                                                })
                                          },
                                          fail: console.error
                                    })
                              },
                              fail: console.error
                        })
                  },
                  fail: console.error
            })
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