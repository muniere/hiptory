'use strict';

module.exports = function() {
  var ctx = this;

  ctx.app.route('/api/alive.json')
    .get(ctx.ctrl.api.alive.index);

  ctx.app.route('/api/auth.json')
    .post(ctx.ctrl.api.auth.create)
    .delete(ctx.ctrl.api.auth.remove);

  ctx.app.route('/api/messages/:year/:month/:day.json')
    .get(ctx.ctrl.api.message.list);

  ctx.app.route('/api/settings.json')
    .get(ctx.ctrl.api.setting.show)
    .patch(ctx.ctrl.api.setting.update);
};
