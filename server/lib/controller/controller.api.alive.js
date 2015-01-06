'use strict';

module.exports = function() {
  var ctx = this;

  ctx.child('api').child('alive')
    .set({

      /**
       * Show alive status.
       */
      index: function(req, res) {
        return res.json(true);
      }
    });
};
