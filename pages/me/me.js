// me.js
import api from '../../api/api.js';
import request from '../../api/request.js';
import common from '../../utils/common.js';
var courseid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 0,
      leftBtnImg: '../../image/navigation/back.png',
      leftBtnTitle: '分类',
      centerBtn: 0,
      centerBtnTitle: '我'
      // rightBtn: 0,
      // rightBtnImg: '../../image/navigation/back.png',
      // rightBtnTitle: '选择',
      // viewTitleList: ["证券", "基金"]
    },

    headPortrait: 'http://attachment.cnbkw.com/bkwimg/up/201705/d6b6f2b54fa34bc3822c7cfb02f00625.jpg',
    username: '',
    course: [{
      icon: '../../image/me/me_recharge.png',
      title: '账户充值'
    }, {
      icon: '../../image/me/me_course.png',
      title: '我的课程'
    },
    // {
    //   icon: '../../image/me/me_mylive.png',
    //   title: '我的直播'
    // },
    {
      icon: '../../image/me/me_buy.png',
      title: '购买课程'
    }, {
      icon: '../../image/me/me_order.png',
      title: '我的订单'
    }],
    common: [{
      icon: '../../image/me/me_switch.png',
      title: '切换考试'
    },
    // {
    //   icon: '../../image/me/me_contact.png',
    //   title: '客服微信'
    // },
    {
      icon: '../../image/me/me_tell.png',
      title: '联系客服'
    }],
    refresh: "0"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var refresh = options.refresh;
    if (refresh == 1) {
      courseid = swan.getStorageSync('courseid');
      this.checkcourse();
      this.mymembertype();
      var bk_userinfo = swan.getStorageSync('bk_userinfo');
      this.setData({ userinfo: bk_userinfo });
    }
    var wx_openid = swan.getStorageSync('wx_openid');
    var wx_session_key = swan.getStorageSync('wx_session_key');
    var wx_unionid = swan.getStorageSync('wx_unionid');
    if (wx_openid == "" || wx_session_key == "") {
      this.wxLogin();
    } else {
      // 判断session_key是否过期
      swan.checkSession({
        success: res => { // 未过期
          //判断缓存里是否已经存在userinfo
          var userinfo = swan.getStorageSync('userinfo');
          if (userinfo != "") {
            this.setData({ headPortrait: userinfo.avatarUrl });
            this.setData({ username: userinfo.nickName });
          } else {
            this.getUserInfo();
          }
        },
        fail: err => { // 已过期
          this.wxLogin();
        }
      });
    }
    courseid = swan.getStorageSync('courseid');
    this.checkcourse();
    this.mymembertype();
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    this.setData({ userinfo: bk_userinfo });
    this.checkSystemOS();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    swan.setNavigationBarTitle({
      title: '我'
    });
    let result = swan.isLoginSync();
    this.setData({ isLogin: result.isLogin });
    swan.setStorageSync('isLogin', result.isLogin);
    //绑定及解绑刷新页面
    if (this.data.refresh == 1) {
      courseid = swan.getStorageSync('courseid');
      this.checkcourse();
      this.mymembertype();
      var bk_userinfo = swan.getStorageSync('bk_userinfo');
      this.setData({ userinfo: bk_userinfo });
      this.setData({ refresh: 0 });
    }
    var courseidSnc = swan.getStorageSync('courseid');
    if (courseid != courseidSnc && courseidSnc.length > 0) {
      courseid = courseidSnc;
      this.checkcourse();
    }
    var isSetProject = swan.getStorageSync('isSetProject'); //已经选择
    if (isSetProject == undefined || isSetProject != 1) {
      this.checkproject();
    }
  },

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
  /**
   * 微信登录
   */
  wxLogin: function () {
    swan.login({
      success: res => {
        if (res.code) {
          this.getOpenIdAndSessionKey(res.code);
        } else {
          console.log('获取用户登录态失败！' + res.errMsg);
        }
      }
    });
  },
  //获取用户信息
  getUserInfo: function () {
    var that = this;
    var userinfo = swan.getStorageSync('userinfo');
    if (userinfo != "") {
      that.setData({ headPortrait: userinfo.avatarUrl });
      that.setData({ username: userinfo.nickName });
    } else {
      that.getUserInfoNext();
    }
  },
  getUserInfoNext: function () {
    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    swan.getUserInfo({
      success: res => {
        this.setData({ userinfo: res.userInfo });
        swan.setStorageSync('userinfo', res.userInfo);
        if (res.encryptedData != undefined || res.encryptedData != null) {
          this.setData({ encryptedData: res.encryptedData });
        } else {
          this.setData({ encryptedData: res.data });
        }
        this.setData({ iv: res.iv });
        this.setData({ headPortrait: res.userInfo.avatarUrl });
        this.setData({ username: res.userInfo.nickName });
        var userInfo = res.userInfo;
        var nickName = userInfo.nickName;
        var avatarUrl = userInfo.avatarUrl;
        var gender = userInfo.gender; //性别 0：未知、1：男、2：女
        //判断是否存在unionid
        // var unionid = swan.getStorageSync('wx_unionid');
        // if (unionid == "") {
        //   // this.getweixin_unionid();
        // } else {
        //   //获取微信openid、unionid后，检测是否绑定了帮考网账户，绑定了直接登录
        //   request.request_thirdauth(0);
        // }
        //获取微信openid、unionid后，检测是否绑定了帮考网账户，绑定了直接登录
        request.request_thirdauth(0);
      },
      fail: function (res) {
        console.log("获取用户信息失败！");
        swan.showToast({
          title: '授权失败',
          icon: 'success',
          duration: 1500
        });
      }
    });
  },
  onGotUserInfo: function (e) {
    let result = swan.isLoginSync();
    if (result.isLogin) {
      let openid = swan.getStorageSync('wx_openid');
      let session_key = swan.getStorageSync('wx_session_key');
      if (openid == "" || openid == undefined || session_key == "" || session_key == undefined) {
        this.wxLogin();
      }
      swan.setStorageSync('userinfo', e.detail.userInfo);
      var that = this;
      that.setData({ encryptedData: e.detail.encryptedData });
      that.setData({ iv: e.detail.iv });
      that.setData({ headPortrait: e.detail.userInfo.avatarUrl });
      that.setData({ username: e.detail.userInfo.nickName });
      var userInfo = e.detail.userInfo;
      var nickName = userInfo.nickName;
      var avatarUrl = userInfo.avatarUrl;
      var gender = userInfo.gender; //性别 0：未知、1：男、2：女

      request.request_thirdauth(0);
      swan.navigateTo({
        url: 'account/account'
      });
    } else {
      swan.showModal({
        title: '温馨提示',
        content: '请先登录百度APP帐号',
        showCancel: false
      });
    }
  },
  getAccessToken: function (event) {
    var parameter = 'grant_type=client_credential&appid=' + getApp().globalData.appid + '&secret=' + getApp().globalData.appsecret;
    api.getTransferRequest({
      methods: 'POST',
      data: {
        url: 'https://api.weixin.qq.com/cgi-bin/token',
        method: 'GET',
        parameter: parameter
      },
      success: res => {
        var data = res.data;
        console.log(data);
      }
    });
  },
  //获取opened 
  getOpenIdAndSessionKey: function (code) {
    var that = this;
    swan.request({
      url: 'https://openapi.baidu.com/nalogin/getSessionKeyByCode?code=' + code + '&client_id=' + getApp().globalData.sh_key + '&sk=' + getApp().globalData.appsecret,
      success: res => {
        var data = res.data;
        swan.setStorageSync('wx_openid', data.openid);
        swan.setStorageSync('wx_session_key', data.session_key);
        this.setData({ session_key: data.session_key });
        this.setData({ code: code });
        //判断缓存里是否已经存在userinfo
        var userinfo = swan.getStorageSync('userinfo');
        if (userinfo != "") {
          that.setData({ userinfo: userinfo });
          that.setData({ headPortrait: userinfo.avatarUrl });
          that.setData({ username: userinfo.nickName });
        } else {
          that.getUserInfo();
        }
      }
    });
  },
  //课程cell点击事件
  courseClick: function (event) {
    var index = event.currentTarget.dataset.hi;
    switch (index) {
      case 0:
        var url = '../me/recharge/recharge';
        this.checkUserInfo(url);
        break;
      case 1:
        var url = '../course/myCourse/myCourse';
        this.checkUserInfo(url);
        break;
      // case 2:
      //   var url = '../me/mylive/mylive';
      //   this.checkUserInfo(url);
      //   break;
      case 2:
        var url = '../course/buyCourse/buyCourseDetail/buyCourseDetail';
        this.checkUserInfo(url);
        break;
      case 3:
        var url = "../course/myorder/myorder";
        this.checkUserInfo(url);
        break;
      default:
        break;

    }
  },
  //通用cell点击事件
  commonClick: function (event) {
    var that = this;
    var index = event.currentTarget.dataset.hi;
    switch (index) {
      case 0:
        swan.navigateTo({
          url: '../learn/classCategory/classCategory'
        });
        break;
      case 1:
        // swan.navigateTo({
        //   url: 'wechatService/wechatService'
        // });
        break;
      case 2:
        that.calling();
        break;
      default:
        break;

    }
  },
  //拨打电话
  calling: function () {
    swan.makePhoneCall({
      phoneNumber: '4006601360', //此号码并非真实电话号码，仅用于测试
      success: function () {
        console.log("拨打电话成功！");
      },
      fail: function () {
        console.log("拨打电话失败！");
      }
    });
  },
  checkUserInfo: function (url) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未绑定帮考网账号，请先绑定！',
        confirmText: "立即绑定",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var bindurl = '../me/bind/bind';
            swan.navigateTo({
              url: bindurl
            });
          } else {
            return;
          }
        }
      });
    } else {
      swan.navigateTo({
        url: url
      });
    }
  },
  //先获取courseid再检查课程页面信息
  checkcourse: function (event) {
    if (courseid.length < 1) {
      swan.redirectTo({
        url: '../learn/classCategory/classCategory'
      });
    } else {
      request.request_checkcourse();
    }
  },
  //检查是否选择过关注的考试
  checkproject: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid;
    var uid;
    var that = this;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    } else {
      return;
    }
    api.checkproject({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid
      },
      success: res => {
        var data = res.data;
        swan.hideToast();
        if (data.errcode == 0) {
          var data = res.data;
          if (data.isexist == 1) {
            swan.setStorageSync('isSetProject', 1); //已经选择
          } else {
            that.setproject();
          }
        }
      }
    });
  },
  //选择关注的考试
  setproject: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid;
    var uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    } else {
      return;
    }
    var categoryname = swan.getStorageSync('categoryname');
    if (categoryname.length < 1) {
      return;
    }
    api.setproject({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        project: categoryname
      },
      success: res => {
        var data = res.data;
        swan.hideToast();
        if (data.errcode == 0) {
          var data = res.data;
        }
      }
    });
  },
  //选择关注的考试
  mymembertype: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid;
    var uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    } else {
      return;
    }
    var coursename = swan.getStorageSync('coursename');
    if (coursename.length < 1) {
      return;
    }
    api.mymembertype({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid
      },
      success: res => {
        var data = res.data;
        swan.hideToast();
        this.setData({ mymembertype: data.title });
      }
    });
  },
  leftBtnClick: function () {
    var url = '../learn/classCategory/classCategory';
    swan.navigateTo({
      url: url
    });
  },
  //获取unionid
  getweixin_unionid: function () {
    api.getweixin_unionid({
      methods: 'POST',
      data: {
        encryptedData: this.data.encryptedData,
        iv: this.data.iv,
        session_key: this.data.session_key,
        code: this.data.code
      },
      success: res => {
        var data = res.data;
        swan.hideToast();
        if (data.errcode == 0) {
          this.setData({ headPortrait: data.avatarUrl });
          this.setData({ username: data.nickname });
          var userinfo = {
            nickName: data.nickname,
            avatarUrl: data.avatarUrl,
            gender: data.gender,
            province: data.province,
            city: data.city,
            country: data.country,
            language: data.language
          };
          this.setData({ userinfo: userinfo });
          swan.setStorageSync('userinfo', userinfo);
          swan.setStorageSync('wx_unionid', data.unionid);
          request.request_thirdauth(0);
        }
      }
    });
  },
  checkSystemOS: function () {
    var that = this;
    swan.getSystemInfo({
      success: function (res) {
        console.log(res);
        that.setData({
          systemInfo: res
        });
        if (res.platform == "devtools") {
          that.setData({ "mobileOS": "devtools" });
        } else if (res.platform == "ios") {
          that.setData({ "mobileOS": "ios" });
        } else if (res.platform == "android") {
          that.setData({ "mobileOS": "android" });
        }
      }
    });
  }
});