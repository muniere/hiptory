'use strict';

module.exports = function() {
  var ctx = this;

  ctx.child('model').install(__dirname);
};

