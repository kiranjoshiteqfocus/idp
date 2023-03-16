import app from './app';
import mongoose from 'mongoose';

//connect to mongodb
async function connect(){
  try{
    mongoose.connect(process.env.MONGODB_URI, {
      useCreateIndex: true,
      useNewUrlParser: true
    });
    console.log("Connected to the database");
  }catch(error){
    console.log(`Error => ${error}`);
  }
}

connect()

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on ${port}`);
});
