const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'petshop_api_db'
});

db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database!');
});

// ===== PRODUCTS =====
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/products', (req, res) => {
    const { name, category, pet_type, qty, price, company } = req.body;
    db.query(
        'INSERT INTO products (name, category, pet_type, qty, price, company) VALUES (?,?,?,?,?,?)',
        [name, category, pet_type, qty, price, company || 'Pet Shop'],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
});

app.put('/api/products/:id', (req, res) => {
    const { name, category, pet_type, qty, price } = req.body;
    db.query(
        'UPDATE products SET name=?, category=?, pet_type=?, qty=?, price=? WHERE id=?',
        [name, category, pet_type, qty, price, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.delete('/api/products/:id', (req, res) => {
    db.query('DELETE FROM products WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ===== CUSTOMERS =====
app.get('/api/customers', (req, res) => {
    db.query('SELECT id, fname, lname, email, phone FROM customers', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add new customer
app.post('/api/customers', (req, res) => {
    const { fname, lname, email, phone, password } = req.body;
    db.query(
        'INSERT INTO customers (fname, lname, email, phone, password) VALUES (?,?,?,?,?)',
        [fname, lname, email, phone, password],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
});

// Customer Login
app.post('/api/customers/login', (req, res) => {
    const { email, password } = req.body;
    db.query(
        'SELECT * FROM customers WHERE email=? AND password=?',
        [email, password],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) {
                res.json({ success: true, customer: results[0] });
            } else {
                res.json({ success: false, message: 'Invalid credentials' });
            }
        }
    );
});
// Update customer
app.put('/api/customers/:id', (req, res) => {
    const { fname, lname, email, phone } = req.body;
    db.query(
        'UPDATE customers SET fname=?, lname=?, email=?, phone=? WHERE id=?',
        [fname, lname, email, phone, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// Delete customer
app.delete('/api/customers/:id', (req, res) => {
    db.query('DELETE FROM customers WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ===== DELIVERY ADDRESSES =====
app.post('/api/addresses', (req, res) => {
    const { order_id, fname, lname, country, street, apt, city, zipcode, phone, email, payment_method } = req.body;
    db.query(
        'INSERT INTO addresses (order_id, fname, lname, country, street, apt, city, zipcode, phone, email, payment_method) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [order_id, fname, lname, country, street, apt, city, zipcode, phone, email, payment_method],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
});



// Update address status
app.put('/api/addresses/order/:order_id/status', (req, res) => {
    const { status } = req.body;
    db.query(
        'UPDATE addresses SET status=? WHERE order_id=?',
        [status, req.params.order_id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.get('/api/addresses', (req, res) => {
    db.query('SELECT * FROM addresses', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/addresses/order/:order_id', (req, res) => {
    db.query('SELECT * FROM addresses WHERE order_id=?', [req.params.order_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.length > 0 ? results[0] : null);
    });
});



























// ===== ORDERS =====
app.get('/api/orders', (req, res) => {
    db.query('SELECT * FROM orders ORDER BY order_date DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/orders/pending', (req, res) => {
    db.query(
        "SELECT * FROM orders WHERE status='processing' ORDER BY order_date DESC",
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.get('/api/orders/received', (req, res) => {
    db.query(
        "SELECT * FROM orders WHERE status='received' ORDER BY order_date DESC",
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.post('/api/orders', (req, res) => {
    const { customer_id, product_id, product_name, qty, total } = req.body;
    db.query(
        'INSERT INTO orders (customer_id, product_id, product_name, qty, total) VALUES (?,?,?,?,?)',
        [customer_id, product_id, product_name, qty, total],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
});

app.put('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    db.query(
        'UPDATE orders SET status=? WHERE id=?',
        [status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // If received, add to sales
            if (status === 'received') {
                db.query(
                    'SELECT o.*, c.fname, c.lname FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id=?',
                    [req.params.id],
                    (err2, rows) => {
                        if (!err2 && rows.length > 0) {
                            const order = rows[0];
                            const custName = order.fname + ' ' + order.lname;
                            db.query(
                                'INSERT INTO sales (order_id, customer_name, product_name, qty, total) VALUES (?,?,?,?,?)',
                                [order.id, custName, order.product_name, order.qty, order.total]
                            );
                        }
                    }
                );
            }
            res.json({ success: true });
        }
    );
});

// ===== EMPLOYEES =====
app.get('/api/employees', (req, res) => {
    db.query('SELECT id, name, address, phone, dob, role FROM employees', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/employees/login', (req, res) => {
    const { name, password } = req.body;
    db.query(
        'SELECT * FROM employees WHERE name=? AND password=?',
        [name, password],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) {
                res.json({ success: true, employee: results[0] });
            } else {
                res.json({ success: false, message: 'Invalid credentials' });
            }
        }
    );
});

// ===== SALES =====
app.get('/api/sales', (req, res) => {
    db.query('SELECT * FROM sales ORDER BY received_date DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/sales/summary', (req, res) => {
    db.query(
        'SELECT COUNT(*) as total_orders, IFNULL(SUM(total), 0) as total_sales FROM sales',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results[0]);
        }
    );
});

// ===== START SERVER =====
app.listen(3000, () => {
    console.log('🚀 PetShop API Server running at http://localhost:3000');
});