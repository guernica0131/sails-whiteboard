/**
 * SessionController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var room = 'whiteboard';

module.exports = {



    activate: function(req, res) {
        console.log("Activating the system for", req.socket.id);

        sails.sockets.join(req.socket, room);
        res.json({
            message: 'Subscribed to a fun room called ' + room + '!'
        });


    },

    clear: function(req, res) {

        var subscribers = sails.sockets.subscribers(room);

        if (!_.contains(subscribers, req.socket.id))
            return next();

        sails.sockets.broadcast(room, 'clear', {
            clear: "screen"
        }, req.socket);

    },

    draw: function(req, res, next) {
        var params = req.params.all();

        var subscribers = sails.sockets.subscribers(room);

        if (!_.contains(subscribers, req.socket.id))
            return next();

        sails.sockets.broadcast(room, 'draw', params, req.socket);
        res.json({
            message: 'Message sent!'
        });

    },

    destroy: function(req, res, next) {
        sails.sockets.leave(req.socket, room);

        res.json({
            message: 'Just left ' + room + '!'
        });
    },

    init: function(req, res) {

    },

    _config: {
        prefix: '',
        pluralize: false
    }




};