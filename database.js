const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("missilewar.db");

db.serialize(() => {

db.run(
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
password TEXT,

money INTEGER DEFAULT 1000,
iron INTEGER DEFAULT 500,
fuel INTEGER DEFAULT 300,

missiles INTEGER DEFAULT 0,

level INTEGER DEFAULT 1,

factory INTEGER DEFAULT 1,
fuelPlant INTEGER DEFAULT 1,
defense INTEGER DEFAULT 1
)
);

console.log("Database loaded");

});

module.exports = db;
