// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs=require('fs')
const calculatedTotalRevenue = require('./public/util');
require('./db/conn')
const app = express();
const session = require('express-session'); 
const flash = require('connect-flash');
const port = process.env.PORT || 4000;
const moment = require('moment');
// Connect to MongoDB


// Define a MongoDB schema and model
const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    resetToken: String,
    resetTokenExpiration: Date,
});

const User = mongoose.model('Admin', userSchema);

//Define Products Schema
const productSchema = new mongoose.Schema({
  name: String,
  category:String,
  description: String,
  dimensions:String,
  pdimensions:String,
  weight:String,
  width:String,
  height:String,
  depth:String,
  style:String,
  material:String,
  color:String,
  shape:String,
  stock:String,
  price: String,
  discount:String,
  delivery:String,
  doorway:String,
  time:String,
  mainImage: { data: Buffer, contentType: String },
  otherImages: [{ data: Buffer, contentType: String }],
});

const Product = mongoose.model('Product', productSchema);

//Define Deals Schema

const dealSchema = new mongoose.Schema({
  name: String,
  category:String,
  description: String,
  dimensions:String,
  pdimensions:String,
  weight:String,
  width:String,
  height:String,
  depth:String,
  style:String,
  material:String,
  color:String,
  shape:String,
  stock:String,
  price: String,
  discount:String,
  delivery:String,
  doorway:String,
  time:String,
  mainImage: { data: Buffer, contentType: String },
  otherImages: [{ data: Buffer, contentType: String }],
});

const Deal = mongoose.model('Deal', dealSchema);




const orderSchema = new mongoose.Schema({
  cartId: String,
  name: String,
  email: String,
  contact:String,
  country: String,
  city: String,
  address: String,
  paymentoption: String,
  products: [{
    name: String,
    image: String,
    quantity: String,
  }],
  totalprice: String,
  paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'pending' },
  orderDateTime:String,
  paymentorderDateTime:String,
  deliveryStatus: { type: String, enum: ['pending', 'success'], default: 'pending' }
});
  

const Order = mongoose.model('Order', orderSchema);


//Multer middleware for handling file uploads as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
      secret: 'Mern@root2023',
      resave: true,
      saveUninitialized: true,
    })
  );
app.use(flash());

// Serve the registration form


// Validation middleware
const validateRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirm-password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
];



app.post('/submit', validateRegistration, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
      // Render the registration form with validation errors
      return res.render('index', { errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          // Email exists
          req.flash('error', 'Email already exists');
          return res.render('index', { errors: [{ msg: 'Email already exists' }] });
      }


       // Hash the password
     const hashedPassword = await bcrypt.hash(password, 10);
      // Create a new user
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      // User created successfully
      //req.flash('success', 'User registration was successfull');
      //res.render('forgot', { error: req.flash('error'), success: req.flash('success') });
      res.redirect('/login');
  } catch (error) {
      console.error('Error saving user:', error.message);
     req.flash('error', 'Internal Server Error');
      return res.render('index', { errors: [{ msg: 'Internal Server Error' }] });
  }
});

// ...

// Retrieve users from MongoDB and display on the form
// ...

// Retrieve users from MongoDB and display on the form
app.get('/users', async (req, res) => {
try {
  const users = await User.find();
  res.render('index', { users, errors: null });
} catch (error) {
  console.error('Error fetching users:', error.message);
  req.flash('error', 'Internal Server Error');
  return res.render('index', { errors: [{ msg: 'Internal Server Error' }] });
}
});


//POST Products
app.post('/products', upload.array('images', 12), async (req, res) => {
  const { name, category, description, dimensions,pdimensions, material, stock, color, price,discount,weight,width,height,depth,style,shape,delivery,doorway,time, } = req.body;
  const images = req.files.map(file => ({ data: file.buffer, contentType: file.mimetype }));

  try {
    const newProduct = new Product({
      name,
      category,
      description,
      dimensions,
      pdimensions,
      weight,
      width,
      height,
      depth,
      style,
      material,
      color,
      shape,
      stock,
      price,
      discount,
      delivery,
      doorway,
      time,
      mainImage: { data: images[0].data, contentType: images[0].mimetype },
      otherImages: images.slice(1).map(image => ({ data: image.data, contentType: image.mimetype })),
    });
    await newProduct.save();
    res.redirect('/products'); // Redirect to a page where you display all deals
  } catch (error) {
    console.error('Error saving deal:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
//Update products

app.get('/allproducts', async (req, res) => {
  try {
      // Retrieve products from MongoDB
      const products = await Product.find();

      // Render the form and pass the products to the template
      res.render('products', { products });
  } catch (error) {
      console.error('Error fetching products:', error.message);
      res.status(500).send('Internal Server Error');
  }
});
//app.get('/allproducts', async (req, res) => {
 // res.render('products')
//});




//get Products
app.get('/products', async (req, res) => {
  res.render('AddNewProduct')
});





// Route to handle the form submission and save data to MongoDB
app.post('/deals', upload.array('images', 12), async (req, res) => {
  const { name, category, description, dimensions,pdimensions,weight,width,height,depth,style,material, color, shape,stock,price,discount,delivery,doorway,time, } = req.body;
  const images = req.files.map(file => ({ data: file.buffer, contentType: file.mimetype }));

  try {
    const newDeal = new Deal({
      name,
      category,
      description,
      dimensions,
      pdimensions,
      weight,
      width,
      height,
      depth,
      style,
      material,
      color,
      shape,
      stock,
      price,
      discount,
      delivery,
      doorway,
      time,
      mainImage: { data: images[0].data, contentType: images[0].mimetype },
      otherImages: images.slice(1).map(image => ({ data: image.data, contentType: image.mimetype })),
    });
    await newDeal.save();
    res.redirect('/deals'); // Redirect to a page where you display all deals
  } catch (error) {
    console.error('Error saving deal:', error.message);
    res.status(500).send('Internal Server Error');
  }
});



//Update deals

app.get('/alldeals', async (req, res) => {
  try {
      // Retrieve deals from MongoDB
      const deals = await Deal.find();

      // Render the form and pass the products to the template
      res.render('deals', { deals });
  } catch (error) {
      console.error('Error fetching deals:', error.message);
      res.status(500).send('Internal Server Error');
  }
});




app.get('/orders', async (req, res) => {
  try {
    // Fetch orders from MongoDB
    const orders = await Order.find();
    const totalOrdersCount = orders.length;
    // Render the EJS template with the fetched data
    res.render('order', { orders,moment,totalOrdersCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/orderdetails', async (req, res) => {
  try {
    // Fetch orders from MongoDB or based on the cartId from the query parameters
    const cartId = req.query.cartId;
    const order = await Order.findOne({ cartId });

    // Render the EJS template with the fetched order data
    res.render('orderdetails', { order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/updateOrder', async (req, res) => {
  const { cartId, paymentStatus, deliveryStatus } = req.body;

  try {
    // Get the current date and time
    const currentDate = new Date();
    
    // Format the current date and time in the desired format
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(currentDate);

    // Update the paymentStatus, deliveryStatus, and paymentorderDateTime fields
    const updatedOrder = await Order.findOneAndUpdate(
      { cartId },
      { 
        paymentStatus, 
        deliveryStatus, 
        paymentorderDateTime: formattedDate // Update the paymentorderDateTime field
      },
      { new: true }
    );

    // Render the EJS template with the updated order data
    res.render('orderdetails', { updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/customers', async (req, res) => {
  try {
    // Fetch orders from MongoDB
    const orders = await Order.find();

    // Render the EJS template with the fetched data
    res.render('customers', { orders,moment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/productdetails', async (req, res) => {
  try {
    // Fetch orders from MongoDB or based on the cartId from the query parameters
    const name = req.query.name;
    const product = await Product.findOne({ name });
    const products = await Product.find();
    // Render the EJS template with the fetched order data
    res.render('productdetails', { product,products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/dealdetails', async (req, res) => {
  try {
    // Fetch orders from MongoDB or based on the cartId from the query parameters
    const name = req.query.name;
    const deal = await Deal.findOne({ name });
    const deals = await Deal.find();
    // Render the EJS template with the fetched order data
    res.render('dealdetails', { deal,deals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




//get Deals
app.get('/deals', async (req, res) => {
  res.render('offers')
});


// Serve the registration form
app.get('/register', (req, res) => {
res.render('index', { errors: null });
});

app.get('/', (req, res) => {
  res.render('login', { error: req.flash('error'),success: req.flash('success')  });
  
});


app.get('/login', (req, res) => {
  res.render('login', { error: req.flash('error'),success: req.flash('success')  });
  
});
// ...
// Handle login form submission
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'Invalid email or password');
      //const alertMessage="Invalid email or password";
      //res.render('layout',{alertMessage});
      return res.redirect('/login');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      req.flash('error', 'Invalid email or password');
      //const alertMessage="Invalid email or password";
      //res.render('layout',{alertMessage});
      return res.redirect('/login');
    }
    
// Authentication successful
  req.flash('success', 'Login successful');

  return res.redirect('/dashboard');
// Redirect to the dashboard or another page
   
    
  } catch (error) {
    console.error('Error during login:', error.message);
    req.flash('error', 'Internal Server Error');
    return res.redirect('/login');
  }
});



 // Add this line if not already imported

 app.get('/dashboard', async (req, res) => {
  try {
    // Fetch all orders from MongoDB
    const allOrders = await Order.find();

    // Fetch paid orders based on the selected period
    const selectedPeriod = req.query.period || 'Today so far';
    const paidOrders = await getOrdersByPeriod(allOrders, selectedPeriod);

    // Calculate total revenue based on paid orders
    const totalRevenue = calculatedTotalRevenue(paidOrders);

    // Render the EJS template with the fetched data, including selectedPeriod
    res.render('dashboard', { orders: allOrders, moment, totalOrdersCount: allOrders.length, paidOrders, totalRevenue, selectedPeriod });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to get paid orders based on the selected period
function getOrdersByPeriod(allOrders, period) {
  const currentDate = new Date();

  if (period === 'Today so far') {
    return allOrders.filter(order => order.paymentStatus === 'paid' && new Date(order.paymentorderDateTime) <= currentDate);
  } else if (period === 'Yesterday') {
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
    return allOrders.filter(order => order.paymentStatus === 'paid' && new Date(order.paymentorderDateTime) >= startOfYesterday && new Date(order.paymentorderDateTime) <= endOfYesterday);
  } else if (period === 'This week') {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week (Sunday)
    return allOrders.filter(order => order.paymentStatus === 'paid' && new Date(order.paymentorderDateTime) >= startOfWeek && new Date(order.paymentorderDateTime) <= currentDate);
  } else if (period === 'This month') {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return allOrders.filter(order => order.paymentStatus === 'paid' && new Date(order.paymentorderDateTime) >= startOfMonth && new Date(order.paymentorderDateTime) <= currentDate);
  } else {
    // Add logic for other periods if needed
    // Adjust the date based on other periods like 'Last 7 Days', 'Last 30 Days', etc.
  }
}




// Existing code




// Existing code

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'alexmwend9@gmail.com',
    pass: 'lomg sxfh yhef uclp',
  },
});

// JWT secret key
const jwtSecretKey = '@Mern2024';

// Serve the forgot password form
app.get('/forgot_password', (req, res) => {
  res.render('forgot', { error: req.flash('error'),success: req.flash('success') });
});


//href links
app.get('/forgotpassword', (req, res) => {
  res.render('forgot', { error: req.flash('error'),success: req.flash('success') });
});

app.get('/registerpage', (req, res) => {
  res.render('index', { errors: null });
});
app.get('/loginpage', (req, res) => {
  res.render('login', { error: req.flash('error'),success: req.flash('success') });
});




app.get('/forgot', (req, res) => {
  res.render('forgot', { error: req.flash('error'),success: req.flash('success')  });
});


// Handle password reset initiation
app.post('/forgot_password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });

    if (!user) {

      req.flash('error', 'User not found');
      return res.redirect('/forgot');
  }
  
   

    const resetToken = jwt.sign({ userId: user._id }, jwtSecretKey, { expiresIn: '1h' });

    user.resetToken = resetToken;
    user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now
    await user.save();

    const resetLink = `http://localhost:3000/reset_password/${resetToken}`;

    const mailOptions = {
      from: 'alexmwend9@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        req.flash('error', 'Error sending mail');
      }

      console.log('Email sent:', info.response);
      //res.json({ message: 'Password reset email sent successfully' });
      req.flash('success','Password reset email sent successfully');
      return res.redirect('/login');
    });
  } catch (error) {
    console.error('Error initiating password reset:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Serve the reset password form
app.get('/reset_password', (req, res) => {
  const { token } = req.params;
  res.render('reset_password', { token, error: req.flash('error'),success: req.flash('success')  });
 //res.render('reset', { error: req.flash('error') });
});
//app.get('/reset', (req, res) => {
 // const { token } = req.params;
  
 // res.render('reset_password', { token, error: req.flash('error') });
 //res.render('reset', { error: req.flash('error') });
//});

// Serve the reset password form
app.get('/reset_password/:token', (req, res) => {
  const { token } = req.params;
  //console.log('Token:', token); 
  res.render('reset_password', { token, error: req.flash('error'),success: req.flash('success')  });
});


// Handle password reset
app.post('/reset_password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decodedToken = jwt.verify(token, jwtSecretKey);

    if (!decodedToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOne({
      _id: decodedToken.userId,
      resetToken: token,
      resetTokenExpiration: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
     return res.render('login', { token, error: req.flash('error'),success: req.flash('success')  });
   // res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





