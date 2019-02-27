var Player = {
  // console.log(`玩家${sid}被实例化`);
  init(sid) {
    this.width = 10;
    this.height = 10;
    this.sid = sid;
    this.type = 'player_pref';
    this.x = 0;
    this.y = 0;
    return this
  },
}
module.exports = Player