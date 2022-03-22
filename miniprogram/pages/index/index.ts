import { baseURL, formatTime } from "../../utils/util";

Page({
  data: {
    text: "",
    showUserInfo: false,
    daily: {
      status: 0,
      data: {
        responseType: 0,
        id: "",
      },
    },
    showedGuide: -1,
  },
  skipGuide() {
    wx.setStorageSync("showedGuide", "1");
    this.setData({ showedGuide: 1 });
  },
  onReady() {
    this.loadLocalData();
    this.fetchDaily();
  },
  loadLocalData() {
    const userInfo = wx.getStorageSync("userInfo");
    const showedGuide = wx.getStorageSync("showedGuide");
    this.setData({ userInfo, showedGuide });
  },
  fetchDaily() {
    const token = wx.getStorageSync("token");
    wx.request({
      url: `${baseURL}/mpapi/daily`,
      header: { Authorization: `Bearer ${token}` },
      success: (res) => {
        if (typeof res.data == "object" && "data" in res.data) {
          const daily = res.data.data;
          if (daily.status === 3) {
            const createdAt = new Date(daily.data.createdAt);
            const createAtStr = formatTime(createdAt);
            daily.data.createAtStr = createAtStr;
          }
          this.setData({ daily: daily });
        }
      },
      fail: (res) => {
        console.log(res.errMsg);
      },
    });
  },
  async login() {
    wx.showLoading({ title: "授权中..." });
    try {
      const userProfile = await wx.getUserProfile({
        desc: "授权信息来给大家分享你的故事",
      });

      wx.setStorageSync("userInfo", userProfile.userInfo);

      const res = await wx.login();
      if (res.code) {
        wx.request({
          url: `${baseURL}/mpapi/login`,
          method: "POST",
          data: {
            code: res.code,
            userInfo: userProfile.userInfo,
          },
          success: (res) => {
            wx.hideLoading();

            if (typeof res.data == "object" && "data" in res.data) {
              const token = res.data.data.token as string;

              wx.setStorageSync("token", token);

              this.setData({ userInfo: userProfile.userInfo });

              this.fetchDaily();
            } else {
              wx.showToast({
                title: "授权失败",
              });
            }
          },
          fail: () => {
            wx.showToast({
              title: "授权失败",
            });
          },
        });
      }
    } catch (error) {
      wx.showToast({
        title: "授权失败",
      });
    }
  },
  refuse() {
    wx.showModal({
      title: "确定要放弃吗？",
      content: "放弃后今天的内容会由其他人来发布",
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: "加载中..." });
          const token = wx.getStorageSync("token");
          wx.request({
            url: `${baseURL}/mpapi/refuse`,
            method: "POST",
            header: { Authorization: `Bearer ${token}` },
            complete: () => {
              wx.hideLoading();
            },
            success: () => {
              this.fetchDaily();
            },
            fail: (res) => {
              console.log(res.errMsg);
            },
          });
        }
      },
    });
  },
  post() {
    if (this.data.text.length === 0) {
      wx.showToast({ title: "请至少写点什么...", icon: "error" });
      return;
    }

    wx.showModal({
      title: "确定要发布吗？",
      content: "发布过后无法修改",
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: "加载中..." });
          const token = wx.getStorageSync("token");
          wx.request({
            url: `${baseURL}/mpapi/post`,
            method: "POST",
            header: { Authorization: `Bearer ${token}` },
            data: {
              text: this.data.text,
              showUserInfo: +this.data.showUserInfo,
            },
            complete: () => {
              wx.hideLoading();
            },
            success: () => {
              this.fetchDaily();
            },
            fail: (res) => {
              console.log(res.errMsg);
            },
          });
        }
      },
    });
  },
  response() {
    const token = wx.getStorageSync("token");

    if (!token) {
      wx.showToast({ title: "请登录后再操作" });
      return;
    }

    const responseType = this.data.daily.data.responseType;
    const type = responseType === 0 ? 1 : 0;

    wx.showLoading({ title: "加载中..." });

    wx.request({
      url: `${baseURL}/mpapi/response`,
      method: "POST",
      header: { Authorization: `Bearer ${token}` },
      data: {
        dailyId: this.data.daily.data.id,
        type: type,
      },
      complete: () => {
        wx.hideLoading();
      },
      success: () => {
        this.fetchDaily();
      },
      fail: (res) => {
        console.log(res.errMsg);
      },
    });
  },
});
