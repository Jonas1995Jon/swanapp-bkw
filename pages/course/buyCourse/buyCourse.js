// pages/course/buyCourse/buyCourse.js
import api from '../../../api/api.js';
import common from '../../../utils/common.js';
import md5 from '../../../utils/md5.js';
var interval;
//获取应用实例
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
      centerBtnTitle: '购买课程'
    },
    // coursePackage: '',
    orderguid: '',
    orderid: '',
    price: '',
    prepay_id: '',
    out_trade_no: '',
    classType: '',
    switchChecked1: 0,
    switchChecked2: 1,
    choiceCouponHidden: true,
    couponindex: -1,
    checkorder: 0 //是否进行订单结算
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var price = options.price;
    var classType = options.classType;
    var commodityid = options.commodityid;
    // var coursePackage = JSON.parse(options.coursePackage);
    var courselist = JSON.parse(options.courselist);
    // this.setData({ price: price });
    this.setData({ classType: classType });
    this.setData({ commodityid: commodityid });
    // this.setData({ coursePackage: coursePackage });
    if (courselist.length > 0) {
      for (var i = 0; i < courselist.length; i++) {
        courselist[i].price = parseFloat(courselist[i].price).toFixed(2);
        courselist[i].commodity_costprice = parseFloat(courselist[i].commodity_costprice).toFixed(2);
      }
    }
    this.setData({ courselist: courselist });
    if (options.state != 1) {
      this.setData({ price: options.price });
      this.setData({ totalprice: options.price });
      this.buycourse();
    } else {
      this.setData({ orderstate: options.state });
      this.setData({ orderguid: options.orderguid });
      this.setData({ orderid: options.orderid });
      this.setData({ price: options.price });
      this.setData({ totalprice: options.price });
    }
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
  //获取考试类别
  buycourse: function (event) {
    // var coursePackage = this.data.coursePackage;
    // if (courselistItem.package.length <= 1){
    //   swan.showToast({
    //     title: '此课程暂无可购买的班型',
    //     duration: 3000
    //   });
    //   return;
    //   // packages = courselistItem.package[0];
    // }


    // var totalprice = this.data.price;
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    // console.log('sessionid' + sessionid);
    // var data = [{
    //   coursename: coursePackage.title,
    //   courseid: coursePackage.id,
    //   categoryid: coursePackage.categoryid,
    //   coursetype: coursePackage.coursetype,
    //   price: totalprice,
    //   studytime: coursePackage.xueshi,
    // }];
    //生成订单

    api.buycourse({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        totalprice: this.data.price,
        // list: data,
        // package: '',
        commodityid: this.data.commodityid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var orderguid = data.orderguid;
          var orderid = data.orderid;
          this.setData({ orderguid: orderguid });
          this.setData({ orderid: orderid });
          // this.setData({ price: this.data.price });
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
  //生成微信订单
  createpayorder: function () {
    if (parseFloat(this.data.price) != parseFloat(this.data.totalprice) && this.data.checkorder == 0) {
      this.checkorder();
    } else {
      //测试代码
      // interval = setInterval(function () {
      //   that.checkState();
      //   //循环执行代码  
      // }, 3000) //循环时间 这里是3秒
      var that = this;
      var bk_userinfo = swan.getStorageSync('bk_userinfo');
      var sessionid = bk_userinfo.sessionid;
      var uid = bk_userinfo.uid;
      api.createpayorder({
        methods: 'POST',
        data: {
          sessionid: sessionid,
          uid: uid,
          orderguid: this.data.orderguid,
          orderid: this.data.orderid,
          orderprice: this.data.price,
          // orderprice: 0.01,
          gateway: app.globalData.gateway,
          market: app.globalData.market
        },
        success: res => {
          swan.hideToast();
          var data = res.data;
          if (data.errcode == 0) {
            var out_trade_no = data.out_trade_no;
            this.setData({ out_trade_no: out_trade_no });
            //生成同一订单成功后调用微信支付
            this.weixinpay();
          } else {
            swan.showToast({
              title: data.errmsg,
              icon: 'success',
              duration: 1500
            });
          }
        }
      });
    }
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
        //循环执行，检测课程开通情况
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
  weixinpaynotify: function () {
    api.weixinpaynotify({
      methods: 'GET',
      data: {
        market: app.globalData.market
      },
      success: res => {
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) { }
      }
    });
  },
  checkState: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.checkstate({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        // orderguid: '704db7bc-9708-4eb8-a16a-6460777d9ccb',
        orderguid: this.data.orderguid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          console.log('课程开通成功');
          clearInterval(interval);
          swan.showModal({
            title: '温馨提示',
            content: '购买完成，课程开通成功！',
            showCancel: false,
            success: function (res) {
              swan.navigateBack({
                delta: 2
              });
            }
          });
        } else {
          swan.showModal({
            title: '温馨提示',
            content: '请求异常，请至我的课程查看课程是否开通，如支付成功未开通课程，请添加微信客服或拨打客服电话进行咨询！',
            showCancel: false,
            success: function (res) {
              swan.navigateBack({
                delta: 2
              });
            }
          });
          // swan.showToast({
          //   title: data.errmsg
          // });
          clearInterval(interval);
        }
      }
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
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
          this.useBkgold(0);
          this.useBalance(0);

          // if (parseFloat(data.balance) > 0 && parseFloat(data.balance) < parseFloat(this.data.totalprice)){
          //   this.setData({ price: this.data.price - data.balance });
          // }else{
          //   this.setData({ price: '0.00' });
          // }
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
                data.list[i].des = parseInt(data.list[i].price * 10) + "折";
              } else {
                data.list[i].des = "满" + parseInt(data.list[i].needamount) + "元减" + parseInt(data.list[i].price) + "元";
              }
            }
            data.list.push({
              courseid: -1,
              title: '不使用优惠券',
              selected: 1
            });
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
  switchChange1: function (e) {
    if (this.data.balance.balance == 0) {
      return;
    } else {
      var checked = e.detail.checked;
      if (checked) {
        this.setData({ switchChecked1: 0 });
      } else {
        this.setData({ switchChecked1: 1 });
      }
      this.useBalance(0);
    }

  },
  switchChange2: function (e) {
    if (this.data.balance.bkgold == 0 || parseFloat(this.data.price) == 0) {
      if (this.data.balance.bkgold == 0) {
        return;
      } else {
        var checked = e.detail.value;
        if (checked) {
          this.setData({ switchChecked2: 0 });
        } else {
          this.setData({ switchChecked2: 1 });
        }
      }
    } else {
      var checked = e.detail.value;
      if (checked) {
        this.setData({ switchChecked2: 0 });
      } else {
        this.setData({ switchChecked2: 1 });
      }
      this.useBkgold(0);
    }
  },
  couponChoiceTap: function (event) {
    var couponindex = event.currentTarget.dataset.index;
    var coupontype = event.currentTarget.dataset.coupontype;
    this.setData({ couponindex: couponindex });
    this.setData({ coupontype: coupontype });
    if (this.data.couponList.length > 0) {
      for (var i = 0; i < this.data.couponList.length; i++) {
        this.data.couponList[i].selected = 0;
      }
      this.data.couponList[couponindex].selected = 1;
      this.setData({ couponList: this.data.couponList });
    }
  },
  actionSheetbindchange: function () {
    if (this.data.coupon.list.length < 1) {
      return;
    }
    this.setData({
      choiceCouponHidden: !this.data.choiceCouponHidden
    });
    this.setData({ couponList: this.data.coupon.list });
  },
  sureChoiceCouponTap: function () {
    this.setData({
      choiceCouponHidden: !this.data.choiceCouponHidden
    });
    this.data.coupon.list = this.data.couponList;
    this.setData({ coupon: this.data.coupon });
    var couponindex = this.data.couponindex;
    var coupontype = this.data.coupontype;
    this.useCoupon(couponindex, coupontype);
  },
  //使用帮考币
  useBkgold: function (state) {
    if (this.data.switchChecked2 == 0 && parseFloat(this.data.balance.bkgold) > 0) {
      //使用余额
      if (parseFloat(this.data.price) > parseFloat(this.data.balance.bkgold)) {
        //余额不足
        this.setData({ price: (parseFloat(this.data.price) - parseFloat(this.data.balance.bkgold)).toFixed(2) });
        this.setData({ bkgoldA: '0.00' });
        this.setData({ bkgoldB: -parseFloat(this.data.balance.bkgold) });
      } else {
        //余额够扣除
        this.setData({ bkgoldA: parseFloat(this.data.balance.bkgold) - parseFloat(this.data.price) });
        this.setData({ bkgoldB: -parseFloat(this.data.price) });
        this.setData({ price: '0.00' });
      }
    } else {
      if (state == 0) {
        this.setData({ bkgoldA: parseFloat(this.data.balance.bkgold) });
        this.setData({ bkgoldB: '0.00' });
        if (parseFloat(this.data.price) > parseFloat(this.data.balance.bkgold)) {
          //余额不足
          this.setData({ price: (parseFloat(this.data.price) + parseFloat(this.data.balance.bkgold)).toFixed(2) });
        } else {
          this.setData({ price: this.data.totalprice });
        }
      } else { }
    }
  },
  //使用余额
  useBalance: function (state) {
    if (this.data.switchChecked1 == 0 && parseFloat(this.data.balance.balance) > 0) {
      //使用余额
      if (parseFloat(this.data.price) > parseFloat(this.data.balance.balance)) {
        //余额不足
        this.setData({ price: (parseFloat(this.data.price) - parseFloat(this.data.balance.balance)).toFixed(2) });
        this.setData({ balanceA: '0.00' });
        this.setData({ balanceB: -parseFloat(this.data.balance.balance) });
      } else {
        //余额够扣除
        this.setData({ balanceA: parseFloat(this.data.balance.balance) - parseFloat(this.data.totalprice) });
        this.setData({ balanceB: -parseFloat(this.data.totalprice) });
        this.setData({ price: '0.00' });
        this.setData({ bkgoldA: parseFloat(this.data.balance.bkgold) });
        this.setData({ bkgoldB: '0.00' });
      }
    } else {
      this.setData({ balanceA: parseFloat(this.data.balance.balance) });
      this.setData({ balanceB: '0.00' });
      if (parseFloat(this.data.price) > parseFloat(this.data.balance.balance)) {
        //余额不足
        this.setData({ price: (parseFloat(this.data.price) + parseFloat(this.data.balance.balance)).toFixed(2) });
      } else {
        this.setData({ price: this.data.totalprice });
      }
      //优先使用余额
      // 1、余额>=应付金额不使用帮考币 
      // 2、余额<应付金额使用帮考币 (1、帮考币余额>0;2、帮考币余额=0)
      if (this.data.switchChecked2 == 0) {
        // 使用帮考币
        if (parseFloat(this.data.balance.bkgold) > 0) {
          // 帮考币>0
          // this.setData({ switchChecked2 : 0});
          this.useBkgold(0);
        } else {
          // 帮考币=0
          this.setData({ bkgoldA: parseFloat(this.data.balance.bkgold) });
          this.setData({ bkgoldB: '0.00' });
        }
      } else {
        // this.setData({ switchChecked2 : 0});
      }
    }
  },
  //使用优惠券
  useCoupon: function (couponindex, coupontype) {
    this.setData({ price: this.data.totalprice });
    if (coupontype == "allcategorydiscount") {
      //打折
      this.setData({ price: (parseFloat(this.data.price) * parseFloat(this.data.coupon.list[couponindex].price)).toFixed(2) });
    } else if (coupontype == "allcategoryrebate") {
      //满减
      this.setData({ price: parseFloat(this.data.price) - parseFloat(this.data.coupon.list[couponindex].price).toFixed(2) });
    }
    this.useBalance(1);
    this.useBkgold(1);
  },
  //我的优惠券
  checkorder: function () {
    var wx_openid = swan.getStorageSync('wx_openid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    var bkgold = 0;
    var balance = 0;
    if (this.data.switchChecked2 == 0 && parseFloat(this.data.balance.bkgold) > 0) {
      bkgold = this.data.balance.bkgold;
    }
    if (this.data.switchChecked1 == 0 && parseFloat(this.data.balance.balance) > 0) {
      balance = this.data.balance.balance;
    }
    var couponid = "";
    if (this.data.couponindex != -1 && this.data.coupon.list[this.data.couponindex].courseid != -1) {
      couponid = this.data.coupon.list[this.data.couponindex].couponid;
    }
    var dataParmars = {
      sessionid: sessionid,
      uid: uid,
      orderguid: this.data.orderguid,
      orderid: this.data.orderid,
      totalprice: this.data.totalprice,
      bkgold: bkgold,
      balance: balance,
      amountdue: this.data.price,
      couponid: couponid
      // list: this.data.list,
    };
    api.checkorder({
      methods: 'POST',
      data: dataParmars,
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ checkorder: 1 });
          if (data.step == "qianyue") {
            swan.showModal({
              title: '温馨提示',
              content: '购买完成，课程开通成功！',
              showCancel: false,
              success: function (res) {
                swan.navigateBack({
                  delta: 2
                });
              }
            });
          } else if (data.step == "zhifu") {
            this.setData({ orderguid: data.orderguid });
            this.setData({ orderid: data.orderid });
            this.setData({ price: data.orderprice });
            this.createpayorder();
          }
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
});