import Util from '../lib/util';

const Cards = (($) => {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    const VERSION      = Util.VERSION;
    const NAME         = `${Util.PREFIX}_cards`;
    const NAME_CLASS   = `${Util.CLASS_PREFIX}-cards`;
    const DATA_KEY     = `${Util.API_PREFIX}.cards`;
    const EVENT_KEY    = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const Default = {};

    const DefaultType = {};

    const ClassName = {};

    const Selector = {};

    const Event = {
        CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`
    };

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    class Cards {

        constructor(element, config) {
            let _self = this;

        }

        // Getters
        // ------------------------------------------------------------------------

        static get VERSION() {
            return VERSION;
        }

        // Public
        // ------------------------------------------------------------------------

        dispose() {
            $.removeData(this._trigger, DATA_KEY);
        }

        // Private
        // ------------------------------------------------------------------------


        // Static
        // ------------------------------------------------------------------------

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

                if (!data) {
                    data = new Cards(this, _config);
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

    // READY & OBSERVE
    if (Util.mutationObserver === null) {

    } else {
        // .bas_ui_observe(selector, onAdded, onRemoved)
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME]             = Cards._jQueryInterface;
    $.fn[NAME].Constructor = Cards;

    return Cards;

})(jQuery);

BasUI.Cards = Cards;
export default Cards;
