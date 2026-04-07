/**
 * Search Controller
 * Handles inventory search across JSON data
 * Implements case-insensitive filtering with multiple criteria
 */

const fs = require('fs');
const path = require('path');
const { validationError } = require('../middleware/errorHandler');

// Load inventory data from JSON file
const getInventoryData = () => {
  const dataPath = path.join(__dirname, '../data/inventory.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
};

/**
 * Search inventory with filters
 * GET /search
 * 
 * Query Parameters:
 *   - q (string): Product name partial match (case-insensitive)
 *   - category (string): Exact category filter
 *   - minPrice (number): Minimum price filter
 *   - maxPrice (number): Maximum price filter
 * 
 * Filter Logic:
 *   1. Product name search (case-insensitive partial match)
 *   2. Category filter (exact match)
 *   3. Minimum price filter
 *   4. Maximum price filter
 * 
 * Edge Cases:
 *   - Empty search query: ignored (returns all results matching other filters)
 *   - Invalid price range: returns 400 error if minPrice > maxPrice
 *   - No results: returns empty array with success: true
 */
const searchInventory = (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;

    // Log incoming request
    console.log('🔍 Search Request:', { q, category, minPrice, maxPrice });

    // Validate price range
    if (minPrice && maxPrice) {
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      
      if (isNaN(min) || isNaN(max)) {
        throw validationError('Price must be a valid number');
      }
      
      if (min > max) {
        throw validationError('Invalid price range: minPrice cannot be greater than maxPrice');
      }
    }

    // Load all inventory items
    const allItems = getInventoryData();
    console.log(`📦 Total items in inventory: ${allItems.length}`);

    // Apply filters sequentially
    let results = [...allItems];

    // Filter 1: Product name (case-insensitive partial match)
    if (q && q.trim() !== '') {
      const searchTerm = q.toLowerCase().trim();
      results = results.filter(item =>
        item.productName.toLowerCase().includes(searchTerm)
      );
      console.log(`✏️ After name filter "${q}": ${results.length} items`);
    }

    // Filter 2: Category (exact match)
    if (category && category.trim() !== '') {
      results = results.filter(item =>
        item.category.toLowerCase() === category.toLowerCase()
      );
      console.log(`📂 After category filter "${category}": ${results.length} items`);
    }

    // Filter 3: Minimum price
    if (minPrice) {
      const min = parseFloat(minPrice);
      results = results.filter(item => item.price >= min);
      console.log(`💰 After minPrice filter (${min}): ${results.length} items`);
    }

    // Filter 4: Maximum price
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      results = results.filter(item => item.price <= max);
      console.log(`💰 After maxPrice filter (${max}): ${results.length} items`);
    }

    // Return results
    console.log(`✅ Final results: ${results.length} items found`);
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unique categories
 * GET /search/categories
 * Helper endpoint to populate category dropdown
 */
const getCategories = (req, res, next) => {
  try {
    const allItems = getInventoryData();
    const categories = [...new Set(allItems.map(item => item.category))].sort();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchInventory,
  getCategories
};
