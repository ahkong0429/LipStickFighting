
cc.Class({
  extends: cc.Component,

  properties: {
    gameCtrlNode: cc.Node,
  },


  onLoad() {
    // 开启碰撞检测
    var manager = cc.director.getCollisionManager();
    manager.enabled = true;
    // 碰撞检测系统的debug绘制
    // manager.enabledDebugDraw = true;
    // 碰撞组件的包围盒
    // manager.enabledDrawBoundingBox = true;
    // cc.log(manager);
  },

  // 当碰撞产生的时候调用
  onCollisionEnter(otherCollider, selfCollider) {
    // cc.log('onCollisionEnter');
    // cc.log(otherCollider, selfCollider)
    // cc.log(this.main.getComponent("Main"));
    var gameCtrl = this.gameCtrlNode.getComponent("gameCtrl");
    // if (selfCollider.tag == 2) {
    //   gameCtrl.setGameEnd(selfCollider.tag); return;
    // }
    gameCtrl.setGameEnd(selfCollider);
  },

  onCollisionExit(otherCollider, selfCollider) {
    // cc.log(otherCollider, selfCollider)
  },

  // start () {

  // },

  // update (dt) {},
});
