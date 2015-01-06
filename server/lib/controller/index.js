'use strict';

module.exports = function() {
  var ctx = this;

  ctx.child('ctrl').install(__dirname);
};

