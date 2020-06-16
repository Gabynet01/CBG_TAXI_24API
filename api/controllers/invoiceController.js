'use strict';

var successCode = "200";
var errorCode = "204";

var db = require('../models/model'); //created model loading here

/**
 * List all Invoices
 * Request - GET
 * no params 
 */
exports.list_all_invoices = function (req, res) {
    var sql = "select * from invoices"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "code": successCode,
            "message": "success",
            "data": rows
        })
    });
};
