const pgp = require('pg-promise')({
  error: (err, e) => {
    err.eventContext = e
  }
})

const config = {
  connectionString: 'postgres://postgres:admin123@localhost:5432/Innoppl-Assignment',
  max: 30,
  ssl: false
}

const db = pgp(config)
const pgpHelpers = pgp.helpers
pgp.pg.types.setTypeParser(20, parseInt);
module.exports = {
  db, pgpHelpers
}
