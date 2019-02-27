'use strict';
// 常量
const http = require('http');
const request = require('sync-request');
const _ = require('lodash');
const fs = require('fs');
const NodeUuid = require('node-uuid');
const crypto = require('crypto');
const redis = require('redis');
const shortid = require('shortid');

// 变量
var RedClient = redis.createClient(6379, '127.0.0.1');
var ROOM = 'GameRoom';
var USERS = `${ROOM}UserList`;
var Player = require('./Player');
// console.log(Player);

// 函数
function cryptPwd(password) {
	var md5 = crypto.createHash('md5');
	return md5.update(password).digest('hex');
}


exports.mainInit = function () {
	return new Main();
};

function Main() { }

Main.prototype = {
	// 初始化
	init: function (app) {
		this.io = require('socket.io')(8781);
		this.io.on('connection', (socket) => {
			socket.setMaxListeners(0);
			// 测试连接状态
			socket.emit('conn', { code: '200' });
			// 掉线
			socket.on('disconnect', () => {
				var sid = socket.sid;
				if (sid) {
					socket.leave(ROOM);
					this.RedhDel(USERS, sid);
				}
			})
			// 创建房间
			socket.on('JoinRoom', (json, callback) => {
				var obj = JSON.parse(json)
				if (obj.sid) {
					socket.sid = obj.sid;
					socket.join(ROOM);
					obj.start = true;
					this.RedhSet(USERS, obj.sid, JSON.stringify(obj));
					var player = Player.init(obj.sid);
					if (callback) {
						callback(player);
					}
				}
			})
			// 离开房间
			socket.on('LeaveRoom', (json) => {
				var obj = JSON.parse(json)
				if (obj.sid) {
					socket.sid = obj.sid;
					socket.leave(ROOM);
					this.RedhDel(USERS, sid);
				}
			})

		});
		this.app = app;
		this.apiList();
	},

	// 通用redis set
	RedSet(key, value, callback) {
		RedClient.set(key, value, (err) => {
			if (err !== null) {
				console.log(`redis set ${key} err`);
				console.log(value);
				console.log(err);
				return;
			}
			if (callback) {
				callback()
			}
		})
	},

	// 通用redis get
	RedGet(key, callback) {
		RedClient.get(key, (err, res) => {
			// console.log(err, res);
			if (err !== null) {
				console.log(`redis get ${key} err`);
				console.log(err);
				return;
			}
			if (callback) {
				callback(res)
			}
		})
	},

	RedDel(key, callback) {
		RedClient.del(key, (err) => {
			// console.log(err, res);
			if (err !== null) {
				console.log(`redis del ${key} err`);
				console.log(err);
				return;
			}
			if (callback) {
				callback()
			}
		})
	},

	RedhSet(key, field, value, callback) {
		RedClient.hset(key, field, value, (err) => {
			if (err !== null) {
				console.log(`redis hset ${key} ${field} err`);
				console.log(value);
				console.log(err);
				return;
			}
			if (callback) {
				callback()
			}
		})
	},

	RedhGet(key, field, callback) {
		RedClient.hget(key, field, (err, res) => {
			if (err !== null) {
				console.log(`redis hget ${key} ${field} err`);
				console.log(err);
				return;
			}
			if (callback) {
				callback(res)
			}
		})
	},

	RedhDel(key, field, callback) {
		RedClient.hdel(key, field, (err) => {
			if (err !== null) {
				console.log(`redis hdel ${key} ${field} err`);
				console.log(err);
				return;
			}
			if (callback) {
				callback()
			}
		})
	},

	//http接口列表
	apiList() {
	},

	setOffRedInfo(socket) {
		this.RedhGet(`userlist`, socket.sid, (roomid) => {
			if (roomid) {
				this.RedhGet(`roomlist`, `room${roomid}`, (json) => {
					var room = JSON.parse(json);
					room.members = _.remove(room.members, (o) => {
						return o.sid == socket.sid
					})
					this.RedhSet(`roomlist`, `room${roomid}`, JSON.stringify(room))
				})
			}
		})
	},
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