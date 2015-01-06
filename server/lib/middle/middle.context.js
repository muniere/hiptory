'use strict';

module.exports = function() {
  var ctx = this;

  ctx.set({ context: function() {
    return function(req, res, next) {
      req.ctx = ctx.forge();
      return next();
    };
  }});
};
