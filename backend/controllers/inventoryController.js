/**
 * Inventory Controller
 * Handles inventory management and queries
 */

const { validationError, notFoundError } = require('../middleware/errorHandler');
const { runQuery, getRow, getAllRows } = require('../db/connection');

/**
 * Create inventory item
 * POST /inventory
 * 
 * Request body:
 *   - supplier_id (number, required): Valid supplier ID
 *   - product_name (string, required): Name of product
 *   - category (string, required): Product category
 *   - quantity (number, required): >= 0
 *   - price (number, required): > 0
 * 
 * Validations:
 *   - Supplier must exist
 *   - Quantity >= 0
 *   - Price > 0
 */
const createInventoryItem = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { supplier_id, product_name, category, quantity, price } = req.body;

    // Validate required fields
    if (!supplier_id) {
      throw validationError('supplier_id is required');
    }
    if (!product_name || !product_name.trim()) {
      throw validationError('product_name is required');
    }
    if (!category || !category.trim()) {
      throw validationError('category is required');
    }
    if (quantity === undefined || quantity === null) {
      throw validationError('quantity is required');
    }
    if (price === undefined || price === null) {
      throw validationError('price is required');
    }

    // Convert to numbers and validate
    const qty = parseInt(quantity);
    const priceVal = parseFloat(price);

    if (isNaN(qty)) {
      throw validationError('quantity must be a valid number');
    }
    if (isNaN(priceVal)) {
      throw validationError('price must be a valid number');
    }

    // Validate quantity >= 0
    if (qty < 0) {
      throw validationError('Quantity must be 0 or greater');
    }

    // Validate price > 0
    if (priceVal <= 0) {
      throw validationError('Price must be greater than 0');
    }

    // Check supplier exists
    const supplier = await getRow(
      db,
      'SELECT id, name FROM suppliers WHERE id = ?',
      [supplier_id]
    );

    if (!supplier) {
      throw validationError(`Invalid supplier_id: ${supplier_id} does not exist`);
    }

    // Insert inventory item
    const result = await runQuery(
      db,
      `INSERT INTO inventory 
       (supplier_id, product_name, category, quantity, price) 
       VALUES (?, ?, ?, ?, ?)`,
      [supplier_id, product_name.trim(), category.trim(), qty, priceVal]
    );

    console.log(`✅ Inventory item created: ID ${result.id}, Product: ${product_name}`);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: {
        id: result.id,
        supplier_id,
        supplier_name: supplier.name,
        product_name: product_name.trim(),
        category: category.trim(),
        quantity: qty,
        price: priceVal
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all inventory items
 * GET /inventory
 * 
 * Optional query params:
 *   - groupBySupplier (boolean): Group by supplier with totals
 */
const getAllInventory = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { groupBySupplier } = req.query;

    if (groupBySupplier === 'true') {
      // Grouped query with totals sorted by inventory value
      const groupedData = await getAllRows(
        db,
        `SELECT 
          s.id as supplier_id,
          s.name as supplier_name,
          s.city,
          COUNT(i.id) as total_items,
          SUM(i.quantity) as total_quantity,
          SUM(i.quantity * i.price) as total_inventory_value,
          GROUP_CONCAT(i.product_name, ', ') as products
        FROM suppliers s
        LEFT JOIN inventory i ON s.id = i.supplier_id
        GROUP BY s.id, s.name, s.city
        ORDER BY total_inventory_value DESC`
      );

      console.log(`✅ Retrieved grouped inventory: ${groupedData.length} suppliers`);

      res.json({
        success: true,
        groupedBySupplier: true,
        count: groupedData.length,
        data: groupedData
      });
    } else {
      // Regular inventory list with supplier details
      const inventory = await getAllRows(
        db,
        `SELECT 
          i.id,
          i.supplier_id,
          s.name as supplier_name,
          s.city,
          i.product_name,
          i.category,
          i.quantity,
          i.price,
          (i.quantity * i.price) as total_value,
          i.created_at
        FROM inventory i
        JOIN suppliers s ON i.supplier_id = s.id
        ORDER BY i.created_at DESC`
      );

      console.log(`✅ Retrieved ${inventory.length} inventory items`);

      res.json({
        success: true,
        groupedBySupplier: false,
        count: inventory.length,
        data: inventory
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory by ID
 * GET /inventory/:id
 */
const getInventoryById = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    const item = await getRow(
      db,
      `SELECT 
        i.id,
        i.supplier_id,
        s.name as supplier_name,
        i.product_name,
        i.category,
        i.quantity,
        i.price,
        (i.quantity * i.price) as total_value
      FROM inventory i
      JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.id = ?`,
      [id]
    );

    if (!item) {
      throw notFoundError('Inventory item not found');
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update inventory item
 * PUT /inventory/:id
 */
const updateInventoryItem = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { product_name, category, quantity, price } = req.body;

    // Get existing item
    const existing = await getRow(
      db,
      'SELECT * FROM inventory WHERE id = ?',
      [id]
    );

    if (!existing) {
      throw notFoundError('Inventory item not found');
    }

    // Validate and prepare fields
    const newProductName = product_name?.trim() || existing.product_name;
    const newCategory = category?.trim() || existing.category;
    const newQuantity = quantity !== undefined ? parseInt(quantity) : existing.quantity;
    const newPrice = price !== undefined ? parseFloat(price) : existing.price;

    // Validate quantity
    if (isNaN(newQuantity) || newQuantity < 0) {
      throw validationError('Quantity must be a non-negative number');
    }

    // Validate price
    if (isNaN(newPrice) || newPrice <= 0) {
      throw validationError('Price must be a positive number');
    }

    // Update record
    await runQuery(
      db,
      `UPDATE inventory 
       SET product_name = ?, category = ?, quantity = ?, price = ?
       WHERE id = ?`,
      [newProductName, newCategory, newQuantity, newPrice, id]
    );

    console.log(`✅ Inventory item updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: {
        id,
        product_name: newProductName,
        category: newCategory,
        quantity: newQuantity,
        price: newPrice
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete inventory item
 * DELETE /inventory/:id
 */
const deleteInventoryItem = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    const item = await getRow(
      db,
      'SELECT * FROM inventory WHERE id = ?',
      [id]
    );

    if (!item) {
      throw notFoundError('Inventory item not found');
    }

    await runQuery(
      db,
      'DELETE FROM inventory WHERE id = ?',
      [id]
    );

    console.log(`✅ Inventory item deleted: ID ${id}`);

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInventoryItem,
  getAllInventory,
  getInventoryById,
  updateInventoryItem,
  deleteInventoryItem
};
