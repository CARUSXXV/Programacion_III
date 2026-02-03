const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/retrovault.db');

let db = null;

/**
 * Obtiene la instancia de la base de datos
 * @returns {sqlite3.Database} Instancia de la base de datos
 */
const getDatabase = () => {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error al conectar con la base de datos:', err.message);
        throw err;
      }
      console.log('✅ Conexión exitosa con la base de datos SQLite');
    });
  }
  return db;
};

/**
 * Inicializa la base de datos y crea las tablas necesarias
 * @returns {Promise<void>}
 */
const initDatabase = () => new Promise((resolve, reject) => {
  const database = getDatabase();

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('client', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `;

  database.run(createUsersTable, (err) => {
    if (err) {
      console.error('❌ Error al crear tabla users:', err.message);
      return reject(err);
    }
    console.log('✅ Tabla users verificada/creada correctamente');

    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        codigo TEXT NOT NULL UNIQUE,
        precio REAL NOT NULL CHECK(precio > 0),
        descripcion TEXT,
        categoria TEXT NOT NULL CHECK(categoria IN ('juegos', 'consolas', 'coleccionables', 'otros')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `;

    database.run(createProductsTable, (errProd) => {
      if (errProd) {
        console.error('❌ Error al crear tabla products:', errProd.message);
        return reject(errProd);
      }
      console.log('✅ Tabla products verificada/creada correctamente');

      const createCartTable = `
        CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          cantidad INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `;

      database.run(createCartTable, (errCart) => {
        if (errCart) {
          console.error('❌ Error al crear tabla cart_items:', errCart.message);
          return reject(errCart);
        }
        console.log('✅ Tabla cart_items verificada/creada correctamente');
        resolve();
      });
    });
  });
});

/**
 * Cierra la conexión con la base de datos
 * @returns {Promise<void>}
 */
const closeDatabase = () => new Promise((resolve, reject) => {
  if (db) {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Conexión con la base de datos cerrada');
        db = null;
        resolve();
      }
    });
  } else {
    resolve();
  }
});

module.exports = {
  getDatabase,
  initDatabase,
  closeDatabase,
};
