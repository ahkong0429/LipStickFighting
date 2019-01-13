/*
Navicat MySQL Data Transfer

Source Server         : vps
Source Server Version : 50554
Source Host           : localhost:3306
Source Database       : mj

Target Server Type    : MYSQL
Target Server Version : 50554
File Encoding         : 65001

Date: 2019-01-13 11:23:30
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `mj_config`
-- ----------------------------
DROP TABLE IF EXISTS `mj_config`;
CREATE TABLE `mj_config` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(25) DEFAULT NULL,
  `value` varchar(25) DEFAULT NULL,
  `tag` text,
  `status` int(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of mj_config
-- ----------------------------
INSERT INTO `mj_config` VALUES ('1', 'ipCheck', '0', '是否开启游客ip限制', '1');
INSERT INTO `mj_config` VALUES ('2', 'initBalance', '500', '初始资金', '1');

-- ----------------------------
-- Table structure for `mj_fighting`
-- ----------------------------
DROP TABLE IF EXISTS `mj_fighting`;
CREATE TABLE `mj_fighting` (
  `player_red` varchar(250) DEFAULT NULL,
  `player_blue` varchar(250) DEFAULT NULL,
  `room_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `hard` varchar(32) DEFAULT NULL,
  `wp_red` varchar(250) DEFAULT NULL,
  `wp_blue` varchar(250) DEFAULT NULL,
  `rule` blob,
  `create_time` varchar(32) DEFAULT NULL,
  `winner` varchar(32) DEFAULT NULL,
  `end_time` varchar(32) DEFAULT NULL,
  `enable` int(1) DEFAULT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=MyISAM AUTO_INCREMENT=247 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of mj_fighting
-- ----------------------------

-- ----------------------------
-- Table structure for `mj_room`
-- ----------------------------
DROP TABLE IF EXISTS `mj_room`;
CREATE TABLE `mj_room` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) DEFAULT NULL,
  `create_uid` int(11) DEFAULT NULL,
  `create_time` varchar(32) DEFAULT NULL,
  `bet_min` float(32,0) DEFAULT NULL,
  `bet_max` float(32,0) DEFAULT NULL,
  `add_can` int(1) DEFAULT NULL,
  `pwd_need` int(1) DEFAULT NULL,
  `password` varchar(32) DEFAULT NULL,
  `players` text,
  `have_bot` int(1) DEFAULT NULL,
  `lock` int(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of mj_room
-- ----------------------------
INSERT INTO `mj_room` VALUES ('1', '房间1', '0', '1545993680042', '1', '10000', '1', '0', '', '{}', '1', '0');
INSERT INTO `mj_room` VALUES ('2', '房间2', '0', '1545993680042', '1', '10000', '1', '1', '123456', '{}', '1', '0');
INSERT INTO `mj_room` VALUES ('3', '房间3', '0', '1545993680042', '1', '10000', '1', '0', '', '{}', '1', '0');
INSERT INTO `mj_room` VALUES ('4', '房间4', '0', '1545993680042', '1', '10000', '1', '0', '', '{}', '1', '0');
INSERT INTO `mj_room` VALUES ('5', '房间5', '0', '1545993680042', '1', '10000', '1', '0', '', '{}', '1', '0');
INSERT INTO `mj_room` VALUES ('6', '房间6', '0', '1545993680042', '1', '10000', '1', '0', '', '{}', '1', '0');
INSERT INTO `mj_room` VALUES ('7', '房间7', '0', '1545993680042', '1', '10000', '1', '0', '', '{}', '1', '0');
INSERT INTO `mj_room` VALUES ('8', '房间8', '0', '1545993680042', '1', '10000', '1', '0', '', '{}', '1', '0');

-- ----------------------------
-- Table structure for `mj_user`
-- ----------------------------
DROP TABLE IF EXISTS `mj_user`;
CREATE TABLE `mj_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` text NOT NULL,
  `username` varchar(32) NOT NULL,
  `password` varchar(32) NOT NULL,
  `balance` float(25,0) NOT NULL DEFAULT '0',
  `apply_time` varchar(25) NOT NULL,
  `create_time` varchar(25) NOT NULL,
  `type` int(11) unsigned NOT NULL,
  `last_ip` text NOT NULL,
  `lang` varchar(32) DEFAULT NULL,
  `wait_set` text,
  `token` text,
  `online` int(11) DEFAULT NULL,
  `finding` int(11) DEFAULT NULL,
  `weapon` text,
  `fight_id` int(11) unsigned DEFAULT NULL,
  `findId` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1024 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of mj_user
-- ----------------------------
