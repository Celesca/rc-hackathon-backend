const express = require("express");
const multer = require("multer");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const dotenv = require("dotenv");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
dotenv.config();

const app = express();
// Swagger
app.use(express.json())

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RC Hackathon Backend API",
      version: "1.0.0",
      description: "A simple API to test Python scripts",
  }, 
  servers: [
  {
      url: "http://localhost:3000",
  },
  ],
},
apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

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

/**
 * @swagger
 * /api/upload/{id}:
 *   post:
 *     summary: Upload and test a Python script
 *     description: Uploads a Python script file and tests it against provided test cases.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Identifier for the test case
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Python script is correct
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       '400':
 *         description: Python script is incorrect or file format is invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

const normalizeOutput = (output) => {
  // Normalize line endings to Unix-style
  output = output.replace(/\r\n/g, "\n");
  // Remove all whitespace characters
  output = output.replace(/\s/g, "");
  return output;
};

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
      const expectedOutput = expectedOutputs[index];

      const normalizedExpectedOutput = normalizeOutput(expectedOutput);
      const normalizedActualOutput = normalizeOutput(output);

      console.log("Expected output:", normalizedExpectedOutput);
      console.log("Actual output:", normalizedActualOutput);
      
      if (code === 0 && normalizedActualOutput === normalizedExpectedOutput) {
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

        // Delete the file after all test cases have been processed
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});