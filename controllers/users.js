const userModel = require("../schemas/users");
const bcrypt = require('bcrypt');

module.exports = {
    CreateAnUser: async function (
        username, password, email, role,
        fullName, avatarUrl, status, loginCount
    ) {

        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });

        await newItem.save();
        return newItem;
    },

    GetAllUser: async function () {
        let users = await userModel.find({ isDeleted: false });
        return users;
    },

    GetAnUserByUsername: async function (username) {
        let user = await userModel.findOne({
            username: username
        });
        return user;
    },

    GetAnUserById: async function (userId) {
        let user = await userModel.findById(userId);
        return user;
    }
};