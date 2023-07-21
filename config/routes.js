const admin = require("./admin");

module.exports = (app) => {
  app.post("/signup", app.api.user.save);
  app.post("/singin", app.api.auth.singin);
  app.post("/validadeteToken", app.api.auth.validatorToken);

  app
    .route("/users")
    .all(app.config.passport.authenticate())
    .post(admin(app.api.user.save))
    .get(admin(app.api.user.get));
  app
    .route("/users/:id")
    .all(app.config.passport.authenticate())
    .patch(admin(app.api.user.save))
    .get(admin(app.api.user.getSingle))
    .delete(admin(app.api.user.remove));
  app
    .route("/categories")
    .all(app.config.passport.authenticate())
    .get(admin(app.api.categories.get))
    .post(admin(app.api.categories.save));
  app.route("/categories/tree").get(app.api.categories.getTree);
  app
    .route("/categories/:id")
    .all(app.config.passport.authenticate())
    .get(app.api.categories.getSingle)
    .patch(admin(app.api.categories.save))
    .delete(admin(app.api.categories.remove));

  app
    .route("/articles")
    .all(app.config.passport.authenticate())
    .get(admin(app.api.articles.get))
    .post(admin(app.api.articles.save));
  app
    .route("/articles/:id")
    .all(app.config.passport.authenticate())
    .delete(admin(app.api.articles.remove))
    .get(app.api.articles.getSingle)
    .patch(admin(app.api.articles.save));

  app
    .route("/categories/:id/articles")
    .all(app.config.passport.authenticate())
    .get(app.api.articles.getByCategory);

  app
    .route("/stats")
    .all(app.config.passport.authenticate())
    .get(app.api.stat.get);
};
