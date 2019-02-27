const GJS = require("./global");
const AlertPath = 'Canvas/JS/Alert';
var Alert;

cc.Class({
  extends: cc.Component,

  properties: {
    // idLabel: cc.Label,
    idLabel: cc.EditBox,
    chooseHardLabel: cc.Label,
    nowHard: cc.Label,
    chooseWeaponLabel: cc.Label,
    nowWeapon: cc.Label,
    startLabel: cc.Label,
    placeLabel: cc.Label,
    loadingLay: cc.Layout,
    progressBar: cc.ProgressBar,
    protxt: cc.Label,
    fightIdEditBox: cc.EditBox,
  },


  onLoad() {
    Alert = cc.find(AlertPath).getComponent('Alert');
    this.found = false;
    // default
    this.hard = 'easy';
    this.weapon = 'lipstick';
    this.refreshCompLang();

    // 加入主机房间
    GJS.setOff('ChangeRoom');
    GJS.setOn('ChangeRoom', (json) => {
      var obj = JSON.parse(json)
      console.log(`join room ${obj.roomId}`);
      GJS.socket.emit('ChangeRoom', json);
    })

    // 匹配成功的消息
    GJS.setOff('MatchSuccess');
    GJS.setOn('MatchSuccess', (data) => {
      data = JSON.parse(data);
      // console.log(data);
      this.found = true;
      this.protxt.string = GJS.tips[GJS.lang].matchSuccess;
      // 设置游戏配置
      GJS.setGameConfig(data);
      // 进入游戏主场景
      cc.director.preloadScene('game', () => {
        cc.director.loadScene('game');
      })
    })
  },

  // 加载语言词典
  refreshCompLang() {
    this.idLabel.string = 'ID:' + GJS.sid;
    this.chooseHardLabel.string = GJS.tips[GJS.lang].chooseHardLabel;
    this.nowHard.string = GJS.tips[GJS.lang][this.hard];
    this.chooseWeaponLabel.string = GJS.tips[GJS.lang].chooseWeaponLabel;
    this.nowWeapon.string = GJS.tips[GJS.lang][this.weapon];
    this.startLabel.string = GJS.tips[GJS.lang].startLabel;
    this.placeLabel.string = GJS.tips[GJS.lang].placeLabel;
  },

  setHard(node, hard) {
    this.hard = hard;
    this.refreshCompLang();
  },

  setWeapon(node, weapon) {
    this.weapon = weapon;
    this.refreshCompLang();
  },

  onStartClick() {
    let param = {
      sid: GJS.sid,
      hard: this.hard,
      weapon: this.weapon,
      fightId: this.fightIdEditBox.string == '' ? 0 : this.fightIdEditBox.string,
    }
    // cc.log(param);
    this.showLoading();
    GJS.socket.emit('JoinRoom', JSON.stringify(param));
    // GJS.sendPostRequest(GJS.apiDic['createRoom'], param, (res) => {
    //   // cc.log(res);
    // })
  },

  showLoading() {
    this.loadingLay.node.active = true;
  },

  update(dt) {
    if (this.loadingLay.node.active) {
      let bar = this.progressBar;
      if (this.found) {
        bar.progress = 1;
        return;
      }
      if (bar.progress >= 1) {
        bar.progress = 0;
      } else {
        bar.progress = bar.progress * 1 + 0.005;
      }
      this.protxt.string = GJS.tips[GJS.lang].findPlayer;
    }
  },
});
