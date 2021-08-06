require('dotenv').config()

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const AdminBro = require('admin-bro')
const AdminBroMongoose = require('@admin-bro/mongoose')
const AdminBroExpressjs = require('admin-bro-expressjs');
const bcrypt = require('bcryptjs');
const moment = require('moment')

//Load User model
const User = require('./models/User');

//Load Spot model
const Spot = require('./models/Spot');

//Load Booking model
const Booking = require('./models/Booking');

//Load Profile model
const Profile = require('./models/Profile');

//Load Profile model
const Feedback = require('./models/Feedback');

const app = express();

const server = require('http').Server(app);

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//public
app.use(express.static('public'))

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      url: db,
      collection: 'sessions'
    })
  })
);

//Cache Control
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
})

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  next();
});


//Admin Bro
const canModifyUsers = ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
const canEditEmp = ({ currentAdmin, record }) => {
  return currentAdmin && (
    currentAdmin.role === 'admin'
  )
}

AdminBro.registerAdapter(AdminBroMongoose)

const AdminBroOptions = {
  resources: 
  [{
    resource: Spot,
    options: {
      properties: {
        ownerId: { isVisible: { edit: false, show: true, list: true, filter: true } }
      },
      actions: {
        edit: { isAccessible: canEditEmp },
        delete: { isAccessible: canEditEmp },
        new: { isAccessible: canEditEmp },
      }
   }}, {
    resource: Booking,
    options: {
      properties: {
        ownerId: { isVisible: { edit: false, show: true, list: true, filter: true } }
      },
      actions: {
        edit: { isAccessible: canEditEmp },
        delete: { isAccessible: canEditEmp },
        new: { isAccessible: canEditEmp },
      }
   }}, {
    resource: Profile,
    options: {
      properties: {
        ownerId: { isVisible: { edit: false, show: true, list: true, filter: true } }
      },
      actions: {
        edit: { isAccessible: canEditEmp },
        delete: { isAccessible: canEditEmp },
        new: { isAccessible: canEditEmp },
      }
   }},{
    resource: Feedback,
    options: {
      properties: {
        ownerId: { isVisible: { edit: false, show: true, list: true, filter: true } }
      },
      actions: {
        edit: { isAccessible: canEditEmp },
        delete: { isAccessible: canEditEmp },
        new: { isAccessible: canEditEmp },
      }
   }},{
    resource: User,  
    options: {
      properties: {
        encryptedPassword: { isVisible: false },
        password: {
          type: 'string',
          isVisible: {
            list: false, edit: true, filter: false, show: false,
          },
        },
      },
      actions: {
        new: {
          before: async (request) => {
            if(request.payload.record.password) {
              request.payload.record = {
                ...request.payload.record,
                encryptedPassword: await bcrypt.hash(request.payload.record.password, 10),
                password: undefined,
              }
            }
            return request
          },
        },
        edit: { isAccessible: canModifyUsers },
        delete: { isAccessible: canModifyUsers },
        new: { isAccessible: canModifyUsers },
      }
    }
  }],
}

const adminBro = new AdminBro(AdminBroOptions)
const router = AdminBroExpressjs.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    const user = await User.findOne({ email })
      if (user) {
        if (password === user.password) {
          return user
        }
      }
        return false
      
  },
  cookiePassword: 'session Key',
})
app.use(adminBro.options.rootPath, router)



// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use((req, res) => res.render('404page'));

server.listen(3001, function () {
  console.debug(`Listening on port 3001`);
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('Socket connection established');
  socket.on('time', (data) => {
    console.log(data);
    const interval = setInterval(() => {
      var status = moment().add(1, 'seconds').format('YYYY-MM-DD hh:mm:ss');
      console.log(status, data);
      if (status == data) {
          socket.emit('finished', 200)
          clearInterval(interval);          
      }
  }, 1000);
  })
})









