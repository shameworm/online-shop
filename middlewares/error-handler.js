function handleErrors(error, req, res, next) {
  console.log(error);

  if (error.code === 404) {
    return res.status(404).json({ message: "404 Not Found" });
  }
  res.status(500).json({ message: "500 Internal Server Error" });
}

module.exports = handleErrors;
