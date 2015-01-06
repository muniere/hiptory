'use strict';

var Sequelize = require('sequelize');

module.exports = function() {
  var ctx = this;

  ctx.set({
    Room: ctx.sequelize.define('Room', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      privacy: {
        type: Sequelize.STRING,
        allowNull: true
      }
    }, {
      sequelize: ctx.sequelize
    })
  });

  // HACK: define table, but not persistent
  ctx.sequelize.modelManager.removeDAO(ctx.sequelize.modelManager.getDAO('Room'));
};
