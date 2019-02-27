cc.Class({
  extends: cc.Component,

  properties: {
    text: "",
    // 开始按钮
    button: cc.Button,
    startLayer: cc.Node,
    main: cc.Node,
  },

  onLoad() {
    this.startLayer.opacity = 255;
    // 键盘
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
      // cc.log(event);
      // 空格
      if (event.keyCode == 32) {
        this.GotoMain();
      }
    }, this);
  },

  // start() {

  // },

  // 去主界面
  GotoMain() {
    var ac = cc.hide();
    this.startLayer.runAction(ac);
    this.startLayer.active = false;
    var Main = this.main.getComponent("Main");
    Main.initGame(1);
  },

  // update (dt) {},
});
