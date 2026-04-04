require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SuperAdmin = require('./models/SuperAdmin');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    const existing = await SuperAdmin.findOne({ email: 'superadmin@system.com' });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('SuperSecret123!', salt);
      
      await SuperAdmin.create({
        email: 'superadmin@system.com',
        password: hashedPassword
      });
      console.log('SuperAdmin created: superadmin@system.com / SuperSecret123!');
    } else {
      console.log('SuperAdmin already exists.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
