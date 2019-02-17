const Book = require('../models/book');
const routeMiddleware = require('../middlewares/route');
const cheerio = require('cheerio');
var rp = require('request-promise');
const request = require('request');

const express = require('express');
const router = express.Router();

var settings = {
	name: 'books'
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

var options = {
    uri: 'https://kotlinlang.org/docs/books.html',
    transform: function (body) {
        return cheerio.load(body);
    }
};

router
    .get('/v1/' + settings.name , async (req, res, next) => {
        try {

        	var ret = {
        		numberBooks: 0,
        		books: []
        	};

        	var $ = await rp(options);
    		const pageContent = $('.page-content');

    		ret["numberBooks"] = pageContent.find('h2').length;
			
			const stringHtmlSections = pageContent.html().split("<h2");

			await asyncForEach(stringHtmlSections, async (section) => {
				$ = cheerio.load('<h2' + section);

    			const title = $('h2').text();
    			var isbn = "unavailable"
    			const language = $('.book-lang').text();
    			const bookUrl = $("a").attr('href')
    			
    			const descriptions = [];
    		 	$('p').each(function(i, elem) {
					descriptions[i] = $(this).text();
				});

				const description = descriptions.join(' ')
					.replace(/  +/g, ' ')
					.replace(/\n|\r/g, '');

				if (bookUrl) {

					var book = {
	    				title: title,
	    			 	description: description,
	    			 	isbn: isbn,
	    			 	language: language, 
	    			 	url: bookUrl
    				};

    				ret.books.push(book);
				}
			});


			return res.status(200).json(ret);

        } catch (err) {
        	console.log(err)
            return res.status(400).send({ message: 'Erro ao buscar livros' });
        }
    })

    .get('/v1/'+ settings.name + '/:id', async (req, res) => {
        try {
            const model = await Book.findById(req.params.id);
            return res.status(200).json(model);
        } catch (err) {
            return res.status(400).send({ message: 'Erro ao buscar livro' });
        }
    })

    .post('/v1/' + settings.name, 
		routeMiddleware.validateIfNotNullAndUndefined('body.title', {message: "É necessário informar o Título"}),
		routeMiddleware.validateIfNotNullAndUndefined('body.description', {message: "É necessário informar a Descrição"}),
		routeMiddleware.validateIfNotNullAndUndefined('body.isbn', {message: "É necessário informar o ISBN"}),
		routeMiddleware.validateIfNotNullAndUndefined('body.language', {message: "É necessário informar o Idioma "}),
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