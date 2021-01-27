import * as Knex from 'knex';

export class ServiceModel {

  getRedirect(db: Knex, code) {
    return db('redirects as r')
      .join('redirect_details as rd', 'rd.redirect_id', 'r.id')
      .where('r.code', code)
      .where('r.is_actived', 'Y')
      .where('r.is_deleted', 'N');
  }

  getUploads(db: Knex, code) {
    return db('uploads as r')
      .where('r.code', code)
      .where('r.is_actived', 'Y')
      .where('r.is_deleted', 'N');
  }

  saveRedirect(db: Knex, data) {
    return db('redirects')
      .insert(data, 'id');
  }

  saveRedirectDetails(db: Knex, data) {
    return db('redirect_details')
      .insert(data);
  }

  checkCodeDup(db, code) {
    return db('redirects as r')
      .where('r.code', code)
      .where('r.is_actived', 'Y')
      .where('r.is_deleted', 'N');
  }

  updateExpired(db: Knex, redirectId, day = 30) {
    const sql = `update redirects set expired_date=now()+INTERVAL ${day} DAY where id = ${redirectId}`;
    // const sql =  db('redirects')
    //   .update(db.raw(`expired_date = NOW() + INTERVAL ${day} DAY`))
    //   .where('id', redirectId);
      console.log(sql.toString());
      return sql;
      
  }

  updateExpiredUpload(db: Knex, id, day = 30) {
    const sql = `update uploads set expired_date=now()+INTERVAL ${day} DAY where id = ${id}`;
      return sql;
      
  }

  saveUploads(db: Knex, data) {
    return db('uploads').insert(data);
  }

   randomString(digitLength: number) {
    var _digitLength = digitLength || 10;
    var strRandom = '';
    //3digit = 238,328
    //4digit = 14,776,336
    var random = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < _digitLength; i++) { strRandom += random.charAt(Math.floor(Math.random() * random.length)); }
    return strRandom;
  }
  
}