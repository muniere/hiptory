'use strict';

module.exports = function() {
  var ctx = this;

  ctx.child('bridge').install(__dirname);
};

