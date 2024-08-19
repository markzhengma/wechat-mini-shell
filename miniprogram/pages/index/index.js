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
    upcomingReminder: "",
    findUserInputPlaceholder: "车牌号码",
    locationNameList: [
      "海拉尔河东",
      "海拉尔河西",
      "满洲里",
      "满洲里二店",
      "牙克石"
    ],
    locationList:[]
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
    });
    this.getUpcomingReminder()
      .then(data => {
        this.setData({
          upcomingReminder: data.data[0] || ""
        })
      })
      .catch(err => {
        console.err(err);
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
            message: "无法获取您的手机号码，请联系我们帮您解决"
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
          message: "无法获取您的手机号码，请联系我们帮您解决"
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
              message: '关联到您的微信，就能一键查看养护记录啦',
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
        location: locationIndex !== -1 ? this.data.locationNameList[locationIndex] : ""
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
    let locationIndex = this.data.locationNameList.indexOf(newUserInfo.location);
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
          findUserInputPlaceholder: "车牌号码"
        });
        break;
      case("phone"):
        this.setData({
          findUserInputPlaceholder: "手机号码"
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
            message: `【车主】${manualSearchUserData.user_name} \n 【手机】${manualSearchUserData.phone} \n 【车型】${manualSearchUserData.make}`,
            confirmButtonText: "查看养护记录"
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

  setLocationList: function() {
    const locationList = [
      {
        location: '金壳润滑油商行（河东门店）',
        city: '海拉尔',
        phone: '0470-8223779',
        address: "海拉尔建设大街109综合楼1号",
        latitude: "49.219195", 
        longitude: "119.778003",
      },
      {
        location: '华泰隆汽车养护中心（河西门店）',
        city: '海拉尔',
        phone: '0470-8307711',
        address: "夹信子二道街碧海金城2号楼6号门市",
        latitude: "49.225699", 
        longitude: "119.749008",
      },
      {
        location: '华泰隆润滑油商行（五道街店）',
        city: '满洲里',
        phone: '0470-6221541',
        address: "满洲里市东五道街青少年宫对面",
        latitude: "49.583225428432314", 
        longitude: "117.49421294927492",
      },
      {
        location: '华泰隆汽车养护中心（四道街店）',
        city: '满洲里',
        phone: '0470-2205900',
        address: "满洲里市四道街西头鑫华源1号楼A座",
        latitude: "49.593869", 
        longitude: "117.443362",
      },
      {
        location: '华太隆汽车养护中心',
        city: '牙克石',
        phone: '0470-7379457',
        address: "牙克石西一道街润泽园小区1号楼2号门市",
        latitude: "49.279249", 
        longitude: "120.71937",
      },
    ];
    app.setAppData("locationList", locationList);
    this.setData({
      locationList: locationList
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

  initWxArticle: function() {
    this.getWxArticleList()
      .then(res => {
        const articleList = res.data.data;

        this.setData({
          bannerList: articleList
        })
      })
      .catch(err => {
        console.log(err);
        this.setData({
          bannerList: [
            {
              title: "再添荣耀！壳牌润滑油斩获LubTop2023总评榜九项大奖！",
              url: "https://mp.weixin.qq.com/s?__biz=MzIwMDAwOTc3MA==&mid=2454128158&idx=1&sn=1ed87e03c91c0d6bcc59efdd7db62fed&chksm=8130175bb6479e4d0ad44554f7c28593caa68d4c993c94bb509d17124c9b07bc2b780a87621e&token=1678010547&lang=zh_CN#rd",
              thumb_url: "https://mmbiz.qpic.cn/mmbiz_png/AAfx4P2w70UHvMicQDl01FXBY31g87z2G5lhxD3W6sL4suP2VK8bXO19RJxcfRqG8e9g4yJhCs7Qq0jE6FGa21A/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1"
            },
            {
              title: "劲涌开赛，不息向前！",
              url: "https://mp.weixin.qq.com/s?__biz=MzIwMDAwOTc3MA==&mid=2454128164&idx=1&sn=e86e751de8b465df64f00bdd9502cd51&chksm=81301761b6479e77432fca505dbb54ef0592fe291151dc1f8a769c5fae3a07dca5421e1fa1f5&token=1678010547&lang=zh_CN#rd",
              thumb_url: "https://mmbiz.qpic.cn/mmbiz_png/AAfx4P2w70U0CWEqwz3EdWicrovcw1vTIWhUZJF2dhGA00G1yxmBLIAYgZc1iaRuAFeEajH7Fj7BtcQ6ltcp2pCw/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1"
            }
          ]
        })
      })
  },

  getWxArticleList: function() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.hulunbuirshell.com/api/wxarticle/recent`,
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

  getUpcomingReminder: function() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.hulunbuirshell.com/api/reminder/user/${this.data.userData.record_num}?limit=1`,
        success: res => {
          if(res.data.code !== 200) {
            reject(res.data);
          } else {
            resolve(res.data);
          }
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.setLocationList();
    this.setUserData();
    this.initWxArticle();
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