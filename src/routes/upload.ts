/// <reference path="../../typings.d.ts" />
import * as moment from 'moment';
import * as express from 'express';
import { Router, Request, Response } from 'express';
import { ServiceModel } from '../models/service';
import * as HttpStatus from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
const multer = require("multer");
const uploadDir = process.env.PATH_IMAGE || './images';
const IncomingForm = require('formidable').IncomingForm
const fs = require('fs');
const serviceModel = new ServiceModel();
import * as path from 'path';

var storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + '_' + file.originalname)
  }
});


const router: Router = Router();
let upload = multer({ storage: storage });




// router.post('/', upload.any(), async (req: any, res: any) => {
//   try {
//     const db = req.db;
//     if (req.files.length) {
//       const uuid = uuidv4();
//       const obj: any = {};
//       obj.id = uuid;
//       obj.originalname = req.files[0].originalname;
//       obj.mimetype = req.files[0].originalname;
//       obj.filename = req.files[0].filename;
//       obj.size = req.files[0].size;
//       await serviceModel.saveUploads(req.db, obj);



//       let code: any;
//       do {
//         code = serviceModel.randomString(4);
//       } while (await serviceModel.checkCodeDup(db, code).length);
//       const urlRedirect = process.env.HOST_URL + '/' + code
//       const head = {
//         url_redirect: urlRedirect,
//       }
//       const id = await serviceModel.saveRedirect(db, head);
//       await serviceModel.updateExpired(db, id);

//       const reDetails = {
//         redirect_id: id,
//         type: 'WEB',
//         url: process.env.HOST_URL + '/uploads' + uuid
//       };
//       await serviceModel.saveRedirectDetails(db, reDetails);
//       const res: any = {
//         code: code,
//         url: urlRedirect
//       }
//       res.send({ ok: true, rows: res });
//     }
//   } catch (error) {
//     res.send({ ok: false })
//   }
// });

router.post('/', upload.any(), async (req: any, res: any) => {
  try {
    const db = req.db;
    if (req.files.length) {
      const uuid = uuidv4();
      let code: any;
      do {
        code = serviceModel.randomString(4);
      } while (await serviceModel.checkCodeDup(db, code).length);
      const urlRedirect = process.env.HOST_URL + '/uploads/' + code
      const obj: any = {};
      obj.id = uuid;
      obj.originalname = req.files[0].originalname;
      obj.mimetype = req.files[0].mimetype;
      obj.filename = req.files[0].filename;
      obj.size = req.files[0].size;
      obj.code = code;
      obj.url_redirect = urlRedirect
      await serviceModel.saveUploads(req.db, obj);
      await serviceModel.updateExpiredUpload(db, uuid);

      const response: any = {
        code: code,
        url: urlRedirect
      }
      console.log(response);

      res.send({ ok: true, rows: response });
      // res.send({ ok: true, rows: res });
    } else {
      res.send({ ok: false, error: 'ไม่พบไฟล์' })
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message })
  }
});


router.get('/:code', async (req: Request, res: Response) => {
  try {
    const db = req.db;
    const code = req.params.code;
    const ua = req.useragent;
    const rs: any = await serviceModel.getUploads(db, code);
    if (rs.length) {
      console.log(rs);
      if (rs.length) {
        const filePath = `${process.env.PATH_IMAGE}/${rs[0].filename}`;
        const fileName = path.basename(filePath);
        const mimeType = rs[0].mimetype;

        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.setHeader('Content-type', mimeType);

        let filestream = fs.createReadStream(filePath);
        filestream.pipe(res);
      } else {
      res.send({ ok: false, error: 'image not found!', statusCode: 500 });
      }
    } else {
      res.send({ ok: false, error: 'ไม่พบ code ', code: HttpStatus.NO_CONTENT });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

export default router;