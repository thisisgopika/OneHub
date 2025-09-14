## Person D's Contribution - Admin Features

This update adds a complete Admin Dashboard with system-wide statistics and class-based reporting.

### Key Changes:

* **New Backend APIs:** Implemented new endpoints for admin data retrieval.
    * `/api/admin/classes` - Gets a list of all classes for selection.
    * `/api/admin/system-stats` - Gets a count of all users, events, and registrations.
    * `/api/admin/classes/:className/dashboard` - Gets key statistics for a selected class.
    * `/api/admin/classes/:className/report` - Gets detailed participation data for a class.
    * `/api/admin/export/:className` - Placeholder endpoint for report export.

* **New Frontend Pages:** Created pages to display the data from the new APIs.
    * `SystemOverview.jsx`
    * `AdminClasses.jsx`
    * `ClassDashboard.jsx`
    * `ReportsTable.jsx`

### How to Test (for Teammates):

1.  **Pull my branch:**
    `git pull origin person-d-dashboards`

2.  **Log in as an Admin:** Use the admin credentials to log in.

3.  **Test the new pages:** Navigate to the following URLs to confirm the features are working:
    * **System Stats:** `http://localhost:5173/admin/system-stats`
    * **Class Dashboard:** `http://localhost:5173/admin/classes/S5 CS/dashboard`
    * **Reports Table:** `http://localhost:5173/admin/classes/S5 CS/report`