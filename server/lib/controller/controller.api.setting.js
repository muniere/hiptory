'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function() {
  var ctx = this;

  ctx.child('api').child('setting')
    .set({

      /**
       * Show the user settings.
       */
      show: function(req, res, next) {

        ctx.model.User.find({ where: { token: req.session.token } })
          .then(function(user) {
            return res.json(JSON.parse(user.settings));
          })
          .catch(function(err) {
            return next(err);
          });
      },

      /**
       * Update user settings.
       */
      update: function(req, res, next) {

        var props = {
          user: ctx.model.User.find({ where: { token: req.session.token } }),
          addRooms: Promise.all(_.map(req.body.add_rooms || [], function(roomId) {
            return ctx.bridge.hipchat.fetchRoom({ roomId: roomId, token: req.session.token });
          })).then(function(rooms) {
            return _.map(rooms, function(attrs) {
              return ctx.model.Room.build(attrs);
            });
          }),
          delRooms: Promise.resolve(req.body.del_rooms)
        };

        Promise.props(props)
          .then(function(result) {

            var user = result.user;
            var addRooms = result.addRooms;
            var delRooms = result.delRooms;

            var settings = JSON.parse(user.settings);

            if (!_.isEmpty(addRooms)) {
              settings.rooms = _.union(settings.rooms, addRooms);
            }

            if (!_.isEmpty(delRooms)) {
              settings.rooms = _.reject(settings.rooms, function(room) {
                return _.contains(delRooms, room.id);
              });
            }

            settings.rooms = _.uniq(settings.rooms, 'id');

            if (!_.isUndefined(req.body.notification)) {
              settings.notification = _.contains([true, 'true'], req.body.notification);
            }

            user.settings = JSON.stringify(settings);

            return user.save();
          })
          .then(function(user) {
            return res.status(200).json(JSON.parse(user.settings));
          })
          .catch(function(err) {
            return next(err);
          });
      }
    });
};
