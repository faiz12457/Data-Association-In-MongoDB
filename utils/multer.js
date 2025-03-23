import multer,{diskStorage} from "multer";

import path from "path"
import crypto from "crypto"


const storage = diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
      crypto.randomBytes(12,(err,bytes)=>{
       const fn= bytes.toString("hex") + path.extname(file.originalname);
        cb(null,fn);
      })
     
    }
  })

  export const upload = multer({ storage: storage })