# Multilingual Dictionary App

This is a web application built using the MEVN stack (MongoDB, Express.js, Vue.js, Node.js) with Tailwind CSS and DaisyUI. The app allows users to manage a multilingual dictionary with CRUD functionality, integrated with the Bing Translate API for word translation. The application includes features such as pagination, sorting, and CSV export.

## Features
- **Multilingual Support:** Add, edit, delete, and search words in multiple languages.
- **Translation:** Utilize the Bing Translate API for translating words.
- **CSV Export:** Export selected languages to a CSV file.
- **Pagination:** Efficiently manage and navigate through large datasets.
- **Responsive Design:** Styled with Tailwind CSS and DaisyUI for a modern look.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine.
- MongoDB installed and running locally or remotely.
- Bing Translate API key (if you want to use the translation feature).

## Installation

Follow these steps to set up and run the application locally:

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2. **Install Backend Dependencies:**

    ```bash
    cd backend
    npm install
    ```

3. **Install Frontend Dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```

4. **Set Up Environment Variables:**

    Create a `.env` file in the backend directory and add your environment variables:

    ```bash
    MONGO_URI=mongodb://localhost:27017/your-db-name
    BING_TRANSLATE_API_KEY=your-bing-translate-api-key
    ```

5. **Run the MongoDB Server:**

    Make sure your MongoDB server is running:

    ```bash
    mongod
    ```

6. **Start the Backend Server:**

    ```bash
    cd backend
    npm start
    ```

7. **Start the Frontend Development Server:**

    ```bash
    cd ../frontend
    npm run dev
    ```

8. **Access the Application:**

    Open your browser and navigate to `http://localhost:5173`.

## Usage

- **Add New Word:** Navigate to the "Add New Word" page to input words and their translations.
- **Search:** Use the search feature to find words in the selected language.
- **Edit/Delete Words:** Manage existing words from the homepage or detail page.
- **Translate:** Utilize the Bing Translate feature on the "Add New Word" and "Edit Word" pages.
- **Export to CSV:** Export selected language data to a CSV file for external use.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.
