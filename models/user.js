const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
require('dotenv').config()

//create sequlize instance with local Mysql database
const sequelize = new Sequelize('spimsens', process.env.MYSQLUSER, process.env.PASSWORD, {
    host: 'localhost',
    dialect: 'mysql'
});

//setup user model
const User = sequelize.define('user', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {

    //hash password before saving new user
    hooks: {
        beforeCreate: (user) => {
            const salt = bcrypt.genSaltSync();
            user.password = bcrypt.hashSync(user.password, salt);
        }
    },

});

//create instance method for user model
User.prototype.validatePssword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// create the defined tables in the specified database if it doesn't exist.
sequelize.sync()
    .then(() => console.log('users table has been successfully created, or updated if one exists'))
    .catch(error => console.log(error));

module.exports = User;