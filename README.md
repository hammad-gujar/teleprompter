# Web-based Integration of Teleprompter with Real-Time Voice Recognition
Web-based telepromter is build with Vanila JavaScript using Amazon Transcriber using WebSocket.
- All the code remains in main branch for better understaning.
- `Prompter.js` file contains all of the task related to teleprompter working
- `lib/main.js` contains the implementation of WebSocket and AWS Transcriber connection.
- `index.html` contains all of HTML implementation.
- All other supportnig JavaScript file are also placed in `lib\` i.e `device.js`, `drawer.js` etc

# Build and Deployement
Though the solution is web based but some of the code is origanaly for server side and we need you use [browserify](https://github.com/browserify/browserify) to enable the supprt in browsers.
Follow the steps to setup on server.
- Clone this repo.
- run `npm install`
- run `npm run-script build`. This will genereate the build file `dist/main.js`.
- `npm install --global local-web-server` to install web server.
- start web server using the command `ws`

# Live Demo
Live demo is deployed at https://main.d18ej4bfkwauvq.amplifyapp.com/
