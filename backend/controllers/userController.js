import { supabase } from "../config/supabaseClient.js";

// Get all users
export const getUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, email, role, class, semester');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Get users by role
export const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, email, role, class, semester')
      .eq('role', role);
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, email, role, class, semester')
      .eq('user_id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "User not found" });
      }
      throw error;
    }
    
    res.json(data);
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

    const { data, error } = await supabase
      .from('users')
      .insert({
        user_id,
        password,
        name,
        email,
        role,
        class: userClass,
        semester
      })
      .select('user_id, name, email, role, class, semester')
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};
