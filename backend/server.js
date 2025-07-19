// backend/server.js

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const cron = require("node-cron");
const nodemailer = require("nodemailer");

// Configurações iniciais
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PostgreSQL setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Criação da tabela, se necessário
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS scheduled_emails (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    send_at TIMESTAMP NOT NULL,
    image_url TEXT,
    sent BOOLEAN DEFAULT FALSE
  );
`;
pool.query(createTableQuery).catch(err => console.error("Erro ao criar tabela:", err));

// Configurar Nodemailer com Mailtrap (pode ser outro provedor)
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: parseInt(process.env.MAILTRAP_PORT) || 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// Verifica e envia os emails agendados
const checkAndSendEmails = async () => {
  try {
    const now = new Date();
    const res = await pool.query(
      "SELECT * FROM scheduled_emails WHERE send_at <= $1 AND sent = false",
      [now]
    );

    for (const email of res.rows) {
      const mailOptions = {
        from: "no-reply@example.com",
        to: email.email,
        subject: "Mensagem agendada",
        text: email.message,
        html: `
          <p>${email.message}</p>
          ${
            email.image_url
              ? `<img src="${email.image_url}" alt="Imagem agendada" style="max-width:300px;"/>`
              : ""
          }
        `,
      };

      await transporter.sendMail(mailOptions);

      await pool.query("UPDATE scheduled_emails SET sent = true WHERE id = $1", [email.id]);

      console.log(`Email enviado para ${email.email}`);
    }
  } catch (error) {
    console.error("Erro ao enviar emails agendados:", error);
  }
};

// Agenda a verificação a cada minuto
cron.schedule("* * * * *", () => {
  console.log("Verificando emails para enviar...");
  checkAndSendEmails();
});

// Rota principal
app.post("/api/schedule-email", upload.single("image"), async (req, res) => {
  try {
    const { name, email, message, sendAt } = req.body;
    const id = uuidv4();

    const saveEmail = async (url) => {
      await pool.query(
        `INSERT INTO scheduled_emails (id, name, email, message, send_at, image_url) VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, name, email, message, new Date(sendAt), url]
      );
      return res.status(201).json({ message: "Email agendado com sucesso." });
    };

    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "scheduled-emails", public_id: id },
        async (error, result) => {
          if (error) return res.status(500).json({ error: error.message });
          await saveEmail(result.secure_url);
        }
      );
      uploadStream.end(req.file.buffer);
    } else {
      await saveEmail(null);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao agendar email." });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
