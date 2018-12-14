// pages/me/bind/bind.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '绑定手机'
    },
    phone_num_lenght: 0,
    phone_num_value: '',
    mobile: ''
  },
  /*清除手机号和检测输入*/
  bindKeyInput: function (e) {
    var thisText = e.detail.value;
    this.setData({
      mobile: e.detail.value,
      phone_num_lenght: thisText.length
    });
  },
  clear_val: function (event) {
    this.setData({
      phone_num_value: '',
      phone_num_lenght: 0
    });
  },
  go_inputPassword: function (e) {
    let result = swan.isLoginSync();
    if (result.isLogin) {
      if (common.validatemobile(this.data.mobile)) {
        request.request_bindinguser_step1(this.data.mobile);
      }
    } else {
      swan.showModal({
        title: '温馨提示',
        content: '请先登录百度APP帐号',
        showCancel: false
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let result = swan.isLoginSync();
    if (!result.isLogin) {
      swan.showModal({
        title: '温馨提示',
        content: '请先登录百度APP帐号',
        showCancel: false
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});