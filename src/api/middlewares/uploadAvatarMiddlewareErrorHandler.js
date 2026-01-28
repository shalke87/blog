import multer from "multer";

function uploadErrorHandler(multerMiddleware) {
  return function (req, res, next) {
    multerMiddleware(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // Errori Multer: file troppo grande, campo sbagliato, ecc.
        return res.status(400).json({ message: err.message });
      }

      if (err) {
        // Errori generici: file corrotto, permessi, stream, ecc.
        return res.status(400).json({ message: "Upload non valido" });
      }

      next();
    });
  };
}

export default uploadErrorHandler;
