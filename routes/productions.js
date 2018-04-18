'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const productionsModel = require('../models/productions');
const scenesModel = require('../models/scenes');

router.get('/', (req, res, next) => {
    productionsModel.byUser(req.params.user_id)
        .then((productions) => {
            res.json({ productions })
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:id', (req, res, next) => {
    productionsModel.getById(req.params.id)
        .then((production) => {
            res.json({ production })
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:id/cast', (req, res, next) => {
    productionsModel.castList(req.params.id)
        .then((cast) => {
            res.json({ cast })
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:id/blackoutdates', (req, res, next) => {
    productionsModel.blackoutDates(req.params.id)
        .then((blackoutDates) => {
            res.json({ blackoutDates })
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:id/admin', (req, res, next) => {
    const production = productionsModel.getById(req.params.id);
    const cast = productionsModel.blackoutDates(req.params.id);
    Promise.all([production, cast])
        .then((data) => {
            res.render('admin-console', { production: data[0], actors: data[1] });
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:id/admin/fullcalendar', (req, res, next) => {
    const production = productionsModel.getById(req.params.id);
    const cast = productionsModel.blackoutDates(req.params.id);
    const scenes = scenesModel.rehearsalDatesByProduction(req.params.id);
    Promise.all([production, cast, scenes])
        .then((data) => {
            const calendarEvents = [];
            if (data[0].performance_dates) {
                data[0].performance_dates.forEach((performance) => {
                    const event = { title: data[0].name, start: performance, className: 'performance' };
                    calendarEvents.push(event);
                });
            }
            for (const actor of data[1]) {
                if (actor.blackout_dates) {
                    for (const blackout_date of actor.blackout_dates) {
                        const event = { title: `${actor.character}`, start: blackout_date, className: 'blackout' };
                        calendarEvents.push(event);
                    }
                }
            }

            for (const sceneRearsal of data[2]) {
                const rehearsalEvent = { id: sceneRearsal.id, title: `${sceneRearsal.name} ${sceneRearsal.character}`, start: sceneRearsal.start_time, end: sceneRearsal.end_time, className: 'rehearsal' };
                calendarEvents.push(rehearsalEvent);
            }

            res.json(calendarEvents);

        })
        .catch((err) => {
            next(err);
        });
});

router.post('/', (req, res, next) => {
    productionsModel.create(req.body)
        .then((production) => {
            res.status(201).json(production)
        })
        .catch((err) => {
            res.send(err)
        });
});

module.exports = router;
