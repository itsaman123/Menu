require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SuperAdmin = require('./models/SuperAdmin');

const email    = process.env.SA_EMAIL    || 'superadmin@system.com';
const password = process.env.SA_PASSWORD || 'SuperSecret123!';
const reset    = process.argv.includes('--reset');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const hashed  = await bcrypt.hash(password, 12);
    const existing = await SuperAdmin.findOne({ email });

    if (existing) {
      if (reset) {
        existing.password = hashed;
        await existing.save();
        console.log(`SuperAdmin password reset for: ${email}`);
      } else {
        console.log(`SuperAdmin already exists: ${email} (run with --reset to overwrite password)`);
      }
    } else {
      await SuperAdmin.create({ email, password: hashed });
      console.log(`SuperAdmin created:`);
      console.log(`  Email   : ${email}`);
      console.log(`  Password: ${password}`);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
