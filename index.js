var fs = require('fs'),
    cheerio = require('cheerio'),
    converter = require('epub2html'),
    cacher = require('epub-cache');
var express = require('express'),
    app = express();
app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use('/public', express.static(__dirname + '/public'));
    app.use(app.router);    
});

if(!process.argv[2]) {
  throw "You must supply a path to a valid EPUB file!";
}

// 1. init the cache

cacher.init({

	cacheDir: __dirname + '/public',
	idLimit: 100

});

console.log('clearing cache...');

try {
	cacher.clear();
	console.log('SUCCESS: cleared');
} catch(e) {
	console.log('ERROR clearing cache');
}

// 2. cache epub contents and get a cache id back

var epubfile = process.argv[2] || './testbook.epub';

if(typeof epubfile === 'undefined') throw "You must provide an epub filename.";
var cacheId = (new Date()).getTime();
cacher.cache(epubfile, cacheId, function (err, cacheId, bundle) {

	if(err) throw err;

	console.log('cached epub file '+epubfile+'. cacheId is '+cacheId);

	// 3. see if the cacheId exists

	console.log('testing the cacher.has() method... should find in cache');

	if(cacher.has(cacheId)) {

		console.log('SUCCESS: found cached id '+cacheId+' in cache');

	}


});

console.log('testing to see if we pull from cache the second time...');

cacher.cache(epubfile, cacheId, function (err, cacheId, bundle) {

	if(err) throw err;

	console.log('cached epub file '+epubfile+'. cacheId is '+cacheId);


});
var htmlData;
converter.parse(process.argv[2], function (err, epubData) {
	
	htmlData = converter.convertMetadata(epubData);
	//console.log(htmlData);

});

var inject = fs.readFileSync(__dirname + '/button.html', 'utf8');

app.get('/', function(req, res){
//   res.send('index.html', {root: __dirname + '/public/' + cacheId + '/OEBPS'});
    res.send(htmlData.htmlNav);
    console.log('home');
});

app.get('/OEBPS/:file', function(req, res){
    var file = req.params.file;
    if (file.split('.')[1] == 'html'){
        fs.readFile(__dirname + '/public/' + cacheId + '/OEBPS/' + file, function (err, data) {
            if (err) throw err;
            $ = cheerio.load(data);
            $('body').prepend(inject);
            res.send($.html());
	    console.log('Spritz!');
        });
    } else {
        res.sendfile(file, {root: __dirname + '/public/' + cacheId + '/OEBPS'});
    }
    
});

app.listen(3000);
