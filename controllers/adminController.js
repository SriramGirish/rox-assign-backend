const pool = require("../config/db");

// 🧠 Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const storesCount = await pool.query("SELECT COUNT(*) FROM stores");
    const ratingsCount = await pool.query("SELECT COUNT(*) FROM ratings");

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Add User (Normal/Admin)
exports.addUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, hashedPassword, address, role || "user"]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Add Store
exports.addStore = async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  try {
    const newStore = await pool.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, address, owner_id]
    );

    res.status(201).json(newStore.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 View All Users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, address, role FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 View All Stores with Ratings
exports.getAllStores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.email, s.address, AVG(r.rating)::numeric(2,1) as avg_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔍 Filter Users/Stores (by name/email/address/role)
exports.filterUsers = async (req, res) => {
  const { name, email, address, role } = req.query;

  let query = "SELECT * FROM users WHERE 1=1";
  const params = [];

  if (name) {
    params.push(`%${name}%`);
    query += ` AND name ILIKE $${params.length}`;
  }
  if (email) {
    params.push(`%${email}%`);
    query += ` AND email ILIKE $${params.length}`;
  }
  if (address) {
    params.push(`%${address}%`);
    query += ` AND address ILIKE $${params.length}`;
  }
  if (role) {
    params.push(role);
    query += ` AND role = $${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
