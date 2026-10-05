const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
    user: "ALANAHOWARD",
    password: "VTrntkUzkNsLoTHZ1J9lhUR0zAq3uJEAq50",
    database: 'ALANAHOWARD',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function query(sql, params) {
    const [results] = await db.execute(sql, params);
    return results;
}


module.exports = db;
module.exports.query = query;