'use strict';
module.exports = function (app) {
    var driverTask = require('../controllers/driverController');
    var riderTask = require('../controllers/riderController');
    var tripTask = require('../controllers/tripController');
    var invoiceTask = require('../controllers/invoiceController');

    // application Routes
    app.route('/')
        .get(driverTask.welcome)

    // Driver Routes
    app.route('/api/driver')
        .get(driverTask.list_all_drivers)
        .post(driverTask.create_a_driver);

    app.route('/api/driver/:id')
        .get(driverTask.read_a_driver)
        .patch(driverTask.update_a_driver)
        .delete(driverTask.delete_a_driver);

    app.route('/api/driver/status')
        .post(driverTask.check_driver_availabilty)

    app.route('/api/driver/distance/:location')
        .get(driverTask.drivers_within_distance)

    // Riders Routes
    app.route('/api/rider')
        .get(riderTask.list_all_riders)
        .post(riderTask.create_a_rider)

    app.route('/api/rider/:id')
        .get(riderTask.read_a_rider)
        .patch(riderTask.assign_a_driver)
        .patch(riderTask.update_a_rider)
        .delete(riderTask.delete_a_rider);

    app.route('/api/rider/status')
        .post(riderTask.check_rider_availabilty)

    // Trips Routes
    app.route('/api/trip')
        .get(tripTask.list_all_trips)

    app.route('/api/trip/driver/:driverId/rider/:riderId')
        .patch(tripTask.update_trip_status)

    app.route('/api/trip/status')
        .post(tripTask.check_trip_status)

    // Invoices routes
    app.route('/api/invoice')
        .get(invoiceTask.list_all_invoices)

};