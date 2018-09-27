import Util from '../lib/util';

const Button = (($) => {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    const VERSION      = Util.VERSION;
    const NAME         = `${Util.PREFIX}_button`;
    const NAME_CLASS   = `${Util.CLASS_PREFIX}-button`;
    const DATA_KEY     = `${Util.API_PREFIX}.button`;
    const EVENT_KEY    = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const ClassName = {
        TOGGLE_FAB_ACTIVE: 'active',
        TOGGLE_FAB       : 'bas-ui-button-fab-action',
        BUTTON           : 'bas-ui-button',
    };

    const Selector = {
        TOGGLE_FAB_ACTIVE: `.${ClassName.TOGGLE_FAB_ACTIVE}`,
        TOGGLE_FAB       : `.${ClassName.TOGGLE_FAB}`,
        BUTTON           : `.${ClassName.BUTTON}`,
    };

    const Event = {
        MOUSE_ENTER_LEAVE_DATA_API: `mouseenter${EVENT_KEY}${DATA_API_KEY}, mouseleave${EVENT_KEY}${DATA_API_KEY}`,
        TOUCH_START_DATA_API      : `touchstart${EVENT_KEY}${DATA_API_KEY}`,
        CLICK_DATA_API            : `click${EVENT_KEY}${DATA_API_KEY}`,
    };

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    class Button {

        constructor(element) {
            this._element = element;
        }

        // Getters
        // ------------------------------------------------------------------------

        static get VERSION() {
            return VERSION;
        }

        // Public
        // ------------------------------------------------------------------------

        toggleFAB() {
            this._toggleFAB();
        }

        openFAB() {
            this._toggleFAB(false);
        }

        closeFAB() {
            this._toggleFAB(true);
        }

        dispose() {
            $.removeData(this._element, DATA_KEY);
            this._element = null;
        }

        // Private
        // ------------------------------------------------------------------------

        _toggleFAB(isClose = 'none') {
            let rootElement       = $($(this._element).closest(Selector.TOGGLE_FAB)[0]);
            let total             = rootElement.find('ul li').length;
            let onAnimationEnd    = null;
            let animationDuration = 150;
            let animationDelay    = 75;
            let time              = 0;

            // End animation event
            function animationEnd() {
                if (!rootElement.hasClass(`${ClassName.TOGGLE_FAB} ${ClassName.TOGGLE_FAB_ACTIVE}`)) {
                    $(`${Selector.TOGGLE_FAB} ul`).css('height', '0');
                }
            }

            // Add animation class
            if (!rootElement.hasClass(`${ClassName.TOGGLE_FAB} ${ClassName.TOGGLE_FAB_ACTIVE}`) && (isClose === false || isClose === 'none')) {
                // SHOW
                $(`${Selector.TOGGLE_FAB} ul`).css('height', 'auto');
                rootElement.addClass(ClassName.TOGGLE_FAB_ACTIVE);

                // Set start position
                rootElement.find('ul li').velocity(
                    {opacity: "0", scaleY: ".4", scaleX: ".4", translateY: "40px"},
                    {duration: 0},
                );

                // Set animations show
                rootElement.find('ul li').reverse().each(function (index) {
                    $(this).velocity(
                        {opacity: "1", scaleX: "1", scaleY: "1", translateY: "0"},
                        {duration: animationDuration, delay: time},
                    );
                    time += animationDelay;
                });
            } else if ((isClose === true || isClose === 'none')) {
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

                    $(this).velocity(
                        {opacity: "0", scaleX: ".4", scaleY: ".4", translateY: "40px"},
                        {duration: animationDuration, delay: time, complete: onAnimationEnd},
                    );
                    time += animationDelay;
                });
            }
        }

        // Static
        // ------------------------------------------------------------------------

        static _jQueryInterface(config) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY);

                if (!data) {
                    data = new Button(this);
                    $(this).data(DATA_KEY, data);
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

    // Is Touch
    if (Util.isTouch) {
        $(document).on(Event.CLICK_DATA_API, Selector.TOGGLE_FAB + ' > a', (event) => {
            event.preventDefault();
            let button = event.target;
            Button._jQueryInterface.call($(button), 'toggleFAB');
        });

        $(document).on(Event.TOUCH_START_DATA_API, 'html', (event) => {
            let element = $(event.target);

            if (!element.hasClass(ClassName.TOGGLE_FAB) && element.parents(Selector.TOGGLE_FAB).length !== 1) {
                $(document).find(Selector.TOGGLE_FAB).each(function (i) {
                    Button._jQueryInterface.call($(this), 'closeFAB');
                });
            }
        });
    } else {
        $(document).on(Event.MOUSE_ENTER_LEAVE_DATA_API, Selector.TOGGLE_FAB, (event) => {
            event.preventDefault();
            let button = event.target;
            Button._jQueryInterface.call($(button), 'toggleFAB');
        });
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME]             = Button._jQueryInterface;
    $.fn[NAME].Constructor = Button;

    return Button;

})(jQuery);

BasUI.Button = Button;
export default Button;
