define([
    'jquery',
    'routing',
    'underscore',
    'orotranslation/js/translator',
    'oroui/js/tools',
    './abstract-filter'
], function($, routing, _, __, tools, AbstractFilter) {
    'use strict';

    // @const
    var FILTER_EMPTY_VALUE = '';

    var DictionaryFilter;

    /**
     * Multiple select filter: filter values as multiple select options
     *
     * @export  oro/filter/multiselect-filter
     * @class   oro.filter.MultiSelectFilter
     * @extends oro.filter.SelectFilter
     */
    DictionaryFilter = AbstractFilter.extend({
        renderMode: 'select2',
        /**
         * Filter selector template
         *
         * @property
         */
        templateSelector: '#dictionary-filter-template',

        /**
         * Template selector for date field parts
         *
         * @property
         */
        fieldTemplateSelector: '#select-field-template',

        /**
         * Select widget options
         *
         * @property
         */
        widgetOptions: {
            multiple: true,
            classes: ''
        },

        /**
         * Minimal width of dropdown
         *
         * @private
         */
        minimumDropdownWidth: 120,

        /**
         * @inheritDoc
         */
        initialize: function(options) {
            //this.constructor.prototype

            DictionaryFilter.__super__.initialize.apply(this, arguments);
        },

        render: function() {
            var className = this.constructor.prototype;
            var self = this;
            $.ajax({
                url: routing.generate(
                    'oro_api_get_dictionary_value_count',
                    {dictionary: className.filterParams.class.replace(/\\/g, '_'), limit: -1}
                ),
                success: function(data) {
                    self.count = data;
                    if (data > 10) {
                        self.componentMode = 'select2autocomplate';
                    } else {
                        self.componentMode = 'select2';
                    }

                    self.renderSelect2();
                },
                error: function(jqXHR) {
                    //messenger.showErrorMessage(__('Sorry, unexpected error was occurred'), jqXHR.responseJSON);
                    //if (errorCallback) {
                    //    errorCallback(jqXHR);
                    //}
                }
            });
        },

        loadSelectedValue: function() {
            var self = this;
            var className = this.constructor.prototype;

            $.ajax({
                url: routing.generate(
                    'oro_dictionary_value',
                    {
                        dictionary: className.filterParams.class.replace(/\\/g, '_')
                    }
                ),
                data: {
                    'keys': this.value.value
                },
                success: function(reposne) {
                    self.value.value = reposne.results;
                    self.applySelect2();
                },
                error: function(jqXHR) {
                    //messenger.showErrorMessage(__('Sorry, unexpected error was occurred'), jqXHR.responseJSON);
                    //if (errorCallback) {
                    //    errorCallback(jqXHR);
                    //}
                }
            });
        },

        renderSelect2: function() {
            this.loadSelectedValue();
        },

        applySelect2: function() {
            debugger;
            var className = this.constructor.prototype;
            var tt = _.template($(this.templateSelector).html());
            this.$el.append(tt);

            if (this.componentMode === 'select2autocomplate') {
                this.$el.find('.select-values-autocomplete').removeClass('hide');
                this.$el.find('.select-values-autocomplete').attr('multiple','multiple').select2({
                    multiple: true,
                    containerCssClass: 'dictionary-filter',
                    ajax: {
                        url: routing.generate(
                            'oro_dictionary_filter',
                            {
                                dictionary: className.filterParams.class.replace(/\\/g, '_')
                            }
                        ),
                        dataType: 'json',
                        delay: 250,
                        type: 'POST',
                        data: function(params) {
                            return {
                                q: params // search term
                            };
                        },
                        results: function(data, page) {
                            // parse the results into the format expected by Select2.
                            // since we are using custom formatting functions we do not need to
                            // alter the remote JSON data
                            return {
                                results: data.results
                            };
                        },
                        cache: true
                    },
                    dropdownAutoWidth: true,
                    escapeMarkup: function(markup) { return markup; }, // let our custom formatter work
                    minimumInputLength: 1
                });
                var value1 = [];
                console.log('applySelect2', this.value.value);
                $.each(this.value.value, function(index, value) {
                    value1.push({
                        'id': value.id,
                        'text': value.text
                    });
                });
                console.log('value1', value1);
                this.$el.find('.select-values-autocomplete').select2('data',  value1);
            }

            if (this.componentMode === 'select2') {
                var self = this;
                var proto = this.__proto__;

                this.$el.find('.select-values').removeClass('hide');
                $.each(proto.choices[0], function(index, value) {
                    var html = '<option value="' + value.id + '">' + value.text + '</option>';
                    self.$el.find('.select-values').append(html);
                });
                this.$el.find('.select-values').attr('multiple','multiple').select2({
                    containerCssClass: 'dictionary-filter',
                    dropdownAutoWidth: true
                }).on('change', function(e) {
                    self.applyValue();
                });

                var value1 = [];
                $.each(this.value.value, function(index, value) {
                    value1.push({
                        'id': value.id,
                        'text': value.text
                    });
                });

                this.$el.find('.select-values').select2('data', value1);
            }
        },

        isEmptyValue: function() {
            return false;
        },

        /**
         * @inheritDoc
         */
        _renderCriteria: function() {
            debugger;
            var value = _.extend({}, this.emptyValue, this.getValue());
            var part = {value: value.part, type: value.part};

            var selectedChoiceLabel = this._getSelectedChoiceLabel('choices', value);
            var selectedPartLabel = this._getSelectedChoiceLabel('dateParts', part);
            this.dateWidgetOptions.part = part.type;

            var datePartTemplate = this._getTemplate(this.fieldTemplateSelector);
            var parts = [];

            // add date parts only if embed template used
            if (this.templateTheme !== '') {
                parts.push(
                    datePartTemplate({
                        name: this.name + '_part',
                        choices: this.dateParts,
                        selectedChoice: value.part,
                        selectedChoiceLabel: selectedPartLabel
                    })
                );
            }

            parts.push(
                datePartTemplate({
                    name: this.name,
                    choices: this.choices,
                    selectedChoice: value.type,
                    selectedChoiceLabel: selectedChoiceLabel
                })
            );

            var displayValue = this._formatDisplayValue(value);
            var $filter = $(
                this.template({
                    inputClass: this.inputClass,
                    value: displayValue,
                    parts: parts
                })
            );

            this._appendFilter($filter);
            this.$(this.criteriaSelector).attr('tabindex', '0');

            this._renderSubViews();
            this.changeFilterType(value.type);

            this._criteriaRenderd = true;
        },

        getValue: function() {
            var value = {};
            console.log('getValue', this.value.value);
            if (this.componentMode === 'select2autocomplate') {
                value.value =  this.$el.find('.select-values-autocomplete').select2('val');
            } else if (this.componentMode === 'select2') {
                value.value =  this.$el.find('.select-values').select2('val');
            } else {
                value.value = this.value.value;
            }
            return value;
        },

        _writeDOMValue: function(value) {
            this._setInputValue(this.inputSelector, value);
            return this;
        },

        _readDOMValue: function() {
            return this.getValue();
        }
    });

    return DictionaryFilter;
});
