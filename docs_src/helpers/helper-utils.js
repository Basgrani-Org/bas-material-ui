'use strict';

// Node.js
var _ = require('lodash');

// Export helpers
module.exports.register = function (Handlebars, options) {

    var opts  = options;

    Handlebars.registerHelper('capFirstLetter', function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    });

    Handlebars.registerHelper('colorClassBackground', function(key,cod) {
        var _key = key.replace(/_/g, "-");
        return _key+'-'+cod;
    });

    Handlebars.registerHelper('colorClass', function(key,cod) {
        var _key = key.replace(/_/g, "-");
        return _key+'-text-'+cod;
    });

    Handlebars.registerHelper('colorLabel', function(cod) {
        var _cod = cod.replace("A", "");
        if(_cod < 500 || _cod === "white" || _cod === "transparent"){
            return '#000000';
        }
        if(_cod >= 500 || _cod === "black"){
            return '#ffffff';
        }
    });

    Handlebars.registerHelper("assetsFix", function(path, options) {
        if(path === "../../assets"){
            return "../assets";
        }
        if(path === "../assets"){
            return "assets";
        }
        return path;
    });
};
