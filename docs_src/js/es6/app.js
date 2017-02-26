// Import Vendors Dependencies
import './vendors';

// JS Docs
if (typeof global.BasUIDocs === "undefined") {
    window.BasUIDocs = global.BasUIDocs = {};
    BasUIDocs.site = {};
}

$(document).ready(function () {

    // Create File Upload Drop
    let _dropzone = BasUI.Forms.fileUploadDrop('.bas-ui-file-upload-drop-zone', {
        url                  : 'http://localhost:8888/upload/',
        defaultImageThumbnail: "/assets/img/files/empty.png"
    });

    if (_dropzone) {
        // File Upload Drop - Events
        _dropzone.on("addedfile", function (file) {
            console.log(file);
        });
    }

    // Validate form (Test 1)
    let _val_form_test1        = $('#form-validation-test1');
    let _val_form_test1_submit = $('#form-validation-test1-submit');
    if (_val_form_test1.length) {
        BasUI.Forms.addFormForSubmitValidate(_val_form_test1);
        _val_form_test1_submit.on('click', function (e) {
            _val_form_test1.submit();
        });
        _val_form_test1.submit(function (event) {
            event.preventDefault();

            // Check one field
            let result1 = BasUI.Forms.validateField($('#username-test1'));
            console.log(result1);

            // Check all form
            let result2 = BasUI.Forms.validateForm($('#form-validation-test1'));
            console.log(result2);

            //this.submit(); // If all the validations succeeded

            if (result2 === true) {
                this.reset();
            }
        });
    }

    // Autocomplete
    let autocomplete_minChars  = 2;
    let autocomplete_countries = BasUIDocs.site.countries_v_d();

    // Autocomplete -> Top search
    $('#doc-bas-ui-top-search-autocomplete' + ' input').autocomplete({
        lookup  : autocomplete_countries,
        appendTo: '#doc-bas-ui-top-search-autocomplete',
        groupBy : '',
        minChars: autocomplete_minChars,
        onSelect: function (suggestion) {
            console.log('You selected: ' + suggestion.value + ', ' + suggestion.data);
        }
    });

    // Autocomplete -> Side nav -> search
    $('#doc-bas-ui-side-nav-search-autocomplete' + ' input').autocomplete({
        lookup  : autocomplete_countries,
        appendTo: '#doc-bas-ui-side-nav-search-autocomplete',
        groupBy : '',
        minChars: autocomplete_minChars,
        onSelect: function (suggestion) {
            console.log('You selected: ' + suggestion.value + ', ' + suggestion.data);
        }
    });

    // Autocomplete -> search
    $('#doc-bas-ui-search-autocomplete' + ' input').autocomplete({
        lookup  : autocomplete_countries,
        appendTo: '#doc-bas-ui-search-autocomplete',
        groupBy : '',
        minChars: autocomplete_minChars,
        onSelect: function (suggestion) {
            console.log('You selected: ' + suggestion.value + ', ' + suggestion.data);
        }
    });

    // Autocomplete -> search expandable
    $('#doc-bas-ui-search-expandable-autocomplete' + ' input').autocomplete({
        lookup  : autocomplete_countries,
        appendTo: '#doc-bas-ui-search-expandable-autocomplete',
        groupBy : '',
        minChars: autocomplete_minChars,
        onSelect: function (suggestion) {
            console.log('You selected: ' + suggestion.value + ', ' + suggestion.data);
        }
    });

    // Autocomplete -> input
    $('#doc-text-autocomplete' + ' input').autocomplete({
        lookup  : autocomplete_countries,
        appendTo: '#doc-text-autocomplete',
        groupBy : '',
        minChars: autocomplete_minChars,
        onSelect: function (suggestion) {
            console.log('You selected: ' + suggestion.value + ', ' + suggestion.data);
        }
    });

    // Build Git in Home
    BasUIDocs.site.build_git_home();

    // When our page loads, check to see if it contains and anchor
    BasUIDocs.site.scroll_if_anchor(window.location.hash);
});

// Build Git in Home
BasUIDocs.site.build_git_home = function () {

    let _download_in_git_hub      = $('.download-in-git-hub');
    let _download_in_git_hub_href = $('.download-in-git-hub-href');
    if (_download_in_git_hub.length) {
        $.ajax({
            url     : "https://api.github.com/repos/Basgrani-Org/bas-material-ui/tags",
            dataType: "json",
            success : function (data) {
                if (data.length === 0) {
                    return;
                }
                _download_in_git_hub.html('<i class="mdi mdi-download icon icon-right icon-18"></i> Download v.' + data[0].name).attr('href', data[0].zipball_url);
                _download_in_git_hub_href.attr('href', data[0].zipball_url);
            }
        });
    }
    let _last_commit_in_git_hub = $('.last-commit-in-git-hub');
    if (_last_commit_in_git_hub.length) {
        $.ajax({
            url     : "https://api.github.com/repos/Basgrani-Org/bas-material-ui/commits/master",
            dataType: "json",
            success : function (data) {
                if (data === undefined) {
                    return;
                }
                let date = $.timeago(data.commit.author.date);
                _last_commit_in_git_hub.html(date).attr('href', data.html_url);
            }
        });
    }
};

// Scroll if anchor
BasUIDocs.site.scroll_if_anchor = function (href) {
    href        = typeof(href) === "string" ? href : $(this).attr("href");
    let fromTop = 160;

    if (href.indexOf("#") === 0) {
        let $target = $(href);

        if ($target.length) {
            $('html, body').animate({scrollTop: $target.offset().top - fromTop}, 1000);
            if (history && "pushState" in history) {
                history.pushState({}, document.title, window.location.pathname + href);
                return false;
            }
        }
    }
};

// Get countries (value, data)
BasUIDocs.site.countries_v_d = function () {
    let _obj = [];
    $.map(BasUIDocs.site.countries, function (val, key) {
        _obj.push({value: val, data: key});
    }).join('');
    return _obj;
};

BasUIDocs.site.countries = {
    AF: 'Afghanistan',
    AX: 'Aland Islands',
    AL: 'Albania',
    DZ: 'Algeria',
    AS: 'American Samoa',
    AD: 'Andorra',
    AO: 'Angola',
    AI: 'Anguilla',
    AQ: 'Antarctica',
    AG: 'Antigua And Barbuda',
    AR: 'Argentina',
    AM: 'Armenia',
    AW: 'Aruba',
    AU: 'Australia',
    AT: 'Austria',
    AZ: 'Azerbaijan',
    BS: 'Bahamas',
    BH: 'Bahrain',
    BD: 'Bangladesh',
    BB: 'Barbados',
    BY: 'Belarus',
    BE: 'Belgium',
    BZ: 'Belize',
    BJ: 'Benin',
    BM: 'Bermuda',
    BT: 'Bhutan',
    BO: 'Bolivia',
    BA: 'Bosnia And Herzegovina',
    BW: 'Botswana',
    BV: 'Bouvet Island',
    BR: 'Brazil',
    IO: 'British Indian Ocean Territory',
    BN: 'Brunei Darussalam',
    BG: 'Bulgaria',
    BF: 'Burkina Faso',
    BI: 'Burundi',
    KH: 'Cambodia',
    CM: 'Cameroon',
    CA: 'Canada',
    CV: 'Cape Verde',
    KY: 'Cayman Islands',
    CF: 'Central African Republic',
    TD: 'Chad',
    CL: 'Chile',
    CN: 'China',
    CX: 'Christmas Island',
    CC: 'Cocos (Keeling) Islands',
    CO: 'Colombia',
    KM: 'Comoros',
    CG: 'Congo',
    CD: 'Congo, Democratic Republic',
    CK: 'Cook Islands',
    CR: 'Costa Rica',
    CI: 'Cote D\'Ivoire',
    HR: 'Croatia',
    CU: 'Cuba',
    CY: 'Cyprus',
    CZ: 'Czech Republic',
    DK: 'Denmark',
    DJ: 'Djibouti',
    DM: 'Dominica',
    DO: 'Dominican Republic',
    EC: 'Ecuador',
    EG: 'Egypt',
    SV: 'El Salvador',
    GQ: 'Equatorial Guinea',
    ER: 'Eritrea',
    EE: 'Estonia',
    ET: 'Ethiopia',
    FK: 'Falkland Islands (Malvinas)',
    FO: 'Faroe Islands',
    FJ: 'Fiji',
    FI: 'Finland',
    FR: 'France',
    GF: 'French Guiana',
    PF: 'French Polynesia',
    TF: 'French Southern Territories',
    GA: 'Gabon',
    GM: 'Gambia',
    GE: 'Georgia',
    DE: 'Germany',
    GH: 'Ghana',
    GI: 'Gibraltar',
    GR: 'Greece',
    GL: 'Greenland',
    GD: 'Grenada',
    GP: 'Guadeloupe',
    GU: 'Guam',
    GT: 'Guatemala',
    GG: 'Guernsey',
    GN: 'Guinea',
    GW: 'Guinea-Bissau',
    GY: 'Guyana',
    HT: 'Haiti',
    HM: 'Heard Island & Mcdonald Islands',
    VA: 'Holy See (Vatican City State)',
    HN: 'Honduras',
    HK: 'Hong Kong',
    HU: 'Hungary',
    IS: 'Iceland',
    IN: 'India',
    ID: 'Indonesia',
    IR: 'Iran, Islamic Republic Of',
    IQ: 'Iraq',
    IE: 'Ireland',
    IM: 'Isle Of Man',
    IL: 'Israel',
    IT: 'Italy',
    JM: 'Jamaica',
    JP: 'Japan',
    JE: 'Jersey',
    JO: 'Jordan',
    KZ: 'Kazakhstan',
    KE: 'Kenya',
    KI: 'Kiribati',
    KR: 'Korea',
    KW: 'Kuwait',
    KG: 'Kyrgyzstan',
    LA: 'Lao People\'s Democratic Republic',
    LV: 'Latvia',
    LB: 'Lebanon',
    LS: 'Lesotho',
    LR: 'Liberia',
    LY: 'Libyan Arab Jamahiriya',
    LI: 'Liechtenstein',
    LT: 'Lithuania',
    LU: 'Luxembourg',
    MO: 'Macao',
    MK: 'Macedonia',
    MG: 'Madagascar',
    MW: 'Malawi',
    MY: 'Malaysia',
    MV: 'Maldives',
    ML: 'Mali',
    MT: 'Malta',
    MH: 'Marshall Islands',
    MQ: 'Martinique',
    MR: 'Mauritania',
    MU: 'Mauritius',
    YT: 'Mayotte',
    MX: 'Mexico',
    FM: 'Micronesia, Federated States Of',
    MD: 'Moldova',
    MC: 'Monaco',
    MN: 'Mongolia',
    ME: 'Montenegro',
    MS: 'Montserrat',
    MA: 'Morocco',
    MZ: 'Mozambique',
    MM: 'Myanmar',
    NA: 'Namibia',
    NR: 'Nauru',
    NP: 'Nepal',
    NL: 'Netherlands',
    AN: 'Netherlands Antilles',
    NC: 'New Caledonia',
    NZ: 'New Zealand',
    NI: 'Nicaragua',
    NE: 'Niger',
    NG: 'Nigeria',
    NU: 'Niue',
    NF: 'Norfolk Island',
    MP: 'Northern Mariana Islands',
    NO: 'Norway',
    OM: 'Oman',
    PK: 'Pakistan',
    PW: 'Palau',
    PS: 'Palestinian Territory, Occupied',
    PA: 'Panama',
    PG: 'Papua New Guinea',
    PY: 'Paraguay',
    PE: 'Peru',
    PH: 'Philippines',
    PN: 'Pitcairn',
    PL: 'Poland',
    PT: 'Portugal',
    PR: 'Puerto Rico',
    QA: 'Qatar',
    RE: 'Reunion',
    RO: 'Romania',
    RU: 'Russian Federation',
    RW: 'Rwanda',
    BL: 'Saint Barthelemy',
    SH: 'Saint Helena',
    KN: 'Saint Kitts And Nevis',
    LC: 'Saint Lucia',
    MF: 'Saint Martin',
    PM: 'Saint Pierre And Miquelon',
    VC: 'Saint Vincent And Grenadines',
    WS: 'Samoa',
    SM: 'San Marino',
    ST: 'Sao Tome And Principe',
    SA: 'Saudi Arabia',
    SN: 'Senegal',
    RS: 'Serbia',
    SC: 'Seychelles',
    SL: 'Sierra Leone',
    SG: 'Singapore',
    SK: 'Slovakia',
    SI: 'Slovenia',
    SB: 'Solomon Islands',
    SO: 'Somalia',
    ZA: 'South Africa',
    GS: 'South Georgia And Sandwich Isl.',
    ES: 'Spain',
    LK: 'Sri Lanka',
    SD: 'Sudan',
    SR: 'Suriname',
    SJ: 'Svalbard And Jan Mayen',
    SZ: 'Swaziland',
    SE: 'Sweden',
    CH: 'Switzerland',
    SY: 'Syrian Arab Republic',
    TW: 'Taiwan',
    TJ: 'Tajikistan',
    TZ: 'Tanzania',
    TH: 'Thailand',
    TL: 'Timor-Leste',
    TG: 'Togo',
    TK: 'Tokelau',
    TO: 'Tonga',
    TT: 'Trinidad And Tobago',
    TN: 'Tunisia',
    TR: 'Turkey',
    TM: 'Turkmenistan',
    TC: 'Turks And Caicos Islands',
    TV: 'Tuvalu',
    UG: 'Uganda',
    UA: 'Ukraine',
    AE: 'United Arab Emirates',
    GB: 'United Kingdom',
    US: 'United States',
    UM: 'United States Outlying Islands',
    UY: 'Uruguay',
    UZ: 'Uzbekistan',
    VU: 'Vanuatu',
    VE: 'Venezuela',
    VN: 'Viet Nam',
    VG: 'Virgin Islands, British',
    VI: 'Virgin Islands, U.S.',
    WF: 'Wallis And Futuna',
    EH: 'Western Sahara',
    YE: 'Yemen',
    ZM: 'Zambia',
    ZW: 'Zimbabwe'
};
