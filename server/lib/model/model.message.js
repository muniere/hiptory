'use strict';

var moment = require('moment');
var Sequelize = require('sequelize');

module.exports = function() {
  var ctx = this;

  ctx.set({
    Message: ctx.sequelize.define('Message', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      roomId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      roomName: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {
      tableName: 'messages',
      getterMethods: {
        time: function() {
          return moment(this.date).format('HH:mm');
        }
      }
    })
  });
};
