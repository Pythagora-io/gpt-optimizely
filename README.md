# GPTOptimizely

GPTOptimizely is a cutting-edge application designed to bring the power of A/B testing directly to your website, allowing for meticulous optimization and analysis of web content. By embedding a simple HTML snippet into your site, GPTOptimizely dynamically tests different versions of your website's sections, tracking user interactions and providing valuable insights into which variations perform the best.

## Overview

The application leverages Node.js, Express.js, and MongoDB to deliver a robust backend infrastructure, while the frontend is elegantly managed through EJS templates. The architecture is designed to prioritize security, performance, and scalability, ensuring that GPTOptimizely can handle the needs of modern web applications. CSRF protection and session management are implemented to safeguard user data.

## Features

- **User Registration and Authentication**: Enables secure access to the GPTOptimizely dashboard.
- **Dynamic A/B Testing**: Users can create and manage tests directly from the dashboard, specifying different HTML versions to be dynamically injected into their website.
- **Real-Time Analytics**: Tracks clicks and interactions, providing insights through an intuitive interface.
- **Customizable Testing Parameters**: Offers flexibility in defining the elements and pages to be tested.

## Getting started

### Requirements

- Node.js
- MongoDB
- npm

### Quickstart

1. Clone the repository and navigate to the project directory.
2. Install dependencies with `npm install`.
3. Copy the `.env.example` file to `.env` and configure the environment variables.
4. Ensure MongoDB is running on your system.
5. Start the application using `npm start`. It will be accessible on the configured port.

### License

Copyright (c) 2024.