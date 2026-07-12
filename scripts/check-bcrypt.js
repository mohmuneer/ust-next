const bcrypt = require('bcryptjs');

const hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
console.log('Current hash works with "password":', bcrypt.compareSync('password', hash));

const newHash = bcrypt.hashSync('12345678', 10);
console.log('New hash for 12345678:', newHash);
console.log('Verify:', bcrypt.compareSync('12345678', newHash));
