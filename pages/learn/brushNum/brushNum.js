// pages/learn/brushNum/brushNum.js
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
      centerBtn: 0,
      centerBtnTitle: '刷题数量'
    },
    isHideLoadMore: true,
    pageindex: 1,
    pagesize: 10,
    loadMoreMsg: '加载更多',
    arc_lData: {},
    arc_rData: {},
    correct_rate: 12, //正确率
    cicleStr: '0',
    cicleSymbol: '%'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = swan.getStorageSync('courseid');
    this.getshuaticount();
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
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  //获取考试类别
  getshuaticount: function () {
    api.getshuaticount({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          data.wastetime = this.parseTime(data.wastetime);
          this.setData({ brush: data });
          this.studyhistory();
        } else {
          common.showToast({
            title: data.errmsg
          });
        }
      }
    });
  },
  studyhistory: function () {
    var courseid = swan.getStorageSync('courseid');
    api.studyhistory_v3({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        state: -1,
        pageindex: this.data.pageindex,
        pagesize: this.data.pagesize,
        sort: 'desc'

      },
      success: res => {
        swan.hideToast();
        // this.setData({ isHideLoadMore: true })
        swan.hideNavigationBarLoading(); //完成停止加载
        var data = res.data;
        if (data.errcode == 0) {
          var learnType = app.globalData.learnType;
          if (this.data.pageindex > 1) {
            var learnlist = this.data.learnlist;
            learnlist = learnlist.concat(data.val);
            this.data.learnlist = learnlist;
            this.setData({ learnlist: this.data.learnlist });
          } else {
            this.setData({ learnlist: data.val });
          }
          for (var i = 0; i < this.data.learnlist.length; i++) {
            if (this.data.learnlist[i].wastetime > 0) {
              this.data.learnlist[i].wastetime = this.parseTime(this.data.learnlist[i].wastetime);
            } else {
              this.data.learnlist[i].wastetime = '0分0秒';
            }
            var optionArr = common.splitToArray(this.data.learnlist[i].accuracy, "%");
            this.data.learnlist[i].accuracy = optionArr[0];
          }
          this.setData({ learnlist: this.data.learnlist });
          for (var i = 0; i < this.data.learnlist.length; i++) {
            var correct_rate = this.data.learnlist[i].accuracy;
            this.drawCicle(correct_rate, i);
          }
        } else {
          common.showToast({
            title: data.errmsg
          });
        }
      }
    });
  },
  scrolltolower: function (e) {
    console.log('加载更多' + e);
    if (this.data.learnlist.length % 10 != 0 || this.data.pageindex >= 10) {
      this.setData({ isHideLoadMore: false });
      this.setData({ loadMoreMsg: '暂无更多数据' });
      setTimeout(() => {
        this.setData({ isHideLoadMore: true });
      }, 1000);
    } else {
      swan.showNavigationBarLoading(); //在标题栏中显示加载
      this.setData({ pageindex: this.data.pageindex + 1 });
      this.studyhistory();
    }
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
  },
  drawCicle: function (correct_rate, index) {
    var learnlist = this.data.learnlist;
    var arc_l_rotate = -135 + 3.6 * correct_rate;
    var arc_r_rotate = -135 + 3.6 * (correct_rate - 50);
    var animation1 = swan.createAnimation({
      transformOrigin: "50% 50%",
      duration: 600,
      timingFunction: "linear",
      delay: 0
    });
    if (correct_rate <= 50) {
      setTimeout(function () {
        animation1.rotate(arc_l_rotate).step();
        this.data.learnlist[index].arc_lData = animation1.export();
        this.setData({
          learnlist: this.data.learnlist
        });
      }.bind(this), 500);
    } else {
      setTimeout(function () {
        animation1.rotate(45).step();
        this.data.learnlist[index].arc_lData = animation1.export();
        this.setData({
          learnlist: this.data.learnlist
        });
      }.bind(this), 500);
      var animation2 = swan.createAnimation({
        transformOrigin: "50% 50%",
        duration: 600,
        timingFunction: "linear",
        delay: 600
      });
      setTimeout(function () {
        animation2.rotate(arc_r_rotate).step();
        this.data.learnlist[index].arc_rData = animation2.export();
        this.setData({
          learnlist: this.data.learnlist
        });
      }.bind(this), 500);
    }
  },
  studyhistoryYesListClick: function (e) {
    var index = e.currentTarget.dataset.index;
    var paperid = this.data.learnlist[index].paperid;
    var unitid = this.data.learnlist[index].unitid;
    var learnType = this.data.learnlist[index].type;
    var url = '../../course/paper/report/report?paperid=' + paperid + '&unitid=' + unitid + '&learnType=' + learnType + '&showLearn=false';
    swan.navigateTo({
      url: url
    });
  },
  studyhistoryNoListClick: function (e) {
    var index = e.currentTarget.dataset.index;
    var paperid = this.data.learnlist[index].paperid;
    var unitid = this.data.learnlist[index].unitid;
    var learnType = this.data.learnlist[index].type;
    // this.request_loadinitbylid(paperid, unitid, learnType, 0);
    this.request_loadrecordpaper(paperid, unitid, learnType, 0);
  },
  /**
  * 获取学习历史试卷_v2
  */
  request_loadrecordpaper: function (paperid, unitid, learnType, free) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    var courseid = swan.getStorageSync('courseid');
    if (sessionid == '' || sessionid == null || uid == '' || uid == null) {
      return;
    }
    api.loadrecordpaper({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        unitid: unitid,
        paperid: paperid,
        type: learnType,
        videosource: app.globalData.videosource,
        market: app.globalData.market
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          var question = JSON.stringify(data);
          var url = '../../course/paper/studyPage/studyPage?unitid=' + unitid + '&paperid=' + data.paperid + '&question=' + question + '&learnType=' + learnType + '&history=1' + '&paperTitle=' + data.unitname;
          //console.log('url=' + url);
          swan.navigateTo({
            url: encodeURI(url)
          });
        } else {
          common.showToast({
            title: data.errmsg
          });
        }
      }
    });
  }
});