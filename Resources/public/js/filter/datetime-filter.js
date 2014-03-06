/*global define*/

define(['jquery', 'underscore', './date-filter', 'orolocale/js/locale-settings', 'jquery-ui-timepicker'],
function ($, _, DateFilter, localeSettings) {
    'use strict';

    /**
     * Datetime filter: filter type as option + interval begin and end dates
     *
     * @export  orofilter/js/filter/datetime-filter
     * @class   orofilter.filter.DatetimeFilter
     * @extends orofilter.filter.DateFilter
     */
    return DateFilter.extend({
        /**
         * CSS class for visual datetime input elements
         *
         * @property
         */
        inputClass: 'datetime-visual-element',

        /**
         * Selectors for filter data
         *
         * @property
         */
        criteriaValueSelectors: {
            type: 'select[name=datetime]',
            part: 'select[name=datetime_part]',
            value: {
                start: 'input[name="start"]',
                end:   'input[name="end"]'
            }
        },

        /**
         * Datetime widget options
         *
         * @property
         */
        dateWidgetOptions: _.extend({
            timeFormat: localeSettings.getVendorDateTimeFormat('jquery_ui', 'time', 'HH:mm'),
            altFieldTimeOnly: false,
            altSeparator: ' ',
            altTimeFormat: 'HH:mm'
        }, DateFilter.prototype.dateWidgetOptions),

        /**
         * @inheritDoc
         */
        _initializeDateWidget: function (widgetSelector, options) {
            return this.$(widgetSelector).datetimepicker(options);
        },

        /**
         * @inheritDoc
         */
        _formatDisplayValue: function(value) {
            var dateFromFormat = this.dateWidgetOptions.altFormat;
            var dateToFormat = this.dateWidgetOptions.dateFormat;
            var timeFromFormat = this.dateWidgetOptions.altTimeFormat;
            var timeToFormat = this.dateWidgetOptions.timeFormat;

            if (value.value && value.value.start) {
                value.value.start = this._replaceDateVars(value.value.start, 'display');
            }
            if (value.value && value.value.end) {
                value.value.end = this._replaceDateVars(value.value.end, 'display');
            }

            return this._formatValueDatetimes(value, dateFromFormat, dateToFormat, timeFromFormat, timeToFormat);
        },

        /**
         * @inheritDoc
         */
        _formatRawValue: function(value) {
            var dateFromFormat = this.dateWidgetOptions.dateFormat;
            var dateToFormat = this.dateWidgetOptions.altFormat;
            var timeFromFormat = this.dateWidgetOptions.timeFormat;
            var timeToFormat = this.dateWidgetOptions.altTimeFormat;

            if (value.value && value.value.start) {
                value.value.start = this._replaceDateVars(value.value.start, 'raw');
            }
            if (value.value && value.value.end) {
                value.value.end = this._replaceDateVars(value.value.end, 'raw');
            }

            return this._formatValueDatetimes(value, dateFromFormat, dateToFormat, timeFromFormat, timeToFormat);
        },

        /**
         * Format datetimes in a valut to another format
         *
         * @param {Object} value
         * @param {String} dateFromFormat
         * @param {String} dateToFormat
         * @param {String} timeFromFormat
         * @param {String} timeToToFormat
         * @return {Object}
         * @protected
         */
        _formatValueDatetimes: function(value, dateFromFormat, dateToFormat, timeFromFormat, timeToToFormat) {
            if (value.value && value.value.start) {
                value.value.start = this._formatDatetime(
                    value.value.start, dateFromFormat, dateToFormat, timeFromFormat, timeToToFormat
                );

                value.value.start = value.value.start.replace(/^\s+|\s+$/g, '');
            }
            if (value.value && value.value.end) {
                value.value.end = this._formatDatetime(
                    value.value.end, dateFromFormat, dateToFormat, timeFromFormat, timeToToFormat
                );

                value.value.end = value.value.end.replace(/^\s+|\s+$/g, '');
            }
            return value;
        },

        /**
         * Formats datetime string to another format
         *
         * @param {String} value
         * @param {String} dateFromFormat
         * @param {String} dateToFormat
         * @param {String} timeFromFormat
         * @param {String} timeToToFormat
         * @return {String}
         * @protected
         */
        _formatDatetime: function(value, dateFromFormat, dateToFormat, timeFromFormat, timeToToFormat) {
            var datePart = this._formatDate(value, dateFromFormat, dateToFormat);
            var dateBefore = this._formatDate(datePart, dateToFormat, dateFromFormat);
            var timePart = value.substr(dateBefore.length + this.dateWidgetOptions.altSeparator.length);
            timePart = this._formatTime(timePart, timeFromFormat, timeToToFormat);
            return datePart + this.dateWidgetOptions.altSeparator + timePart;
        },

        /**
         * Formats time string to another format
         *
         * @param {String} value
         * @param {String} fromFormat
         * @param {String} toFormat
         * @return {String}
         * @protected
         */
        _formatTime: function(value, fromFormat, toFormat) {
            var fromValue = $.datepicker.parseTime(fromFormat, value);
            if (!fromValue) {
                fromValue = $.datepicker.parseTime(toFormat, value);
                if (!fromValue) {
                    return value;
                }
            }
            return $.datepicker.formatTime(toFormat, fromValue);
        }
    });
});
