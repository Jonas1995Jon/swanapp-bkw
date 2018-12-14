// pages/me/recharge/recharge.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
import md5 from '../../../utils/md5.js';
//获取应用实例
var app = getApp();
var interval;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentindex: 0,
    invalid: true,
    couponBgYes: '../../../image/me/voucher_bgyes.png',
    couponBgNo: '../../../image/me/voucher_bgno.png',
    hiddenModal: true,
    baiduPayParams: '',
    bannedChannels: ['BDWallet', 'WeChat', 'Alipay'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.mybalance();
    this.mycoupon(0);
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
  rechargeSwiperChange: function (e) {
    var currnet = e.detail.current;
    if (currnet == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (currnet == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    }
  },
  rechargeBtnClick: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (index == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    }
  },
  //我的余额
  mybalance: function () {
    var wx_openid = swan.getStorageSync('wx_openid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.mybalance({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          // data.bkgold = parseInt(data.bkgold);
          this.setData({ balance: data });
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  //我的优惠券
  mycoupon: function (isexpired) {
    var wx_openid = swan.getStorageSync('wx_openid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.mycoupon({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        isexpired: isexpired
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          // data.bkgold = parseInt(data.bkgold);
          if (data.list.length > 0) {
            for (var i = 0; i < data.list.length; i++) {
              data.list[i].selected = 0;
              if (data.list[i].coupontype == "allcategorydiscount") {
                data.list[i].des = "通用";
                data.list[i].price = parseFloat(data.list[i].price * 10);
              } else {
                data.list[i].des = "满" + parseInt(data.list[i].needamount) + "元可用";
                data.list[i].price = parseFloat(data.list[i].price).toFixed(0);
              }
            }
          }

          this.setData({ coupon: data });
          this.setData({ couponList: data.list });
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  invalidClick: function () {
    this.mycoupon(this.data.invalid == true ? 1 : 0);
    this.setData({ invalid: !this.data.invalid });
  },
  rechargeClick: function () {
    this.setData({ hiddenModal: !this.data.hiddenModal });
  },
  cancelClick: function (event) {
    this.setData({ hiddenModal: true });
  },
  confirmClick: function (event) {
    this.accountrecharge();
  },
  rechargeInput: function (event) {
    this.setData({
      price: event.detail.value
    });
  },
  // 下单
  accountrecharge: function () {
    var wx_openid = swan.getStorageSync('wx_openid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.accountrecharge({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        price: this.data.price,
        gateway: app.globalData.gateway
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ out_trade_no: data.out_trade_no });
          this.setData({ price: data.total_fee });
          // this.weixinpay();
          this.requestPolymerPayment();
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  // 从后台获取百度支付参数
  requestPolymerPayment() {
    let that = this;
    swan.request({
      url: 'https://mbd.baidu.com/ma/nuomi/createorder',
      success: res => {
        let data = res.data;
        if (data.errno == 0) {
          that.setData({ baiduPayParams: data });
        } else {
          console.log('create order err', data);
          return;
        }
        that.bauduPay();
      },
      fail: err => {
        swan.showToast({
          title: '订单创建失败'
        });
        console.log('create order fail', err);
      }
    });
  },
  // 调用百度支付接口
  bauduPay: function () {
    swan.requestPolymerPayment({
      orderInfo: this.data.baiduPayParams.data,
      bannedChannels: '',
      success: res => {
        this.setData({ hiddenModal: true });
        swan.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1500
        });
      },
      fail: err => {
        swan.showToast({
          title: err.errMsg
        });
      }
    });
  },
  //统一支付订单
  weixinpay: function () {
    var wx_openid = swan.getStorageSync('wx_openid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.weixinpay({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        orderid: this.data.out_trade_no,
        openid: wx_openid,
        market: app.globalData.market
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var prepay_id = data.prepay_id;
          this.setData({ prepay_id: prepay_id });
          this.paySign();
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  //调起支付签名
  //注：key为商户平台设置的密钥key
  mixedencryMD5: function (prepay_id, randomString, timeStamp) {
    return "appId=" + getApp().globalData.appid + "&nonceStr=" + randomString + "&package=prepay_id=" + prepay_id + "&signType=MD5" + "&timeStamp=" + timeStamp + "&key=" + getApp().globalData.sh_key;
  },
  //请求微信支付
  paySign: function () {
    var nonceStr = common.randomString(32);
    var timeStamp = common.timeStamp();
    var mixedencryMD5 = this.mixedencryMD5(this.data.prepay_id, nonceStr, timeStamp);
    var paySign = md5.hexMD5(mixedencryMD5);
    var that = this;
    swan.requestPayment({
      'timeStamp': timeStamp,
      'nonceStr': nonceStr,
      'package': 'prepay_id=' + this.data.prepay_id,
      'signType': 'MD5',
      'paySign': paySign,
      'success': function (res) {
        //console.log(res);
        //循环执行，检测充值情况
        // that.weixinpaynotify();
        interval = setInterval(function () {
          that.checkState();
        }, 3000); //循环时间 这里是3秒
      },
      'fail': function (res) {
        console.log('fail:' + JSON.stringify(res));
      }
    });
  },
  checkState: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    var that = this;
    api.checkstate({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        orderguid: this.data.orderguid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          clearInterval(interval);
          swan.showModal({
            title: '温馨提示',
            content: '充值成功',
            showCancel: false,
            success: function (res) {
              that.setData({ hiddenModal: true });
              that.mybalance();
            }
          });
        } else {
          swan.showModal({
            title: '温馨提示',
            content: '请求异常，如支付成功，请添加微信客服或拨打客服电话进行咨询！',
            showCancel: false,
            success: function (res) {
              that.setData({ hiddenModal: true });
              that.mybalance();
            }
          });
          clearInterval(interval);
        }
      }
    });
  }
});