import * as express from 'express';
import { Router, Request, Response } from 'express';
import { Jwt } from '../models/jwt';
import * as HttpStatus from 'http-status-codes';
import { ServiceModel } from '../models/service';
import { find } from 'lodash';
const jwt = new Jwt();
const fs = require('fs');
import * as path from 'path';
const serviceModel = new ServiceModel();
const router: Router = Router();


router.get('/:code', async (req: Request, res: Response) => {
  try {
    const db = req.db;
    const code = req.params.code;
    const ua = req.useragent;
    const rs: any = await serviceModel.getRedirect(db, code);
    if (rs.length) {
      if (rs[0].code_type == 'QRCODE') {
        const webUrl = find(rs, { 'type': 'WEB' });
        const iosUrl = find(rs, { 'type': 'IOS' });
        const androidUrl = find(rs, { 'type': 'ANDROID' });
        // find device;
        if (ua.isiPhone || ua.isiPhoneNative || ua.isiPad) {
          if (iosUrl) {
            res.redirect(iosUrl.url);
          } else {
            res.redirect(webUrl.url);
          }
        } else if (ua.isAndroid || ua.isAndroidNative) {
          if (androidUrl) {
            res.redirect(androidUrl.url);
          } else {
            res.redirect(webUrl.url);
          }
        } else {
          res.redirect(webUrl.url);
        }
      }
      else if (rs[0].code_type == 'URL') {
        const webUrl = find(rs, { 'type': 'WEB' });
        res.redirect(webUrl.url);
      } else if (rs[0].code_type == 'UPLOAD') {
        const filePath = `${process.env.PATH_IMAGE}/${rs[0].filename}`;
        const fileName = path.basename(filePath);
        const mimeType = rs[0].mimetype;
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.setHeader('Content-type', mimeType);
        let filestream = fs.createReadStream(filePath);
        filestream.pipe(res);
      } else {
        console.log(rs[0].code_type);
        res.send({ ok: false, error: 'ผิดรูปแบบ', code: HttpStatus.NO_CONTENT });
      }
    } else {
      res.send({ ok: false, error: 'ไม่พบ code ', code: HttpStatus.NO_CONTENT });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const db = req.db;
    const details = req.body.details;
    const type = req.body.type;
    let code: any;
    do {
      code = randomString(4);
    } while (await serviceModel.checkCodeDup(db, code).length);
    const urlRedirect = process.env.HOST_URL + '/' + code
    const head = {
      type: type,
      code,
      url_redirect: urlRedirect,
    }
    const id = await serviceModel.saveRedirect(db, head);
    await serviceModel.updateExpired(db, id);
    const reDetails = [];
    for (const i of details) {
      const detail = {
        redirect_id: id,
        type: i.type,
        url: i.url
      }
      reDetails.push(detail);
    }
    await serviceModel.saveRedirectDetails(db,reDetails);
    const response: any = {
      code: code,
      url: urlRedirect
    }
    res.send({ ok: true, rows: response });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

function randomString(digitLength: number) {
  var _digitLength = digitLength || 10;
  var strRandom = '';
  //3digit = 238,328
  //4digit = 14,776,336
  var random = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < _digitLength; i++) { strRandom += random.charAt(Math.floor(Math.random() * random.length)); }
  return strRandom;
}

// function randomNumber(digit = 6) {
//   var strRandom = '';
//   var random = '0123456789';
//   for (var i = 0; i < digit; i++) { strRandom += random.charAt(Math.floor(Math.random() * random.length)); }
//   return strRandom;
// }
export default router;