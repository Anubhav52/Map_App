const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const pinRoutes = require('./routes/pins');
const userRoutes = require('./routes/users');

const app = express();

dotenv.config();

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDb connected!');
  })
  .catch((err) => console.log(err));

app.use('/api/pins', pinRoutes);
app.use('/api/users', userRoutes);

app.listen(8800, () => {
  console.log('Backend is running on port 8800');
});
