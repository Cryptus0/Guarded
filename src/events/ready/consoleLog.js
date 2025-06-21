const { notifyDevs } = require("../../handlers/notifyDevs");

module.exports = (client) => {
  console.log(`✅ Successfully logged in as '${client.user.username}'!`);
  notifyDevs(`✅ Successfully logged in as '${client.user.username}'!`)
};
