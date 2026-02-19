module.exports = (err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Bir hata oluştu!' });
};