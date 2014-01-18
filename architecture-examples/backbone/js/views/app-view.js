/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
	'use strict';

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	app.AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#todoapp',

		// Our template for the line of statistics at the bottom of the app.
		statsTemplate: _.template($('#stats-template').html()),

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			'keypress #new-todo': 'createOnEnter',
			'click #clear-completed': 'clearCompleted',
			'click #toggle-all': 'toggleAllComplete'
		},

		// At initialization we bind to the relevant events on the `Todos`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting todos that might be saved in *localStorage*.
		initialize: function () {
			this.allCheckbox = this.$('#toggle-all')[0];
			this.$input = this.$('#new-todo');
			this.$footer = this.$('#footer');
			this.$main = this.$('#main');
			this.$list = $('#todo-list');

			this.listenTo(app.todos, 'add', this.addOne);
			this.listenTo(app.todos, 'reset', this.addAll);
			this.listenTo(app.todos, 'change:completed', this.filterOne);
			this.listenTo(app.todos, 'filter', this.filterAll);
			this.listenTo(app.todos, 'all', this.render);

			// Suppresses 'add' events with {reset: true} and prevents the app view
			// from being re-rendered for every model. Only renders when the 'reset'
			// event is triggered at the end of the fetch.
			app.todos.fetch({reset: true});
                        if (app.todos.length == 0)
                        {
                          app.todos.reset([
                            {
                              "title":"Set up the work environment, including the desk, computer, email address and phone.","order":3,"completed":false,"id":"1d30fe19-cc2d-1db4-5a78-819ef9583ad2"
                            },
                            {
                              "title":"Send out a welcome email to announce the arrival of the new hire two weeks prior the first day.","order":2,"completed":false,"id":"49d252fe-0660-0fae-5e95-17b0e411a3c4"
                            },
                            {
                              "title":"Send reference materials and the schedule of the upcoming days.","order":1,"completed":false,"id":"5772ea11-669c-08db-22be-de764e68b54f"
                            },
                            {
                              "title":"Go out of your way to make the first day a success.","order":6,"completed":false,"id":"8001125b-1fa5-1332-c1b5-2b80f04fc627"
                            },
                            {
                              "title":"Lay out the plan and expectations for the upcoming weeks.","order":7,"completed":false,"id":"a4806e3e-fd62-ca96-e9a8-639e74836e70"
                            },
                            {
                              "title":"Identify and notify the colleagues who need to participate proactively on the first day.","order":4,"completed":false,"id":"e51ec051-b1e2-94bb-1351-ce7bc8dd0a2d"
                            },
                            {
                              "title":"Schedule a short meeting with the management and set up lunch with peers.","order":5,"completed":false,"id":"ed73441c-9aff-89b3-11f9-bd5fec919c4c"
                            }]);

                          app.todos.each(function (todo) { todo.save() });
                        }
                        
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function () {
			var completed = app.todos.completed().length;
			var remaining = app.todos.remaining().length;

			if (app.todos.length) {
				this.$main.show();
				this.$footer.show();

				this.$footer.html(this.statsTemplate({
					completed: completed,
					remaining: remaining
				}));

				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + (app.TodoFilter || '') + '"]')
					.addClass('selected');
			} else {
				this.$main.hide();
				this.$footer.hide();
			}

			this.allCheckbox.checked = !remaining;
		},

		// Add a single todo item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function (todo) {
			var view = new app.TodoView({ model: todo });
			this.$list.append(view.render().el);
		},

		// Add all items in the **Todos** collection at once.
		addAll: function () {
			this.$list.html('');
			app.todos.each(this.addOne, this);
		},

		filterOne: function (todo) {
			todo.trigger('visible');
		},

		filterAll: function () {
			app.todos.each(this.filterOne, this);
		},

		// Generate the attributes for a new Todo item.
		newAttributes: function () {
			return {
				title: this.$input.val().trim(),
				order: app.todos.nextOrder(),
				completed: false
			};
		},

		// If you hit return in the main input field, create new **Todo** model,
		// persisting it to *localStorage*.
		createOnEnter: function (e) {
			if (e.which === ENTER_KEY && this.$input.val().trim()) {
				app.todos.create(this.newAttributes());
				this.$input.val('');
			}
		},

		// Clear all completed todo items, destroying their models.
		clearCompleted: function () {
			_.invoke(app.todos.completed(), 'destroy');
			return false;
		},

		toggleAllComplete: function () {
			var completed = this.allCheckbox.checked;

			app.todos.each(function (todo) {
				todo.save({
					'completed': completed
				});
			});
		}
	});
})(jQuery);
