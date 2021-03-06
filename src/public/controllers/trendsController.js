var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: false});
var index = require(__dirname + '/../../index');
var genController = require(__dirname + '/generateController');
var templatesDb = index.templatesDb;

// generate json based on the trends data that we get back
function generateJson (docs, cb) {
    var res = [];
    // organise the months, with the options, clients and services
    for (let i in docs) {
        let month = docs[i]['month'];
        let entries = docs[i]['entries'];
        res.push({'month': month, 'clients': entries.length, 'services': 0});
        // count how many services were performed
        for (let j in entries) {
            let entry = entries[j];

            if (typeof entry['SUPPORT SERVICES RECEIVED'] !== 'undefined'
                && entry['SUPPORT SERVICES RECEIVED'] === 'YES') {
                res[i]['services']++;
            }
        }

        // get report object for month and stuff it into the trends object
        genController.reportObj(entries, function(response) {
            res[i]['data'] = response;
            if (i == docs.length - 1) {
                res.sort((a, b) => parseInt(a.month.replace('-', '')) - parseInt(b.month.replace('-', '')));
                cb(res);
            }
        });
    }
}

module.exports = function (app) {
    app.get('/trends', function (req, res) {
        res.render('trends');
    });

    app.get('/trends-graph', function (req, res) {
        res.render('trends-graph');
    });

    app.post('/generate-trends', urlencodedParser, function (req, res) {
        templatesDb.find({template: req.body.template}, function (err, docs) {
            if (err) {
                res.send(500);
            } else {
                if (docs.length !== 0) {
                    generateJson(docs, function (response) {
                        res.status(200);
                        res.json(response);
                    });
                } else {
                    res.status(200);
                    res.json({});
                }
            }
        });
    });
}