var bodyParser = require("body-parser");

module.exports  = function(app) {

    app.get("/help", function(req, res) {
        console.log("this page should be avialble to all members logged in... watch for that");
        res.render("help");
    })

};
