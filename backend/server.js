const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const dbQueries = require('./config.json');
dotenv.config({ path: '../.env' });
const port = 3000

const returnAccessDict = (res, results) => {
        const res_dict = results[0];
        const id = res_dict["user_id"];
        const username = res_dict["username"]
        const role = res_dict["role"]
        return res.json({ success: true, id: id, username: username, role: role});
    
};

class Server {
    constructor(port) {
        this.app = express();
        this.port = port || 3000;
        this.db = null;

        this.configureMiddleware();
        this.initializeDatabase();
        this.handleLogin();
    }

    configureMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    initializeDatabase() {
        this.db = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        this.db.connect((err) => {
            if (err) {
                console.error('MySQL connection error:', err);
                return;
            }
            console.log('Connected to MySQL');
        });
    }

    handleLogin() {
        this.app.post('/login', (req, res) => {
            const { username, password } = req.body;
            const sql = dbQueries.queries.login;

            this.db.query(sql, [username, password], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Server error' });
                }

                if (results) {
                    returnAccessDict(res, results);
                } else {
                    res.status(401).json({ success: false, message: 'Invalid credentials' });
                }
            });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server running on http://localhost:${this.port}`);
        });
    }
}

// Start the server
const server = new Server(port);
server.start();
