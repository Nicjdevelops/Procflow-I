// Rebuild server.js with Express, Multer, MongoDB, static file serving
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
