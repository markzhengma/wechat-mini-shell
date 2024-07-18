// pages/index/index.js
import Dialog from '@vant/weapp/dialog/dialog';
import Toast from '@vant/weapp/toast/toast';

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
    findUserInput: "",
    findUserInputPlaceholder: "车牌号",
    locationList: [
      "海拉尔河东",
      "海拉尔河西",
      "满洲里",
      "满洲里二店",
      "牙克石"
    ]
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
      findUserFormIsShow: false,
      findUserInput: ""
    })
  },
  
  showCreateUserForm: function() {
    this.setData({
      createUserFormIsShow: true
    });
    this.resetNewUserInput();
  },
  hideCreateUserForm: function() {
    this.setData({
      createUserFormIsShow: false
    });
    this.resetNewUserInput();
  },

  showFindUserList: function() {
    this.setData({
      findUserListIsShow: true
    })
  },
  hideFindUserList: function() {
    this.setData({
      findUserListIsShow: false,
      findUserList: []
    })
  },

  resetNewUserInput: function() {
    this.setData({
      newUserInput: {
        user_name: "",
        phone: "",
        make: "",
        plate: ""
      }
    });
    this.setLocation();
  },

  setLocation: function() {
    const locationChar = app.globalData.adminData.location_char;
    const locationCharList = ["HD", "HX", "MA", "MB", "YA"];
    let locationIndex = locationCharList.indexOf(locationChar);
    this.setData({
      newUserInput: {
        ...this.data.newUserInput,
        location: locationIndex !== -1 ? this.data.locationList[locationIndex] : ""
      }
    });
  },

  showLocationPicker: function() {
    this.setData({
      locationPickerIsShow: true
    })
  },

  closeLocationPicker: function() {
    this.setData({
      locationPickerIsShow: false
    })
  },

  confirmLocationPick: function(e){
    this.setData({
      newUserInput: {
        ...this.data.newUserInput,
        location: e.detail.value
      }
    })
    this.closeLocationPicker();
  },

  createUser: function() {
    const locationCharList = ["HD", "HX", "MA", "MB", "YA"];
    let newUserInfo = this.data.newUserInput;
    let locationIndex = this.data.locationList.indexOf(newUserInfo.location);
    let locationChar = locationCharList[locationIndex];

    const REGEX_CHINESE = /^[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    if(!newUserInfo.user_name.match(REGEX_CHINESE)) {
      Dialog.alert({
        title: "出错了",
        message: "请重新检查输入的【车主姓名】哦"
      })
    } else if((newUserInfo.phone.length !== 7 && newUserInfo.phone.length !== 11) || !newUserInfo.phone.match(/^\d+$/)) {
      Dialog.alert({
        title: "出错了",
        message: "请重新检查输入的【联系方式】哦"
      })
    } else if(!newUserInfo.make.match(REGEX_CHINESE)) {
      Dialog.alert({
        title: "出错了",
        message: "请重新检查输入的【车型】哦"
      })
    } else if((newUserInfo.plate.length !== 7 && newUserInfo.plate.length !== 8) || !newUserInfo.plate.match(REGEX_CHINESE)) {
      Dialog.alert({
        title: "出错了",
        message: "请重新检查输入的【车牌号】哦"
      })
    } else {
      console.log(locationChar);
      console.log(newUserInfo);
      
      Dialog.confirm({
        title: "确认新客户信息",
        message: `【车主姓名】${newUserInfo.user_name}\n
        【联系方式】${newUserInfo.phone}\n
        【车型】${newUserInfo.make}\n
        【车牌号】${newUserInfo.plate}\n
        【换油证号】自动生成-${locationChar}`
      })
        .then(() => {
          this.confirmUserCreate(locationChar, newUserInfo);
        })
        .catch(() => {
          console.log("canceled");
        })
    }
  },

  confirmUserCreate: function(locationChar, newUserInfo) {
    wx.showLoading();
    wx.request({
      url: `https://api.hulunbuirshell.com/api/user/single/${locationChar}`,
      method: 'POST',
      data: {
        user_name: newUserInfo.user_name.length === 1 ? newUserInfo.user_name + '先生/女士' : newUserInfo.user_name,
        phone: newUserInfo.phone,
        make: newUserInfo.make,
        plate: newUserInfo.plate
      },
      success: (res) => {
        wx.hideLoading();
        if(res.data.code !== 200) {
          console.log(res);
          Dialog.alert({
            title: "创建失败",
            message: "【错误信息】" + JSON.stringify(res.data)
          });
        } else {
          Toast.success('创建成功');
          const newUserInfo = res.data.data;

          wx.navigateTo({
            url: "/pages/Admin/Admin",
            success: res => {
              res.eventChannel.emit('adminFindUserInfo', { data: newUserInfo })
            }
          })
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.log(err);
        Dialog.alert({
          title: "创建失败",
          message: "【错误信息】" + JSON.stringify(err.data)
        });
      }
    })
  },

  onChange(e) {
    switch(e.currentTarget.id) {
      case("find-user-input"):
        this.setData({
          findUserInput: e.detail
        });
        break;
      case("create-user-name"):
        this.setData({
          newUserInput: {
            ...this.data.newUserInput,
            user_name: e.detail
          }
        });
        break;
      case("create-phone"):
        this.setData({
          newUserInput: {
            ...this.data.newUserInput,
            phone: e.detail
          }
        });
        break;
      case("create-make"):
        this.setData({
          newUserInput: {
            ...this.data.newUserInput,
            make: e.detail
          }
        });
        break;
      case("create-plate"):
        this.setData({
          newUserInput: {
            ...this.data.newUserInput,
            plate: e.detail
          }
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
    });
    switch(e.currentTarget.dataset.filter) {
      case("plate"):
        this.setData({
          findUserInputPlaceholder: "车牌号"
        });
        break;
      case("phone"):
        this.setData({
          findUserInputPlaceholder: "手机号"
        });
        break;
      case("record_num"):
        this.setData({
          findUserInputPlaceholder: "换油证号"
        });
        break;
      default:
        break;
    }
  },

  takeUserDataToAdminPage: function(e) {
    let userData = e.currentTarget.dataset.listedUser;
    wx.navigateTo({
      url: "/pages/Admin/Admin",
      success: res => {
        res.eventChannel.emit('adminFindUserInfo', { data: userData })
      }
    })
  },

  findUserWithFilterAndValue: function() {
    if(this.data.findUserInput.length < 4) {
      Dialog.alert({
        title: "无法查询",
        message: "【错误信息】至少输入4个字符才能查询"
      })
    } else {
      wx.showLoading();
      wx.request({
        url: `https://api.hulunbuirshell.com/api/user/all?filter=${this.data.findUserFilter}&value=${this.data.findUserInput}`,
        success: res => {
          wx.hideLoading();
          if(res.data.code !== 200) {
            console.log("user not found, see error below");
            console.log(res);
            Dialog.alert({
              title: "未找到用户",
              message: "【错误信息】" + JSON.stringify(res.data)
            })
          } else {
            console.log(res);
            let findUserList = res.data.data;

            if(Array.isArray(findUserList) && findUserList.length === 1) {
              Dialog.alert({
                title: "查询成功",
                message: `用户名：${findUserList[0].user_name}\n车牌号：${findUserList[0].plate}`
              })
              .then(() => {
                wx.navigateTo({
                  url: "/pages/Admin/Admin",
                  success: res => {
                    res.eventChannel.emit('adminFindUserInfo', { data: findUserList[0] })
                  }
                })
              })
            } else if(Array.isArray(findUserList) && findUserList.length > 1) {
              this.setData({
                findUserList
              });
              this.showFindUserList();
            } else {
              Dialog.alert({
                title: "未找到用户",
                message: "【错误信息】" + JSON.stringify(res.data)
              })
            }
          }
        },
        fail: err => {
          wx.hideLoading();
          console.log(err);
          Dialog.alert({
            title: "未找到用户",
            message: "【错误信息】" + JSON.stringify(err)
          })
        }
      })
    }
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