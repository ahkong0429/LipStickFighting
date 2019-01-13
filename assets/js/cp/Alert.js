const GJS = require("global");
cc.Class({
  extends: cc.Component,

  properties: {
    pref: cc.Prefab
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {

  },

  start() {

  },

  show(text, okFun, cancelFun) {
    var node = cc.instantiate(this.pref);
    node.active = true;
    // 防止穿透
    node.on(cc.Node.EventType.TOUCH_START, function (event) {
      event.stopPropagation()
    })

    if (this.cloneNode) {
      this.cloneNode.destroy();
      this.cloneNode = false;
    }
    this.cloneNode = node;
    cc.find('Canvas').addChild(node);

    // 文本
    // cc.log(this.cloneNode)
    var textnode = this.cloneNode.getChildByName("Alert-text");
    // cc.log(textnode)
    var label = textnode.getComponent(cc.Label);
    // cc.log(label)
    label.string = text;

    // 按钮事件
    var btns = this.cloneNode.getChildByName("btns");
    var okbtn = btns.getChildByName("ok");
    var cancelbtn = btns.getChildByName("cancel");
    // cc.log(GJS.tips[GJS.lang].okLabel);
    if (GJS.tips[GJS.lang].okLabel) {
      okbtn.getChildByName('Label').getComponent(cc.Label).string = GJS.tips[GJS.lang].okLabel
      cancelbtn.getChildByName('Label').getComponent(cc.Label).string = GJS.tips[GJS.lang].cancelLabel
    }
    // cc.log(btns);
    // cc.log(okbtn);

    okbtn.on(cc.Node.EventType.TOUCH_END, function (event) {
      if (okFun) okFun()
      this.cloneNode.destroy();
      this.cloneNode = false;
    }.bind(this))

    cancelbtn.on(cc.Node.EventType.TOUCH_END, function (event) {
      if (cancelFun) cancelFun()
      this.cloneNode.destroy();
      this.cloneNode = false;
    }.bind(this))
  },

  // update (dt) {},
});
