cc.Class({
  extends: cc.Component,

  properties: {
    main: cc.Node,
  },

  onLoad() {

    // 开启碰撞检测
    var manager = cc.director.getCollisionManager();
    manager.enabled = true;
    // 碰撞检测系统的debug绘制
    // manager.enabledDebugDraw = true;
    // 碰撞组件的包围盒
    // manager.enabledDrawBoundingBox = true;
  },


  // 当碰撞产生的时候调用
  onCollisionEnter(other, self) {
    // cc.log('onCollisionEnter');
    // cc.log(self);
    // cc.log(this.main.getComponent("Main"));
    var MainJs = this.main.getComponent("Main");
    MainJs.loseGame();
  },

  // 当碰撞产生后，碰撞结束前的情况下，每次计算碰撞结果后调用
  // onCollisionStay(other, self) {
  //   cc.log('onCollisionStay');
  //   cc.log(self);
  // },

  // 当碰撞结束后调用
  // onCollisionExit(other, self) {
  //   cc.log('onCollisionExit');
  //   cc.log(self);
  // },

  // start() {

  // },

  // update (dt) {},
});
