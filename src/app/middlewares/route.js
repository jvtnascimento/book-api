var _ = require('lodash');

var RouteMiddleware = {

    validateIfNotNullAndUndefined: function(valuePath, options) {
        return function(req, res, next) {
            options = options || {};
            var value = _.get(req, valuePath);
            if (value === null || value === undefined) {
                res.status(400).json({ message: options.message || "Informe os dados corretamente" });
            }
            else if (typeof value === 'string' && value.trim() === "") {
                res.status(400).json({ message: options.message || "Informe os dados corretamente" });
            }
            else {
                next();
            }
        }
    },

    validateIsbn: function(valuePath, options) {
        return function(req, res, next) {
            options = options || {};
            var value = _.get(req, valuePath);

            var isbn = value.toString().match(/^(97(8|9))?\d{9}(\d|X)$/g);
            if (isbn && (isbn[0].length == 13)) {
                next();
            } else {
                res.status(400).json({ message: options.message || "Informe os dados corretamente" });
            }
        }
    },

    validadeIfIsbnIsAlreadyInUse: function(valuePath, modelClass, options) {
        return async (req, res, next) => {
            try {
                options = options || {};
                var value = _.get(req, valuePath);

                var model = await modelClass.findOne({isbn: value});
                if (model) {
                    res.status(400).json({ message: options.message || "O model informado não foi encontrada no sistema" });
                } else {
                    next();
                }

            } catch (err) {
                console.log(err)
                return res.status(400).json({ message: "Erro ao validar se ISBN já está em uso." });
            }
        }
    }
};

module.exports = RouteMiddleware;