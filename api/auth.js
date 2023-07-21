const { authSecret } = require("../.env");
const jwt = require("jwt-simple");
const bcrypt = require("bcrypt-nodejs");

module.exports = (app) => {
  const singin = async (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send("informe usuario ou senha");
    }
    const user = await app.db("users").where({ email: req.body.email }).first();
    if (!user) return res.status(400).send("nao encontramos");

    const isMatch = bcrypt.compareSync(req.body.password, user.password);
    if (!isMatch) return res.status(401).send("email ou senha invalido");

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      admin: user.admin,
      iat: now,
      exp: now + 60 * 60 * 24 * 2,
    };

    res.json({ ...payload, token: jwt.encode(payload, authSecret) });
  };
  const validatorToken = async (req, res) => {
    const userData = req.body || null;
    try {
      const token = jwt.decode(userData.token, authSecret);
      if (new Date(token.exp * 1000) > new Date()) {
        return send(true);
      }
    } catch (msg) {
      res.send(false);
    }
  };
  return { singin, validatorToken };
};
