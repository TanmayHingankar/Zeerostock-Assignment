/**
 * Database Connection Module
 * Sets up SQLite3 connection and provides database utilities
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'inventory.db');

/**
 * Initialize database connection
 * @returns {Promise<Database>} Database connection object
 */
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
        reject(err);
      } else {
        console.log('✅ Connected to SQLite database at:', dbPath);
        loadSchema(db).then(() => resolve(db)).catch(reject);
      }
    });
  });
};

/**
 * Load schema from SQL file
 * @param {Database} db - Database connection
 */
const loadSchema = (db) => {
  return new Promise((resolve, reject) => {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    db.exec(schema, (err) => {
      if (err) {
        console.error('❌ Error loading schema:', err.message);
        reject(err);
      } else {
        console.log('✅ Database schema initialized successfully');
        resolve();
      }
    });
  });
};

/**
 * Run query (INSERT, UPDATE, DELETE)
 * @param {Database} db - Database connection
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 */
const runQuery = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

/**
 * Get single row
 * @param {Database} db - Database connection
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 */
const getRow = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Get all rows
 * @param {Database} db - Database connection
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 */
const getAllRows = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

module.exports = {
  initDatabase,
  runQuery,
  getRow,
  getAllRows
};
