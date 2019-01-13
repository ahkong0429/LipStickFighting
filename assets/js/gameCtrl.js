const GJS = require("global");
const AlertPath = 'Canvas/JS/Alert';
var Alert;
cc.Class({
  extends: cc.Component,

  properties: {
    mainCanvas: cc.Canvas,
    mainBall: cc.Node,
    touchNode: cc.Node,
    redPlayer: cc.Node,
    bluePlayer: cc.Node,
    redWeapon: cc.Node,
    blueWeapon: cc.Node,
    ballBox: cc.Node,
    weaponBox: cc.Node,
    mainNode: cc.Node,
    shotBg: cc.Node,
    scoreRedLabel: cc.Label,
    scoreBlueLabel: cc.Label,
    redIDLB: cc.Label,
    blueIDLB: cc.Label,
    wpxd: cc.Node,
    wpxdb: cc.Node,
    wpmb: cc.Node,
    wpmbb: cc.Node,
    wpxy: cc.Node,
    wpxyb: cc.Node,
  },

  onLoad() {
    // 公共组件
    Alert = cc.find(AlertPath).getComponent('Alert');

    // 蓝色方旋转视角
    if (GJS.gameConfig.users.indexOf(GJS.uid) == 1) {
      this.mainNode.setRotation(180);
    }

    // 加载武器
    if (GJS.gameConfig.wp_red == 'knife') {
      this.redWeapon = this.wpxd
    }
    if (GJS.gameConfig.wp_red == 'brush') {
      this.redWeapon = this.wpmb
    }
    if (GJS.gameConfig.wp_red == 'righthand') {
      this.redWeapon = this.wpxy
    }
    if (GJS.gameConfig.wp_blue == 'knife') {
      this.blueWeapon = this.wpxdb
    }
    if (GJS.gameConfig.wp_blue == 'brush') {
      this.blueWeapon = this.wpmbb
    }
    if (GJS.gameConfig.wp_blue == 'righthand') {
      this.blueWeapon = this.wpxyb
    }

    // 开启物理引擎
    cc.director.getPhysicsManager().enabled = true;

    // 设置重力
    cc.director.getPhysicsManager().gravity = cc.v2(
      0, -cc.winSize.height * 1.5
    );

    this.loaded = false;

    // 通知服务器我已经加载完毕
    GJS.socket.emit('ClientLoaded', GJS.uid, GJS.gameConfig.roomId);

    this.initGame();
    this.refreshCompLang();
  },

  // 加载语言词典
  refreshCompLang() {
    if (GJS.gameConfig.users.indexOf(GJS.uid) == 1) {//蓝色方
      this.redIDLB.string = "ID:" + GJS.gameConfig.users[1];
      this.blueIDLB.string = "ID:" + GJS.gameConfig.users[0];

    } else {
      this.redIDLB.string = "ID:" + GJS.gameConfig.users[0];
      this.blueIDLB.string = "ID:" + GJS.gameConfig.users[1];
    }
    this.updateTurnText();
  },

  updateTurnText() {
    this.scoreRedLabel.string = this.yourTurn ? GJS.tips[GJS.lang].yourturn : GJS.tips[GJS.lang].waiting;
    // this.scoreBlueLabel.string = this.yourTurn ? 'Waiting' : 'Your Turn';
    this.scoreBlueLabel.string = '';
  },

  // 初始化游戏
  initGame() {
    // cc.log(GJS.gameConfig);
    this.rule = GJS.gameConfig.rule;

    // 当前第几个动作
    this.actIdx = 0;

    // 是否已完成当前局
    this.finished = false;
    this.rScore = 0;
    this.bScore = 0;
    this.fadeNode = false;

    // 轮回制
    this.yourTurn = true;
    this.updateTurnText();

    // 攻击记录
    this.redAttackRecord = this.redAttackRecord || [];
    this.blueAttackRecord = this.blueAttackRecord || [];

    // ID
    if (GJS.gameConfig.users.indexOf(GJS.uid) == 1) {//蓝色方
      this.yourTurn = false;
      this.updateTurnText();
    }

    // 开启旋转
    this.startRotation();
    this.redCloneNodes = [];
    this.blueCloneNodes = [];

    // this.getOneRedPref();
    // this.getOneBluePref();

    GJS.setOn('LeaveRoom', () => {
      console.log(`somebody leave room`);
      if (this.OneMoreTimeStart) return;
      this.OneMoreTimeStart = true;
      this.OneMoreTime();
      // Alert.show(
      //   `Somebody leave room.`,
      //   () => {
      //     cc.director.loadScene('user');
      //   },
      //   () => {
      //     cc.director.loadScene('user');
      //   });
    })
    // 所有人收到广播可以开始了
    GJS.setOn('GameStart', () => {
      this.loaded = true;
      this.startRotation();
      // 默认从红方开始
      this.getWeaponForUse(1);
    })
    // 收到广播的攻击消息
    GJS.setOn('BroadAttack', (data) => {
      var obj = JSON.parse(data);
      this.attack(obj, true);
    })
    // 开始触摸层事件
    this.touchNode.active = true;
    this.attackRedCan = true;
    this.attackBlueCan = true;
    this.bindTouch(this.touchNode);
  },

  getRandomRoad() {
    var r1 = 100 * 1 + 500 * Math.random();
    if (Math.random() > 0.5) {
      r1 = -r1;
    }
    return r1
  },

  getRandomTime() {
    return 3 + 1 * Math.random()
  },

  startRotation() {
    if (!this.loaded) return;
    if (this.finished) return;
    // var actO = this.rule[this.actIdx];
    // cc.log(actO);
    // 一个动作完成后的回调
    var finished = cc.callFunc(function () {
      this.startRotation();
    }, this, null);
    // 生成动作
    var ac = cc.sequence(
      // cc.rotateBy(actO[1], actO[0]),
      cc.rotateBy(this.getRandomTime(), this.getRandomRoad()),
      finished,
    );
    ac.easing(cc.easeCubicActionInOut());
    var hard = GJS.gameConfig.hard == 'easy' ? 1 : (
      GJS.gameConfig.hard == 'normal' ? 2 : (
        GJS.gameConfig.hard == 'hard' ? 3 : 4
      )
    )
    // 根据难度调整速率
    ac = cc.speed(ac, hard);
    // 运行动作
    this.ballBox.runAction(ac);
    // this.actIdx = this.actIdx + 1;
    // if (this.actIdx >= this.rule.length) {
    //   this.actIdx = 0;
    // }
  },

  bindTouch(node) {
    node.on(cc.Node.EventType.TOUCH_END, function (event) {
      if (this.finished) return;
      if (!this.yourTurn) return;
      if (!this.loaded) return;

      // 发送攻击事件请求
      var obj = {
        'token': GJS.token,
        'uid': GJS.uid,
        'type': 'attack',
        'users': GJS.gameConfig.users
      };

      // 本机发动攻击
      this.attack(obj);

      event.stopPropagation()
    }.bind(this))
  },

  attack(param, armer) {
    if (param.users.indexOf(param.uid) == 0) {
      this.redAttackRecord.push(param)
    }
    if (param.users.indexOf(param.uid) == 1) {
      this.blueAttackRecord.push(param)
    }

    // cc.log(param);
    if (param.users.indexOf(param.uid) == 0) {
      //redUser attack
      this.redUserAttack(armer, param)
    }
    if (param.users.indexOf(param.uid) == 1) {
      //blueUser attack
      this.blueUserAttack(armer, param)
    }
  },

  redUserAttack(isArmer, param) {
    if (!this.attackRedCan) return;
    if (this.finished) return;
    this.attackRedCan = false;
    var node = this.redCloneNodes[this.redCloneNodes.length - 1];
    // cc.log(node.x, node.y)
    // 创建动作
    var dis = cc.winSize.height / 2 - this.mainBall.height / 2 - 20 - node.height / 2;
    // cc.log(dis);
    var dtime = 0.06;
    var ac = cc.moveBy(dtime, 0, dis);
    var finished = cc.callFunc(function () {
      // cc.log(node.x, node.y)
      node.parent = this.weaponBox;
      node.y = 0;

      node.setRotation(isArmer ? (param.rot) : (0 - this.ballBox.rotation));

      // 同时上传本次攻击的记录
      if (!isArmer) {
        let temp = this.redAttackRecord[this.redAttackRecord.length - 1];
        temp.rot = 0 - this.ballBox.rotation;
        GJS.socket.emit('SendAttack', GJS.gameConfig.roomId, GJS.uid, JSON.stringify(temp));
        this.yourTurn = false;
      }
      if (isArmer) {
        this.playFadeAnimBot(node);
        this.yourTurn = true;
      }
      this.updateTurnText();
      // 轮到蓝方
      this.getWeaponForUse(2);

      // 插入瓜内百分比
      var cjq = node.height * 0.1;
      // 计算本身anchor比例
      var bl = (this.mainBall.height / 2 + (node.height - cjq)) / node.height;
      node.setAnchorPoint(0.5, bl);
      // 重置碰撞体偏移
      node.getComponent(cc.PolygonCollider).offset = cc.v2(0, -(node.height * (bl - 0.5)));
      this.playShakeAnimate();
      // 计算得分
      this.rScore = this.redAttackRecord.length;
      // 获取下一个备用
      // setTimeout(() => {
      //   this.refreshCompLang();
      //   this.getOneRedPref();
      //   this.attackRedCan = true;
      // }, 1000 * dtime * 2)
    }.bind(this))
    // 来自服务端的攻击不模拟轨迹了，防止意外碰撞
    if (isArmer) {
      node.runAction(
        finished
      );
    } else {
      node.runAction(
        cc.sequence(
          ac, finished
        )
      );
    }
  },

  getWeaponForUse(isRed) {
    this.refreshCompLang();
    if (isRed == 1) {
      this.getOneRedPref();
      this.attackRedCan = true;
    } else {
      this.getOneBluePref();
      this.attackBlueCan = true;
    }
  },

  blueUserAttack(isArmer, param) {
    if (!this.attackBlueCan) return;
    if (this.finished) return;
    this.attackBlueCan = false;
    var node = this.blueCloneNodes[this.blueCloneNodes.length - 1];

    // 创建动作
    var dis = cc.winSize.height / 2 - this.mainBall.height / 2 - 20 - node.height / 2;
    var dtime = 0.06;
    var ac = cc.moveBy(dtime, 0, -dis);
    var finished = cc.callFunc(() => {
      node.parent = this.weaponBox;
      node.y = 0;

      node.setRotation(isArmer ? (param.rot) : (0 - this.ballBox.rotation));

      // 同时上传本次攻击的记录
      if (!isArmer) {
        let temp = this.blueAttackRecord[this.blueAttackRecord.length - 1];
        temp.rot = 0 - this.ballBox.rotation;
        GJS.socket.emit('SendAttack', GJS.gameConfig.roomId, GJS.uid, JSON.stringify(temp));
        this.yourTurn = false;
      }
      if (isArmer) {
        this.playFadeAnimBot(node);
        this.yourTurn = true;
      }
      this.updateTurnText();
      // 轮到红方
      this.getWeaponForUse(1);

      // 插入瓜内百分比
      var cjq = node.height * 0.1;
      // 计算本身anchor比例
      var bl = (this.mainBall.height / 2 + (node.height - cjq)) / node.height;
      // console.log(bl);
      node.setAnchorPoint(0.5, 1 - bl);
      // 重置碰撞体偏移
      node.getComponent(cc.PolygonCollider).offset = cc.v2(0, (node.height * (bl - 0.5)));
      this.playShakeAnimateB();
      // 计算得分
      this.bScore = this.blueAttackRecord.length;
      // 获取下一个备用
      // setTimeout(() => {
      //   this.refreshCompLang();
      //   this.getOneBluePref();
      //   this.attackBlueCan = true;
      // }, 1000 * dtime)
    })
    // 来自服务端的攻击不模拟轨迹了，防止意外碰撞
    if (isArmer) {
      node.runAction(
        finished
      );
    } else {
      node.runAction(
        cc.sequence(
          ac, finished
        )
      );
    }
  },

  getOneRedPref() {
    let node = cc.instantiate(this.redWeapon);
    node.active = true;
    node.parent = this.redPlayer;
    this.redCloneNodes.push(node);
  },

  getOneBluePref() {
    let node = cc.instantiate(this.blueWeapon);
    node.active = true;
    node.parent = this.bluePlayer;
    this.blueCloneNodes.push(node);
  },

  setGameEnd(collid) {
    if (this.finished) return;
    // 停止旋转
    this.ballBox.stopAllActions();
    this.playFadeAnim(collid);

    // this.rScore = this.redAttackRecord.length;
    // this.bScore = this.blueAttackRecord.length;
    // cc.log(this.rScore, this.bScore);

    var player = 0
    if (collid.tag == 2) {
      var player = 0
    } else {
      var player = 1
      // this.rScore = this.rScore - 2
    }
    // cc.log(this.rScore, this.bScore);

    this.finished = true;
    // cc.log(isFromWS);
    // cc.log(this.rScore, this.bScore);
    this.refreshCompLang();

    GJS.socket.emit('GameEnd', GJS.roomId)
    Alert.show(
      GJS.tips[GJS.lang].winner.replace('$uid', GJS.gameConfig.users[player]),
      () => {
        // cc.director.loadScene('user');
        if (this.OneMoreTimeStart) return;
        this.OneMoreTimeStart = true;
        this.OneMoreTime();
      },
      () => {
        // cc.director.loadScene('user');
        if (this.OneMoreTimeStart) return;
        this.OneMoreTimeStart = true;
        this.OneMoreTime();
      });
  },

  OneMoreTime() {
    GJS.sendPostRequest(GJS.apiDic['registTraveler'], { time: new Date().getTime(), lang: GJS.lang }, (res) => {
      if (res.code == '100') {
        GJS.setToken(res.data.token);
        GJS.setID(res.data.username);
        GJS.connSocket();
        GJS.setOn('conn', (data) => {
          // cc.log(data);
          // 连接成功
          if (data.code == '200') {
            GJS.socket.emit('TokenVerify', GJS.token, GJS.uid, (rs) => {
              // cc.log(rs)
              if (rs.code == '300') {
                // token验证通过
                cc.director.loadScene('user');
              }
            });
          }
        })
      }
    })
  },

  // 震动动画
  playShakeAnimate() {
    var anim = this.ballBox.getComponent(cc.Animation);
    anim.play('shake');
  },
  playShakeAnimateB() {
    var anim = this.ballBox.getComponent(cc.Animation);
    anim.play('shake-b');
  },

  // 闪烁
  playFadeAnim(collid) {
    if (this.fadeNode) {
      this.fadeNode.stopAllActions();
    }
    // cc.log(collid);
    var node = collid.node;
    var ac = cc.repeatForever(
      cc.sequence(
        cc.fadeOut(0.5),
        cc.fadeIn(0.5)
      )
    )
    node.runAction(ac);
    this.fadeNode = node;
  },

  playFadeAnimBot(node) {
    if (this.fadeNode) {
      this.fadeNode.stopAllActions();
      this.fadeNode.opacity = 255;
    }
    var ac = cc.repeatForever(
      cc.sequence(
        cc.fadeOut(0.2),
        cc.fadeIn(0.2)
      )
    )
    node.runAction(ac);
    this.fadeNode = node;
  },

  // update (dt) {},
});
