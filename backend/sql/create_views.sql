-- Student Details View
CREATE OR REPLACE VIEW vw_student_details AS
SELECT 
    s.id,
    s.name,
    s.contact,
    s.date_of_birth,
    r.id as room_id,
    r.room_type,
    COUNT(c.id) as complaint_count,
    SUM(CASE WHEN f.status = 'Unpaid' THEN f.amount ELSE 0 END) as unpaid_fees
FROM student s
LEFT JOIN room r ON r.student_id = s.id
LEFT JOIN complaint c ON c.student_id = s.id
LEFT JOIN fee f ON f.student_id = s.id
GROUP BY s.id;

-- Room Occupancy View
CREATE OR REPLACE VIEW vw_room_occupancy AS
SELECT 
    r.id,
    r.room_type,
    r.capacity,
    r.availability,
    s.name as student_name,
    s.contact as student_contact
FROM room r
LEFT JOIN student s ON r.student_id = s.id;

-- Fee Status View
CREATE OR REPLACE VIEW vw_fee_status AS
SELECT 
    f.id,
    f.amount,
    f.due_date,
    f.paid_date,
    f.status,
    f.description,
    s.name as student_name,
    s.contact as student_contact
FROM fee f
JOIN student s ON f.student_id = s.id;

-- Complaint Status View
CREATE OR REPLACE VIEW vw_complaint_status AS
SELECT 
    c.id,
    c.description,
    c.status,
    c.date,
    s.name as student_name,
    s.contact as student_contact
FROM complaint c
JOIN student s ON c.student_id = s.id; 