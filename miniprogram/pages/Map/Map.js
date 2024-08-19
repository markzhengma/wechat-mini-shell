const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scale: 16,
    currentIndex: 0,
    currentLocation: {
      location: '金壳润滑油商行（河东门店）',
      city: '海拉尔',
      phone: '0470-8223779',
      address: "海拉尔建设大街109综合楼1号",
      latitude: "49.219195", 
      longitude: "119.778003",
    }
  },

  setMarkerList: function() {
    let markerList = this.data.locationList.map(location => {
      return {
        id: this.data.locationList.indexOf(location), 
        latitude: location.latitude, 
        longitude: location.longitude, 
        callout: {
          content: location.location,
          padding: 10,
          borderRadius: 6,
          display: 'BYCLICK',
          fontSize: 16,
          color: '#808080'
        },
        iconPath: '/icons/poi.png', 
        width: 50, 
        height: 50
      }
    })
    this.setData({ markerList });
  },

  setLocationList: function() {
    this.setData({
      locationList: app.globalData.locationList
    })
  },

  onTapLocationList: function(e) {
    const { location, locationIndex } = e.currentTarget.dataset;
    this.changeCurrentLocation(location, locationIndex);
  },

  changeCurrentLocation: function(data, index) {
    this.setData({
      currentLocation: data,
      currentIndex: index,
      scale: 16
    })
  },

  onTapCallout: function(e) {
    const index = e.markerId;
    this.changeCurrentLocation(this.data.locationList[index], index);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setLocationList();
    this.setMarkerList();
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