const {
  existsOrError,
  notExistsOrError,
  equalsOrError,
} = require("./validation");

module.exports = (app) => {
  const save = (req, res) => {
    const category = { ...req.body };
    if (req.params.id) category.id = req.params.id;
    try {
      existsOrError(category.name, "nome não informado");
    } catch (msg) {
      return res.status(400).sent(msg);
    }
    if (category.id) {
      app
        .db("categories")
        .update(category)
        .where({ id: category.id })
        .then((_) => res.status(204).send())
        .catch((err) => res.status(500).send(err));
    } else {
      app
        .db("categories")
        .insert(category)
        .then((_) => res.status(204).send())
        .catch((err) => res.status(500).send(err));
    }
  };
  const remove = async (req, res) => {
    try {
      existsOrError(req.params.id, "código de categoria não informado");

      const subcategory = await app
        .db("categories")
        .where({ parentId: req.params.id });
      notExistsOrError(subcategory, "categoria possui subcategorias");
      const article = await app
        .db("articles")
        .where({ categoryId: req.params.id });
      notExistsOrError(article, "categorias possui artigos");
      const rowsDeleted = await app
        .db("categories")
        .where({ id: req.params.id })
        .del();
      existsOrError(rowsDeleted, "catregoria não foi encontrada");
      res.status(204).send();
    } catch (msg) {
      res.status(400).send(msg);
    }
  };
  const withPath = (categories) => {
    const getParent = (categories, parentId) => {
      let parent = categories.filter((parent) => parent.id === parentId);
      return parent.length ? parent[0] : null;
    };
    const categoriesWithPath = categories.map((category) => {
      let path = category.name;
      let parent = getParent(categories, category.parentId);

      while (parent) {
        path = `${parent.name} > ${path}`;
        parent = getParent(categories, parent.parentId);
      }
      return { ...category, path };
    });
    categoriesWithPath.sort((a, b) => {
      if (a.path < b.path) return -1;
      if (a.path > b.path) return 1;
      return 0;
    });
    return categoriesWithPath;
  };
  const get = (req, res) => {
    app
      .db("categories")
      .then((categories) => res.json(withPath(categories)))
      .catch((err) => res.status(500).send(err));
  };
  const getSingle = (req, res) => {
    app
      .db("categories")
      .where({ id: req.params.id })
      .first()
      .then((category) => res.json(category))
      .catch((err) => res.status(500).send(err));
  };
  const toTree = (categories, tree) => {
    if (!tree) tree = categories.filter((c) => !c.parentId);
    tree = tree.map((parentNode) => {
      const isChield = (node) => node.parentId == parentNode.id;
      parentNode.children = toTree(categories, categories.filter(isChield));
      return parentNode;
    });
    return tree;
  };
  const getTree = (req, res) => {
    app
      .db("categories")
      .then((categories) => res.json(toTree(withPath(categories))))
      .catch((err) => res.status(500).send(err));
  };
  return { save, remove, get, getSingle, getTree };
};
