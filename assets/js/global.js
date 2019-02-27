const APIurl = "http://lvv.fun:781";
const WebSocketHost = "http://63.223.103.49:8781";
const io = require("./socket.io");

var GJS = {
  // 接口地址词典
  apiDic: {
    "registTraveler": "/registTraveler",//游客注册 post
    // "login": "/login",//登录 post
    "test": "/test",//测试token
    "setLang": "/setLang",//设置默认语言
    "createRoom": "/createRoom",//开始匹配
  },

  // lang: "en",
  lang: "zh",
  setLang(lan) {
    this.lang = lan;
  },
  tips: {
    en: {
      "password": "password",
      "regTip": "please remember your ID, and change your default password as soon as you can.",
      "regLabel": "One-click Login",
      "logLabel": "Login",
      "okLabel": "Ok",
      "cancelLabel": "Cancel",
      "chooseHardLabel": "Choose difficult",
      "easy": "Easy",
      "normal": "Normal",
      "hard": "Hard",
      "baddream": "Nightmare",
      "chooseWeaponLabel": "Choose weapon",
      "knife": "Knife",
      "lipstick": "Lipstick",
      "brush": "Writing brush",
      "righthand": "Salted fish",
      "startLabel": "Fighting",
      "placeLabel": "Can enter the specified ID to fight",
      "findPlayer": "Looking for an opponent...",
      "disconnTip": "Disconnect...",
      "matchSuccess": "Successful match,waiting for the resource to load",
      "score": "score",
      "winner": "$uid win!",
      "ping": "This game is flattened,let's have another game^_^",
      "yourturn": "Your turn",
      "waiting": "Waiting",
    },
    zh: {
      "password": "密码",
      "regTip": "请牢记你的ID，并尽快修改默认密码。",
      "regLabel": "一键登录",
      "logLabel": "登录",
      "okLabel": "确认",
      "cancelLabel": "取消",
      "chooseHardLabel": "选择难度",
      "easy": "简单",
      "normal": "中等",
      "hard": "困难",
      "baddream": "噩梦",
      "chooseWeaponLabel": "选择武器",
      "knife": "小刀",
      "lipstick": "口红",
      "brush": "毛笔",
      "righthand": "咸鱼",
      "startLabel": "开始匹配",
      "placeLabel": "可输入指定ID决战",
      "findPlayer": "正在寻找对手...",
      "disconnTip": "断开连接...",
      "matchSuccess": "匹配成功，等待资源载入中",
      "score": "得分",
      "winner": "$uid赢了！",
      "ping": "这局打平了，再来一局吧^_^",
      "yourturn": "你的回合",
      "waiting": "待机中",
    },
    vi: {
      "password": "Mật khẩu",
      "regTip": "Hãy nhớ ID của bạn, và thay đổi mật khẩu mặc định của bạn ngay khi bạn có thể.",
      "regLabel": "One-click đăng nhập",
      "logLabel": "Đăng nhập",
      "okLabel": "Được",
      "cancelLabel": "Hủy bỏ",
      "chooseHardLabel": "Chọn cấp độ",
      "easy": "Dễ dàng",
      "normal": "Bình thường",
      "hard": "Khó",
      "baddream": "Ác mộng",
      "chooseWeaponLabel": "Chọn vũ khí",
      "knife": "Dao",
      "lipstick": "Son môi",
      "brush": "Bàn chải viết",
      "righthand": "Cá muối",
      "startLabel": "Khởi đầu",
      "placeLabel": "Có thể nhập ID được chỉ định để chiến đấu",
      "findPlayer": "Tìm đối thủ...",
      "disconnTip": "Ngắt kết nối...",
      "matchSuccess": "Trận đấu thành công,chờ tài nguyên tải",
      "score": "Ghi bàn",
      "winner": "$uid thắng lợi!",
      "ping": "Trò chơi này được làm phẳng,hãy có một trò chơi khác^_^",
      "yourturn": "Lượt của bạn",
      "waiting": "Ở chế độ chờ",
    },
  },

  // http状态码字典
  httpCodeDic: {
    en: {
      "100": "Regist successful!",
      "101": "IP is restricted",
      "102": "Error code is 102",
      "103": "Please check your ID and password",
      // "104": "System busy",
      "105": "Login successful!",
      "106": "login your ID please",
      "107": "your ID is timeout",
    },
    zh: {
      "100": "注册成功!",
      "101": "IP受限",
      "102": "错误码102",
      "103": "请检查你的ID和密码",
      // "104": "登陆失败，网络繁忙",
      "105": "登录成功!",
      "106": "请先登录你的ID",
      "107": "登录超时",
      "108": "正在匹配中",
      "109": "创建匹配故障",
    },
    vi: {
      "100": "Đăng ký thành công!",
      "101": "IP bị hạn chế",
      "102": "Mã lỗi là 102",
      "103": "Vui lòng kiểm tra ID và mật khẩu của bạn",
      // "104": "Hệ thống bận",
      "105": "Đăng nhập thành công!",
      "106": "vui lòng đăng nhập ID của bạn",
      "107": "ID của bạn đã hết thời gian",
    },
  },

  // 登录获取的token
  setToken(token) {
    this.token = token
  },
  getToken() {
    return this.token || null
  },
  setID(uid) {
    this.uid = uid;
  },
  setGameConfig(obj) {
    this.gameConfig = obj;
  },
  connSocket() {
    if (this.socket) {
      this.socket.close();
    }
    this.socket = io(WebSocketHost);
    this.socket.on('connect', () => {
      if (!this.socket.connected) {
        console.log(`socket connected ERR`);
      }
    });
    this.socket.on('disconnect', () => {
      if (!this.socket.connected) {
        console.log(`socket disconnect`);
      }
    });
    this.socket.on('reconnecting', () => {
      console.log(`socket reconnecting`);
    });
    this.socket.on('reconnect_failed', () => {
      console.log(`socket reconnect_failed`);
    });
    this.socket.on('reconnect_error', () => {
      console.log(`socket reconnect_error`);
    });
    this.socket.on('reconnect', () => {
      console.log(`socket reconnect OK`);
    });
  },
  setOn(evntName, fun) {
    this.socket.on(evntName, (data) => {
      if (fun) fun(data)
    })
  },
  setOff(evntName) {
    this.socket.off(evntName)
  },
  setFun(name, fun) {
    this[name] = fun;
  },

  // 正则
  regDic: {
    "username": /^[a-z][0-9]{6,7}$/,//用户名 小写字母开头+数字，7-8位
    "password": /^[a-z0-9]{6,8}/,//密码 小写字母和数字，6-8位
  },

  // http get请求
  sendGetRequest(path, data, handler, extraUrl) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.timeout = 5000;
    var str = "?";
    for (var k in data) {
      if (str != "?") {
        str += "&";
      }
      str += k + "=" + data[k];
    }
    if (extraUrl == null) {
      extraUrl = APIurl;
    }
    var requestURL = extraUrl + path + encodeURI(str);
    console.log("sendGetRequest RequestURL:" + requestURL);
    xhr.open("GET", requestURL, true);
    if (!cc.sys.isNative) {
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.setRequestHeader("token", this.getToken());
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
        console.log("sendGetRequest http res(" + xhr.responseText.length + "):" + xhr.responseText);
        var httpStatus = xhr.statusText;
        var response = xhr.responseText;
        if (httpStatus == "OK") {
          response = JSON.parse(response);
          if (handler !== null) {
            handler(response);
          }
        }
      }
    };
    xhr.send();
    // return xhr;
  },

  // http post请求
  sendPostRequest(path, data, handler, extraUrl) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.timeout = 5000;
    if (extraUrl == null) {
      extraUrl = APIurl;
    }
    var requestURL = extraUrl + path;
    console.log("sendPostRequest RequestURL:" + requestURL);
    xhr.open("POST", requestURL, true);
    if (!cc.sys.isNative) {
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.setRequestHeader("token", this.getToken());
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
        console.log("sendPostRequest http res(" + xhr.responseText.length + "):" + xhr.responseText);
        var httpStatus = xhr.statusText;
        var response = xhr.responseText;
        if (httpStatus == "OK") {
          response = JSON.parse(response);
          if (handler !== null) {
            handler(response);
          }
        }
      }
    };
    xhr.send(JSON.stringify(data));
    // return xhr;
  },
};
module.exports = GJS;