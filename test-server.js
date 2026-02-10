require('dotenv').config();

console.log('1. App starting...');

try {
  const express = require('express');
  console.log('2. Express loaded');
  
  const app = express();
  console.log('3. App created');
  
  app.use(express.json());
  console.log('4. Middleware added');
  
  const authRouter = require('./routes/auth');
  console.log('5. Auth router loaded');
  app.use('/auth', authRouter);
  console.log('6. Auth router mounted');

  app.get('/', (req, res) => res.json({msg: 'ok'}));
  
  const server = app.listen(3000, () => {
    console.log('7. Server listening on 3000');
  });
  
  setTimeout(() => process.exit(0), 5000);
  
} catch (e) {
  console.error('❌ ERROR:', e.message);
  console.error(e.stack);
  process.exit(1);
}
