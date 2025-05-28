const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express(); // ✅ Fix: this was missing

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Schema
const procurementSchema = new mongoose.Schema({
  title: String,
  vendor: String,
  amount: String,
  type: String,
  filename: String,
  filepath: String
});
const Procurement = mongoose.model('Procurement', procurementSchema);

// API Routes
app.post('/api/procurements', upload.single('file'), async (req, res) => {
  const record = JSON.parse(req.body.data);
  if (req.file) {
    record.filename = req.file.filename;
    record.filepath = `/uploads/${req.file.filename}`;
  }
  const newRecord = new Procurement(record);
  await newRecord.save();
  res.json({ status: 'success', record: newRecord });
});

app.get('/api/procurements', async (req, res) => {
  const records = await Procurement.find().sort({ _id: -1 });
  res.json(records);
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start server (✅ This is what Render needs)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
