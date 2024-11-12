DELIMITER //

-- Add Student with Room Assignment
CREATE PROCEDURE sp_add_student(
    IN p_name VARCHAR(100),
    IN p_contact VARCHAR(20),
    IN p_date_of_birth DATE,
    IN p_room_id INT
)
BEGIN
    DECLARE new_student_id INT;
    
    START TRANSACTION;
    
    INSERT INTO student (name, contact, date_of_birth)
    VALUES (p_name, p_contact, p_date_of_birth);
    
    SET new_student_id = LAST_INSERT_ID();
    
    IF p_room_id IS NOT NULL THEN
        UPDATE room 
        SET student_id = new_student_id,
            availability = FALSE
        WHERE id = p_room_id AND availability = TRUE;
    END IF;
    
    COMMIT;
END //

-- Add Fee with Notification
CREATE PROCEDURE sp_add_fee(
    IN p_student_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_due_date DATE,
    IN p_description VARCHAR(200)
)
BEGIN
    INSERT INTO fee (student_id, amount, due_date, description)
    VALUES (p_student_id, p_amount, p_due_date, p_description);
    
    -- Here you could add notification logic
END //

-- Update Complaint Status
CREATE PROCEDURE sp_update_complaint_status(
    IN p_complaint_id INT,
    IN p_status VARCHAR(20)
)
BEGIN
    UPDATE complaint
    SET status = p_status
    WHERE id = p_complaint_id;
END //

-- Generate Room Availability Report
CREATE PROCEDURE sp_generate_room_report(
    IN p_admin_id INT
)
BEGIN
    INSERT INTO report (report_type, admin_id)
    VALUES ('Room Availability', p_admin_id);
    
    SELECT 
        room_type,
        COUNT(*) as total_rooms,
        SUM(CASE WHEN availability = TRUE THEN 1 ELSE 0 END) as available_rooms
    FROM room
    GROUP BY room_type;
END //

DELIMITER ; 