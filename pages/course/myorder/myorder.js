// pages/course/myorder/myorder.js
import api from '../../../api/api.js';
import common from '../../../utils/common.js';
//获取应用实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentindex: 0,
    isHideLoadMore: true,
    pageindex: 1,
    pagesize: 10,
    loadMoreMsg: '加载更多'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.myorder(1);
    this.myorder(0);
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
  swiperChange: function (e) {
    var currnet = e.detail.current;
    if (currnet == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (currnet == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    }
  },
  myOrderBtnClick: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (index == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    }
  },
  myorder: function (state) {
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo.sessionid != '' && bk_userinfo.sessionid != null) {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.myorder({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        state: state,
        pagecurrent: 1
      },
      success: res => {
        var data = res.data;
        if (state == 1) {
          this.setData({ myorderYes: data });
        } else {
          this.setData({ myorderNo: data });
        }
      }
    });
  },
  payBtnClick: function (event) {
    var orderguid = event.currentTarget.dataset.orderguid;
    var url = 'myorderDetail?orderguid=' + orderguid + '&state=0';
    swan.navigateTo({
      url: url
    });
    // this.getorderdetail(orderguid);
  },
  cancelBtnClick: function (event) {
    var orderguid = event.currentTarget.dataset.orderguid;
    var that = this;
    swan.showModal({
      title: '温馨提示',
      content: '是否取消订单',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          that.cancelorder(orderguid);
        } else {
          return;
        }
      }
    });
  },
  cancelorder: function (orderguid) {
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo.sessionid != '' && bk_userinfo.sessionid != null) {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.cancelorder({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        orderguid: orderguid
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          common.showToast({
            title: "取消订单成功！"
          });
          this.myorder(0);
        }
      }
    });
  },
  orderYesClick: function (event) {
    var orderguid = event.currentTarget.dataset.orderguid;
    var url = 'myorderDetail?orderguid=' + orderguid + '&state=1';
    swan.navigateTo({
      url: url
    });
  },
  //加载更多
  scrolltolower: function (e) {
    // if (this.data.currentindex == 0) {
    //   if (this.data.myorderYes.data.length % 10 != 0) {
    //     this.setData({ isHideLoadMore: false });
    //     this.setData({ loadMoreMsg: '暂无更多数据' })
    //     setTimeout(() => {
    //       this.setData({ isHideLoadMore: true });
    //     }, 1000)
    //   } else {
    //     wx.showNavigationBarLoading(); //在标题栏中显示加载
    //     this.setData({ pageindex: this.data.pageindex + 1 });
    //     this.myorder(1);
    //   }
    // } else if (this.data.currentindex == 1) {
    //   if (this.data.myorderNo.data.length % 10 != 0) {
    //     this.setData({ isHideLoadMore: false });
    //     this.setData({ loadMoreMsg: '暂无更多数据' })
    //     setTimeout(() => {
    //       this.setData({ isHideLoadMore: true });
    //     }, 1000)
    //   } else {
    //     this.setData({ pageindex: this.data.pageindex + 1 });
    //     this.myorder(0);
    //   }
    // }
  }
});