/**
 * Supplier Controller
 * Handles supplier management (CRUD operations)
 */

const { validationError, notFoundError } = require('../middleware/errorHandler');
const { runQuery, getRow, getAllRows } = require('../db/connection');

/**
 * Create a new supplier
 * POST /supplier
 * 
 * Request body:
 *   - name (string, required): Supplier name
 *   - city (string, required): Supplier city
 * 
 * Validation:
 *   - Both fields required
 *   - Name must be unique
 */
const createSupplier = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { name, city } = req.body;

    // Validate input
    if (!name || !name.trim()) {
      throw validationError('Supplier name is required');
    }
    if (!city || !city.trim()) {
      throw validationError('City is required');
    }

    // Check if supplier already exists
    const existing = await getRow(
      db,
      'SELECT id FROM suppliers WHERE name = ?',
      [name.trim()]
    );

    if (existing) {
      throw validationError('Supplier with this name already exists');
    }

    // Insert new supplier
    const result = await runQuery(
      db,
      'INSERT INTO suppliers (name, city) VALUES (?, ?)',
      [name.trim(), city.trim()]
    );

    console.log(`✅ Supplier created: ID ${result.id}, Name: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: {
        id: result.id,
        name: name.trim(),
        city: city.trim()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all suppliers
 * GET /supplier
 */
const getAllSuppliers = async (req, res, next) => {
  try {
    const db = req.app.locals.db;

    const suppliers = await getAllRows(
      db,
      'SELECT * FROM suppliers ORDER BY id DESC'
    );

    console.log(`✅ Retrieved ${suppliers.length} suppliers`);

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get supplier by ID
 * GET /supplier/:id
 */
const getSupplierById = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    const supplier = await getRow(
      db,
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );

    if (!supplier) {
      throw notFoundError('Supplier not found');
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update supplier
 * PUT /supplier/:id
 */
const updateSupplier = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { name, city } = req.body;

    // Check supplier exists
    const supplier = await getRow(
      db,
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );

    if (!supplier) {
      throw notFoundError('Supplier not found');
    }

    const updatedName = name?.trim() || supplier.name;
    const updatedCity = city?.trim() || supplier.city;

    await runQuery(
      db,
      'UPDATE suppliers SET name = ?, city = ? WHERE id = ?',
      [updatedName, updatedCity, id]
    );

    console.log(`✅ Supplier updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: {
        id,
        name: updatedName,
        city: updatedCity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete supplier
 * DELETE /supplier/:id
 */
const deleteSupplier = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    const supplier = await getRow(
      db,
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );

    if (!supplier) {
      throw notFoundError('Supplier not found');
    }

    await runQuery(
      db,
      'DELETE FROM suppliers WHERE id = ?',
      [id]
    );

    console.log(`✅ Supplier deleted: ID ${id}`);

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
};
