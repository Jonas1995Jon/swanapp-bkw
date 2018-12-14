// pages/learn/liveVideoNum.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var app = getApp();

var bk_userinfo;
var sessionid;
var uid;
var courseid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 1,
      centerBtnUpImg: '../../../image/navigation/up.png',
      centerBtnDownImg: '../../../image/navigation/down.png',
      centerBtnTitle: '学习',
      centerBtnClick: 0
      // rightBtn: 0,
      // rightBtnImg: '../../image/navigation/back.png',
      // rightBtnTitle: '选择',
      // viewTitleList: ["证券", "基金"]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var brushtype = options.brushtype;
    this.setData({ brushtype: brushtype });
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = swan.getStorageSync('courseid');
    swan.setNavigationBarTitle({
      title: brushtype == 1 ? "直播时长" : "视频时长"
    });
    this.setSwitchClassCategory();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  //获取考试类别
  getvideowatchcount: function () {
    api.getvideowatchcount({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: this.data.brushtype == 1 ? "live" : "vod"
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          if (data.total_timelength > 0) {
            data.total_timelength = this.parseTime(data.total_timelength);
          } else {
            data.total_timelength = '0分0秒';
          }
          if (data.watch_video_timelength > 0) {
            data.watch_video_timelength = this.parseTime(data.watch_video_timelength);
          } else {
            data.watch_video_timelength = '0分0秒';
          }
          this.setData({ brush: data });
        } else {
          common.showToast({
            title: data.errmsg
          });
        }
      }
    });
  },
  /**
   * 选择分类后相关设置
   */
  setSwitchClassCategory: function () {
    var courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
    var smallclass;
    var viewTitleList = [];
    for (var i = 0; i < courselist.length; i++) {
      viewTitleList.push(courselist[i].title);
    }
    this.setData({ courselist: courselist });
    if (courselist != undefined && courselist.length > 0) {
      var centerBtnClickIndex = 0;
      this.setData({
        navigation: {
          leftBtn: 1,
          leftBtnImg: '../../../image/navigation/back.png',
          centerBtn: 1,
          centerBtnUpImg: '../../../image/navigation/up.png',
          centerBtnDownImg: '../../../image/navigation/down.png',
          centerBtnTitle: viewTitleList[centerBtnClickIndex],
          centerBtnClick: 0,
          viewTitleList: viewTitleList
          // rightBtn: 0,
          // rightBtnImg: '../../../image/navigation/back.png',
          // rightBtnTitle: '',
        }
      });
      this.setData({ centerBtnClickIndex: 0 });
      this.getvideowatchcount();
    }
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  centerBtnClick: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == 0) {
      index = 1;
    } else {
      index = 0;
    }
    this.setData({ centerBtnIndex: index });
    var centerBtnClickIndex = this.data.centerBtnClickIndex;
    this.setData({
      navigation: {
        leftBtn: 1,
        leftBtnImg: '../../../image/navigation/back.png',
        centerBtn: 1,
        centerBtnUpImg: '../../../image/navigation/up.png',
        centerBtnDownImg: '../../../image/navigation/down.png',
        centerBtnTitle: this.data.navigation.viewTitleList[centerBtnClickIndex],
        centerBtnClick: index,
        viewTitleList: this.data.navigation.viewTitleList
      }
    });
  },
  downviewClick: function (event) {
    var centerBtnIndex = this.data.navigation.centerBtnIndex;
    if (centerBtnIndex == 0) {
      centerBtnIndex = 1;
    } else {
      centerBtnIndex = 0;
    }
    var index = event.currentTarget.dataset.index;
    this.setData({ "centerBtnClickIndex": index });
    if (this.data.navigation.centerBtnTitle == this.data.navigation.viewTitleList[index]) {
      this.setData({
        navigation: {
          leftBtn: 1,
          leftBtnImg: '../../../image/navigation/back.png',
          centerBtn: 1,
          centerBtnUpImg: '../../../image/navigation/up.png',
          centerBtnDownImg: '../../../image/navigation/down.png',
          centerBtnTitle: this.data.navigation.viewTitleList[index],
          centerBtnClick: centerBtnIndex,
          viewTitleList: this.data.navigation.viewTitleList
        }
      });
      return;
    } else {
      this.setData({
        navigation: {
          leftBtn: 1,
          leftBtnImg: '../../../image/navigation/back.png',
          centerBtn: 1,
          centerBtnUpImg: '../../../image/navigation/up.png',
          centerBtnDownImg: '../../../image/navigation/down.png',
          centerBtnTitle: this.data.navigation.viewTitleList[index],
          centerBtnClick: centerBtnIndex,
          viewTitleList: this.data.navigation.viewTitleList
        }
      });
      courseid = this.data.courselist[index].id;
      this.getvideowatchcount();
    }

    // if (index == 0) {
    //   courseid = wx.getStorageSync('courseid');
    // } else {
    //   wx.setStorageSync('courseid', this.data.courselist[index].id);
    //   courseid = wx.getStorageSync('courseid');
    // }
  },
  parseTime: function (time) {
    var dd = parseInt(time / 60 / 60 / 24);
    var hh = parseInt(time / 60 / 60 % 24);
    // if (hh < 10) hh = '0' + hh;
    var mm = parseInt(time / 60 % 60);
    // if (mm < 10) mm = '0' + mm;
    var ss = parseInt(time % 60);
    // if (ss < 10) ss = '0' + ss;
    // var ssss = parseInt(this.data.time % 100);
    // if(ssss<10) ssss = '0'+ssss;
    // return `${mm}:${ss}:${ssss}`
    if (dd > 0) {
      return `${dd}天${hh}时${mm}分${ss}秒`;
    }
    if (hh > 0) {
      return `${hh}时${mm}分${ss}秒`;
    }
    return `${mm}分${ss}秒`;
  }
});