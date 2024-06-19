const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/database.sqlite");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    first_name TEXT,
    last_name TEXT
  )`);
});

const createUser = (email, password, firstName, lastName, callback) => {
  const stmt = db.prepare(
    `INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)`
  );
  stmt.run([email, password, firstName, lastName], function (err) {
    callback(err, this.lastID);
  });
  stmt.finalize();
};

const findUserByEmail = (email, callback) => {
  db.get(
    `SELECT id, email, first_name, last_name FROM users WHERE email = ?`,
    [email],
    (err, row) => {
      callback(err, row);
    }
  );
};

const findUserById = (id, callback) => {
  db.get(
    `SELECT id, email, first_name, last_name FROM users WHERE id = ?`,
    [id],
    (err, row) => {
      callback(err, row);
    }
  );
};

const getAllUsers = (callback) => {
  db.all(`SELECT id, email, first_name, last_name FROM users`, (err, rows) => {
    callback(err, rows);
  });
};

const deleteUserById = (id, callback) => {
  const stmt = db.prepare(`DELETE FROM users WHERE id = ?`);
  stmt.run([id], function (err) {
    callback(err, this.changes);
  });
  stmt.finalize();
};

const updateUserDetails = (
  id,
  newEmail,
  newFirstName,
  newLastName,
  callback
) => {
  findUserById(id, (err, user) => {
    if (err || !user) {
      return callback(new Error("User not found"), null);
    }

    let query = "UPDATE users SET ";
    const params = [];

    if (newEmail && newEmail !== user.email) {
      query += "email = ?, ";
      params.push(newEmail);
    }
    if (newFirstName && newFirstName !== user.first_name) {
      query += "first_name = ?, ";
      params.push(newFirstName);
    }
    if (newLastName && newLastName !== user.last_name) {
      query += "last_name = ?, ";
      params.push(newLastName);
    }

    if (params.length === 0) {
      return callback(null, "No changes detected");
    }

    query = query.slice(0, -2);
    query += " WHERE id = ?";
    params.push(id);

    const stmt = db.prepare(query);
    stmt.run(params, function (err) {
      callback(err, this.changes);
    });
    stmt.finalize();
  });
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  deleteUserById,
  updateUserDetails,
};
