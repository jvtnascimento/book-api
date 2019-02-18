require('dotenv').config();
var mongoose = require('mongoose');
ObjectId = require('mongodb').ObjectID;

var _ = require('lodash');

function parseJSON(json) {
    Object.keys(json).forEach( key => {
        var value = json[key];

        if (typeof value === 'string' && /^[\],:{}\s]*$/.test(value.replace(/\\["\\\/bfnrtu]/g, '@').
                    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                    replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
            json[key] = JSON.parse(value);
        }
        else if (mongoose.Types.ObjectId.isValid(value)) {
            json[key] = ObjectId(value);
        }
    });  

    return json;
}

async function executeQuery(schema, destiny, options, req, res, next) {
    options = options || {};

    var map = _.get(req, "search", {});
    var filteredMap = _.omit(map, ['sort', 'limit', 'page']);
    var conditions = parseJSON(filteredMap);
    
    var query = schema.find(conditions);
    
    var sort = _.get(map, "sort");
    if (sort) {    
        var json = JSON.parse(sort);
        query.sort(json) 
    }
    
    query
        .then(function(items) {
            if (destiny) {
                _.set(req, destiny, items);
                next();
            }
            else {
                res.json(items);
            }
        }, next)
}

var RouteMiddleware = {
	decodeQueryStringToJSON: function(path) {
        return (req, res, next) => {
            req[path] = req.query;
            next();
        }
	},

	executeQuery: function(schema, destiny, options) {
        return function(req, res, next) {
            executeQuery(schema, destiny, options, req, res, next);
        }
    },

    findModelById: function(idPath, destiny, schema, options) {
        return function(req, res, next) {
            options = options || {};
            
            var modelId = _.get(req, idPath);
            var query = schema.findById(modelId)
                .then(function(model) {
                    if (!model) {
                       res.status(400).json({ message: options.message || "Não foi possível localizar o registro" });
                    }
                    else {
                        _.set(req, destiny, model);
                        next();
                    }
                }, next);
        }
    },

    sendMessageWithCode: function(statusCode, message) {
        return function(req, res, next) {
            res.status(statusCode).json({ message: message });
        }
    },

    sendModelWithSuccess: function(model) {
        return function(req, res, next) {
            res.status(200).json(_.get(req, model));
        }
    },

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

    validateIfModelExists: function(modelPath, schema, options) {
        return async function(req, res, next) {
            try {
                options = options || {};

                var model = _.get(req, modelPath);
                var foundModel = await schema.findById(model._id);
                if (!foundModel) {
                    res.status(400).json({ message: options.message || "O model informado não foi encontrada no sistema" });
                }
                else {
                    next();
                }
            } catch (err) {
                console.log(err)
                return res.status(400).json({ message: "Erro ao validar se cidade informada existe no sistema" });
            }
        }
    }
};

module.exports = RouteMiddleware;