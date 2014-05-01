////////////////////////
/// MODELS
////////////////////////

/*
 * Files model
 */
App.File = DS.Model.extend({
    name: DS.attr('string')
    //src: 
});

/*
 * Sketch Model
 */

App.Sketch = DS.Model.extend({

});


/*
 * Conversation
 */

App.Conversation = DS.Model.extend({
    name: DS.attr('string'),
    text: DS.attr('string'),
    status: DS.attr('number'),
    color: DS.attr('string'),
    createdAt: DS.attr('date')
    //src: 
});

/*
 * Files user
 */
App.User = DS.Model.extend({
    name: DS.attr('string')

})