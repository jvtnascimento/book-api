
const cheerio = require('cheerio');
const axios = require('axios');

const settings = {
	mainUrl: 'https://kotlinlang.org/docs/books.html'
};

async function getISBN (book, url) {
  try {
  	const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    var bodyString = $('body').first().html();

	// página possui muitos isbns, é necessário filtrar
    if (url.indexOf('packtpub') !== -1) { 
		bodyString = $('.book-info-isbn13').html();
	}
    
    var index = bodyString.indexOf('978') || bodyString.indexOf('979');
	if (index !== -1) {
		
		// 9781617293290 ou 978-1617293290
		var isbn = bodyString.slice(index, index + 14);

		//caso faça parte de script
		if (isbn.indexOf(';') === -1) {
			var treatedIsbn = isbn.replace(/[^0-9\.]+/g, '')
				.match(/^(97(8|9))?\-?\d{9}(\d|X)$/g);

			if (treatedIsbn && (treatedIsbn[0].length == 13 || treatedIsbn[0].length == 10))
				book.isbn = treatedIsbn[0];
		}
	}

  	return book;
  
  } catch (error) {
  	console.error(error + " - " + url);
  }
}

var BookService = {
	
	getBooks: async function() {
		const response = await axios.get(settings.mainUrl);
		var $ = cheerio.load(response.data);
		
		const pageContent = $('.page-content');
		const splitedHtml = pageContent.html().split("<h2");
		
		var promises = [];
		splitedHtml.forEach(section => {
			$ = cheerio.load('<h2' + section);

			const title = $('h2').text();
			const language = $('.book-lang').text();
			const bookUrl = $("a").attr('href');
			
			var descriptions = [];
		 	$('p').each(function(i, elem) {
				descriptions.push($(this).text());
			});

			const description = descriptions.join(' ')
				.replace(/  +/g, ' ')
				.replace(/\n|\r/g, '');

			if (title && description && language && bookUrl) {
				var book = {
					title: title,
				 	description: description,
				 	isbn: "unavailable",
				 	language: language,
				 	url: bookUrl
				};
				
				promises.push(getISBN(book, bookUrl));
			}
		});

		return promises;
	}

};

module.exports = BookService;

