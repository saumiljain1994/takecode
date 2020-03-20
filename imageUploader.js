// const path = require('path');
// const multer = require('multer')
// const storage = multer.diskStorage({
//     destination: (req, res, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         console.log("req.file---storage----->",file);
//         var datetimestamp = Date.now();
//         var fileOriginalname = file.originalname;
//         fileOriginalname = fileOriginalname.replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
//         cb(null, datetimestamp + '_' + fileOriginalname);
//     }
// });

// const upload = multer({
//     storage: storage
// }).single('image');

// module.exports = upload;

var multer = require('multer')
module.exports = {
upload: (req, res, callback) => {
        var fileName;
        var storage = multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, 'uploads/')
            },
            filename: function (req, file, callback) {
                fileName = file.originalname + '-' + Date.now() + '.jpg'
                callback(null, fileName)
                console.log('file>>>>>>>>', file)
            }
        })
        var upload = multer({ storage: storage }).single('image');
        upload(req, res, (error, result) => {
            if (error) {
                console.log("error", error)

            }
            else {
                callback(null, fileName)
            }
        })
    }
}