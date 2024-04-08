const express = require("express");
const multer = require("multer");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const dotenv = require("dotenv");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
dotenv.config();

const app = express();
// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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

  const testFile = require(`./tests/${id}.js`);
  const inputDataSets = testFile.inputDataSets;
  const expectedOutputs = testFile.expectedOutputs;

  const results = [];

  inputDataSets.forEach((inputData, index) => {
    const pythonProcess = spawn("python", [file.path]);

    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();

    let output = "";

    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.on("close", (code) => {
         // Check if the file exists before attempting to delete it
         if (fs.existsSync(file.path)) {
          // Remove the uploaded file
          fs.unlinkSync(file.path);
        }

        const expectedOutput = expectedOutputs[index];

        if (code === 0 && output.trim() === expectedOutput) {
            results.push({ inputData, status: "correct" });
        } else {
            results.push({ inputData, status: "incorrect" });
        }

        if (results.length === inputDataSets.length) {
            const allCorrect = results.every((result) => result.status === "correct");
            if (allCorrect) {
                res.status(200).json({ message: "Python script is correct" });
            } else {
                res.status(400).json({ error: "Python script is incorrect" });
            }
        }
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
