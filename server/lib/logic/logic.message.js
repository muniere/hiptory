'use strict';

var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');

module.exports = function() {
  var ctx = this;

  var privates = {

    /**
     * Filter only new messages.
     *
     * @param {Array} messages
     * @return {Promise.<Array>}
     */
    filterNewMessages: function(messages) {

      var ids = _.map(messages, 'id');

      if (_.isEmpty(ids)) {
        return Promise.resolve(messages);
      }

      return ctx.model.Message.find({ where: { id: { in: ids } } })
        .then(function(foundMessages) {
          var foundIds = _.map(foundMessages, 'id');

          return _.reject(messages, function(message) {
            return _.contains(foundIds, message.id);
          });
        });
    },

    /**
     * Build records from fetched messages.
     *
     * @param {Object} message
     * @return {Object} record
     */
    buildOneRecord: function(message) {

      return {
        id: message.id,
        body: message.message || '',
        userId: (message.from && _.isFinite(message.from.id)) ? Number(message.from.id) : 0,
        userName: (message.from && _.isString(message.from.name)) ? String(message.from.name) : String(message.from),
        date: new Date(message.date),
        roomId: message.room.id || 0,
        roomName: message.room.name || ''
      };
    }
  };

  ctx.child('message')
    .set({

      /**
       * Find messages of today.
       *
       * @param {Object} args
       * @param {string} args.token
       * @param {Instance.<User>} args.user
       * @param {Instance.<Room>} args.room
       * @param {string} [args.cursor=null]
       * @param {string} [args.timezone]
       * @param {boolean} [args.notification]
       * @return {Promise}
       */
      findForToday: function(args) {

        var params = _.merge({}, args);

        var ourCriteria = {
          where: {
            roomId: params.room.id,
            userId: (params.notification === true) ? { in: [ params.user.id, 0 ] } : params.user.id,
            date: {
              gte: moment().startOf('day').toDate(),
              lt : moment().endOf('day').toDate()
            }
          },
          order: 'date ASC'
        };

        return ctx.bridge.hipchat.fetchMessagesForToday(params)
          .then(function(messages) {
            return privates.filterNewMessages(messages);
          })
          .then(function(messages) {
            return ctx.model.Message.bulkCreate(_.map(messages, function(message) {
              return privates.buildOneRecord(message);
            }));
          })
          .then(function() {
            return ctx.model.Message.findAll(ourCriteria);
          });
      },

      /**
       * Find messages of specific date.
       *
       * @param {Date} date
       * @param {Object} args
       * @param {string} args.token
       * @param {Instance.<User>} args.user
       * @param {Instance.<Room>} args.room
       * @param {number} [args.limit]
       * @param {number} [args.offset]
       * @param {string} [args.timezone]
       * @param {boolean} [args.notification]
       * @return {Promise}
       */
      findForTheDay: function(date, args) {

        var params = _.merge({}, args);

        var allCriteria = {
          where: {
            roomId: params.room.id,
            date: {
              gte: moment(date).startOf('day').toDate(),
              lt : moment(date).endOf('day').toDate()
            }
          },
          order: 'date ASC'
        };

        var ourCriteria = _.merge({
          where: {
            userId: (params.notification === true) ? { in: [ params.user.id, 0 ] } : params.user.id
          }
        }, allCriteria);

        return ctx.model.Message.count(allCriteria)
          .then(function(count) {
            // messages already fetched and saved
            if (count) {
              return ctx.model.Message.findAll(ourCriteria);
            }

            // messages not fetched and not saved
            return ctx.bridge.hipchat.fetchMessagesForTheDay(date, params)
              .then(function(messages) {
                return privates.filterNewMessages(messages);
              })
              .then(function(messages) {
                return ctx.model.Message.bulkCreate(_.map(messages, function(message) {
                  return privates.buildOneRecord(message);
                }));
              })
              .then(function() {
                return ctx.model.Message.findAll(ourCriteria);
              });
          });
      }
    });
};
