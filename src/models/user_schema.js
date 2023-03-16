import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  username: String,
  email: String,
  password: String
});

const user = mongoose.model('user', userSchema);

export default user;
