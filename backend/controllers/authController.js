import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import { supabase } from '../config/supabaseClient.js';

export const register = async (req, res) => {
  try {
    // Step 1: Extract data from request
    const { user_id, password, name, email, role, class: userClass, semester } = req.body;
    
    // Step 2: Basic validation
    if (!user_id || !password || !name || !email || !role) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    // Step 3: Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('user_id')
      .or(`user_id.eq.${user_id},email.eq.${email}`)
      .limit(1);
    
    if (checkError) throw checkError;

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Step 4: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 5: Build insert payload
    const newUser = {
      user_id,
      password: hashedPassword,
      name,
      email,
      role
    };

    if (role === 'student') {
      if (!userClass || !semester) {
        return res.status(400).json({ error: "Class and semester are required for students" });
      }
      newUser.class = userClass;
      newUser.semester = semester;
    }

    // Step 6: Insert user
    const { data, error } = await supabase
      .from('users')
      .insert(newUser)
      .select('user_id, name, email, role, class, semester')
      .single();

    if (error) throw error;

    // Step 7: Success response
    res.status(201).json({
      message: "User registered successfully",
      user: data
    });

  } catch (error) {
    console.error('Registration error:', error.message);
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
      const { data: user, error } = await supabase
        .from('users')
        .select('user_id, password, name, email, role, class, semester')
        .eq('user_id', user_id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        throw error;
      }
      
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