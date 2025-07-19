# API de Agendamento de E-mails

Esta API permite agendar o envio de e-mails com mensagem, nome, e-mail do destinatário, imagem opcional e data de envio. O envio é feito automaticamente na data agendada usando Mailtrap e as imagens são armazenadas no Cloudinary.

---

## 🚀 Tecnologias utilizadas

- Node.js
- Express
- PostgreSQL
- Multer
- Cloudinary
- Mailtrap (SMTP)
- node-cron

---

## ⚙️ Variáveis de ambiente (.env)

Crie um arquivo `.env` na raiz do projeto e preencha com as seguintes variáveis:

```env
PORT=3001

DATABASE_URL=postgresql://usuario:senha@localhost:5432/nomedobanco

CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=seu_usuario_mailtrap
MAILTRAP_PASS=sua_senha_mailtrap
