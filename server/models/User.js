const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const Filter = require("bad-words");
const sequelize = require("../config");

class User extends Model {
  checkPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlphanumeric: true,
        notIn: [["admin", "root", "server"]],
        checkForProfanity(value) {
          const filter = new Filter();
          if (filter.isProfane(value)) {
            throw new Error("Profanity is not allowed.");
          }
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    win_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    loss_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // avatar: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   defaultValue: "https://avatars.dicebear.com/api/bottts/fjfifj.svg",
    // },
  },
  {
    hooks: {
      beforeCreate: async (newUser) => {
        newUser.password = await bcrypt.hash(newUser.password, 10);
        return newUser;
      },
    },
    sequelize,
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    modelName: "user",
  }
);

module.exports = User;
