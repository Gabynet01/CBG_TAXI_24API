'use strict';

var successCode = "200";
var errorCode = "204";

var db = require('../models/model'); //created model loading here

exports.welcome = function (req, res) {
    res.json({ "message": "Connected" })
};

/**
 * List all Drivers
 * Request - GET
 * no params 
 */
exports.list_all_drivers = function (req, res) {
    var sql = "select * from drivers"
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
 * CREATE A NEW DRIVER
 * Request - POST
 * Params {jsonBodyItems}
 */
exports.create_a_driver = function (req, res) {
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
    if (!req.body.coordinates) {
        errors.push("No coordinates specified");
    }
    if (!req.body.carType) {
        errors.push("No car type specified");
    }
    if (!req.body.carRegNo) {
        errors.push("No car reg. number specified");
    }
    if (!req.body.licenseNumber) {
        errors.push("No license number specified");
    }
    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        mobileNo: req.body.mobileNo,
        location: req.body.location.toUpperCase(),
        coordinates: req.body.coordinates,
        carType: req.body.carType,
        carRegNo: req.body.carRegNo,
        licenseNumber: req.body.licenseNumber
    }
    var sql = 'INSERT INTO drivers (name, email, mobileNo, location, coordinates, carType, carRegNo, licenseNumber) VALUES (?,?,?,?,?,?,?,?)'
    var params = [data.name, data.email, data.mobileNo, data.location, data.coordinates, data.carType, data.carRegNo, data.licenseNumber]
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
 * Get driver by Id
 * Request - GET
 * Params {id}
 */
exports.read_a_driver = function (req, res) {
    var sql = "select * from drivers where id = ?"
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
 * UPDATE DRIVER INFO
 * Request - PATCH
 * Params {status, name, .....}
 */
exports.update_a_driver = function (req, res) {
    var data = {
        status: req.body.status.toUpperCase(),
    }
    db.run(
        `UPDATE drivers set 
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
 * Delete a driver by id
 * Request - DELETE
 * Params {driverid}
 */
exports.delete_a_driver = function (req, res) {
    db.run(
        'DELETE FROM drivers WHERE id = ?',
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
 * Check if Driver is Engaged or Available
 * Request - POST
 * Params {Status->TRUE/FALSE, id}
 */
exports.check_driver_availabilty = function (req, res) {
    // create an array of errors to return
    var errors = []
    if (!req.body.status) {
        errors.push("specify either true or false");
    }
    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }

    var sql = "select * from drivers where status = ?"
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


/**
 * Check for drivers 
 * Request - POST
 * Params {cordinates}
 */
exports.drivers_within_distance = function (req, res) {
    // create an array of errors to return
    var errors = []
    if (!req.params.location) {
        errors.push("specify the location of the driver");
    }

    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }

    var sql = "select * from drivers where UPPER(location) = ? LIMIT 2"
    var params = [req.params.location.toUpperCase()]
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // console.log("rooowsss", rows)
        var coordinatesArray = [];

        var allData = rows;

        // for loop on the data to get the coordinates
        var i;
        for (i = 0; i < allData.length; i++) {
            allData[i];
            coordinatesArray.push(allData[i].coordinates)
        }

        console.log("coordinates", coordinatesArray.toString().split(','))

        var finalPoints = coordinatesArray.toString().split(',');
        var lat1 = finalPoints[0];
        var lon1 = finalPoints[1];
        var lat2 = finalPoints[2];
        var lon2 = finalPoints[3];

        // console.log("distance", calcCrow(lat1, lon1, lat2, lon2).toFixed(1))

        // Total distance in KM
        var distanceInKM = calcCrow(lat1, lon1, lat2, lon2).toFixed(1);

        // calculate the latitude and longitude distance in KM
        function calcCrow(lat1, lon1, lat2, lon2) {
            var R = 6371; // km
            var latitudeDifference = toRad(lat2 - lat1);
            var longitudeDifference = toRad(lon2 - lon1);
            var lat1 = toRad(lat1);
            var lat2 = toRad(lat2);

            var a = Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
                Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d;
        }

        // Converts numeric degrees to radians
        function toRad(Value) {
            return Value * Math.PI / 180;
        }

        // check if the 
        if (distanceInKM >= "3") {
            res.json({
                "code": successCode,
                "message": "success",
                "data": { "distance": distanceInKM + "KM", "drivers": rows }
            })
        }
        else {
            res.json({
                "code": successCode,
                "message": "success",
                "data": { "distance": distanceInKM + "KM", "drivers": rows }
            })
        }

    });
};