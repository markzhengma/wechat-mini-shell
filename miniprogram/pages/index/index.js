// pages/index/index.js
import Dialog from '@vant/weapp/dialog/dialog';

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false,
    isPermitted: false,
    retryCountdown: 0,
    isAdmin: false,
    findUserFormIsShow: false,
    createUserFormIsShow: false,
    findUserFilter: "plate",
    findUserInput: ""
  },

  getJSCode: function() {
    wx.login({
      success(res) {
        if(!res.code){
          console.log("login failed! Error: " + res.errMsg);
        } else {
          app.setAppData('loginJSCode', res.code);
        }
      }
    })
  },

  getUserDataWithUnionId: function() {
    wx.request({
      url: 'https://api.hulunbuirshell.com/api/user/all',
      data: {
        filter: 'union_id',
        value: app.globalData.unionId
      },
      success: (res) => {
        wx.hideLoading();
        app.globalData.isLoading = false;

        if(res.data.code !== 200) {
          console.log('failed to get user data with union id:');
          console.log(res);
        } else {
          app.setAppData('userData', res.data.data[0]);
          app.setAppData('sameUserList', res.data.data);
          app.setAppData("isLoggedIn", true);

          this.setData({
            userData: app.globalData.userData,
            isLoggedIn: true
          })
        }

      },
      fail: err => {
        wx.hideLoading();
        console.log('failed to get user data with union id:');
        console.log(err);
      }
    })
  },

  getUnionId: function() {
		wx.showLoading({
      title: '加载中...',
    })

		wx.request({
			url: `https://api.hulunbuirshell.com/api/user/auth/unionid`,
			method: 'POST',
      data: {
				loginJSCode: app.globalData.loginJSCode,
				encryptedData: app.globalData.wxData.encryptedData,
				iv: app.globalData.wxData.iv,
			},
			success:res => {
				wx.hideLoading();

				if(res.data && res.data.unionId) {
					const unionId = res.data.unionId;
          app.setAppData('unionId', unionId);

          this.checkAdminRoleByUid(app.globalData.unionId);

          this.getUserDataWithUnionId();
				}
			},
			fail: err => {
				wx.hideLoading();
				console.log(err);
			}
		})
	},

  setUserData: function() {
    this.getJSCode();

    this.setData({
      isLoading: false
    });
    
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              app.setAppData('wxData', res);

              this.getUnionId();
            },
            fail: err => {
              console.log(err);
              this.startRetryCountDown()
            }
          })
        }
      }
    })
  },

  timeout: function(time) {
    return new Promise(resolve => setTimeout(resolve, time))
  },

  startRetryCountDown: function() {
    (async () => {
      this.setData({ 
        retryCountdown: 10
      });
      while(this.data.retryCountdown > 0) {
        let count = this.data.retryCountdown;
        
        this.setData({ 
          retryCountdown: count - 1
        });
        await this.timeout(1000);
      }
    })();
  },

  switchPage: function(event) {
    wx.switchTab({
      url: event.currentTarget.dataset.path
    })
  },

  goToAdminPage: function() {
    wx.navigateTo({
      url: '/pages/Admin/Admin'
    })
  },

  checkAdminRoleByUid: function(unionid) {
    wx.request({
      url: 'https://api.hulunbuirshell.com/api/admin/auth/unionid',
      data: { unionid },
      success: res => {
        // console.log(res);
        if(res.data.code === 200) {
          const adminInfo = {
            admin_name: res.data.data.admin_name,
            location: res.data.data.location,
            location_char: res.data.data.location_char,
            super_admin: res.data.data.super_admin
          }
          app.setAppData('adminData', adminInfo);
          app.setAppData('isAdmin', true);

          this.setData({
            isAdmin: true
          })
        }
      }
    })
  },

  showFindUserForm: function() {
    this.setData({
      findUserFormIsShow: true
    })
  },
  hideFindUserForm: function() {
    this.setData({
      findUserFormIsShow: false
    })
  },
  
  showCreateUserForm: function() {
    this.setData({
      createUserFormIsShow: true
    })
  },
  hideCreateUserForm: function() {
    this.setData({
      createUserFormIsShow: false
    })
  },

  onChange(e) {
    switch(e.currentTarget.id) {
      case("find-user-input"):
        this.setData({
          findUserInput: e.detail
        });
        break;
      default:
        break;
    }
  },

  changeFindUserFilter: function(e){
    this.setData({
      findUserFilter: e.currentTarget.dataset.filter,
      findUserInput: ""
    })
  },

  findUserWithFilterAndValue: function() {
    wx.showLoading();
    wx.request({
      url: `https://api.hulunbuirshell.com/api/user/single?filter=${this.data.findUserFilter}&value=${this.data.findUserInput}`,
      success: res => {
        wx.hideLoading();
        if(res.data.code !== 200) {
          console.log("user not found, see error below");
          console.log(res);
          Dialog.alert({
            title: "未找到用户",
            message: "【错误信息】" + JSON.stringify(res.data)
          })
          .then(() => {
            console.log("closed");
          })
        } else {
          let findUserRes = res.data.data;
          Dialog.alert({
            title: "找到用户",
            message: `用户名：${findUserRes.user_name}\n车牌号：${findUserRes.plate}`
          })
          .then(() => {
            wx.navigateTo({
              url: "/pages/Admin/Admin",
              success: res => {
                res.eventChannel.emit('acceptDataFromOpenerPage', { data: findUserRes })
              }
            })
          })
        }
      },
      fail: err => {
        wx.hideLoading();
        console.log(err);
        Dialog.alert({
          title: "未找到用户",
          message: "【错误信息】" + JSON.stringify(err)
        })
        .then(() => {
          console.log("closed");
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.setUserData();
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