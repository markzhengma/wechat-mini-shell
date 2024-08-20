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
          padding: 6,
          borderRadius: 6,
          display: 'ALWAYS',
          fontSize: 12,
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
    const locationList = [
      {
        location: '金壳润滑油商行（河东门店）',
        city: '海拉尔',
        phone: '0470-8223779',
        address: "海拉尔区建设大街109综合楼1号",
        latitude: "49.219195", 
        longitude: "119.778003",
      },
      {
        location: '华泰隆汽车养护中心（河西门店）',
        city: '海拉尔',
        phone: '0470-8307711',
        address: "海拉尔区夹信子二道街碧海金城2号楼6号门市",
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
        address: "牙克石市西一道街润泽园小区1号楼2号门市",
        latitude: "49.279249", 
        longitude: "120.71937",
      },
    ];
    this.setData({
      locationList: app.globalData.locationList || locationList
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
  onTapMarker: function(e) {
    const index = e.markerId;
    this.changeCurrentLocation(this.data.locationList[index], index);
  },

  openLocationApp: function(e) {
    const { latitude, longitude, location, address } = e.currentTarget.dataset.location;
    wx.openLocation({
      latitude: Number(latitude),
      longitude: Number(longitude),
      scale: 18,
      name: location,
      address,
      fail: err => {
        console.error(err)
      }
    })
  },

  callLocation: function(e) {
    const { phone } = e.currentTarget.dataset.location;
    wx.makePhoneCall({
      phoneNumber: phone,
    });
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