DELIMITER //

-- 1. Room Availability Update Trigger
CREATE TRIGGER after_student_room_assignment
AFTER UPDATE ON room
FOR EACH ROW
BEGIN
    IF NEW.student_id IS NOT NULL THEN
        UPDATE room SET availability = FALSE WHERE id = NEW.id;
    ELSE
        UPDATE room SET availability = TRUE WHERE id = NEW.id;
    END IF;
END//

-- 2. Fee Payment History Trigger
CREATE TRIGGER before_fee_payment_update
BEFORE UPDATE ON fee
FOR EACH ROW
BEGIN
    IF NEW.status = 'Paid' AND OLD.status = 'Unpaid' THEN
        SET NEW.paid_date = CURRENT_TIMESTAMP;
        INSERT INTO payment_history (fee_id, student_id, amount, payment_date)
        VALUES (OLD.id, OLD.student_id, OLD.amount, CURRENT_TIMESTAMP);
    END IF;
END//

-- 3. Complaint Status History Trigger
CREATE TRIGGER after_complaint_status_change
AFTER UPDATE ON complaint
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO complaint_history (complaint_id, old_status, new_status, change_date)
        VALUES (OLD.id, OLD.status, NEW.status, CURRENT_TIMESTAMP);
    END IF;
END//

-- 4. Student Deletion Cleanup Trigger
CREATE TRIGGER before_student_delete
BEFORE DELETE ON student
FOR EACH ROW
BEGIN
    -- Update room availability
    UPDATE room SET availability = TRUE, student_id = NULL 
    WHERE student_id = OLD.id;
    
    -- Archive student data
    INSERT INTO student_archive (
        student_id, name, contact, date_of_birth, 
        deletion_date, reason
    )
    VALUES (
        OLD.id, OLD.name, OLD.contact, OLD.date_of_birth,
        CURRENT_TIMESTAMP, 'Student record deleted'
    );
END//

-- 5. Room Capacity Validation Trigger
CREATE TRIGGER before_room_assignment
BEFORE UPDATE ON room
FOR EACH ROW
BEGIN
    DECLARE current_occupants INT;
    
    IF NEW.student_id IS NOT NULL THEN
        -- Check room capacity
        SELECT COUNT(*) INTO current_occupants 
        FROM room 
        WHERE room_type = NEW.room_type 
        AND student_id IS NOT NULL;
        
        IF current_occupants >= NEW.capacity THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Room capacity exceeded';
        END IF;
    END IF;
END//

DELIMITER ; 