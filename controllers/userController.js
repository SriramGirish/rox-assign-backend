const pool = require("../config/db");

// 📄 Get all stores + search + include avg + user rating
exports.getAllStores = async (req, res) => {
  const userId = req.user.id;
  const { search } = req.query;

  try {
    let query = `
      SELECT s.id, s.name, s.address,
        ROUND(AVG(r.rating)::numeric, 1) AS average_rating,
        ur.rating AS user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
    `;
    const params = [userId];

    if (search) {
      query += ` WHERE s.name ILIKE $2 OR s.address ILIKE $2`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY s.id, ur.rating`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ⭐ Submit or Update Rating
exports.submitRating = async (req, res) => {
  const userId = req.user.id;
  const { store_id, rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    // Check if rating exists
    const check = await pool.query(
      "SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2",
      [userId, store_id]
    );

    let result;
    if (check.rows.length > 0) {
      result = await pool.query(
        "UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3 RETURNING *",
        [rating, userId, store_id]
      );
    } else {
      result = await pool.query(
        "INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *",
        [userId, store_id, rating]
      );
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
