'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../lib/util');

var _util2 = _interopRequireDefault(_util);

var _forms = require('./forms');

var _forms2 = _interopRequireDefault(_forms);

var _dropdown = require('./dropdown');

var _dropdown2 = _interopRequireDefault(_dropdown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Select = function ($) {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    var VERSION = _util2.default.VERSION;
    var NAME = _util2.default.PREFIX + '_select';
    var NAME_CLASS = _util2.default.CLASS_PREFIX + '-select';
    var DATA_KEY = _util2.default.API_PREFIX + '.select';
    var EVENT_KEY = '.' + DATA_KEY;
    var DATA_API_KEY = '.data-api';

    var Default = {};

    var DefaultType = {};

    var ClassName = {
        SELECT: 'bas-ui-select'
    };

    var Selector = {
        SELECT: '.' + ClassName.SELECT
    };

    var Event = {
        TOUCH_START_DATA_API: 'touchstart' + EVENT_KEY + DATA_API_KEY,
        MOUSE_ENTER_DATA_API: 'mouseenter' + EVENT_KEY + DATA_API_KEY,
        MOUSE_LEAVE_DATA_API: 'mouseleave' + EVENT_KEY + DATA_API_KEY,
        CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
    };

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    var Select = function () {
        function Select(element, config) {
            _classCallCheck(this, Select);

            var _self = this;

            _self._select = $(element);
            _self._select_id = $(element).attr('id') || '';
            _self._input_id = _self._select_id + '-fake';
            _self._valuesSelected = [];
            _self._is_multiple = !!_self._select.attr('multiple');
            _self._unique_ID = _util2.default.getUID(_self._select_id);
            _self._label = '';
            _self._is_dropdown_click = false;

            // Set ID
            _self._select.attr('data-select-id', _self._unique_ID);
            var select_options = _self._select.children('option');

            // Set class handler for parsley
            if (_forms2.default.validateLib === 'parsley') {
                _self._select.attr('data-parsley-class-handler', '#' + _self._select_id + '-fake');
            }

            // Get msg text's
            var label_text_error = _self._select.parent().find('label').attr('data-error') || '';
            var label_text_success = _self._select.parent().find('label').attr('data-success') || '';

            // Get label
            if (_self._select.find('option:selected').length > 0) {
                _self._label = _self._select.find('option:selected');
                if (_self._is_multiple && !_self._label.is(':disabled')) {
                    _self._label.each(function (i) {
                        _self._label = Select._buildValuesSelectedFromMultiple(_self._valuesSelected, $(this).index(), _self._select);
                    });
                } else {
                    _self._label = _self._label.html();
                }
            } else {
                _self._label = select_options.first().html();
            }

            // Wrapper
            var wrapper = $('<div class="' + ClassName.SELECT + '-wrapper"></div>');
            _self._select.wrap(wrapper);

            // Add extra elements
            var dropdown_icon = $('<span class="bas-ui-caret"></span>');
            if (_self._select.is(':disabled')) {
                dropdown_icon.addClass('disabled');
            }
            var sanitizedLabelHtml = _self._label && _self._label.replace(/"/g, '&quot;');
            var select_fake = $('' + '<input id="' + _self._input_id + '" data-target="dropdown-' + _self._unique_ID + '" type="text" class="' + _forms2.default.ClassName.INPUT + ' ' + ClassName.SELECT + '-fake ' + ClassName.SELECT + '-input-' + _self._unique_ID + '" readonly ' + (_self._select.is(':disabled') ? 'disabled' : '') + ' value="' + sanitizedLabelHtml + '"/>' + '<span class="' + ClassName.SELECT + '-fake-msg-error">' + label_text_error + '</span>' + '<span class="' + ClassName.SELECT + '-fake-msg-success">' + label_text_success + '</span>');

            // Add select fake
            _self._select.before(select_fake);

            // Dropdown
            var select_dropdown = $('<ul tabindex="0" id="dropdown-' + _self._unique_ID + '" class="' + _dropdown2.default.ClassName.DROPDOWN + '"></ul>');

            // Create dropdown structure
            if (select_options.length) {
                select_options.each(function () {
                    // Render option
                    _self._appendOption(select_dropdown, $(this));
                });
            }

            // Add dropdown
            _self._select.before(select_dropdown);
            _self._select.before(dropdown_icon);

            // Init dropdown
            $(Selector.SELECT + '-input-' + _self._unique_ID).bas_ui_dropdown({
                inDuration: 300,
                outDuration: 225,
                hover: false,
                gutter: -62,
                belowOrigin: false
            });

            // Add select dropdown events
            select_dropdown.find('li').each(function (i) {
                var curr_select = _self._select;
                $(this).click(function (e) {
                    var element = $(e.target);

                    if (_self._is_multiple) {
                        element.toggleClass('active');
                        Select._buildValuesSelectedFromMultiple(_self._valuesSelected, $(this).index(), curr_select);
                        curr_select.find('option:disabled').eq(0).prop('selected', false);
                        select_dropdown.find('li a').eq(0).removeClass('active');
                    } else {
                        select_dropdown.find('li a').removeClass('active');
                        element.toggleClass('active');
                        curr_select.siblings('input.' + ClassName.SELECT + '-fake').val(element.find('span').text());
                    }

                    curr_select.find('option').eq(i).prop('selected', element.hasClass('active'));
                    _self._is_dropdown_click = true;
                    curr_select.trigger('change');
                });
            });

            // Select change event
            _self._select.change(function (e) {
                var i = $(this).prop('selectedIndex');
                var element = select_dropdown.find('li a').eq(i);
                var curr_select = _self._select;

                if (_self._is_dropdown_click) {
                    _self._is_dropdown_click = false;
                    return;
                }

                if (_self._is_multiple) {
                    _self._valuesSelected = [];
                    select_dropdown.find('li a').removeClass('active');
                    $(this).children('option:selected').each(function () {
                        var i = $(this).index();
                        var element = select_dropdown.find('li a').eq(i);
                        element.toggleClass('active');
                        Select._buildValuesSelectedFromMultiple(_self._valuesSelected, i, curr_select);
                    });
                    if ($(this).children('option:selected').length === 0) {
                        Select._buildValuesSelectedFromMultiple(_self._valuesSelected, 0, curr_select);
                    }
                    select_dropdown.find('li a').eq(0).removeClass('active');
                } else {
                    select_dropdown.find('li a').removeClass('active');
                    element.toggleClass('active');
                    curr_select.siblings('input.' + ClassName.SELECT + '-fake').val(element.find('span').text());
                }
            });

            // Set initialized
            _self._select.addClass('initialized');
        }

        // Getters
        // ------------------------------------------------------------------------

        _createClass(Select, [{
            key: 'rebuild',


            // Public
            // ------------------------------------------------------------------------

            value: function rebuild() {
                this._select.parent().find('span.bas-ui-caret').remove();
                this._select.parent().find('input').remove();
                this._select.unwrap();
                $('ul#dropdown-' + this._unique_ID).remove();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this._select.attr('data-select-id', null).removeClass('initialized');
                this._select.attr('data-parsley-class-handler', null);
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                this.destroy();
                $.removeData(this._trigger, DATA_KEY);
                this._select = null;
                this._select_id = null;
                this._input_id = null;
                this._valuesSelected = null;
                this._is_multiple = null;
                this._unique_ID = null;
                this._label = null;
            }

            // Private
            // ------------------------------------------------------------------------

        }, {
            key: '_appendOption',
            value: function _appendOption(select_dropdown, option) {
                var _self = this;

                var disabled_class = option.is(':disabled') ? 'disabled ' : '';
                var slected_class = option.is(':selected') ? 'active' : '';

                select_dropdown.append($('' + '<li class="' + disabled_class + '">' + '<a ' + (_self._is_multiple ? 'data-target="fake"' : '') + ' class="truncate ' + slected_class + '">' + '<i class="mdi mdi-check icon ' + ClassName.SELECT + '-icon"></i> <span>' + option.html() + '</span>' + '</a></li>'));
            }

            // Static
            // ------------------------------------------------------------------------

        }], [{
            key: '_buildValuesSelectedFromMultiple',
            value: function _buildValuesSelectedFromMultiple(entriesArray, entryIndex, select) {
                var index = entriesArray.indexOf(entryIndex);

                if (index === -1) {
                    entriesArray.push(entryIndex);
                } else {
                    entriesArray.splice(index, 1);
                }

                return Select._setInputFromMultiple(entriesArray, select);
            }
        }, {
            key: '_setInputFromMultiple',
            value: function _setInputFromMultiple(entriesArray, select) {
                var value = '';

                for (var i = 0, count = entriesArray.length; i < count; i++) {
                    var text = select.find('option').eq(entriesArray[i]).text();

                    if (i === 0) {
                        value += text;
                    } else {
                        value += ', ' + text;
                    }
                }

                if (value === '') {
                    value = select.find('option:disabled').eq(0).text();
                }

                select.siblings('input' + Selector.SELECT + '-fake').val(value);

                return value;
            }
        }, {
            key: '_jQueryInterface',
            value: function _jQueryInterface(config) {
                return this.each(function () {
                    var $this = $(this);
                    var data = $this.data(DATA_KEY);
                    var _config = $.extend({}, Default, $this.data(), (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config);

                    if (!data) {
                        data = new Select(this, _config);
                        $this.data(DATA_KEY, data);
                    }

                    if (typeof config === 'string') {
                        if (data[config] === undefined) {
                            throw new Error('No method named "' + config + '"');
                        }
                        data[config]();
                    }
                });
            }
        }, {
            key: 'VERSION',
            get: function get() {
                return VERSION;
            }
        }]);

        return Select;
    }();

    // ------------------------------------------------------------------------
    // Data Api implementation
    // ------------------------------------------------------------------------

    // READY & OBSERVE


    if (_util2.default.mutationObserver === null) {
        $(document).ready(function () {
            $(Selector.SELECT).bas_ui_select();
        });
    } else {
        // .bas_ui_observe(selector, onAdded, onRemoved)
        $(document).bas_ui_observe(Selector.SELECT, function () {
            var _this = $(this);
            Select._jQueryInterface.call(_this);
        });
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME] = Select._jQueryInterface;
    $.fn[NAME].Constructor = Select;

    return Select;
}(jQuery);

BasUI.Select = Select;
exports.default = Select;
