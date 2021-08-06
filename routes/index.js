const express = require('express');
const router = express.Router();


const moment = require('moment')

//Node-Notifier
const notifier = require('node-notifier');

const { ensureAuthenticated } = require('../config/auth');

//File Upload
const spotUpload = require('../config/fileupload/spotUpload');
const profileUpload = require('../config/fileupload/profileUpload');


//Load User model
const User = require('../models/User');

//Load Spot model
const Spot = require('../models/Spot');

//Load Booking model
const Booking = require('../models/Booking');

//Load Profile model
const Profile = require('../models/Profile');

//Load Profile model
const Feedback = require('../models/Feedback');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Add your Secret Key Here

// Welcome Page
router.get('/', (req, res) => {
  Spot.find({
  }).sort({
    date: -1
  }).then(spot => {
    var id = spot.map(data => data._id);
    var area = spot.map(data => data.area);
    var capacity = spot.map(data => data.capacity);
    var email = spot.map(data => data.email);
    var firstname = spot.map(data => data.firstname);
    var pic = spot.map(data => data.pic);
    var createdAt = spot.map(data => data.createdAt);
    var length;

    if (area.length < 8) {
      length = area.length;
    }
    else {
      length = 8;
    }
    res.render('welcome', {
      spot: spot,
      id: id,
      firstname: firstname,
      email: email,
      area: area,
      len: length,
      capacity: capacity,
      file: pic,
      createdAt: createdAt
    });
  });
});

// About Page
router.get('/about', (req, res) => res.render('about'));

// Feedback Page
router.post('/feedback', (req, res) => {
  const email = req.body.email;
  const feedback = req.body.feedback;

  if (!email || !feedback) {
    req.flash('error_msg', 'Please enter the details!');
    res.redirect('/');
  }

  const fb = new Feedback({
    email: email,
    feedback: feedback
  })

  fb.save().then(() => {
      req.flash('success_msg', 'Your feedback has been sent successfully!');
      res.redirect('/');
  })
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  var profileMode = req.user.profileMode;
  if(profileMode == 'updated') {
    Profile.findOne({
      email: req.user.email
    }).then((result) => {
      res.render('dashboard', {
      user: req.user,
      id: result._id,
      firstname: result.firstname,
      lastname: result.lastname,
      email: result.email,
      address: result.address,
      city: result.city,
      state: result.state,
      zip: result.zip,
      username: result.username,
      bio: result.bio,
      profilepic: result.profilepic,
      prefered: result.prefered,
      plateno: result.plateno,
      idproof: result.idproof
      });
    }).catch((err) => console.log(err));
  } else if(profileMode == 'edit') {
    Profile.findOne({
      email: req.user.email
    }).then((result) => {
      res.render('editprofile', {
      user: req.user,
      id: result._id,
      firstname: result.firstname,
      lastname: result.lastname,
      email: result.email,
      address: result.address,
      city: result.city,
      state: result.state,
      zip: result.zip,
      username: result.username,
      bio: result.bio,
      profilepic: result.profilepic,
      prefered: result.prefered,
      plateno: result.plateno,
      idproof: result.idproof
      });
    }).catch((err) => console.log(err));
  }  else {
  res.render('profile', {
    user: req.user,
    firstname: req.user.firstname,
    lastname: req.user.lastname,
    email: req.user.email
  })
}
});

//Profile
router.post('/profile', ensureAuthenticated, (req, res) => {
    profileUpload(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err);
      res.redirect('/dashboard');
    } else {
      if (req.file == undefined) {
        req.flash('error_msg', 'No file uploaded!');
      res.redirect('/dashboard');
      } else {
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var address = req.body.address;
        var city = req.body.city;
        var state = req.body.state;
        var zip = req.body.zip;
        var username = req.body.username;
        var bio = req.body.bio;
        var profilepic = req.file.filename;
        var prefered = req.body.prefered;
        var plateno = req.body.plateno;
        var idproof = req.body.idproof;

        var profile = new Profile({
          firstname: firstname,
          lastname: lastname,
          email: email,
          address: address,
          city: city,
          state: state,
          zip: zip,
          username: username,
          bio: bio,
          profilepic: profilepic,
          prefered: prefered,
          plateno: plateno,
          idproof: idproof
        });

        profile.save().then((result) => {
          User.findOne({
            email: email
          }).then((user) => {
            user.profileMode = 'updated';
            user.save().then();
          }).catch((err) => console.log(err));
          req.flash('success_msg', 'You have updated your profile successfully!');
          res.redirect('/dashboard');
        }).catch((err) => {
          console.log(err);
        })
      }
    }
  })
});

router.get('/editprofile', ensureAuthenticated, (req, res) => {

  Profile.findOne({
    email: req.user.email
  }).then((result) => {
                  User.findOne({
                    email: result.email
                  }).then((user) => {
                    user.profileMode = 'edit';
                    user.save().then(() => {
                    console.log('User displayed for editing profile...');
                              }).catch((err) => {
                                  console.log(err);
                                })
                  }).catch((err) => {
                        console.log(err);
                  });
     req.flash('success_msg', 'Profile displayed for editing!');
     res.redirect('/dashboard');
  }).catch((err) => console.log(err))
});

//Edit Profile
router.post('/editprofile/:id', (req, res) => {
  var id = req.params.id;
  // var profile = Profile.findById(id).then((result) => {
  //   console.log(result);
  // });
  profileUpload(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err);
      res.redirect('/dashboard');
    } else {
      if (req.file == undefined) {
        req.flash('error_msg', 'No file uploaded!');
      res.redirect('/dashboard');
      } else {
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var address = req.body.address;
        var city = req.body.city;
        var state = req.body.state;
        var zip = req.body.zip;
        var username = req.body.username;
        var bio = req.body.bio;
        var profilepic = req.file.filename;
        var prefered = req.body.prefered;
        var plateno = req.body.plateno;
        var idproof = req.body.idproof;

        Profile.findOne({_id: id}).then((profile) => {
          profile.username = username;
          profile.email = email;
          profile.address = address;
          profile.city = city;
          profile.state = state;
          profile.zip = zip;
          profile.bio = bio;
          profile.profilepic = profilepic;
          profile.prefered = prefered;
          profile.plateno = plateno;

          profile.save().then();
        })
        Profile.findOne({
          _id: id
        }).then((result) => {
          User.findOne({
            email: result.email
          }).then((user) => {
            user.profileMode = 'updated';
            user.save().then();
          })
          req.flash('success_msg', 'Profile updated successfully');
          res.redirect('/dashboard');
        })

      }
    }
  })
});

//Search Bar
router.post('/search', (req, res) => {
  const searchLocation = req.body.searchLocation;
  if (searchLocation == '') {
    req.flash('error_msg', 'Please provide an area!')
    res.redirect('/spots');
  }
  Spot.find({
    area: searchLocation
  }).sort({
    createdAt: -1
  }).then(spot => {
    console.log(spot);
    var id = spot.map(data => data._id);
    var area = spot.map(data => data.area);
    var capacity = spot.map(data => data.capacity);
    var email = spot.map(data => data.email);
    var firstname = spot.map(data => data.firstname);
    var pic = spot.map(data => data.pic);
    var createdAt = spot.map(data => data.createdAt);
    var userEmailInSession = req.user.email;
    var userFirstNameInSession = req.user.firstname;
    res.render('spots', {
      spot: spot,
      id: id,
      firstname: firstname,
      email: email,
      userEmailInSession: userEmailInSession,
      userFirstNameInSession: userFirstNameInSession,
      area: area,
      len: area.length,
      capacity: capacity,
      file: pic,
      createdAt: createdAt
    });
  });
});

//Post a spot
router.post('/postspot',ensureAuthenticated, (req, res) => {
  spotUpload(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err);
      res.redirect('/dashboard');
    } else {
      if (req.file == undefined) {
        req.flash('error_msg', 'No file uploaded!');
      res.redirect('/dashboard');
      } else {
            const email = req.body.email;
            const firstname = req.body.firstname;
            const area = req.body.area;
            const pic = req.file.filename;
            const capacity = req.body.capacity;
            const createdAt = moment().format('DD-MM-YYYY');

            if (!area || !capacity) {
              req.flash('error', 'Please enter details!');
              res.redirect('/dashboard');
            }

            const newSpot = new Spot({
            email: email,
            firstname: firstname,
            area: area,
            pic: pic,
            capacity: capacity,
            createdAt: createdAt
          });

          newSpot.save().then((booking) => {
            req.flash('success_msg', 'Spot Posted');
            res.redirect('/spots')
           });
      }
    }
  })
});

router.get('/spots', ensureAuthenticated, (req, res) => {
  Spot.find({
  }).sort({
    date: -1
  }).then(spot => {
    var id = spot.map(data => data._id);
    var area = spot.map(data => data.area);
    var capacity = spot.map(data => data.capacity);
    var email = spot.map(data => data.email);
    var firstname = spot.map(data => data.firstname);
    var pic = spot.map(data => data.pic);
    var createdAt = spot.map(data => data.createdAt);
    var userEmailInSession = req.user.email;
    var userFirstNameInSession = req.user.firstname;
    res.render('spots', {
      spot: spot,
      id: id,
      firstname: firstname,
      email: email,
      userEmailInSession: userEmailInSession,
      userFirstNameInSession: userFirstNameInSession,
      area: area,
      len: area.length,
      capacity: capacity,
      file: pic,
      createdAt: createdAt
    });
  });
})

router.post('/bookdata', ensureAuthenticated, (req, res) => {
  var firstname = req.body.firstname;
  var email = req.body.email;
  var userEmailWhoBooked = req.body.userEmailInSession;
  var userFirstNameWhoBooked = req.body.userFirstNameInSession;
  var vno = req.body.vno;
  var time = req.body.time;
  var area = req.body.area;
  var userEmailInSession = req.user.email;
  var userFirstNameInSession = req.user.firstname;
  var id = req.body.id;
    res.render('bookspot', {
          id: id,
          firstname: firstname,
          userEmailWhoBooked: userEmailWhoBooked,
          userFirstNameWhoBooked: userFirstNameWhoBooked,
          userFirstNameInSession: userFirstNameInSession,
          userEmailInSession: userEmailInSession,
          email: email,
          vno: vno,
          time: time,
          area: area,
          createdAt: Date.now()
    });
});

router.post('/bookspot', ensureAuthenticated, (req, res) => {
  var id = req.body.id;
  var firstname = req.body.firstname;
  var email = req.body.email;
  var userEmailWhoBooked = req.body.userEmailInSession;
  var userFirstNameWhoBooked = req.body.userFirstNameInSession;
  var vno = req.body.vno;
  var time = req.body.time;
  var timeflag = req.body.timeflag;
  var area = req.body.area;
  var createdAt = moment().format('DD-MM-YYYY')
  var price;
  if (timeflag == 'min') {
    price = time * 100;
  }

  if (timeflag == 'hour') {
    price = time * 60 * 100;
  }
     if (req.user.email == email) {
    req.flash('error_msg', 'Cannot book your own spot');
    res.redirect('/spots');
  } else {
        var newBooking = new Booking({
        firstname: firstname,
        userEmailWhoBooked: userEmailWhoBooked,
        userFirstNameWhoBooked: userFirstNameWhoBooked,
        email: email,
        vno: vno,
        timeflag: timeflag,
        time: time,
        price: price,
        area: area,
        createdAt: createdAt
      });
      newBooking.save().then((booking) => {
        Spot.findOne({
          _id: id
        }).then((spot) => {
          spot.capacity = spot.capacity - 1;
          spot.save().then();
        })
        res.render('checkout', {
          publisherkey: process.env.STRIPE_PUBLISHER_KEY,
          id: id,
          bookingId: booking._id,
          firstname: firstname,
          email: email,
          userEmailWhoBooked: userEmailWhoBooked,
          userFirstNameWhoBooked: userFirstNameWhoBooked,
          vno: vno,
          timeflag: timeflag,
          time: time,
          price: price,
          area: area,
          createdAt: createdAt,
          header: req.headers.host,
      })

      });


  }
});

router.get('/bookings/:page', ensureAuthenticated, (req, res, next) => {
  let perPage = 10;
  let page = req.params.page || 1;

  Booking
    .find({}) // finding all documents
    .sort({ date: -1 })
    .skip((perPage * page) - perPage) // in the first page the value of the skip is 0
    .limit(perPage) // output just 9 items
    .exec((err, booking) => {
      var firstname = booking.map(data => data.firstname);
      var userEmailWhoBooked = booking.map(data => data.userEmailWhoBooked);
      var userFirstNameWhoBooked = booking.map(data => data.userFirstNameWhoBooked);
      var email = booking.map(data => data.email);
      var vno = booking.map(data => data.vno);
      var time = booking.map(data => data.time);
      var timeflag = booking.map(data => data.timeflag);
      var starttime = booking.map(data => data.starttime);
      var endtime = booking.map(data => data.endtime);
      var expirystatus = booking.map(data => data.expirystatus);
      var area = booking.map(data => data.area);
      var createdAt = booking.map(data => data.createdAt);

      var userEmailInSession = req.user.email;
      Booking.count({email: req.user.email}, (err, count) => { // count to calculate the number of pages
        if (err) return next(err);
        res.render('bookings', {
          count,
          booking,
          firstname: firstname,
          email: email,
          userEmailWhoBooked: userEmailWhoBooked,
          userFirstNameWhoBooked: userFirstNameWhoBooked,
          userEmailInSession: userEmailInSession,
          vno: vno,
          len: vno.length,
          time: time,
          timeflag: timeflag,
          createdAt: createdAt,
          starttime: starttime,
          endtime: endtime,
          expirystatus: expirystatus,
          area: area,
          current: page,
          pages: Math.ceil(count / perPage)
        });
      });
    });
});

router.get('/mybookings/:page', ensureAuthenticated, (req, res) => {
  let perPage = 10;
  let page = req.params.page || 1;
  Booking
    .find({}) // finding all documents
    .sort({ date: -1 })
    .skip((perPage * page) - perPage) // in the first page the value of the skip is 0
    .limit(perPage) // output just 9 items
    .exec((err, booking) => {
      var paymentstatus = booking.map(data => data.paymentstatus);
      var expirystatus = booking.map(data => data.expirystatus);
      var firstname = booking.map(data => data.firstname);
      var userEmailWhoBooked = booking.map(data => data.userEmailWhoBooked);
      var userFirstNameWhoBooked = booking.map(data => data.userFirstNameWhoBooked);
      var email = booking.map(data => data.email);
      var vno = booking.map(data => data.vno);
      var time = booking.map(data => data.time);
      var timeflag = booking.map(data => data.timeflag);
      var starttime = booking.map(data => data.starttime);
      var endtime = booking.map(data => data.endtime);
      var area = booking.map(data => data.area);
      var id = booking.map(data => data._id);
      var createdAt = booking.map(data => data.createdAt);

      var userEmailInSession = req.user.email;

      Booking.count({
        userEmailWhoBooked: req.user.email
      }, (err, count) => { // count to calculate the number of pages
        if (err) return next(err);
        res.render('mybookings', {
          count,
          booking,
          id: id,
          paymentstatus: paymentstatus,
          expirystatus: expirystatus,
          firstname: firstname,
          email: email,
          userEmailWhoBooked: userEmailWhoBooked,
          userFirstNameWhoBooked: userFirstNameWhoBooked,
          userEmailInSession: userEmailInSession,
          vno: vno,
          len: vno.length,
          time: time,
          timeflag: timeflag,
          start: starttime,
          end: endtime,
          createdAt: createdAt,
          area: area,
          current: page,
          pages: Math.ceil(count / perPage)
        });
      });
    });
})

router.post('/deletemybooking/:id', (req, res) => {
  const id = req.params.id;
  Booking.findOne({
    _id: id
  }).then((booking) => {
    Spot.findOne({
      firstname: booking.firstname
    }).then((spot) => {
      spot.capacity = spot.capacity + 1;
      spot.save().then();
    })

    Booking.findByIdAndRemove(id).then();
  req.flash('error_msg', 'Booking deleted')
  res.redirect('/mybookings/1');
  })

});

router.get('/myspots/:page', ensureAuthenticated, (req, res) => {
  let perPage = 10;
  let page = req.params.page || 1;
    Spot
    .find({}) // finding all documents
    .sort({ date: -1 })
    .skip((perPage * page) - perPage) // in the first page the value of the skip is 0
    .limit(perPage) // output just 9 items
    .exec((err, spot) => {
      var area = spot.map(data => data.area);
      var capacity = spot.map(data => data.capacity);
      var email = spot.map(data => data.email);
      var firstname = spot.map(data => data.firstname);
      var pic = spot.map(data => data.pic);
      var id = spot.map(data => data._id);
      var createdAt = spot.map(data => data.createdAt);

      var userEmailInSession = req.user.email;
      Spot.count({email: req.user.email}, (err, count) => { // count to calculate the number of pages
        if (err) return next(err);
        res.render('myspots', {
          count,
          spot,
          id: id,
          firstname: firstname,
          email: email,
          userEmailInSession: userEmailInSession,
          area: area,
          pic: pic,
          createdAt: createdAt,
          capacity: capacity,
          current: page,
          pages: Math.ceil(count / perPage)
        });
      });
    });
});

router.post('/deletemyspots/:id', (req, res) => {
  const id = req.params.id;
  Spot.findByIdAndRemove(id).then();
  req.flash('error_msg', 'Your spot has been deleted successfully!')
  res.redirect('/myspots/1');
});

router.post('/editmyspots/:id', (req, res) => {
  spotUpload(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err);
      res.redirect('/dashboard');
    } else {
      if (req.file == undefined) {
        req.flash('error_msg', 'No file uploaded!');
      res.redirect('/dashboard');
      } else {
            const email = req.body.email;
            const firstname = req.body.firstname;
            const area = req.body.area;
            const pic = req.file.filename;
            const capacity = req.body.capacity;

            if (!area || !capacity) {
              req.flash('error', 'Please enter details!');
              res.redirect('/dashboard');
            }

            Spot.findOne({
              _id: req.params.id
            }).then((spot) => {
              spot.area = area;
              spot.pic = pic;
              spot.capacity = capacity;

              spot.save().then();

              req.flash('success_msg', 'Spot updated successfully!');
              res.redirect('/myspots/1');
            });
      }
    }
  })
});

router.post("/charge", ensureAuthenticated, async (req, res) => {

  const id = req.body.id;
  stripe.customers.create({
    email: req.body.stripeEmail,
    source: req.body.stripeToken
  })
  .then(customer => stripe.charges.create({
    amount: req.body.amount,
    description: 'Payment for Spot',
    currency: 'inr',
    customer: customer.id
  }))
  .then(charge => res.redirect(`/finishbooking/${id}`));

});

router.get('/finishbooking/:id', ensureAuthenticated, (req, res) => {
  const id = req.params.id;

  Booking.findOne({
    _id: id
  }).then((booking) => {
    var starttime, endtime;
    starttime = moment().format('YYYY-MM-DD hh:mm:ss');
    if (booking.timeflag == 'hour') {
      endtime = moment(starttime).add(booking.time, 'hours').format('YYYY-MM-DD hh:mm:ss');

    } else {
      endtime = moment(starttime).add(booking.time, 'minutes').format('YYYY-MM-DD hh:mm:ss');
    }
    booking.paymentstatus = true;
    booking.starttime = starttime;
    booking.endtime = endtime;
    booking.save().then();

    req.flash('success_msg', 'Spot Booked Successfully');
    res.redirect('/trackmybooking');
  })
})

router.get('/trackmybooking', ensureAuthenticated, (req, res) => {
  Booking.find({
    userEmailWhoBooked: req.user.email
  }).then((booking) => {
    res.render('trackmybooking', {
      booking: booking[booking.length - 1]
    })
  })
  
})

router.post('/increasespot', ensureAuthenticated, (req, res) => {
  const { items } = req.body;

  var id = items.map((item) => {
    return item.bookingId
  })

  Booking.findOne({
    _id: id
  }).then((booking) => {
    booking.expirystatus = true;
    booking.save().then();
    Spot.findOne({
      firstname: booking.firstname
    }).then((spot) => {
      spot.capacity = spot.capacity + 1;
      spot.save().then();
    })
  // Booking.findByIdAndRemove(id).then();
  req.flash('error_msg', 'Booking expired!')
  res.redirect('/mybookings/1');
  })
})

router.get('/notifier', (req, res) => {
  notifier.notify({
    title: 'My awesome title',
    message: 'Hello from node, Mr. User!',
    sound: true, // Only Notification Center or Windows Toasters
    wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
  });
})

module.exports = router;
