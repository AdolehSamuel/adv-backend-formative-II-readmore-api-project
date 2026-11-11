function handleError(res, error) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${error.path}` });
  }

  console.error(error);
  return res.status(500).json({ message: 'Something went wrong on the server' });
}

module.exports = handleError;
