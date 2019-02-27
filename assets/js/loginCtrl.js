const GJS = require("./global");
const AlertPath = 'Canvas/JS/Alert';
const shortid = require('shortid');
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
    // 生成一个sid
    var pre = 'lsf_';
    var sid = cc.sys.localStorage.getItem('sid');
    if (!sid) {
      sid = pre + shortid.generate();
      cc.sys.localStorage.setItem('sid', sid);
    }
    GJS.sid = sid;
    // cc.log(sid);
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
    cc.director.preloadScene('main', () => {
      self.stopRegist = false;
      self.fullLoading();
      // cc.director.loadScene('main');
    });
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
    // 连接socket
    GJS.connSocket();
    var nextFun = cc.callFunc(function () {
      cc.director.loadScene('main');
    });
    var ac = cc.sequence(
      cc.fadeOut(0.2),
      nextFun
    )
    GJS.setOn('conn', (data) => {
      // cc.log(data);
      // 连接成功
      if (data.code == '200') {
        if (this.loadingLay.node.active) {
          this.progressBar.progress = 1;
          this.protxt.string = '100%';
        }
        this.progressBar.node.runAction(ac);
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
