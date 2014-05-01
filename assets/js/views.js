App.CanvasView = Ember.View.extend({

    // once the element is inserted into the DOM
    didInsertElement: function() {

        this.canvas = this.$().children('#sketch');

        var canvas = document.getElementById('sketch'),
            context = canvas.getContext('2d'),
            view = this;

        Whiteboard(canvas, context, function(packet) {
            // @todo:: Add some addional manipulation of data 
        });



    }

});