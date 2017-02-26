'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../lib/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Button = function ($) {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    var VERSION = _util2.default.VERSION;
    var NAME = _util2.default.PREFIX + '_button';
    var NAME_CLASS = _util2.default.CLASS_PREFIX + '-button';
    var DATA_KEY = _util2.default.API_PREFIX + '.button';
    var EVENT_KEY = '.' + DATA_KEY;
    var DATA_API_KEY = '.data-api';

    var ClassName = {
        TOGGLE_FAB_ACTIVE: 'active',
        TOGGLE_FAB: 'bas-ui-button-fab-action',
        BUTTON: 'bas-ui-button'
    };

    var Selector = {
        TOGGLE_FAB_ACTIVE: '.' + ClassName.TOGGLE_FAB_ACTIVE,
        TOGGLE_FAB: '.' + ClassName.TOGGLE_FAB,
        BUTTON: '.' + ClassName.BUTTON
    };

    var Event = {
        MOUSE_ENTER_LEAVE_DATA_API: 'mouseenter' + EVENT_KEY + DATA_API_KEY + ', mouseleave' + EVENT_KEY + DATA_API_KEY,
        TOUCH_START_DATA_API: 'touchstart' + EVENT_KEY + DATA_API_KEY,
        CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
    };

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    var Button = function () {
        function Button(element) {
            _classCallCheck(this, Button);

            this._element = element;
        }

        // Getters
        // ------------------------------------------------------------------------

        _createClass(Button, [{
            key: 'toggleFAB',


            // Public
            // ------------------------------------------------------------------------

            value: function toggleFAB() {
                this._toggleFAB();
            }
        }, {
            key: 'openFAB',
            value: function openFAB() {
                this._toggleFAB(false);
            }
        }, {
            key: 'closeFAB',
            value: function closeFAB() {
                this._toggleFAB(true);
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                $.removeData(this._element, DATA_KEY);
                this._element = null;
            }

            // Private
            // ------------------------------------------------------------------------

        }, {
            key: '_toggleFAB',
            value: function _toggleFAB() {
                var isClose = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'none';

                var rootElement = $($(this._element).closest(Selector.TOGGLE_FAB)[0]);
                var total = rootElement.find('ul li').length;
                var onAnimationEnd = null;
                var animationDuration = 150;
                var animationDelay = 75;
                var time = 0;

                // End animation event
                function animationEnd() {
                    if (!rootElement.hasClass(ClassName.TOGGLE_FAB + ' ' + ClassName.TOGGLE_FAB_ACTIVE)) {
                        $(Selector.TOGGLE_FAB + ' ul').css('height', '0');
                    }
                }

                // Add animation class
                if (!rootElement.hasClass(ClassName.TOGGLE_FAB + ' ' + ClassName.TOGGLE_FAB_ACTIVE) && (isClose === false || isClose === 'none')) {
                    // SHOW
                    $(Selector.TOGGLE_FAB + ' ul').css('height', 'auto');
                    rootElement.addClass(ClassName.TOGGLE_FAB_ACTIVE);

                    // Set start position
                    rootElement.find('ul li').velocity({ opacity: "0", scaleY: ".4", scaleX: ".4", translateY: "40px" }, { duration: 0 });

                    // Set animations show
                    rootElement.find('ul li').reverse().each(function (index) {
                        $(this).velocity({ opacity: "1", scaleX: "1", scaleY: "1", translateY: "0" }, { duration: animationDuration, delay: time });
                        time += animationDelay;
                    });
                } else if (isClose === true || isClose === 'none') {
                    // HIDE
                    rootElement.removeClass(ClassName.TOGGLE_FAB_ACTIVE);

                    // Stop all animations
                    rootElement.find('ul li').velocity("stop", true);

                    // Set hide animations
                    rootElement.find('ul li').each(function (index) {

                        // Set event complete only the last item
                        if (index === total - 1) {
                            onAnimationEnd = animationEnd;
                        } else {
                            onAnimationEnd = null;
                        }

                        $(this).velocity({ opacity: "0", scaleX: ".4", scaleY: ".4", translateY: "40px" }, { duration: animationDuration, delay: time, complete: onAnimationEnd });
                        time += animationDelay;
                    });
                }
            }

            // Static
            // ------------------------------------------------------------------------

        }], [{
            key: '_jQueryInterface',
            value: function _jQueryInterface(config) {
                return this.each(function () {
                    var data = $(this).data(DATA_KEY);

                    if (!data) {
                        data = new Button(this);
                        $(this).data(DATA_KEY, data);
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

        return Button;
    }();

    // ------------------------------------------------------------------------
    // Data Api implementation
    // ------------------------------------------------------------------------

    // Is Touch


    if (_util2.default.isTouch) {
        $(document).on(Event.CLICK_DATA_API, Selector.TOGGLE_FAB + ' > a', function (event) {
            event.preventDefault();
            var button = event.target;
            Button._jQueryInterface.call($(button), 'toggleFAB');
        });

        $(document).on(Event.TOUCH_START_DATA_API, 'html', function (event) {
            var element = $(event.target);

            if (!element.hasClass(ClassName.TOGGLE_FAB) && element.parents(Selector.TOGGLE_FAB).length !== 1) {
                $(document).find(Selector.TOGGLE_FAB).each(function (i) {
                    Button._jQueryInterface.call($(this), 'closeFAB');
                });
            }
        });
    } else {
        $(document).on(Event.MOUSE_ENTER_LEAVE_DATA_API, Selector.TOGGLE_FAB, function (event) {
            event.preventDefault();
            var button = event.target;
            Button._jQueryInterface.call($(button), 'toggleFAB');
        });
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME] = Button._jQueryInterface;
    $.fn[NAME].Constructor = Button;

    return Button;
}(jQuery);

BasUI.Button = Button;
exports.default = Button;
