// 'use strict';
// module.change_code = 1;
// var _ = require('lodash');
// var PRESIDIGO_USER_TABLE_NAME = 'presidigoUser';

// /** LOCAL SETUP
// var localUrl = 'http://localhost:9999';
// var localCredentials = {
//   region: 'us-west-1',
//   accessKeyId: 'fake',
//   secretAccessKey: 'fake'
// };
// var localDynasty = require('dynasty')(localCredentials, localUrl);
// var dynasty = localDynasty;
// **/

// var dynasty = require('dynasty')({});

// function DatabaseHelper() {
// }
// var userTable = function() {
//   return dynasty.table(PRESIDIGO_USER_TABLE_NAME);
// };

// DatabaseHelper.prototype.createTable = function() {
//   return dynasty.describe(PRESIDIGO_USER_TABLE_NAME)
//     .catch(function(error) {
//       console.log('createPresidigoUserTable: describe:', error);
//       return dynasty.create(PRESIDIGO_USER_TABLE_NAME, {
//         key_schema: {
//           hash: ['userId',
//                  'string']
//         }
//       });
//     });
// };

// DatabaseHelper.prototype.storeData = function(userId, data) {
//   console.log('writing data to database for user', userId);
//   return userTable().insert({
//     userId: userId,
//     stopID: data.stopId,
//     routeID: data.routeId,
//   }).catch(function(error) {
//     console.log(error);
//   });
// };

// DatabaseHelper.prototype.readData = function(userId) {
//   console.log('reading data with user id of ', userId);
//   return userTable().find(userId)
//     .then(function(result) {
//       return result;
//     })
//     .catch(function(error) {
//       console.log(error);
//     });
// };

// module.exports = DatabaseHelper;