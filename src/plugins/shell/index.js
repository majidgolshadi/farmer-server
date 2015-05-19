'use strict';

var _       = require('underscore'),
    Q       = require('q'),
    emitter = require('../../core/farmer/emmiter');

function Shell () {
}

/**
 * Register plugin methods on emitter events thrower
 */
Shell.prototype.registerPlugin = function () {
    emitter.register('create', 100, this.farmfile);
    emitter.register('deploy', 100, this.farmfile);
};

/**
 * Run shell
 * Run shell commands on container
 * @param {Bag} bag
 */
Shell.prototype.farmfile = function (bag) {
    var farmerfile = bag.get('farmerfile');

    if (farmerfile.get('shell')) {
        var containers = bag.get('containers'),
            publisher  = bag.get('publisher'),
            commands = farmerfile.get('shell');

        // pause executing command till containers ready to use
        setTimeout(function() {

            _(containers).reduce(function (prevPromise, containerObj, alias) {
                console.log('>>> alias >>>', alias);
                return prevPromise.then(function () {
                    console.log('>>> commands[alias]>>>', commands[alias]);
                    _(commands[alias]).reduce(function (prevPromise2, command) {
                        return prevPromise2.then(function () {
                            console.log('>>> command >>>', command);
                            return containerObj.execShell(command, publisher)
                                .tap(publisher.toClient).catch(publisher.toClient);
                        });
                    }, Q.when(true));

                    return Q.when(true);
                });

            }, Q.when(true));

        }, 1000);
    } else {
        return Q.when(true);
    }
};

module.exports = new Shell();
