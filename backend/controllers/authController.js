import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import pool from '../config/database.js';
export const register = async (req, res) => {
    try {
      // Step 1: Extract data from request
      const { user_id, password, name, email, role } = req.body;
      
      // Step 2: Basic validation
      if (!user_id || !password || !name || !email) {
        return res.status(400).json({ error: "All fields required" });
      }
      
      // Check if user already exists in database
      const existingUser = await pool.query(
        'SELECT user_id FROM users WHERE user_id = $1 OR email = $2',
        [user_id, email]
      ); //pool.query runs an sql query on the db , parameterized query is used here
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      } // it means we found a duplicate , at least one record is found

      //  Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
     
      //  Insert into database
      const result = await pool.query(
      'INSERT INTO users (user_id, password, name, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, role',
       [user_id, hashedPassword, name, email, role]
      ); // the array contains the actual values that replaces those placeholders
      
      //  Return success response
      const newUser = result.rows[0]; // Get the inserted user data
      res.status(201).json({
      message: "User registered successfully",
      user: newUser
      });
      
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  };

  export const login = async (req, res) => {
    try {
      // 1. Check JWT secret is configured (do this FIRST)
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET environment variable is not configured');
        return res.status(500).json({ error: "Server configuration error" });
      }
  
      // 2. Extract credentials from request
      const { user_id, password } = req.body;
      
      // 3. Basic validation
      if (!user_id || !password) {
        return res.status(400).json({ error: "User ID and password required" });
      }
      
      // 4. Find user in database
      const userResult = await pool.query(
        'SELECT user_id, password, name, email, role, class, semester FROM users WHERE user_id = $1',
        [user_id]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const user = userResult.rows[0];
      
      // 5. Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // 6. Generate JWT token (JWT_SECRET already validated above)
      const token = jwt.sign(
        { 
          user_id: user.user_id,
          role: user.role,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // 7. Return success response
      res.json({
        message: "Login successful",
        token: token,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
      
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ error: "Login failed" });
    }
  };