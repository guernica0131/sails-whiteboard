///////////////////////////////////////////
//// ROUTER
///////////////////////////////////////////


App.Router.map(function() {

});


App.IndexController = Ember.ArrayController.extend({
    userName: '',
    talk: '',
    status: 3,
    session: false,
    sortAscending: false,
    sortProperties: ['createdAt'],
    conversation: function(name) {

        return this.store.createRecord(name, {
            name: nName
        });
    }.property('model'), //'model'),


    actions: {

        converse: function() {
            var controller = this,
                uName = this.get('userName'),
                talk = this.get('talk'),
                status = this.get('status'),
                $active = $('#color-pickers').children('.active');

            if (!uName)
                uName = 'Lazy Lotus'
            if (!talk)
                return console.log("The input cannot be empty");

            var color = $active.css('background-color');
            //console.log("My color", color);
            var conversation = this.store.createRecord('conversation', {
                name: uName,
                text: talk,
                status: status,
                color: color
            });

            conversation.save().then(function(file) {
                controller.get('model').addObject(file);
                controller.set('talk', '');

            });

        },
        startSession: function() {
            console.log("Starting session");
            var $this = $('#staring-together');
            if ($this.hasClass('btn-success')) {
                this.set('session', false);
            } else {
                this.set('session', true);
            }

        }
    }

});


///////////////////////////////////////////
//// ROUTES
///////////////////////////////////////////

App.IndexRoute = Ember.Route.extend({
    model: function() {
        return this.store.findAll('conversation');
    }
});