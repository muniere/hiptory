'use strict';

var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');

module.exports = function() {
  var ctx = this;

  ctx.child('api').child('message')
    .set({

      /**
       * Show the list of messages of date.
       */
      list: function(req, res, next) {

        var today = {
          start: moment().startOf('day'),
          end: moment().endOf('day')
        };
        var date = moment(new Date([req.params.year, req.params.month, req.params.day].join('-')));

        ctx.model.User.find({ where: { token: req.session.token } })
          .then(function(user) {

            var settings = JSON.parse(user.settings);
            var rooms = _.map(settings.rooms, function(attrs) {
              return ctx.model.Room.build(attrs);
            });

            return Promise.all(_.map(rooms, function(room) {
              var params = {
                token: user.token,
                user: user,
                room: room,
                notification: settings.notification
              };

              if (moment(date).isBetween(today.start, today.end)) {
                return ctx.logic.message.findForToday(params);
              } else {
                return ctx.logic.message.findForTheDay(date, params);
              }
            })).then(function(messages) {
              return _.chain(messages).flatten().sortBy('date').value();
            });
          })
          .then(function(messages) {
            return res.json(messages);
          })
          .catch(function(err) {
            return next(err);
          });
      }
    });
};
