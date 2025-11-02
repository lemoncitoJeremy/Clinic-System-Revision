const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const dbQueries = require('./config.json');
const port = 3000
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const app = express();

dotenv.config({ path: '../.env' });
const ip_address = process.env.VITE_SERVER_IP_ADD

app.use(cors());
app.use(express.json());

function returnAccessDict(res, results){
        const res_dict = results[0];
        const id = res_dict["user_id"];
        const username = res_dict["username"]
        const role = res_dict["role"]
        return res.json({ success: true, id: id, username: username, role: role});
}

function GeneratePatientId(maxPatientId) {
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

function GenerateCaseId(maxCaseId, service) {
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


db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('Connected to MySQL');
});

   
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = dbQueries.queries.login;
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
        if (!results || results.length == 0) {
            return res.status(401).json({
                success: false,
                message: 'Wrong Username or Password'
            });
        }

        const user = results[0];

        if (user.username === username && user.password === password) {
            returnAccessDict(res, results);
        } else {
            return res.status(401).json({
                success: false,
                message: 'Wrong Username or Password'
            });
        }
    });
});

    
app.get("/selectService/:service", (req, res) => {
    const service = req.params.service;
    const sqlService = dbQueries.queries.selectService;
    const sqlPhysicians = dbQueries.queries.registeredPhysicians;
    
    const query1 = new Promise((resolve, reject) => {
        db.query(sqlService, [service], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });

    const query2 = new Promise((resolve, reject) => {
        db.query(sqlPhysicians, (err, results) => {
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


app.get("/check-patientId", (req, res) => {
    const sql = dbQueries.queries.CheckPatientId;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        if (results.length > 0) {
            const genId = GeneratePatientId(results[0].patient_id);
            res.json({ success: true, maxPatientId: genId });
        } else {
            const generatedPatientId = GeneratePatientId(null);
            res.json({ success: true, maxPatientId: generatedPatientId });
        }
    });
});


app.post("/register-patient", async (req, res) => {
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
            db.query(
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
            db.query(
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


app.put("/update/patient/:id", async (req, res) => {
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
            db.query(
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


app.get("/patients", (req, res) => {
    const sql = dbQueries.queries.GetRegisteredPatients;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, RegisteredPatients: results });
    });
});


app.get("/search", (req, res) => {
    let { Input } = req.query;
    
    if (!Input) {
        return res.json({ success: true, RegisteredPatients: [] });
    }

    const likeSearch = `%${Input}%`;
    const sql = dbQueries.queries.FilterPatientbySearch;

    db.query(
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


app.get("/radiology", (req, res) => {
    const sqlRadiologist = dbQueries.queries.RegisteredRadiologist;
    const sqlRadioTech = dbQueries.queries.RegisteredRadioTech;

    const query1 = new Promise((resolve, reject) => {
        db.query(sqlRadiologist, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });

    const query2 = new Promise((resolve, reject) => {
        db.query(sqlRadioTech, (err, results) => {
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


app.get("/patients/:id", (req, res) => {
    const { id } = req.params;
    const sql = dbQueries.queries.GetPatientById;

    if (!db) {
        return res.status(500).json({ success: false, error: "Database not connected" });
    }

    db.query(sql, [id], (err, results) => {
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


app.get("/patients/:id/s-rec", (req, res) => {
    const { id } = req.params;
    const sql = dbQueries.queries.GetServiceRecordByCaseId;

    if (!db) {
        return res.status(500).json({ success: false, error: "Database not connected" });
    }

    db.query(sql, [id], (err, results) => {
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


app.get("/patients/:id/cases", (req, res) => {
    const { id } = req.params;
    const sql = dbQueries.queries.RetrievePatientCases;
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, PatientCases: results });
    });
});


app.get("/patients/:id/cases/status", (req, res) => {
    const { id } = req.params;
    const sql = dbQueries.queries.CheckCaseStatus;
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, case_status: results[0]?.status});
    });
});


app.get("/check-case", (req, res) => {
    const sql = dbQueries.queries.checkCase;
    const { service } = req.query;
    let wildcard = null;
    if (service === "xray"){
        wildcard = "%X%";
    } else {
        wildcard = "%U%";
    }

    db.query(sql, [wildcard], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        if (results.length > 0) {
            const genId = GenerateCaseId(results[0].case_id, service);
            res.json({ success: true, maxCaseId: genId });
        } else {
            const generatedCaseId = GenerateCaseId(null, service);
            res.json({ success: true, maxCaseId: generatedCaseId });
        }
    });
});


app.post("/create-case", async (req, res) => {
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
    console.log(req.body)
    try {
        let physicianId;
        const results = await new Promise((resolve, reject) => {
            db.query(
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
                db.query(
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
        
        examID = await new Promise((resolve, reject) => {
                db.query(
                    dbQueries.queries.RetrieveExamId, 
                    [examType],
                    (err, res) => {
                        if (err) return reject(err);
                        resolve(res); 
                    }
                );
            });
               
        const examTypeId = examID[0].exam_id

        await new Promise((resolve, reject) => {
            db.query(
                dbQueries.queries.createCase,
                [
                    case_Id,
                    patientId,
                    patientSource,
                    physicianId,
                    requestDate,
                    examTypeId,
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
            db.query(
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

app.post("/patients/:id/cases/status-update", async (req, res) => {
    const {
        case_Id,
        status
    } = req.body;

    try {

        await new Promise((resolve, reject) => {
            db.query(
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
            db.query(
                dbQueries.queries.DeleteQueue,
                [          
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

app.post("/upload/findings", async (req, res) => {
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
            db.query(
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
            db.query(
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
            db.query(
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
            db.query(
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
            db.query(
                dbQueries.queries.DeleteQueue,
                [            
                    case_Id
                ],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });

        res.json({ success: true, message: "Uploaded Findings and Removed From Queue Successfully" });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get("/reports/:id_report", async (req, res) => {
    const { id_report } = req.params;
    const caseId = id_report.replace("_report.pdf", "");
    const sql = dbQueries.queries.PDFReportData;
    
    db.query(sql, [caseId], (err, results) => {
        if (err || results.length === 0) {
            console.error(err);
            return res.status(500).json(
                { success: false, error: "Database error or case not found" });
        }

        const data = results[0]; 


        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

            const headerPath = path.join(__dirname, "../frontend/src/assets/ReportHeader.png");
            if (fs.existsSync(headerPath)) {
                doc.image(headerPath, {
                    fit: [500, 100], 
                    align: "center",
                    valign: "center"
                });
                doc.moveDown(2); 
            } else {
                console.warn("Header image not found at:", headerPath);
                doc.fontSize(16).fillColor("#009a79").text(
                    "A.S. MEDICAL AND DIAGNOSTIC CENTER", { align: "center" });
                doc.moveDown();
            }

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
        doc.font("Helvetica").text(data.exam_name);
        
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
        const baseY = doc.y;

        const sigWidth = 100;
        const sigHeight = 50;

        const techSigPath = path.join(__dirname, `./signatures/${data.radio_tech_name}.png`);
        const radiologistSigPath = path.join(__dirname, `./signatures/${data.radiologist_name}.png`);

        if (fs.existsSync(techSigPath)) {
            doc.image(techSigPath, doc.page.margins.left + (halfWidth - sigWidth) / 2, baseY, {
                fit: [sigWidth, sigHeight],
                align: "center"
            });
        }

        if (fs.existsSync(radiologistSigPath)) {
            doc.image(radiologistSigPath, doc.page.margins.left + halfWidth + (halfWidth - sigWidth) / 2, baseY, {
                fit: [sigWidth, sigHeight],
                align: "center"
            });
        }

        const lineY = baseY + sigHeight ;

        doc.text("__________________________", doc.page.margins.left, lineY, { 
            width: halfWidth, align: "center" 
        });
        doc.text("__________________________", doc.page.margins.left + halfWidth, lineY, { 
            width: halfWidth, align: "center" 
        });

        doc.y = lineY + 15; 
        const textY = doc.y;

        doc.font("Helvetica-Bold");
        doc.text(`${data.radio_tech_name}`, doc.page.margins.left, textY, {
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
        doc.text(`${data.radiologist_name}`, rightX, textY, {
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

app.get("/queued-cases", (req, res) => {
    const sql = dbQueries.queries.queuedCases;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, queuedCases: results });
    });
});

app.get("/dash-filter-cases", (req, res) => {
    const { status } = req.query;
    const sql = dbQueries.queries.FilterCaseStatus;
    db.query(sql, [status], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, Filtered: results });
    });
});

app.get("/total-patients", (req, res) => {
    const sql = dbQueries.queries.TotalPatientsRegistered;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, TotalPatients: results });
    });
});

app.get("/total-cases-done", (req, res) => {
    const sql = dbQueries.queries.TotalCasesDone;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, TotalCasesDone: results });
    });
});

app.get("/xra-ult", (req, res) => {
    const sql = dbQueries.queries.Analytics_total_XrUltr;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, xrult: results });
    });
});

app.get("/ref-phys", (req, res) => {
    const sql = dbQueries.queries.Analytics_rfrrls_perM;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }

        res.json({ success: true, refPhys: results });
    });
});

app.get("/rad-serv", (req, res) => {
    const sql = dbQueries.queries.Analytics_radService_perM;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }

        res.json({ success: true, radServ: results });
    });
});

app.get("/phys-earns", (req, res) => {
    const sql = dbQueries.queries.Analytics_earnings_perPhysician;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, earnings: results });
    });
});

app.get("/rad-rwrds", (req, res) => {
    const sql = dbQueries.queries.Analytics_earnings_perRad;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, earnings: results });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://${ip_address}:${port}`);
});

