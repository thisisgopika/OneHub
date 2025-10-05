import { supabase } from '../config/supabaseClient.js';

export const getClassList = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('class')
      .eq('role', 'student')
      .order('class');

    if (error) throw error;

    // Extract unique classes
    const uniqueClasses = [...new Set(data.map(row => row.class))].map(cls => ({ class: cls }));
    
    res.json(uniqueClasses);
  } catch (error) {
    console.error("Error in getClassList:", error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

export const getClassDashboard = async (req, res) => {
  try {
    const { class_name } = req.params;

    // Get total students in the class
    const { count: totalStudents, error: studentsError } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('class', class_name)
      .eq('role', 'student');

    if (studentsError) throw studentsError;

    // Get total events participated by class
    const { data: eventsData, error: eventsError } = await supabase
      .from('registrations')
      .select(`
        event_id,
        users!inner (
          class
        )
      `)
      .eq('users.class', class_name);

    if (eventsError) throw eventsError;

    const uniqueEvents = new Set(eventsData.map(r => r.event_id)).size;

    // Get total volunteers from class
    const { count: totalVolunteers, error: volunteersError } = await supabase
      .from('volunteer_applications')
      .select(`
        user_id,
        users!volunteer_applications_user_id_fkey!inner (
          class
        )
      `, { count: 'exact' })
      .eq('status', 'accepted')
      .eq('users.class', class_name);

    if (volunteersError) throw volunteersError;

    // Get active students (those who registered for events)
    const { data: activeStudentsData, error: activeStudentsError } = await supabase
      .from('registrations')
      .select(`
        user_id,
        users!inner (
          class
        )
      `)
      .eq('users.class', class_name);

    if (activeStudentsError) throw activeStudentsError;

    const activeStudentsCount = new Set(activeStudentsData.map(r => r.user_id)).size;

    const stats = {
      totalStudents: totalStudents || 0,
      eventParticipation: activeStudentsCount || 0,
      volunteerParticipation: totalVolunteers || 0,
      totalActivities: uniqueEvents || 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error in getClassDashboard:", error);
    res.status(500).json({ error: 'Failed to fetch class dashboard' });
  }
};

export const getClassReport = async (req, res) => {
  try {
    const { class_name } = req.params;
    const { semester } = req.query;

    // Get users of the specified class
    let userQuery = supabase
      .from('users')
      .select('name, user_id, semester')
      .eq('class', class_name);

    if (semester) {
      userQuery = userQuery.eq('semester', semester);
    }

    const { data: users, error: userError } = await userQuery;
    if (userError) throw userError;

    if (!users || users.length === 0) {
      return res.json([]);
    }

    const userIds = users.map(user => user.user_id);

    // Get registrations for these users
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('user_id, event_id, registration_date, semester')
      .in('user_id', userIds);

    if (regError) throw regError;

    // Get volunteer applications for these users
    const { data: volunteers, error: volError } = await supabase
      .from('volunteer_applications')
      .select('user_id, event_id, status, decision_date, semester')
      .in('user_id', userIds)
      .eq('status', 'accepted');

    if (volError) throw volError;

    // Get all event IDs
    const regEventIds = registrations.map(reg => reg.event_id);
    const volEventIds = volunteers.map(vol => vol.event_id);
    const allEventIds = [...new Set([...regEventIds, ...volEventIds])];

    // Get event details
    const { data: events, error: eventError } = await supabase
      .from('events')
      .select('event_id, name')
      .in('event_id', allEventIds);

    if (eventError) throw eventError;

    // Create maps for faster lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.user_id] = user;
    });

    const eventMap = {};
    events.forEach(event => {
      eventMap[event.event_id] = event;
    });

    // Build the report
    const report = [];

    // Add registrations
    registrations.forEach(reg => {
      const user = userMap[reg.user_id];
      const event = eventMap[reg.event_id];
      if (user && event) {
        report.push({
          name: user.name,
          user_id: user.user_id,
          semester: reg.semester,
          event_name: event.name,
          participation_type: 'Attendee',
          date: reg.registration_date
        });
      }
    });

    // Add volunteer applications
    volunteers.forEach(vol => {
      const user = userMap[vol.user_id];
      const event = eventMap[vol.event_id];
      if (user && event) {
        report.push({
          name: user.name,
          user_id: user.user_id,
          semester: vol.semester,
          event_name: event.name,
          participation_type: 'Volunteer',
          date: vol.decision_date
        });
      }
    });

    // Sort by date
    report.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(report);
  } catch (error) {
    console.error("Error in getClassReport:", error);
    res.status(500).json({ error: 'Report generation failed' });
  }
};

export const exportClassReport = async (req, res) => {
  try {
    res.json({ message: 'Export functionality is not yet implemented.' });
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
};

export const promoteClass = async (req, res) => {
  try {
    const { class_name } = req.params;
    const { promotionType } = req.body; // 'semester' or 'year'
    
    if (!promotionType || !['semester', 'year'].includes(promotionType)) {
      return res.status(400).json({ error: 'Invalid promotion type. Must be "semester" or "year".' });
    }
    
    // Get all students in the specified class
    const { data: students, error: fetchError } = await supabase
      .from('users')
      .select('user_id, class, semester')
      .eq('role', 'student')
      .eq('class', class_name);

    if (fetchError) throw fetchError;

    if (!students || students.length === 0) {
      return res.status(404).json({ error: 'No students found in this class' });
    }

    const updates = [];
    
    students.forEach(student => {
      let newClass = student.class;
      let newSemester = student.semester;

      if (promotionType === 'semester') {
        // Promote to next semester
        const currentSem = parseInt(student.semester) || 1;
        if (currentSem < 8) {
          newSemester = currentSem + 1;
          // Update class to reflect new semester 
          // Handle different patterns: 'S5 CS', 'S4 IT', etc.
          newClass = student.class.replace(/S\d+/, `S${newSemester}`);
        }
      } else if (promotionType === 'year') {
        // Promote to next year (skip one semester)
        const currentSem = parseInt(student.semester) || 1;
        if (currentSem < 7) {
          newSemester = currentSem + 2; // Skip to next year
          newClass = student.class.replace(/S\d+/, `S${newSemester}`);
        }
      }

      // Only add to updates if there's an actual change and the student is eligible
      if (newClass !== student.class || newSemester !== student.semester) {
        updates.push({
          user_id: student.user_id,
          class: newClass,
          semester: newSemester.toString()
        });
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ 
        error: 'No students eligible for promotion. Students may already be in final semester.' 
      });
    }

    // Perform individual updates for each student
    const updatePromises = updates.map(update => 
      supabase
        .from('users')
        .update({ 
          class: update.class, 
          semester: update.semester 
        })
        .eq('user_id', update.user_id)
    );

    const updateResults = await Promise.all(updatePromises);
    
    // Check for any errors
    const failedUpdates = updateResults.filter(result => result.error);
    if (failedUpdates.length > 0) {
      console.error('Some updates failed:', failedUpdates);
      throw new Error('Some student promotions failed');
    }

    res.json({ 
      message: `Successfully promoted ${updates.length} students`,
      promotedStudents: updates.length,
      promotionType,
      details: updates
    });

  } catch (error) {
    console.error("Error in promoteClass:", error);
    res.status(500).json({ error: 'Failed to promote class' });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const [users, events, registrations, volunteers] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact' }),
      supabase.from('events').select('*', { count: 'exact' }),
      supabase.from('registrations').select('*', { count: 'exact' }),
      supabase.from('volunteer_applications').select('*', { count: 'exact' }).eq('status', 'accepted')
    ]);

    const stats = {
      totalUsers: users.count || 0,
      totalEvents: events.count || 0,
      totalRegistrations: registrations.count || 0,
      totalVolunteers: volunteers.count || 0
    };
    res.json(stats);
  } catch (error) {
    console.error("Error in getSystemStats:", error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// ... your existing functions above ...

// NEW FUNCTION: Get Admin Dashboard with Class/Semester Performance
export const getAdminDashboard = async (req, res) => {
  try {
    // Fetch all dashboard data in parallel
    const [
      classPerformanceResult,
      semesterComparisonResult,
      topPerformersResult
    ] = await Promise.all([
      // Class performance table data
      supabase
        .from('class_semester_performance')
        .select('*')
        .order('engagement_rate', { ascending: false }),
      
      // Semester comparison cards
      supabase
        .from('semester_comparison')
        .select('*')
        .order('semester', { ascending: true }),
      
      // Top 10 performers leaderboard
      supabase
        .from('top_performing_classes')
        .select('*')
        .limit(10)
    ]);

    // Check for errors
    if (classPerformanceResult.error) throw classPerformanceResult.error;
    if (semesterComparisonResult.error) throw semesterComparisonResult.error;
    if (topPerformersResult.error) throw topPerformersResult.error;

    // Calculate overview stats
    const classPerformance = classPerformanceResult.data || [];
    const semesterComparison = semesterComparisonResult.data || [];
    
    const overviewStats = {
      total_classes: classPerformance.length,
      total_students: semesterComparison.reduce((sum, sem) => sum + (sem.total_students || 0), 0),
      avg_engagement: semesterComparison.length > 0 
        ? Math.round(semesterComparison.reduce((sum, sem) => sum + (sem.engagement_rate || 0), 0) / semesterComparison.length * 10) / 10
        : 0,
      active_semesters: semesterComparison.map(s => s.semester).join(', ')
    };

    res.json({
      success: true,
      data: {
        overview: overviewStats,
        classPerformance: classPerformanceResult.data,
        semesterComparison: semesterComparisonResult.data,
        topPerformers: topPerformersResult.data,
        lowPerformers: classPerformanceResult.data
          .filter(c => c.engagement_rate < 50)
          .slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// NEW FUNCTION: Get filtered class performance
export const getClassPerformance = async (req, res) => {
  try {
    const { semester, min_engagement } = req.query;
    
    let query = supabase
      .from('class_semester_performance')
      .select('*');
    
    if (semester) {
      query = query.eq('semester', parseInt(semester));
    }
    
    if (min_engagement) {
      query = query.gte('engagement_rate', parseFloat(min_engagement));
    }
    
    const { data, error } = await query.order('engagement_rate', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('Class performance error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};