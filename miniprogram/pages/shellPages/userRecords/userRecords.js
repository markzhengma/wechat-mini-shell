// miniprogram/pages/shellPages/userRecords/userRecords.js
const app = getApp();
// const watcher = require('../../../utils/watcher');

Page({

	/**
	 * Page initial data
	 */
	data: {
		detailHidden: true,
		selectedRecord: '',
		wxData: null,
		loginJSCode: null
		// showAvatar: false
	},

	modalChange: function(){
		this.setData({
			detailHidden: !this.data.detailHidden,
			selectedRecord: ''
		})
	},

	showRecordDetail: function (event) {
		console.log(event);
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
			detailHidden: false
		})
	},
	toContact: function () {
    wx.navigateTo({
      url: '/pages/shellPages/contact/contact'
    })
	},
	
	onGetUserInfo: function (e) {
    // console.log('manually get user info');
		// console.log(e)
		
    if (!this.data.logged && e.detail && e.detail.errMsg === "getUserInfo:ok") {
      // this.setData({
      //   logged: true,
      //   avatarUrl: e.detail.userInfo.avatarUrl,
      //   userInfo: e.detail.userInfo
			// })
			this.setData({
				wxData: e.detail
			});
			app.setAppData('wxData', e.detail);

			this.bindUnionId();

    } else {
      console.log('get user info failed:');
      console.log(e);
    }
	},

	bindUnionId: function(){
		wx.showLoading({
      title: '加载中...',
		});
		
		if(!app.globalData.unionId || app.globalData.unionId === '') {
			wx.request({
				url: `https://api.hulunbuirshell.com/api/user/auth/unionid`,
				method: 'POST',
				data: {
					loginJSCode: this.data.loginJSCode,
					encryptedData: this.data.wxData.encryptedData,
					iv: this.data.wxData.iv,
				},
				success: res => {
					// console.log('got decrypted user info:');
					// console.log(res);
	
					if(res.data && res.data.unionId) {
						const unionId = res.data.unionId;
						this.setData({
							unionId: unionId
						});
						app.setAppData('unionId', unionId);
	
						wx.request({
							url: `https://api.hulunbuirshell.com/api/user/single/${this.data.userData.record_num}`,
							method: 'PUT',
							data: {
								...this.data.userData,
								union_id: app.globalData.unionId
							},
							success: res => {
								wx.hideLoading();
								if(res.data.code !== 200) {
									console.log('error binding record num with union id');
									console.log(res);
								} else {
									// console.log('successfully bind record num with union id');
									// console.log(res);

									// this.setData({
									// 	userData: res.data.data
									// });
									// app.setAppData('userData', res.data.data);

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
												// console.log('received user data with union id')
												// console.log(res);

												this.setData({
													userData: res.data.data[0],
													sameUserList: res.data.data
												});
					
												app.setAppData('userData', res.data.data[0]);
												app.setAppData('sameUserList', res.data.data);
											}
				
										},
										fail: err => {
											wx.hideLoading();
											console.log('failed to get user data with union id:');
											console.log(err);
										}
									})
								}
							},
							fail: err => {
								wx.hideLoading();
								console.log('error binding record num with union id');
								console.log(err);
							}
						})
					}
				},
				fail: err => {
					wx.hideLoading();
					console.log('error getting decrypted user info:');
					console.log(err);
				}
			})
		} else {
			wx.request({
				url: `https://api.hulunbuirshell.com/api/user/single/${this.data.userData.record_num}`,
				method: 'PUT',
				data: {
					...this.data.userData,
					union_id: app.globalData.unionId
				},
				success: res => {
					wx.hideLoading();
					if(res.data.code !== 200) {
						console.log('error binding record num with union id');
						console.log(res);
					} else {
						// console.log('successfully bind record num with union id');
						// console.log(res);

						this.setData({
							userData: res.data.data
						});
						app.setAppData('userData', res.data.data);
					}
				},
				fail: err => {
					wx.hideLoading();
					console.log('error binding record num with union id');
					console.log(err);
				}
			})
		}

	},

	// watch: {
	// 	wxData: function(newVal) {
	// 		if(newVal.avatarUrl) {
	// 			this.setData({
	// 				showAvatar: true
	// 			})
	// 		}
	// 	}
	// },

	/**
	 * Lifecycle function--Called when page load
	 */
	onLoad: function (options) {
		// watcher.setWatcher(this);

		app.globalData.isLoading = false;
		wx.showLoading({
			title: '加载中...',
		})
		this.setData({
			userData: app.globalData.userData,
			unionId: app.globalData.unionId,
			wxData: app.globalData.wxData,
			loginJSCode: app.globalData.loginJSCode,
			sameUserList: app.globalData.sameUserList
		});
		wx.request({
			url: `https://api.hulunbuirshell.com/api/record/user/${app.globalData.userData.record_num}`,
			success:res => {
				wx.hideLoading();
				this.setData({
					userRecords: res.data.data
				})
			},
			fail: err => {
				wx.hideLoading();
				console.log(err);
			}
		})
		// wx.cloud.callFunction({
		// 	name: 'getUserRecordsByNum',
		// 	data: {
		// 		record_num: app.globalData.userData.record_num
		// 	},
		// 	success: (res) => {
		// 		wx.hideLoading();
		// 		this.setData({
		// 			userRecords: res.result.data
		// 		})
		// 	},
		// 	fail: console.error
		// })
	},

	/**
	 * Lifecycle function--Called when page is initially rendered
	 */
	onReady: function () {
		// console.log(this.data)
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