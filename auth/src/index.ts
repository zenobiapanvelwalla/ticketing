import {app} from './app';
import mongoose from 'mongoose';


const start = async () => {
  if(!process.env.JWT_KEY){
    throw new Error('JWT_KEY secret not set in kubernetes cluster');
  }

  if(!process.env.AUTH_MONGO_URI){
    throw new Error('AUTH_MONGO_URI must be defined');
  }
  
  try{
    await mongoose.connect(process.env.AUTH_MONGO_URI);
    console.log('Connected to MongoDB');
  }catch(err){
    console.log('Mongo db connection error: ', err);
  }
  app.listen(3000, () => {
    console.log("Listening on Port 3000!");
  });
};

start();

