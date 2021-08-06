const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: 'public/uploads/profile',
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  //Check File Type
function checkFileType(file, cb) {
    //Allowed extensions
    const filetypes = /jpeg|jpg|png/;
    //Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname) {
      return cb(null, true);
    }
    else {
      cb('Error: images only!');
    }
  }
  
  //Init upload
  const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000},
    fileFilter: function(req, file, cb) {
      checkFileType(file, cb);
    }
  }).single('profilepic');

  module.exports = upload;