const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.post("/api/upload/:id", upload.single("file"), function (req, res, next) {
  const id = req.params.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Please upload a file" });
  }

  if (path.extname(file.originalname) !== ".py") {
    return res
      .status(400)
      .json({ error: "Uploaded file must be a Python script (.py)" });
  }

  const pythonProcess = spawn("python", [file.path]);

  const inputData = "5\n3\n"; // Example input: 5 and 3

  pythonProcess.stdin.write(inputData);
  pythonProcess.stdin.end();

  let output = "";

  // Listen for output from the Python script
  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  // When the Python process closes, check the output
  pythonProcess.on("close", (code) => {
    // Remove the uploaded file
    fs.unlinkSync(file.path);
    if (code === 0 && output.trim() === "8") {
      // Python script executed successfully and produced 'True' output
      res.status(200).json({ message: "Python script is correct" });
    } else {
      // Python script didn't produce 'True' output or encountered an error
      res.status(400).json({ error: "Python script is incorrect" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
