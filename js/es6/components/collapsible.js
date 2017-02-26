import Util from '../lib/util';

const Collapsible = (($) => {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    const VERSION             = Util.VERSION;
    const NAME                = `${Util.PREFIX}_collapsible`;
    const NAME_CLASS          = `${Util.CLASS_PREFIX}-collapsible`;
    const DATA_KEY            = `${Util.API_PREFIX}.collapsible`;
    const EVENT_KEY           = `.${DATA_KEY}`;
    const DATA_API_KEY        = '.data-api';
    const TRANSITION_DURATION = 600;

    const Default = {
        toggle: true
    };

    const DefaultType = {
        toggle: 'boolean'
    };

    const Event = {
        SHOW          : `show${EVENT_KEY}`,
        SHOWN         : `shown${EVENT_KEY}`,
        HIDE          : `hide${EVENT_KEY}`,
        HIDDEN        : `hidden${EVENT_KEY}`,
        CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`
    };

    const ClassName = {
        ACTIVE    : 'active',
        POPOUT    : 'popout',
        EXPANDABLE: 'expandable',
        IN        : 'in',
        COLLAPSE  : 'collapse',
        COLLAPSING: 'collapsing',
        COLLAPSED : 'collapsed'
    };

    const Dimension = {
        WIDTH : 'width',
        HEIGHT: 'height'
    };

    const Selector = {
        HEADER     : `.${Util.CLASS_PREFIX}-collapsible-header`,
        BODY       : `.${Util.CLASS_PREFIX}-collapsible-body`,
        ACTIVES    : `li > .in, li > .collapsing`,
        DATA_TOGGLE: `[data-collapsible="accordion"] .${Util.CLASS_PREFIX}-collapsible-header, [data-collapsible="expandable"] .${Util.CLASS_PREFIX}-collapsible-header`

    };

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    class Collapsible {

        constructor(element, config) {
            this._isTransitioning = false;
            this._element         = element;
            this._root            = $(this._element).closest(`.${NAME_CLASS}`);
            this._rootLI          = $(this._element).closest('li');
            this._config          = Collapsible._getConfig(config);
            this._parent          = Collapsible._getHeaderFromElement($(this._element));
            this._isPopout        = false;
            this._isExpandable    = false;

            if (this._root && this._root.hasClass(ClassName.POPOUT)) {
                this._isPopout = true;
            }

            if (this._root && this._root.data('collapsible') === ClassName.EXPANDABLE) {
                this._isExpandable = true;
            }

            if (this._parent) {
                Collapsible._addAriaAndCollapsedClass(this._element, this._parent);
            }

            if (this._config.toggle) {
                this.toggle();
            }
        }

        // Getters
        // ------------------------------------------------------------------------

        static get VERSION() {
            return VERSION;
        }

        // Public
        // ------------------------------------------------------------------------

        toggle() {
            if ($(this._element).hasClass(ClassName.IN)) {
                this.hide();
            } else {
                this.show();
            }
        }

        show() {
            if (this._isTransitioning ||
                $(this._element).hasClass(ClassName.IN)) {
                return;
            }

            let actives;
            let activesData;

            actives = $.makeArray(this._root.find(Selector.ACTIVES));
            if (!actives.length) {
                actives = null;
            }

            if (actives) {
                activesData = $(actives).data(DATA_KEY);
                if (activesData && activesData._isTransitioning) {
                    return;
                }
            }

            let startEvent = $.Event(Event.SHOW);
            $(this._element).trigger(startEvent);
            if (startEvent.isDefaultPrevented()) {
                return;
            }

            if (actives && !this._isExpandable) {
                Collapsible._jQueryInterface.call($(actives), 'hide');
                if (!activesData) {
                    $(actives).data(DATA_KEY, null);
                }
            }

            let dimension = this._getDimension();

            $(this._element)
                .removeClass(ClassName.COLLAPSE)
                .addClass(ClassName.COLLAPSING);

            this._element.style[dimension] = 0;
            this._element.setAttribute('aria-expanded', true);

            if (this._parent) {
                $(this._parent)
                    .removeClass(ClassName.COLLAPSED)
                    .addClass(ClassName.ACTIVE)
                    .attr('aria-expanded', true);
                if (this._isPopout) {
                    this._rootLI.addClass(ClassName.ACTIVE);
                }
            }

            this.setTransitioning(true);

            let complete = () => {
                $(this._element)
                    .removeClass(ClassName.COLLAPSING)
                    .addClass(ClassName.COLLAPSE)
                    .addClass(ClassName.IN);

                this._element.style[dimension] = '';

                this.setTransitioning(false);

                $(this._element).trigger(Event.SHOWN);
            };

            if (!Util.supportsTransitionEnd()) {
                complete();
                return;
            }

            let capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
            let scrollSize           = `scroll${capitalizedDimension}`;

            $(this._element)
                .one(Util.TRANSITION_END, complete)
                .emulateTransitionEnd(TRANSITION_DURATION);

            this._element.style[dimension] = `${this._element[scrollSize]}px`;
        }

        hide() {
            if (this._isTransitioning || !$(this._element).hasClass(ClassName.IN)) {
                return;
            }

            let startEvent = $.Event(Event.HIDE);
            $(this._element).trigger(startEvent);
            if (startEvent.isDefaultPrevented()) {
                return;
            }

            let dimension       = this._getDimension();
            let offsetDimension = dimension === Dimension.WIDTH ?
                'offsetWidth' : 'offsetHeight';

            this._element.style[dimension] = `${this._element[offsetDimension]}px`;

            Util.reflow(this._element);

            $(this._element)
                .addClass(ClassName.COLLAPSING)
                .removeClass(ClassName.COLLAPSE)
                .removeClass(ClassName.IN);

            this._element.setAttribute('aria-expanded', false);

            if (this._parent) {
                $(this._parent)
                    .addClass(ClassName.COLLAPSED)
                    .removeClass(ClassName.ACTIVE)
                    .attr('aria-expanded', false);
                if (this._isPopout) {
                    this._rootLI.removeClass(ClassName.ACTIVE);
                }
            }

            this.setTransitioning(true);

            let complete = () => {
                this.setTransitioning(false);
                $(this._element)
                    .removeClass(ClassName.COLLAPSING)
                    .addClass(ClassName.COLLAPSE)
                    .trigger(Event.HIDDEN);
            };

            this._element.style[dimension] = 0;

            if (!Util.supportsTransitionEnd()) {
                complete();
                return;
            }

            $(this._element)
                .one(Util.TRANSITION_END, complete)
                .emulateTransitionEnd(TRANSITION_DURATION);
        }

        setTransitioning(isTransitioning) {
            this._isTransitioning = isTransitioning;
        }

        dispose() {
            $.removeData(this._element, DATA_KEY);

            this._config          = null;
            this._parent          = null;
            this._element         = null;
            this._isTransitioning = null;
            this._root            = null;
            this._rootLI          = null;
            this._isPopout        = null;
            this._isExpandable    = null;
        }

        // Private
        // ------------------------------------------------------------------------

        _getDimension() {
            let hasWidth = $(this._element).hasClass(Dimension.WIDTH);
            return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
        }

        // Static
        // ------------------------------------------------------------------------

        static _getConfig(config) {
            config        = $.extend({}, Default, config);
            config.toggle = Boolean(config.toggle); // coerce string values
            Util.typeCheckConfig(NAME, config, DefaultType);
            return config;
        }

        static _addAriaAndCollapsedClass(element, triggerArray) {
            if (element) {
                let isOpen = $(element).hasClass(ClassName.IN);
                element.setAttribute('aria-expanded', isOpen);

                if (triggerArray.length) {
                    $(triggerArray)
                        .toggleClass(ClassName.COLLAPSED, !isOpen)
                        .attr('aria-expanded', isOpen);
                }
            }
        }

        static _getTargetFromElement(element) {
            let selector = element.siblings(Selector.BODY);
            return selector ? $(selector)[0] : null;
        }

        static _getHeaderFromElement(element) {
            let selector = element.siblings(Selector.HEADER);
            return selector ? $(selector)[0] : null;
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                let $this   = $(this);
                let data    = $this.data(DATA_KEY);
                let _config = $.extend(
                    {},
                    Default,
                    $this.data(),
                    typeof config === 'object' && config
                );

                if (!data && _config.toggle && /show|hide/.test(config)) {
                    _config.toggle = false;
                }

                if (!data) {
                    data = new Collapsible(this, _config);
                    $this.data(DATA_KEY, data);
                }

                if (typeof config === 'string') {
                    if (data[config] === undefined) {
                        throw new Error(`No method named "${config}"`);
                    }
                    data[config]();
                }
            });
        }

    }

    // ------------------------------------------------------------------------
    // Data Api implementation
    // ------------------------------------------------------------------------

    $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
        let target = Collapsible._getTargetFromElement($(this));
        let data   = $(target).data(DATA_KEY);
        let config = data ? 'toggle' : $(this).data();

        Collapsible._jQueryInterface.call($(target), config);
    });

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME]             = Collapsible._jQueryInterface;
    $.fn[NAME].Constructor = Collapsible;

    return Collapsible;

})(jQuery);

BasUI.Collapsible = Collapsible;
export default Collapsible;
