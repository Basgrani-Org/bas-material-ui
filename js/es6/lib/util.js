const Util = (($) => {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    const VERSION = '0.1.0';

    const PREFIX = 'bas_ui';

    const CLASS_PREFIX = 'bas-ui';

    const API_PREFIX = 'bas';

    let transition = false;

    const MAX_UID = 1000000;

    const TransitionEndEvent = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition   : 'transitionend',
        OTransition     : 'oTransitionEnd otransitionend',
        transition      : 'transitionend'
    };

    // ------------------------------------------------------------------------
    // Vars
    // ------------------------------------------------------------------------


    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    class Util {

        constructor() {

        }

        // Getters
        // ------------------------------------------------------------------------

        static get VERSION() {
            return VERSION;
        }

        static get TRANSITION_END() {
            return 'basTransitionEnd';
        }

        static get PREFIX() {
            return PREFIX;
        }

        static get CLASS_PREFIX() {
            return CLASS_PREFIX;
        }

        static get API_PREFIX() {
            return API_PREFIX;
        }

        static get isTouch() {
            return 'ontouchstart' in window || 'msmaxtouchpoints' in window.navigator;
        }

        static get mutationObserver() {
            return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;
        }

        static get queryString() {
            let query_string = {};
            let query        = window.location.search.substring(1);
            let vars         = query.split("&");
            for (let i = 0; i < vars.length; i++) {
                let pair = vars[i].split("=");
                // If first entry with this name
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = decodeURIComponent(pair[1]);
                    // If second entry with this name
                } else if (typeof query_string[pair[0]] === "string") {
                    query_string[pair[0]] = [query_string[pair[0]], decodeURIComponent(pair[1])];
                    // If third or later entry with this name
                } else {
                    query_string[pair[0]].push(decodeURIComponent(pair[1]));
                }
            }
            return query_string;
        }

        // Public
        // ------------------------------------------------------------------------


        // Static
        // ------------------------------------------------------------------------

        static getUID(prefix) {
            do {
                /* eslint-disable no-bitwise */
                prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
                /* eslint-enable no-bitwise */
            } while (document.getElementById(prefix));
            return prefix;
        }

        static toogleClass(element, class_name) {
            if ($(element).hasClass(class_name)) {
                $(element).removeClass(class_name);
            } else {
                $(element).addClass(class_name);
            }
        }

        static fadeInImage(selector) {
            let element = $(selector);
            element.css({opacity: 0});
            $(element).velocity({opacity: 1}, {
                duration: 650,
                queue   : false,
                easing  : 'easeOutSine'
            });
            $(element).velocity({opacity: 1}, {
                duration: 1300,
                queue   : false,
                easing  : 'swing',
                step    : function (now, fx) {
                    fx.start               = 100;
                    let grayscale_setting  = now / 100;
                    let brightness_setting = 150 - (100 - now) / 1.75;

                    if (brightness_setting < 100) {
                        brightness_setting = 100;
                    }
                    if (now >= 0) {
                        $(this).css({
                            "-webkit-filter": "grayscale(" + grayscale_setting + ")" + "brightness(" + brightness_setting + "%)",
                            "filter"        : "grayscale(" + grayscale_setting + ")" + "brightness(" + brightness_setting + "%)"
                        });
                    }
                }
            });
        }

        static showStaggeredList(selector) {
            let time = 0;
            $(selector).find('li').velocity(
                {translateX: "-100px"},
                {duration: 0});

            $(selector).find('li').each(function () {
                $(this).velocity(
                    {opacity: "1", translateX: "0"},
                    {duration: 800, delay: time, easing: [60, 10]});
                time += 120;
            });
        }

        static getSelectorFromElement(element) {
            let selector = element.getAttribute('data-target');

            if (!selector) {
                selector = element.getAttribute('href') || '';
                selector = /^#[a-z]/i.test(selector) ? selector : null;
            }

            return selector;
        }

        static reflow(element) {
            return element.offsetHeight;
        }

        static triggerTransitionEnd(element) {
            $(element).trigger(transition.end);
        }

        static supportsTransitionEnd() {
            return Boolean(transition);
        }

        static typeCheckConfig(componentName, config, configTypes) {
            for (let property in configTypes) {
                if (configTypes.hasOwnProperty(property)) {
                    let expectedTypes = configTypes[property];
                    let value         = config[property];
                    let valueType;

                    if (value && Util._isElement(value)) {
                        valueType = 'element';
                    } else {
                        valueType = Util._toType(value);
                    }

                    if (!new RegExp(expectedTypes).test(valueType)) {
                        throw new Error(
                            `${componentName.toUpperCase()}: ` +
                            `Option "${property}" provided type "${valueType}" ` +
                            `but expected type "${expectedTypes}".`);
                    }
                }
            }
        }

        static elementOrParentIsFixed(element) {
            let _element       = $(element);
            let _checkElements = _element.add(_element.parents());
            let _isFixed       = false;
            _checkElements.each(function () {
                if ($(this).css("position") === "fixed") {
                    _isFixed = true;
                    return false;
                }
            });
            return isFixed;
        }

        // Static Private
        // ------------------------------------------------------------------------

        // shoutout AngusCroll (https://goo.gl/pxwQGp)
        static _toType(obj) {
            return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        }

        static _isElement(obj) {
            return (obj[0] || obj).nodeType;
        }

        static _getSpecialTransitionEndEvent() {
            return {
                bindType    : transition.end,
                delegateType: transition.end,
                handle(event) {
                    if ($(event.target).is(this)) {
                        return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
                    }
                    return undefined;
                }
            };
        }

        static _transitionEndTest() {
            if (window.QUnit) {
                return false;
            }

            let el = document.createElement('bas-material-ui');

            for (let name in TransitionEndEvent) {
                if (el.style[name] !== undefined) {
                    return {end: TransitionEndEvent[name]};
                }
            }

            return false;
        }

        static _transitionEndEmulator(duration) {
            let called = false;

            $(this).one(Util.TRANSITION_END, () => {
                called = true;
            });

            setTimeout(() => {
                if (!called) {
                    Util.triggerTransitionEnd(this);
                }
            }, duration);

            return this;
        }

        static _setTransitionEndSupport() {
            transition = Util._transitionEndTest();

            $.fn.emulateTransitionEnd = Util._transitionEndEmulator;

            if (Util.supportsTransitionEnd()) {
                $.event.special[Util.TRANSITION_END] = Util._getSpecialTransitionEndEvent();
            }
        }

    }

    Util._setTransitionEndSupport();

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    // Reverse
    $.fn.reverse = [].reverse;

    return Util;

})(jQuery);

BasUI.Util = Util;
export default Util;
