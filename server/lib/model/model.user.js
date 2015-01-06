'use strict';

var Sequelize = require('sequelize');

module.exports = function() {
  var ctx = this;

  ctx.set({
    User: ctx.sequelize.define('User', {
      token: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      settings: {
        type: Sequelize.STRING,
        defaultValue: JSON.stringify({ rooms: [], notification: false }),
        allowNull: false
      }
    }, {
      tableName: 'users'
    })
  });
};
