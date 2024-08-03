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
    uidIsInDB: false,
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
    ],
    locationPhoneList:[],
    bannerList: [
      {
        title: "壳牌爱车养护中心，祝您元宵节快乐！",
        url: "https://mp.weixin.qq.com/s?__biz=MzIwMDAwOTc3MA==&mid=2454128079&idx=1&sn=f14fcc2ade5fa3b728b16a8f7d5d5101&chksm=8130148ab6479d9c8c8593c19b1368afb013cce6f8edb05deed4c5fa92efde3fead5b10cb536&token=930081675&lang=zh_CN#rd",
        thumb_url: "https://mmbiz.qpic.cn/mmbiz_jpg/r6JA6ugdpT1caibpsTQZdKGltaxXNibwAPGLJb5gGgxLe8gx3fkKC8Gspwb01ephgMmaNiayvkXiaicBhxQ3oA8LwibQ/640?wxfrom=12&tp=wxpic&usePicPrefetch=1&wx_fmt=jpeg",
      },
      {
        title: "春风十里，不如有你，壳牌爱车养护中心祝所有女性，女神节快乐！",
        url: "https://mp.weixin.qq.com/s?__biz=MzIwMDAwOTc3MA==&mid=2454128085&idx=1&sn=8a7257a502cd091d63a9dd45a96d8606&chksm=81301490b6479d860e5de8373b237d4f9f6f64db59b9883afbd13ad444c61b2a679e08f1216d&token=930081675&lang=zh_CN#rd",
        thumb_url: "https://mmbiz.qpic.cn/mmbiz_jpg/r6JA6ugdpT2EhBpLpJ7jfVGUkUAmgF3lM24D2yLYDibzchBuE5L50rTiaXJGEG5pS29nNscnxSeJRtp5qlkgKcGQ/640?wxfrom=12&tp=wxpic&usePicPrefetch=1&wx_fmt=jpeg",
      },
      {
        title: "端午道安康 粽擎好时光",
        url: "https://mp.weixin.qq.com/s?__biz=MzIwMDAwOTc3MA==&mid=2454128128&idx=1&sn=4f9f5ceabdb3602d216a2742a87b66fb&chksm=81301745b6479e530258e1a22475940ecdc501f554503f062f82fe9a6d80b61039ee9eae4a12&token=930081675&lang=zh_CN#rd",
        thumb_url: "https://mmbiz.qpic.cn/mmbiz_jpg/r6JA6ugdpT0arMCrx7belSVibVQiaBHXnJo41CWgDM8BUxoQdgOeibLz2MDycbxiaiauRS4gMAacPJNQQhJFqibvbH3Q/640?wxfrom=12&tp=wxpic&usePicPrefetch=1&wx_fmt=jpeg",
      },
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

  bindUidWithAllRecordsOfSamePhone: function(phone, union_id){
    return new Promise((resolve, reject) => {
      wx.request({
        url:'https://api.hulunbuirshell.com/api/user/binduidwithphone',
        method: 'PUT',
        data: {
          phone,
          union_id
        },
        success: res => {
          wx.hideLoading();

          if(res.data.code !== 200) {
            Dialog.alert({
              title: "出错了",
              message: "微信关联失败，请联系我们帮您解决"
            });
            reject(res);
          } else {
            const count = res.data.data.data.n;
            Toast.success(`成功关联全部账号`);
            
            this.setData({
              uidIsInDB: true
            });
            resolve(res);
          }
        },
        fail: err => {
          wx.hideLoading();
          Dialog.alert({
            title: "出错了",
            message: "微信关联失败，请联系我们帮您解决"
          });
          reject(err);
        }
      })
    })
  },

  setUserDataList: function(list) {
    app.setAppData("userDataList", list);
    this.setData({
      userDataList: list
    });
    this.selectUserData(list[0]);
  },

  selectFromUserDataList: function(e) {
    let userData = e.currentTarget.dataset.listedUser;
    this.selectUserData(userData);
    this.hideUserDataList();
  },

  showUserDataList: function(){
    this.setData({
      userDataListIsShow: true
    })
  },
  hideUserDataList: function(){
    this.setData({
      userDataListIsShow: false
    })
  },

  selectUserData: function(userData){
    app.setAppData('userData', userData);
    this.setData({
      userData
    })
  },

  getPhoneAuthCode: function(e) {
    if(!e.detail.code) {
      console.log('NOT authorized by user');
    } else {
      const code = e.detail.code;
      this.getUserPhoneNum(code);
    }
  },

  getUserPhoneNum: function(code) {
    wx.showLoading();
    wx.request({
      url: `https://api.hulunbuirshell.com/api/user/auth/phone`,
      method: "POST",
      data: {
        code
      },
      success: res => {
        wx.hideLoading();
        if(res.data.code !== 200) {
          console.log(res);
          Dialog.alert({
            title: "出错了",
            message: "无法获取您的手机号，请联系我们帮您解决"
          });
        } else {
          let phone = res.data.data.purePhoneNumber;

          this.getUserDataWithPhone(phone);
        }
      },
      fail: err => {
        wx.hideLoading();
        console.log(err);
        Dialog.alert({
          title: "出错了",
          message: "无法获取您的手机号，请联系我们帮您解决"
        });
      }
    });
  },

  getUserDataWithPhone: function(phoneNum) {
    wx.showLoading();
    wx.request({
      url: 'https://api.hulunbuirshell.com/api/user/all',
      data: {
        filter: 'phone',
        value: phoneNum
      },
      success: (res) => {
        wx.hideLoading();
        app.globalData.isLoading = false;
        if(res.data.code !== 200) {
          if(res.data.code === 401){
            Dialog.alert({
              title: "很高兴认识您",
              message: "看来您是我们的新客户，请联系门店为您创建信息再试试登录吧！"
            });
          } else {
            Dialog.alert({
              title: "出错了",
              message: "查询错误，请联系我们帮您解决"
            });
          }
        } else {
          const userDataList = res.data.data;
        
          if(Array.isArray(userDataList)) {
            this.setData({
              userDataListFoundWithPhone: userDataList
            });

            let unionId = app.globalData.unionId;

            this.bindUidWithAllRecordsOfSamePhone(phoneNum, unionId)
              .then(res => {
                console.log(res);
                this.setUserDataList(userDataList);
                if(userDataList.length > 1) {
                  this.showUserDataList();
                };
              })
              .catch(err => {
                console.log(err);
              });
          } else {
            console.log("request failed");
          }
        }
      },
      fail: err => {
        wx.hideLoading();
        console.log('failed to get user data with union id:');
        console.log(err);
      }
    })
  },

  checkNonUidDataWithPhone: function(e) {
    let phone = app.globalData.userData.phone;
    let unionId = app.globalData.unionId;
    wx.request({
      url: 'https://api.hulunbuirshell.com/api/user/all',
      data: {
        filter: 'phone',
        value: phone
      },
      success: (res) => {
        if(res.data.code === 200) {
          const dataList = res.data.data;
          let nonUidDataList = [];

          dataList.map(item => {
            if(item.union_id !== unionId){
              nonUidDataList.push(item);
            };
          });

          if(nonUidDataList.length > 0) {
            Dialog.confirm({
              title: `找到了您的${nonUidDataList.length}个未关联账号`,
              message: '关联到您的微信，就能更快地查看保养记录啦',
              confirmButtonText: "关联"
            })
              .then(() => {
                this.bindUidWithAllRecordsOfSamePhone(phone, unionId)
                  .then(() => {
                    this.setUserDataList(dataList);
                    if(dataList.length > 1) {
                      this.showUserDataList();
                    };
                  })
                  .catch(err => {
                    console.log(err);
                  });
              })
              .catch(() => {
                console.log("canceled");
              })
          } else {
            if(!e){
              console.log("all user data is linked with uid, all good.");
            } else {
              if(e.currentTarget.id === "manual-check") {
                Toast.success("全部关联完成")
              }
            }
          };
        }
      },
      fail: err => {
        console.log(err);
      }
    })
  },

  getUserDataWithUnionId: function() {
    wx.showLoading();
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
          if(res.data.code === 401){
            console.log("wechat not bind to user, try to get userData with phone number");
            app.setAppData("isLoggedIn", true);
            this.setData({
              isLoggedIn: true
            });
          } else {
            console.log('request failed');
          }
        } else {
          app.setAppData("isLoggedIn", true);
          
          this.setData({
            isLoggedIn: true,
            uidIsInDB: true
          });
          
          let userDataList = res.data.data;

          
          this.setUserDataList(userDataList);
          this.checkNonUidDataWithPhone();
          if(userDataList.length > 1) {
            this.showUserDataList();
          };
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
    const domain = "https://api.hulunbuirshell.com";
    wx.request({
      url: `${domain}/api/user/single/${locationChar}`,
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
      case("manual-search-plate"):
        this.setData({
          userInputPlateAndPhone: {
            ...this.data.userInputPlateAndPhone,
            plate: e.detail
          }
        });
        break;
      case("manual-search-phone"):
        this.setData({
          userInputPlateAndPhone: {
            ...this.data.userInputPlateAndPhone,
            phone: e.detail
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

  manualSearchSubmit: function() {
    const { phone, plate } = this.data.userInputPlateAndPhone
    const REGEX_CHINESE = /^[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    if((plate.length !== 7 && plate.length !== 8) || !plate.match(REGEX_CHINESE)) {
      Dialog.alert({
        title: "出错了",
        message: "请重新检查输入的【车牌号】哦"
      })
    } else if((phone.length !== 7 && phone.length !== 11) || !phone.match(/^\d+$/)) {
      Dialog.alert({
        title: "出错了",
        message: "请重新检查输入的【手机号】哦"
      })
    } else  {
      wx.showLoading();

      this.findUserWithPhoneAndPlate(phone, plate)
        .then(res => {
          wx.hideLoading();
          const manualSearchUserData = res.data.data[0];

          Dialog.confirm({
            title: `查询成功`,
            messageAlign: 'left',
            message: `【车主】${manualSearchUserData.user_name} \n 【手机号】${manualSearchUserData.phone} \n 【车型】${manualSearchUserData.make}`,
            confirmButtonText: "查看保养记录"
          })
            .then(() => {
              this.showOrHideManualSearchForm();
              wx.navigateTo({
                url: "/pages/ManualSearchRecord/ManualSearchRecord",
                success: res => {
                  res.eventChannel.emit('manualSearchUser', { data: manualSearchUserData })
                }
              })
            })
            .catch(() => {
              console.log("canceled");
            })
        })
        .catch(err => {
          wx.hideLoading();
          console.error(err);
          Dialog.alert({
            title: "出错了",
            message: "请重新检查输入的信息哦"
          })
        })
    }
  },

  findUserWithPhoneAndPlate: function(phone, plate) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.hulunbuirshell.com/api/user/phone-plate?phone=${phone}&plate=${plate}`,
        success: res => {
          if(res.data.code !== 200) {
            reject(res);
          } else {
            resolve(res);
          }
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },

  findUserSingleData: function(plate) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.hulunbuirshell.com/api/user/single?filter=plate&value=${plate}`,
        success: res => {
          if(res.data.code !== 200) {
            reject(res);
          } else {
            resolve(res);
          }
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },

  showOrHideManualSearchForm: function() {
    this.setData({
      manualSearchIsShow: !this.data.manualSearchIsShow,
      userInputPlateAndPhone: {
        phone: "",
        plate: ""
      }
    })
  },

  setLocationPhoneList: function() {
    const phoneList = [
      {
        divider: '海拉尔'
      },
      {
        location: '海拉尔河东门店',
        phone: '0470-8223779'
      },
      {
        location: '海拉尔河西门店',
        phone: '0470-8307711'
      },
      {
        divider: '满洲里'
      },
      {
        location: '满洲里四道街店',
        phone: '0470-2205900'
      },
      {
        location: '满洲里粮库综合楼店',
        phone: '0470-6221541'
      },
      {
        divider: '牙克石'
      },
      {
        location: '牙克石光明南路店',
        phone: '0470-7379457'
      },
      {
        location: '牙克石一道街店',
        phone: '13088520439'
      },
    ];
    app.setAppData("locationPhoneList", phoneList);
    this.setData({
      locationPhoneList: phoneList
    });
  },

  callLocation: function(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
    });
  },

  showOrHideContactPopup: function() {
    this.setData({
      isShowContactPopup: !this.data.isShowContactPopup
    })
  },

  openWxArticle: function(e) {
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: "/pages/WxArticle/WxArticle",
      success: res => {
        res.eventChannel.emit('wxArticleUrl', { data: url })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.setLocationPhoneList();
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