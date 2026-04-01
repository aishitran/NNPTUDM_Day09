const userController = require('../controllers/users');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// 🔓 đọc public key
const publicKey = fs.readFileSync('./public.key', 'utf8');

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).send({
                    message: "Ban chua dang nhap"
                });
            }

            let token = authHeader.split(" ")[1];

            // 🔥 verify bằng RS256
            let result = jwt.verify(token, publicKey, {
                algorithms: ['RS256']
            });

            // check expire
            if (result.exp * 1000 < Date.now()) {
                return res.status(401).send({
                    message: "Token het han"
                });
            }

            let user = await userController.GetAnUserById(result.id);

            if (!user) {
                return res.status(401).send({
                    message: "User khong ton tai"
                });
            }

            req.user = user;

            next();

        } catch (error) {
            console.log("JWT Verify Error:", error.message);
            return res.status(401).send({
                message: "Token khong hop le"
            });
        }
    }
};