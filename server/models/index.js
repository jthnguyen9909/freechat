const User = require("./User");
const Message = require("./Message");

User.hasMany(Message, {
  foreignKey: "user_id",
});

module.exports = { User };
