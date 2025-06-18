# DBL - American Aviators Preview Website

## What is in this repository?
This repository contains the source code for the American Aviators Preview website. It houses 3 main webpages:
- **Home Page**: A landing page that provides an overview of the American Aviators project.
- **Language Model Page**: A page dedicated to the analysis language model.
- **Fake Twitter Page**: A page dedicated to the Twitter integration and response model.

# How to Use the Website

## Getting Started
1. **Access the System**: Visit [https://american-aviators.thorvaldrovers.com](https://american-aviators.thorvaldrovers.com) to access the Tweet Support Bot interface.
2. **Check API Status**: Before using the tools, look at the API status indicator on the homepage. A green dot indicates the system is online and ready for use.
3. **Contact for Support**: If you encounter any issues or need access permissions, contact the maintainer of the AI server:
   - Email: contact@thorvaldrovers.com or t.rovers1@student.tue.nl
   - Include your username and purpose for using the system in your message

## Available Tools

### Tweet Analysis Tool
- Select "Ask the LLM" from the homepage
- Enter a query about American Airlines customer service tweets
- The system will analyze thousands of real tweets and provide insights
- Responses may take 2-3 minutes due to the comprehensive analysis being performed

### PR Response Generator
- Select "Write a Fake Tweet" from the homepage
- Enter a customer complaint or query
- The system will generate an appropriate customer service response based on American Airlines' typical response patterns
- Ideal for training customer service representatives on best practices

## Technical Notes
- The system uses advanced natural language processing to analyze tweet sentiment and patterns
- Response times vary based on server load and query complexity
- All data is processed securely and no personal information is stored
- The system is optimized for desktop but works on mobile devices as well
- Long-running queries automatically maintain connection for up to 7 minutes

## How to run the website locally
1. Download node.js from [nodejs.org](https://nodejs.org/).
2. Clone this repository to your local machine.
3. Open a terminal and navigate to the cloned repository.
4. Create a `.env` file in the root directory of the project. This file should contain the following environment variables:
   ```plaintext
   API_URL= "your_api_url_here"
   API_KEY= "your_api_key_here"
   ```
   Replace `your_api_url_here` and `your_api_key_here` with the actual API URL and key you wish to use for the project.
   These come from the DBL-LLM-API repository, which you can find [here](https://github.com/SpelGekko/DBL-llm)
4. Run the following command to install the required dependencies:
   ```bash
   npm install
   ```
5. Start the local server by running:
   ```bash
    npm run dev
    ```
6. Open your web browser and navigate to `http://localhost:3000` to view the website.

## Questions or Issues
If there are any questions or issues regarding the website, or how to run it, please feel free to send make an issue on the repository or contact the project maintainer.

## Technologies Used
- **Next.js** - React framework for server-rendered applications
- **React** - Frontend library for building user interfaces
- **TypeScript** - Typed JavaScript for better development experience
- **TailwindCSS** - Utility-first CSS framework
- **dotenv** - Environment variable management
- **react-markdown** - Markdown rendering component
