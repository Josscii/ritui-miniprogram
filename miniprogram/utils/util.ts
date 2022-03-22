export const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  return (
    [year, month, day].map(formatNumber).join("/") +
    " " +
    [hour, minute].map(formatNumber).join(":")
  );
};

const formatNumber = (n: number) => {
  const s = n.toString();
  return s[1] ? s : "0" + s;
};

// 获取当前帐号信息
const accountInfo = wx.getAccountInfoSync();

// env类型
const env = accountInfo.miniProgram.envVersion ?? "release";

const baseApi = {
  // 开发版
  develop: "http://localhost:8080",
  // 体验版
  trial: "http://localhost:3001",
  // 正式版
  release: "http://localhost:3001",
};

// request请求baseURL
export const baseURL = baseApi[env];
