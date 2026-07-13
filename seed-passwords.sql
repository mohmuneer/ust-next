-- Password seed for all students
-- Default password: 123456
-- bcrypt hash: $2b$10$LdbgTxIOUnBNRozZU.ua9.CUdK1Pc.AUK1LKaveOnepfaCEZ2w0p6

UPDATE students SET password = '$2b$10$LdbgTxIOUnBNRozZU.ua9.CUdK1Pc.AUK1LKaveOnepfaCEZ2w0p6' WHERE password IS NULL;

UPDATE employees SET password = '$2b$10$LdbgTxIOUnBNRozZU.ua9.CUdK1Pc.AUK1LKaveOnepfaCEZ2w0p6' WHERE password IS NULL;
