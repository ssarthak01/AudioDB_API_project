
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


//Create Database Connection
var pgp = require('pg-promise')();

const axios = require('axios');
const qs = require('query-string');

const dev_dbConfig = {
	host: 'db',
	port: 5432,
	database: process.env.POSTGRES_DB,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD
};

const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

if (isProduction) {
	pgp.pg.defaults.ssl = { rejectUnauthorized: false };
}

const db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/'));

//APIS//
app.get('/', function (req, res) {
	res.render('pages/main', {
		my_title: "Home Page",
		data: '',
		error: false,
		message: "",
		local_css: "my_style.css"
	});
});

// app.get('/main', function (req, res) {
// 	res.render('pages/reviews', {
// 		local_css: "my_style.css",
// 		my_title: "Reviews Page"
// 	});
// });

//reviews page
app.get('/reviews', function (req, res) {

	var select = "SELECT * from artist_reviews;";
	db.task('get-everything', task => {
		return task.batch([
			task.any(select)
		]);
	})
		.then(info => {
			//console.log("WHAT IS IN INFO " + info[1][0] + " ,TEST:" + info[1][0].artist);
			res.render('pages/reviews', {
				my_title: 'Reviews',
				data: info[0],
				error: false,
				message: "",
				local_css: "my_style.css"
			})
		})
		.catch(err => {
			console.log('error', err);
			res.render('pages/reviews', {
				my_title: 'Reviews',
				data: '',
				error: true,
				message: "Error",
				local_css: "my_style.css"
			})
		});
});

app.post('/get_artist', function (req, res) {
	console.log(req.body.name_input);
	var name = req.body.name_input;

	if (name) {
		//console.log("hit");
		axios({
			url: `https://theaudiodb.com/api/v1/json/1/search.php?s=${name}`,
			method: 'GET',
			dataType: 'json',
		})
			.then(info => {
				//console.log("test 1: " + info.data.artists[0]);
				//console.log("test 2: " + info.data.artists[0].strArtistBanner + " url:" + info.data.artists[0].strWebsite);
				//console.log("test 3: " + info.data.artists.strArtistBanner);
				res.render('pages/main', {
					my_title: "Home",
					data: info.data.artists[0],
					error: false,
					message: "Loaded",
					local_css: "my_style.css"
				})
			})
			.catch(error => {
				console.log('ErRor: ' + error);
				res.render('pages/main', {
					my_title: "Home",
					data: '',
					error: true,
					message: 'Fail to pull info because artist does not exist. Try with different artist name.',
					local_css: "my_style.css"
				})
			});
	}
	else {
		res.render('pages/main', {
			my_title: "Home",
			data: '',
			error: true,
			message: 'ERROR',
			local_css: "my_style.css"
		})
	}
});

app.post('/main/push_review', function (req, res) {
	var review_text = req.body.review_text;
	var artist_name = req.body.locked_artist_name;


	var insert_statement = "INSERT INTO artist_reviews(artist, review, review_date) VALUES('" + artist_name + "','" + review_text + "', now());";
	var select = "SELECT * from artist_reviews;";

	db.task('get-everything', task => {
		return task.batch([
			task.any(insert_statement),
			task.any(select)
		]);
	})
		.then(info => {
			//console.log("WHAT IS IN INFO " + info[1][0] + " ,TEST:" + info[1][0].artist);
			res.render('pages/reviews', {
				my_title: 'Reviews',
				data: info[1],
				error: false,
				message: "",
				local_css: "my_style.css"
			})
		})
		.catch(err => {
			console.log('error', err);
			res.render('pages/reviews', {
				my_title: 'Reviews',
				data: '',
				error: true,
				message: "Couldn't push into db",
				local_css: "my_style.css"
			})
		});
});

app.post('/get_artist_reviews', function (req, res) {
	var name = req.body.search_review;
	var select = 'SELECT * from artist_reviews;';
	var query = "SELECT * from artist_reviews WHERE UPPER(artist) LIKE UPPER('%" + name + "%');";

	if (name) {
		db.task('get-everything', task => {
			return task.batch([
				task.any(query),
				task.any(select)
			]);
		})
			.then(info => {
				console.log(info[0]);
				console.log(info[1]);
				if (info[0][0]) {
					res.render('pages/reviews', {
						my_title: "Reviews",
						data: info[0],
						error: false,
						message: "Loaded",
						local_css: "my_style.css"
					})
				}
				else {
					res.render('pages/reviews', {
						my_title: "Reviews",
						data: info[1],
						error: false,
						message: "Loaded",
						local_css: "my_style.css"
					})
				}

			})
			.catch(error => {
				console.log('ErRor: ' + error);
				res.render('pages/main', {
					my_title: "Home",
					data: '',
					error: true,
					message: 'Fail to pull info',
					local_css: "my_style.css"
				})
			});
	}
});



//Use for Testing
//module.exports = app.listen(3000);

//app.listen(3000);
const server = app.listen(process.env.PORT || 3000, () => {
	console.log(`Express running → PORT ${server.address().port}`);
  });

console.log('3000 is actually the magicest port');
