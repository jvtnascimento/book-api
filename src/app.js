const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

require('./app/controllers/index')(app);

app.listen(3001, function() {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
