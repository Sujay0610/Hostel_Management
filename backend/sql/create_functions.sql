DELIMITER //

-- Calculate Total Unpaid Fees for a Student
CREATE FUNCTION fn_get_unpaid_fees(p_student_id INT) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE total_unpaid DECIMAL(10,2);
    
    SELECT COALESCE(SUM(amount), 0)
    INTO total_unpaid
    FROM fee
    WHERE student_id = p_student_id 
    AND status = 'Unpaid';
    
    RETURN total_unpaid;
END //

-- Check Room Availability
CREATE FUNCTION fn_is_room_available(p_room_id INT) 
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE is_available BOOLEAN;
    
    SELECT availability
    INTO is_available
    FROM room
    WHERE id = p_room_id;
    
    RETURN is_available;
END //

-- Get Student Room Number
CREATE FUNCTION fn_get_student_room(p_student_id INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE room_id INT;
    
    SELECT id
    INTO room_id
    FROM room
    WHERE student_id = p_student_id;
    
    RETURN room_id;
END //

DELIMITER ; 