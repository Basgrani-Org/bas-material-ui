'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../lib/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tabs = function ($) {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    var VERSION = _util2.default.VERSION;
    var NAME = _util2.default.PREFIX + '_tabs';
    var NAME_CLASS = _util2.default.CLASS_PREFIX + '-tabs';
    var DATA_KEY = _util2.default.API_PREFIX + '.tabs';
    var EVENT_KEY = '.' + DATA_KEY;
    var DATA_API_KEY = '.data-api';

    var Default = {};

    var DefaultType = {};

    var ClassName = {
        TABS: 'bas-ui-tabs',
        TAB: 'bas-ui-tab',
        TAB_INDICATOR: 'bas-ui-indicator'
    };

    var Selector = {
        TABS: '.' + ClassName.TABS,
        TAB: '.' + ClassName.TAB,
        TAB_INDICATOR: '.' + ClassName.TAB_INDICATOR
    };

    var Event = {
        SHOW: 'show' + EVENT_KEY,
        SHOWN: 'shown' + EVENT_KEY,
        HIDE: 'hide' + EVENT_KEY,
        HIDDEN: 'hidden' + EVENT_KEY,
        CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
    };

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    var Tabs = function () {
        function Tabs(element, config) {
            _classCallCheck(this, Tabs);

            var _self = this;

            _self._element = element;
            _self._config = config;

            _self._tabs = $(element);
            _self._parent = null;
            _self._active = null;
            _self._indicator = null;
            _self._content = null;
            _self._links = _self._tabs.find('li' + Selector.TAB + ' a');
            _self._index = 0;
            _self._prev_index = 0;

            _self._tabs_width = 0;
            _self._tab_width = 0;
            _self._tab_position = 0;
            _self._tab_left = 0;
            _self._tab_right = 0;

            // If the location.hash matches one of the links, use that as the active tab.
            _self._active = $(_self._links.filter('[href="' + location.hash + '"]'));

            // If no match is found, use the first link or any with class 'active' as the initial active tab.
            if (_self._active.length === 0) {
                _self._active = _self._tabs.find('li' + Selector.TAB + ' a.active').first();
            }
            if (_self._active.length === 0) {
                _self._active = _self._tabs.find('li' + Selector.TAB + ' a').first();
            }

            // Set parent
            _self._parent = _self._active.parent();

            // Set sizes
            _self._resize();

            _self._active.addClass('active');
            _self._index = _self._links.index(_self._active);
            if (_self._index < 0) {
                _self._index = 0;
            }

            _self._content = $(_self._active[0].hash);

            // append indicator then set indicator width to tab width
            _self._tabs.append('<div class="' + ClassName.TAB_INDICATOR + '"></div>');
            _self._indicator = _self._tabs.find(Selector.TAB_INDICATOR);
            if (_self._tabs.is(":visible")) {
                _self._indicator.css({ "right": _self._tab_right });
                _self._indicator.css({ "left": _self._tab_left });
            }

            // Resize
            $(window).resize(function () {
                // Update sizes
                _self._resize();

                if (_self._index < 0) {
                    _self._index = 0;
                }
                if (_self._tabs_width !== 0 && _self._tabs_width !== 0) {
                    _self._indicator.css({ "right": _self._tab_right });
                    _self._indicator.css({ "left": _self._tab_left });
                }
            });

            // Hide the remaining content
            _self._links.not(_self._active).each(function () {
                $(this.hash).trigger(Event.HIDE);
                $(this.hash).hide(0, function () {
                    $(this).trigger(Event.HIDDEN);
                });
            });

            // Bind the click event handler
            _self._tabs.on('click', 'a', function (e) {
                _self._parent = $(this).parent();

                if (_self._parent.hasClass('disabled')) {
                    e.preventDefault();
                    return;
                }

                // Update sizes
                _self._resize();

                // Make the old tab inactive.
                _self._active.removeClass('active');
                _self._content.trigger(Event.HIDE);
                _self._content.hide(0, function () {
                    $(this).trigger(Event.HIDDEN);
                });

                // Update the variables with the new link and content
                _self._active = $(this);
                _self._content = $(this.hash);
                _self._links = _self._tabs.find('li' + Selector.TAB + ' a');

                // Make the tab active.
                _self._active.addClass('active');
                _self._prev_index = _self._index;
                _self._index = _self._links.index($(this));
                if (_self._index < 0) {
                    _self._index = 0;
                }

                // Show and event
                _self._content.trigger(Event.SHOW);
                _self._content.show(0, function () {
                    $(this).trigger(Event.SHOWN);
                });

                // Update indicator
                if (_self._index - _self._prev_index >= 0) {
                    _self._indicator.velocity({ "right": _self._tab_right }, { duration: 300, queue: false, easing: 'easeOutQuad' });
                    _self._indicator.velocity({ "left": _self._tab_left }, { duration: 300, queue: false, easing: 'easeOutQuad', delay: 90 });
                } else {
                    _self._indicator.velocity({ "left": _self._tab_left }, { duration: 300, queue: false, easing: 'easeOutQuad' });
                    _self._indicator.velocity({ "right": _self._tab_right }, { duration: 300, queue: false, easing: 'easeOutQuad', delay: 90 });
                }

                // Prevent the anchor's default click action
                if (_self._content.length > 0) {
                    e.preventDefault();
                }
            });
        }

        // Getters
        // ------------------------------------------------------------------------

        _createClass(Tabs, [{
            key: 'select_tab',


            // Public
            // ------------------------------------------------------------------------

            value: function select_tab(opt) {
                var _self = this;
                _self._tabs.find('a[href="#' + opt + '"]').trigger('click');
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                var _self = this;
                $.removeData(_self._trigger, DATA_KEY);

                _self._element = null;
                _self._config = null;

                _self._tabs = null;
                _self._parent = null;
                _self._active = null;
                _self._indicator = null;
                _self._content = null;
                _self._links = null;
                _self._index = 0;
                _self._prev_index = 0;

                _self._tabs_width = 0;
                _self._tab_width = 0;
                _self._tab_position = 0;
                _self._tab_left = 0;
                _self._tab_right = 0;
            }

            // Private
            // ------------------------------------------------------------------------

        }, {
            key: '_resize',
            value: function _resize() {
                var _self = this;

                _self._tabs_width = _self._tabs.width();
                _self._tab_width = _self._parent.innerWidth();
                _self._tab_position = _self._parent.position();
                _self._tab_left = _self._tab_position.left;
                _self._tab_right = _self._tabs_width - (_self._tab_left + _self._tab_width);
            }

            // Static
            // ------------------------------------------------------------------------

        }], [{
            key: '_jQueryInterface',
            value: function _jQueryInterface(config, opt) {
                return this.each(function () {
                    var $this = $(this);
                    var data = $this.data(DATA_KEY);
                    var _config = $.extend({}, Default, $this.data(), (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config);

                    if (!data) {
                        data = new Tabs(this, _config);
                        $this.data(DATA_KEY, data);
                    }

                    if (typeof config === 'string') {
                        if (data[config] === undefined) {
                            throw new Error('No method named "' + config + '"');
                        }
                        data[config](opt);
                    }
                });
            }
        }, {
            key: 'VERSION',
            get: function get() {
                return VERSION;
            }
        }]);

        return Tabs;
    }();

    // ------------------------------------------------------------------------
    // Data Api implementation
    // ------------------------------------------------------------------------

    // READY & OBSERVE


    if (_util2.default.mutationObserver === null) {
        $(document).ready(function () {
            $(Selector.TABS).bas_ui_tabs();
        });
    } else {
        // .bas_ui_observe(selector, onAdded, onRemoved)
        $(document).bas_ui_observe(Selector.TABS, function () {
            var _this = $(this);
            Tabs._jQueryInterface.call(_this);
        });
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME] = Tabs._jQueryInterface;
    $.fn[NAME].Constructor = Tabs;

    return Tabs;
}(jQuery);

BasUI.Tabs = Tabs;
exports.default = Tabs;
