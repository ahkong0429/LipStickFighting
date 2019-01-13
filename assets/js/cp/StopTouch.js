

cc.Class({
  extends: cc.Component,

  properties: {
    
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    // 防止穿透
    this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
      event.stopPropagation()
    })
  },

  start() {

  },

  // update (dt) {},
});
