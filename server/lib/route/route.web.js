'use strict';

module.exports = function() {
  var ctx = this;

  ctx.app.route('/*')
    .get(function(req, res) {
      return res.render('index');
    });
};
