///////////////////////////////////////////
//// ROUTER
///////////////////////////////////////////





App.Router.map(function() {

});


App.IndexController = Ember.ArrayController.extend({
    newName: '',
    file: function(name) {

        return this.store.createRecord(name, {
            name: nName
        });
    }.property('model'), //'model'),
    actions: {

        createFile: function() {
            var controller = this,
                nName = this.get('newName');
            if (!nName)
                return console.log("The input cannot be empty");

            var file = this.store.createRecord('file', {
                name: nName
            });

            file.save().then(function(file) {
                controller.get('model').addObject(file);
                controller.set('newName', '');

            });

        }
    }

});


///////////////////////////////////////////
//// ROUTES
///////////////////////////////////////////

App.IndexRoute = Ember.Route.extend({
    model: function() {
        return this.store.findAll('file');
    }
});