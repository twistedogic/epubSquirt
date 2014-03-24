var fs = require('fs');
var cheerio = require('cheerio');
    
if(!process.argv[2]) {
  throw "You must supply a path to a valid EPUB file!";
}

var inject = fs.readFileSync(__dirname + '/spritzBtn.html', 'utf8');
console.log(inject);
fs.readFile(process.argv[2], function (err, data) {
  if (err) throw err;
  $ = cheerio.load(data);
  $('body').prepend(inject);
  console.log($.html())
});