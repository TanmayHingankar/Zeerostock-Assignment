/**
 * Supplier Routes
 * Handles supplier CRUD operations
 */

const express = require('express');
const router = express.Router();
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

/**
 * POST /supplier
 * Create new supplier
 */
router.post('/', createSupplier);

/**
 * GET /supplier
 * Get all suppliers
 */
router.get('/', getAllSuppliers);

/**
 * GET /supplier/:id
 * Get supplier by ID
 */
router.get('/:id', getSupplierById);

/**
 * PUT /supplier/:id
 * Update supplier
 */
router.put('/:id', updateSupplier);

/**
 * DELETE /supplier/:id
 * Delete supplier
 */
router.delete('/:id', deleteSupplier);

module.exports = router;
