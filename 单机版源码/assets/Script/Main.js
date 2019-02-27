const _ = require('lodash');
const NodeUuid = require('node-uuid');
cc.Class({
  extends: cc.Component,

  properties: {
    // 西瓜
    watermelon: cc.Sprite,
    // 西瓜容器
    watermelonbox: {
      type: cc.Node,
      default: null,
    },
    // 倒计时秒数
    timeLabel: cc.Label,
    // 游戏失败的层
    loseNode: {
      type: cc.Node,
      default: null,
    },
    // 重新开始按钮
    restartBtn: cc.Button,
    continueBtn: cc.Button,
    copyBtn: cc.Button,
    // 弹层文字
    tipsText: cc.Label,
    // 触摸层
    touchLayer: cc.Node,
    // 第几关
    gateText: cc.Label,
    // 口红
    lipstick: cc.Sprite,
    stickbox: cc.Node,
    // 口红容器
    tempBox: cc.Node,
    // 待用口红容器
    waitbox: cc.Node,
    // 待用口红
    waitLipStick: cc.Sprite,
    // 积分
    scoreText: cc.Label,
    // 西瓜下方溅射
    pfSpeacil: cc.ParticleSystem,
    // 碰撞体
    pyCornBody: cc.PolygonCollider,
    // 西柚
    xiyou: cc.SpriteFrame,
    xiyouL: cc.SpriteFrame,
    xiyouR: cc.SpriteFrame,
    // 橙子
    orange: cc.SpriteFrame,
    orangeL: cc.SpriteFrame,
    orangeR: cc.SpriteFrame,
    // 山竹
    shanzhu: cc.SpriteFrame,
    shanzhuL: cc.SpriteFrame,
    shanzhuR: cc.SpriteFrame,
    // 石榴
    shiliu: cc.SpriteFrame,
    shiliuL: cc.SpriteFrame,
    shiliuR: cc.SpriteFrame,
    // 猕猴桃
    mihoutao: cc.SpriteFrame,
    mihoutaoL: cc.SpriteFrame,
    mihoutaoR: cc.SpriteFrame,
    // 西瓜
    xigua: cc.SpriteFrame,

    // 分尸两半的刚体组件
    fruitLeft: cc.RigidBody,
    fruitRight: cc.RigidBody,
    // 分尸精灵
    fruitLS: cc.Sprite,
    fruitRS: cc.Sprite,


    model: "online",//测试模式debug 线上online
    // 获取配置的接口地址
    apiUrl: "http://lvv.fun:9999/getConfig",
    apiUrl2: "http://lvv.fun:9999/msgadd",
    // 从接口读取的配置
    gameConfig: null,
    // 本地缓存的配置
    TTmemory: null,
  },

  onLoad() {
    // 生成uuid
    this.uuidByNode = NodeUuid.v4();
    if (this.model == "debug") {
      // 使用测试数据
      this.demo();
    } else {
      // 使用接口数据
      this.getConfigByApi();
    }

    // 开启物理引擎
    cc.director.getPhysicsManager().enabled = true;
    // 1.5倍重力
    cc.director.getPhysicsManager().gravity = cc.v2(
      0, -cc.winSize.height * 1.5
    );

    // this.initGame(1);
    // this.initGame();
  },

  // 使用测试数据
  demo() {
    this.gameConfig = {
      "version": 1.54,
      "userId": "test",//用户id
      "score": 1000,//积分
      "now": 0,//当前关卡
      "gates": [
        {
          "level": 1,//第几关
          "num": 7,//插几个过关
          "hard": 1,//难度1-5，5最难
          "time": 30,//总共有多少时间，秒
          "win": 0,//过关获得积分
          "lose": 0,//失败扣除积分
          "cntinuNeed": 0//继续当前关需要的积分
        },
        {
          "level": 2,//第几关
          "num": 10,//插几个过关
          "hard": 2,//难度1-5，5最难
          "time": 25,//总共有多少时间，秒
          "win": 0,//过关获得积分
          "lose": 0,//失败扣除积分
          "cntinuNeed": 5//继续当前关需要的积分
        },
        {
          "level": 3,//第几关
          "num": 12,//插几个过关
          "hard": 3,//难度1-5，5最难
          "time": 20,//总共有多少时间，秒
          "win": 500,//过关获得积分
          "lose": 0,//失败扣除积分
          "cntinuNeed": 10//继续当前关需要的积分
        },
      ]
    }

    // var _newGates = [];
    // for (var i = 1; i <= 15; i++) {
    //   var g = {
    //     "level": i - 5,//第几关
    //     "num": i,//插几个过关
    //     "hard": 1 + i / 3,//难度1-5，5最难
    //     "time": 30 - Math.round((i / 5) * 2),//总共有多少时间，秒
    //     "win": (i % 5) == 0 ? ((i / 5) >= 2 ? (i / 5) * 500 : 0) : 0,//过关获得积分
    //     "lose": 0//失败扣除积分
    //   }
    //   _newGates.push(g);
    // }
    // // 去掉前5关，太简单
    // _newGates = _.drop(_newGates, 5);
    // this.gameConfig.gates = _newGates;
  },

  // 访问网络接口获取配置
  getConfigByApi() {
    var $this = this;
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open("POST", this.apiUrl, false);
    // 设置请求头
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    // 回调
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
        var httpStatus = xhr.statusText;
        var response = xhr.responseText;
        // var response = xhr.responseText.substring(0, 100) + "...";
        // cc.log(httpStatus, response);
        if (httpStatus == "OK") {
          response = JSON.parse(response);
          if (response.status == 200) {
            $this.gameConfig = response.result;
            // cc.log($this.gameConfig);
          }
        }
      }
    };
    // 发送请求
    xhr.send(JSON.stringify({ uuidByNode: $this.uuidByNode }));
  },

  // 提交过关积分
  submitGateScore() {
    var User = this.TTmemory[this.gameConfig.userId];
    var $this = this;
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open("POST", this.apiUrl2, true);
    // 设置请求头
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    // 回调
    // xhr.onreadystatechange = function () {
    //   if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
    //     var httpStatus = xhr.statusText;
    //     var response = xhr.responseText;
    //     var response = xhr.responseText.substring(0, 100) + "...";

    //   }
    // };
    // 发送请求
    xhr.send(JSON.stringify({ uuid: $this.uuidByNode, score: User.score }));
  },

  // 读取本地缓存配置
  getGameConfig() {
    // 匹配本地缓存
    // var json = cc.sys.localStorage.getItem("TTGame");
    // // cc.log(json);
    // // 载入存档
    // if (json) {
    //   this.TTmemory = JSON.parse(json);
    //   // 新玩家
    //   if (!this.TTmemory[this.gameConfig.userId]) {
    //     this.TTmemory[this.gameConfig.userId] = this.gameConfig;
    //   }
    //   // 配置版本不同的话，覆盖游戏相关配置
    //   if (this.TTmemory[this.gameConfig.userId].version < this.gameConfig.version) {
    //     this.TTmemory[this.gameConfig.userId].gates = this.gameConfig.gates;
    //     this.TTmemory[this.gameConfig.userId].version = this.gameConfig.version;
    //   }
    // } else {
    //   // 新存档
    //   this.TTmemory = {};
    //   this.TTmemory[this.gameConfig.userId] = this.gameConfig;
    //   this.setGameConfig();
    // }

    if (!this.TTmemory) {
      // 新存档
      this.TTmemory = {};
      // cc.log(this.gameConfig);
      this.TTmemory[this.gameConfig.userId] = this.gameConfig;
    }

    // this.setGameConfig();

    // 覆盖sessionId
    if (this.gameConfig.sessionId) {
      this.TTmemory[this.gameConfig.userId].sessionId = this.gameConfig.sessionId;
      this.setGameConfig();
    }
  },

  // 保存本地缓存配置
  setGameConfig() {
    // cc.sys.localStorage.setItem("TTGame", JSON.stringify(this.TTmemory));
    this.gameConfig = this.TTmemory[this.gameConfig.userId];
  },

  // 计时器
  openInterval() {
    this.unscheduleAllCallbacks();
    var User = this.TTmemory[this.gameConfig.userId];
    var gate = User.gates[User.now];
    var $this = this;
    this.timeNum = gate.time;
    // 开启倒计时
    this.callback = function () {
      $this.timeNum = $this.timeNum - 1;
      // cc.log($this.timeNum);
      if ($this.lose) {
        this.unschedule(this.callback, 1);
        return;
      }
      if ($this.winner) {
        this.unschedule(this.callback, 1);
        return;
      }
      if ($this.timeNum <= 0) {
        $this.loseGame(1);
        this.unschedule(this.callback, 1);
        $this.timeLabel.string = $this.timeNum + "s";
        return;
      }
      $this.timeLabel.string = $this.timeNum + "s";
    };
    this.schedule(this.callback, 1);
  },

  // 初始化游戏
  initGame(init) {
    // 零重力
    // cc.director.getPhysicsManager().gravity = cc.v2();
    this.hideFruitsBodies();

    // 读取配置
    this.getGameConfig();

    // 初始化游戏
    var User = this.TTmemory[this.gameConfig.userId];
    User.now = init ? 0 : User.now;
    this.hideNode(this.loseNode);
    this.hideNode(this.copyBtn.node);


    // var User = this.TTmemory[this.gameConfig.userId];
    var gate = User.gates[User.now];
    // cc.log(this.TTmemory);
    // cc.log(gate);
    if (!gate) {
      this.tipsText.string = "你已全部通关";
      this.showNode(this.loseNode)
      this.winner = true;
      return;
    }

    if (User.score < gate.lose) {
      this.tipsText.string = "积分不足";
      this.showNode(this.loseNode);
      this.winner = true;
      this.hideNode(this.restartBtn.node);
      this.hideNode(this.continueBtn.node);
      return;
    }

    // 随机水果背景图
    this.getAllGateBgs();
    this.watermelon.spriteFrame = this.gateBG[0];

    // 初始化关卡属性
    this.gateText.string = "第" + (gate.level) + "关";
    // 是否失败
    this.lose = false;
    // 倒计时文字
    this.timeLabel.string = gate.time + "s";
    // 积分 
    this.scoreText.string = User.score;
    // 防止连续点击
    this.stopTouch = true;
    // 胜利标志
    this.winner = false;
    // 隐藏重启按钮防止重复点击
    this.hideNode(this.restartBtn.node);
    this.hideNode(this.continueBtn.node);
    // 开启计时器
    this.openInterval();

    // 开启旋转
    this.startRotation();
    // this.startRotation(-450);

    // 清除临时节点
    this.clearTempBoxNodes();

    // 设置初始口红位置
    this.setWaitLipSticksPos();
    // this.setShotLipSticksPos();

    // 剩余口红数目
    this.haveLipStickNum = gate.num;
    this.waitLipStick.node.opacity = 0;
    for (var i = 0; i < gate.num; i++) {
      this.cloneBkpLipStick()
    }
    // 排列克隆备用口红的位置到右下角
    this.reSetClonesPos();

    // 设置模板口红起始坐标，然后隐藏
    this.resetLipStick(this.lipstick.node);
    this.lipstick.node.opacity = 0;
    this.lipstick.node.active = false;

    // 克隆模板出来准备发射
    var newnode = this.cloneLipStick();
    this.resetLipStick(newnode);
    this.setPhyCornBodyOffset(newnode);
    newnode.opacity = 255;

    // 重置已经插上去的角度数组
    this.shottedArr = [];

    // 开始触摸层事件
    this.showNode(this.touchLayer);
    this.stopTouch = false;
  },

  // 输掉游戏
  loseGame(isTimeOver) {
    if (this.winner) return;
    this.hideNode(this.touchLayer);
    this.unscheduleAllCallbacks();
    var User = this.TTmemory[this.gameConfig.userId];
    var gate = User.gates[User.now];
    this.lose = true;
    // 扣分
    User.score = User.score - gate.lose;
    User.score = User.score < 0 ? 0 : User.score;
    this.playLoseLayer();
    // 存档
    this.setGameConfig();
    this.refreshScore();
    if (isTimeOver) {
      // cc.log('isTimeOver');
    } else {
      this.playLoseAnim();
    }
  },

  winGame() {
    this.hideNode(this.touchLayer);
    this.unscheduleAllCallbacks();
    var User = this.TTmemory[this.gameConfig.userId];
    var gate = User.gates[User.now];
    // cc.log("pass");
    this.winner = true;
    // 加分
    User.score = User.score + gate.win;
    // 存档
    this.setGameConfig();
    this.refreshScore();
    this.playWinner();
  },

  // 播放失败动画
  playLoseLayer() {
    // 停止旋转
    this.watermelonbox.stopAllActions();
    if (this.lose) {
      this.tipsText.string = "GAME OVER";
    }
    this.showNode(this.loseNode);
    this.showNode(this.restartBtn.node);
    this.showNode(this.continueBtn.node);
  },

  // 播放最后一个口红掉落的动画
  playLoseAnim() {
    // 最后一个口红
    var node = this.lipStickArr[this.lipStickArr.length - 1];
    // cc.log(node);
    // cc.log(this.dit);
    // cc.director.getPhysicsManager().gravity = cc.v2(
    //   (this.dit > 0 ? -cc.winSize.width : cc.winSize.width), -cc.winSize.height * 3
    // );

    // 添加刚体碰撞组件
    var rigidbody = node.addComponent(cc.RigidBody);
    // 加强重力
    // rigidbody.gravityScale = 3;
    // rigidbody.gravity = cc.v2(
    //   (this.dit > 0 ? -cc.winSize.width : cc.winSize.width), -cc.winSize.height
    // );
    // 角速度
    rigidbody.angularVelocity = (this.dit > 0 ? -45 : 45);
    // 角速度阻力系数
    rigidbody.angularDamping = 0.8;
    // 线性速度
    rigidbody.linearVelocity = cc.v2(
      (this.dit > 0 ? -cc.winSize.width / 4 : cc.winSize.width / 4), -cc.winSize.height / 1.0
    );
    // 线性速度阻力系数
    rigidbody.linearDamping = -0.7;
    // cc.log(rigidbody);
  },

  // 胜利过关
  playWinner() {
    var User = this.TTmemory[this.gameConfig.userId];
    // var gate = User.gates[User.now];
    User.now = User.now * 1 + 1;
    // 停止旋转
    this.watermelonbox.stopAllActions();
    this.showNode(this.loseNode);
    this.hideNode(this.restartBtn.node);
    this.hideNode(this.continueBtn.node);
    // 过关动画，水果分尸，口红掉落
    this.showFruitsBodies();
    if (User.gates[User.now]) {
      this.tipsText.string = "恭喜进入下一关";
    } else {
      this.tipsText.string = "恭喜你全部通关！！！\r\n" + "凭下面的序列号领取礼物\r\n" + this.gameConfig.userId;
      this.tipsText.node.width = cc.winSize.width - 50;
      this.tipsText.node.height = 150;
      this.showNode(this.copyBtn.node);
      // 提交积分
      this.submitGateScore();
      return;
    }
    // 启动下一关
    setTimeout(function () {
      this.hideNode(this.loseNode);
      this.initGame();
    }.bind(this), 2000);
  },

  // 随机进行正逆时针的傻逼式自我放飞旋转
  startRotation() {
    if (this.lose) return;
    if (this.winner) return;
    var User = this.TTmemory[this.gameConfig.userId];
    var gate = User.gates[User.now];

    // 生成路径
    function getRandomRoad() {
      var r1 = 100 * 1 + 500 * Math.random();
      if (Math.random() > 0.5) {
        r1 = -r1;
      }
      return r1
    }
    var g1 = getRandomRoad();
    // 一个动作完成后的回调
    var finished = cc.callFunc(function () {
      this.startRotation();
    }, this, null);
    // 当前方向
    this.dit = g1;
    // 生成动作
    var ac = cc.sequence(
      cc.rotateBy(3 + 1 * Math.random(), g1),
      finished,
    );
    ac.easing(cc.easeCubicActionInOut());
    // var ra = 3 * Math.random();
    // if (ra < 2) {
    //   ac.easing(cc.easeExponentialOut());
    // }
    // if (ra < 1) {
    //   ac.easing(cc.easeExponentialIn());
    // }
    // 根据难度调整速率
    ac = cc.speed(ac, gate.hard);
    // 运行动作
    this.watermelonbox.runAction(ac);
  },

  // 主界面发射事件
  onTouchClick() {
    if (this.lose) {
      return;
    }
    // biu ~ biu ~ biu ~
    // 播放发射动画
    // cc.log(this.watermelonbox.rotation);
    this.playLipStickShot();
  },

  resetLipStick(lipstickNode) {
    var winsize = cc.winSize;
    // 获取西瓜中心坐标
    // var wmy = this.watermelon.node.y;
    // 西瓜半径
    var bj = this.watermelon.node.width / 2;
    // 插入的口红长度
    var len = 15;
    var anh = parseFloat((bj - len) / lipstickNode.height) * 1 + 1;
    // lipstickNode.setAnchorPoint(cc.v2(0.5, anh));
    lipstickNode.setAnchorPoint(0.5, anh);
    lipstickNode.y = -(winsize.height / 2 - lipstickNode.height - lipstickNode.height / 3) + anh * lipstickNode.height - lipstickNode.height;
  },

  // 口红发射的动画
  playLipStickShot() {
    if (this.stopTouch) return;
    if (this.winner) return;
    if (this.lose) return;
    if (!this.lipStickArr) return;

    // 口红节点
    var lipClone = this.lipStickArr[this.lipStickArr.length - 1];
    // this.tempBox.addChild(lipClone, this.lipStickArr.length);
    // 获取西瓜中心坐标
    var wmy = this.watermelonbox.y;
    // 创建动作
    var ac = cc.moveTo(0.05, cc.v2(lipClone.x, wmy));
    // 完成动画后才记录角度
    var finished = cc.callFunc(function () {
      lipClone.parent = this.tempBox;
      lipClone.y = 0;
      var rot = this.watermelonbox.rotation;
      this.shottedArr.push(rot);
      // 修改属性
      // cc.log(rot);
      lipClone.setRotation(0 - rot);
      // lipClone.setAnchorPoint(0.5, 2);
      // 震动一下
      this.playShakeAnimate();
      // 粒子特效
      this.createSpecial();

      // 插上去是否和之前的重叠
      // if (this.checkANH()) {
      //   // 失败
      //   this.loseGame();
      //   return;
      // }

      // 下一个口红准备
      this.stopTouch = true;
      setTimeout(function () {
        this.haveLipStickNum = this.haveLipStickNum - 1;
        if (!this.lose && this.haveLipStickNum == 0) {
          // 胜利
          this.winGame();
          this.stopTouch = false;
          return;
        }
        if (!this.lose) {
          var newnode = this.cloneLipStick();
          this.resetLipStick(newnode);
          this.setPhyCornBodyOffset(newnode);
        }
        this.stopTouch = false;
      }.bind(this), 66);

    }, this, null);
    // 发射
    lipClone.runAction(cc.sequence(
      ac, finished
    ));
  },

  // 克隆新的口红
  cloneLipStick() {
    var newnode = cc.instantiate(this.lipstick.node);
    this.lipStickArr.push(newnode);
    this.stickbox.addChild(newnode, this.lipStickArr.length);
    // newnode.parent = this.stickbox;
    newnode.opacity = 255;
    newnode.active = true;
    // 扣除一个备用
    // cc.log(this.waitLipStickArr, this.haveLipStickNum - 1);
    this.waitLipStickArr[this.haveLipStickNum - 1].opacity = 0;
    return newnode;
  },

  // 克隆备用口红
  cloneBkpLipStick() {
    var newnode = cc.instantiate(this.waitLipStick.node);
    newnode.opacity = 255;
    this.waitLipStickArr.push(newnode);
    this.waitbox.addChild(newnode, this.waitLipStickArr.length);
    return newnode;
  },

  // 排列备用口红的位置
  reSetClonesPos() {
    // cc.log(this.waitLipStickArr);
    _.forEach(this.waitLipStickArr, (node, key) => {
      node.y = node.y + 20 * (0 + key);
    })
  },

  // 检查是否重叠碰撞
  checkANH() {
    // 碰撞测试
    return;
  },

  // 积分继续
  onContinueBtnClick() {
    var $this = this;
    if (this.stopTouch) return;
    var User = this.TTmemory[this.gameConfig.userId];
    this.hideNode(this.loseNode);

    // 清除下落
    if (this.lipStickArr && this.lipStickArr.length > 0) {
      _.forEach(this.lipStickArr, function (node) {
        node.active = false;
        $this.hideNode(node);
      })
    }

    // 扣分
    if (User.score >= 10) {
      User.score = User.score - User.gates[User.now].cntinuNeed * 1;
      this.initGame();
    }
  },

  // 重新开始
  onRestartBtnClick() {
    var $this = this;
    if (this.stopTouch) return;
    var User = this.TTmemory[this.gameConfig.userId];
    this.hideNode(this.loseNode);

    // 清除下落
    if (this.lipStickArr && this.lipStickArr.length > 0) {
      _.forEach(this.lipStickArr, function (node) {
        node.active = false;
        $this.hideNode(node);
      })
    }

    if (this.model == "debug") {
      // 停留在当前关
      User.now = 0;
      this.initGame();
    } else {
      User.now = 0;
      this.initGame(1);
    }
  },

  // 清除临时节点
  clearTempBoxNodes() {
    // cc.log(this.lipStickArr);
    if (this.lipStickArr && this.lipStickArr.length > 0) {
      _.forEach(this.lipStickArr, (node) => {
        node.removeFromParent();
      })
    }
    if (this.waitLipStickArr && this.waitLipStickArr.length > 0) {
      _.forEach(this.waitLipStickArr, (node) => {
        node.removeFromParent();
      })
    }
    this.waitLipStickArr = [];
    this.lipStickArr = [];
  },

  // 隐藏节点
  hideNode(node) {
    var ac = cc.hide();
    node.runAction(ac);
    node.active = false;
  },

  // 显示节点
  showNode(node) {
    node.active = true;
    var ac = cc.show();
    node.runAction(ac);
  },

  // 刷新积分显示
  refreshScore() {
    var User = this.TTmemory[this.gameConfig.userId];
    this.scoreText.string = User.score;
  },

  // 震动动画
  playShakeAnimate() {
    // cc.log(this.animNode.getComponent(cc.Animation));
    var anim = this.watermelonbox.getComponent(cc.Animation);
    // cc.log(anim);
    anim.play('shake');
  },

  // 粒子特效
  createSpecial() {
    // 设置粒子属性
    // 生存时间
    this.pfSpeacil.resetSystem();
  },

  // 发射口红的位置
  setShotLipSticksPos() {
    var win = cc.winSize;
    this.lipstick.node.x = 0;
    this.lipstick.node.y = -(win.height / 2 - this.lipstick.node.height / 1);
  },

  // 备用口红的位置
  setWaitLipSticksPos() {
    var win = cc.winSize;
    this.waitLipStick.node.x = win.width / 2 - this.waitLipStick.node.width / 2;
    this.waitLipStick.node.y = -(win.height / 2 - this.waitLipStick.node.width / 2);
  },

  // 同步碰撞体偏移
  setPhyCornBodyOffset(node) {
    // cc.log(node.getComponent(cc.PolygonCollider));
    var polygon = node.getComponent(cc.PolygonCollider);
    // this.pyCornBody.offset.y = this.lipstick.node.y;
    polygon.offset.y = this.lipstick.node.y + 15;
  },

  // 水果背景图
  getAllGateBgs() {
    // , this.xigua
    var arr = [
      { a: this.orange, b: this.orangeL, c: this.orangeR },
      { a: this.xiyou, b: this.xiyouL, c: this.xiyouR },
      { a: this.shanzhu, b: this.shanzhuL, c: this.shanzhuR },
      { a: this.mihoutao, b: this.mihoutaoL, c: this.mihoutaoR },
      // { a: this.shiliu, b: this.shiliuL, c: this.shiliuR },
    ];
    var r = Math.round((arr.length - 1) * Math.random());
    this.gateBG = [arr[r].a, arr[r].b, arr[r].c];
  },

  // 分尸隐藏
  hideFruitsBodies() {
    if (this.tempL) {
      this.hideNode(this.tempL)
      this.hideNode(this.tempR)
    }
    this.hideNode(this.fruitLeft.node)
    this.hideNode(this.fruitRight.node)
    this.showNode(this.watermelon.node)
  },
  // 分尸显示，隐藏原来的水果
  showFruitsBodies() {
    // 换图
    this.fruitLS.spriteFrame = this.gateBG[1];
    this.fruitRS.spriteFrame = this.gateBG[2];
    // 克隆刚体
    var l = cc.instantiate(this.fruitLeft.node)
    var r = cc.instantiate(this.fruitRight.node)
    // 接入盒子
    l.parent = this.watermelonbox;
    r.parent = this.watermelonbox;
    // 记录内存地址
    this.tempL = l;
    this.tempR = r;
    // 添加刚体碰撞组件
    var leftRigid = l.addComponent(cc.RigidBody);
    var rightRigid = r.addComponent(cc.RigidBody);
    // 角速度
    leftRigid.angularVelocity = 180;
    rightRigid.angularVelocity = -180;
    // 角速度阻力系数
    leftRigid.angularDamping = 0.7;
    rightRigid.angularDamping = 0.7;
    // 线性速度
    leftRigid.linearVelocity = cc.v2(-cc.winSize.width / 3, cc.winSize.height)
    rightRigid.linearVelocity = cc.v2(cc.winSize.width / 3, cc.winSize.height)
    // 多倍重力
    leftRigid.gravityScale = 2;
    rightRigid.gravityScale = 2;
    // 显示
    this.showNode(l)
    this.showNode(r)
    // 给现有的口红添加刚体
    _.forEach(this.lipStickArr, function (node) {
      var rb = node.addComponent(cc.RigidBody);
      if (10 * Math.random() >= 5) {
        rb.angularVelocity = 180 * Math.random();
        rb.linearVelocity = cc.v2(-(cc.winSize.width / 2) * Math.random(), cc.winSize.height)
      } else {
        rb.angularVelocity = -180 * Math.random();
        rb.linearVelocity = cc.v2((cc.winSize.width / 2) * Math.random(), cc.winSize.height)
      }
      rb.angularDamping = 0.8
      // 多倍重力
      rb.gravityScale = 2.6;
    })

    this.watermelon.node.active = false;
    this.hideNode(this.watermelon.node)
  },

  // 复制序列号
  onCopyBtnClick() {
    var txt = this.gameConfig.userId;
    // cc.log(cc.sys);
    // 方式一：基于web
    if (!cc.sys.isNative) {
      if (this.webCopyString(txt)) {
        this.tipsText.string = "复制成功\r\n联系客服QQ1085332235领取";
      }
    }
    // 如果有发布其他平台再添加相关的复制方案
  },
  webCopyString: function (str) {
    // cc.log('复制' + str);
    var input = str;
    const el = document.createElement('textarea');
    el.value = input;
    el.setAttribute('readonly', '');
    el.style.contain = 'strict';
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    el.style.fontSize = '12pt'; // Prevent zooming on iOS
    const selection = getSelection();
    var originalRange = false;
    if (selection.rangeCount > 0) {
      originalRange = selection.getRangeAt(0);
    }
    document.body.appendChild(el);
    el.select();
    el.selectionStart = 0;
    el.selectionEnd = input.length;
    var success = false;
    try {
      success = document.execCommand('copy');
    } catch (err) { }
    document.body.removeChild(el);
    if (originalRange) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }
    return success;
  },
});
