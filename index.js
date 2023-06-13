const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const helmet = require('helmet')
const api = require('./src/api')
const cors = require('cors');

app.set('port', 5000)
app.use(bodyParser.json({ limit: ('10mb') }))
app.use(helmet())
app.use(cors());

app.use('/api', api())
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})

module.exports = app 