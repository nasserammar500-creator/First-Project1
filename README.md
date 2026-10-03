# Expense Tracker

A full-stack web application designed to track personal daily expenses, categorize them, and provide real-time statistical summaries using Node.js, Express, and PostgreSQL.

## How to run

**Backend**

1. Create a PostgreSQL database named `expense_tracker`.
2. Run the SQL script in `schema.sql` to create the required table structure.
3. Create a `.env` file inside the `backend` folder and add your database configuration (e.g., `PORT=3000`, `DB_USER=postgres`, `DB_PASSWORD=yourpassword`, `DB_NAME=expense_db`).
4. Open your terminal, navigate to the backend directory (`cd backend`), and run `npm install` to install dependencies.
5. Start the backend server by running `node server.js`.

**Frontend**

1. Open the `frontend/index.html` file in your web browser (or use VS Code Live Server).
2. Ensure the backend server is running on port 3000 to interact with the API endpoints.

## Features

- [x] Add an expense (with validation)
- [x] Delete an expense
- [x] Edit an expense
- [x] Filter by category
- [x] Summary cards (total, count, highest)
- [x] Data is saved in a PostgreSQL database

## Screenshots
### POST Request (Add Expense)
![POST Success](backend/Photos-Phase%201/POST_success.png.png)

### PUT Request (Update Expense)
![PUT Success](backend/Photos-Phase%201/PUT_success.png.png)

### DELETE Request (Delete Expense)
![DELETE Success](backend/Photos-Phase%201/DELETE_success.png.png)
## What was the hardest part?

The most challenging part was ensuring seamless state synchronization between the front-end user interface and the back-end PostgreSQL database. Specifically, handling real-time statistical updates for the summary cards (total amount, expense count, and highest expense) after dynamically editing or filtering expenses, alongside providing proper error handling and alerts when server connection is lost.


-Video Link :
https://drive.google.com/file/d/13TYky14JpMGp-dZ-FRVH63cty8r8FnLA/view?usp=sharing
