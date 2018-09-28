'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = function ($) {
  // ------------------------------------------------------------------------
  // Constants
  // ------------------------------------------------------------------------

  var VERSION = '0.1.0';

  var PREFIX = 'bas_ui';

  var CLASS_PREFIX = 'bas-ui';

  var API_PREFIX = 'bas';

  var transition = false;

  var MAX_UID = 1000000;

  var TransitionEndEvent = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'oTransitionEnd otransitionend',
    transition: 'transitionend'

    // ------------------------------------------------------------------------
    // Vars
    // ------------------------------------------------------------------------

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

  };
  var Util = function () {
    function Util() {
      _classCallCheck(this, Util);
    }

    _createClass(Util, null, [{
      key: 'getUID',


      // Public
      // ------------------------------------------------------------------------

      // Static
      // ------------------------------------------------------------------------

      value: function getUID(prefix) {
        do {
          /* eslint-disable no-bitwise */
          prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
          /* eslint-enable no-bitwise */
        } while (document.getElementById(prefix));
        return prefix;
      }
    }, {
      key: 'toogleClass',
      value: function toogleClass(element, class_name) {
        if ($(element).hasClass(class_name)) {
          $(element).removeClass(class_name);
        } else {
          $(element).addClass(class_name);
        }
      }
    }, {
      key: 'fadeInImage',
      value: function fadeInImage(selector) {
        var element = $(selector);
        element.css({ opacity: 0 });
        $(element).velocity({ opacity: 1 }, {
          duration: 650,
          queue: false,
          easing: 'easeOutSine'
        });
        $(element).velocity({ opacity: 1 }, {
          duration: 1300,
          queue: false,
          easing: 'swing',
          step: function step(now, fx) {
            fx.start = 100;
            var grayscale_setting = now / 100;
            var brightness_setting = 150 - (100 - now) / 1.75;

            if (brightness_setting < 100) {
              brightness_setting = 100;
            }
            if (now >= 0) {
              $(this).css({
                '-webkit-filter': 'grayscale(' + grayscale_setting + ')' + 'brightness(' + brightness_setting + '%)',
                'filter': 'grayscale(' + grayscale_setting + ')' + 'brightness(' + brightness_setting + '%)'
              });
            }
          }
        });
      }
    }, {
      key: 'showStaggeredList',
      value: function showStaggeredList(selector) {
        var time = 0;
        $(selector).find('li').velocity({ translateX: '-100px' }, { duration: 0 });

        $(selector).find('li').each(function () {
          $(this).velocity({ opacity: '1', translateX: '0' }, { duration: 800, delay: time, easing: [60, 10] });
          time += 120;
        });
      }
    }, {
      key: 'getSelectorFromElement',
      value: function getSelectorFromElement(element) {
        var selector = element.getAttribute('data-target');

        if (!selector) {
          selector = element.getAttribute('href') || '';
          selector = /^#[a-z]/i.test(selector) ? selector : null;
        }

        return selector;
      }
    }, {
      key: 'reflow',
      value: function reflow(element) {
        return element.offsetHeight;
      }
    }, {
      key: 'triggerTransitionEnd',
      value: function triggerTransitionEnd(element) {
        $(element).trigger(transition.end);
      }
    }, {
      key: 'supportsTransitionEnd',
      value: function supportsTransitionEnd() {
        return Boolean(transition);
      }
    }, {
      key: 'typeCheckConfig',
      value: function typeCheckConfig(componentName, config, configTypes) {
        for (var property in configTypes) {
          if (configTypes.hasOwnProperty(property)) {
            var expectedTypes = configTypes[property];
            var value = config[property];
            var valueType = void 0;

            if (value && Util._isElement(value)) {
              valueType = 'element';
            } else {
              valueType = Util._toType(value);
            }

            if (!new RegExp(expectedTypes).test(valueType)) {
              throw new Error(componentName.toUpperCase() + ': ' + ('Option "' + property + '" provided type "' + valueType + '" ') + ('but expected type "' + expectedTypes + '".'));
            }
          }
        }
      }
    }, {
      key: 'elementOrParentIsFixed',
      value: function elementOrParentIsFixed(element) {
        var _element = $(element);
        var _checkElements = _element.add(_element.parents());
        // eslint-disable-next-line no-unused-vars
        var _isFixed = false;
        _checkElements.each(function () {
          if ($(this).css('position') === 'fixed') {
            _isFixed = true;
            return false;
          }
        });
        // eslint-disable-next-line no-undef
        return isFixed;
      }

      // Static Private
      // ------------------------------------------------------------------------

      // shoutout AngusCroll (https://goo.gl/pxwQGp)

    }, {
      key: '_toType',
      value: function _toType(obj) {
        return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
      }
    }, {
      key: '_isElement',
      value: function _isElement(obj) {
        return (obj[0] || obj).nodeType;
      }
    }, {
      key: '_getSpecialTransitionEndEvent',
      value: function _getSpecialTransitionEndEvent() {
        return {
          bindType: transition.end,
          delegateType: transition.end,
          handle: function handle(event) {
            if ($(event.target).is(this)) {
              return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
            }
            return undefined;
          }
        };
      }
    }, {
      key: '_transitionEndTest',
      value: function _transitionEndTest() {
        if (window.QUnit) {
          return false;
        }

        var el = document.createElement('bas-material-ui');

        for (var name in TransitionEndEvent) {
          if (el.style[name] !== undefined) {
            return { end: TransitionEndEvent[name] };
          }
        }

        return false;
      }
    }, {
      key: '_transitionEndEmulator',
      value: function _transitionEndEmulator(duration) {
        var _this = this;

        var called = false;

        $(this).one(Util.TRANSITION_END, function () {
          called = true;
        });

        setTimeout(function () {
          if (!called) {
            Util.triggerTransitionEnd(_this);
          }
        }, duration);

        return this;
      }
    }, {
      key: '_setTransitionEndSupport',
      value: function _setTransitionEndSupport() {
        transition = Util._transitionEndTest();

        $.fn.emulateTransitionEnd = Util._transitionEndEmulator;

        if (Util.supportsTransitionEnd()) {
          $.event.special[Util.TRANSITION_END] = Util._getSpecialTransitionEndEvent();
        }
      }
    }, {
      key: 'VERSION',

      /* constructor () {
       } */

      // Getters
      // ------------------------------------------------------------------------

      get: function get() {
        return VERSION;
      }
    }, {
      key: 'TRANSITION_END',
      get: function get() {
        return 'basTransitionEnd';
      }
    }, {
      key: 'PREFIX',
      get: function get() {
        return PREFIX;
      }
    }, {
      key: 'CLASS_PREFIX',
      get: function get() {
        return CLASS_PREFIX;
      }
    }, {
      key: 'API_PREFIX',
      get: function get() {
        return API_PREFIX;
      }
    }, {
      key: 'isTouch',
      get: function get() {
        return 'ontouchstart' in window || 'msmaxtouchpoints' in window.navigator;
      }
    }, {
      key: 'mutationObserver',
      get: function get() {
        return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;
      }
    }, {
      key: 'queryString',
      get: function get() {
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');
          // If first entry with this name
          if (typeof query_string[pair[0]] === 'undefined') {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
          } else if (typeof query_string[pair[0]] === 'string') {
            query_string[pair[0]] = [query_string[pair[0]], decodeURIComponent(pair[1])];
            // If third or later entry with this name
          } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
          }
        }
        return query_string;
      }
    }]);

    return Util;
  }();

  Util._setTransitionEndSupport();

  // ------------------------------------------------------------------------
  // jQuery
  // ------------------------------------------------------------------------

  // Reverse
  $.fn.reverse = [].reverse;

  return Util;
}(jQuery);

BasUI.Util = Util;
exports.default = Util;
