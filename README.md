# RC Hackathon Backend Server

RC Hackathon is the Python problem-solving hackathon arranged by RC Sentinels at King Mongkut's University of Technology Thonburi Ratchaburi.

![rchackathon](https://github.com/Celesca/Celesca/blob/main/Project%20Picture/RC_Hackathon.PNG)

## API Endpoints

* POST /api/upload/:id -> Upload the files to check the test cases of the question.
  - 200 OK means the python script is correct
  - 400 Bad Request means the file upload are error or python script is incorrect.

## Installation

1. `git clone https://github.com/Celesca/rc-hackathon-backend.git`

2. `cd rc-hackathon-backend`

3. `npm install`

4. `npm start`

5. Testing server with Postman or Bruno (Swagger currently unavailable) at localhost:3000

## Docker

`docker compose up --build`

## TODO 🥇

1. OpenAPI Specification ❌
2. Docker (Containerzation) ✔️
3. Structure breakdown ❌
4. All test cases ❌


## Powered by
Me (Celescadev)
