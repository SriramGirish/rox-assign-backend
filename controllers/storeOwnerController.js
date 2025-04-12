const pool = require("../config/db");

// 🧍‍♂️ Get users who rated this owner's store
exports.getStoreRatings = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT u.id as user_id, u.name as user_name, u.email, r.rating
      FROM ratings r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN stores s ON s.id = r.store_id
      WHERE s.owner_id = $1
      `,
      [ownerId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ⭐ Get average rating of their store
exports.getAverageRating = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT s.name, ROUND(AVG(r.rating)::numeric, 1) AS average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id
      `,
      [ownerId]
    );

    res.json(result.rows[0] || { average_rating: null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
