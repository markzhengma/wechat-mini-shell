// pages/index/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false,
    isPermitted: false,
    retryCountdown: 0
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

          // TODO uncomment this part
          // wx.navigateTo({
          //   url: '/pages/shellPages/userRecords/userRecords',
          // });

          console.log(app.globalData);
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
        console.log(res);
				wx.hideLoading();

				if(res.data && res.data.unionId) {
					const unionId = res.data.unionId;
          app.setAppData('unionId', unionId);

          // TODO uncomment this part
          // this.checkManagerRoleByUid(app.globalData.unionId);

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
      console.log('count down')
      this.setData({ 
        retryCountdown: '10'
      });
      await this.timeout(1000);
      this.setData({ 
        retryCountdown: '9'
      });
      await this.timeout(1000);
      this.setData({ 
        retryCountdown: '8'
      });
      await this.timeout(1000);
      this.setData({ 
        retryCountdown: '7'
      });
      await this.timeout(1000);
      this.setData({ 
        retryCountdown: '6'
      });
      await this.timeout(1000);
      this.setData({ 
        retryCountdown: '5'
      });
      await this.timeout(1000);
      this.setData({ 
        retryCountdown: '4'
      });
      await this.timeout(1000);
      this.setData({ 
        retryCountdown: '3'
      });
      await this.timeout(1000);
      this.setData({
        retryCountdown: '2'
      });
      await this.timeout(1000);
      this.setData({
        retryCountdown: '1'
      });
      await this.timeout(1000);
      this.setData({
        retryCountdown: '0'
      });
      await this.timeout(1000);
    })();
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