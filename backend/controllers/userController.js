import pool from "../config/database.js";

// Get all users
export const getUsers = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT user_id, name, email, role, class, semester FROM users");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Get users by role
export const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const result = await pool.query(
      "SELECT user_id, name, email, role, class, semester FROM users WHERE role = $1",
      [role]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT user_id, name, email, role, class, semester FROM users WHERE user_id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Create new user
export const createUser = async (req, res, next) => {
  try {
    const { user_id, password, name, email, role, class: userClass, semester } = req.body;
    
    if (!user_id || !password || !name || !email || !role) {
      return res.status(400).json({ error: "Required fields: user_id, password, name, email, role" });
    }

    const result = await pool.query(
      "INSERT INTO users (user_id, password, name, email, role, class, semester) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, name, email, role, class, semester",
      [user_id, password, name, email, role, userClass, semester]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
