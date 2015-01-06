'use strict';

module.exports = function() {
  var ctx = this;

  ctx.child('logic').install(__dirname);
};

