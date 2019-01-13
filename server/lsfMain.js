'use strict';
const http = require('http');
const request = require('sync-request');
const _ = require('lodash');
const fs = require('fs');
const NodeUuid = require('node-uuid');
const crypto = require('crypto');
var schedule = require('node-schedule');
function cryptPwd(password) {
	var md5 = crypto.createHash('md5');
	return md5.update(password).digest('hex');
}

const { init, exec, sql, transaction } = require('mysqls')

const jwt = require('jsonwebtoken');
const secret = 'AKMJ';
// 不需要token验证的接口
const public_path = [
	'/registTraveler', '/login'
];
const token_exp = 1000 * 60 * 60 * 24;//token保存1天的有效期

// mysql
init({
	host: 'localhost',
	user: 'root',
	password: 'Vs147258sV',
	database: 'mj',
	port: 3306,
})
const db_pre = "mj_";

// ws
// var WebSocketServer = require('ws').Server,
// 	wss = new WebSocketServer({ port: 8181 });
// 连接池
// var clients = {};
var ROOMS = {};
// var timer = {};

exports.mainInit = function () {
	return new Main();
};

function Main() { }

Main.prototype = {
	// 初始化
	init: function (app) {
		var self = this;

		// console.log('lsfMain-init-------------->>>>>>>>>>>>>>>');

		this.resetAllStatus();

		this.io = require('socket.io')(8181);
		this.io.on('connection', (socket) => {
			socket.setMaxListeners(0);
			socket.emit('conn', { code: '200' });
			socket.on('disconnect', () => {
				if (socket.token) {
					this.setDisconnet(socket.token);
				}
				this.io.sockets.in(socket.roomId).emit('LeaveRoom')
			})
			socket.on('TokenVerify', (token, username, fn) => {
				jwt.verify(token, secret, (err, decoded) => {
					if (err) {
						console.log('jwt verity err');
						// console.log(err);
						// token验证不过关断开连接
						socket.close();
					}
					var exp = (decoded.exp + '00000000').substr(0, new Date().getTime().toString().length);
					// 有效期验证
					if (new Date().getTime() >= exp) {
						socket.close();
					}
					// 通过验证
					socket.token = token;
					socket.username = username;
					socket.roomId = username;
					// 加入房间md5(username)
					socket.join(username);
					// clients[uid] = socket;
					fn({ code: '300' });
				})
			})
			// 进入房间
			socket.on('ChangeRoom', (json) => {
				var obj = JSON.parse(json)
				socket.roomId = obj.roomId;
				socket.join(obj.roomId);
				this.io.sockets.in(obj.roomId).emit('MatchSuccess', json)
			})
			// 客户端加载资源完毕
			socket.on('ClientLoaded', (uid, roomId) => {
				ROOMS[roomId] = ROOMS[roomId] || [];
				ROOMS[roomId].push(uid);
				if (ROOMS[roomId].length == 2) {
					this.io.sockets.in(roomId).emit('GameStart')
					ROOMS[roomId] = [];
				}
			})
			// 客户端上传的攻击记录
			socket.on('SendAttack', (roomId, uid, atkjson) => {
				// console.log(`SendAttack`);
				// console.log(roomId, uid, atkjson);
				// 下发攻击
				this.io.sockets.in(roomId).emit('BroadAttack', atkjson)
			})
			// 游戏结束离开不属于自己的房间
			socket.on('GameEnd', (roomId) => {
				if (socket.username !== roomId) {
					socket.leave(roomId);
					socket.roomId = socket.username;
				}
			})
		});

		// wss.on('connection', function (ws, req) {
		// 	ws.setMaxListeners(0);
		// 	// 将该连接加入连接池
		// 	clients.push(ws);
		// 	// console.log('client connected');
		// 	// console.log(req.url);
		// 	let token = req.url.substr(1);
		// 	jwt.verify(token, secret, function (err, decoded) {
		// 		//err
		// 		if (err) {
		// 			console.log('jwt verity err');
		// 			// console.log(err);
		// 			// token验证不过关断开连接
		// 			ws.isAlive = false;
		// 			ws.close();
		// 		}
		// 		var exp = (decoded.exp + '00000000').substr(0, new Date().getTime().toString().length);
		// 		// 有效期验证
		// 		if (new Date().getTime() >= exp) {
		// 			ws.isAlive = false;
		// 			ws.close();
		// 		}
		// 		// 通过验证
		// 		ws.token = token;
		// 		ws.send('H+');
		// 		ws.on('message', function (message) {
		// 			if (message !== 'H+') {
		// 				self.broadMsg(message);
		// 			}
		// 			if (message == 'H+') {
		// 				// console.log(ws.token);
		// 				setTimeout(() => {
		// 					try {
		// 						ws.send('H+');
		// 					} catch (err) {
		// 						ws.isAlive = false;
		// 						ws.close();
		// 						// 连接关闭时，将其移出连接池
		// 						clients = clients.filter(function (ws1) {
		// 							return ws1 !== ws
		// 						})
		// 						self.setDisconnet(ws.token);
		// 						// console.log('ws closed');
		// 					}
		// 				}, 3000)
		// 			}
		// 			ws.on('close', function (message) {
		// 				ws.isAlive = false;
		// 				ws.close();
		// 				// 连接关闭时，将其移出连接池
		// 				clients = clients.filter(function (ws1) {
		// 					return ws1 !== ws
		// 				})
		// 				self.setDisconnet(ws.token);
		// 				// console.log(message);
		// 				// console.log('ws closed on close');
		// 			});
		// 		});
		// 	});
		// });

		// token验证的中间件
		app.use(function (req, res, next) {
			// console.log(req.url);
			// 不需要验证的接口
			if (public_path.indexOf(req.url) > -1) {
				next();
			} else {
				// token验证
				let token = req.headers.token;
				jwt.verify(token, secret, function (err, decoded) {
					//err
					if (err) {
						console.log('jwt verity err');
						// console.log(err);
						return res.send({ "code": "106" });
					}

					// decoded.name
					// console.log(decoded);
					// console.log(decoded.exp);
					// console.log(new Date().getTime());
					// console.log(new Date().getTime() >= decoded.exp);
					var exp = (decoded.exp + '00000000').substr(0, new Date().getTime().toString().length);
					// 有效期验证
					if (new Date().getTime() >= exp) {
						return res.send({ "code": "107" });
					}
					// 通过验证
					next();
				});
			}
		})

		this.app = app;
		this.apiList();

		this.startTask();
	},

	// 广播消息
	broadMsg(message) {
		var self = this;
		// 广播消息
		// clients.forEach(function (ws) {
		// 	try {
		// 		ws.send(message);
		// 	} catch (err) {
		// 		console.log('broadMsg err');
		// 		console.log(err);
		// 		ws.close();
		// 		ws.isAlive = false;
		// 		// 连接关闭时，将其移出连接池
		// 		clients = clients.filter(function (ws1) {
		// 			return ws1 !== ws
		// 		})
		// 		self.setDisconnet(ws.token);
		// 	}
		// })
	},

	//http接口列表
	apiList() {

		var $this = this;

		// 游客注册
		this.app.post("/registTraveler", function (req, res) {
			// console.log(req.body);
			var nextFun = function (username) {
				var uuid = fm(NodeUuid.v4());
				var password = '123456';
				var apply_time = req.body.time;
				var create_time = new Date().getTime();
				var type = 1;//1游客2正式用户
				var last_ip = fm(getClientIp(req));
				var lang = fm(req.body.lang);
				// console.log(lang);
				// ip判断
				$this.haveSameIp(last_ip, (have) => {
					if (!have) {
						// console.log(lang);
						// 游客注册
						$this.doRegistTraveler({
							uuid: uuid,
							username: username,
							password: fm(cryptPwd(password)),
							apply_time: apply_time,
							create_time: create_time,
							type: type,
							last_ip: last_ip,
							lang: lang,
						}, (rs) => {
							if (rs.insertId > 0) {
								// 生成token
								var token = jwt.sign(
									{ username: dfm(username) },
									secret,
									{ expiresIn: token_exp }//保存时间
								);
								res.send({
									code: "100", data: {
										username: dfm(username),
										// password: password,//默认的明文密码
										token: token
									}
								});
							} else {
								res.send({ code: "102" });
							}
							// console.log(rs)
						});
					} else {
						res.send({ code: "101" });
					}
				})
			}
			// 获取一个不重复的用户名，回调传给下一步
			$this.getNorepeatUsername(nextFun);
		});

		// 登录
		this.app.post("/login", function (req, res) {
			// find user
			var nextFun = function (rs) {
				if (rs.length > 0) {
					let user = rs[0];
					// req.session.userId = user.id;
					// 生成token
					var token = jwt.sign(
						{ username: user.username, id: user.id },
						secret,
						{ expiresIn: token_exp }//保存时间
					);
					res.send({ code: '105', token: token });
				} else {
					res.send({ code: '103' });
				}
			}
			$this.findUser(req.body.username, req.body.password, nextFun)
		})

		// 测试token
		this.app.post("/test", function (req, res) {
			res.send({ token: req.headers.token })
		})

		// 创建匹配
		this.app.post("/createRoom", function (req, res) {
			var _post = req.body;
			var data = {
				wait_set: fm(_post.hard),
				weapon: fm(_post.weapon),
				token: fm(req.headers.token),
				online: 1,
				finding: 1,
			}
			if (_post.fightId) {
				data.findId = _post.fightId || 0
			}
			exec(
				sql.table(db_pre + 'user').where({ username: fm(_post.uid) }).data(data).update()
			).then(rs => {
				res.send({ code: "108" })
			}).catch(err => {
				console.log('update user sql');
				console.log(sql.table(db_pre + 'user').where({ username: fm(_post.uid) }).data(data).update());
				console.log('update user err')
				console.log(err)
				res.send({ code: "109" })
			})
		})
	},

	resetAllStatus() {
		exec(
			sql.table(db_pre + 'user').where({ finding: 1 }).data({ finding: 0 }).update()
		).then(rs => {
			// console.log(res)
		}).catch(err => {
			console.log('resetAllStatus sql');
			console.log(sql.table(db_pre + 'user').where({ finding: 1 }).data({ finding: 0 }).update());
			console.log('resetAllStatus err')
			console.log(err)
		})
	},

	// 设置离线
	setDisconnet(token) {
		var self = this;
		var data = {
			online: 0,
			finding: 0
		}
		exec(
			sql.table(db_pre + 'user').where({ token: fm(token) }).data(data).update()
		).then(res => {
			// console.log(res)
			// 向所有客户端广播离线通知
			// var obj = {
			// 	'token': token,
			// 	'type': 'off_line',
			// }
			// self.broadMsg(JSON.stringify(obj));
		}).catch(err => {
			console.log('setDisconnet sql');
			console.log(sql.table(db_pre + 'user').where({ token: fm(token) }).data(data).update());
			console.log('setDisconnet err')
			console.log(err)
		})
	},

	findUser(name, pwd, callback) {
		exec(
			sql.table(db_pre + 'user').where({ username: fm(name), password: fm(cryptPwd(pwd)) }).select()
		).then(res => {
			// console.log(res)
			return callback(res);
		}).catch(err => {
			console.log('findUser sql');
			console.log(sql.table(db_pre + 'user').where({ username: fm(name), password: fm(cryptPwd(pwd)) }).select());
			console.log('findUser err')
			console.log(err)
			return callback(false);
		})
	},

	// 定时任务，检查数据库是否有匹配的对，插入队列等待空的房间
	startTask() {
		var self = this;
		var rule = new schedule.RecurrenceRule();
		rule.second = [4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59];//5秒一次
		this.task = schedule.scheduleJob(rule, function () {
			self.checkTask()
		});
	},

	checkTask() {
		var self = this;
		exec(
			sql.table(db_pre + 'user').where({ online: 1, finding: 1 }).select()
		).then(res => {
			// id匹配
			// var ftarr = _.filter(res, function (o) {
			// 	return o.fight_id
			// })
			// if (ftarr.length > 0) {
			// 	var ftpp = _.filter(res, function (o) {
			// 		return (o.username == ftarr[0].fight_id) && (o.username !== ftarr[0].username)
			// 	})
			// 	if (ftpp.length > 0) {
			// 		var arr = [ftarr[0], ftpp[0]];
			// 		self.createRule(arr);
			// 		return;
			// 	}
			// }
			if (res.length >= 2) {
				// console.log(res);
				// var arr = _.take(res, 2);
				// 创建一个匹配
				self.createRule(res);
			}
		}).catch(err => {
			console.log('checkTask sql');
			console.log(sql.table(db_pre + 'user').where({ online: 1, finding: 1 }).select());
			console.log('checkTask err')
			console.log(err)
		})
	},

	// 创建游戏规则
	createRule(arr) {
		var easyCount = _.filter(arr, (o) => {
			return o.wait_set == 'easy'
		})
		var normalCount = _.filter(arr, (o) => {
			return o.wait_set == 'normal'
		})
		var hardCount = _.filter(arr, (o) => {
			return o.wait_set == 'hard'
		})
		var nightmareCount = _.filter(arr, (o) => {
			return o.wait_set == 'baddream'
		})
		if (easyCount.length < 2
			&& normalCount.length < 2
			&& hardCount.length < 2
			&& nightmareCount.length < 2) return;
		var self = this,
			redUser,
			blueUser;
		if (nightmareCount.length >= 2) {
			redUser = nightmareCount[0];
			blueUser = nightmareCount[1];
		}
		if (hardCount.length >= 2) {
			redUser = hardCount[0];
			blueUser = hardCount[1];
		}
		if (normalCount.length >= 2) {
			redUser = normalCount[0];
			blueUser = normalCount[1];
		}
		if (easyCount.length >= 2) {
			redUser = easyCount[0];
			blueUser = easyCount[1];
		}

		// 按指定id匹配
		if (redUser.findId > 0) {
			var f = _.find(arr, (o) => {
				return o.id == findId
			})
			if (f) {
				blueUser = f;
			}
		}

		// var data = {
		// 	'player_red': fm(redUser.token),
		// 	'player_blue': fm(blueUser.token),
		// 	'hard': fm(redUser.wait_set),
		// 	'wp_red': fm(redUser.weapon),
		// 	'wp_blue': fm(blueUser.weapon),
		// 	'create_time': new Date().getTime(),
		// 	'enable': 1
		// }
		// // 角度，时间，生成33组动作
		// var rules = [];
		// // rules = this.getRandomActions(rules, 33);
		// data.rule = fm(JSON.stringify(rules));

		// 向所有客户端广播匹配成功的消息
		var obj = {
			'users': [redUser.username, blueUser.username],
			'roomId': redUser.username,//rs.insertId,
			// 'rule': rules,
			'hard': redUser.wait_set,
			'wp_red': redUser.weapon,
			'wp_blue': blueUser.weapon,
		}
		// self.socket.in(blueUser.id).emit('ChangeRoom', redUser.id);
		// self.socket.in(blueUser.id).leave();
		// 通知蓝方进入红方房间
		this.io.sockets.in(blueUser.username).emit('ChangeRoom', JSON.stringify(obj));
		// 通知红方房间所有人
		// self.io.sockets.in(redUser.id).emit('MatchSuccess', JSON.stringify(obj));
		// self.broadMsg(JSON.stringify(obj));
		// update status
		self.updateMysql(db_pre + 'user', { id: redUser.id }, { finding: 0 }, (rs) => {
			// console.log('user finding update');
			self.updateMysql(db_pre + 'user', { id: blueUser.id }, { finding: 0 }, (r) => {
				// console.log('user finding update');
				// console.log(rs);
			});
		});

		// this.insertMysql('fighting', data, (rs) => {
		// 	if (rs.insertId > 0) {
		// 		// console.log('fighting+ succuess');
		// 		// 向所有客户端广播匹配成功的消息
		// 		var obj = {
		// 			'users': [redUser.username, blueUser.username],
		// 			'roomId': rs.insertId,
		// 			'rule': rules,
		// 			'hard': redUser.wait_set,
		// 			'wp_red': redUser.weapon,
		// 			'wp_blue': blueUser.weapon,
		// 			'type': 'match_success',
		// 		}
		// 		self.broadMsg(JSON.stringify(obj));
		// 		// update status
		// 		self.updateMysql(db_pre + 'user', { id: redUser.id }, { finding: 0 }, (rs) => {
		// 			// console.log('user finding update');
		// 			self.updateMysql(db_pre + 'user', { id: blueUser.id }, { finding: 0 }, (r) => {
		// 				// console.log('user finding update');
		// 				// console.log(rs);
		// 			});
		// 		});
		// 	}
		// })
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

	getRandomActions(arr, num) {
		if (arr.length >= num) {
			return arr;
		}
		var a = [this.getRandomRoad(), this.getRandomTime()];
		arr.push(a);
		return this.getRandomActions(arr, num);
	},

	// 游客注册，游客用户名是否重复
	async doRegistTraveler(data, callback) {
		// console.log(data);
		// 初始化余额
		var initBalance = await this.getConfig('initBalance');
		if (initBalance) {
			data.balance = fm(initBalance.value);
		}
		this.insertMysql('user', data, callback)
	},

	async updateMysql(table, where, data, callback) {
		exec(
			sql.table(table).where(where).data(data).update()
		).then(rs => {
			// console.log(sql.table(table).where(where).data(data).update());
			return callback(rs);
		}).catch(err => {
			console.log('updateMysql sql');
			console.log(sql.table(table).where(where).data(data).update());
			console.log('updateMysql err')
			console.log(err)
			return callback(false);
		})
	},

	// 通用新增数据
	async insertMysql(table, data, callback) {
		exec(
			sql.table(db_pre + table).data(data).insert()
		).then(res => {
			// console.log(res)
			return callback(res);
		}).catch(err => {
			console.log('insertMysql sql');
			console.log(sql.table(db_pre + table).data(data).insert());
			console.log('insertMysql err')
			console.log(err)
			return callback(false);
		})
	},

	// 获取一个不重复的用户名
	getNorepeatUsername(callback) {
		var $this = this;
		var username = fm('m' + Math.random().toString().slice(-6));
		this.haveSameUsername(username, (have) => {
			if (!have) {
				callback(username);
				return;
			}
			$this.getNorepeatUsername(callback);
		});
	},

	// 是否重复用户名
	haveSameUsername(username, callback) {
		exec(
			sql.table(db_pre + 'user').field('id').where({ 'username': username }).select()
		).then(res => {
			// console.log(res)
			if (res.length > 0) {
				return callback(true);
			}
			return callback(false);
		}).catch(err => {
			console.log('haveSameUsername err')
			console.log(err)
			return callback(true);
		})
	},

	// 获取一个服务端的配置,status表示1启用0禁用
	async getConfig(name) {
		let result = await exec(
			sql.table(db_pre + 'config').where({ name: fm(name), status: 1 }).select()
		);
		return await result.length > 0 ? result[0] : false
	},

	// 限制同ip的注册
	async haveSameIp(last_ip, callback) {
		var ipCheck = await this.getConfig('ipCheck');
		if (ipCheck.value !== '1') {//未开启
			return await callback(false);
		}
		let res = await exec(
			sql.table(db_pre + 'user').field('id').where({ 'last_ip': last_ip }).select()
		)
		return await res.length > 0 ? callback(true) : callback(false);

		// .then(res => {
		// 	// console.log(res)
		// 	if (res.length > 0) {
		// 		return callback(true);
		// 	}
		// 	return callback(false);
		// }).catch(err => {
		// 	console.log('haveSameIp err')
		// 	console.log(err)
		// 	console.log('haveSameIp sql')
		// 	console.log(sql.table(db_pre + 'user').field('id').where({ 'last_ip': last_ip }).select())
		// 	return callback(true);
		// })
	},
};

// 包装mysql字段
function fm(s) {
	return '`' + s + '`'
}
// 反
function dfm(s) {
	return s.replace(/`/g, '');
}

// 获取客户端ip地址
function getClientIp(req) {
	var ip = req.headers['x-forwarded-for'] ||
		req.ip ||
		req.connection.remoteAddress ||
		// req.socket.remoteAddress ||
		// req.connection.socket.remoteAddress ||
		'';
	if (ip.split(',').length > 0) {
		ip = ip.split(',')[0]
	}
	ip = ip.substr(ip.lastIndexOf(':') + 1, ip.length);
	// console.log("ip:"+ip);
	return ip;
};

/**
 * 对Date的扩展，将 Date 转化为指定格式的String 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
 * 可以用 1-2 个占位符 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) eg: (new
 * Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 (new
 * Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04 (new
 * Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04 (new
 * Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04 (new
 * Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */
Date.prototype.pattern = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1, // 月份
		"d+": this.getDate(), // 日
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, // 小时
		"H+": this.getHours(), // 小时
		"m+": this.getMinutes(), // 分
		"s+": this.getSeconds(), // 秒
		"q+": Math.floor((this.getMonth() + 3) / 3), // 季度
		"S": this.getMilliseconds() // 毫秒
	};
	var week = {
		"0": "\u65e5",
		"1": "\u4e00",
		"2": "\u4e8c",
		"3": "\u4e09",
		"4": "\u56db",
		"5": "\u4e94",
		"6": "\u516d"
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if (/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[this.getDay() + ""]);
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
};