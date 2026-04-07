/**
 * Inventory Routes
 * Handles inventory CRUD operations
 */

const express = require('express');
const router = express.Router();
const {
  createInventoryItem,
  getAllInventory,
  getInventoryById,
  updateInventoryItem,
  deleteInventoryItem
} = require('../controllers/inventoryController');

/**
 * POST /inventory
 * Create new inventory item
 */
router.post('/', createInventoryItem);

/**
 * GET /inventory
 * Get all inventory items
 * Query params: groupBySupplier (true/false)
 */
router.get('/', getAllInventory);

/**
 * GET /inventory/:id
 * Get inventory item by ID
 */
router.get('/:id', getInventoryById);

/**
 * PUT /inventory/:id
 * Update inventory item
 */
router.put('/:id', updateInventoryItem);

/**
 * DELETE /inventory/:id
 * Delete inventory item
 */
router.delete('/:id', deleteInventoryItem);

module.exports = router;
