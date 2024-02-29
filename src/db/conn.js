const mongoose=require('mongoose')

const MONGOURI='mongodb+srv://alexmwend9mern1:GEtcdrX9OVO3dotT@cluster0.teojpl5.mongodb.net/';
 mongoose.connect(MONGOURI,{ 
   useNewUrlParser: true,
   useUnifiedTopology: true,
   
   
 });
 const db=mongoose.connection;
 db.on('error',console.error.bind(console,'MongoDB connection error:'));
 db.once('open',()=>{
    console.log('connected to MongoDB');
 })
      
      
   
  
 