const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

// Form Validation helpers
const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validatePassword = (pw) =>
  /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(pw);

exports.register = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !validateEmail(email) ||
    !validatePassword(password) ||
    name.length < 20 ||
    name.length > 60 ||
    address.length > 400
  ) {
    return res.status(400).json({ message: "Invalid form input" });
  }

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, hashedPassword, address, role || "user"]
    );

    const token = generateToken(newUser.rows[0]);

    res.status(201).json({ user: newUser.rows[0], token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
