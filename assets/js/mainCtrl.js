const GJS = require("./global");
const AlertPath = 'Canvas/JS/Alert';
var Alert;

cc.Class({
  extends: cc.Component,

  properties: {
    player_pref: cc.Prefab,
    main:cc.Node,
  },


  onLoad() {
    Alert = cc.find(AlertPath).getComponent('Alert');
    this.init();
    // this.refreshCompLang();
  },

  // 加载语言词典
  // refreshCompLang() {
  // },

  init() {
    let param = {
      sid: GJS.sid
    }
    GJS.socket.emit('JoinRoom', JSON.stringify(param), (player) => {
      console.log(`${GJS.sid}进入游戏`);
      console.log(player);
      var playerNode = cc.instantiate(this[player.type]);
      this.main.addChild(playerNode);
    });
  },

  // update(dt) {

  // },
});
