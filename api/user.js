const bcrypt = require("bcrypt-nodejs");
const {
  existsOrError,
  notExistsOrError,
  equalsOrError,
} = require("./validation");
module.exports = (app) => {
  const encryptPassword = (password) => {
    const stalt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, stalt);
  };
  const save = async (req, res) => {
    const user = { ...req.body };
    if (req.params.id) user.id = req.params.id;

    if (!req.originalUrl.startsWith("/users")) user.admin = false;
    if (!req.user || !req.user.admin) user.admin = false;
    try {
      existsOrError(user.name, "Nome não encontrado");
      existsOrError(user.email, "Não encontramos o email");
      existsOrError(user.password, "Nao teve senha");
      existsOrError(user.confirmPassword, "Confirma a senha");
      equalsOrError(user.password, user.confirmPassword, "senhas não confere");

      const userFromDB = await app
        .db("users")
        .where({ email: user.email })
        .first();
      if (!user.id) {
        notExistsOrError(userFromDB, "Usuario ja existe");
      }
    } catch (msg) {
      return res.status(400).send(msg);
    }
    user.password = encryptPassword(user.password);
    delete user.confirmPassword;
    if (user.id) {
      app
        .db("users")
        .update(user)
        .where({ id: user.id })
        .then((_) => res.status(204).send())
        .catch((err) => res.status(500).send(err));
    } else {
      app
        .db("users")
        .insert(user)
        .then((_) => res.status(204).send())
        .catch((err) => res.status(500).send(err));
    }
  };
  const get = (req, res) => {
    app
      .db("users")
      .select("id", "name", "email", "admin")
      .then((users) => res.json(users))
      .catch((err) => res.status(500).send(err));
  };
  const getSingle = (req, res) => {
    app
      .db("users")
      .where(req.params)
      .select("id", "name", "email", "admin")
      .first()
      .then((user) => res.json(user))
      .catch((err) => res.status(500).send(err));
  };
  const remove = async (req, res) => {
    try {
      const articles = await app
        .db("articles")
        .where({ userId: req.params.id });
      notExistsOrError(articles, "user tem artigos armazenados");

      const rowsUpdated = await app
        .db("users")
        .update({ deletedAt: new Date() })
        .where({ id: req.params.id });
      existsOrError(rowsUpdated, "user não foi encontrado");
      res.status(204).send();
    } catch (error) {
      res.status(400).send(error);
    }
  };
  return { save, get, getSingle, remove };
};
