const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage()

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
            cb(null, true);
    },
     limits: { fileSize: 5 * 1024 * 1024 } 
})

module.exports = upload;