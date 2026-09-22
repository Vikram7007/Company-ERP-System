const errorHandler = (error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : error.message
  });
};

module.exports = errorHandler;
