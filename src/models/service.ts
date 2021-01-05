import * as Knex from 'knex';

export class ServiceModel {

  getRedirect(db: Knex, code) {
    return db('redirects as r')
      .join('redirect_details as rd', 'rd.redirect_id', 'r.id')
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
    return db('redirects')
      .update(db.raw(`expired_date = NOW() + INTERVAL ${day} DAY`))
      .where('id', redirectId);
  }
}