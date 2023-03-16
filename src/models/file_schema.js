import mongoose, { Schema } from 'mongoose';

const fileSchema = new Schema({
  industryName: String,
  buisnessProcess: String,
  customerID: String,
  file: String
});

const file = mongoose.model('file', fileSchema);

export default file;
