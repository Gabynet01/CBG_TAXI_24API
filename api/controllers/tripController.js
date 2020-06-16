'use strict';

var successCode = "200";
var errorCode = "204";

var db = require('../models/model'); //created model loading here

/**
 * List all trips
 * Request - GET
 * no params 
 */
exports.list_all_trips = function (req, res) {
    var sql = "select * from trips"
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

/**
 * update trip status of rider by driver (START OR END TRIP)
 * This happens when the driver starts or ends the trip 
 * Request - PATCH
 * params {driverid, riderid}
 */
exports.update_trip_status = function (req, res) {
    // check if the trip status values params are either STARTED or ENDED
    var trip = req.body.status.toUpperCase();
    console.log("trip", trip)
    if (trip !== "STARTED" && trip !== "ENDED") {
        res.status(400).json({ "error": "Only STARTED or ENDED are allowed" });
        return;
    }

    var driverStatus;
    var sql;
    var sqlInvoice;

    if (trip == "STARTED") {
        driverStatus = "TRUE";
        // set SQL query based on trip status
        sql = "select * from drivers where id = ? AND assignedRider = ? AND status = 'FALSE' "
    }

    if (trip == "ENDED") {
        driverStatus = "FALSE";
        sql = "select * from drivers where id = ? AND assignedRider = ? AND status = 'TRUE' "
    }


    // procceeeddd
    var data = {
        tripStatus: req.body.status.toUpperCase(),
    }


    var params = [req.params.driverId, req.params.riderId]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // check if driver is the correct user assigned to the rider and if the status is false
        if (row == undefined) {
            res.json({
                "error": errorCode,
                "message": "Request not found or driver is already engaged",

            })
            return;
        }

        // update the rider trip status
        else {

            db.run(
                `UPDATE riders set 
                   tripStatus = COALESCE(?,tripStatus)
                   WHERE id = ?`,
                [data.tripStatus, req.params.riderId],
                function (err, result) {
                    if (err) {
                        res.status(400).json({ "error": res.message })
                        return;
                    }

                    // UPDATE Driver availability status
                    db.run(
                        `UPDATE drivers set 
                           status = COALESCE(?,status)
                           WHERE id = ?`,
                        [driverStatus, req.params.driverId],
                        function (err, result) {
                            if (err) {
                                res.status(400).json({ "error": res.message })
                                return;
                            }

                            // update the trip table status
                            db.run(
                                `UPDATE trips set 
                                   status = COALESCE(?,status)
                                   WHERE rider = ?
                                   AND driver = ?`,
                                [data.tripStatus, req.params.riderId, req.params.driverId],
                                function (err, result) {
                                    if (err) {
                                        res.status(400).json({ "error": res.message })
                                        return;
                                    }

                                    //dont update the invoice table with the amount
                                    if (trip == "STARTED") {


                                        res.json({
                                            message: "success",
                                            data: data,
                                            changes: this.changes
                                        })


                                    }

                                    // update the invoice table with the amount
                                    else if (trip == "ENDED") {
                                        db.run(
                                            `UPDATE invoices set 
                                        tripStatus = COALESCE(?,tripStatus),
                                        amount = COALESCE(?,amount)
                                        WHERE rider = ?
                                        AND driver = ?`,
                                            [data.tripStatus, "50", req.params.riderId, req.params.driverId],
                                            function (err, result) {
                                                if (err) {
                                                    console.log("errrooor1111", err)
                                                    res.status(400).json({ "error": res.message })
                                                    return;
                                                }

                                                // let get the invoice info and send it to the user

                                                var sqlInvoice = "select * from invoices WHERE rider = ? AND driver = ? "
                                                var params = [req.params.riderId, req.params.driverId]
                                                db.get(sqlInvoice, params, (err, row) => {
                                                    if (err) {
                                                        console.log("errrooor2222", err)
                                                        res.status(400).json({ "error": err.message });
                                                        return;
                                                    }
                                                    res.json({
                                                        "code": successCode,
                                                        "message": "Your trip has ended",
                                                        "invoiceInfo": row,
                                                        changes: this.changes
                                                    })
                                                });


                                            });
                                    }
                                });
                        });

                });

        }
    });


};

/**
 * Check trip status by status (STARTED OR ENDED)
 * REQUEST (POST)
 */
exports.check_trip_status = function (req, res) {
    var trip = req.body.status.toUpperCase();
    if (trip !== "STARTED" && trip !== "ENDED") {
        res.status(400).json({ "error": "Only STARTED or ENDED are allowed" });
        return;
    }

    // create an array of errors to return
    var errors = []
    if (!req.body.status) {
        errors.push("specify either STARTED or ENDED");
    }
    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }

    var sql = "select * from trips where status = ?"
    var params = [req.body.status.toUpperCase()]
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