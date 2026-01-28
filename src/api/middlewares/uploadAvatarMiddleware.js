import multer from "multer";
import config from "../../../config/config.js";

const storage = multer.diskStorage({
  destination: config.AVATAR.FILE_SYSTEM_PATH,
  filename: (req, file, cb) => {
    const uniqueName = `${req.userId}-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const uploadAvatarMiddleware = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 2 // 2 MB
  }
});

export default uploadAvatarMiddleware;
