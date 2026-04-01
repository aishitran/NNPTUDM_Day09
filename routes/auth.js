var express = require("express");
var router = express.Router();

let userController = require('../controllers/users');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
const { CheckLogin } = require("../utils/authHandler");
const fs = require('fs');

const SECRET = 'secret';
const privateKey = fs.readFileSync('./private.key', 'utf8');

// ================= REGISTER =================
router.post('/register', async function (req, res) {
    try {
        let { username, password, email } = req.body;

        let newUser = await userController.CreateAnUser(
            username,
            password,
            email,
            "69b0ddec842e41e8160132b8"
        );

        res.send(newUser);
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

// ================= LOGIN =================
router.post('/login', async function (req, res) {
    try {
        let { username, password } = req.body;

        let user = await userController.GetAnUserByUsername(username);

        if (!user) {
            return res.status(404).send({
                message: "Thong tin dang nhap sai"
            });
        }

        if (user.lockTime > Date.now()) {
            return res.status(403).send({
                message: "Ban dang bi ban"
            });
        }

        // check password
        if (bcrypt.compareSync(password, user.password)) {

            user.loginCount = 0;
            await user.save();

            let token = jwt.sign(
                { id: user._id },
                privateKey,
                { algorithm: 'RS256', expiresIn: '1h' }
            );

            return res.send({
                token: token
            });

        } else {
            user.loginCount++;

            if (user.loginCount >= 3) {
                user.loginCount = 0;
                user.lockTime = Date.now() + 3600 * 1000;
            }

            await user.save();

            return res.status(400).send({
                message: "Thong tin dang nhap sai"
            });
        }

    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// ================= ME =================
router.get('/me', CheckLogin, function (req, res) {
    res.send(req.user);
});

// ================= CHANGE PASSWORD =================
router.post('/change-password', CheckLogin, async function (req, res) {
    try {
        let { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).send({
                message: "Thieu du lieu"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).send({
                message: "Mat khau moi phai >= 6 ky tu"
            });
        }

        let user = req.user;

        if (!bcrypt.compareSync(oldPassword, user.password)) {
            return res.status(400).send({
                message: "Mat khau cu khong dung"
            });
        }

        let hashedPassword = bcrypt.hashSync(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.send({
            message: "Doi mat khau thanh cong"
        });

    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

module.exports = router;