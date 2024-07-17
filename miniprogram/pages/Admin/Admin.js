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
  showNewRecordForm: function() {
    this.setData({
      isShowNewRecordForm: true,
      newRecordInput: ""
    });
  },
  closeNewRecordForm: function() {
    this.setData({
      isShowNewRecordForm: false,
      newRecordInput: ""
    })
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

  onChange(e) {
    switch(e.currentTarget.id) {
      case("new-record-input-date"):
        this.setData({
          newRecordInput: {
            ...this.data.newRecordInput,
            date: e.detail
          }
        });
        break;
      case("new-record-input-product"):
        this.setData({
          newRecordInput: {
            ...this.data.newRecordInput,
            product_name: e.detail
          }
        });
        break;
      case("new-record-input-milage"):
        this.setData({
          newRecordInput: {
            ...this.data.newRecordInput,
            milage: e.detail
          }
        });
        break;
      case("new-record-input-gift"):
        this.setData({
          newRecordInput: {
            ...this.data.newRecordInput,
            gift: e.detail
          }
        });
        break;
      case("new-record-input-gift"):
        this.setData({
          newRecordInput: {
            ...this.data.newRecordInput,
            gift: e.detail
          }
        });
        break;
      case("new-record-input-operator"):
        this.setData({
          newRecordInput: {
            ...this.data.newRecordInput,
            operator: e.detail
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