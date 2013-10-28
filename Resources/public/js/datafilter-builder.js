/* jshint browser:true */
/* global define, require */
define(['jquery', 'underscore', 'oro/tools', 'oro/mediator', 'oro/datafilter/collection-filters-manager'],
function($, _, tools,  mediator, FiltersManager) {
    'use strict';

    var filterModuleName = 'oro/datafilter/{{type}}-filter',
        filterTypes = {
            string:      'choice',
            choice:      'select',
            selectrow:   'select-row',
            multichoice: 'multiselect',
            boolean:     'select'
        },
        methods = {
            initBuilder: function () {
                this.metadata = _.extend({filters: {}}, this.$el.data('metadata'));
                this.modules = {};
                methods.collectModules.call(this);
                tools.loadModules(this.modules, _.bind(methods.build, this));
            },

            /**
             * Collects required modules
             */
            collectModules: function () {
                var modules = this.modules;
                _.each((this.metadata.filters || {}) || {}, function (filter) {
                     var type = filter.type;
                     modules[type] = filterModuleName.replace('{{type}}', filterTypes[type] || type);
                });
            },

            build: function () {
                var options = methods.combineOptions.call(this);
                options.collection = this.collection;
                this.$el.prepend((new FiltersManager(options)).render().$el);
                mediator.trigger('datagrid_filters:rendered', this.collection);
            },

            /**
             * Process metadata and combines options for filters
             *
             * @returns {Object}
             */
            combineOptions: function () {
                var filters= {},
                    modules = this.modules;
                _.each(this.metadata.filters, function (options) {
                    if (_.has(options, 'name') && _.has(options, 'type')) {
                        filters[options.name] = new (modules[options.type].extend(options));
                    }
                });
                return {filters: filters};
            }
        };

    mediator.on('datagrid_collection_set_after', function (collection, $el) {
        methods.initBuilder.call({$el: $el, collection: collection});
    });
});