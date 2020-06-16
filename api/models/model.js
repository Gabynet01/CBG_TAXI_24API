'use strict';
var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBTAXIS = "db.sqlite"

let db = new sqlite3.Database(DBTAXIS, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {

        console.log('Connected to the SQLite database.')
        // db.run(`DROP TABLE drivers`)
        // db.run(`DROP TABLE riders`)
        // db.run(`DROP TABLE trips`)
        // db.run(`DROP TABLE invoices`)

        // Drivers db
        db.run(`CREATE TABLE drivers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            email text UNIQUE, 
            mobileNo text, 
            location text, 
            coordinates text, 
            carType text, 
            carRegNo text, 
            licenseNumber text, 
            assignedRider text DEFAULT '0',
            status text DEFAULT 'FALSE', 
            CONSTRAINT email_unique UNIQUE (email)
            )`,
            (err) => {
                if (err) {
                    // Table already created
                    // console.log("error says >>>>>", err)
                } else {
                    // Table just created, creating some rows
                    var insert = 'INSERT INTO drivers (name, email, mobileNo, location, coordinates, carType, carRegNo, licenseNumber) VALUES (?,?,?,?,?,?,?,?)'

                    db.run(insert, ["driverA", "driverA@taxi.com", "0543621226", "Adenta", "5.7142,0.1542", "Mercedez Benz", "GT-1123-19", "DVLA1234"])

                    db.run(insert, ["driverB", "driverB@taxi.com", "0541234562", "Adenta", "5.6731,0.1664", "Chevrolet Cruze", "GA-0993-12", "DVLA8204"])

                    db.run(insert, ["driverC", "driverC@taxi.com", "0509876543", "Dodowa", "5.8829,0.0980", "Toyota Camry", "GA-0331-19", "DVLA8987"])
                }
            });

        // Riders db
        db.run(
            `CREATE TABLE riders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            email text, 
            mobileNo text, 
            location text, 
            tripStatus text DEFAULT 'FALSE', 
            assignedDriver text DEFAULT '0'
            )`,
            (err) => {
                if (err) {
                    // Table already created
                    // console.log("error says >>>>>", err)
                } else {
                    // Table just created, creating some rows

                    var insertRiders = 'INSERT INTO riders (name, email, mobileNo, location) VALUES (?,?,?,?)'

                    db.run(insertRiders, ["testRider", "testRider@taxi.com", "0543621226", "Adenta"])
                }
            });

        // Trips db
        db.run(
            `CREATE TABLE trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rider text DEFAULT '0', 
            driver text DEFAULT '0', 
            location text DEFAULT 'NULL',
            status text DEFAULT 'INITIATED'
           
            )`,
            (err) => {
                if (err) {
                    // Table already created
                    // console.log("error says >>>>>", err)
                } else {
                    // Table just created, creating some rows
                }
            });

        // Invoice db
        db.run(
            `CREATE TABLE invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rider text DEFAULT '0', 
            driver text DEFAULT '0', 
            location text DEFAULT 'NULL',
            tripStatus text DEFAULT 'INITIATED',
            amount text DEFAULT '0'
           
            )`,
            (err) => {
                if (err) {
                    // Table already created
                    // console.log("error says >>>>>", err)
                } else {
                    // Table just created, creating some rows
                }
            });
    }

    // db.close((err) => {
    //     if (err) {
    //         console.error(err.message);
    //     }
    //     console.log('Close the database connection.');
    // });
});



// export db module 
module.exports = db