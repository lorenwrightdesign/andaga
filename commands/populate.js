const sqlite3   = require('sqlite3').verbose(),
        db      = new sqlite3.Database('gemynd.db'),
        fs      = require('fs'),
        backup  = require('./backup');




const getTotals = (callback) => {
    let total;
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS gemynd (date TEXT, category TEXT, time INT, notes TEXT, place TEXT)', () => {
            db.get('SELECT COUNT(*) FROM gemynd', (err, row) => {
                if (err) {
                    throw err;
                } else {
                    total = row[Object.keys(row)[0]];
                    callback(total);
                }
            });
        });
    })
}

const enterRecords = (obj, callback) => {
    db.serialize(() => {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                db.run(obj[key], (err) => {
                    if (err)
                        throw err;
                });
            }
        }
    })
    callback();
}

const populate = () => {
    backup.duplicate();
    getTotals( (e) => {
        console.log('\n -|- ándaga logs prior to populate = ' + e + ' -|-')
        if (fs.existsSync('./gemynd.json')) {
            const jlogs = require('../gemynd.json');
            let jsonLength = (Object.keys(jlogs).length);
            enterRecords(jlogs, () => {
                getTotals( (l) => {
                    console.log('\n -|- ándaga logs after populate = ' + l + ' -|-');
                });
            });
        } else {
            console.log('\n -|- ándaga error -|- \n\n gemynd not found');
        }
    });
}

module.exports.populate = populate;