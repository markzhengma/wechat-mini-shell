//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    isLoading: false,
    loginInput: {
      phone: '',
      plate: '',
    },
  },

  getOpenIdData: function() {
    wx.login({
      success(res) {
        if(!res.code){
          console.log("login failed! Error: " + res.errMsg);
        } else {
          console.log("got user js code: " + res.code);

          wx.request({
            url: 'http://localhost:7001/api/user/wxlogin',
            data: {
              code: res.code
            },
            success(data) {
              console.log(data)
              if(data.statusCode !== 200 || data.data.status !== 200) {
                console.log('get user openid failed, message see below: ');
                console.log(data);
              } else {
                console.log("got user openid data: " + data.data.data);

                app.setAppData('openIdData', data.data.data);
              }
            }
          })
        }
      }
    });
  },

  userLogin: function (event) {

    if(this.data.loginInput.phone !== '' && this.data.loginInput.plate !== ''){
      if (!app.globalData.isLoading) {
        app.globalData.isLoading = true;
        wx.showLoading({
          title: '加载中...',
        })
        wx.request({
          url: 'http://localhost:7001/api/user/single',
          data: {
            filter: 'plate',
            value: this.data.loginInput.plate
          },
          success: (res) => {
            wx.hideLoading();
            app.globalData.isLoading = false;

            const phoneRes = res.data.data.phone;
            if(phoneRes === this.data.loginInput.phone){
              wx.setStorage({
                key: "phone",
                data: this.data.loginInput.phone
              });
              wx.setStorage({
                key: "plate",
                data: this.data.loginInput.plate
              });
              app.globalData.userData = res.data.data;

              wx.navigateTo({
                url: '/pages/shellPages/userRecords/userRecords',
              });

            } else {
              wx.showModal({
                title: '出错了！',
                content: '请检查您的手机号或车牌号是否正确',
              })
            }
          },
          fail: () => {
            wx.hideLoading();
            console.error
          }
        })
        // wx.cloud.callFunction({
        //   name: 'userLogin',
        //   data: {
        //     phone: parseInt(this.data.loginInput.phone, 10),
        //     plate: this.data.loginInput.plate
        //   },
        //   success: (res) => {
        //     app.globalData.isLoading = false;
        //     if (res.result.data.length > 0) {
        //       wx.setStorage({
        //         key: "phone",
        //         data: this.data.loginInput.phone
        //       });
        //       wx.setStorage({
        //         key: "plate",
        //         data: this.data.loginInput.plate
        //       });
        //       app.globalData.userData = res.result.data[0];
        //       wx.hideLoading();
        //       wx.navigateTo({
        //         url: '/pages/shellPages/userRecords/userRecords',
        //       })
        //     } else {
        //       wx.hideLoading();
        //       wx.showModal({
        //         title: '出错了！',
        //         content: '请检查您的手机号或车牌号是否正确',
        //       })
        //     }
        //   },
        //   fail: () => {
        //     wx.hideLoading();
        //     console.error
        //   }
        // })
      }
    } else {
      wx.showModal({
        title: '出错了！',
        content: '请输入您的手机号码和车牌号，谢谢！',
        showCancel: false,
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    }
  },

  onLoginInput: function(event){
    this.setData({
      [`loginInput.${event.currentTarget.id}`]: event.detail.value
    })
  },

  toAdminPage: function () {
    wx.navigateTo({
      url: '/pages/shellPages/adminLogin/adminLogin'
      // url: '/pages/shellPages/msgPage/msgPage'
    })
  },
  toContact: function () {
    wx.navigateTo({
      url: '/pages/shellPages/contact/contact'
    })
  },

  onShow(){
    let self = this;
    wx.getStorage({
      key: 'phone',
      success(phone) {
        wx.getStorage({
          key: 'plate',
          success(plate) {
            self.setData({
              loginInput: {
                phone: phone.data,
                plate: plate.data,
              },
            })
            console.log(phone.data)
            console.log(plate.data)
          }
        })
      }
    })
  },

  onLoad: function () {
    this.getOpenIdData();

    this.setData({
      isLoading: false
    })
    console.log(this.data.loginInput)
    
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
