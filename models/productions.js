'use strict';

const knex = require('../db/knex');
const Resource = require('./resource');

class Productions extends Resource {
    byUser(userId) {
        return knex(this.table)
            .select('productions.id as id', 'productions.name as production', 'dates')
            .join('users_productions', 'productions.id', 'users_productions.production_id')
            .where('users_productions.user_id', userId);
    };

    castList(id) {
        return knex('users')
            .orderBy('users.id')
            .select('users.first_name', 'users.last_name', 'characters.name as character')
            .join('users_characters', 'users.id', 'users_characters.user_id')
            .join('characters', 'users_characters.character_id', 'characters.id')
            .join('users_productions', 'users_productions.user_id', 'users.id')
            .where('users_productions.production_id', id);
    }

    blackoutDates(id) {
        return knex('users')
            .orderBy('id')
            .select('users.id as id', 'users.first_name', 'users.last_name', 'characters.name as character', 'users_productions.blackout_dates')
            .join('users_productions', 'users.id', 'users_productions.user_id')
            .join('users_characters', 'users.id', 'users_characters.user_id')
            .join('characters', 'users_characters.character_id', 'characters.id')
            .where('users_productions.production_id', id);
    }

};

module.exports = new Productions('productions');