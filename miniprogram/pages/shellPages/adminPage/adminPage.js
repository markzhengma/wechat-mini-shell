// miniprogram/pages/shellPages/adminPage/adminPage.js
const app = getApp();
var sliderWidth = 96

Page({

  /**
   * Page initial data
   */
  data: {
    tabs: ["查找客户", "创建客户"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    findMethods: ['换油证号', '手机号', '车牌号'],
    methodIndex: 0,
    userRecords: '',
    isModalHidden: true,
    selectedRecord: '',
    selectedIndex: '',
    detailHidden: true,
    selectEdit: '',
    selectedId: '',
    isInfoModalHidden: true,
    editUserInfo: '',
    isDeleteModalHidden: true,
    gifts: '',
    giftIndex: 0,
    operators: '',
    opeIndex: 0,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.resetRecordData();
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

    wx.cloud.callFunction({
      name: 'getAllGifts',
      success: (res) => {
        let prettyData = res.result.data.map(data => {
          return data.gift_name
        })
        this.setData({
          gifts: prettyData
        })
      },
      fail: err => {
        console.log(err)
      }
    });
    wx.cloud.callFunction({
      name: 'getAllOperators',
      success: (res) => {
        let prettyData = res.result.data.map(data => {
          return data.op_name
        })
        this.setData({
          operators: prettyData
        })
      },
      fail: err => {
        console.log(err)
      }
    });
  },

  showEditInfoModal: function(){
    var user_name = this.data.userInfo.user_name;
    var phone = this.data.userInfo.phone;
    var plate = this.data.userInfo.plate;
    var make = this.data.userInfo.make;
    var detail = this.data.userInfo.detail;
    this.setData({
      isInfoModalHidden: false,
      editUserInfo: {
        user_name: user_name,
        phone: phone,
        plate: plate,
        make: make,
        detail: detail
      }
    })
  },

  confirmUpdateUserInfo: function(){
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      isInfoModalHidden: true,
    })
    console.log(this.data.editUserInfo)
    wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        userInfo: this.data.editUserInfo,
        record_num: this.data.userInfo.record_num
      },
      success: () => {
        wx.hideLoading();
        this.findUserRecordsByNum(this.data.userInfo.record_num)
      },
      fail: () => {
        console.err;
        wx.hideLoading();
      }
    })
  },
  cancelUpdateUserInfo: function(){
    this.setData({
      isInfoModalHidden: true,
      editUserInfo: {
        user_name: '',
        phone: '',
        plate: '',
        make: '',
        detail: ''
      }
    })
  },

  onSettingTextInput: function(event){
    this.setData({
      [`editUserInfo.${event.currentTarget.id}`]: event.detail.value
    })
  },

  resetRecordData: function(){
    this.setData({
      userRecords: ''
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  bindPickerChange: function (e) {
    this.setData({
      methodIndex: parseInt(e.detail.value, 10)
    })
  },
  bindGiftChange: function (e) {
    this.setData({
      [`selectedRecord.gift`]: this.data.gifts[parseInt(e.detail.value, 10)]
    })
  },
  bindOperatorChange: function (e) {
    this.setData({
      [`selectedRecord.operator`]: this.data.operators[parseInt(e.detail.value, 10)]
    })
  },
  bindDateChange: function (e) {
    this.setData({
      [`selectedRecord.date`]: e.detail.value
    })
  },

  detailChange: function(){
    this.setData({
      detailHidden: true,
      selectedRecord: '',
      selectedId: '',
      selectedIndex: ''
    })
  },

  showRecordDetail: function (event) {
		var index = parseInt(event.currentTarget.id);
		this.setData({
			selectedRecord: {
				date: this.data.userRecords[index].date || '无记录',
				product_name: this.data.userRecords[index].product_name || '无记录',
				milage: this.data.userRecords[index].milage || '无记录',
				gift: this.data.userRecords[index].gift || '无记录',
				operator: this.data.userRecords[index].operator || '无记录',
				detail: this.data.userRecords[index].detail || '无记录'
      },
      detailHidden: false,
      selectedId: this.data.userRecords[index]._id,
      selectedIndex: index
		})
  },

  findUserRecords: function (event) {
    this.resetRecordData();
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      userInfo: '',
      userRecords: ''
    });
    if (event.detail.value.input !== '') {
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
                  wx.hideLoading();
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
                  wx.hideLoading();
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
                  wx.hideLoading();
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
    }else{
      wx.hideLoading();
      wx.showModal({
        title: '出错了！',
        content: '请输入要查询的信息',
        showCancel: false,
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    }
  },

  findUserRecordsByNum: function (record_num){
    this.resetRecordData();
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'getUserInfoByNum',
      data: {
        record_num: record_num
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
            wx.hideLoading();
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

  createUserInfo: function (event) {
    this.resetRecordData();
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'getNewRecordNum',
      data: {
        location_char: this.data.adminData.location_char
      },
      success: (data) => {
        let newRecordNum = this.data.adminData.location_char + (parseInt(data.result.data[0].record_num.match(/\d+/g), 10) + 1);
        console.log('new number: ' + newRecordNum);
        wx.cloud.callFunction({
          name: 'createUserInfo',
          data: {
            user_info: event.detail.value,
            record_num: newRecordNum
          },
          success: (data) => {
            wx.hideLoading();
            this.setData({
              activeIndex: 0,
              methodIndex: 0
            });
            this.findUserRecordsByNum(newRecordNum)
          },
          fail: () => {
            wx.hideLoading();
            console.error
          }
        })
      },
      fail: () => {
        wx.hideLoading();
        console.error;
      }
    })
  },

  createUserRecord: function (event) {
    this.resetRecordData();
    wx.showLoading({
      title: '加载中...',
    })
    var date = new Date();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();

    var dateString = date.getFullYear() + '-' + (mm > 9 ? '' : '0') + mm + '-' + (dd > 9 ? '' : '0') + dd;

    wx.cloud.callFunction({
      name: 'createUserRecord',
      data: {
        date: dateString,
        gift: this.data.selectedRecord.gift,
        milage: event.detail.value.milage,
        operator: this.data.selectedRecord.operator,
        product_name: event.detail.value.product_name,
        detail: event.detail.value.detail,
        record_num: event.detail.value.record_num,
      },
      success: (res) => {
        wx.hideLoading();
        this.findUserRecordsByNum(event.detail.value.record_num);
        this.showCreateRecordModal();
        this.detailChange();
      },
      fail: this.detailChange()
    })
  },

  showCreateRecordModal: function(event){
    this.setData({
      isModalHidden: !this.data.isModalHidden
    })
  },

  startEditing: function(event){
    this.setData({
      selectEdit: event.currentTarget.id,
    })
  },

  resetEditing: function(){
    this.setData({
      selectEdit: ''
    })
  },

  updateUserRecord: function(event){
    wx.showLoading({
      title: '加载中...',
    });
    let update_data = event.detail.value.input;
    let update_field = this.data.selectEdit;
    let update_id = this.data.selectedId;
    wx.cloud.callFunction({
      name: 'updateUserRecord',
      data: {
        update_data: update_data,
        update_field: update_field,
        update_id: update_id
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({
          [`selectedRecord.${update_field}`]: update_data
        })
        this.findUserRecordsByNum(this.data.userInfo.record_num);
      },
      fail: (err) => {
        wx.hideLoading();
        console.log(err);
      }
    })
    this.resetEditing();
    // this.detailChange();
  },

  changeDeleteModal: function(){
    this.setData({
      isDeleteModalHidden: !this.data.isDeleteModalHidden
    })
  },

  confirmDeleteUserRecord: function(){
    wx.showLoading({
      title: '加载中...',
    });
    wx.cloud.callFunction({
      name: 'deleteUserRecord',
      data: {
        id: this.data.selectedId
      },
      success: (res) => {
        this.changeDeleteModal();
        this.detailChange();
        this.findUserRecordsByNum(this.data.userInfo.record_num);
        wx.hideLoading()
      },
      fail: () => {
        console.err;
        wx.hideLoading()
      }
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