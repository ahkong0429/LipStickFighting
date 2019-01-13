const GJS = require("./global");
const AlertPath = 'Canvas/JS/Alert';
var Alert;

cc.Class({
  extends: cc.Component,

  properties: {
    regLabel: cc.Label,
    logLabel: cc.Label,
    loadingLay: cc.Layout,
    progressBar: cc.ProgressBar,
    protxt: cc.Label,
  },

  onLoad() {
    // 初始化公用组件
    Alert = cc.find(AlertPath).getComponent('Alert');
    this.refreshCompLang();
  },

  // 加载语言词典
  refreshCompLang() {
    this.regLabel.string = GJS.tips[GJS.lang].regLabel;
    this.logLabel.string = GJS.tips[GJS.lang].logLabel;
  },

  onRegistClick() {
    // Alert.show("test");
    if (this.stopRegist) return;
    var self = this;
    this.stopRegist = true;
    this.showLoading();
    GJS.sendPostRequest(GJS.apiDic['registTraveler'], { time: new Date().getTime(), lang: GJS.lang }, (res) => {
      // let success = '';
      if (res.code == '100') {
        // success = success + "\r\n"
        //   + "ID:" + res.data.username + "\r\n"
        //   + GJS.tips[GJS.lang].password + ":" + res.data.password + "\r\n"
        //   + GJS.tips[GJS.lang].regTip
        GJS.setToken(res.data.token);
        GJS.setID(res.data.username);
        cc.director.preloadScene('user', () => {
          self.fullLoading();
          // cc.director.loadScene('user');
        });
      }
      self.stopRegist = false;
      // Alert.show(
      //   GJS.httpCodeDic[GJS.lang][res.code] + success,
      //   () => {
      //     self.stopRegist = false;
      //     // 弹出登录层
      //     // self.popInLoginLayout();
      //     // 自动输入账号密码
      //     // self.autoTypeInUnameAndPwd(res.data.username, res.data.password);
      //   },
      //   () => {
      //     self.stopRegist = false;
      //   }
      // )
    })
  },

  onChooseLang(node, data) {
    // cc.log(node);
    // if (data == 'vi') {
    //   Alert.show('Please wait, vn language translation still not finish');
    //   GJS.setLang('en');
    //   return;
    // }
    GJS.setLang(data);
    this.refreshCompLang();
  },

  showLoading() {
    this.loadingLay.node.active = true;
  },

  fullLoading() {
    if (this.loadingLay.node.active) {
      this.progressBar.progress = 1;
      this.protxt.string = '100%';
    }
    // 连接socket
    GJS.connSocket();
    var nextFun = cc.callFunc(function () {
      cc.director.loadScene('user');
    });
    var ac = cc.sequence(
      cc.fadeOut(0.7),
      nextFun
    )
    GJS.setOn('conn', (data) => {
      // cc.log(data);
      // 连接成功
      if (data.code == '200') {
        GJS.socket.emit('TokenVerify', GJS.token, GJS.uid, (rs) => {
          // cc.log(rs)
          if (rs.code == '300') {
            // token验证通过
            this.progressBar.node.runAction(ac);
          }
        });
      }
    })
  },

  update(dt) {
    if (this.loadingLay.node.active) {
      let bar = this.progressBar;
      if (bar.progress < 0.99) {
        bar.progress = bar.progress * 1 + 0.008;
        this.protxt.string = Math.round(parseFloat(bar.progress).toFixed(2) * 100) + '%';
      }
    }
  },


});
