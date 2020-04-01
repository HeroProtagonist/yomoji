exports.up = function(knex) {
    return knex.schema.table('user_event', function(t) {
        t.integer('amount').notNull().defaultTo(1)
    })
}

exports.down = function(knex) {
    return knex.schema.table('user_event', function(t) {
        t.dropColumn('amount')
    })
}
