var express = require('express');
var app = express(),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
	cors = require('cors'),
	https = require("https"),
    config = require('./server/config.server'),
    nunjucks = require('nunjucks');
    const multer = require('multer')
    // const upload = multer(),
    fs = require('fs'),
    Storage = multer.diskStorage({
		destination: function (req, file, callback) {
          
            callback(null, path.join(process.env.PWD, 'uploads'));
           
        },
      
		filename: function (req, file, callback) {
            // console.log("File", file)
			callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
		}
	}),
	upload = multer({
		storage: Storage
    }),
    models = require('./server/oauth/models'),
    dir = path.join(process.env.PWD, 'server/uploads'),
            // path.join(process.env.PWD,'server/videoUploads')
console.log("url",config.serverUrl);

require('./server/oauth/cron-job')

require('./server/oauth/models');
app.set('views', path.join(__dirname, 'server/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

const routes = require('./server/oauth/routes');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(upload.any());
// app.use(upload.single());


app.use(cookieParser());
app.use(express.static(__dirname + '/public/src'))
app.use(express.static(__dirname + '/uploads'));
app.use(express.static(__dirname + '/videoUploads'));
app.use(express.static(path.join(process.env.PWD, 'public')));

// Allow CORS
app.use(cors({
    'origin': "*",
    'exposedHeaders': ['X-Requested-With', 'content-type', 'Authorization'],
    'credentials': true
}))
app.use(passport.initialize());
app.use(passport.session());

nunjucks.configure('server/views', {
    autoescape: true,
    express: app
});
const fixtures = require('./server/fixtures')
fixtures.userFixture.fixtureUser();

app.use('/', routes.users);
app.use('/', routes.userPassword);


app.get('/', function (err, res) {
    res.send("Hello There")
})


app.listen(3000, () => {
    console.log("server started on 3000");
})
