import mongoose from 'mongoose';


const connectDB = async ()=>{
    try {

      const connection = await mongoose.connect(process.env.MONGODB_URI);  //connect app to mongoose server
      console.log(`MongoDB connected Successfully: ${connection.connection.host}`);
      
    } catch (error) {

        console.error(`MongoDB connected Failed: ${error.message}`)
        throw new error;   //Creates and sends a new error. when JS sees throw it stop current fun execution and look for catch block to handle error

    }
}


export default connectDB;













