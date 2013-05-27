var Oro = Oro || {};
Oro.Filter = Oro.Filter || {};

/**
 * Basic grid filter
 *
 * @class   Oro.Filter.AbstractFilter
 * @extends Backbone.View
 */
Oro.Filter.AbstractFilter = Backbone.View.extend({
    /**
     * Filter container tag
     *
     * @property {String}
     */
    tagName: 'div',

    /**
     * Filter container class name
     *
     * @property {String}
     */
    className: 'btn-group filter-item oro-drop',

    /**
     * Is filter enabled
     *
     * @property {Boolean}
     */
    enabled: false,

    /**
     * Is filter enabled by default
     *
     * @property {Boolean}
     */
    defaultEnabled: false,

    /**
     * Name of filter field
     *
     * @property {String}
     */
    name: 'input_name',

    /**
     * Label of filter
     *
     * @property {String}
     */
    label: 'Input Label',

    /**
     * Raw value of filter
     *
     * @property {Object}
     */
    value: {},

    /**
     * Empty value object
     *
     * @property {Object}
     */
    emptyValue: {},

    /**
     * Parent element active class
     *
     * @property {String}
     */
    buttonActiveClass: 'open-filter',

    /**
     * Null link value
     *
     * @property {String}
     */
    nullLink: 'javascript:void(0);',

    /**
     * Initialize.
     *
     * @param {Object} options
     * @param {Boolean} [options.enabled]
     */
    initialize: function(options) {
        options = options || {};
        if (_.has(options, 'enabled')) {
            this.enabled = options.enabled;
        }
        this.defaultEnabled = this.enabled;
        Backbone.View.prototype.initialize.apply(this, arguments);
    },

    /**
     * Enable filter
     *
     * @return {*}
     */
    enable: function() {
        if (!this.enabled) {
            this.enabled = true;
            this.show();
            this.trigger('enable', this);
        }
        return this;
    },

    /**
     * Disable filter
     *
     * @return {*}
     */
    disable: function() {
        if (this.enabled) {
            this.enabled = false;
            this.hide();
            this.trigger('disable', this);
            this.reset();
        }
        return this;
    },

    /**
     * Show filter
     *
     * @return {*}
     */
    show: function() {
        this.$el.css('display', 'inline-block');
        return this;
    },

    /**
     * Hide filter
     *
     * @return {*}
     */
    hide: function() {
        this.$el.hide();
        return this;
    },

    /**
     * Reset filter elements
     *
     * @return {*}
     */
    reset: function() {
        this.setValue(this.emptyValue);
        return this;
    },

    /**
     * Get clone of current value
     *
     * @return {Object}
     */
    getValue: function() {
        return Oro.deepClone(this.value);
    },

    /**
     * Set value to filter
     *
     * @param value
     * @return {*}
     */
    setValue: function(value) {
        value = this._formatRawValue(value);
        if (this._isNewValueUpdated(value)) {
            var oldValue = this.value;
            this.value = Oro.deepClone(value);
            this._updateDOMValue();
            this._onValueUpdated(this.value, oldValue);
        }
        return this;
    },

    /**
     * Converts a display value to raw format, e.g. decimal value can be displayed as "5,000,000.00"
     * but raw value is 5000000.0
     *
     * @param {*} value
     * @return {*}
     * @protected
     */
    _formatRawValue: function(value) {
        return value;
    },

    /**
     * Converts a raw value to display format, opposite to _formatRawValue
     *
     * @param {*} value
     * @return {*}
     * @protected
     */
    _formatDisplayValue: function(value) {
        return value;
    },

    /**
     * Checks if new value differs from current value
     *
     * @param {*} newValue
     * @return {Boolean}
     * @protected
     */
    _isNewValueUpdated: function(newValue) {
        return !Oro.isEqualsLoosely(this.value, newValue)
    },

    /**
     * Triggers when filter value is updated
     *
     * @param {*} newValue
     * @param {*} oldValue
     * @protected
     */
    _onValueUpdated: function(newValue, oldValue) {
        this._triggerUpdate(newValue, oldValue);
    },

    /**
     * Triggers update event
     *
     * @param {*} newValue
     * @param {*} oldValue
     * @protected
     */
    _triggerUpdate: function(newValue, oldValue) {
        this.trigger('update');
    },

    /**
     * Compares current value with empty value
     *
     * @return {Boolean}
     */
    isEmpty: function() {
        return Oro.isEqualsLoosely(this.getValue(), this.emptyValue);
    },

    /**
     * Gets input value. Radio inputs are supported.
     *
     * @param {String|Object} input
     * @return {*}
     * @protected
     */
    _getInputValue: function(input) {
        var result = undefined;
        var $input = this.$(input);
        switch ($input.attr('type')) {
            case 'radio':
                $input.each(function() {
                    if ($(this).is(':checked')) {
                        result = $(this).val();
                    }
                });
                break;
            default:
                result = $input.val();

        }
        return result;
    },

    /**
     * Sets input value. Radio inputs are supported.
     *
     * @param {String|Object} input
     * @param {String} value
     * @protected
     * @return {*}
     */
    _setInputValue: function(input, value) {
        var $input = this.$(input);
        switch ($input.attr('type')) {
            case 'radio':
                $input.each(function() {
                    var $input = $(this);
                    if ($input.attr('value') == value) {
                        $input.attr('checked', true);
                        $input.click();
                    } else {
                        $(this).removeAttr('checked');
                    }
                });
                break;
            default:
                $input.val(value);

        }
        return this;
    },

    /**
     * Updated DOM value with current display value
     *
     * @return {*}
     * @protected
     */
    _updateDOMValue: function() {
        return this._writeDOMValue(this._getDisplayValue());
    },

    /**
     * Get current value formatted to display format
     *
     * @return {*}
     * @protected
     */
    _getDisplayValue: function() {
        return this._formatDisplayValue(this.getValue());
    },

    /**
     * Writes values from object into DOM elements
     *
     * @param {Object} value
     * @abstract
     * @protected
     * @return {*}
     */
    _writeDOMValue: function(value) {
        throw new Error("Method _writeDOMValue is abstract and must be implemented");
        //this._setInputValue(inputValueSelector, value.value);
        //return this
    },

    /**
     * Reads value of DOM elements into object
     *
     * @return {Object}
     * @protected
     */
    _readDOMValue: function() {
        throw new Error("Method _readDOMValue is abstract and must be implemented");
        //return { value: this._getInputValue(this.inputValueSelector) }
    },

    /**
     * Set filter button class
     *
     * @param {Object} element
     * @param {Boolean} status
     * @protected
     */
    _setButtonPressed: function(element, status) {
        if (status) {
            element.parent().addClass(this.buttonActiveClass);
        } else {
            element.parent().removeClass(this.buttonActiveClass);
        }
    }
});
