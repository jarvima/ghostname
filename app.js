var groupData = require('./lib/group-data');

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 8080));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

function setHeaders(request, response, next) {
  response.set('Content-Type', 'application/json');

  next();
}

app.get('/', function(request, response) {
  response.render('index');
});

app.post('/create-group', setHeaders, function(request, response) {
  groupData.createGroup(request, response);
});

app.post('/join-group', setHeaders, function(request, response) {
  groupData.joinGroup(request, response);
});

app.get('/group-info/:groupName/:time', setHeaders, function(request, response) {
  groupData.getGroupInfo(request, response);
});

app.post('/add-name', setHeaders, function(request, response) {
  groupData.addName(request, response);
});

app.post('/start-reading', setHeaders, function(request, response) {
  groupData.startReading(request, response);
});

app.post('/start-guessing', setHeaders, function(request, response) {
  groupData.startGuessing(request, response);
});

app.post('/restart', setHeaders, function(request, response) {
  groupData.restart(request, response);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
