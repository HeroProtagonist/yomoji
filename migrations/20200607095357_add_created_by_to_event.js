
exports.up = function(knex) {
  return knex.schema.table('event', function(t) {
    t.string('created_by').notNull().defaultTo('application')
  })
};

exports.down = function(knex) {
  return knex.schema.table('event', function(t) {
    t.dropColumn('created_by')
  })
};
