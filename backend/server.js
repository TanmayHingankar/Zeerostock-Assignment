/**
 * Main Server File
 * Inventory Management System - Complete Backend
 * 
 * Features:
 * - Part A: Search API (JSON-based)
 * - Part B: Database APIs (SQLite)
 * - Error handling middleware
 * - CORS enabled for frontend integration
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import database
const { initDatabase } = require('./db/connection');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const searchRoutes = require('./routes/searchRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============= MIDDLEWARE =============

// CORS: Enable frontend integration
app.use(cors({
  origin: 'http://localhost:3000', // Adjust for your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Allow CORS from any origin (development only)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============= LOGGING MIDDLEWARE =============

app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// ============= ROUTES =============

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * API Info endpoint
 */
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Inventory Management System',
    version: '1.0.0',
    endpoints: {
      search: '/search?q=&category=&minPrice=&maxPrice=',
      categories: '/categories',
      suppliers: '/supplier',
      inventory: '/inventory'
    }
  });
});

// Part A: Search API (JSON-based)
app.use('/', searchRoutes);

// Part B: Database APIs
app.use('/supplier', supplierRoutes);
app.use('/inventory', inventoryRoutes);

// ============= ERROR HANDLING =============

/**
 * 404 - Not found handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

/**
 * Global error handler (must be last)
 */
app.use(errorHandler);

// ============= SERVER INITIALIZATION =============

/**
 * Initialize database and start server
 */
const startServer = async () => {
  try {
    // Initialize SQLite database
    console.log('\n🔧 Initializing database...');
    const db = await initDatabase();
    
    // Store db connection in app locals for route access
    app.locals.db = db;

    // Start server
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on http://localhost:${PORT}`);
      console.log(`\n📚 API Endpoints:`);
      console.log(`   Part A (Search): GET http://localhost:${PORT}/search`);
      console.log(`   Categories: GET http://localhost:${PORT}/categories`);
      console.log(`   Suppliers: POST/GET/PUT/DELETE http://localhost:${PORT}/supplier`);
      console.log(`   Inventory: POST/GET/PUT/DELETE http://localhost:${PORT}/inventory`);
      console.log(`\n🎯 UI: Open frontend/index.html in browser\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
