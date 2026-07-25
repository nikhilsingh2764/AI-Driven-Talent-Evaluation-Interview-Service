import multer from 'multer';
import ApiError from '../utils/ApiError.js';

//express middleware that reads form-data and without multer, express cannot read uploaded files.
//uploaded files is avaialbe in req.file.

const storage = multer.memoryStorage();

//store file in RAM(Memory)
//after upload to cloudnary, memory is cleared


// Allow only PDF files
const fileFilter = (req, file, cb) => {

    if (file.mimetype === "application/pdf") {
        cb(null, true);  //no error accept the file
    } else {
        cb(new ApiError(400, "Only PDF files are allowed"), false);  //error not accept the file
    }

}



const upload = multer({  //create multer middleware
    storage,    // Uses memory Storage.
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024  // Maximum upload size is 5 MB.
    }
});

export default upload;  //use in route 