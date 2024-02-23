# GPTOptimizely

GPTOptimizely is a web application designed to enable users to perform A/B testing on their website's sections easily. It allows users to experiment with different HTML code snippets to determine which version performs better in terms of user engagement and clicks. By integrating a simple HTML snippet containing an API key into their website, users can manage tests, track results, and optimize their web content directly from the GPTOptimizely dashboard.

## Overview

GPTOptimizely utilizes a combination of technologies including Node.js for the backend, MongoDB for database management, and Express.js for routing. It follows a microservices architecture, with separate modules for user authentication, A/B test configuration, and results tracking. The frontend is rendered using EJS templates, and the application employs CSRF protection for form submissions.

## Features

- **User Registration and Authentication**: Secure login and registration functionality.
- **A/B Test Creation and Management**: Users can create, start, stop, and manage A/B tests through a user-friendly dashboard.
- **Dynamic Content Injection**: Based on the A/B test configuration, GPTOptimizely dynamically injects HTML content into specified elements of a webpage.
- **Click Tracking**: Tracks user interactions with the test elements to provide actionable insights.
- **Results Analysis**: Displays real-time results of A/B tests, showing which version performs better.

## Getting started

### Requirements

- Node.js
- MongoDB
- npm

### Quickstart

1. Clone the repository to your local machine.
2. Install the required npm packages by running `npm install`.
3. Copy `.env.example` to `.env` and update the environment variables accordingly.
4. Start the MongoDB service on your machine.
5. Run the application using `npm start`. The server will start on the specified port.

### License

Copyright (c) 2024.