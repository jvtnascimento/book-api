const Book = require('../models/book');
const routeMiddleware = require('../middlewares/route');

const cheerio = require('cheerio');
const axios = require('axios');

const express = require('express');
const router = express.Router();

var settings = {
	name: 'books'
};

async function getISBN (book) {
  try {
  	const response = await axios.get(book.url);
    const $ = cheerio.load(response.data);

    var bodyString = $('body').first().html();

	// página possui muitos isbns, é necessário filtrar
    if (book.url.indexOf('packtpub') !== -1) { 
		bodyString = $('.book-info-isbn13').html();
	}
    
    var index = bodyString.indexOf('978') || bodyString.indexOf('979');
	if (index !== -1) {
		
		// 9781617293290 ou 978-1617293290
		var isbn = bodyString.slice(index, index + 14) 
			.replace(/[^0-9\.]+/g, '')
			.match(/^(97(8|9))?\-?\d{9}(\d|X)$/g);
			
		if (isbn && (isbn[0].length == 13 || isbn[0].length == 10))
			book.isbn = isbn[0];
	}

  	return book;
  
  } catch (error) {
    console.error(error + " - " + book.url);
  }
}

router
    .get('/v1/' + settings.name , async (req, res, next) => {
        try {

        	const response = await axios.get('https://kotlinlang.org/docs/books.html');
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
    				
					promises.push(getISBN(book));
				}
			});

			var books = await Promise.all(promises);
			var numberBooks = books.length;

			return res.status(200).json({ numberBooks: numberBooks, books: books });

        } catch (err) {
        	console.log(err);
            return res.status(400).send({ message: 'Erro ao buscar livros' });
        }
    })

    .get('/v1/'+ settings.name + '/:id', async (req, res) => {
        try {
            const model = await Book.findById(req.params.id);
            return res.status(200).json(model);
        } catch (err) {
        	console.log(err)
            return res.status(400).send({ message: 'Erro ao buscar livro' });
        }
    })

    .post('/v1/' + settings.name, 
		routeMiddleware.validateIfNotNullAndUndefined('body.title', { message: "É necessário informar o Título" }),
		routeMiddleware.validateIfNotNullAndUndefined('body.description', { message: "É necessário informar a Descrição" }),
		routeMiddleware.validateIfNotNullAndUndefined('body.isbn', { message: "É necessário informar o ISBN" }),
		routeMiddleware.validateIsbn('body.isbn', { message: "Informe um ISBN válido" }),
		routeMiddleware.validateIfNotNullAndUndefined('body.language', { message: "É necessário informar o Idioma" }),
		async (req, res) => {
			try {
				const { title, description, isbn, language } = req.body;
				
				const model = await Book.create({ 
					title, 
					description, 
					isbn,
					language
				});

				return res.status(200).json(model);
					
			} catch (err) {
				console.log(err);
				return res.status(400).send({ message: 'Erro ao cadastrar livro' });
			}
	});

module.exports = app => app.use('/', router);