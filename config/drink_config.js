var fs = require('fs');

/**
 * Production configuration file
 */
exports.config = {
    machine_server: {
        host: '0.0.0.0',
        port: 4343
    },
    tini_ips: {
        ///* //Testing
        '129.21.50.36': 's',
        '129.21.49.50': 'ld', //currently masquerading my Client IP as little drink
        '129.21.120.59': 'd' //currently masquerading my IP as drink
        //*/
        /* //testing 2
        '129.21.50.36': 's',
        '129.21.49.185': 'ld',
        '129.21.50.18': 'd',
        '129.21.49.50': 'adt'
        */
    },
    machine_ip_mapping: {
      ///*testing
        '129.21.120.59': 'd', //currently masquerading my IP as drink
        '129.21.49.50': 'ld', //currently masquerading my Client IP as  little drink
        '129.21.49.107': 's'
        //*/
      /*  //testing 2
        '129.21.49.106': 'd',
        '129.21.49.105': 'ld',
        '129.21.49.107': 's',
        '129.21.49.50':'adt'
        */
    },
    machines: {
        ld: {
            machine_id: 'ld',
            long_name: 'Little Drink',
            connected: false,
            socket: null,
            has_sensor: true
        },
        d: {
            machine_id: 'd',
            long_name: 'Big Drink',
            connected: false,
            socket: null,
            has_sensor: true
        },
        s: {
            machine_id: 's',
            long_name: 'Snack',
            connected: false,
            socket: null,
            has_sensor: false
        },
        adt: {
          machine_id: 'adt',
          long_name: 'Austin Drink Test',
          connected: false,
          socket: null,
          has_sensor: false
        }
    },
    sunday: {
        host: '0.0.0.0',
        port: 4242
    },
    sunday_ssl: {
        host: '0.0.0.0',
        port: 4243,
        //ssl: {
            //key: fs.readFileSync('/etc/ssl/drink/key.pem'),
            //cert: fs.readFileSync('/etc/ssl/drink/cert.pem'),
            //ca: fs.readFileSync('/etc/ssl/certs/CA-Certificate.crt')
        //}
    },
    sunday_opcodes: [
        'UPTIME',
        'WHOAMI',
        'GETBALANCE',
        'QUIT',
        'MACHINE',
        'DROP',
        'USER',
        'PASS',
        'IBUTTON',
        'STAT',
        'SERVERSTAT',
        'SENDCREDITS'
    ],
    error_codes: require('./drink_response_codes.js').codes,
    machine_codes: {
        "ld": "Little Drink",
        "d": "Big Drink",
        "s": "Snack",
        "adt":"Austin Drink Test"
    },
    logging: {
        stdout: true,
        db: true,
        file: true,
        db_data: {
            host: 'localhost',
            port: 27017,
            db: 'drink_log'
        }
    }
}
