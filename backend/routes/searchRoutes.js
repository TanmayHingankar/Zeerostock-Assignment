/**
 * Search Routes
 * Handles inventory search endpoints
 */

const express = require('express');
const router = express.Router();
const { searchInventory, getCategories } = require('../controllers/searchController');

/**
 * GET /search
 * Search inventory with filters
 * Query params: q, category, minPrice, maxPrice
 */
router.get('/search', searchInventory);

/**
 * GET /search/categories
 * Get all unique categories for dropdown
 */
router.get('/categories', getCategories);

module.exports = router;
