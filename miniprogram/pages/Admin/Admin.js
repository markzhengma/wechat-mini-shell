// pages/Admin/Admin.js
import Dialog from '@vant/weapp/dialog/dialog';
import Toast from '@vant/weapp/toast/toast';


const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowRecordPopup: false,
    selectedRecord: "",
    isShowNewRecordForm: false,
    newRecordInput: "",
    isShowCalendarInput: false,
    isShowGiftInput: false,
    isShowOperatorInput: false,
    isShowProductInput: false,
    giftList: [],
    operatorList: [],
    productList: [],
    // TODO: testing
    "targetUserInfo": {
      "detail": "新客户",
      "make": "夏利",
      "phone": "18600043907",
      "plate": "辽A12345",
      "record_num": "HD01217",
      "union_id": "oqLMf6SnHRwdhPo9880e_Ge2dCSI",
      "user_name": "马铮",
      "__v": 0,
      "_id": "5fd8c1d73ab3ea09b5b42748"
    },
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

  resetNewRecordForm: function() {
    this.setData({
      newRecordInput: {
        date: this.formatDate(new Date()),
        product_name: "",
        milage: "",
        gift: "",
        operator: "",
        detail: "",
        reminder: "reminder"
      }
    })
  },
  showNewRecordForm: function() {
    this.setData({
      isShowNewRecordForm: true,
    });
    this.resetNewRecordForm();
  },
  closeNewRecordForm: function() {
    this.setData({
      isShowNewRecordForm: false,
    });
    this.resetNewRecordForm();
  },

  showPicker: function(e) {
    switch(e.currentTarget.dataset.pickerInput) {
      case("product"):
        this.setData({
          isShowProductInput: true
        })
        break;
      case("gift"):
        this.setData({
          isShowGiftInput: true
        })
        break;
      case("operator"):
        this.setData({
          isShowOperatorInput: true
        })
        break;
      case("date"):
        this.setData({
          isShowCalendarInput: true
        })
        break;
      default:
        break;
    }
  },
  closePicker: function(e) {
    switch(e.currentTarget.dataset.pickerInput) {
      case("product"):
        this.setData({
          isShowProductInput: false
        })
        break;
      case("gift"):
        this.setData({
          isShowGiftInput: false
        })
        break;
      case("operator"):
        this.setData({
          isShowOperatorInput: false
        })
        break;
      case("date"):
        this.setData({
          isShowCalendarInput: false
        })
        break;
      default:
        break;
    }
  },

  showDeleteConfirmPopup: function() {
    Dialog.confirm({
      title: '请确认',
      message: `即将删除记录：\n【日期】${this.data.selectedRecord.date}\n【项目】${this.data.selectedRecord.product_name}`,
    })
    .then(() => {
      this.confirmDeleteRecord();
    })
  },

  confirmDeleteRecord: function() {
    wx.showLoading();
    wx.request({
      url: `https://api.hulunbuirshell.com/api/record/single/${this.data.selectedRecord._id}`,
      method: 'DELETE',
      success: res => {
        if(res.data.code !== 200){
          console.log(res);
          Dialog.alert({
            title: "删除失败",
            message: "【错误信息】" + JSON.stringify(res.data)
          })
        } else {
          Toast.success('删除成功');
          this.findUserRecord(this.data.targetUserInfo.record_num);
        }
        this.closeRecordPopup();
        wx.hideLoading();
      },
      fail: err => {
        wx.hideLoading();
        console.log(err);
      }
    })
  },

  formatDate: function(date) {
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

  loadGiftList: function() {
    wx.request({
      url: 'https://api.hulunbuirshell.com/api/gift/all',
      success: res => {
        if(res.statusCode !== 200 || res.data.length === 0) {
          Dialog.alert({
            title: "赠品信息获取失败",
            message: "【错误信息】" + JSON.stringify(res)
          });
        } else {
          const giftRes = res.data.map(gift => {
            return gift.gift_name
          })
          this.setData({
            giftList: giftRes
          })
        }
      },
      fail: err => {
        console.log(err);
        Dialog.alert({
          title: "赠品信息获取失败",
          message: "【错误信息】" + JSON.stringify(err)
        });
      }
    })
  },

  loadOperatorList: function() {
    wx.request({
      url: 'https://api.hulunbuirshell.com/api/operator/all',
      success: (res) => {
        if(res.statusCode !== 200 || res.data.length === 0) {
          Dialog.alert({
            title: "赠品信息获取失败",
            message: "【错误信息】" + JSON.stringify(res)
          });
        } else {
          const opRes = res.data.map(op => {
            return op.op_name
          })
          this.setData({
            operatorList: opRes
          })
        }
      },
      fail: err => {
        console.log(err);
        Dialog.alert({
          title: "操作人列表获取失败",
          message: "【错误信息】" + JSON.stringify(err)
        });
      }
    });
  },

  loadProductList: function() {
    wx.request({
      url: 'https://api.hulunbuirshell.com/api/product/all',
      success: (res) => {
        if(res.statusCode !== 200 || res.data.length === 0) {
          Dialog.alert({
            title: "赠品信息获取失败",
            message: "【错误信息】" + JSON.stringify(res)
          });
        } else {
          const productRes = res.data.map(product => {
            return product.product_name
          })
          this.setData({
            productList: productRes
          })
        }
      },
      fail: err => {
        console.log(err);
        Dialog.alert({
          title: "项目列表获取失败",
          message: "【错误信息】" + JSON.stringify(err)
        });
      }
    });
  },

  confirmPickerInput: function(e) {
    switch(e.currentTarget.dataset.pickerInput) {
      case("product"):
        this.setData({
          isShowProductInput: false,
          newRecordInput: {
            ...this.data.newRecordInput,
            product_name: e.detail.value
          }
        })
        break;
      case("gift"):
        this.setData({
          isShowGiftInput: false,
          newRecordInput: {
            ...this.data.newRecordInput,
            gift: e.detail.value
          }
        })
        break;
      case("operator"):
        this.setData({
          isShowOperatorInput: false,
          newRecordInput: {
            ...this.data.newRecordInput,
            operator: e.detail.value
          }
        })
        break;
      case("date"):
        this.setData({
          isShowCalendarInput: false,
          newRecordInput: {
            ...this.data.newRecordInput,
            date: this.formatDate(e.detail)
          }
        });
      default:
        break;
    }
  },

  createNewRecord: function() {
    wx.showLoading();
    wx.request({
      url: `https://api.hulunbuirshell.com/api/record/user/${this.data.targetUserInfo.record_num}`,
      method: 'POST',
      data: this.data.newRecordInput,
      success: (res) => {
        wx.hideLoading();
        if(res.data.code !== 200) {
          if(res.data.code === 422){
            Dialog.alert({
              title: "创建保养记录失败",
              message: "请检查必填项是否都填写内容"
            });
            console.log(res);
          } else {
            Dialog.alert({
              title: "创建保养记录失败",
              message: "【错误信息】" + JSON.stringify(res.data)
            });
          }
        } else {
          Toast.success('创建成功');
          this.findUserRecord(this.data.targetUserInfo.record_num);
          this.closeNewRecordForm();
        }
      },
      fail: err => {
        Dialog.alert({
          title: "创建保养记录失败",
          message: "【错误信息】" + JSON.stringify(err)
        });
        console.log(err);
      }
    })
  },

  onChange(e) {
    switch(e.currentTarget.id) {
      case("new-record-input-milage"):
        this.setData({
          newRecordInput: {
            ...this.data.newRecordInput,
            milage: e.detail
          }
        });
        break;
      case("new-record-input-detail"):
        this.setData({
          newRecordInput: {
            ...this.data.newRecordInput,
            detail: e.detail
          }
        });
        break;
      default:
        break;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let that = this;
    const eventChannel = this.getOpenerEventChannel();
    // TODO: testing
    // eventChannel.on('adminFindUserInfo', function(data) {
    //   that.setData({
    //     targetUserInfo: data.data
    //   });
    // })
    that.findUserRecord(that.data.targetUserInfo.record_num);
    that.loadGiftList();
    that.loadOperatorList();
    that.loadProductList();
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