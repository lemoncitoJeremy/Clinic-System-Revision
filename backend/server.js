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
        this.SelectService();
        this.Checkcase();
        this.Createcase();
        this.GetQueuedCases();
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
    
    SelectService() {
        this.app.get("/selectService/:service", (req, res) => {
            const service = req.params.service;
            const sqlService = dbQueries.queries.selectService;
            const sqlPhysicians = dbQueries.queries.registeredPhysicians;
             // Run both queries in parallel
            const query1 = new Promise((resolve, reject) => {
                this.db.query(sqlService, [service], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            const query2 = new Promise((resolve, reject) => {
                this.db.query(sqlPhysicians, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            Promise.all([query1, query2])
            .then(([serviceResults, physicianResults]) => {
                res.json({
                    service: serviceResults,
                    physicians: physicianResults
                });
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
            });

        });
    }

    Checkcase() {
        this.app.get("/check-case", (req, res) => {
            const sql = dbQueries.queries.checkCase;
            const { service } = req.query;
            let wildcard = null;

            if (service === "xray"){
                wildcard = "%x%";
            } else {
                wildcard = "%u%";
            }

            this.db.query(sql, [wildcard], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }
                if (results.length > 0) {
                    const genId = this.generateCaseId(results[0].case_id, service);
                    res.json({ success: true, maxCaseId: genId });
                } else {
                    const generatedCaseId = this.generateCaseId(null, service);
                    res.json({ success: true, maxCaseId: generatedCaseId });
                    console.log("No case IDs found");
                }
            });
        });
    }

    generateCaseId(maxCaseId, service) {
        const date = new Date();
        const yyyy = date.getFullYear().toString();
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        const datePrefix = `${yyyy}${mm}${dd}`;
        console.log(datePrefix);
        // Pick service character
        const serviceChar = service.toLowerCase() === 'xray' ? 'x' : 'u';

        let sequenceNumber = 1; // default for first case of the day

        if (maxCaseId) {
            const regex = new RegExp(`^(${datePrefix}${serviceChar})(\\d{4})$`);
            const match = maxCaseId.match(regex);

            if (match) {
                sequenceNumber = parseInt(match[2], 10) + 1;
            }
        }
        
        const sequenceStr = sequenceNumber.toString().padStart(4, '0');
        return `${datePrefix}${serviceChar}${sequenceStr}`;
    }

    Createcase() {
        this.app.post("/create-case", async (req, res) => {
            const {
                case_Id,
                firstname,
                middlename,
                lastname,
                birthdate,
                gender,
                email,
                phone,
                address,
                patientSource,
                requestingPhysician,
                requestDate,
                examType,
                serviceType,
                status
            } = req.body;

            try {
                const physicianId = await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.retrievePhysicians,
                        [requestingPhysician],
                        (err, results) => {
                            if (err) return reject(err);
                            if (results.length === 0) {
                                return reject(new Error("Physician not found"));
                            }
                            resolve(results[0].physician_id);
                        }
                    );
                });

                await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.createCase,
                        [
                            case_Id,
                            firstname,
                            middlename,
                            lastname,
                            birthdate,
                            gender,
                            email,
                            phone,
                            address,
                            patientSource,
                            physicianId,
                            requestDate,
                            examType,
                            serviceType,
                            status
                        ],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });

                await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.insertQueue,
                        [
                            case_Id, 
                            firstname,
                            middlename,
                            lastname,             
                            requestingPhysician,
                            requestDate,
                            serviceType,
                            status
                        ],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });

                res.json({ success: true, message: "Case and queue entry created successfully" });

            } catch (error) {
                console.error("Database error:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    GetQueuedCases() {
        this.app.get("/queued-cases", (req, res) => {
            const sql = dbQueries.queries.queuedCases;
            console.log(sql);
            this.db.query(sql, (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }
                console.log(results);
                res.json({ success: true, queuedCases: results });
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
