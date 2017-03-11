exports.up = function(knex, Promise) {
  return knex.schema.createTable('favorites', (table) => {
    table.increments('id').primary();
    table.integer('book_id').notNullable().references('id').inTable('books').onDelete('cascade');
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('cascade');
    table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('favorites');
};
