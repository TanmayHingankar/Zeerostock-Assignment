-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table (linked to Suppliers)
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  supplier_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Create index for faster queries on supplier_id (OPTIMIZATION)
CREATE INDEX IF NOT EXISTS idx_inventory_supplier_id ON inventory(supplier_id);

-- Create index for category searches
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);

-- Seed data - Suppliers
INSERT OR IGNORE INTO suppliers (id, name, city) VALUES
(1, 'ABC Traders', 'Delhi'),
(2, 'Quick Supplies', 'Mumbai'),
(3, 'Global Imports', 'Bangalore'),
(4, 'Industrial Goods Ltd', 'Chennai'),
(5, 'Premium Electronics', 'Hyderabad');

-- Seed data - Sample Inventory (10-15 diverse items)
INSERT OR IGNORE INTO inventory (supplier_id, product_name, category, quantity, price) VALUES
(1, 'Office Chair Executive', 'Furniture', 45, 150.00),
(1, 'Desk Lamp LED', 'Electronics', 120, 45.50),
(2, 'Notebook A4 Pack', 'Stationery', 500, 8.99),
(2, 'Pen Set Black', 'Stationery', 200, 2.50),
(3, 'Monitor 24 inch', 'Electronics', 30, 280.00),
(3, 'Keyboard Mechanical', 'Electronics', 85, 95.75),
(4, 'Conference Table', 'Furniture', 12, 450.00),
(4, 'Office Cabinet', 'Furniture', 25, 320.50),
(5, 'Mouse Wireless', 'Electronics', 150, 35.99),
(5, 'USB Hub 4 Port', 'Electronics', 200, 19.99),
(1, 'Document Holder', 'Stationery', 180, 12.50),
(2, 'Printer Inkjet', 'Electronics', 15, 199.99),
(3, 'Desk Chair Basic', 'Furniture', 60, 99.99),
(4, 'Filing Cabinets', 'Furniture', 20, 280.00),
(5, 'Scanner Document', 'Electronics', 8, 550.00);
