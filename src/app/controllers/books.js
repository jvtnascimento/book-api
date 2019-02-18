const Book = require('../models/book');
const CrawlerService = require('../services/crawler');
const routeMiddleware = require('../middlewares/route');
const express = require('express');
const router = express.Router();

const settings = {
	routeName: 'books'
};

router
    .get('/v1/' + settings.routeName , async (req, res, next) => {
        try {

        	const promises = await CrawlerService.getBooks();
			const books = await Promise.all(promises);
			const numberBooks = books.length;

			return res.status(200).json({ numberBooks: numberBooks, books: books });

        } catch (err) {
        	console.log(err);
            return res.status(400).send({ message: 'Erro ao buscar livros' });
        }
    })

    .get('/v1/'+ settings.routeName + '/:id', async (req, res) => {
        try {
            const model = await Book.findById(req.params.id);
            return res.status(200).json(model);
        } catch (err) {
        	console.log(err)
            return res.status(400).send({ message: 'Erro ao buscar livro' });
        }
    })

    .post('/v1/' + settings.routeName, 
		routeMiddleware.validateIfNotNullAndUndefined('body.title', { message: "É necessário informar o Título" }),
		routeMiddleware.validateIfNotNullAndUndefined('body.description', { message: "É necessário informar a Descrição" }),
		routeMiddleware.validateIfNotNullAndUndefined('body.isbn', { message: "É necessário informar o ISBN" }),
		routeMiddleware.validateIsbn('body.isbn', { message: "Informe um ISBN válido" }),
		routeMiddleware.validadeIfIsbnIsAlreadyInUse('body.isbn', Book, { message: "O ISBN informado já está sendo utilizado em outro registro" }),
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