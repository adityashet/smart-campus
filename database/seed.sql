
BEGIN;

INSERT INTO departments (name, description) VALUES
('Electrical', 'Electrical systems and power issues'),
('Housekeeping', 'Cleaning and sanitation'),
('Civil Maintenance', 'Buildings, plumbing, and structural repairs'),
('IT Support', 'Campus network and computer facilities'),
('Security', 'Campus safety and access control'),
('General Administration', 'Other campus maintenance issues')
ON CONFLICT (name) DO NOTHING;

INSERT INTO locations (building, floor, room, description) VALUES
('Academic Block', 'Ground Floor', NULL, 'Academic block ground floor'),
('Academic Block', 'First Floor', NULL, 'Academic block first floor'),
('Library', 'Ground Floor', NULL, 'Central library'),
('Hostel Block A', NULL, NULL, 'Student hostel block A'),
('Hostel Block B', NULL, NULL, 'Student hostel block B'),
('Cafeteria', 'Ground Floor', NULL, 'Campus cafeteria'),
('Computer Lab', 'Second Floor', NULL, 'Computer laboratory'),
('Sports Complex', 'Ground Floor', NULL, 'Campus sports facilities')
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, default_department_id)
SELECT data.name, d.id
FROM (VALUES
    ('Electrical Issue', 'Electrical'),
    ('Cleaning', 'Housekeeping'),
    ('Plumbing', 'Civil Maintenance'),
    ('Building Damage', 'Civil Maintenance'),
    ('Internet or Wi-Fi', 'IT Support'),
    ('Computer or Lab Equipment', 'IT Support'),
    ('Safety Concern', 'Security'),
    ('Other', 'General Administration')
) AS data(name, department_name)
JOIN departments d ON d.name = data.department_name
ON CONFLICT (name) DO NOTHING;

COMMIT;
