'use strict';

var successCode = "200";
var errorCode = "204";
var db = require('../models/model'); //created model loading here

/**
 * GET ALL RIDERS
 * Request - GET
 * no params
 */
exports.list_all_riders = function (req, res) {
    var sql = "select * from riders"
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
 * Create a rider
 * Request - Post
 * params - {riderInfo}
 */
exports.create_a_rider = function (req, res) {
    // create an array of errors to return
    var errors = []
    if (!req.body.name) {
        errors.push("No name specified");
    }
    if (!req.body.email) {
        errors.push("No email specified");
    }
    if (!req.body.mobileNo) {
        errors.push("No mobile no specified");
    }
    if (!req.body.location) {
        errors.push("No location specified");
    }
    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        mobileNo: req.body.mobileNo,
        location: req.body.location,
    }
    var sql = 'INSERT INTO riders (name, email, mobileNo, location) VALUES (?,?,?,?)'
    var params = [data.name, data.email, data.mobileNo, data.location]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message })
            return;
        }
        res.json({
            "code": successCode,
            "message": "success",
            "data": data,
            "id": this.lastID
        })
    });
};

/**
 * Get a rider by id
 * Request - GET
 * params - {id}
 */
exports.read_a_rider = function (req, res) {
    var sql = "select * from riders where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "code": successCode,
            "message": "success",
            "data": row
        })
    });
};

/**
 * This happens when a rider search for their destination
 * Calculations is done here and shown to the rider
 * Then the rider goes on to confirm and finally a driver is assigned
 * Request - PATCH
 * param - {driver, location} ? riderId
 */
exports.assign_a_driver = function (req, res) {
    var data = {
        assignedDriver: req.body.assignedDriver,
        location: req.body.location
    }

    // if no error proceed to read the driver details
    var sql = "select * from drivers where id = ? AND status = 'FALSE'"

    var params = [data.assignedDriver]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // check if driver is engaged or does not existF
        if (row == undefined) {
            res.json({
                "error": errorCode,
                "message": "Driver is already engaged or does not exist",

            })
            return;
        }

        // assign the driver to the rider
        else {
            db.run(
                `UPDATE riders set 
                assignedDriver = COALESCE(?,assignedDriver)
                   WHERE id = ?`,
                [data.assignedDriver, req.params.id],
                function (err, result) {
                    if (err) {
                        res.status(400).json({ "error": res.message })
                        return;
                    }

                    // update the driver field with the assigned rider
                    db.run(
                        `UPDATE drivers set 
                        assignedRider = COALESCE(?,assignedRider)
                           WHERE id = ?`,
                        [req.params.id, data.assignedDriver],
                        function (err, result) {
                            if (err) {
                                res.status(400).json({ "error": res.message })
                                return;
                            }

                            // Now lets create a trip for this request
                            var sqlTrip = 'INSERT INTO trips (rider, driver, location) VALUES (?,?,?)'
                            var params = [req.params.id, data.assignedDriver, data.location]
                            db.run(sqlTrip, params, function (err, result) {
                                if (err) {
                                    res.status(400).json({ "error": err.message })
                                    return;
                                }

                                // Now lets create an invoice for this trip
                                var sqlTrip = 'INSERT INTO invoices (rider, driver, location) VALUES (?,?,?)'
                                var params = [req.params.id, data.assignedDriver, data.location]
                                db.run(sqlTrip, params, function (err, result) {
                                    if (err) {
                                        res.status(400).json({ "error": err.message })
                                        return;
                                    }

                                    // get the current driver data and display to user
                                    var newSql = "select * from drivers where id = ? AND status = 'FALSE'"
                                    var params = [data.assignedDriver]
                                    db.get(newSql, params, (err, newRow) => {

                                        res.json({
                                            message: "Driver assigned to rider",
                                            data: { "driverInfo": newRow },
                                            changes: this.changes
                                        })

                                    });

                                });
                            });

                        });
                });
        }

    });

};

/**
 * Update Rider Info
 * Request - PATCH
 * Params {id, riderInfo}
 */
exports.update_a_rider = function (req, res) {
    var data = {
        status: req.body.status.toUpperCase(),
    }
    db.run(
        `UPDATE riders set 
           status = COALESCE(?,status)
           WHERE id = ?`,
        [data.status, req.params.id],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
        });
};

/**
 * Delete a rider
 * Request - DELETE
 * params {id}
 */
exports.delete_a_rider = function (req, res) {
    db.run(
        'DELETE FROM riders WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", changes: this.changes })
        });
};

/**
 * Check Rider Availabilty 
 */
exports.check_rider_availabilty = function (req, res) {
    // create an array of errors to return
    var errors = []
    if (!req.body.status) {
        errors.push("specify either true or false");
    }
    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }

    var sql = "select * from riders where status = ?"
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