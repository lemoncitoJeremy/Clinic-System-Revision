const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const dbQueries = require('./config.json');
dotenv.config({ path: '../.env' });
const port = 3000

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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
        this.ip_address = process.env.VITE_SERVER_IP_ADD;

        this.configureMiddleware();
        this.initializeDatabase();
        this.handleLogin();
        this.SelectService();
        this.Checkcase();
        this.Createcase();
        this.GetQueuedCases();
        this.CheckPatientId();
        this.RegisterPatient();
        this.GetRegisteredPatients();
        this.FetchPatientbyId();
        this.RetrievePatientCases();
        this.FetchServiceRecordsbyId();
        this.GetRegisteredRadiology();
        this.UploadFindings();
        this.GetPatientCount();
        this.CheckCaseStatus();
        this.GeneratePDFReport();
        this.SearchPatients();
        this.CancelRequest();
        this.UpdatePatientInfo();
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
            port: process.env.DB_PORT,
            
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
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Internal server error' 
                    });
                }

                if (results && results.length > 0) {
                    returnAccessDict(res, results);
                } else {
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Wrong Username or Password' 
                    });
                }
            });
        });
    }
    
    SelectService() {
        this.app.get("/selectService/:service", (req, res) => {
            const service = req.params.service;
            const sqlService = dbQueries.queries.selectService;
            const sqlPhysicians = dbQueries.queries.registeredPhysicians;
            
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
                console.error("Database query error:", err);
                res.status(500).json({ error: "Internal server error" });
            });
        });
    }

    CheckPatientId() {
        this.app.get("/check-patientId", (req, res) => {
            const sql = dbQueries.queries.CheckPatientId;

            this.db.query(sql, (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }
                if (results.length > 0) {
                    const genId = this.GeneratePatientId(results[0].patient_id);
                    res.json({ success: true, maxPatientId: genId });
                } else {
                    const generatedPatientId = this.GeneratePatientId(null);
                    res.json({ success: true, maxPatientId: generatedPatientId });
                }
            });
        });
    }

    GeneratePatientId(maxPatientId) {
        const date = new Date();
        const yyyy = date.getFullYear().toString();
        let sequenceNumber = 1;

        if (maxPatientId) {
            const regex = new RegExp(`^(${'PID'}${yyyy})(\\d{5})$`);
            const match = maxPatientId.match(regex);

            if (match) {
                sequenceNumber = parseInt(match[2], 10) + 1;
            }
        }
        
        const sequenceStr = sequenceNumber.toString().padStart(5, '0');
        return `${"PID"}${yyyy}${sequenceStr}`;
    }

    RegisterPatient() {
        this.app.post("/register-patient", async (req, res) => {
            const {
                patient_Id,
                firstname,
                middlename,
                lastname,
                birthdate,
                gender,
                email,
                phone,
                address,
            } = req.body;

            try {
                const existingPatient = await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.VerifyPatientRegistration,
                        [firstname, middlename, lastname],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });

                if (existingPatient && existingPatient.length > 0) {
                    return res.status(200).json({
                        success: false,
                        message: "Patient already exists",
                        data: existingPatient[0],
                    });
                }

                const normalizedEmail = email && email.trim() !== "" ? email : "N/A";

                await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.RegisterPatient,
                        [
                            patient_Id,
                            firstname,
                            middlename,
                            lastname,
                            birthdate,
                            gender,
                            normalizedEmail,
                            phone,
                            address,
                        ],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });

                return res.status(201).json({
                    success: true,
                    message: "Patient registered successfully",
                });

            } catch (error) {
                console.error("Database error:", error);
                return res.status(500).json({ 
                    success: false, 
                    error: "Internal server error" 
                });
            }
        });
    }

    UpdatePatientInfo() {
        this.app.put("/update/patient/:id", async (req, res) => {
            const { id } = req.params;
            const {
                firstname,
                middlename,
                lastname,
                birthdate,
                gender,
                email,
                phone,
                address,
            } = req.body;
            try {
                const normalizedEmail = email && email.trim() !== "" ? email : "N/A";

                await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.UpdatePatientInfo,
                        [
                            firstname,
                            middlename,
                            lastname,
                            birthdate,
                            gender,
                            normalizedEmail,
                            phone,
                            address,
                            id
                        ],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });

                return res.status(200).json({
                    success: true,
                    message: "Patient information updated successfully",
                });

            } catch (error) {
                console.error("Database error:", error);
                return res.status(500).json({
                    success: false,
                    error: "Internal server error",
                });
            }
        });
    }

    GetRegisteredPatients() {
        this.app.get("/patients", (req, res) => {
            const sql = dbQueries.queries.GetRegisteredPatients;
            this.db.query(sql, (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }
                res.json({ success: true, RegisteredPatients: results });
            });
        });
    }   

    SearchPatients() {
        this.app.get("/search", (req, res) => {
            let { Input } = req.query;
            
            if (!Input) {
                return res.json({ success: true, RegisteredPatients: [] });
            }

            const likeSearch = `%${Input}%`;
            const sql = dbQueries.queries.FilterPatientbySearch;

            this.db.query(
                sql,
                [likeSearch, likeSearch, likeSearch, likeSearch],
                (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, error: "Database error" });
                    }
                    res.json({ success: true, RegisteredPatients: results });
                }
            );
        });
    }

    GetRegisteredRadiology(){
        this.app.get("/radiology", (req, res) => {
            const sqlRadiologist = dbQueries.queries.RegisteredRadiologist;
            const sqlRadioTech = dbQueries.queries.RegisteredRadioTech;

            const query1 = new Promise((resolve, reject) => {
                this.db.query(sqlRadiologist, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            const query2 = new Promise((resolve, reject) => {
                this.db.query(sqlRadioTech, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            Promise.all([query1, query2])
            .then(([RadiologistRes, RadioTechRes]) => {
                res.json({
                    radiologist: RadiologistRes,
                    radiotech: RadioTechRes
                });
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
            });

        });
    }

    FetchPatientbyId() {
        this.app.get("/patients/:id", (req, res) => {
            const { id } = req.params;
            const sql = dbQueries.queries.GetPatientById;

            if (!this.db) {
                return res.status(500).json({ success: false, error: "Database not connected" });
            }

            this.db.query(sql, [id], (err, results) => {
                if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ success: false, error: "Database error" });
                }

                if (!results || results.length === 0) {
                return res.status(404).json({ success: false, message: "Patient not found" });
                }

                res.json({ success: true, RegisteredPatients: results[0] });
            });
            });
        }
    
    FetchServiceRecordsbyId() {
        this.app.get("/patients/:id/s-rec", (req, res) => {
            const { id } = req.params;
            const sql = dbQueries.queries.GetServiceRecordByCaseId;

            if (!this.db) {
                return res.status(500).json({ success: false, error: "Database not connected" });
            }

            this.db.query(sql, [id], (err, results) => {
                if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ success: false, error: "Database error" });
                }

                if (!results || results.length === 0) {
                return res.status(404).json({ success: false, message: "Case not found" });
                }

                res.json({ success: true, RegisteredPatients: results[0] });
            });
            });
        }
    
    RetrievePatientCases() {
        this.app.get("/patients/:id/cases", (req, res) => {
            const { id } = req.params;
            const sql = dbQueries.queries.RetrievePatientCases;
            this.db.query(sql, [id], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }
                res.json({ success: true, PatientCases: results });
            });
        });
    }

    CheckCaseStatus(){
        this.app.get("/patients/:id/cases/status", (req, res) => {
            const { id } = req.params;
            const sql = dbQueries.queries.CheckCaseStatus;
            this.db.query(sql, [id], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }
                res.json({ success: true, case_status: results[0]?.status});
            });
        });
    }

    Checkcase() {
        this.app.get("/check-case", (req, res) => {
            const sql = dbQueries.queries.checkCase;
            const { service } = req.query;
            let wildcard = null;
            if (service === "xray"){
                wildcard = "%X%";
            } else {
                wildcard = "%U%";
            }

            this.db.query(sql, [wildcard], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }
                if (results.length > 0) {
                    const genId = this.GenerateCaseId(results[0].case_id, service);
                    res.json({ success: true, maxCaseId: genId });
                } else {
                    const generatedCaseId = this.GenerateCaseId(null, service);
                    res.json({ success: true, maxCaseId: generatedCaseId });
                }
            });
        });
    }

    GenerateCaseId(maxCaseId, service) {
        const date = new Date();
        const yyyy = date.getFullYear().toString();
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        const datePrefix = `${yyyy}${mm}${dd}`;

        const serviceChar = service.toLowerCase() === 'xray' ? 'X' : 'U';
        let sequenceNumber = 1; 

        if (maxCaseId) {
            const regex = /(\d{5})$/;
            const match = maxCaseId.match(regex);

            if (match) {
                sequenceNumber = parseInt(match[1], 10) + 1;
            }
        }
        
        const sequenceStr = sequenceNumber.toString().padStart(5, '0');
        return `${datePrefix}${serviceChar}${sequenceStr}`;
    }

    Createcase() {
        this.app.post("/create-case", async (req, res) => {
            const {
                case_Id,
                patientId,
                patientSource,
                requestingPhysician,
                requestDate,
                examType,
                serviceType,
                notes,
                status
            } = req.body;

            try {
                let physicianId;
                const results = await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.retrievePhysicians,
                        [requestingPhysician],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });

                if (results.length > 0) {
                    physicianId = results[0].physician_id;
                } else {
                    physicianId = await new Promise((resolve, reject) => {
                        this.db.query(
                            dbQueries.queries.InsertManualPhysician, 
                            [requestingPhysician],
                            (err, insertResults) => {
                                if (err) return reject(err);
                                resolve(insertResults.insertId); 
                            }
                        );
                    });
                }

                const normalizedNotes = notes && notes.trim() !== "" ? notes : "N/A";
                
                await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.createCase,
                        [
                            case_Id,
                            patientId,
                            patientSource,
                            physicianId,
                            requestDate,
                            examType,
                            serviceType,
                            normalizedNotes,
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
    
    CancelRequest(){
        this.app.post("/patients/:id/cases/status-update", async (req, res) => {
            const {
                case_Id,
                status
            } = req.body;

            try {

                await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.UpdateCaseStatus,
                        [
                            status,             
                            case_Id
                        ],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });

                await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.UpdateQueueStatus,
                        [
                            status,             
                            case_Id
                        ],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });

                res.json({ success: true, message: "Cancelled Request Successfully" });
            } catch (error) {
                console.error("Database error:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    UploadFindings() {
        this.app.post("/upload/findings", async (req, res) => {
            const {
                case_Id,
                radiologist,
                radio_technologist,
                radiographic_findings,
                radiographic_impressions,
                status
            } = req.body;

            try {
                const radiologistId = await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.RetrieveRadiologistbyName,
                        [radiologist],
                        (err, results) => {
                            if (err) return reject(err);
                            if (results.length === 0) {
                                return reject(new Error("Radiologist not found"));
                            }
                            resolve(results[0].radiologist_id);
                        }
                    );
                });

                const radioTechId = await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.RetrieveRadioTechbyName,
                        [radio_technologist],
                        (err, results) => {
                            if (err) return reject(err);
                            if (results.length === 0) {
                                return reject(new Error("Radiologist not found"));
                            }
                            resolve(results[0].radio_tech_id);
                        }
                    );
                });

                await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.UploadFindings,
                        [
                            case_Id,
                            radiographic_findings,
                            radiographic_impressions,
                            radiologistId,
                            radioTechId,
                            status
                        ],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                            res.json({ success: true, message: "Findings Uploaded successfully" });
                        }
                    );
                });

                await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.UpdateCaseStatus,
                        [
                            status,             
                            case_Id
                        ],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });

                await new Promise((resolve, reject) => {
                    this.db.query(
                        dbQueries.queries.UpdateQueueStatus,
                        [
                            status,             
                            case_Id
                        ],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });

                res.json({ success: true, message: "Uploaded Findings and Changed Status Successfully" });
            } catch (error) {
                console.error("Database error:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    GeneratePDFReport() {
        this.app.get("/reports/:id_report", async (req, res) => {
            const { id_report } = req.params;
            const caseId = id_report.replace("_report.pdf", "");
            const sql = dbQueries.queries.PDFReportData;
            
            this.db.query(sql, [caseId], (err, results) => {
                if (err || results.length === 0) {
                    console.error(err);
                    return res.status(500).json(
                        { success: false, error: "Database error or case not found" });
                }

                const data = results[0]; 

                // const outputPath = path.join(__dirname, '../Records', `${caseId}_report.pdf`);
                // if (!fs.existsSync(path.join(__dirname, '../Records'))) {
                //     fs.mkdirSync(path.join(__dirname, '../Records'));
                // }

                const doc = new PDFDocument({ margin: 50 });
                // doc.pipe(fs.createWriteStream(outputPath));
                doc.pipe(res);

                doc.fontSize(16).fillColor("#009a79").text(
                    "A.S. MEDICAL AND DIAGNOSTIC CENTER", { align: "center" });
                doc.fontSize(10).fillColor("black").text(
                    "027 Poblacion Sur, Talavera | 0960-6270-613 | asanglaymedicalanddiagnostic@gmail.com",
                    { align: "center" }
                );
                doc.fontSize(10).font("Helvetica-Bold").text(
                    "Pablo Medical Clinic | www.pablomedicalclinic.com",
                    { align: "center" }
                );
                doc.moveDown();

                //----
                const reportTitle = data.service_type.toLowerCase() === "ultrasound" 
                    ? "ULTRASOUND REPORT" 
                    : "RADIOLOGIC REPORT";

                doc.fontSize(16).fillColor("black").text(
                    reportTitle, { align: "center", underline: true });
                doc.moveDown();

                doc.fontSize(10).font("Helvetica-Bold").text(
                    "Case ID: ", { continued: true });
                doc.font("Helvetica").text(data.case_id);

                doc.font("Helvetica-Bold").text("Patient: ", { continued: true });
                doc.font("Helvetica").text(data.patient_name);

                doc.font("Helvetica-Bold").text("Source: ", { continued: true });
                doc.font("Helvetica").text(data.patient_source);

                doc.font("Helvetica-Bold").text("Physician: ", { continued: true });
                doc.font("Helvetica").text(data.physician_name);

                doc.font("Helvetica-Bold").text("Request Date: ", { continued: true });
                doc.font("Helvetica").text(new Date(data.request_date).toLocaleDateString());

                doc.font("Helvetica-Bold").text("Exam Type: ", { continued: true });
                doc.font("Helvetica").text(data.exam_type);
                
                doc.moveDown();

                //----
                doc.font("Helvetica-Bold").fontSize(11).text("FINDINGS", { underline: true });
                doc.moveDown(0.5); 
                doc.font("Helvetica").fontSize(10).text(data.radiographic_findings, { align: "justify" });
                doc.moveDown(2);

                //----
                doc.font("Helvetica-Bold").fontSize(11).fillColor("#009a79").text(
                    "IMPRESSION", { underline: true });
                doc.moveDown(0.5); 
                doc.font("Helvetica").fontSize(10).fillColor("black").text(
                    data.radiographic_impressions, { align: "justify" });
                doc.moveDown(5);

                //----
                const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
                const halfWidth = pageWidth / 2;
                const y = doc.y;
                doc.text("__________________________", doc.page.margins.left, y, 
                        { width: halfWidth, align: "center" });
                doc.text("__________________________", doc.page.margins.left + halfWidth, y, 
                        { width: halfWidth, align: "center" });
                doc.moveDown();

                //----
                const y2 = doc.y;


                doc.font("Helvetica-Bold");
                doc.text(`${data.radio_tech_name}`, doc.page.margins.left, y2, {
                width: halfWidth,
                align: "center"
                });
                doc.moveDown(0.5);
                doc.text(`${data.tech_medical_credentials}`, {
                width: halfWidth,
                align: "center"
                });

                doc.font("Helvetica"); 
                doc.moveDown(0.3);
                doc.text("Radiologic Technologist", {
                width: halfWidth,
                align: "center"
                });


                const rightX = doc.page.margins.left + halfWidth;

                doc.font("Helvetica-Bold");
                doc.text(`${data.radiologist_name}`, rightX, y2, {
                width: halfWidth,
                align: "center"
                });
                doc.moveDown(0.5);
                doc.text(`${data.radiologist_medical_credentials}`, rightX, doc.y, {
                width: halfWidth,
                align: "center"
                });

                doc.font("Helvetica");
                doc.moveDown(0.3);
                doc.text("Radiologist", rightX, doc.y, {
                width: halfWidth,
                align: "center"
                });

                doc.end();
            });
        });
    }

    GetQueuedCases() {
        this.app.get("/queued-cases", (req, res) => {
            const sql = dbQueries.queries.queuedCases;
            this.db.query(sql, (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }
                res.json({ success: true, queuedCases: results });
            });
        });
    }   

    GetPatientCount(){
        this.app.get("/total-patients", (req, res) => {
            const sql = dbQueries.queries.TotalPatientsRegistered;
            this.db.query(sql, (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }
                res.json({ success: true, TotalPatients: results });
            });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server running on http://${this.ip_address}:${this.port}`);
        });
    }
}

const server = new Server(port);
server.start();
