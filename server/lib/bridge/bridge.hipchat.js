'use strict';

var _ = require('lodash');
var moment = require('moment');
var request = require('superagent');
var sprintf = require('sprintf').sprintf;
var Promise = require('bluebird');

module.exports = function() {
  var ctx = this;

  var endpoints = {
    session: {
      show: 'https://api.hipchat.com/v2/oauth/token/%(session)s'
    },
    room: {
      show: 'https://api.hipchat.com/v2/room/%(room)s',
      history: {
        index: 'https://api.hipchat.com/v2/room/%(room)s/history',
        latest: 'https://api.hipchat.com/v2/room/%(room)s/history/latest'
      }
    }
  };

  var self = {

    /**
     * Fetch hipchat session.
     *
     * @param {Object} args
     * @param {string} args.token
     * @return {Promise}
     */
    fetchSession: function(args) {

      var params = _.merge({}, args);

      return new Promise(function(resolve, reject) {
        request
          .get(sprintf(endpoints.session.show, { session: params.token }))
          .query({
            'auth_token': params.token
          })
          .end(function(err, res) {
            if (err) {
              return reject(err);
            }
            if (!res.ok) {
              var e = new Error(res.body.error.message);
              e.type = res.body.error.type;
              e.code = e.status = res.body.error.code;
              return reject(e);
            }

            return resolve(res.body);
          });
      });
    },

    /**
     * Fetch hipchat room info.
     *
     * @param {Object} args
     * @param {number} args.roomId
     * @param {string} args.token
     * @return {Promise}
     */
    fetchRoom: function(args) {

      var params = _.merge({}, args);

      return new Promise(function(resolve, reject) {
        request
          .get(sprintf(endpoints.room.show, { room: params.roomId }))
          .query({
            'auth_token': params.token
          })
          .end(function(err, res) {
            if (err) {
              return reject(err);
            }
            if (!res.ok) {
              var e = new Error(res.body.error.message);
              e.type = res.body.error.type;
              e.code = e.status = res.body.error.code;
              return reject(e);
            }

            return resolve(res.body);
          });
      });
    },

    /**
     * Fetch history from the specific room with optional params.
     *
     * @param {Object} args
     * @param {string} args.token
     * @param {Instance.<Room>} args.room
     * @param {(string|Date)} [args.date='recent']
     * @param {number} [args.limit=500]
     * @param {number} [args.offset=0]
     * @param {string} [args.timezone='Asia/Tokyo']
     * @param {boolean} [args.reverse=true]
     * @return {Promise}
     */
    fetchHistory: function(args) {

      var params = _.merge({
        date: 'recent',
        limit: 500,
        offset: 0,
        timezone: 'Asia/Tokyo',
        reverse: true
      }, args);

      return new Promise(function(resolve, reject) {
        request
          .get(sprintf(endpoints.room.history.index, { room: params.room.id }))
          .query({
            'date': params.date,
            'timezone': params.timezone,
            'start-index': params.offset,
            'max-results': params.limit,
            'reverse': params.reverse,
            'auth_token': params.token
          })
          .end(function(err, res) {
            if (err) {
              return reject(err);
            }
            if (!res.ok) {
              var e = new Error(res.body.error.message);
              e.type = res.body.error.type;
              e.code = e.status = res.body.error.code;
              return reject(e);
            }

            var history = res.body;

            _.each(history.items, function(item) {
              item.room = params.room.values;
            });

            return resolve(history);
          });
      });
    },

    /**
     * Fetch latest history from the specific room with optional params.
     *
     * @param {Object} args
     * @param {string} args.token
     * @param {Instance.<Room>} args.room
     * @param {number} [args.limit=75]
     * @param {string} [args.cursor=null]
     * @param {string} [args.timezone='Asia/Tokyo']
     * @return {Promise}
     */
    fetchLatestHistory: function(args) {

      var params = _.merge({
        limit: 75,
        cursor: null,
        timezone: 'Asia/Tokyo'
      }, args);

      return new Promise(function(resolve, reject) {
        request
          .get(sprintf(endpoints.room.history.latest, { room: params.room.id }))
          .query({
            'timezone': params.timezone,
            'max-results': params.limit,
            'not-before': params.cursor,
            'auth_token': params.token
          })
          .end(function(err, res) {
            if (err) {
              return reject(err);
            }
            if (!res.ok) {
              var e = new Error(res.body.error.message + ':' + params.room.id);
              e.type = res.body.error.type;
              e.code = e.status = res.body.error.code;
              return reject(e);
            }

            var history = res.body;

            _.each(history.items, function(item) {
              item.room = params.room.values;
            });

            return resolve(history);
          });
      });
    },

    /**
     * Fetch messages of today from the specific room with optional params.
     *
     * @param {Object} args
     * @param {string} args.token
     * @param {Instance.<Room>} args.room
     * @param {number} [args.limit=75]
     * @param {string} [args.cursor=null]
     * @param {string} [args.timezone='Asia/Tokyo']
     * @param {Array} [acc]
     * @return {Promise}
     */
    fetchMessagesForToday: function(args, acc) {

      var params = _.merge({}, args);

      return self.fetchLatestHistory(params)
        .then(function(history) {
          var messages = history.items.concat(acc || []);

          var today = {
            start: moment().startOf('day').toDate(),
            end: moment().endOf('day').toDate()
          };

          if (new Date(messages[0].date) < today.start) {
            return _.filter(messages, function(item) {
              return moment(item.date).isBetween(today.start, today.end);
            });
          }

          return self.fetchMessagesForToday(_.defaults({
            cursor: messages[0].id
          }, params), messages);
        });
    },

    /**
     * Fetch history of the date from the specific room with optional params.
     *
     * @param {Date|number} date
     * @param {Object} args
     * @param {string} args.token
     * @param {Instance.<Room>} args.room
     * @param {(string|Date)} [args.date='recent']
     * @param {number} [args.limit=500]
     * @param {number} [args.offset=0]
     * @param {string} [args.timezone='Asia/Tokyo']
     * @param {boolean} [args.reverse=true]
     * @return {Promise}
     */
    fetchMessagesForTheDay: function(date, args) {

      var params = _.defaults({
        date: moment(date).endOf('day').format()
      }, args);

      // TODO: support recursive fetch
      return self.fetchHistory(params)
        .then(function(history) {
          var theDay = {
            start: moment(date).startOf('day').toDate(),
            end: moment(date).endOf('day').toDate()
          };

          return _.filter(history.items, function(item) {
            return moment(item.date).isBetween(theDay.start, theDay.end);
          });
        });
    }
  };

  ctx.child('hipchat').set(self);
};
