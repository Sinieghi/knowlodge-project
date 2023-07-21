exports.up = async function (knex) {
  await knex.schema.table("users", (table) => {
    table.string("deletedAt", 128);
  });
};

exports.down = async function (knex, Promise) {
  await knex.schema.table("users", (table) => {
    table.dropColumn("deletedAt");
  });
};
