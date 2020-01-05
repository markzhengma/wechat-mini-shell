// miniprogram/pages/shellPages/userRecords/userRecords.js
const app = getApp();

Page({

	/**
	 * Page initial data
	 */
	data: {
		detailHidden: true,
		selectedRecord: '',
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

	/**
	 * Lifecycle function--Called when page load
	 */
	onLoad: function (options) {
		app.globalData.isLoading = false;
		wx.showLoading({
			title: '加载中...',
		})
		this.setData({
			userData: app.globalData.userData
		});
		wx.request({
			url: `https://api.hailarshell.cn/api/record/user/${app.globalData.userData.record_num}`,
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
		console.log(this.data)
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