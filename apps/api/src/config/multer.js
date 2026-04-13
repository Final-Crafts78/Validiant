const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const UPLOAD_DIR = "uploads/";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") {
      cb(null, true);
    } else {
      cb(new Error(`Only Excel/CSV files allowed! Got: ${ext}`), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
