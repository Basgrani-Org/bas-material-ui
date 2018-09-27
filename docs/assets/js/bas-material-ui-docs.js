(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
/**
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * @name timeago
 * @version 1.5.4
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2017, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    factory((typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) {
      return inWords(timestamp);
    } else if (typeof timestamp === "string") {
      return inWords($.timeago.parse(timestamp));
    } else if (typeof timestamp === "number") {
      return inWords(new Date(timestamp));
    } else {
      return inWords($.timeago.datetime(timestamp));
    }
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowPast: true,
      allowFuture: false,
      localeTitle: false,
      cutoff: 0,
      autoDispose: true,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        inPast: 'any moment now',
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years",
        wordSeparator: " ",
        numbers: []
      }
    },

    inWords: function(distanceMillis) {
      if (!this.settings.allowPast && ! this.settings.allowFuture) {
          throw 'timeago allowPast and allowFuture settings can not both be set to false.';
      }

      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow;
        }
      }

      if (!this.settings.allowPast && distanceMillis >= 0) {
        return this.settings.strings.inPast;
      }

      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      function substitute(stringOrFunction, number) {
        var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 42 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.round(days)) ||
        days < 45 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute($l.year, 1) ||
        substitute($l.years, Math.round(years));

      var separator = $l.wordSeparator || "";
      if ($l.wordSeparator === undefined) { separator = " "; }
      return $.trim([prefix, words, suffix].join(separator));
    },

    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/\.\d+/,""); // remove milliseconds
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      s = s.replace(/([\+\-]\d\d)$/," $100"); // +09 -> +0900
      return new Date(s);
    },
    datetime: function(elem) {
      var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601);
    },
    isTime: function(elem) {
      // jQuery's `is()` doesn't play well with HTML5 in IE
      return $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
    }
  });

  // functions that can be called via $(el).timeago('action')
  // init is default when no action is given
  // functions are called with context of a single element
  var functions = {
    init: function() {
      functions.dispose.call(this);
      var refresh_el = $.proxy(refresh, this);
      refresh_el();
      var $s = $t.settings;
      if ($s.refreshMillis > 0) {
        this._timeagoInterval = setInterval(refresh_el, $s.refreshMillis);
      }
    },
    update: function(timestamp) {
      var date = (timestamp instanceof Date) ? timestamp : $t.parse(timestamp);
      $(this).data('timeago', { datetime: date });
      if ($t.settings.localeTitle) {
        $(this).attr("title", date.toLocaleString());
      }
      refresh.apply(this);
    },
    updateFromDOM: function() {
      $(this).data('timeago', { datetime: $t.parse( $t.isTime(this) ? $(this).attr("datetime") : $(this).attr("title") ) });
      refresh.apply(this);
    },
    dispose: function () {
      if (this._timeagoInterval) {
        window.clearInterval(this._timeagoInterval);
        this._timeagoInterval = null;
      }
    }
  };

  $.fn.timeago = function(action, options) {
    var fn = action ? functions[action] : functions.init;
    if (!fn) {
      throw new Error("Unknown function name '"+ action +"' for timeago");
    }
    // each over objects here and call the requested function
    this.each(function() {
      fn.call(this, options);
    });
    return this;
  };

  function refresh() {
    var $s = $t.settings;

    //check if it's still visible
    if ($s.autoDispose && !$.contains(document.documentElement,this)) {
      //stop if it has been removed
      $(this).timeago("dispose");
      return this;
    }

    var data = prepareData(this);

    if (!isNaN(data.datetime)) {
      if ( $s.cutoff === 0 || Math.abs(distance(data.datetime)) < $s.cutoff) {
        $(this).text(inWords(data.datetime));
      } else {
        if ($(this).attr('title').length > 0) {
            $(this).text($(this).attr('title'));
        }
      }
    }
    return this;
  }

  function prepareData(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", { datetime: $t.datetime(element) });
      var text = $.trim(element.text());
      if ($t.settings.localeTitle) {
        element.attr("title", element.data('timeago').datetime.toLocaleString());
      } else if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
        element.attr("title", text);
      }
    }
    return element.data("timeago");
  }

  function inWords(date) {
    return $t.inWords(distance(date));
  }

  function distance(date) {
    return (new Date().getTime() - date.getTime());
  }

  // fix for IE6 suckage
  document.createElement("abbr");
  document.createElement("time");
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
(function(Prism) {
	var insideString = {
		variable: [
			// Arithmetic Environment
			{
				pattern: /\$?\(\([\w\W]+?\)\)/,
				inside: {
					// If there is a $ sign at the beginning highlight $(( and )) as variable
					variable: [{
							pattern: /(^\$\(\([\w\W]+)\)\)/,
							lookbehind: true
						},
						/^\$\(\(/,
					],
					number: /\b-?(?:0x[\dA-Fa-f]+|\d*\.?\d+(?:[Ee]-?\d+)?)\b/,
					// Operators according to https://www.gnu.org/software/bash/manual/bashref.html#Shell-Arithmetic
					operator: /--?|-=|\+\+?|\+=|!=?|~|\*\*?|\*=|\/=?|%=?|<<=?|>>=?|<=?|>=?|==?|&&?|&=|\^=?|\|\|?|\|=|\?|:/,
					// If there is no $ sign at the beginning highlight (( and )) as punctuation
					punctuation: /\(\(?|\)\)?|,|;/
				}
			},
			// Command Substitution
			{
				pattern: /\$\([^)]+\)|`[^`]+`/,
				inside: {
					variable: /^\$\(|^`|\)$|`$/
				}
			},
			/\$(?:[a-z0-9_#\?\*!@]+|\{[^}]+\})/i
		],
	};

	Prism.languages.bash = {
		'shebang': {
			pattern: /^#!\s*\/bin\/bash|^#!\s*\/bin\/sh/,
			alias: 'important'
		},
		'comment': {
			pattern: /(^|[^"{\\])#.*/,
			lookbehind: true
		},
		'string': [
			//Support for Here-Documents https://en.wikipedia.org/wiki/Here_document
			{
				pattern: /((?:^|[^<])<<\s*)(?:"|')?(\w+?)(?:"|')?\s*\r?\n(?:[\s\S])*?\r?\n\2/g,
				lookbehind: true,
				greedy: true,
				inside: insideString
			},
			{
				pattern: /(["'])(?:\\\\|\\?[^\\])*?\1/g,
				greedy: true,
				inside: insideString
			}
		],
		'variable': insideString.variable,
		// Originally based on http://ss64.com/bash/
		'function': {
			pattern: /(^|\s|;|\||&)(?:alias|apropos|apt-get|aptitude|aspell|awk|basename|bash|bc|bg|builtin|bzip2|cal|cat|cd|cfdisk|chgrp|chmod|chown|chroot|chkconfig|cksum|clear|cmp|comm|command|cp|cron|crontab|csplit|cut|date|dc|dd|ddrescue|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|du|egrep|eject|enable|env|ethtool|eval|exec|expand|expect|export|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|getopts|git|grep|groupadd|groupdel|groupmod|groups|gzip|hash|head|help|hg|history|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|jobs|join|kill|killall|less|link|ln|locate|logname|logout|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|make|man|mkdir|mkfifo|mkisofs|mknod|more|most|mount|mtools|mtr|mv|mmv|nano|netstat|nice|nl|nohup|notify-send|nslookup|open|op|passwd|paste|pathchk|ping|pkill|popd|pr|printcap|printenv|printf|ps|pushd|pv|pwd|quota|quotacheck|quotactl|ram|rar|rcp|read|readarray|readonly|reboot|rename|renice|remsync|rev|rm|rmdir|rsync|screen|scp|sdiff|sed|seq|service|sftp|shift|shopt|shutdown|sleep|slocate|sort|source|split|ssh|stat|strace|su|sudo|sum|suspend|sync|tail|tar|tee|test|time|timeout|times|touch|top|traceroute|trap|tr|tsort|tty|type|ulimit|umask|umount|unalias|uname|unexpand|uniq|units|unrar|unshar|uptime|useradd|userdel|usermod|users|uuencode|uudecode|v|vdir|vi|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yes|zip)(?=$|\s|;|\||&)/,
			lookbehind: true
		},
		'keyword': {
			pattern: /(^|\s|;|\||&)(?:let|:|\.|if|then|else|elif|fi|for|break|continue|while|in|case|function|select|do|done|until|echo|exit|return|set|declare)(?=$|\s|;|\||&)/,
			lookbehind: true
		},
		'boolean': {
			pattern: /(^|\s|;|\||&)(?:true|false)(?=$|\s|;|\||&)/,
			lookbehind: true
		},
		'operator': /&&?|\|\|?|==?|!=?|<<<?|>>|<=?|>=?|=~/,
		'punctuation': /\$?\(\(?|\)\)?|\.\.|[{}[\];]/
	};

	var inside = insideString.variable[1].inside;
	inside['function'] = Prism.languages.bash['function'];
	inside.keyword = Prism.languages.bash.keyword;
	inside.boolean = Prism.languages.bash.boolean;
	inside.operator = Prism.languages.bash.operator;
	inside.punctuation = Prism.languages.bash.punctuation;
})(Prism);
},{}],3:[function(require,module,exports){
Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//,
	'atrule': {
		pattern: /@[\w-]+?.*?(;|(?=\s*\{))/i,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	'url': /url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	'selector': /[^\{\}\s][^\{\};]*?(?=\s*\{)/,
	'string': /("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,
	'property': /(\b|\B)[\w-]+(?=\s*:)/i,
	'important': /\B!important\b/i,
	'function': /[-a-z0-9]+(?=\()/i,
	'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,
			lookbehind: true,
			inside: Prism.languages.css,
			alias: 'language-css'
		}
	});
	
	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|').*?\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
}
},{}],4:[function(require,module,exports){
Prism.languages.git = {
	/*
	 * A simple one line comment like in a git status command
	 * For instance:
	 * $ git status
	 * # On branch infinite-scroll
	 * # Your branch and 'origin/sharedBranches/frontendTeam/infinite-scroll' have diverged,
	 * # and have 1 and 2 different commits each, respectively.
	 * nothing to commit (working directory clean)
	 */
	'comment': /^#.*/m,

	/*
	 * Regexp to match the changed lines in a git diff output. Check the example below.
	 */
	'deleted': /^[-–].*/m,
	'inserted': /^\+.*/m,

	/*
	 * a string (double and simple quote)
	 */
	'string': /("|')(\\?.)*?\1/m,

	/*
	 * a git command. It starts with a random prompt finishing by a $, then "git" then some other parameters
	 * For instance:
	 * $ git add file.txt
	 */
	'command': {
		pattern: /^.*\$ git .*$/m,
		inside: {
			/*
			 * A git command can contain a parameter starting by a single or a double dash followed by a string
			 * For instance:
			 * $ git diff --cached
			 * $ git log -p
			 */
			'parameter': /\s(--|-)\w+/m
		}
	},

	/*
	 * Coordinates displayed in a git diff command
	 * For instance:
	 * $ git diff
	 * diff --git file.txt file.txt
	 * index 6214953..1d54a52 100644
	 * --- file.txt
	 * +++ file.txt
	 * @@ -1 +1,2 @@
	 * -Here's my tetx file
	 * +Here's my text file
	 * +And this is the second line
	 */
	'coord': /^@@.*@@$/m,

	/*
	 * Match a "commit [SHA1]" line in a git log output.
	 * For instance:
	 * $ git log
	 * commit a11a14ef7e26f2ca62d4b35eac455ce636d0dc09
	 * Author: lgiraudel
	 * Date:   Mon Feb 17 11:18:34 2014 +0100
	 *
	 *     Add of a new line
	 */
	'commit_sha1': /^commit \w{40}$/m
};

},{}],5:[function(require,module,exports){
Prism.languages.http = {
	'request-line': {
		pattern: /^(POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b\shttps?:\/\/\S+\sHTTP\/[0-9.]+/m,
		inside: {
			// HTTP Verb
			property: /^(POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b/,
			// Path or query argument
			'attr-name': /:\w+/
		}
	},
	'response-status': {
		pattern: /^HTTP\/1.[01] [0-9]+.*/m,
		inside: {
			// Status, e.g. 200 OK
			property: {
                pattern: /(^HTTP\/1.[01] )[0-9]+.*/i,
                lookbehind: true
            }
		}
	},
	// HTTP header name
	'header-name': {
        pattern: /^[\w-]+:(?=.)/m,
        alias: 'keyword'
    }
};

// Create a mapping of Content-Type headers to language definitions
var httpLanguages = {
	'application/json': Prism.languages.javascript,
	'application/xml': Prism.languages.markup,
	'text/xml': Prism.languages.markup,
	'text/html': Prism.languages.markup
};

// Insert each content type parser that has its associated language
// currently loaded.
for (var contentType in httpLanguages) {
	if (httpLanguages[contentType]) {
		var options = {};
		options[contentType] = {
			pattern: new RegExp('(content-type:\\s*' + contentType + '[\\w\\W]*?)(?:\\r?\\n|\\r){2}[\\w\\W]*', 'i'),
			lookbehind: true,
			inside: {
				rest: httpLanguages[contentType]
			}
		};
		Prism.languages.insertBefore('http', 'header-name', options);
	}
}

},{}],6:[function(require,module,exports){
Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
	'number': /\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
		lookbehind: true,
		greedy: true
	}
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\\\|\\?[^\\])*?`/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /\$\{[^}]+\}/,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript,
			alias: 'language-javascript'
		}
	});
}

Prism.languages.js = Prism.languages.javascript;
},{}],7:[function(require,module,exports){
Prism.languages.markdown = Prism.languages.extend('markup', {});
Prism.languages.insertBefore('markdown', 'prolog', {
	'blockquote': {
		// > ...
		pattern: /^>(?:[\t ]*>)*/m,
		alias: 'punctuation'
	},
	'code': [
		{
			// Prefixed by 4 spaces or 1 tab
			pattern: /^(?: {4}|\t).+/m,
			alias: 'keyword'
		},
		{
			// `code`
			// ``code``
			pattern: /``.+?``|`[^`\n]+`/,
			alias: 'keyword'
		}
	],
	'title': [
		{
			// title 1
			// =======

			// title 2
			// -------
			pattern: /\w+.*(?:\r?\n|\r)(?:==+|--+)/,
			alias: 'important',
			inside: {
				punctuation: /==+$|--+$/
			}
		},
		{
			// # title 1
			// ###### title 6
			pattern: /(^\s*)#+.+/m,
			lookbehind: true,
			alias: 'important',
			inside: {
				punctuation: /^#+|#+$/
			}
		}
	],
	'hr': {
		// ***
		// ---
		// * * *
		// -----------
		pattern: /(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,
		lookbehind: true,
		alias: 'punctuation'
	},
	'list': {
		// * item
		// + item
		// - item
		// 1. item
		pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
		lookbehind: true,
		alias: 'punctuation'
	},
	'url-reference': {
		// [id]: http://example.com "Optional title"
		// [id]: http://example.com 'Optional title'
		// [id]: http://example.com (Optional title)
		// [id]: <http://example.com> "Optional title"
		pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
		inside: {
			'variable': {
				pattern: /^(!?\[)[^\]]+/,
				lookbehind: true
			},
			'string': /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
			'punctuation': /^[\[\]!:]|[<>]/
		},
		alias: 'url'
	},
	'bold': {
		// **strong**
		// __strong__

		// Allow only one line break
		pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
		lookbehind: true,
		inside: {
			'punctuation': /^\*\*|^__|\*\*$|__$/
		}
	},
	'italic': {
		// *em*
		// _em_

		// Allow only one line break
		pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
		lookbehind: true,
		inside: {
			'punctuation': /^[*_]|[*_]$/
		}
	},
	'url': {
		// [example](http://example.com "Optional title")
		// [example] [id]
		pattern: /!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
		inside: {
			'variable': {
				pattern: /(!?\[)[^\]]+(?=\]$)/,
				lookbehind: true
			},
			'string': {
				pattern: /"(?:\\.|[^"\\])*"(?=\)$)/
			}
		}
	}
});

Prism.languages.markdown['bold'].inside['url'] = Prism.util.clone(Prism.languages.markdown['url']);
Prism.languages.markdown['italic'].inside['url'] = Prism.util.clone(Prism.languages.markdown['url']);
Prism.languages.markdown['bold'].inside['italic'] = Prism.util.clone(Prism.languages.markdown['italic']);
Prism.languages.markdown['italic'].inside['bold'] = Prism.util.clone(Prism.languages.markdown['bold']);
},{}],8:[function(require,module,exports){
/**
 * Original by Aaron Harun: http://aahacreative.com/2012/07/31/php-syntax-highlighting-prism/
 * Modified by Miles Johnson: http://milesj.me
 *
 * Supports the following:
 * 		- Extends clike syntax
 * 		- Support for PHP 5.3+ (namespaces, traits, generators, etc)
 * 		- Smarter constant and function matching
 *
 * Adds the following new token classes:
 * 		constant, delimiter, variable, function, package
 */

Prism.languages.php = Prism.languages.extend('clike', {
	'keyword': /\b(and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|private|protected|parent|throw|null|echo|print|trait|namespace|final|yield|goto|instanceof|finally|try|catch)\b/i,
	'constant': /\b[A-Z0-9_]{2,}\b/,
	'comment': {
		pattern: /(^|[^\\])(?:\/\*[\w\W]*?\*\/|\/\/.*)/,
		lookbehind: true
	}
});

// Shell-like comments are matched after strings, because they are less
// common than strings containing hashes...
Prism.languages.insertBefore('php', 'class-name', {
	'shell-comment': {
		pattern: /(^|[^\\])#.*/,
		lookbehind: true,
		alias: 'comment'
	}
});

Prism.languages.insertBefore('php', 'keyword', {
	'delimiter': /\?>|<\?(?:php)?/i,
	'variable': /\$\w+\b/i,
	'package': {
		pattern: /(\\|namespace\s+|use\s+)[\w\\]+/,
		lookbehind: true,
		inside: {
			punctuation: /\\/
		}
	}
});

// Must be defined after the function pattern
Prism.languages.insertBefore('php', 'operator', {
	'property': {
		pattern: /(->)[\w]+/,
		lookbehind: true
	}
});

// Add HTML support of the markup language exists
if (Prism.languages.markup) {

	// Tokenize all inline PHP blocks that are wrapped in <?php ?>
	// This allows for easy PHP + markup highlighting
	Prism.hooks.add('before-highlight', function(env) {
		if (env.language !== 'php') {
			return;
		}

		env.tokenStack = [];

		env.backupCode = env.code;
		env.code = env.code.replace(/(?:<\?php|<\?)[\w\W]*?(?:\?>)/ig, function(match) {
			env.tokenStack.push(match);

			return '{{{PHP' + env.tokenStack.length + '}}}';
		});
	});

	// Restore env.code for other plugins (e.g. line-numbers)
	Prism.hooks.add('before-insert', function(env) {
		if (env.language === 'php') {
			env.code = env.backupCode;
			delete env.backupCode;
		}
	});

	// Re-insert the tokens after highlighting
	Prism.hooks.add('after-highlight', function(env) {
		if (env.language !== 'php') {
			return;
		}

		for (var i = 0, t; t = env.tokenStack[i]; i++) {
			// The replace prevents $$, $&, $`, $', $n, $nn from being interpreted as special patterns
			env.highlightedCode = env.highlightedCode.replace('{{{PHP' + (i + 1) + '}}}', Prism.highlight(t, env.grammar, 'php').replace(/\$/g, '$$$$'));
		}

		env.element.innerHTML = env.highlightedCode;
	});

	// Wrap tokens in classes that are missing them
	Prism.hooks.add('wrap', function(env) {
		if (env.language === 'php' && env.type === 'markup') {
			env.content = env.content.replace(/(\{\{\{PHP[0-9]+\}\}\})/g, "<span class=\"token php\">$1</span>");
		}
	});

	// Add the rules before all others
	Prism.languages.insertBefore('php', 'comment', {
		'markup': {
			pattern: /<[^?]\/?(.*?)>/,
			inside: Prism.languages.markup
		},
		'php': /\{\{\{PHP[0-9]+\}\}\}/
	});
}

},{}],9:[function(require,module,exports){
Prism.languages.scss = Prism.languages.extend('css', {
	'comment': {
		pattern: /(^|[^\\])(?:\/\*[\w\W]*?\*\/|\/\/.*)/,
		lookbehind: true
	},
	'atrule': {
		pattern: /@[\w-]+(?:\([^()]+\)|[^(])*?(?=\s+[{;])/,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	// url, compassified
	'url': /(?:[-a-z]+-)*url(?=\()/i,
	// CSS selector regex is not appropriate for Sass
	// since there can be lot more things (var, @ directive, nesting..)
	// a selector must start at the end of a property or after a brace (end of other rules or nesting)
	// it can contain some characters that aren't used for defining rules or end of selector, & (parent selector), or interpolated variable
	// the end of a selector is found when there is no rules in it ( {} or {\s}) or if there is a property (because an interpolated var
	// can "pass" as a selector- e.g: proper#{$erty})
	// this one was hard to do, so please be careful if you edit this one :)
	'selector': {
		// Initial look-ahead is used to prevent matching of blank selectors
		pattern: /(?=\S)[^@;\{\}\(\)]?([^@;\{\}\(\)]|&|#\{\$[-_\w]+\})+(?=\s*\{(\}|\s|[^\}]+(:|\{)[^\}]+))/m,
		inside: {
			'placeholder': /%[-_\w]+/
		}
	}
});

Prism.languages.insertBefore('scss', 'atrule', {
	'keyword': [
		/@(?:if|else(?: if)?|for|each|while|import|extend|debug|warn|mixin|include|function|return|content)/i,
		{
			pattern: /( +)(?:from|through)(?= )/,
			lookbehind: true
		}
	]
});

Prism.languages.insertBefore('scss', 'property', {
	// var and interpolated vars
	'variable': /\$[-_\w]+|#\{\$[-_\w]+\}/
});

Prism.languages.insertBefore('scss', 'function', {
	'placeholder': {
		pattern: /%[-_\w]+/,
		alias: 'selector'
	},
	'statement': /\B!(?:default|optional)\b/i,
	'boolean': /\b(?:true|false)\b/,
	'null': /\bnull\b/,
	'operator': {
		pattern: /(\s)(?:[-+*\/%]|[=!]=|<=?|>=?|and|or|not)(?=\s)/,
		lookbehind: true
	}
});

Prism.languages.scss['atrule'].inside.rest = Prism.util.clone(Prism.languages.scss);
},{}],10:[function(require,module,exports){
(function (global){

/* **********************************************
     Begin prism-core.js
********************************************** */

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-(\w+)\b/i;
var uniqueId = 0;

var _ = _self.Prism = {
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o) {
			var type = _.util.type(o);

			switch (type) {
				case 'Object':
					var clone = {};

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key]);
						}
					}

					return clone;

				case 'Array':
					// Check for existence for IE8
					return o.map && o.map(function(v) { return _.util.clone(v); });
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need anobject and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before. If not provided, the function appends instead.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];

			if (arguments.length == 2) {
				insert = arguments[1];

				for (var newToken in insert) {
					if (insert.hasOwnProperty(newToken)) {
						grammar[newToken] = insert[newToken];
					}
				}

				return grammar;
			}

			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === root[inside] && key != inside) {
					this[key] = ret;
				}
			});

			return root[inside] = ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback, type, visited) {
			visited = visited || {};
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, null, visited);
					}
					else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, i, visited);
					}
				}
			}
		}
	},
	plugins: {},

	highlightAll: function(async, callback) {
		var env = {
			callback: callback,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run("before-highlightall", env);

		var elements = env.elements || document.querySelectorAll(env.selector);

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1].toLowerCase();
			grammar = _.languages[language];
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		parent = element.parentNode;

		if (/pre/i.test(parent.nodeName)) {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		_.hooks.run('before-sanity-check', env);

		if (!env.code || !env.grammar) {
			_.hooks.run('complete', env);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = evt.data;

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
				_.hooks.run('complete', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
		}
	},

	highlight: function (text, grammar, language) {
		var tokens = _.tokenize(text, grammar);
		return Token.stringify(_.util.encode(tokens), language);
	},

	tokenize: function(text, grammar, language) {
		var Token = _.Token;

		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		tokenloop: for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					greedy = !!pattern.greedy,
					lookbehindLength = 0,
					alias = pattern.alias;

				pattern = pattern.pattern || pattern;

				for (var i=0; i<strarr.length; i++) { // Don’t cache length as it changes during the loop

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						break tokenloop;
					}

					if (str instanceof Token) {
						continue;
					}

					pattern.lastIndex = 0;

					var match = pattern.exec(str),
					    delNum = 1;

					// Greedy patterns can override/remove up to two previously matched tokens
					if (!match && greedy && i != strarr.length - 1) {
						// Reconstruct the original text using the next two tokens
						var nextToken = strarr[i + 1].matchedStr || strarr[i + 1],
						    combStr = str + nextToken;

						if (i < strarr.length - 2) {
							combStr += strarr[i + 2].matchedStr || strarr[i + 2];
						}

						// Try the pattern again on the reconstructed text
						pattern.lastIndex = 0;
						match = pattern.exec(combStr);
						if (!match) {
							continue;
						}

						var from = match.index + (lookbehind ? match[1].length : 0);
						// To be a valid candidate, the new match has to start inside of str
						if (from >= str.length) {
							continue;
						}
						var to = match.index + match[0].length,
						    len = str.length + nextToken.length;

						// Number of tokens to delete and replace with the new match
						delNum = 3;

						if (to <= len) {
							if (strarr[i + 1].greedy) {
								continue;
							}
							delNum = 2;
							combStr = combStr.slice(0, len);
						}
						str = combStr;
					}

					if (!match) {
						continue;
					}

					if(lookbehind) {
						lookbehindLength = match[1].length;
					}

					var from = match.index + lookbehindLength,
					    match = match[0].slice(lookbehindLength),
					    to = from + match.length,
					    before = str.slice(0, from),
					    after = str.slice(to);

					var args = [i, delNum];

					if (before) {
						args.push(before);
					}

					var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

					args.push(wrapped);

					if (after) {
						args.push(after);
					}

					Array.prototype.splice.apply(strarr, args);
				}
			}
		}

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content, alias, matchedStr, greedy) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	// Copy of the full string this token was created from
	this.matchedStr = matchedStr || null;
	this.greedy = !!greedy;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (_.util.type(o) === 'Array') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (env.type == 'comment') {
		env.attributes['spellcheck'] = 'true';
	}

	if (o.alias) {
		var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = '';

	for (var name in env.attributes) {
		attributes += (attributes ? ' ' : '') + name + '="' + (env.attributes[name] || '') + '"';
	}

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '" ' + attributes + '>' + env.content + '</' + env.tag + '>';

};

if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _self.Prism;
	}
 	// In worker
	_self.addEventListener('message', function(evt) {
		var message = JSON.parse(evt.data),
		    lang = message.language,
		    code = message.code,
		    immediateClose = message.immediateClose;

		_self.postMessage(_.highlight(code, _.languages[lang], lang));
		if (immediateClose) {
			_self.close();
		}
	}, false);

	return _self.Prism;
}

//Get current script and highlight
var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

if (script) {
	_.filename = script.src;

	if (document.addEventListener && !script.hasAttribute('data-manual')) {
		if(document.readyState !== "loading") {
			requestAnimationFrame(_.highlightAll, 0);
		}
		else {
			document.addEventListener('DOMContentLoaded', _.highlightAll);
		}
	}
}

return _self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\w\W]*?-->/,
	'prolog': /<\?[\w\W]+?\?>/,
	'doctype': /<!DOCTYPE[\w\W]+?>/,
	'cdata': /<!\[CDATA\[[\w\W]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=.$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,
				inside: {
					'punctuation': /[=>"']/
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;


/* **********************************************
     Begin prism-css.js
********************************************** */

Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//,
	'atrule': {
		pattern: /@[\w-]+?.*?(;|(?=\s*\{))/i,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	'url': /url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	'selector': /[^\{\}\s][^\{\};]*?(?=\s*\{)/,
	'string': /("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,
	'property': /(\b|\B)[\w-]+(?=\s*:)/i,
	'important': /\B!important\b/i,
	'function': /[-a-z0-9]+(?=\()/i,
	'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,
			lookbehind: true,
			inside: Prism.languages.css,
			alias: 'language-css'
		}
	});
	
	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|').*?\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
}

/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true
		}
	],
	'string': {
		pattern: /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,
		lookbehind: true,
		inside: {
			punctuation: /(\.|\\)/
		}
	},
	'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(true|false)\b/,
	'function': /[a-z0-9_]+(?=\()/i,
	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
	'number': /\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
		lookbehind: true,
		greedy: true
	}
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\\\|\\?[^\\])*?`/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /\$\{[^}]+\}/,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript,
			alias: 'language-javascript'
		}
	});
}

Prism.languages.js = Prism.languages.javascript;

/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	self.Prism.fileHighlight = function() {

		var Extensions = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		if(Array.prototype.forEach) { // Check to prevent error in IE8
			Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
				var src = pre.getAttribute('data-src');

				var language, parent = pre;
				var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;
				while (parent && !lang.test(parent.className)) {
					parent = parent.parentNode;
				}

				if (parent) {
					language = (pre.className.match(lang) || [, ''])[1];
				}

				if (!language) {
					var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
					language = Extensions[extension] || extension;
				}

				var code = document.createElement('code');
				code.className = 'language-' + language;

				pre.textContent = '';

				code.textContent = 'Loading…';

				pre.appendChild(code);

				var xhr = new XMLHttpRequest();

				xhr.open('GET', src, true);

				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {

						if (xhr.status < 400 && xhr.responseText) {
							code.textContent = xhr.responseText;

							Prism.highlightElement(code);
						}
						else if (xhr.status >= 400) {
							code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
						}
						else {
							code.textContent = '✖ Error: File does not exist or is empty';
						}
					}
				};

				xhr.send(null);
			});
		}

	};

	document.addEventListener('DOMContentLoaded', self.Prism.fileHighlight);

})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],11:[function(require,module,exports){
(function (global){
'use strict';

require('./vendors');

// JS Docs
if (typeof global.BasUIDocs === "undefined") {
    window.BasUIDocs = global.BasUIDocs = {};
    BasUIDocs.site = {};
} // Import Vendors Dependencies


$(document).ready(function () {

    // Create File Upload Drop
    var _dropzone = BasUI.Forms.fileUploadDrop('.bas-ui-file-upload-drop-zone', {
        url: 'http://localhost:8888/upload/',
        defaultImageThumbnail: "/assets/img/files/empty.png"
    });

    if (_dropzone) {
        // File Upload Drop - Events
        _dropzone.on("addedfile", function (file) {
            console.log(file);
        });
    }

    // Toast
    if (toastr) {
        $('.doc-toast-success-trigger').on("click", function (e) {
            BasUI.Toast.success('Are you the 6 fingered man?', 'Success');
        });
        $('.doc-toast-info-trigger').on("click", function (e) {
            BasUI.Toast.info('Are you the 6 fingered man?', 'Info');
        });
        $('.doc-toast-warning-trigger').on("click", function (e) {
            BasUI.Toast.warning('Are you the 6 fingered man?', 'Warning');
        });
        $('.doc-toast-error-trigger').on("click", function (e) {
            BasUI.Toast.error('Are you the 6 fingered man?', 'Error');
        });
        $('.doc-toast-clear-trigger').on("click", function (e) {
            BasUI.Toast.clear();
        });
        $('.doc-toast-remove-trigger').on("click", function (e) {
            BasUI.Toast.remove();
        });
    }

    // Validate form (Test 1)
    var _val_form_test1 = $('#form-validation-test1');
    var _val_form_test1_submit = $('#form-validation-test1-submit');
    if (_val_form_test1.length) {
        BasUI.Forms.addFormForSubmitValidate(_val_form_test1);
        _val_form_test1_submit.on('click', function (e) {
            _val_form_test1.submit();
        });
        _val_form_test1.submit(function (event) {
            event.preventDefault();

            // Check one field
            var result1 = BasUI.Forms.validateField($('#username-test1'));
            console.log(result1);

            // Check all form
            var result2 = BasUI.Forms.validateForm($('#form-validation-test1'));
            console.log(result2);

            //this.submit(); // If all the validations succeeded

            if (result2 === true) {
                this.reset();
            }
        });
    }

    // Autocomplete
    var autocomplete_minChars = 2;
    var autocomplete_countries = BasUIDocs.site.countries_v_d();

    // Autocomplete -> Top search
    $('#doc-bas-ui-top-search-autocomplete' + ' input').autocomplete({
        lookup: autocomplete_countries,
        appendTo: '#doc-bas-ui-top-search-autocomplete',
        groupBy: '',
        minChars: autocomplete_minChars,
        onSelect: function onSelect(suggestion) {
            console.log('You selected: ' + suggestion.value + ', ' + suggestion.data);
        }
    });

    // Autocomplete -> Side nav -> search
    $('#doc-bas-ui-side-nav-search-autocomplete' + ' input').autocomplete({
        lookup: autocomplete_countries,
        appendTo: '#doc-bas-ui-side-nav-search-autocomplete',
        groupBy: '',
        minChars: autocomplete_minChars,
        onSelect: function onSelect(suggestion) {
            console.log('You selected: ' + suggestion.value + ', ' + suggestion.data);
        }
    });

    // Autocomplete -> search
    $('#doc-bas-ui-search-autocomplete' + ' input').autocomplete({
        lookup: autocomplete_countries,
        appendTo: '#doc-bas-ui-search-autocomplete',
        groupBy: '',
        minChars: autocomplete_minChars,
        onSelect: function onSelect(suggestion) {
            console.log('You selected: ' + suggestion.value + ', ' + suggestion.data);
        }
    });

    // Autocomplete -> search expandable
    $('#doc-bas-ui-search-expandable-autocomplete' + ' input').autocomplete({
        lookup: autocomplete_countries,
        appendTo: '#doc-bas-ui-search-expandable-autocomplete',
        groupBy: '',
        minChars: autocomplete_minChars,
        onSelect: function onSelect(suggestion) {
            console.log('You selected: ' + suggestion.value + ', ' + suggestion.data);
        }
    });

    // Autocomplete -> input
    $('#doc-text-autocomplete' + ' input').autocomplete({
        lookup: autocomplete_countries,
        appendTo: '#doc-text-autocomplete',
        groupBy: '',
        minChars: autocomplete_minChars,
        onSelect: function onSelect(suggestion) {
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

    var _download_in_git_hub = $('.download-in-git-hub');
    var _download_in_git_hub_href = $('.download-in-git-hub-href');
    if (_download_in_git_hub.length) {
        $.ajax({
            url: "https://api.github.com/repos/Basgrani-Org/bas-material-ui/tags",
            dataType: "json",
            success: function success(data) {
                if (data.length === 0) {
                    return;
                }
                _download_in_git_hub.html('<i class="mdi mdi-download icon icon-right icon-18"></i> Download ' + data[0].name).attr('href', data[0].zipball_url);
                _download_in_git_hub_href.attr('href', data[0].zipball_url);
            }
        });
    }
    var _last_commit_in_git_hub = $('.last-commit-in-git-hub');
    if (_last_commit_in_git_hub.length) {
        $.ajax({
            url: "https://api.github.com/repos/Basgrani-Org/bas-material-ui/commits/master",
            dataType: "json",
            success: function success(data) {
                if (data === undefined) {
                    return;
                }
                var date = $.timeago(data.commit.author.date);
                _last_commit_in_git_hub.html(date).attr('href', data.html_url);
            }
        });
    }
};

// Scroll if anchor
BasUIDocs.site.scroll_if_anchor = function (href) {
    href = typeof href === "string" ? href : $(this).attr("href");
    var fromTop = 160;

    if (href.indexOf("#") === 0) {
        var $target = $(href);

        if ($target.length) {
            $('html, body').animate({ scrollTop: $target.offset().top - fromTop }, 1000);
            if (history && "pushState" in history) {
                history.pushState({}, document.title, window.location.pathname + href);
                return false;
            }
        }
    }
};

// Get countries (value, data)
BasUIDocs.site.countries_v_d = function () {
    var _obj = [];
    $.map(BasUIDocs.site.countries, function (val, key) {
        _obj.push({ value: val, data: key });
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./vendors":12}],12:[function(require,module,exports){
'use strict';

require('./../../../../bower_components/jquery-timeago/jquery.timeago');

require('./../../../../bower_components/prism/prism');

require('./../../../../bower_components/prism/components/prism-php');

require('./../../../../bower_components/prism/components/prism-git');

require('./../../../../bower_components/prism/components/prism-bash');

require('./../../../../bower_components/prism/components/prism-http');

require('./../../../../bower_components/prism/components/prism-javascript');

require('./../../../../bower_components/prism/components/prism-markdown');

require('./../../../../bower_components/prism/components/prism-css');

require('./../../../../bower_components/prism/components/prism-scss');

},{"./../../../../bower_components/jquery-timeago/jquery.timeago":1,"./../../../../bower_components/prism/components/prism-bash":2,"./../../../../bower_components/prism/components/prism-css":3,"./../../../../bower_components/prism/components/prism-git":4,"./../../../../bower_components/prism/components/prism-http":5,"./../../../../bower_components/prism/components/prism-javascript":6,"./../../../../bower_components/prism/components/prism-markdown":7,"./../../../../bower_components/prism/components/prism-php":8,"./../../../../bower_components/prism/components/prism-scss":9,"./../../../../bower_components/prism/prism":10}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL2pxdWVyeS10aW1lYWdvL2pxdWVyeS50aW1lYWdvLmpzIiwiYm93ZXJfY29tcG9uZW50cy9wcmlzbS9jb21wb25lbnRzL3ByaXNtLWJhc2guanMiLCJib3dlcl9jb21wb25lbnRzL3ByaXNtL2NvbXBvbmVudHMvcHJpc20tY3NzLmpzIiwiYm93ZXJfY29tcG9uZW50cy9wcmlzbS9jb21wb25lbnRzL3ByaXNtLWdpdC5qcyIsImJvd2VyX2NvbXBvbmVudHMvcHJpc20vY29tcG9uZW50cy9wcmlzbS1odHRwLmpzIiwiYm93ZXJfY29tcG9uZW50cy9wcmlzbS9jb21wb25lbnRzL3ByaXNtLWphdmFzY3JpcHQuanMiLCJib3dlcl9jb21wb25lbnRzL3ByaXNtL2NvbXBvbmVudHMvcHJpc20tbWFya2Rvd24uanMiLCJib3dlcl9jb21wb25lbnRzL3ByaXNtL2NvbXBvbmVudHMvcHJpc20tcGhwLmpzIiwiYm93ZXJfY29tcG9uZW50cy9wcmlzbS9jb21wb25lbnRzL3ByaXNtLXNjc3MuanMiLCJib3dlcl9jb21wb25lbnRzL3ByaXNtL3ByaXNtLmpzIiwiZG9jc19zcmMvanMvZGlzdC9hcHAuanMiLCJkb2NzX3NyYy9qcy9kaXN0L3ZlbmRvcnMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM3d0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogVGltZWFnbyBpcyBhIGpRdWVyeSBwbHVnaW4gdGhhdCBtYWtlcyBpdCBlYXN5IHRvIHN1cHBvcnQgYXV0b21hdGljYWxseVxuICogdXBkYXRpbmcgZnV6enkgdGltZXN0YW1wcyAoZS5nLiBcIjQgbWludXRlcyBhZ29cIiBvciBcImFib3V0IDEgZGF5IGFnb1wiKS5cbiAqXG4gKiBAbmFtZSB0aW1lYWdvXG4gKiBAdmVyc2lvbiAxLjUuNFxuICogQHJlcXVpcmVzIGpRdWVyeSB2MS4yLjMrXG4gKiBAYXV0aG9yIFJ5YW4gTWNHZWFyeVxuICogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgLSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEZvciB1c2FnZSBhbmQgZXhhbXBsZXMsIHZpc2l0OlxuICogaHR0cDovL3RpbWVhZ28ueWFycC5jb20vXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDA4LTIwMTcsIFJ5YW4gTWNHZWFyeSAocnlhbiAtW2F0XS0gbWNnZWFyeSBbKmRvdCpdIG9yZylcbiAqL1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIGZhY3RvcnkoKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZmFjdG9yeShqUXVlcnkpO1xuICB9XG59KGZ1bmN0aW9uICgkKSB7XG4gICQudGltZWFnbyA9IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICAgIGlmICh0aW1lc3RhbXAgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICByZXR1cm4gaW5Xb3Jkcyh0aW1lc3RhbXApO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRpbWVzdGFtcCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIGluV29yZHMoJC50aW1lYWdvLnBhcnNlKHRpbWVzdGFtcCkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRpbWVzdGFtcCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIGluV29yZHMobmV3IERhdGUodGltZXN0YW1wKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbldvcmRzKCQudGltZWFnby5kYXRldGltZSh0aW1lc3RhbXApKTtcbiAgICB9XG4gIH07XG4gIHZhciAkdCA9ICQudGltZWFnbztcblxuICAkLmV4dGVuZCgkLnRpbWVhZ28sIHtcbiAgICBzZXR0aW5nczoge1xuICAgICAgcmVmcmVzaE1pbGxpczogNjAwMDAsXG4gICAgICBhbGxvd1Bhc3Q6IHRydWUsXG4gICAgICBhbGxvd0Z1dHVyZTogZmFsc2UsXG4gICAgICBsb2NhbGVUaXRsZTogZmFsc2UsXG4gICAgICBjdXRvZmY6IDAsXG4gICAgICBhdXRvRGlzcG9zZTogdHJ1ZSxcbiAgICAgIHN0cmluZ3M6IHtcbiAgICAgICAgcHJlZml4QWdvOiBudWxsLFxuICAgICAgICBwcmVmaXhGcm9tTm93OiBudWxsLFxuICAgICAgICBzdWZmaXhBZ286IFwiYWdvXCIsXG4gICAgICAgIHN1ZmZpeEZyb21Ob3c6IFwiZnJvbSBub3dcIixcbiAgICAgICAgaW5QYXN0OiAnYW55IG1vbWVudCBub3cnLFxuICAgICAgICBzZWNvbmRzOiBcImxlc3MgdGhhbiBhIG1pbnV0ZVwiLFxuICAgICAgICBtaW51dGU6IFwiYWJvdXQgYSBtaW51dGVcIixcbiAgICAgICAgbWludXRlczogXCIlZCBtaW51dGVzXCIsXG4gICAgICAgIGhvdXI6IFwiYWJvdXQgYW4gaG91clwiLFxuICAgICAgICBob3VyczogXCJhYm91dCAlZCBob3Vyc1wiLFxuICAgICAgICBkYXk6IFwiYSBkYXlcIixcbiAgICAgICAgZGF5czogXCIlZCBkYXlzXCIsXG4gICAgICAgIG1vbnRoOiBcImFib3V0IGEgbW9udGhcIixcbiAgICAgICAgbW9udGhzOiBcIiVkIG1vbnRoc1wiLFxuICAgICAgICB5ZWFyOiBcImFib3V0IGEgeWVhclwiLFxuICAgICAgICB5ZWFyczogXCIlZCB5ZWFyc1wiLFxuICAgICAgICB3b3JkU2VwYXJhdG9yOiBcIiBcIixcbiAgICAgICAgbnVtYmVyczogW11cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5Xb3JkczogZnVuY3Rpb24oZGlzdGFuY2VNaWxsaXMpIHtcbiAgICAgIGlmICghdGhpcy5zZXR0aW5ncy5hbGxvd1Bhc3QgJiYgISB0aGlzLnNldHRpbmdzLmFsbG93RnV0dXJlKSB7XG4gICAgICAgICAgdGhyb3cgJ3RpbWVhZ28gYWxsb3dQYXN0IGFuZCBhbGxvd0Z1dHVyZSBzZXR0aW5ncyBjYW4gbm90IGJvdGggYmUgc2V0IHRvIGZhbHNlLic7XG4gICAgICB9XG5cbiAgICAgIHZhciAkbCA9IHRoaXMuc2V0dGluZ3Muc3RyaW5ncztcbiAgICAgIHZhciBwcmVmaXggPSAkbC5wcmVmaXhBZ287XG4gICAgICB2YXIgc3VmZml4ID0gJGwuc3VmZml4QWdvO1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuYWxsb3dGdXR1cmUpIHtcbiAgICAgICAgaWYgKGRpc3RhbmNlTWlsbGlzIDwgMCkge1xuICAgICAgICAgIHByZWZpeCA9ICRsLnByZWZpeEZyb21Ob3c7XG4gICAgICAgICAgc3VmZml4ID0gJGwuc3VmZml4RnJvbU5vdztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc2V0dGluZ3MuYWxsb3dQYXN0ICYmIGRpc3RhbmNlTWlsbGlzID49IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ3Muc3RyaW5ncy5pblBhc3Q7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWNvbmRzID0gTWF0aC5hYnMoZGlzdGFuY2VNaWxsaXMpIC8gMTAwMDtcbiAgICAgIHZhciBtaW51dGVzID0gc2Vjb25kcyAvIDYwO1xuICAgICAgdmFyIGhvdXJzID0gbWludXRlcyAvIDYwO1xuICAgICAgdmFyIGRheXMgPSBob3VycyAvIDI0O1xuICAgICAgdmFyIHllYXJzID0gZGF5cyAvIDM2NTtcblxuICAgICAgZnVuY3Rpb24gc3Vic3RpdHV0ZShzdHJpbmdPckZ1bmN0aW9uLCBudW1iZXIpIHtcbiAgICAgICAgdmFyIHN0cmluZyA9ICQuaXNGdW5jdGlvbihzdHJpbmdPckZ1bmN0aW9uKSA/IHN0cmluZ09yRnVuY3Rpb24obnVtYmVyLCBkaXN0YW5jZU1pbGxpcykgOiBzdHJpbmdPckZ1bmN0aW9uO1xuICAgICAgICB2YXIgdmFsdWUgPSAoJGwubnVtYmVycyAmJiAkbC5udW1iZXJzW251bWJlcl0pIHx8IG51bWJlcjtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8lZC9pLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciB3b3JkcyA9IHNlY29uZHMgPCA0NSAmJiBzdWJzdGl0dXRlKCRsLnNlY29uZHMsIE1hdGgucm91bmQoc2Vjb25kcykpIHx8XG4gICAgICAgIHNlY29uZHMgPCA5MCAmJiBzdWJzdGl0dXRlKCRsLm1pbnV0ZSwgMSkgfHxcbiAgICAgICAgbWludXRlcyA8IDQ1ICYmIHN1YnN0aXR1dGUoJGwubWludXRlcywgTWF0aC5yb3VuZChtaW51dGVzKSkgfHxcbiAgICAgICAgbWludXRlcyA8IDkwICYmIHN1YnN0aXR1dGUoJGwuaG91ciwgMSkgfHxcbiAgICAgICAgaG91cnMgPCAyNCAmJiBzdWJzdGl0dXRlKCRsLmhvdXJzLCBNYXRoLnJvdW5kKGhvdXJzKSkgfHxcbiAgICAgICAgaG91cnMgPCA0MiAmJiBzdWJzdGl0dXRlKCRsLmRheSwgMSkgfHxcbiAgICAgICAgZGF5cyA8IDMwICYmIHN1YnN0aXR1dGUoJGwuZGF5cywgTWF0aC5yb3VuZChkYXlzKSkgfHxcbiAgICAgICAgZGF5cyA8IDQ1ICYmIHN1YnN0aXR1dGUoJGwubW9udGgsIDEpIHx8XG4gICAgICAgIGRheXMgPCAzNjUgJiYgc3Vic3RpdHV0ZSgkbC5tb250aHMsIE1hdGgucm91bmQoZGF5cyAvIDMwKSkgfHxcbiAgICAgICAgeWVhcnMgPCAxLjUgJiYgc3Vic3RpdHV0ZSgkbC55ZWFyLCAxKSB8fFxuICAgICAgICBzdWJzdGl0dXRlKCRsLnllYXJzLCBNYXRoLnJvdW5kKHllYXJzKSk7XG5cbiAgICAgIHZhciBzZXBhcmF0b3IgPSAkbC53b3JkU2VwYXJhdG9yIHx8IFwiXCI7XG4gICAgICBpZiAoJGwud29yZFNlcGFyYXRvciA9PT0gdW5kZWZpbmVkKSB7IHNlcGFyYXRvciA9IFwiIFwiOyB9XG4gICAgICByZXR1cm4gJC50cmltKFtwcmVmaXgsIHdvcmRzLCBzdWZmaXhdLmpvaW4oc2VwYXJhdG9yKSk7XG4gICAgfSxcblxuICAgIHBhcnNlOiBmdW5jdGlvbihpc284NjAxKSB7XG4gICAgICB2YXIgcyA9ICQudHJpbShpc284NjAxKTtcbiAgICAgIHMgPSBzLnJlcGxhY2UoL1xcLlxcZCsvLFwiXCIpOyAvLyByZW1vdmUgbWlsbGlzZWNvbmRzXG4gICAgICBzID0gcy5yZXBsYWNlKC8tLyxcIi9cIikucmVwbGFjZSgvLS8sXCIvXCIpO1xuICAgICAgcyA9IHMucmVwbGFjZSgvVC8sXCIgXCIpLnJlcGxhY2UoL1ovLFwiIFVUQ1wiKTtcbiAgICAgIHMgPSBzLnJlcGxhY2UoLyhbXFwrXFwtXVxcZFxcZClcXDo/KFxcZFxcZCkvLFwiICQxJDJcIik7IC8vIC0wNDowMCAtPiAtMDQwMFxuICAgICAgcyA9IHMucmVwbGFjZSgvKFtcXCtcXC1dXFxkXFxkKSQvLFwiICQxMDBcIik7IC8vICswOSAtPiArMDkwMFxuICAgICAgcmV0dXJuIG5ldyBEYXRlKHMpO1xuICAgIH0sXG4gICAgZGF0ZXRpbWU6IGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIHZhciBpc284NjAxID0gJHQuaXNUaW1lKGVsZW0pID8gJChlbGVtKS5hdHRyKFwiZGF0ZXRpbWVcIikgOiAkKGVsZW0pLmF0dHIoXCJ0aXRsZVwiKTtcbiAgICAgIHJldHVybiAkdC5wYXJzZShpc284NjAxKTtcbiAgICB9LFxuICAgIGlzVGltZTogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgLy8galF1ZXJ5J3MgYGlzKClgIGRvZXNuJ3QgcGxheSB3ZWxsIHdpdGggSFRNTDUgaW4gSUVcbiAgICAgIHJldHVybiAkKGVsZW0pLmdldCgwKS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwidGltZVwiOyAvLyAkKGVsZW0pLmlzKFwidGltZVwiKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGZ1bmN0aW9ucyB0aGF0IGNhbiBiZSBjYWxsZWQgdmlhICQoZWwpLnRpbWVhZ28oJ2FjdGlvbicpXG4gIC8vIGluaXQgaXMgZGVmYXVsdCB3aGVuIG5vIGFjdGlvbiBpcyBnaXZlblxuICAvLyBmdW5jdGlvbnMgYXJlIGNhbGxlZCB3aXRoIGNvbnRleHQgb2YgYSBzaW5nbGUgZWxlbWVudFxuICB2YXIgZnVuY3Rpb25zID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZnVuY3Rpb25zLmRpc3Bvc2UuY2FsbCh0aGlzKTtcbiAgICAgIHZhciByZWZyZXNoX2VsID0gJC5wcm94eShyZWZyZXNoLCB0aGlzKTtcbiAgICAgIHJlZnJlc2hfZWwoKTtcbiAgICAgIHZhciAkcyA9ICR0LnNldHRpbmdzO1xuICAgICAgaWYgKCRzLnJlZnJlc2hNaWxsaXMgPiAwKSB7XG4gICAgICAgIHRoaXMuX3RpbWVhZ29JbnRlcnZhbCA9IHNldEludGVydmFsKHJlZnJlc2hfZWwsICRzLnJlZnJlc2hNaWxsaXMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgICAgIHZhciBkYXRlID0gKHRpbWVzdGFtcCBpbnN0YW5jZW9mIERhdGUpID8gdGltZXN0YW1wIDogJHQucGFyc2UodGltZXN0YW1wKTtcbiAgICAgICQodGhpcykuZGF0YSgndGltZWFnbycsIHsgZGF0ZXRpbWU6IGRhdGUgfSk7XG4gICAgICBpZiAoJHQuc2V0dGluZ3MubG9jYWxlVGl0bGUpIHtcbiAgICAgICAgJCh0aGlzKS5hdHRyKFwidGl0bGVcIiwgZGF0ZS50b0xvY2FsZVN0cmluZygpKTtcbiAgICAgIH1cbiAgICAgIHJlZnJlc2guYXBwbHkodGhpcyk7XG4gICAgfSxcbiAgICB1cGRhdGVGcm9tRE9NOiBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcykuZGF0YSgndGltZWFnbycsIHsgZGF0ZXRpbWU6ICR0LnBhcnNlKCAkdC5pc1RpbWUodGhpcykgPyAkKHRoaXMpLmF0dHIoXCJkYXRldGltZVwiKSA6ICQodGhpcykuYXR0cihcInRpdGxlXCIpICkgfSk7XG4gICAgICByZWZyZXNoLmFwcGx5KHRoaXMpO1xuICAgIH0sXG4gICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuX3RpbWVhZ29JbnRlcnZhbCkge1xuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLl90aW1lYWdvSW50ZXJ2YWwpO1xuICAgICAgICB0aGlzLl90aW1lYWdvSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAkLmZuLnRpbWVhZ28gPSBmdW5jdGlvbihhY3Rpb24sIG9wdGlvbnMpIHtcbiAgICB2YXIgZm4gPSBhY3Rpb24gPyBmdW5jdGlvbnNbYWN0aW9uXSA6IGZ1bmN0aW9ucy5pbml0O1xuICAgIGlmICghZm4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gZnVuY3Rpb24gbmFtZSAnXCIrIGFjdGlvbiArXCInIGZvciB0aW1lYWdvXCIpO1xuICAgIH1cbiAgICAvLyBlYWNoIG92ZXIgb2JqZWN0cyBoZXJlIGFuZCBjYWxsIHRoZSByZXF1ZXN0ZWQgZnVuY3Rpb25cbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICBmbi5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlZnJlc2goKSB7XG4gICAgdmFyICRzID0gJHQuc2V0dGluZ3M7XG5cbiAgICAvL2NoZWNrIGlmIGl0J3Mgc3RpbGwgdmlzaWJsZVxuICAgIGlmICgkcy5hdXRvRGlzcG9zZSAmJiAhJC5jb250YWlucyhkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsdGhpcykpIHtcbiAgICAgIC8vc3RvcCBpZiBpdCBoYXMgYmVlbiByZW1vdmVkXG4gICAgICAkKHRoaXMpLnRpbWVhZ28oXCJkaXNwb3NlXCIpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSBwcmVwYXJlRGF0YSh0aGlzKTtcblxuICAgIGlmICghaXNOYU4oZGF0YS5kYXRldGltZSkpIHtcbiAgICAgIGlmICggJHMuY3V0b2ZmID09PSAwIHx8IE1hdGguYWJzKGRpc3RhbmNlKGRhdGEuZGF0ZXRpbWUpKSA8ICRzLmN1dG9mZikge1xuICAgICAgICAkKHRoaXMpLnRleHQoaW5Xb3JkcyhkYXRhLmRhdGV0aW1lKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoJCh0aGlzKS5hdHRyKCd0aXRsZScpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICQodGhpcykudGV4dCgkKHRoaXMpLmF0dHIoJ3RpdGxlJykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJlcGFyZURhdGEoZWxlbWVudCkge1xuICAgIGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgIGlmICghZWxlbWVudC5kYXRhKFwidGltZWFnb1wiKSkge1xuICAgICAgZWxlbWVudC5kYXRhKFwidGltZWFnb1wiLCB7IGRhdGV0aW1lOiAkdC5kYXRldGltZShlbGVtZW50KSB9KTtcbiAgICAgIHZhciB0ZXh0ID0gJC50cmltKGVsZW1lbnQudGV4dCgpKTtcbiAgICAgIGlmICgkdC5zZXR0aW5ncy5sb2NhbGVUaXRsZSkge1xuICAgICAgICBlbGVtZW50LmF0dHIoXCJ0aXRsZVwiLCBlbGVtZW50LmRhdGEoJ3RpbWVhZ28nKS5kYXRldGltZS50b0xvY2FsZVN0cmluZygpKTtcbiAgICAgIH0gZWxzZSBpZiAodGV4dC5sZW5ndGggPiAwICYmICEoJHQuaXNUaW1lKGVsZW1lbnQpICYmIGVsZW1lbnQuYXR0cihcInRpdGxlXCIpKSkge1xuICAgICAgICBlbGVtZW50LmF0dHIoXCJ0aXRsZVwiLCB0ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQuZGF0YShcInRpbWVhZ29cIik7XG4gIH1cblxuICBmdW5jdGlvbiBpbldvcmRzKGRhdGUpIHtcbiAgICByZXR1cm4gJHQuaW5Xb3JkcyhkaXN0YW5jZShkYXRlKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkaXN0YW5jZShkYXRlKSB7XG4gICAgcmV0dXJuIChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIGRhdGUuZ2V0VGltZSgpKTtcbiAgfVxuXG4gIC8vIGZpeCBmb3IgSUU2IHN1Y2thZ2VcbiAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFiYnJcIik7XG4gIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0aW1lXCIpO1xufSkpO1xuIiwiKGZ1bmN0aW9uKFByaXNtKSB7XG5cdHZhciBpbnNpZGVTdHJpbmcgPSB7XG5cdFx0dmFyaWFibGU6IFtcblx0XHRcdC8vIEFyaXRobWV0aWMgRW52aXJvbm1lbnRcblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybjogL1xcJD9cXChcXChbXFx3XFxXXSs/XFwpXFwpLyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYSAkIHNpZ24gYXQgdGhlIGJlZ2lubmluZyBoaWdobGlnaHQgJCgoIGFuZCApKSBhcyB2YXJpYWJsZVxuXHRcdFx0XHRcdHZhcmlhYmxlOiBbe1xuXHRcdFx0XHRcdFx0XHRwYXR0ZXJuOiAvKF5cXCRcXChcXChbXFx3XFxXXSspXFwpXFwpLyxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdC9eXFwkXFwoXFwoLyxcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdG51bWJlcjogL1xcYi0/KD86MHhbXFxkQS1GYS1mXSt8XFxkKlxcLj9cXGQrKD86W0VlXS0/XFxkKyk/KVxcYi8sXG5cdFx0XHRcdFx0Ly8gT3BlcmF0b3JzIGFjY29yZGluZyB0byBodHRwczovL3d3dy5nbnUub3JnL3NvZnR3YXJlL2Jhc2gvbWFudWFsL2Jhc2hyZWYuaHRtbCNTaGVsbC1Bcml0aG1ldGljXG5cdFx0XHRcdFx0b3BlcmF0b3I6IC8tLT98LT18XFwrXFwrP3xcXCs9fCE9P3x+fFxcKlxcKj98XFwqPXxcXC89P3wlPT98PDw9P3w+Pj0/fDw9P3w+PT98PT0/fCYmP3wmPXxcXF49P3xcXHxcXHw/fFxcfD18XFw/fDovLFxuXHRcdFx0XHRcdC8vIElmIHRoZXJlIGlzIG5vICQgc2lnbiBhdCB0aGUgYmVnaW5uaW5nIGhpZ2hsaWdodCAoKCBhbmQgKSkgYXMgcHVuY3R1YXRpb25cblx0XHRcdFx0XHRwdW5jdHVhdGlvbjogL1xcKFxcKD98XFwpXFwpP3wsfDsvXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQvLyBDb21tYW5kIFN1YnN0aXR1dGlvblxuXHRcdFx0e1xuXHRcdFx0XHRwYXR0ZXJuOiAvXFwkXFwoW14pXStcXCl8YFteYF0rYC8sXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdHZhcmlhYmxlOiAvXlxcJFxcKHxeYHxcXCkkfGAkL1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0L1xcJCg/OlthLXowLTlfI1xcP1xcKiFAXSt8XFx7W159XStcXH0pL2lcblx0XHRdLFxuXHR9O1xuXG5cdFByaXNtLmxhbmd1YWdlcy5iYXNoID0ge1xuXHRcdCdzaGViYW5nJzoge1xuXHRcdFx0cGF0dGVybjogL14jIVxccypcXC9iaW5cXC9iYXNofF4jIVxccypcXC9iaW5cXC9zaC8sXG5cdFx0XHRhbGlhczogJ2ltcG9ydGFudCdcblx0XHR9LFxuXHRcdCdjb21tZW50Jzoge1xuXHRcdFx0cGF0dGVybjogLyhefFteXCJ7XFxcXF0pIy4qLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdCdzdHJpbmcnOiBbXG5cdFx0XHQvL1N1cHBvcnQgZm9yIEhlcmUtRG9jdW1lbnRzIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hlcmVfZG9jdW1lbnRcblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybjogLygoPzpefFtePF0pPDxcXHMqKSg/OlwifCcpPyhcXHcrPykoPzpcInwnKT9cXHMqXFxyP1xcbig/OltcXHNcXFNdKSo/XFxyP1xcblxcMi9nLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0XHRncmVlZHk6IHRydWUsXG5cdFx0XHRcdGluc2lkZTogaW5zaWRlU3RyaW5nXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRwYXR0ZXJuOiAvKFtcIiddKSg/OlxcXFxcXFxcfFxcXFw/W15cXFxcXSkqP1xcMS9nLFxuXHRcdFx0XHRncmVlZHk6IHRydWUsXG5cdFx0XHRcdGluc2lkZTogaW5zaWRlU3RyaW5nXG5cdFx0XHR9XG5cdFx0XSxcblx0XHQndmFyaWFibGUnOiBpbnNpZGVTdHJpbmcudmFyaWFibGUsXG5cdFx0Ly8gT3JpZ2luYWxseSBiYXNlZCBvbiBodHRwOi8vc3M2NC5jb20vYmFzaC9cblx0XHQnZnVuY3Rpb24nOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF58XFxzfDt8XFx8fCYpKD86YWxpYXN8YXByb3Bvc3xhcHQtZ2V0fGFwdGl0dWRlfGFzcGVsbHxhd2t8YmFzZW5hbWV8YmFzaHxiY3xiZ3xidWlsdGlufGJ6aXAyfGNhbHxjYXR8Y2R8Y2ZkaXNrfGNoZ3JwfGNobW9kfGNob3dufGNocm9vdHxjaGtjb25maWd8Y2tzdW18Y2xlYXJ8Y21wfGNvbW18Y29tbWFuZHxjcHxjcm9ufGNyb250YWJ8Y3NwbGl0fGN1dHxkYXRlfGRjfGRkfGRkcmVzY3VlfGRmfGRpZmZ8ZGlmZjN8ZGlnfGRpcnxkaXJjb2xvcnN8ZGlybmFtZXxkaXJzfGRtZXNnfGR1fGVncmVwfGVqZWN0fGVuYWJsZXxlbnZ8ZXRodG9vbHxldmFsfGV4ZWN8ZXhwYW5kfGV4cGVjdHxleHBvcnR8ZXhwcnxmZGZvcm1hdHxmZGlza3xmZ3xmZ3JlcHxmaWxlfGZpbmR8Zm10fGZvbGR8Zm9ybWF0fGZyZWV8ZnNja3xmdHB8ZnVzZXJ8Z2F3a3xnZXRvcHRzfGdpdHxncmVwfGdyb3VwYWRkfGdyb3VwZGVsfGdyb3VwbW9kfGdyb3Vwc3xnemlwfGhhc2h8aGVhZHxoZWxwfGhnfGhpc3Rvcnl8aG9zdG5hbWV8aHRvcHxpY29udnxpZHxpZmNvbmZpZ3xpZmRvd258aWZ1cHxpbXBvcnR8aW5zdGFsbHxqb2JzfGpvaW58a2lsbHxraWxsYWxsfGxlc3N8bGlua3xsbnxsb2NhdGV8bG9nbmFtZXxsb2dvdXR8bG9va3xscGN8bHByfGxwcmludHxscHJpbnRkfGxwcmludHF8bHBybXxsc3xsc29mfG1ha2V8bWFufG1rZGlyfG1rZmlmb3xta2lzb2ZzfG1rbm9kfG1vcmV8bW9zdHxtb3VudHxtdG9vbHN8bXRyfG12fG1tdnxuYW5vfG5ldHN0YXR8bmljZXxubHxub2h1cHxub3RpZnktc2VuZHxuc2xvb2t1cHxvcGVufG9wfHBhc3N3ZHxwYXN0ZXxwYXRoY2hrfHBpbmd8cGtpbGx8cG9wZHxwcnxwcmludGNhcHxwcmludGVudnxwcmludGZ8cHN8cHVzaGR8cHZ8cHdkfHF1b3RhfHF1b3RhY2hlY2t8cXVvdGFjdGx8cmFtfHJhcnxyY3B8cmVhZHxyZWFkYXJyYXl8cmVhZG9ubHl8cmVib290fHJlbmFtZXxyZW5pY2V8cmVtc3luY3xyZXZ8cm18cm1kaXJ8cnN5bmN8c2NyZWVufHNjcHxzZGlmZnxzZWR8c2VxfHNlcnZpY2V8c2Z0cHxzaGlmdHxzaG9wdHxzaHV0ZG93bnxzbGVlcHxzbG9jYXRlfHNvcnR8c291cmNlfHNwbGl0fHNzaHxzdGF0fHN0cmFjZXxzdXxzdWRvfHN1bXxzdXNwZW5kfHN5bmN8dGFpbHx0YXJ8dGVlfHRlc3R8dGltZXx0aW1lb3V0fHRpbWVzfHRvdWNofHRvcHx0cmFjZXJvdXRlfHRyYXB8dHJ8dHNvcnR8dHR5fHR5cGV8dWxpbWl0fHVtYXNrfHVtb3VudHx1bmFsaWFzfHVuYW1lfHVuZXhwYW5kfHVuaXF8dW5pdHN8dW5yYXJ8dW5zaGFyfHVwdGltZXx1c2VyYWRkfHVzZXJkZWx8dXNlcm1vZHx1c2Vyc3x1dWVuY29kZXx1dWRlY29kZXx2fHZkaXJ8dml8dm1zdGF0fHdhaXR8d2F0Y2h8d2N8d2dldHx3aGVyZWlzfHdoaWNofHdob3x3aG9hbWl8d3JpdGV8eGFyZ3N8eGRnLW9wZW58eWVzfHppcCkoPz0kfFxcc3w7fFxcfHwmKS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHQna2V5d29yZCc6IHtcblx0XHRcdHBhdHRlcm46IC8oXnxcXHN8O3xcXHx8JikoPzpsZXR8OnxcXC58aWZ8dGhlbnxlbHNlfGVsaWZ8Zml8Zm9yfGJyZWFrfGNvbnRpbnVlfHdoaWxlfGlufGNhc2V8ZnVuY3Rpb258c2VsZWN0fGRvfGRvbmV8dW50aWx8ZWNob3xleGl0fHJldHVybnxzZXR8ZGVjbGFyZSkoPz0kfFxcc3w7fFxcfHwmKS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHQnYm9vbGVhbic6IHtcblx0XHRcdHBhdHRlcm46IC8oXnxcXHN8O3xcXHx8JikoPzp0cnVlfGZhbHNlKSg/PSR8XFxzfDt8XFx8fCYpLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdCdvcGVyYXRvcic6IC8mJj98XFx8XFx8P3w9PT98IT0/fDw8PD98Pj58PD0/fD49P3w9fi8sXG5cdFx0J3B1bmN0dWF0aW9uJzogL1xcJD9cXChcXCg/fFxcKVxcKT98XFwuXFwufFt7fVtcXF07XS9cblx0fTtcblxuXHR2YXIgaW5zaWRlID0gaW5zaWRlU3RyaW5nLnZhcmlhYmxlWzFdLmluc2lkZTtcblx0aW5zaWRlWydmdW5jdGlvbiddID0gUHJpc20ubGFuZ3VhZ2VzLmJhc2hbJ2Z1bmN0aW9uJ107XG5cdGluc2lkZS5rZXl3b3JkID0gUHJpc20ubGFuZ3VhZ2VzLmJhc2gua2V5d29yZDtcblx0aW5zaWRlLmJvb2xlYW4gPSBQcmlzbS5sYW5ndWFnZXMuYmFzaC5ib29sZWFuO1xuXHRpbnNpZGUub3BlcmF0b3IgPSBQcmlzbS5sYW5ndWFnZXMuYmFzaC5vcGVyYXRvcjtcblx0aW5zaWRlLnB1bmN0dWF0aW9uID0gUHJpc20ubGFuZ3VhZ2VzLmJhc2gucHVuY3R1YXRpb247XG59KShQcmlzbSk7IiwiUHJpc20ubGFuZ3VhZ2VzLmNzcyA9IHtcblx0J2NvbW1lbnQnOiAvXFwvXFwqW1xcd1xcV10qP1xcKlxcLy8sXG5cdCdhdHJ1bGUnOiB7XG5cdFx0cGF0dGVybjogL0BbXFx3LV0rPy4qPyg7fCg/PVxccypcXHspKS9pLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3J1bGUnOiAvQFtcXHctXSsvXG5cdFx0XHQvLyBTZWUgcmVzdCBiZWxvd1xuXHRcdH1cblx0fSxcblx0J3VybCc6IC91cmxcXCgoPzooW1wiJ10pKFxcXFwoPzpcXHJcXG58W1xcd1xcV10pfCg/IVxcMSlbXlxcXFxcXHJcXG5dKSpcXDF8Lio/KVxcKS9pLFxuXHQnc2VsZWN0b3InOiAvW15cXHtcXH1cXHNdW15cXHtcXH07XSo/KD89XFxzKlxceykvLFxuXHQnc3RyaW5nJzogLyhcInwnKShcXFxcKD86XFxyXFxufFtcXHdcXFddKXwoPyFcXDEpW15cXFxcXFxyXFxuXSkqXFwxLyxcblx0J3Byb3BlcnR5JzogLyhcXGJ8XFxCKVtcXHctXSsoPz1cXHMqOikvaSxcblx0J2ltcG9ydGFudCc6IC9cXEIhaW1wb3J0YW50XFxiL2ksXG5cdCdmdW5jdGlvbic6IC9bLWEtejAtOV0rKD89XFwoKS9pLFxuXHQncHVuY3R1YXRpb24nOiAvWygpe307Ol0vXG59O1xuXG5QcmlzbS5sYW5ndWFnZXMuY3NzWydhdHJ1bGUnXS5pbnNpZGUucmVzdCA9IFByaXNtLnV0aWwuY2xvbmUoUHJpc20ubGFuZ3VhZ2VzLmNzcyk7XG5cbmlmIChQcmlzbS5sYW5ndWFnZXMubWFya3VwKSB7XG5cdFByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ21hcmt1cCcsICd0YWcnLCB7XG5cdFx0J3N0eWxlJzoge1xuXHRcdFx0cGF0dGVybjogLyg8c3R5bGVbXFx3XFxXXSo/PilbXFx3XFxXXSo/KD89PFxcL3N0eWxlPikvaSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5jc3MsXG5cdFx0XHRhbGlhczogJ2xhbmd1YWdlLWNzcydcblx0XHR9XG5cdH0pO1xuXHRcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnaW5zaWRlJywgJ2F0dHItdmFsdWUnLCB7XG5cdFx0J3N0eWxlLWF0dHInOiB7XG5cdFx0XHRwYXR0ZXJuOiAvXFxzKnN0eWxlPShcInwnKS4qP1xcMS9pLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdhdHRyLW5hbWUnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogL15cXHMqc3R5bGUvaSxcblx0XHRcdFx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXAudGFnLmluc2lkZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQncHVuY3R1YXRpb24nOiAvXlxccyo9XFxzKlsnXCJdfFsnXCJdXFxzKiQvLFxuXHRcdFx0XHQnYXR0ci12YWx1ZSc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvLisvaSxcblx0XHRcdFx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5jc3Ncblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGFsaWFzOiAnbGFuZ3VhZ2UtY3NzJ1xuXHRcdH1cblx0fSwgUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cC50YWcpO1xufSIsIlByaXNtLmxhbmd1YWdlcy5naXQgPSB7XG5cdC8qXG5cdCAqIEEgc2ltcGxlIG9uZSBsaW5lIGNvbW1lbnQgbGlrZSBpbiBhIGdpdCBzdGF0dXMgY29tbWFuZFxuXHQgKiBGb3IgaW5zdGFuY2U6XG5cdCAqICQgZ2l0IHN0YXR1c1xuXHQgKiAjIE9uIGJyYW5jaCBpbmZpbml0ZS1zY3JvbGxcblx0ICogIyBZb3VyIGJyYW5jaCBhbmQgJ29yaWdpbi9zaGFyZWRCcmFuY2hlcy9mcm9udGVuZFRlYW0vaW5maW5pdGUtc2Nyb2xsJyBoYXZlIGRpdmVyZ2VkLFxuXHQgKiAjIGFuZCBoYXZlIDEgYW5kIDIgZGlmZmVyZW50IGNvbW1pdHMgZWFjaCwgcmVzcGVjdGl2ZWx5LlxuXHQgKiBub3RoaW5nIHRvIGNvbW1pdCAod29ya2luZyBkaXJlY3RvcnkgY2xlYW4pXG5cdCAqL1xuXHQnY29tbWVudCc6IC9eIy4qL20sXG5cblx0Lypcblx0ICogUmVnZXhwIHRvIG1hdGNoIHRoZSBjaGFuZ2VkIGxpbmVzIGluIGEgZ2l0IGRpZmYgb3V0cHV0LiBDaGVjayB0aGUgZXhhbXBsZSBiZWxvdy5cblx0ICovXG5cdCdkZWxldGVkJzogL15bLeKAk10uKi9tLFxuXHQnaW5zZXJ0ZWQnOiAvXlxcKy4qL20sXG5cblx0Lypcblx0ICogYSBzdHJpbmcgKGRvdWJsZSBhbmQgc2ltcGxlIHF1b3RlKVxuXHQgKi9cblx0J3N0cmluZyc6IC8oXCJ8JykoXFxcXD8uKSo/XFwxL20sXG5cblx0Lypcblx0ICogYSBnaXQgY29tbWFuZC4gSXQgc3RhcnRzIHdpdGggYSByYW5kb20gcHJvbXB0IGZpbmlzaGluZyBieSBhICQsIHRoZW4gXCJnaXRcIiB0aGVuIHNvbWUgb3RoZXIgcGFyYW1ldGVyc1xuXHQgKiBGb3IgaW5zdGFuY2U6XG5cdCAqICQgZ2l0IGFkZCBmaWxlLnR4dFxuXHQgKi9cblx0J2NvbW1hbmQnOiB7XG5cdFx0cGF0dGVybjogL14uKlxcJCBnaXQgLiokL20sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQvKlxuXHRcdFx0ICogQSBnaXQgY29tbWFuZCBjYW4gY29udGFpbiBhIHBhcmFtZXRlciBzdGFydGluZyBieSBhIHNpbmdsZSBvciBhIGRvdWJsZSBkYXNoIGZvbGxvd2VkIGJ5IGEgc3RyaW5nXG5cdFx0XHQgKiBGb3IgaW5zdGFuY2U6XG5cdFx0XHQgKiAkIGdpdCBkaWZmIC0tY2FjaGVkXG5cdFx0XHQgKiAkIGdpdCBsb2cgLXBcblx0XHRcdCAqL1xuXHRcdFx0J3BhcmFtZXRlcic6IC9cXHMoLS18LSlcXHcrL21cblx0XHR9XG5cdH0sXG5cblx0Lypcblx0ICogQ29vcmRpbmF0ZXMgZGlzcGxheWVkIGluIGEgZ2l0IGRpZmYgY29tbWFuZFxuXHQgKiBGb3IgaW5zdGFuY2U6XG5cdCAqICQgZ2l0IGRpZmZcblx0ICogZGlmZiAtLWdpdCBmaWxlLnR4dCBmaWxlLnR4dFxuXHQgKiBpbmRleCA2MjE0OTUzLi4xZDU0YTUyIDEwMDY0NFxuXHQgKiAtLS0gZmlsZS50eHRcblx0ICogKysrIGZpbGUudHh0XG5cdCAqIEBAIC0xICsxLDIgQEBcblx0ICogLUhlcmUncyBteSB0ZXR4IGZpbGVcblx0ICogK0hlcmUncyBteSB0ZXh0IGZpbGVcblx0ICogK0FuZCB0aGlzIGlzIHRoZSBzZWNvbmQgbGluZVxuXHQgKi9cblx0J2Nvb3JkJzogL15AQC4qQEAkL20sXG5cblx0Lypcblx0ICogTWF0Y2ggYSBcImNvbW1pdCBbU0hBMV1cIiBsaW5lIGluIGEgZ2l0IGxvZyBvdXRwdXQuXG5cdCAqIEZvciBpbnN0YW5jZTpcblx0ICogJCBnaXQgbG9nXG5cdCAqIGNvbW1pdCBhMTFhMTRlZjdlMjZmMmNhNjJkNGIzNWVhYzQ1NWNlNjM2ZDBkYzA5XG5cdCAqIEF1dGhvcjogbGdpcmF1ZGVsXG5cdCAqIERhdGU6ICAgTW9uIEZlYiAxNyAxMToxODozNCAyMDE0ICswMTAwXG5cdCAqXG5cdCAqICAgICBBZGQgb2YgYSBuZXcgbGluZVxuXHQgKi9cblx0J2NvbW1pdF9zaGExJzogL15jb21taXQgXFx3ezQwfSQvbVxufTtcbiIsIlByaXNtLmxhbmd1YWdlcy5odHRwID0ge1xuXHQncmVxdWVzdC1saW5lJzoge1xuXHRcdHBhdHRlcm46IC9eKFBPU1R8R0VUfFBVVHxERUxFVEV8T1BUSU9OU3xQQVRDSHxUUkFDRXxDT05ORUNUKVxcYlxcc2h0dHBzPzpcXC9cXC9cXFMrXFxzSFRUUFxcL1swLTkuXSsvbSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdC8vIEhUVFAgVmVyYlxuXHRcdFx0cHJvcGVydHk6IC9eKFBPU1R8R0VUfFBVVHxERUxFVEV8T1BUSU9OU3xQQVRDSHxUUkFDRXxDT05ORUNUKVxcYi8sXG5cdFx0XHQvLyBQYXRoIG9yIHF1ZXJ5IGFyZ3VtZW50XG5cdFx0XHQnYXR0ci1uYW1lJzogLzpcXHcrL1xuXHRcdH1cblx0fSxcblx0J3Jlc3BvbnNlLXN0YXR1cyc6IHtcblx0XHRwYXR0ZXJuOiAvXkhUVFBcXC8xLlswMV0gWzAtOV0rLiovbSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdC8vIFN0YXR1cywgZS5nLiAyMDAgT0tcblx0XHRcdHByb3BlcnR5OiB7XG4gICAgICAgICAgICAgICAgcGF0dGVybjogLyheSFRUUFxcLzEuWzAxXSApWzAtOV0rLiovaSxcbiAgICAgICAgICAgICAgICBsb29rYmVoaW5kOiB0cnVlXG4gICAgICAgICAgICB9XG5cdFx0fVxuXHR9LFxuXHQvLyBIVFRQIGhlYWRlciBuYW1lXG5cdCdoZWFkZXItbmFtZSc6IHtcbiAgICAgICAgcGF0dGVybjogL15bXFx3LV0rOig/PS4pL20sXG4gICAgICAgIGFsaWFzOiAna2V5d29yZCdcbiAgICB9XG59O1xuXG4vLyBDcmVhdGUgYSBtYXBwaW5nIG9mIENvbnRlbnQtVHlwZSBoZWFkZXJzIHRvIGxhbmd1YWdlIGRlZmluaXRpb25zXG52YXIgaHR0cExhbmd1YWdlcyA9IHtcblx0J2FwcGxpY2F0aW9uL2pzb24nOiBQcmlzbS5sYW5ndWFnZXMuamF2YXNjcmlwdCxcblx0J2FwcGxpY2F0aW9uL3htbCc6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXAsXG5cdCd0ZXh0L3htbCc6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXAsXG5cdCd0ZXh0L2h0bWwnOiBQcmlzbS5sYW5ndWFnZXMubWFya3VwXG59O1xuXG4vLyBJbnNlcnQgZWFjaCBjb250ZW50IHR5cGUgcGFyc2VyIHRoYXQgaGFzIGl0cyBhc3NvY2lhdGVkIGxhbmd1YWdlXG4vLyBjdXJyZW50bHkgbG9hZGVkLlxuZm9yICh2YXIgY29udGVudFR5cGUgaW4gaHR0cExhbmd1YWdlcykge1xuXHRpZiAoaHR0cExhbmd1YWdlc1tjb250ZW50VHlwZV0pIHtcblx0XHR2YXIgb3B0aW9ucyA9IHt9O1xuXHRcdG9wdGlvbnNbY29udGVudFR5cGVdID0ge1xuXHRcdFx0cGF0dGVybjogbmV3IFJlZ0V4cCgnKGNvbnRlbnQtdHlwZTpcXFxccyonICsgY29udGVudFR5cGUgKyAnW1xcXFx3XFxcXFddKj8pKD86XFxcXHI/XFxcXG58XFxcXHIpezJ9W1xcXFx3XFxcXFddKicsICdpJyksXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdHJlc3Q6IGh0dHBMYW5ndWFnZXNbY29udGVudFR5cGVdXG5cdFx0XHR9XG5cdFx0fTtcblx0XHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdodHRwJywgJ2hlYWRlci1uYW1lJywgb3B0aW9ucyk7XG5cdH1cbn1cbiIsIlByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0ID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdrZXl3b3JkJzogL1xcYihhc3xhc3luY3xhd2FpdHxicmVha3xjYXNlfGNhdGNofGNsYXNzfGNvbnN0fGNvbnRpbnVlfGRlYnVnZ2VyfGRlZmF1bHR8ZGVsZXRlfGRvfGVsc2V8ZW51bXxleHBvcnR8ZXh0ZW5kc3xmaW5hbGx5fGZvcnxmcm9tfGZ1bmN0aW9ufGdldHxpZnxpbXBsZW1lbnRzfGltcG9ydHxpbnxpbnN0YW5jZW9mfGludGVyZmFjZXxsZXR8bmV3fG51bGx8b2Z8cGFja2FnZXxwcml2YXRlfHByb3RlY3RlZHxwdWJsaWN8cmV0dXJufHNldHxzdGF0aWN8c3VwZXJ8c3dpdGNofHRoaXN8dGhyb3d8dHJ5fHR5cGVvZnx2YXJ8dm9pZHx3aGlsZXx3aXRofHlpZWxkKVxcYi8sXG5cdCdudW1iZXInOiAvXFxiLT8oMHhbXFxkQS1GYS1mXSt8MGJbMDFdK3wwb1swLTddK3xcXGQqXFwuP1xcZCsoW0VlXVsrLV0/XFxkKyk/fE5hTnxJbmZpbml0eSlcXGIvLFxuXHQvLyBBbGxvdyBmb3IgYWxsIG5vbi1BU0NJSSBjaGFyYWN0ZXJzIChTZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjAwODQ0NClcblx0J2Z1bmN0aW9uJzogL1tfJGEtekEtWlxceEEwLVxcdUZGRkZdW18kYS16QS1aMC05XFx4QTAtXFx1RkZGRl0qKD89XFwoKS9pXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnamF2YXNjcmlwdCcsICdrZXl3b3JkJywge1xuXHQncmVnZXgnOiB7XG5cdFx0cGF0dGVybjogLyhefFteL10pXFwvKD8hXFwvKShcXFsuKz9dfFxcXFwufFteL1xcXFxcXHJcXG5dKStcXC9bZ2lteXVdezAsNX0oPz1cXHMqKCR8W1xcclxcbiwuO30pXSkpLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGdyZWVkeTogdHJ1ZVxuXHR9XG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnamF2YXNjcmlwdCcsICdzdHJpbmcnLCB7XG5cdCd0ZW1wbGF0ZS1zdHJpbmcnOiB7XG5cdFx0cGF0dGVybjogL2AoPzpcXFxcXFxcXHxcXFxcP1teXFxcXF0pKj9gLyxcblx0XHRncmVlZHk6IHRydWUsXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQnaW50ZXJwb2xhdGlvbic6IHtcblx0XHRcdFx0cGF0dGVybjogL1xcJFxce1tefV0rXFx9Lyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J2ludGVycG9sYXRpb24tcHVuY3R1YXRpb24nOiB7XG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiAvXlxcJFxce3xcXH0kLyxcblx0XHRcdFx0XHRcdGFsaWFzOiAncHVuY3R1YXRpb24nXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRyZXN0OiBQcmlzbS5sYW5ndWFnZXMuamF2YXNjcmlwdFxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J3N0cmluZyc6IC9bXFxzXFxTXSsvXG5cdFx0fVxuXHR9XG59KTtcblxuaWYgKFByaXNtLmxhbmd1YWdlcy5tYXJrdXApIHtcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnbWFya3VwJywgJ3RhZycsIHtcblx0XHQnc2NyaXB0Jzoge1xuXHRcdFx0cGF0dGVybjogLyg8c2NyaXB0W1xcd1xcV10qPz4pW1xcd1xcV10qPyg/PTxcXC9zY3JpcHQ+KS9pLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHQsXG5cdFx0XHRhbGlhczogJ2xhbmd1YWdlLWphdmFzY3JpcHQnXG5cdFx0fVxuXHR9KTtcbn1cblxuUHJpc20ubGFuZ3VhZ2VzLmpzID0gUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHQ7IiwiUHJpc20ubGFuZ3VhZ2VzLm1hcmtkb3duID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnbWFya3VwJywge30pO1xuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnbWFya2Rvd24nLCAncHJvbG9nJywge1xuXHQnYmxvY2txdW90ZSc6IHtcblx0XHQvLyA+IC4uLlxuXHRcdHBhdHRlcm46IC9ePig/OltcXHQgXSo+KSovbSxcblx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHR9LFxuXHQnY29kZSc6IFtcblx0XHR7XG5cdFx0XHQvLyBQcmVmaXhlZCBieSA0IHNwYWNlcyBvciAxIHRhYlxuXHRcdFx0cGF0dGVybjogL14oPzogezR9fFxcdCkuKy9tLFxuXHRcdFx0YWxpYXM6ICdrZXl3b3JkJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0Ly8gYGNvZGVgXG5cdFx0XHQvLyBgYGNvZGVgYFxuXHRcdFx0cGF0dGVybjogL2BgLis/YGB8YFteYFxcbl0rYC8sXG5cdFx0XHRhbGlhczogJ2tleXdvcmQnXG5cdFx0fVxuXHRdLFxuXHQndGl0bGUnOiBbXG5cdFx0e1xuXHRcdFx0Ly8gdGl0bGUgMVxuXHRcdFx0Ly8gPT09PT09PVxuXG5cdFx0XHQvLyB0aXRsZSAyXG5cdFx0XHQvLyAtLS0tLS0tXG5cdFx0XHRwYXR0ZXJuOiAvXFx3Ky4qKD86XFxyP1xcbnxcXHIpKD86PT0rfC0tKykvLFxuXHRcdFx0YWxpYXM6ICdpbXBvcnRhbnQnLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdHB1bmN0dWF0aW9uOiAvPT0rJHwtLSskL1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0Ly8gIyB0aXRsZSAxXG5cdFx0XHQvLyAjIyMjIyMgdGl0bGUgNlxuXHRcdFx0cGF0dGVybjogLyheXFxzKikjKy4rL20sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0YWxpYXM6ICdpbXBvcnRhbnQnLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdHB1bmN0dWF0aW9uOiAvXiMrfCMrJC9cblx0XHRcdH1cblx0XHR9XG5cdF0sXG5cdCdocic6IHtcblx0XHQvLyAqKipcblx0XHQvLyAtLS1cblx0XHQvLyAqICogKlxuXHRcdC8vIC0tLS0tLS0tLS0tXG5cdFx0cGF0dGVybjogLyheXFxzKikoWyotXSkoW1xcdCBdKlxcMil7Mix9KD89XFxzKiQpL20sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHR9LFxuXHQnbGlzdCc6IHtcblx0XHQvLyAqIGl0ZW1cblx0XHQvLyArIGl0ZW1cblx0XHQvLyAtIGl0ZW1cblx0XHQvLyAxLiBpdGVtXG5cdFx0cGF0dGVybjogLyheXFxzKikoPzpbKistXXxcXGQrXFwuKSg/PVtcXHQgXS4pL20sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHR9LFxuXHQndXJsLXJlZmVyZW5jZSc6IHtcblx0XHQvLyBbaWRdOiBodHRwOi8vZXhhbXBsZS5jb20gXCJPcHRpb25hbCB0aXRsZVwiXG5cdFx0Ly8gW2lkXTogaHR0cDovL2V4YW1wbGUuY29tICdPcHRpb25hbCB0aXRsZSdcblx0XHQvLyBbaWRdOiBodHRwOi8vZXhhbXBsZS5jb20gKE9wdGlvbmFsIHRpdGxlKVxuXHRcdC8vIFtpZF06IDxodHRwOi8vZXhhbXBsZS5jb20+IFwiT3B0aW9uYWwgdGl0bGVcIlxuXHRcdHBhdHRlcm46IC8hP1xcW1teXFxdXStcXF06W1xcdCBdKyg/OlxcUyt8PCg/OlxcXFwufFtePlxcXFxdKSs+KSg/OltcXHQgXSsoPzpcIig/OlxcXFwufFteXCJcXFxcXSkqXCJ8Jyg/OlxcXFwufFteJ1xcXFxdKSonfFxcKCg/OlxcXFwufFteKVxcXFxdKSpcXCkpKT8vLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3ZhcmlhYmxlJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvXighP1xcWylbXlxcXV0rLyxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdCdzdHJpbmcnOiAvKD86XCIoPzpcXFxcLnxbXlwiXFxcXF0pKlwifCcoPzpcXFxcLnxbXidcXFxcXSkqJ3xcXCgoPzpcXFxcLnxbXilcXFxcXSkqXFwpKSQvLFxuXHRcdFx0J3B1bmN0dWF0aW9uJzogL15bXFxbXFxdITpdfFs8Pl0vXG5cdFx0fSxcblx0XHRhbGlhczogJ3VybCdcblx0fSxcblx0J2JvbGQnOiB7XG5cdFx0Ly8gKipzdHJvbmcqKlxuXHRcdC8vIF9fc3Ryb25nX19cblxuXHRcdC8vIEFsbG93IG9ubHkgb25lIGxpbmUgYnJlYWtcblx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSkoXFwqXFwqfF9fKSg/Oig/Olxccj9cXG58XFxyKSg/IVxccj9cXG58XFxyKXwuKSs/XFwyLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3B1bmN0dWF0aW9uJzogL15cXCpcXCp8Xl9ffFxcKlxcKiR8X18kL1xuXHRcdH1cblx0fSxcblx0J2l0YWxpYyc6IHtcblx0XHQvLyAqZW0qXG5cdFx0Ly8gX2VtX1xuXG5cdFx0Ly8gQWxsb3cgb25seSBvbmUgbGluZSBicmVha1xuXHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKShbKl9dKSg/Oig/Olxccj9cXG58XFxyKSg/IVxccj9cXG58XFxyKXwuKSs/XFwyLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3B1bmN0dWF0aW9uJzogL15bKl9dfFsqX10kL1xuXHRcdH1cblx0fSxcblx0J3VybCc6IHtcblx0XHQvLyBbZXhhbXBsZV0oaHR0cDovL2V4YW1wbGUuY29tIFwiT3B0aW9uYWwgdGl0bGVcIilcblx0XHQvLyBbZXhhbXBsZV0gW2lkXVxuXHRcdHBhdHRlcm46IC8hP1xcW1teXFxdXStcXF0oPzpcXChbXlxccyldKyg/OltcXHQgXStcIig/OlxcXFwufFteXCJcXFxcXSkqXCIpP1xcKXwgP1xcW1teXFxdXFxuXSpcXF0pLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCd2YXJpYWJsZSc6IHtcblx0XHRcdFx0cGF0dGVybjogLyghP1xcWylbXlxcXV0rKD89XFxdJCkvLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0J3N0cmluZyc6IHtcblx0XHRcdFx0cGF0dGVybjogL1wiKD86XFxcXC58W15cIlxcXFxdKSpcIig/PVxcKSQpL1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5tYXJrZG93blsnYm9sZCddLmluc2lkZVsndXJsJ10gPSBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy5tYXJrZG93blsndXJsJ10pO1xuUHJpc20ubGFuZ3VhZ2VzLm1hcmtkb3duWydpdGFsaWMnXS5pbnNpZGVbJ3VybCddID0gUHJpc20udXRpbC5jbG9uZShQcmlzbS5sYW5ndWFnZXMubWFya2Rvd25bJ3VybCddKTtcblByaXNtLmxhbmd1YWdlcy5tYXJrZG93blsnYm9sZCddLmluc2lkZVsnaXRhbGljJ10gPSBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy5tYXJrZG93blsnaXRhbGljJ10pO1xuUHJpc20ubGFuZ3VhZ2VzLm1hcmtkb3duWydpdGFsaWMnXS5pbnNpZGVbJ2JvbGQnXSA9IFByaXNtLnV0aWwuY2xvbmUoUHJpc20ubGFuZ3VhZ2VzLm1hcmtkb3duWydib2xkJ10pOyIsIi8qKlxuICogT3JpZ2luYWwgYnkgQWFyb24gSGFydW46IGh0dHA6Ly9hYWhhY3JlYXRpdmUuY29tLzIwMTIvMDcvMzEvcGhwLXN5bnRheC1oaWdobGlnaHRpbmctcHJpc20vXG4gKiBNb2RpZmllZCBieSBNaWxlcyBKb2huc29uOiBodHRwOi8vbWlsZXNqLm1lXG4gKlxuICogU3VwcG9ydHMgdGhlIGZvbGxvd2luZzpcbiAqIFx0XHQtIEV4dGVuZHMgY2xpa2Ugc3ludGF4XG4gKiBcdFx0LSBTdXBwb3J0IGZvciBQSFAgNS4zKyAobmFtZXNwYWNlcywgdHJhaXRzLCBnZW5lcmF0b3JzLCBldGMpXG4gKiBcdFx0LSBTbWFydGVyIGNvbnN0YW50IGFuZCBmdW5jdGlvbiBtYXRjaGluZ1xuICpcbiAqIEFkZHMgdGhlIGZvbGxvd2luZyBuZXcgdG9rZW4gY2xhc3NlczpcbiAqIFx0XHRjb25zdGFudCwgZGVsaW1pdGVyLCB2YXJpYWJsZSwgZnVuY3Rpb24sIHBhY2thZ2VcbiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMucGhwID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdrZXl3b3JkJzogL1xcYihhbmR8b3J8eG9yfGFycmF5fGFzfGJyZWFrfGNhc2V8Y2Z1bmN0aW9ufGNsYXNzfGNvbnN0fGNvbnRpbnVlfGRlY2xhcmV8ZGVmYXVsdHxkaWV8ZG98ZWxzZXxlbHNlaWZ8ZW5kZGVjbGFyZXxlbmRmb3J8ZW5kZm9yZWFjaHxlbmRpZnxlbmRzd2l0Y2h8ZW5kd2hpbGV8ZXh0ZW5kc3xmb3J8Zm9yZWFjaHxmdW5jdGlvbnxpbmNsdWRlfGluY2x1ZGVfb25jZXxnbG9iYWx8aWZ8bmV3fHJldHVybnxzdGF0aWN8c3dpdGNofHVzZXxyZXF1aXJlfHJlcXVpcmVfb25jZXx2YXJ8d2hpbGV8YWJzdHJhY3R8aW50ZXJmYWNlfHB1YmxpY3xpbXBsZW1lbnRzfHByaXZhdGV8cHJvdGVjdGVkfHBhcmVudHx0aHJvd3xudWxsfGVjaG98cHJpbnR8dHJhaXR8bmFtZXNwYWNlfGZpbmFsfHlpZWxkfGdvdG98aW5zdGFuY2VvZnxmaW5hbGx5fHRyeXxjYXRjaClcXGIvaSxcblx0J2NvbnN0YW50JzogL1xcYltBLVowLTlfXXsyLH1cXGIvLFxuXHQnY29tbWVudCc6IHtcblx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSkoPzpcXC9cXCpbXFx3XFxXXSo/XFwqXFwvfFxcL1xcLy4qKS8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9XG59KTtcblxuLy8gU2hlbGwtbGlrZSBjb21tZW50cyBhcmUgbWF0Y2hlZCBhZnRlciBzdHJpbmdzLCBiZWNhdXNlIHRoZXkgYXJlIGxlc3Ncbi8vIGNvbW1vbiB0aGFuIHN0cmluZ3MgY29udGFpbmluZyBoYXNoZXMuLi5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3BocCcsICdjbGFzcy1uYW1lJywge1xuXHQnc2hlbGwtY29tbWVudCc6IHtcblx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSkjLiovLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0YWxpYXM6ICdjb21tZW50J1xuXHR9XG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgncGhwJywgJ2tleXdvcmQnLCB7XG5cdCdkZWxpbWl0ZXInOiAvXFw/Pnw8XFw/KD86cGhwKT8vaSxcblx0J3ZhcmlhYmxlJzogL1xcJFxcdytcXGIvaSxcblx0J3BhY2thZ2UnOiB7XG5cdFx0cGF0dGVybjogLyhcXFxcfG5hbWVzcGFjZVxccyt8dXNlXFxzKylbXFx3XFxcXF0rLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0cHVuY3R1YXRpb246IC9cXFxcL1xuXHRcdH1cblx0fVxufSk7XG5cbi8vIE11c3QgYmUgZGVmaW5lZCBhZnRlciB0aGUgZnVuY3Rpb24gcGF0dGVyblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgncGhwJywgJ29wZXJhdG9yJywge1xuXHQncHJvcGVydHknOiB7XG5cdFx0cGF0dGVybjogLygtPilbXFx3XSsvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxufSk7XG5cbi8vIEFkZCBIVE1MIHN1cHBvcnQgb2YgdGhlIG1hcmt1cCBsYW5ndWFnZSBleGlzdHNcbmlmIChQcmlzbS5sYW5ndWFnZXMubWFya3VwKSB7XG5cblx0Ly8gVG9rZW5pemUgYWxsIGlubGluZSBQSFAgYmxvY2tzIHRoYXQgYXJlIHdyYXBwZWQgaW4gPD9waHAgPz5cblx0Ly8gVGhpcyBhbGxvd3MgZm9yIGVhc3kgUEhQICsgbWFya3VwIGhpZ2hsaWdodGluZ1xuXHRQcmlzbS5ob29rcy5hZGQoJ2JlZm9yZS1oaWdobGlnaHQnLCBmdW5jdGlvbihlbnYpIHtcblx0XHRpZiAoZW52Lmxhbmd1YWdlICE9PSAncGhwJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGVudi50b2tlblN0YWNrID0gW107XG5cblx0XHRlbnYuYmFja3VwQ29kZSA9IGVudi5jb2RlO1xuXHRcdGVudi5jb2RlID0gZW52LmNvZGUucmVwbGFjZSgvKD86PFxcP3BocHw8XFw/KVtcXHdcXFddKj8oPzpcXD8+KS9pZywgZnVuY3Rpb24obWF0Y2gpIHtcblx0XHRcdGVudi50b2tlblN0YWNrLnB1c2gobWF0Y2gpO1xuXG5cdFx0XHRyZXR1cm4gJ3t7e1BIUCcgKyBlbnYudG9rZW5TdGFjay5sZW5ndGggKyAnfX19Jztcblx0XHR9KTtcblx0fSk7XG5cblx0Ly8gUmVzdG9yZSBlbnYuY29kZSBmb3Igb3RoZXIgcGx1Z2lucyAoZS5nLiBsaW5lLW51bWJlcnMpXG5cdFByaXNtLmhvb2tzLmFkZCgnYmVmb3JlLWluc2VydCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgPT09ICdwaHAnKSB7XG5cdFx0XHRlbnYuY29kZSA9IGVudi5iYWNrdXBDb2RlO1xuXHRcdFx0ZGVsZXRlIGVudi5iYWNrdXBDb2RlO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gUmUtaW5zZXJ0IHRoZSB0b2tlbnMgYWZ0ZXIgaGlnaGxpZ2h0aW5nXG5cdFByaXNtLmhvb2tzLmFkZCgnYWZ0ZXItaGlnaGxpZ2h0JywgZnVuY3Rpb24oZW52KSB7XG5cdFx0aWYgKGVudi5sYW5ndWFnZSAhPT0gJ3BocCcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMCwgdDsgdCA9IGVudi50b2tlblN0YWNrW2ldOyBpKyspIHtcblx0XHRcdC8vIFRoZSByZXBsYWNlIHByZXZlbnRzICQkLCAkJiwgJGAsICQnLCAkbiwgJG5uIGZyb20gYmVpbmcgaW50ZXJwcmV0ZWQgYXMgc3BlY2lhbCBwYXR0ZXJuc1xuXHRcdFx0ZW52LmhpZ2hsaWdodGVkQ29kZSA9IGVudi5oaWdobGlnaHRlZENvZGUucmVwbGFjZSgne3t7UEhQJyArIChpICsgMSkgKyAnfX19JywgUHJpc20uaGlnaGxpZ2h0KHQsIGVudi5ncmFtbWFyLCAncGhwJykucmVwbGFjZSgvXFwkL2csICckJCQkJykpO1xuXHRcdH1cblxuXHRcdGVudi5lbGVtZW50LmlubmVySFRNTCA9IGVudi5oaWdobGlnaHRlZENvZGU7XG5cdH0pO1xuXG5cdC8vIFdyYXAgdG9rZW5zIGluIGNsYXNzZXMgdGhhdCBhcmUgbWlzc2luZyB0aGVtXG5cdFByaXNtLmhvb2tzLmFkZCgnd3JhcCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgPT09ICdwaHAnICYmIGVudi50eXBlID09PSAnbWFya3VwJykge1xuXHRcdFx0ZW52LmNvbnRlbnQgPSBlbnYuY29udGVudC5yZXBsYWNlKC8oXFx7XFx7XFx7UEhQWzAtOV0rXFx9XFx9XFx9KS9nLCBcIjxzcGFuIGNsYXNzPVxcXCJ0b2tlbiBwaHBcXFwiPiQxPC9zcGFuPlwiKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIEFkZCB0aGUgcnVsZXMgYmVmb3JlIGFsbCBvdGhlcnNcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgncGhwJywgJ2NvbW1lbnQnLCB7XG5cdFx0J21hcmt1cCc6IHtcblx0XHRcdHBhdHRlcm46IC88W14/XVxcLz8oLio/KT4vLFxuXHRcdFx0aW5zaWRlOiBQcmlzbS5sYW5ndWFnZXMubWFya3VwXG5cdFx0fSxcblx0XHQncGhwJzogL1xce1xce1xce1BIUFswLTldK1xcfVxcfVxcfS9cblx0fSk7XG59XG4iLCJQcmlzbS5sYW5ndWFnZXMuc2NzcyA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NzcycsIHtcblx0J2NvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFxcXF0pKD86XFwvXFwqW1xcd1xcV10qP1xcKlxcL3xcXC9cXC8uKikvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J2F0cnVsZSc6IHtcblx0XHRwYXR0ZXJuOiAvQFtcXHctXSsoPzpcXChbXigpXStcXCl8W14oXSkqPyg/PVxccytbeztdKS8sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQncnVsZSc6IC9AW1xcdy1dKy9cblx0XHRcdC8vIFNlZSByZXN0IGJlbG93XG5cdFx0fVxuXHR9LFxuXHQvLyB1cmwsIGNvbXBhc3NpZmllZFxuXHQndXJsJzogLyg/OlstYS16XSstKSp1cmwoPz1cXCgpL2ksXG5cdC8vIENTUyBzZWxlY3RvciByZWdleCBpcyBub3QgYXBwcm9wcmlhdGUgZm9yIFNhc3Ncblx0Ly8gc2luY2UgdGhlcmUgY2FuIGJlIGxvdCBtb3JlIHRoaW5ncyAodmFyLCBAIGRpcmVjdGl2ZSwgbmVzdGluZy4uKVxuXHQvLyBhIHNlbGVjdG9yIG11c3Qgc3RhcnQgYXQgdGhlIGVuZCBvZiBhIHByb3BlcnR5IG9yIGFmdGVyIGEgYnJhY2UgKGVuZCBvZiBvdGhlciBydWxlcyBvciBuZXN0aW5nKVxuXHQvLyBpdCBjYW4gY29udGFpbiBzb21lIGNoYXJhY3RlcnMgdGhhdCBhcmVuJ3QgdXNlZCBmb3IgZGVmaW5pbmcgcnVsZXMgb3IgZW5kIG9mIHNlbGVjdG9yLCAmIChwYXJlbnQgc2VsZWN0b3IpLCBvciBpbnRlcnBvbGF0ZWQgdmFyaWFibGVcblx0Ly8gdGhlIGVuZCBvZiBhIHNlbGVjdG9yIGlzIGZvdW5kIHdoZW4gdGhlcmUgaXMgbm8gcnVsZXMgaW4gaXQgKCB7fSBvciB7XFxzfSkgb3IgaWYgdGhlcmUgaXMgYSBwcm9wZXJ0eSAoYmVjYXVzZSBhbiBpbnRlcnBvbGF0ZWQgdmFyXG5cdC8vIGNhbiBcInBhc3NcIiBhcyBhIHNlbGVjdG9yLSBlLmc6IHByb3BlciN7JGVydHl9KVxuXHQvLyB0aGlzIG9uZSB3YXMgaGFyZCB0byBkbywgc28gcGxlYXNlIGJlIGNhcmVmdWwgaWYgeW91IGVkaXQgdGhpcyBvbmUgOilcblx0J3NlbGVjdG9yJzoge1xuXHRcdC8vIEluaXRpYWwgbG9vay1haGVhZCBpcyB1c2VkIHRvIHByZXZlbnQgbWF0Y2hpbmcgb2YgYmxhbmsgc2VsZWN0b3JzXG5cdFx0cGF0dGVybjogLyg/PVxcUylbXkA7XFx7XFx9XFwoXFwpXT8oW15AO1xce1xcfVxcKFxcKV18JnwjXFx7XFwkWy1fXFx3XStcXH0pKyg/PVxccypcXHsoXFx9fFxcc3xbXlxcfV0rKDp8XFx7KVteXFx9XSspKS9tLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3BsYWNlaG9sZGVyJzogLyVbLV9cXHddKy9cblx0XHR9XG5cdH1cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdzY3NzJywgJ2F0cnVsZScsIHtcblx0J2tleXdvcmQnOiBbXG5cdFx0L0AoPzppZnxlbHNlKD86IGlmKT98Zm9yfGVhY2h8d2hpbGV8aW1wb3J0fGV4dGVuZHxkZWJ1Z3x3YXJufG1peGlufGluY2x1ZGV8ZnVuY3Rpb258cmV0dXJufGNvbnRlbnQpL2ksXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyggKykoPzpmcm9tfHRocm91Z2gpKD89ICkvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH1cblx0XVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3Njc3MnLCAncHJvcGVydHknLCB7XG5cdC8vIHZhciBhbmQgaW50ZXJwb2xhdGVkIHZhcnNcblx0J3ZhcmlhYmxlJzogL1xcJFstX1xcd10rfCNcXHtcXCRbLV9cXHddK1xcfS9cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdzY3NzJywgJ2Z1bmN0aW9uJywge1xuXHQncGxhY2Vob2xkZXInOiB7XG5cdFx0cGF0dGVybjogLyVbLV9cXHddKy8sXG5cdFx0YWxpYXM6ICdzZWxlY3Rvcidcblx0fSxcblx0J3N0YXRlbWVudCc6IC9cXEIhKD86ZGVmYXVsdHxvcHRpb25hbClcXGIvaSxcblx0J2Jvb2xlYW4nOiAvXFxiKD86dHJ1ZXxmYWxzZSlcXGIvLFxuXHQnbnVsbCc6IC9cXGJudWxsXFxiLyxcblx0J29wZXJhdG9yJzoge1xuXHRcdHBhdHRlcm46IC8oXFxzKSg/OlstKypcXC8lXXxbPSFdPXw8PT98Pj0/fGFuZHxvcnxub3QpKD89XFxzKS8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9XG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLnNjc3NbJ2F0cnVsZSddLmluc2lkZS5yZXN0ID0gUHJpc20udXRpbC5jbG9uZShQcmlzbS5sYW5ndWFnZXMuc2Nzcyk7IiwiXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWNvcmUuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxudmFyIF9zZWxmID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKVxuXHQ/IHdpbmRvdyAgIC8vIGlmIGluIGJyb3dzZXJcblx0OiAoXG5cdFx0KHR5cGVvZiBXb3JrZXJHbG9iYWxTY29wZSAhPT0gJ3VuZGVmaW5lZCcgJiYgc2VsZiBpbnN0YW5jZW9mIFdvcmtlckdsb2JhbFNjb3BlKVxuXHRcdD8gc2VsZiAvLyBpZiBpbiB3b3JrZXJcblx0XHQ6IHt9ICAgLy8gaWYgaW4gbm9kZSBqc1xuXHQpO1xuXG4vKipcbiAqIFByaXNtOiBMaWdodHdlaWdodCwgcm9idXN0LCBlbGVnYW50IHN5bnRheCBoaWdobGlnaHRpbmdcbiAqIE1JVCBsaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwL1xuICogQGF1dGhvciBMZWEgVmVyb3UgaHR0cDovL2xlYS52ZXJvdS5tZVxuICovXG5cbnZhciBQcmlzbSA9IChmdW5jdGlvbigpe1xuXG4vLyBQcml2YXRlIGhlbHBlciB2YXJzXG52YXIgbGFuZyA9IC9cXGJsYW5nKD86dWFnZSk/LShcXHcrKVxcYi9pO1xudmFyIHVuaXF1ZUlkID0gMDtcblxudmFyIF8gPSBfc2VsZi5QcmlzbSA9IHtcblx0dXRpbDoge1xuXHRcdGVuY29kZTogZnVuY3Rpb24gKHRva2Vucykge1xuXHRcdFx0aWYgKHRva2VucyBpbnN0YW5jZW9mIFRva2VuKSB7XG5cdFx0XHRcdHJldHVybiBuZXcgVG9rZW4odG9rZW5zLnR5cGUsIF8udXRpbC5lbmNvZGUodG9rZW5zLmNvbnRlbnQpLCB0b2tlbnMuYWxpYXMpO1xuXHRcdFx0fSBlbHNlIGlmIChfLnV0aWwudHlwZSh0b2tlbnMpID09PSAnQXJyYXknKSB7XG5cdFx0XHRcdHJldHVybiB0b2tlbnMubWFwKF8udXRpbC5lbmNvZGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHRva2Vucy5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKS5yZXBsYWNlKC9cXHUwMGEwL2csICcgJyk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHR5cGU6IGZ1bmN0aW9uIChvKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9cXFtvYmplY3QgKFxcdyspXFxdLylbMV07XG5cdFx0fSxcblxuXHRcdG9iaklkOiBmdW5jdGlvbiAob2JqKSB7XG5cdFx0XHRpZiAoIW9ialsnX19pZCddKSB7XG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosICdfX2lkJywgeyB2YWx1ZTogKyt1bmlxdWVJZCB9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvYmpbJ19faWQnXTtcblx0XHR9LFxuXG5cdFx0Ly8gRGVlcCBjbG9uZSBhIGxhbmd1YWdlIGRlZmluaXRpb24gKGUuZy4gdG8gZXh0ZW5kIGl0KVxuXHRcdGNsb25lOiBmdW5jdGlvbiAobykge1xuXHRcdFx0dmFyIHR5cGUgPSBfLnV0aWwudHlwZShvKTtcblxuXHRcdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRcdGNhc2UgJ09iamVjdCc6XG5cdFx0XHRcdFx0dmFyIGNsb25lID0ge307XG5cblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gbykge1xuXHRcdFx0XHRcdFx0aWYgKG8uaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRcdFx0XHRjbG9uZVtrZXldID0gXy51dGlsLmNsb25lKG9ba2V5XSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGNsb25lO1xuXG5cdFx0XHRcdGNhc2UgJ0FycmF5Jzpcblx0XHRcdFx0XHQvLyBDaGVjayBmb3IgZXhpc3RlbmNlIGZvciBJRThcblx0XHRcdFx0XHRyZXR1cm4gby5tYXAgJiYgby5tYXAoZnVuY3Rpb24odikgeyByZXR1cm4gXy51dGlsLmNsb25lKHYpOyB9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG87XG5cdFx0fVxuXHR9LFxuXG5cdGxhbmd1YWdlczoge1xuXHRcdGV4dGVuZDogZnVuY3Rpb24gKGlkLCByZWRlZikge1xuXHRcdFx0dmFyIGxhbmcgPSBfLnV0aWwuY2xvbmUoXy5sYW5ndWFnZXNbaWRdKTtcblxuXHRcdFx0Zm9yICh2YXIga2V5IGluIHJlZGVmKSB7XG5cdFx0XHRcdGxhbmdba2V5XSA9IHJlZGVmW2tleV07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBsYW5nO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbnNlcnQgYSB0b2tlbiBiZWZvcmUgYW5vdGhlciB0b2tlbiBpbiBhIGxhbmd1YWdlIGxpdGVyYWxcblx0XHQgKiBBcyB0aGlzIG5lZWRzIHRvIHJlY3JlYXRlIHRoZSBvYmplY3QgKHdlIGNhbm5vdCBhY3R1YWxseSBpbnNlcnQgYmVmb3JlIGtleXMgaW4gb2JqZWN0IGxpdGVyYWxzKSxcblx0XHQgKiB3ZSBjYW5ub3QganVzdCBwcm92aWRlIGFuIG9iamVjdCwgd2UgbmVlZCBhbm9iamVjdCBhbmQgYSBrZXkuXG5cdFx0ICogQHBhcmFtIGluc2lkZSBUaGUga2V5IChvciBsYW5ndWFnZSBpZCkgb2YgdGhlIHBhcmVudFxuXHRcdCAqIEBwYXJhbSBiZWZvcmUgVGhlIGtleSB0byBpbnNlcnQgYmVmb3JlLiBJZiBub3QgcHJvdmlkZWQsIHRoZSBmdW5jdGlvbiBhcHBlbmRzIGluc3RlYWQuXG5cdFx0ICogQHBhcmFtIGluc2VydCBPYmplY3Qgd2l0aCB0aGUga2V5L3ZhbHVlIHBhaXJzIHRvIGluc2VydFxuXHRcdCAqIEBwYXJhbSByb290IFRoZSBvYmplY3QgdGhhdCBjb250YWlucyBgaW5zaWRlYC4gSWYgZXF1YWwgdG8gUHJpc20ubGFuZ3VhZ2VzLCBpdCBjYW4gYmUgb21pdHRlZC5cblx0XHQgKi9cblx0XHRpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uIChpbnNpZGUsIGJlZm9yZSwgaW5zZXJ0LCByb290KSB7XG5cdFx0XHRyb290ID0gcm9vdCB8fCBfLmxhbmd1YWdlcztcblx0XHRcdHZhciBncmFtbWFyID0gcm9vdFtpbnNpZGVdO1xuXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XG5cdFx0XHRcdGluc2VydCA9IGFyZ3VtZW50c1sxXTtcblxuXHRcdFx0XHRmb3IgKHZhciBuZXdUb2tlbiBpbiBpbnNlcnQpIHtcblx0XHRcdFx0XHRpZiAoaW5zZXJ0Lmhhc093blByb3BlcnR5KG5ld1Rva2VuKSkge1xuXHRcdFx0XHRcdFx0Z3JhbW1hcltuZXdUb2tlbl0gPSBpbnNlcnRbbmV3VG9rZW5dO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBncmFtbWFyO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmV0ID0ge307XG5cblx0XHRcdGZvciAodmFyIHRva2VuIGluIGdyYW1tYXIpIHtcblxuXHRcdFx0XHRpZiAoZ3JhbW1hci5oYXNPd25Qcm9wZXJ0eSh0b2tlbikpIHtcblxuXHRcdFx0XHRcdGlmICh0b2tlbiA9PSBiZWZvcmUpIHtcblxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgbmV3VG9rZW4gaW4gaW5zZXJ0KSB7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGluc2VydC5oYXNPd25Qcm9wZXJ0eShuZXdUb2tlbikpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXRbbmV3VG9rZW5dID0gaW5zZXJ0W25ld1Rva2VuXTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldFt0b2tlbl0gPSBncmFtbWFyW3Rva2VuXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBVcGRhdGUgcmVmZXJlbmNlcyBpbiBvdGhlciBsYW5ndWFnZSBkZWZpbml0aW9uc1xuXHRcdFx0Xy5sYW5ndWFnZXMuREZTKF8ubGFuZ3VhZ2VzLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gcm9vdFtpbnNpZGVdICYmIGtleSAhPSBpbnNpZGUpIHtcblx0XHRcdFx0XHR0aGlzW2tleV0gPSByZXQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gcm9vdFtpbnNpZGVdID0gcmV0O1xuXHRcdH0sXG5cblx0XHQvLyBUcmF2ZXJzZSBhIGxhbmd1YWdlIGRlZmluaXRpb24gd2l0aCBEZXB0aCBGaXJzdCBTZWFyY2hcblx0XHRERlM6IGZ1bmN0aW9uKG8sIGNhbGxiYWNrLCB0eXBlLCB2aXNpdGVkKSB7XG5cdFx0XHR2aXNpdGVkID0gdmlzaXRlZCB8fCB7fTtcblx0XHRcdGZvciAodmFyIGkgaW4gbykge1xuXHRcdFx0XHRpZiAoby5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwobywgaSwgb1tpXSwgdHlwZSB8fCBpKTtcblxuXHRcdFx0XHRcdGlmIChfLnV0aWwudHlwZShvW2ldKSA9PT0gJ09iamVjdCcgJiYgIXZpc2l0ZWRbXy51dGlsLm9iaklkKG9baV0pXSkge1xuXHRcdFx0XHRcdFx0dmlzaXRlZFtfLnV0aWwub2JqSWQob1tpXSldID0gdHJ1ZTtcblx0XHRcdFx0XHRcdF8ubGFuZ3VhZ2VzLkRGUyhvW2ldLCBjYWxsYmFjaywgbnVsbCwgdmlzaXRlZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKF8udXRpbC50eXBlKG9baV0pID09PSAnQXJyYXknICYmICF2aXNpdGVkW18udXRpbC5vYmpJZChvW2ldKV0pIHtcblx0XHRcdFx0XHRcdHZpc2l0ZWRbXy51dGlsLm9iaklkKG9baV0pXSA9IHRydWU7XG5cdFx0XHRcdFx0XHRfLmxhbmd1YWdlcy5ERlMob1tpXSwgY2FsbGJhY2ssIGksIHZpc2l0ZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0cGx1Z2luczoge30sXG5cblx0aGlnaGxpZ2h0QWxsOiBmdW5jdGlvbihhc3luYywgY2FsbGJhY2spIHtcblx0XHR2YXIgZW52ID0ge1xuXHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrLFxuXHRcdFx0c2VsZWN0b3I6ICdjb2RlW2NsYXNzKj1cImxhbmd1YWdlLVwiXSwgW2NsYXNzKj1cImxhbmd1YWdlLVwiXSBjb2RlLCBjb2RlW2NsYXNzKj1cImxhbmctXCJdLCBbY2xhc3MqPVwibGFuZy1cIl0gY29kZSdcblx0XHR9O1xuXG5cdFx0Xy5ob29rcy5ydW4oXCJiZWZvcmUtaGlnaGxpZ2h0YWxsXCIsIGVudik7XG5cblx0XHR2YXIgZWxlbWVudHMgPSBlbnYuZWxlbWVudHMgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChlbnYuc2VsZWN0b3IpO1xuXG5cdFx0Zm9yICh2YXIgaT0wLCBlbGVtZW50OyBlbGVtZW50ID0gZWxlbWVudHNbaSsrXTspIHtcblx0XHRcdF8uaGlnaGxpZ2h0RWxlbWVudChlbGVtZW50LCBhc3luYyA9PT0gdHJ1ZSwgZW52LmNhbGxiYWNrKTtcblx0XHR9XG5cdH0sXG5cblx0aGlnaGxpZ2h0RWxlbWVudDogZnVuY3Rpb24oZWxlbWVudCwgYXN5bmMsIGNhbGxiYWNrKSB7XG5cdFx0Ly8gRmluZCBsYW5ndWFnZVxuXHRcdHZhciBsYW5ndWFnZSwgZ3JhbW1hciwgcGFyZW50ID0gZWxlbWVudDtcblxuXHRcdHdoaWxlIChwYXJlbnQgJiYgIWxhbmcudGVzdChwYXJlbnQuY2xhc3NOYW1lKSkge1xuXHRcdFx0cGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0bGFuZ3VhZ2UgPSAocGFyZW50LmNsYXNzTmFtZS5tYXRjaChsYW5nKSB8fCBbLCcnXSlbMV0udG9Mb3dlckNhc2UoKTtcblx0XHRcdGdyYW1tYXIgPSBfLmxhbmd1YWdlc1tsYW5ndWFnZV07XG5cdFx0fVxuXG5cdFx0Ly8gU2V0IGxhbmd1YWdlIG9uIHRoZSBlbGVtZW50LCBpZiBub3QgcHJlc2VudFxuXHRcdGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUucmVwbGFjZShsYW5nLCAnJykucmVwbGFjZSgvXFxzKy9nLCAnICcpICsgJyBsYW5ndWFnZS0nICsgbGFuZ3VhZ2U7XG5cblx0XHQvLyBTZXQgbGFuZ3VhZ2Ugb24gdGhlIHBhcmVudCwgZm9yIHN0eWxpbmdcblx0XHRwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG5cblx0XHRpZiAoL3ByZS9pLnRlc3QocGFyZW50Lm5vZGVOYW1lKSkge1xuXHRcdFx0cGFyZW50LmNsYXNzTmFtZSA9IHBhcmVudC5jbGFzc05hbWUucmVwbGFjZShsYW5nLCAnJykucmVwbGFjZSgvXFxzKy9nLCAnICcpICsgJyBsYW5ndWFnZS0nICsgbGFuZ3VhZ2U7XG5cdFx0fVxuXG5cdFx0dmFyIGNvZGUgPSBlbGVtZW50LnRleHRDb250ZW50O1xuXG5cdFx0dmFyIGVudiA9IHtcblx0XHRcdGVsZW1lbnQ6IGVsZW1lbnQsXG5cdFx0XHRsYW5ndWFnZTogbGFuZ3VhZ2UsXG5cdFx0XHRncmFtbWFyOiBncmFtbWFyLFxuXHRcdFx0Y29kZTogY29kZVxuXHRcdH07XG5cblx0XHRfLmhvb2tzLnJ1bignYmVmb3JlLXNhbml0eS1jaGVjaycsIGVudik7XG5cblx0XHRpZiAoIWVudi5jb2RlIHx8ICFlbnYuZ3JhbW1hcikge1xuXHRcdFx0Xy5ob29rcy5ydW4oJ2NvbXBsZXRlJywgZW52KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRfLmhvb2tzLnJ1bignYmVmb3JlLWhpZ2hsaWdodCcsIGVudik7XG5cblx0XHRpZiAoYXN5bmMgJiYgX3NlbGYuV29ya2VyKSB7XG5cdFx0XHR2YXIgd29ya2VyID0gbmV3IFdvcmtlcihfLmZpbGVuYW1lKTtcblxuXHRcdFx0d29ya2VyLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRlbnYuaGlnaGxpZ2h0ZWRDb2RlID0gZXZ0LmRhdGE7XG5cblx0XHRcdFx0Xy5ob29rcy5ydW4oJ2JlZm9yZS1pbnNlcnQnLCBlbnYpO1xuXG5cdFx0XHRcdGVudi5lbGVtZW50LmlubmVySFRNTCA9IGVudi5oaWdobGlnaHRlZENvZGU7XG5cblx0XHRcdFx0Y2FsbGJhY2sgJiYgY2FsbGJhY2suY2FsbChlbnYuZWxlbWVudCk7XG5cdFx0XHRcdF8uaG9va3MucnVuKCdhZnRlci1oaWdobGlnaHQnLCBlbnYpO1xuXHRcdFx0XHRfLmhvb2tzLnJ1bignY29tcGxldGUnLCBlbnYpO1xuXHRcdFx0fTtcblxuXHRcdFx0d29ya2VyLnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHtcblx0XHRcdFx0bGFuZ3VhZ2U6IGVudi5sYW5ndWFnZSxcblx0XHRcdFx0Y29kZTogZW52LmNvZGUsXG5cdFx0XHRcdGltbWVkaWF0ZUNsb3NlOiB0cnVlXG5cdFx0XHR9KSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0ZW52LmhpZ2hsaWdodGVkQ29kZSA9IF8uaGlnaGxpZ2h0KGVudi5jb2RlLCBlbnYuZ3JhbW1hciwgZW52Lmxhbmd1YWdlKTtcblxuXHRcdFx0Xy5ob29rcy5ydW4oJ2JlZm9yZS1pbnNlcnQnLCBlbnYpO1xuXG5cdFx0XHRlbnYuZWxlbWVudC5pbm5lckhUTUwgPSBlbnYuaGlnaGxpZ2h0ZWRDb2RlO1xuXG5cdFx0XHRjYWxsYmFjayAmJiBjYWxsYmFjay5jYWxsKGVsZW1lbnQpO1xuXG5cdFx0XHRfLmhvb2tzLnJ1bignYWZ0ZXItaGlnaGxpZ2h0JywgZW52KTtcblx0XHRcdF8uaG9va3MucnVuKCdjb21wbGV0ZScsIGVudik7XG5cdFx0fVxuXHR9LFxuXG5cdGhpZ2hsaWdodDogZnVuY3Rpb24gKHRleHQsIGdyYW1tYXIsIGxhbmd1YWdlKSB7XG5cdFx0dmFyIHRva2VucyA9IF8udG9rZW5pemUodGV4dCwgZ3JhbW1hcik7XG5cdFx0cmV0dXJuIFRva2VuLnN0cmluZ2lmeShfLnV0aWwuZW5jb2RlKHRva2VucyksIGxhbmd1YWdlKTtcblx0fSxcblxuXHR0b2tlbml6ZTogZnVuY3Rpb24odGV4dCwgZ3JhbW1hciwgbGFuZ3VhZ2UpIHtcblx0XHR2YXIgVG9rZW4gPSBfLlRva2VuO1xuXG5cdFx0dmFyIHN0cmFyciA9IFt0ZXh0XTtcblxuXHRcdHZhciByZXN0ID0gZ3JhbW1hci5yZXN0O1xuXG5cdFx0aWYgKHJlc3QpIHtcblx0XHRcdGZvciAodmFyIHRva2VuIGluIHJlc3QpIHtcblx0XHRcdFx0Z3JhbW1hclt0b2tlbl0gPSByZXN0W3Rva2VuXTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsZXRlIGdyYW1tYXIucmVzdDtcblx0XHR9XG5cblx0XHR0b2tlbmxvb3A6IGZvciAodmFyIHRva2VuIGluIGdyYW1tYXIpIHtcblx0XHRcdGlmKCFncmFtbWFyLmhhc093blByb3BlcnR5KHRva2VuKSB8fCAhZ3JhbW1hclt0b2tlbl0pIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBwYXR0ZXJucyA9IGdyYW1tYXJbdG9rZW5dO1xuXHRcdFx0cGF0dGVybnMgPSAoXy51dGlsLnR5cGUocGF0dGVybnMpID09PSBcIkFycmF5XCIpID8gcGF0dGVybnMgOiBbcGF0dGVybnNdO1xuXG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHBhdHRlcm5zLmxlbmd0aDsgKytqKSB7XG5cdFx0XHRcdHZhciBwYXR0ZXJuID0gcGF0dGVybnNbal0sXG5cdFx0XHRcdFx0aW5zaWRlID0gcGF0dGVybi5pbnNpZGUsXG5cdFx0XHRcdFx0bG9va2JlaGluZCA9ICEhcGF0dGVybi5sb29rYmVoaW5kLFxuXHRcdFx0XHRcdGdyZWVkeSA9ICEhcGF0dGVybi5ncmVlZHksXG5cdFx0XHRcdFx0bG9va2JlaGluZExlbmd0aCA9IDAsXG5cdFx0XHRcdFx0YWxpYXMgPSBwYXR0ZXJuLmFsaWFzO1xuXG5cdFx0XHRcdHBhdHRlcm4gPSBwYXR0ZXJuLnBhdHRlcm4gfHwgcGF0dGVybjtcblxuXHRcdFx0XHRmb3IgKHZhciBpPTA7IGk8c3RyYXJyLmxlbmd0aDsgaSsrKSB7IC8vIERvbuKAmXQgY2FjaGUgbGVuZ3RoIGFzIGl0IGNoYW5nZXMgZHVyaW5nIHRoZSBsb29wXG5cblx0XHRcdFx0XHR2YXIgc3RyID0gc3RyYXJyW2ldO1xuXG5cdFx0XHRcdFx0aWYgKHN0cmFyci5sZW5ndGggPiB0ZXh0Lmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0Ly8gU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsIEFCT1JULCBBQk9SVCFcblx0XHRcdFx0XHRcdGJyZWFrIHRva2VubG9vcDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoc3RyIGluc3RhbmNlb2YgVG9rZW4pIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHBhdHRlcm4ubGFzdEluZGV4ID0gMDtcblxuXHRcdFx0XHRcdHZhciBtYXRjaCA9IHBhdHRlcm4uZXhlYyhzdHIpLFxuXHRcdFx0XHRcdCAgICBkZWxOdW0gPSAxO1xuXG5cdFx0XHRcdFx0Ly8gR3JlZWR5IHBhdHRlcm5zIGNhbiBvdmVycmlkZS9yZW1vdmUgdXAgdG8gdHdvIHByZXZpb3VzbHkgbWF0Y2hlZCB0b2tlbnNcblx0XHRcdFx0XHRpZiAoIW1hdGNoICYmIGdyZWVkeSAmJiBpICE9IHN0cmFyci5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdFx0XHQvLyBSZWNvbnN0cnVjdCB0aGUgb3JpZ2luYWwgdGV4dCB1c2luZyB0aGUgbmV4dCB0d28gdG9rZW5zXG5cdFx0XHRcdFx0XHR2YXIgbmV4dFRva2VuID0gc3RyYXJyW2kgKyAxXS5tYXRjaGVkU3RyIHx8IHN0cmFycltpICsgMV0sXG5cdFx0XHRcdFx0XHQgICAgY29tYlN0ciA9IHN0ciArIG5leHRUb2tlbjtcblxuXHRcdFx0XHRcdFx0aWYgKGkgPCBzdHJhcnIubGVuZ3RoIC0gMikge1xuXHRcdFx0XHRcdFx0XHRjb21iU3RyICs9IHN0cmFycltpICsgMl0ubWF0Y2hlZFN0ciB8fCBzdHJhcnJbaSArIDJdO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBUcnkgdGhlIHBhdHRlcm4gYWdhaW4gb24gdGhlIHJlY29uc3RydWN0ZWQgdGV4dFxuXHRcdFx0XHRcdFx0cGF0dGVybi5sYXN0SW5kZXggPSAwO1xuXHRcdFx0XHRcdFx0bWF0Y2ggPSBwYXR0ZXJuLmV4ZWMoY29tYlN0cik7XG5cdFx0XHRcdFx0XHRpZiAoIW1hdGNoKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR2YXIgZnJvbSA9IG1hdGNoLmluZGV4ICsgKGxvb2tiZWhpbmQgPyBtYXRjaFsxXS5sZW5ndGggOiAwKTtcblx0XHRcdFx0XHRcdC8vIFRvIGJlIGEgdmFsaWQgY2FuZGlkYXRlLCB0aGUgbmV3IG1hdGNoIGhhcyB0byBzdGFydCBpbnNpZGUgb2Ygc3RyXG5cdFx0XHRcdFx0XHRpZiAoZnJvbSA+PSBzdHIubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dmFyIHRvID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGgsXG5cdFx0XHRcdFx0XHQgICAgbGVuID0gc3RyLmxlbmd0aCArIG5leHRUb2tlbi5sZW5ndGg7XG5cblx0XHRcdFx0XHRcdC8vIE51bWJlciBvZiB0b2tlbnMgdG8gZGVsZXRlIGFuZCByZXBsYWNlIHdpdGggdGhlIG5ldyBtYXRjaFxuXHRcdFx0XHRcdFx0ZGVsTnVtID0gMztcblxuXHRcdFx0XHRcdFx0aWYgKHRvIDw9IGxlbikge1xuXHRcdFx0XHRcdFx0XHRpZiAoc3RyYXJyW2kgKyAxXS5ncmVlZHkpIHtcblx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRkZWxOdW0gPSAyO1xuXHRcdFx0XHRcdFx0XHRjb21iU3RyID0gY29tYlN0ci5zbGljZSgwLCBsZW4pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c3RyID0gY29tYlN0cjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIW1hdGNoKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZihsb29rYmVoaW5kKSB7XG5cdFx0XHRcdFx0XHRsb29rYmVoaW5kTGVuZ3RoID0gbWF0Y2hbMV0ubGVuZ3RoO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciBmcm9tID0gbWF0Y2guaW5kZXggKyBsb29rYmVoaW5kTGVuZ3RoLFxuXHRcdFx0XHRcdCAgICBtYXRjaCA9IG1hdGNoWzBdLnNsaWNlKGxvb2tiZWhpbmRMZW5ndGgpLFxuXHRcdFx0XHRcdCAgICB0byA9IGZyb20gKyBtYXRjaC5sZW5ndGgsXG5cdFx0XHRcdFx0ICAgIGJlZm9yZSA9IHN0ci5zbGljZSgwLCBmcm9tKSxcblx0XHRcdFx0XHQgICAgYWZ0ZXIgPSBzdHIuc2xpY2UodG8pO1xuXG5cdFx0XHRcdFx0dmFyIGFyZ3MgPSBbaSwgZGVsTnVtXTtcblxuXHRcdFx0XHRcdGlmIChiZWZvcmUpIHtcblx0XHRcdFx0XHRcdGFyZ3MucHVzaChiZWZvcmUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciB3cmFwcGVkID0gbmV3IFRva2VuKHRva2VuLCBpbnNpZGU/IF8udG9rZW5pemUobWF0Y2gsIGluc2lkZSkgOiBtYXRjaCwgYWxpYXMsIG1hdGNoLCBncmVlZHkpO1xuXG5cdFx0XHRcdFx0YXJncy5wdXNoKHdyYXBwZWQpO1xuXG5cdFx0XHRcdFx0aWYgKGFmdGVyKSB7XG5cdFx0XHRcdFx0XHRhcmdzLnB1c2goYWZ0ZXIpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkoc3RyYXJyLCBhcmdzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBzdHJhcnI7XG5cdH0sXG5cblx0aG9va3M6IHtcblx0XHRhbGw6IHt9LFxuXG5cdFx0YWRkOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBob29rcyA9IF8uaG9va3MuYWxsO1xuXG5cdFx0XHRob29rc1tuYW1lXSA9IGhvb2tzW25hbWVdIHx8IFtdO1xuXG5cdFx0XHRob29rc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcblx0XHR9LFxuXG5cdFx0cnVuOiBmdW5jdGlvbiAobmFtZSwgZW52KSB7XG5cdFx0XHR2YXIgY2FsbGJhY2tzID0gXy5ob29rcy5hbGxbbmFtZV07XG5cblx0XHRcdGlmICghY2FsbGJhY2tzIHx8ICFjYWxsYmFja3MubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Zm9yICh2YXIgaT0wLCBjYWxsYmFjazsgY2FsbGJhY2sgPSBjYWxsYmFja3NbaSsrXTspIHtcblx0XHRcdFx0Y2FsbGJhY2soZW52KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbnZhciBUb2tlbiA9IF8uVG9rZW4gPSBmdW5jdGlvbih0eXBlLCBjb250ZW50LCBhbGlhcywgbWF0Y2hlZFN0ciwgZ3JlZWR5KSB7XG5cdHRoaXMudHlwZSA9IHR5cGU7XG5cdHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG5cdHRoaXMuYWxpYXMgPSBhbGlhcztcblx0Ly8gQ29weSBvZiB0aGUgZnVsbCBzdHJpbmcgdGhpcyB0b2tlbiB3YXMgY3JlYXRlZCBmcm9tXG5cdHRoaXMubWF0Y2hlZFN0ciA9IG1hdGNoZWRTdHIgfHwgbnVsbDtcblx0dGhpcy5ncmVlZHkgPSAhIWdyZWVkeTtcbn07XG5cblRva2VuLnN0cmluZ2lmeSA9IGZ1bmN0aW9uKG8sIGxhbmd1YWdlLCBwYXJlbnQpIHtcblx0aWYgKHR5cGVvZiBvID09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIG87XG5cdH1cblxuXHRpZiAoXy51dGlsLnR5cGUobykgPT09ICdBcnJheScpIHtcblx0XHRyZXR1cm4gby5tYXAoZnVuY3Rpb24oZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIFRva2VuLnN0cmluZ2lmeShlbGVtZW50LCBsYW5ndWFnZSwgbyk7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHR2YXIgZW52ID0ge1xuXHRcdHR5cGU6IG8udHlwZSxcblx0XHRjb250ZW50OiBUb2tlbi5zdHJpbmdpZnkoby5jb250ZW50LCBsYW5ndWFnZSwgcGFyZW50KSxcblx0XHR0YWc6ICdzcGFuJyxcblx0XHRjbGFzc2VzOiBbJ3Rva2VuJywgby50eXBlXSxcblx0XHRhdHRyaWJ1dGVzOiB7fSxcblx0XHRsYW5ndWFnZTogbGFuZ3VhZ2UsXG5cdFx0cGFyZW50OiBwYXJlbnRcblx0fTtcblxuXHRpZiAoZW52LnR5cGUgPT0gJ2NvbW1lbnQnKSB7XG5cdFx0ZW52LmF0dHJpYnV0ZXNbJ3NwZWxsY2hlY2snXSA9ICd0cnVlJztcblx0fVxuXG5cdGlmIChvLmFsaWFzKSB7XG5cdFx0dmFyIGFsaWFzZXMgPSBfLnV0aWwudHlwZShvLmFsaWFzKSA9PT0gJ0FycmF5JyA/IG8uYWxpYXMgOiBbby5hbGlhc107XG5cdFx0QXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZW52LmNsYXNzZXMsIGFsaWFzZXMpO1xuXHR9XG5cblx0Xy5ob29rcy5ydW4oJ3dyYXAnLCBlbnYpO1xuXG5cdHZhciBhdHRyaWJ1dGVzID0gJyc7XG5cblx0Zm9yICh2YXIgbmFtZSBpbiBlbnYuYXR0cmlidXRlcykge1xuXHRcdGF0dHJpYnV0ZXMgKz0gKGF0dHJpYnV0ZXMgPyAnICcgOiAnJykgKyBuYW1lICsgJz1cIicgKyAoZW52LmF0dHJpYnV0ZXNbbmFtZV0gfHwgJycpICsgJ1wiJztcblx0fVxuXG5cdHJldHVybiAnPCcgKyBlbnYudGFnICsgJyBjbGFzcz1cIicgKyBlbnYuY2xhc3Nlcy5qb2luKCcgJykgKyAnXCIgJyArIGF0dHJpYnV0ZXMgKyAnPicgKyBlbnYuY29udGVudCArICc8LycgKyBlbnYudGFnICsgJz4nO1xuXG59O1xuXG5pZiAoIV9zZWxmLmRvY3VtZW50KSB7XG5cdGlmICghX3NlbGYuYWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdC8vIGluIE5vZGUuanNcblx0XHRyZXR1cm4gX3NlbGYuUHJpc207XG5cdH1cbiBcdC8vIEluIHdvcmtlclxuXHRfc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0dmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2dC5kYXRhKSxcblx0XHQgICAgbGFuZyA9IG1lc3NhZ2UubGFuZ3VhZ2UsXG5cdFx0ICAgIGNvZGUgPSBtZXNzYWdlLmNvZGUsXG5cdFx0ICAgIGltbWVkaWF0ZUNsb3NlID0gbWVzc2FnZS5pbW1lZGlhdGVDbG9zZTtcblxuXHRcdF9zZWxmLnBvc3RNZXNzYWdlKF8uaGlnaGxpZ2h0KGNvZGUsIF8ubGFuZ3VhZ2VzW2xhbmddLCBsYW5nKSk7XG5cdFx0aWYgKGltbWVkaWF0ZUNsb3NlKSB7XG5cdFx0XHRfc2VsZi5jbG9zZSgpO1xuXHRcdH1cblx0fSwgZmFsc2UpO1xuXG5cdHJldHVybiBfc2VsZi5QcmlzbTtcbn1cblxuLy9HZXQgY3VycmVudCBzY3JpcHQgYW5kIGhpZ2hsaWdodFxudmFyIHNjcmlwdCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgfHwgW10uc2xpY2UuY2FsbChkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKSkucG9wKCk7XG5cbmlmIChzY3JpcHQpIHtcblx0Xy5maWxlbmFtZSA9IHNjcmlwdC5zcmM7XG5cblx0aWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJiYgIXNjcmlwdC5oYXNBdHRyaWJ1dGUoJ2RhdGEtbWFudWFsJykpIHtcblx0XHRpZihkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIikge1xuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKF8uaGlnaGxpZ2h0QWxsLCAwKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgXy5oaWdobGlnaHRBbGwpO1xuXHRcdH1cblx0fVxufVxuXG5yZXR1cm4gX3NlbGYuUHJpc207XG5cbn0pKCk7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IFByaXNtO1xufVxuXG4vLyBoYWNrIGZvciBjb21wb25lbnRzIHRvIHdvcmsgY29ycmVjdGx5IGluIG5vZGUuanNcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuXHRnbG9iYWwuUHJpc20gPSBQcmlzbTtcbn1cblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLW1hcmt1cC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMubWFya3VwID0ge1xuXHQnY29tbWVudCc6IC88IS0tW1xcd1xcV10qPy0tPi8sXG5cdCdwcm9sb2cnOiAvPFxcP1tcXHdcXFddKz9cXD8+Lyxcblx0J2RvY3R5cGUnOiAvPCFET0NUWVBFW1xcd1xcV10rPz4vLFxuXHQnY2RhdGEnOiAvPCFcXFtDREFUQVxcW1tcXHdcXFddKj9dXT4vaSxcblx0J3RhZyc6IHtcblx0XHRwYXR0ZXJuOiAvPFxcLz8oPyFcXGQpW15cXHM+XFwvPS4kPF0rKD86XFxzK1teXFxzPlxcLz1dKyg/Oj0oPzooXCJ8JykoPzpcXFxcXFwxfFxcXFw/KD8hXFwxKVtcXHdcXFddKSpcXDF8W15cXHMnXCI+PV0rKSk/KSpcXHMqXFwvPz4vaSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCd0YWcnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9ePFxcLz9bXlxccz5cXC9dKy9pLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvXjxcXC8/Lyxcblx0XHRcdFx0XHQnbmFtZXNwYWNlJzogL15bXlxccz5cXC86XSs6L1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2F0dHItdmFsdWUnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC89KD86KCd8XCIpW1xcd1xcV10qPyhcXDEpfFteXFxzPl0rKS9pLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvWz0+XCInXS9cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdwdW5jdHVhdGlvbic6IC9cXC8/Pi8sXG5cdFx0XHQnYXR0ci1uYW1lJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvW15cXHM+XFwvXSsvLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQnbmFtZXNwYWNlJzogL15bXlxccz5cXC86XSs6L1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9XG5cdH0sXG5cdCdlbnRpdHknOiAvJiM/W1xcZGEtel17MSw4fTsvaVxufTtcblxuLy8gUGx1Z2luIHRvIG1ha2UgZW50aXR5IHRpdGxlIHNob3cgdGhlIHJlYWwgZW50aXR5LCBpZGVhIGJ5IFJvbWFuIEtvbWFyb3ZcblByaXNtLmhvb2tzLmFkZCgnd3JhcCcsIGZ1bmN0aW9uKGVudikge1xuXG5cdGlmIChlbnYudHlwZSA9PT0gJ2VudGl0eScpIHtcblx0XHRlbnYuYXR0cmlidXRlc1sndGl0bGUnXSA9IGVudi5jb250ZW50LnJlcGxhY2UoLyZhbXA7LywgJyYnKTtcblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy54bWwgPSBQcmlzbS5sYW5ndWFnZXMubWFya3VwO1xuUHJpc20ubGFuZ3VhZ2VzLmh0bWwgPSBQcmlzbS5sYW5ndWFnZXMubWFya3VwO1xuUHJpc20ubGFuZ3VhZ2VzLm1hdGhtbCA9IFByaXNtLmxhbmd1YWdlcy5tYXJrdXA7XG5QcmlzbS5sYW5ndWFnZXMuc3ZnID0gUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cDtcblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWNzcy5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuY3NzID0ge1xuXHQnY29tbWVudCc6IC9cXC9cXCpbXFx3XFxXXSo/XFwqXFwvLyxcblx0J2F0cnVsZSc6IHtcblx0XHRwYXR0ZXJuOiAvQFtcXHctXSs/Lio/KDt8KD89XFxzKlxceykpL2ksXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQncnVsZSc6IC9AW1xcdy1dKy9cblx0XHRcdC8vIFNlZSByZXN0IGJlbG93XG5cdFx0fVxuXHR9LFxuXHQndXJsJzogL3VybFxcKCg/OihbXCInXSkoXFxcXCg/OlxcclxcbnxbXFx3XFxXXSl8KD8hXFwxKVteXFxcXFxcclxcbl0pKlxcMXwuKj8pXFwpL2ksXG5cdCdzZWxlY3Rvcic6IC9bXlxce1xcfVxcc11bXlxce1xcfTtdKj8oPz1cXHMqXFx7KS8sXG5cdCdzdHJpbmcnOiAvKFwifCcpKFxcXFwoPzpcXHJcXG58W1xcd1xcV10pfCg/IVxcMSlbXlxcXFxcXHJcXG5dKSpcXDEvLFxuXHQncHJvcGVydHknOiAvKFxcYnxcXEIpW1xcdy1dKyg/PVxccyo6KS9pLFxuXHQnaW1wb3J0YW50JzogL1xcQiFpbXBvcnRhbnRcXGIvaSxcblx0J2Z1bmN0aW9uJzogL1stYS16MC05XSsoPz1cXCgpL2ksXG5cdCdwdW5jdHVhdGlvbic6IC9bKCl7fTs6XS9cbn07XG5cblByaXNtLmxhbmd1YWdlcy5jc3NbJ2F0cnVsZSddLmluc2lkZS5yZXN0ID0gUHJpc20udXRpbC5jbG9uZShQcmlzbS5sYW5ndWFnZXMuY3NzKTtcblxuaWYgKFByaXNtLmxhbmd1YWdlcy5tYXJrdXApIHtcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnbWFya3VwJywgJ3RhZycsIHtcblx0XHQnc3R5bGUnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKDxzdHlsZVtcXHdcXFddKj8+KVtcXHdcXFddKj8oPz08XFwvc3R5bGU+KS9pLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLmNzcyxcblx0XHRcdGFsaWFzOiAnbGFuZ3VhZ2UtY3NzJ1xuXHRcdH1cblx0fSk7XG5cdFxuXHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdpbnNpZGUnLCAnYXR0ci12YWx1ZScsIHtcblx0XHQnc3R5bGUtYXR0cic6IHtcblx0XHRcdHBhdHRlcm46IC9cXHMqc3R5bGU9KFwifCcpLio/XFwxL2ksXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2F0dHItbmFtZSc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvXlxccypzdHlsZS9pLFxuXHRcdFx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cC50YWcuaW5zaWRlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9eXFxzKj1cXHMqWydcIl18WydcIl1cXHMqJC8sXG5cdFx0XHRcdCdhdHRyLXZhbHVlJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC8uKy9pLFxuXHRcdFx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLmNzc1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0YWxpYXM6ICdsYW5ndWFnZS1jc3MnXG5cdFx0fVxuXHR9LCBQcmlzbS5sYW5ndWFnZXMubWFya3VwLnRhZyk7XG59XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tY2xpa2UuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmNsaWtlID0ge1xuXHQnY29tbWVudCc6IFtcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSlcXC9cXCpbXFx3XFxXXSo/XFwqXFwvLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXlxcXFw6XSlcXC9cXC8uKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fVxuXHRdLFxuXHQnc3RyaW5nJzoge1xuXHRcdHBhdHRlcm46IC8oW1wiJ10pKFxcXFwoPzpcXHJcXG58W1xcc1xcU10pfCg/IVxcMSlbXlxcXFxcXHJcXG5dKSpcXDEvLFxuXHRcdGdyZWVkeTogdHJ1ZVxuXHR9LFxuXHQnY2xhc3MtbmFtZSc6IHtcblx0XHRwYXR0ZXJuOiAvKCg/OlxcYig/OmNsYXNzfGludGVyZmFjZXxleHRlbmRzfGltcGxlbWVudHN8dHJhaXR8aW5zdGFuY2VvZnxuZXcpXFxzKyl8KD86Y2F0Y2hcXHMrXFwoKSlbYS16MC05X1xcLlxcXFxdKy9pLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHRwdW5jdHVhdGlvbjogLyhcXC58XFxcXCkvXG5cdFx0fVxuXHR9LFxuXHQna2V5d29yZCc6IC9cXGIoaWZ8ZWxzZXx3aGlsZXxkb3xmb3J8cmV0dXJufGlufGluc3RhbmNlb2Z8ZnVuY3Rpb258bmV3fHRyeXx0aHJvd3xjYXRjaHxmaW5hbGx5fG51bGx8YnJlYWt8Y29udGludWUpXFxiLyxcblx0J2Jvb2xlYW4nOiAvXFxiKHRydWV8ZmFsc2UpXFxiLyxcblx0J2Z1bmN0aW9uJzogL1thLXowLTlfXSsoPz1cXCgpL2ksXG5cdCdudW1iZXInOiAvXFxiLT8oPzoweFtcXGRhLWZdK3xcXGQqXFwuP1xcZCsoPzplWystXT9cXGQrKT8pXFxiL2ksXG5cdCdvcGVyYXRvcic6IC8tLT98XFwrXFwrP3whPT89P3w8PT98Pj0/fD09Pz0/fCYmP3xcXHxcXHw/fFxcP3xcXCp8XFwvfH58XFxefCUvLFxuXHQncHVuY3R1YXRpb24nOiAvW3t9W1xcXTsoKSwuOl0vXG59O1xuXG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tamF2YXNjcmlwdC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuamF2YXNjcmlwdCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NsaWtlJywge1xuXHQna2V5d29yZCc6IC9cXGIoYXN8YXN5bmN8YXdhaXR8YnJlYWt8Y2FzZXxjYXRjaHxjbGFzc3xjb25zdHxjb250aW51ZXxkZWJ1Z2dlcnxkZWZhdWx0fGRlbGV0ZXxkb3xlbHNlfGVudW18ZXhwb3J0fGV4dGVuZHN8ZmluYWxseXxmb3J8ZnJvbXxmdW5jdGlvbnxnZXR8aWZ8aW1wbGVtZW50c3xpbXBvcnR8aW58aW5zdGFuY2VvZnxpbnRlcmZhY2V8bGV0fG5ld3xudWxsfG9mfHBhY2thZ2V8cHJpdmF0ZXxwcm90ZWN0ZWR8cHVibGljfHJldHVybnxzZXR8c3RhdGljfHN1cGVyfHN3aXRjaHx0aGlzfHRocm93fHRyeXx0eXBlb2Z8dmFyfHZvaWR8d2hpbGV8d2l0aHx5aWVsZClcXGIvLFxuXHQnbnVtYmVyJzogL1xcYi0/KDB4W1xcZEEtRmEtZl0rfDBiWzAxXSt8MG9bMC03XSt8XFxkKlxcLj9cXGQrKFtFZV1bKy1dP1xcZCspP3xOYU58SW5maW5pdHkpXFxiLyxcblx0Ly8gQWxsb3cgZm9yIGFsbCBub24tQVNDSUkgY2hhcmFjdGVycyAoU2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIwMDg0NDQpXG5cdCdmdW5jdGlvbic6IC9bXyRhLXpBLVpcXHhBMC1cXHVGRkZGXVtfJGEtekEtWjAtOVxceEEwLVxcdUZGRkZdKig/PVxcKCkvaVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2phdmFzY3JpcHQnLCAna2V5d29yZCcsIHtcblx0J3JlZ2V4Jzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXi9dKVxcLyg/IVxcLykoXFxbLis/XXxcXFxcLnxbXi9cXFxcXFxyXFxuXSkrXFwvW2dpbXl1XXswLDV9KD89XFxzKigkfFtcXHJcXG4sLjt9KV0pKS8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRncmVlZHk6IHRydWVcblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2phdmFzY3JpcHQnLCAnc3RyaW5nJywge1xuXHQndGVtcGxhdGUtc3RyaW5nJzoge1xuXHRcdHBhdHRlcm46IC9gKD86XFxcXFxcXFx8XFxcXD9bXlxcXFxdKSo/YC8sXG5cdFx0Z3JlZWR5OiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J2ludGVycG9sYXRpb24nOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9cXCRcXHtbXn1dK1xcfS8sXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdpbnRlcnBvbGF0aW9uLXB1bmN0dWF0aW9uJzoge1xuXHRcdFx0XHRcdFx0cGF0dGVybjogL15cXCRcXHt8XFx9JC8sXG5cdFx0XHRcdFx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHRcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdzdHJpbmcnOiAvW1xcc1xcU10rL1xuXHRcdH1cblx0fVxufSk7XG5cbmlmIChQcmlzbS5sYW5ndWFnZXMubWFya3VwKSB7XG5cdFByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ21hcmt1cCcsICd0YWcnLCB7XG5cdFx0J3NjcmlwdCc6IHtcblx0XHRcdHBhdHRlcm46IC8oPHNjcmlwdFtcXHdcXFddKj8+KVtcXHdcXFddKj8oPz08XFwvc2NyaXB0PikvaSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0LFxuXHRcdFx0YWxpYXM6ICdsYW5ndWFnZS1qYXZhc2NyaXB0J1xuXHRcdH1cblx0fSk7XG59XG5cblByaXNtLmxhbmd1YWdlcy5qcyA9IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWZpbGUtaGlnaGxpZ2h0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbihmdW5jdGlvbiAoKSB7XG5cdGlmICh0eXBlb2Ygc2VsZiA9PT0gJ3VuZGVmaW5lZCcgfHwgIXNlbGYuUHJpc20gfHwgIXNlbGYuZG9jdW1lbnQgfHwgIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRzZWxmLlByaXNtLmZpbGVIaWdobGlnaHQgPSBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBFeHRlbnNpb25zID0ge1xuXHRcdFx0J2pzJzogJ2phdmFzY3JpcHQnLFxuXHRcdFx0J3B5JzogJ3B5dGhvbicsXG5cdFx0XHQncmInOiAncnVieScsXG5cdFx0XHQncHMxJzogJ3Bvd2Vyc2hlbGwnLFxuXHRcdFx0J3BzbTEnOiAncG93ZXJzaGVsbCcsXG5cdFx0XHQnc2gnOiAnYmFzaCcsXG5cdFx0XHQnYmF0JzogJ2JhdGNoJyxcblx0XHRcdCdoJzogJ2MnLFxuXHRcdFx0J3RleCc6ICdsYXRleCdcblx0XHR9O1xuXG5cdFx0aWYoQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHsgLy8gQ2hlY2sgdG8gcHJldmVudCBlcnJvciBpbiBJRThcblx0XHRcdEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3ByZVtkYXRhLXNyY10nKSkuZm9yRWFjaChmdW5jdGlvbiAocHJlKSB7XG5cdFx0XHRcdHZhciBzcmMgPSBwcmUuZ2V0QXR0cmlidXRlKCdkYXRhLXNyYycpO1xuXG5cdFx0XHRcdHZhciBsYW5ndWFnZSwgcGFyZW50ID0gcHJlO1xuXHRcdFx0XHR2YXIgbGFuZyA9IC9cXGJsYW5nKD86dWFnZSk/LSg/IVxcKikoXFx3KylcXGIvaTtcblx0XHRcdFx0d2hpbGUgKHBhcmVudCAmJiAhbGFuZy50ZXN0KHBhcmVudC5jbGFzc05hbWUpKSB7XG5cdFx0XHRcdFx0cGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRcdFx0bGFuZ3VhZ2UgPSAocHJlLmNsYXNzTmFtZS5tYXRjaChsYW5nKSB8fCBbLCAnJ10pWzFdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCFsYW5ndWFnZSkge1xuXHRcdFx0XHRcdHZhciBleHRlbnNpb24gPSAoc3JjLm1hdGNoKC9cXC4oXFx3KykkLykgfHwgWywgJyddKVsxXTtcblx0XHRcdFx0XHRsYW5ndWFnZSA9IEV4dGVuc2lvbnNbZXh0ZW5zaW9uXSB8fCBleHRlbnNpb247XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgY29kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NvZGUnKTtcblx0XHRcdFx0Y29kZS5jbGFzc05hbWUgPSAnbGFuZ3VhZ2UtJyArIGxhbmd1YWdlO1xuXG5cdFx0XHRcdHByZS50ZXh0Q29udGVudCA9ICcnO1xuXG5cdFx0XHRcdGNvZGUudGV4dENvbnRlbnQgPSAnTG9hZGluZ+KApic7XG5cblx0XHRcdFx0cHJlLmFwcGVuZENoaWxkKGNvZGUpO1xuXG5cdFx0XHRcdHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuXHRcdFx0XHR4aHIub3BlbignR0VUJywgc3JjLCB0cnVlKTtcblxuXHRcdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PSA0KSB7XG5cblx0XHRcdFx0XHRcdGlmICh4aHIuc3RhdHVzIDwgNDAwICYmIHhoci5yZXNwb25zZVRleHQpIHtcblx0XHRcdFx0XHRcdFx0Y29kZS50ZXh0Q29udGVudCA9IHhoci5yZXNwb25zZVRleHQ7XG5cblx0XHRcdFx0XHRcdFx0UHJpc20uaGlnaGxpZ2h0RWxlbWVudChjb2RlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKHhoci5zdGF0dXMgPj0gNDAwKSB7XG5cdFx0XHRcdFx0XHRcdGNvZGUudGV4dENvbnRlbnQgPSAn4pyWIEVycm9yICcgKyB4aHIuc3RhdHVzICsgJyB3aGlsZSBmZXRjaGluZyBmaWxlOiAnICsgeGhyLnN0YXR1c1RleHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29kZS50ZXh0Q29udGVudCA9ICfinJYgRXJyb3I6IEZpbGUgZG9lcyBub3QgZXhpc3Qgb3IgaXMgZW1wdHknO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHR4aHIuc2VuZChudWxsKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHR9O1xuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBzZWxmLlByaXNtLmZpbGVIaWdobGlnaHQpO1xuXG59KSgpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3ZlbmRvcnMnKTtcblxuLy8gSlMgRG9jc1xuaWYgKHR5cGVvZiBnbG9iYWwuQmFzVUlEb2NzID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luZG93LkJhc1VJRG9jcyA9IGdsb2JhbC5CYXNVSURvY3MgPSB7fTtcbiAgICBCYXNVSURvY3Muc2l0ZSA9IHt9O1xufSAvLyBJbXBvcnQgVmVuZG9ycyBEZXBlbmRlbmNpZXNcblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBDcmVhdGUgRmlsZSBVcGxvYWQgRHJvcFxuICAgIHZhciBfZHJvcHpvbmUgPSBCYXNVSS5Gb3Jtcy5maWxlVXBsb2FkRHJvcCgnLmJhcy11aS1maWxlLXVwbG9hZC1kcm9wLXpvbmUnLCB7XG4gICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OC91cGxvYWQvJyxcbiAgICAgICAgZGVmYXVsdEltYWdlVGh1bWJuYWlsOiBcIi9hc3NldHMvaW1nL2ZpbGVzL2VtcHR5LnBuZ1wiXG4gICAgfSk7XG5cbiAgICBpZiAoX2Ryb3B6b25lKSB7XG4gICAgICAgIC8vIEZpbGUgVXBsb2FkIERyb3AgLSBFdmVudHNcbiAgICAgICAgX2Ryb3B6b25lLm9uKFwiYWRkZWRmaWxlXCIsIGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhmaWxlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gVG9hc3RcbiAgICBpZiAodG9hc3RyKSB7XG4gICAgICAgICQoJy5kb2MtdG9hc3Qtc3VjY2Vzcy10cmlnZ2VyJykub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgQmFzVUkuVG9hc3Quc3VjY2VzcygnQXJlIHlvdSB0aGUgNiBmaW5nZXJlZCBtYW4/JywgJ1N1Y2Nlc3MnKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJy5kb2MtdG9hc3QtaW5mby10cmlnZ2VyJykub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgQmFzVUkuVG9hc3QuaW5mbygnQXJlIHlvdSB0aGUgNiBmaW5nZXJlZCBtYW4/JywgJ0luZm8nKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJy5kb2MtdG9hc3Qtd2FybmluZy10cmlnZ2VyJykub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgQmFzVUkuVG9hc3Qud2FybmluZygnQXJlIHlvdSB0aGUgNiBmaW5nZXJlZCBtYW4/JywgJ1dhcm5pbmcnKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJy5kb2MtdG9hc3QtZXJyb3ItdHJpZ2dlcicpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIEJhc1VJLlRvYXN0LmVycm9yKCdBcmUgeW91IHRoZSA2IGZpbmdlcmVkIG1hbj8nLCAnRXJyb3InKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJy5kb2MtdG9hc3QtY2xlYXItdHJpZ2dlcicpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIEJhc1VJLlRvYXN0LmNsZWFyKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCcuZG9jLXRvYXN0LXJlbW92ZS10cmlnZ2VyJykub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgQmFzVUkuVG9hc3QucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGZvcm0gKFRlc3QgMSlcbiAgICB2YXIgX3ZhbF9mb3JtX3Rlc3QxID0gJCgnI2Zvcm0tdmFsaWRhdGlvbi10ZXN0MScpO1xuICAgIHZhciBfdmFsX2Zvcm1fdGVzdDFfc3VibWl0ID0gJCgnI2Zvcm0tdmFsaWRhdGlvbi10ZXN0MS1zdWJtaXQnKTtcbiAgICBpZiAoX3ZhbF9mb3JtX3Rlc3QxLmxlbmd0aCkge1xuICAgICAgICBCYXNVSS5Gb3Jtcy5hZGRGb3JtRm9yU3VibWl0VmFsaWRhdGUoX3ZhbF9mb3JtX3Rlc3QxKTtcbiAgICAgICAgX3ZhbF9mb3JtX3Rlc3QxX3N1Ym1pdC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgX3ZhbF9mb3JtX3Rlc3QxLnN1Ym1pdCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgX3ZhbF9mb3JtX3Rlc3QxLnN1Ym1pdChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIG9uZSBmaWVsZFxuICAgICAgICAgICAgdmFyIHJlc3VsdDEgPSBCYXNVSS5Gb3Jtcy52YWxpZGF0ZUZpZWxkKCQoJyN1c2VybmFtZS10ZXN0MScpKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdDEpO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBhbGwgZm9ybVxuICAgICAgICAgICAgdmFyIHJlc3VsdDIgPSBCYXNVSS5Gb3Jtcy52YWxpZGF0ZUZvcm0oJCgnI2Zvcm0tdmFsaWRhdGlvbi10ZXN0MScpKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdDIpO1xuXG4gICAgICAgICAgICAvL3RoaXMuc3VibWl0KCk7IC8vIElmIGFsbCB0aGUgdmFsaWRhdGlvbnMgc3VjY2VlZGVkXG5cbiAgICAgICAgICAgIGlmIChyZXN1bHQyID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBdXRvY29tcGxldGVcbiAgICB2YXIgYXV0b2NvbXBsZXRlX21pbkNoYXJzID0gMjtcbiAgICB2YXIgYXV0b2NvbXBsZXRlX2NvdW50cmllcyA9IEJhc1VJRG9jcy5zaXRlLmNvdW50cmllc192X2QoKTtcblxuICAgIC8vIEF1dG9jb21wbGV0ZSAtPiBUb3Agc2VhcmNoXG4gICAgJCgnI2RvYy1iYXMtdWktdG9wLXNlYXJjaC1hdXRvY29tcGxldGUnICsgJyBpbnB1dCcpLmF1dG9jb21wbGV0ZSh7XG4gICAgICAgIGxvb2t1cDogYXV0b2NvbXBsZXRlX2NvdW50cmllcyxcbiAgICAgICAgYXBwZW5kVG86ICcjZG9jLWJhcy11aS10b3Atc2VhcmNoLWF1dG9jb21wbGV0ZScsXG4gICAgICAgIGdyb3VwQnk6ICcnLFxuICAgICAgICBtaW5DaGFyczogYXV0b2NvbXBsZXRlX21pbkNoYXJzLFxuICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gb25TZWxlY3Qoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBzZWxlY3RlZDogJyArIHN1Z2dlc3Rpb24udmFsdWUgKyAnLCAnICsgc3VnZ2VzdGlvbi5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQXV0b2NvbXBsZXRlIC0+IFNpZGUgbmF2IC0+IHNlYXJjaFxuICAgICQoJyNkb2MtYmFzLXVpLXNpZGUtbmF2LXNlYXJjaC1hdXRvY29tcGxldGUnICsgJyBpbnB1dCcpLmF1dG9jb21wbGV0ZSh7XG4gICAgICAgIGxvb2t1cDogYXV0b2NvbXBsZXRlX2NvdW50cmllcyxcbiAgICAgICAgYXBwZW5kVG86ICcjZG9jLWJhcy11aS1zaWRlLW5hdi1zZWFyY2gtYXV0b2NvbXBsZXRlJyxcbiAgICAgICAgZ3JvdXBCeTogJycsXG4gICAgICAgIG1pbkNoYXJzOiBhdXRvY29tcGxldGVfbWluQ2hhcnMsXG4gICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiBvblNlbGVjdChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IHNlbGVjdGVkOiAnICsgc3VnZ2VzdGlvbi52YWx1ZSArICcsICcgKyBzdWdnZXN0aW9uLmRhdGEpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBdXRvY29tcGxldGUgLT4gc2VhcmNoXG4gICAgJCgnI2RvYy1iYXMtdWktc2VhcmNoLWF1dG9jb21wbGV0ZScgKyAnIGlucHV0JykuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgbG9va3VwOiBhdXRvY29tcGxldGVfY291bnRyaWVzLFxuICAgICAgICBhcHBlbmRUbzogJyNkb2MtYmFzLXVpLXNlYXJjaC1hdXRvY29tcGxldGUnLFxuICAgICAgICBncm91cEJ5OiAnJyxcbiAgICAgICAgbWluQ2hhcnM6IGF1dG9jb21wbGV0ZV9taW5DaGFycyxcbiAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIG9uU2VsZWN0KHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZb3Ugc2VsZWN0ZWQ6ICcgKyBzdWdnZXN0aW9uLnZhbHVlICsgJywgJyArIHN1Z2dlc3Rpb24uZGF0YSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEF1dG9jb21wbGV0ZSAtPiBzZWFyY2ggZXhwYW5kYWJsZVxuICAgICQoJyNkb2MtYmFzLXVpLXNlYXJjaC1leHBhbmRhYmxlLWF1dG9jb21wbGV0ZScgKyAnIGlucHV0JykuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgbG9va3VwOiBhdXRvY29tcGxldGVfY291bnRyaWVzLFxuICAgICAgICBhcHBlbmRUbzogJyNkb2MtYmFzLXVpLXNlYXJjaC1leHBhbmRhYmxlLWF1dG9jb21wbGV0ZScsXG4gICAgICAgIGdyb3VwQnk6ICcnLFxuICAgICAgICBtaW5DaGFyczogYXV0b2NvbXBsZXRlX21pbkNoYXJzLFxuICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gb25TZWxlY3Qoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBzZWxlY3RlZDogJyArIHN1Z2dlc3Rpb24udmFsdWUgKyAnLCAnICsgc3VnZ2VzdGlvbi5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQXV0b2NvbXBsZXRlIC0+IGlucHV0XG4gICAgJCgnI2RvYy10ZXh0LWF1dG9jb21wbGV0ZScgKyAnIGlucHV0JykuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgbG9va3VwOiBhdXRvY29tcGxldGVfY291bnRyaWVzLFxuICAgICAgICBhcHBlbmRUbzogJyNkb2MtdGV4dC1hdXRvY29tcGxldGUnLFxuICAgICAgICBncm91cEJ5OiAnJyxcbiAgICAgICAgbWluQ2hhcnM6IGF1dG9jb21wbGV0ZV9taW5DaGFycyxcbiAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIG9uU2VsZWN0KHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZb3Ugc2VsZWN0ZWQ6ICcgKyBzdWdnZXN0aW9uLnZhbHVlICsgJywgJyArIHN1Z2dlc3Rpb24uZGF0YSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEJ1aWxkIEdpdCBpbiBIb21lXG4gICAgQmFzVUlEb2NzLnNpdGUuYnVpbGRfZ2l0X2hvbWUoKTtcblxuICAgIC8vIFdoZW4gb3VyIHBhZ2UgbG9hZHMsIGNoZWNrIHRvIHNlZSBpZiBpdCBjb250YWlucyBhbmQgYW5jaG9yXG4gICAgQmFzVUlEb2NzLnNpdGUuc2Nyb2xsX2lmX2FuY2hvcih3aW5kb3cubG9jYXRpb24uaGFzaCk7XG59KTtcblxuLy8gQnVpbGQgR2l0IGluIEhvbWVcbkJhc1VJRG9jcy5zaXRlLmJ1aWxkX2dpdF9ob21lID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIF9kb3dubG9hZF9pbl9naXRfaHViID0gJCgnLmRvd25sb2FkLWluLWdpdC1odWInKTtcbiAgICB2YXIgX2Rvd25sb2FkX2luX2dpdF9odWJfaHJlZiA9ICQoJy5kb3dubG9hZC1pbi1naXQtaHViLWhyZWYnKTtcbiAgICBpZiAoX2Rvd25sb2FkX2luX2dpdF9odWIubGVuZ3RoKSB7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy9CYXNncmFuaS1PcmcvYmFzLW1hdGVyaWFsLXVpL3RhZ3NcIixcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIHN1Y2Nlc3MoZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF9kb3dubG9hZF9pbl9naXRfaHViLmh0bWwoJzxpIGNsYXNzPVwibWRpIG1kaS1kb3dubG9hZCBpY29uIGljb24tcmlnaHQgaWNvbi0xOFwiPjwvaT4gRG93bmxvYWQgJyArIGRhdGFbMF0ubmFtZSkuYXR0cignaHJlZicsIGRhdGFbMF0uemlwYmFsbF91cmwpO1xuICAgICAgICAgICAgICAgIF9kb3dubG9hZF9pbl9naXRfaHViX2hyZWYuYXR0cignaHJlZicsIGRhdGFbMF0uemlwYmFsbF91cmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdmFyIF9sYXN0X2NvbW1pdF9pbl9naXRfaHViID0gJCgnLmxhc3QtY29tbWl0LWluLWdpdC1odWInKTtcbiAgICBpZiAoX2xhc3RfY29tbWl0X2luX2dpdF9odWIubGVuZ3RoKSB7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy9CYXNncmFuaS1PcmcvYmFzLW1hdGVyaWFsLXVpL2NvbW1pdHMvbWFzdGVyXCIsXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiBzdWNjZXNzKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSAkLnRpbWVhZ28oZGF0YS5jb21taXQuYXV0aG9yLmRhdGUpO1xuICAgICAgICAgICAgICAgIF9sYXN0X2NvbW1pdF9pbl9naXRfaHViLmh0bWwoZGF0ZSkuYXR0cignaHJlZicsIGRhdGEuaHRtbF91cmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG4vLyBTY3JvbGwgaWYgYW5jaG9yXG5CYXNVSURvY3Muc2l0ZS5zY3JvbGxfaWZfYW5jaG9yID0gZnVuY3Rpb24gKGhyZWYpIHtcbiAgICBocmVmID0gdHlwZW9mIGhyZWYgPT09IFwic3RyaW5nXCIgPyBocmVmIDogJCh0aGlzKS5hdHRyKFwiaHJlZlwiKTtcbiAgICB2YXIgZnJvbVRvcCA9IDE2MDtcblxuICAgIGlmIChocmVmLmluZGV4T2YoXCIjXCIpID09PSAwKSB7XG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJChocmVmKTtcblxuICAgICAgICBpZiAoJHRhcmdldC5sZW5ndGgpIHtcbiAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkdGFyZ2V0Lm9mZnNldCgpLnRvcCAtIGZyb21Ub3AgfSwgMTAwMCk7XG4gICAgICAgICAgICBpZiAoaGlzdG9yeSAmJiBcInB1c2hTdGF0ZVwiIGluIGhpc3RvcnkpIHtcbiAgICAgICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgZG9jdW1lbnQudGl0bGUsIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIGhyZWYpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIEdldCBjb3VudHJpZXMgKHZhbHVlLCBkYXRhKVxuQmFzVUlEb2NzLnNpdGUuY291bnRyaWVzX3ZfZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX29iaiA9IFtdO1xuICAgICQubWFwKEJhc1VJRG9jcy5zaXRlLmNvdW50cmllcywgZnVuY3Rpb24gKHZhbCwga2V5KSB7XG4gICAgICAgIF9vYmoucHVzaCh7IHZhbHVlOiB2YWwsIGRhdGE6IGtleSB9KTtcbiAgICB9KS5qb2luKCcnKTtcbiAgICByZXR1cm4gX29iajtcbn07XG5cbkJhc1VJRG9jcy5zaXRlLmNvdW50cmllcyA9IHtcbiAgICBBRjogJ0FmZ2hhbmlzdGFuJyxcbiAgICBBWDogJ0FsYW5kIElzbGFuZHMnLFxuICAgIEFMOiAnQWxiYW5pYScsXG4gICAgRFo6ICdBbGdlcmlhJyxcbiAgICBBUzogJ0FtZXJpY2FuIFNhbW9hJyxcbiAgICBBRDogJ0FuZG9ycmEnLFxuICAgIEFPOiAnQW5nb2xhJyxcbiAgICBBSTogJ0FuZ3VpbGxhJyxcbiAgICBBUTogJ0FudGFyY3RpY2EnLFxuICAgIEFHOiAnQW50aWd1YSBBbmQgQmFyYnVkYScsXG4gICAgQVI6ICdBcmdlbnRpbmEnLFxuICAgIEFNOiAnQXJtZW5pYScsXG4gICAgQVc6ICdBcnViYScsXG4gICAgQVU6ICdBdXN0cmFsaWEnLFxuICAgIEFUOiAnQXVzdHJpYScsXG4gICAgQVo6ICdBemVyYmFpamFuJyxcbiAgICBCUzogJ0JhaGFtYXMnLFxuICAgIEJIOiAnQmFocmFpbicsXG4gICAgQkQ6ICdCYW5nbGFkZXNoJyxcbiAgICBCQjogJ0JhcmJhZG9zJyxcbiAgICBCWTogJ0JlbGFydXMnLFxuICAgIEJFOiAnQmVsZ2l1bScsXG4gICAgQlo6ICdCZWxpemUnLFxuICAgIEJKOiAnQmVuaW4nLFxuICAgIEJNOiAnQmVybXVkYScsXG4gICAgQlQ6ICdCaHV0YW4nLFxuICAgIEJPOiAnQm9saXZpYScsXG4gICAgQkE6ICdCb3NuaWEgQW5kIEhlcnplZ292aW5hJyxcbiAgICBCVzogJ0JvdHN3YW5hJyxcbiAgICBCVjogJ0JvdXZldCBJc2xhbmQnLFxuICAgIEJSOiAnQnJhemlsJyxcbiAgICBJTzogJ0JyaXRpc2ggSW5kaWFuIE9jZWFuIFRlcnJpdG9yeScsXG4gICAgQk46ICdCcnVuZWkgRGFydXNzYWxhbScsXG4gICAgQkc6ICdCdWxnYXJpYScsXG4gICAgQkY6ICdCdXJraW5hIEZhc28nLFxuICAgIEJJOiAnQnVydW5kaScsXG4gICAgS0g6ICdDYW1ib2RpYScsXG4gICAgQ006ICdDYW1lcm9vbicsXG4gICAgQ0E6ICdDYW5hZGEnLFxuICAgIENWOiAnQ2FwZSBWZXJkZScsXG4gICAgS1k6ICdDYXltYW4gSXNsYW5kcycsXG4gICAgQ0Y6ICdDZW50cmFsIEFmcmljYW4gUmVwdWJsaWMnLFxuICAgIFREOiAnQ2hhZCcsXG4gICAgQ0w6ICdDaGlsZScsXG4gICAgQ046ICdDaGluYScsXG4gICAgQ1g6ICdDaHJpc3RtYXMgSXNsYW5kJyxcbiAgICBDQzogJ0NvY29zIChLZWVsaW5nKSBJc2xhbmRzJyxcbiAgICBDTzogJ0NvbG9tYmlhJyxcbiAgICBLTTogJ0NvbW9yb3MnLFxuICAgIENHOiAnQ29uZ28nLFxuICAgIENEOiAnQ29uZ28sIERlbW9jcmF0aWMgUmVwdWJsaWMnLFxuICAgIENLOiAnQ29vayBJc2xhbmRzJyxcbiAgICBDUjogJ0Nvc3RhIFJpY2EnLFxuICAgIENJOiAnQ290ZSBEXFwnSXZvaXJlJyxcbiAgICBIUjogJ0Nyb2F0aWEnLFxuICAgIENVOiAnQ3ViYScsXG4gICAgQ1k6ICdDeXBydXMnLFxuICAgIENaOiAnQ3plY2ggUmVwdWJsaWMnLFxuICAgIERLOiAnRGVubWFyaycsXG4gICAgREo6ICdEamlib3V0aScsXG4gICAgRE06ICdEb21pbmljYScsXG4gICAgRE86ICdEb21pbmljYW4gUmVwdWJsaWMnLFxuICAgIEVDOiAnRWN1YWRvcicsXG4gICAgRUc6ICdFZ3lwdCcsXG4gICAgU1Y6ICdFbCBTYWx2YWRvcicsXG4gICAgR1E6ICdFcXVhdG9yaWFsIEd1aW5lYScsXG4gICAgRVI6ICdFcml0cmVhJyxcbiAgICBFRTogJ0VzdG9uaWEnLFxuICAgIEVUOiAnRXRoaW9waWEnLFxuICAgIEZLOiAnRmFsa2xhbmQgSXNsYW5kcyAoTWFsdmluYXMpJyxcbiAgICBGTzogJ0Zhcm9lIElzbGFuZHMnLFxuICAgIEZKOiAnRmlqaScsXG4gICAgRkk6ICdGaW5sYW5kJyxcbiAgICBGUjogJ0ZyYW5jZScsXG4gICAgR0Y6ICdGcmVuY2ggR3VpYW5hJyxcbiAgICBQRjogJ0ZyZW5jaCBQb2x5bmVzaWEnLFxuICAgIFRGOiAnRnJlbmNoIFNvdXRoZXJuIFRlcnJpdG9yaWVzJyxcbiAgICBHQTogJ0dhYm9uJyxcbiAgICBHTTogJ0dhbWJpYScsXG4gICAgR0U6ICdHZW9yZ2lhJyxcbiAgICBERTogJ0dlcm1hbnknLFxuICAgIEdIOiAnR2hhbmEnLFxuICAgIEdJOiAnR2licmFsdGFyJyxcbiAgICBHUjogJ0dyZWVjZScsXG4gICAgR0w6ICdHcmVlbmxhbmQnLFxuICAgIEdEOiAnR3JlbmFkYScsXG4gICAgR1A6ICdHdWFkZWxvdXBlJyxcbiAgICBHVTogJ0d1YW0nLFxuICAgIEdUOiAnR3VhdGVtYWxhJyxcbiAgICBHRzogJ0d1ZXJuc2V5JyxcbiAgICBHTjogJ0d1aW5lYScsXG4gICAgR1c6ICdHdWluZWEtQmlzc2F1JyxcbiAgICBHWTogJ0d1eWFuYScsXG4gICAgSFQ6ICdIYWl0aScsXG4gICAgSE06ICdIZWFyZCBJc2xhbmQgJiBNY2RvbmFsZCBJc2xhbmRzJyxcbiAgICBWQTogJ0hvbHkgU2VlIChWYXRpY2FuIENpdHkgU3RhdGUpJyxcbiAgICBITjogJ0hvbmR1cmFzJyxcbiAgICBISzogJ0hvbmcgS29uZycsXG4gICAgSFU6ICdIdW5nYXJ5JyxcbiAgICBJUzogJ0ljZWxhbmQnLFxuICAgIElOOiAnSW5kaWEnLFxuICAgIElEOiAnSW5kb25lc2lhJyxcbiAgICBJUjogJ0lyYW4sIElzbGFtaWMgUmVwdWJsaWMgT2YnLFxuICAgIElROiAnSXJhcScsXG4gICAgSUU6ICdJcmVsYW5kJyxcbiAgICBJTTogJ0lzbGUgT2YgTWFuJyxcbiAgICBJTDogJ0lzcmFlbCcsXG4gICAgSVQ6ICdJdGFseScsXG4gICAgSk06ICdKYW1haWNhJyxcbiAgICBKUDogJ0phcGFuJyxcbiAgICBKRTogJ0plcnNleScsXG4gICAgSk86ICdKb3JkYW4nLFxuICAgIEtaOiAnS2F6YWtoc3RhbicsXG4gICAgS0U6ICdLZW55YScsXG4gICAgS0k6ICdLaXJpYmF0aScsXG4gICAgS1I6ICdLb3JlYScsXG4gICAgS1c6ICdLdXdhaXQnLFxuICAgIEtHOiAnS3lyZ3l6c3RhbicsXG4gICAgTEE6ICdMYW8gUGVvcGxlXFwncyBEZW1vY3JhdGljIFJlcHVibGljJyxcbiAgICBMVjogJ0xhdHZpYScsXG4gICAgTEI6ICdMZWJhbm9uJyxcbiAgICBMUzogJ0xlc290aG8nLFxuICAgIExSOiAnTGliZXJpYScsXG4gICAgTFk6ICdMaWJ5YW4gQXJhYiBKYW1haGlyaXlhJyxcbiAgICBMSTogJ0xpZWNodGVuc3RlaW4nLFxuICAgIExUOiAnTGl0aHVhbmlhJyxcbiAgICBMVTogJ0x1eGVtYm91cmcnLFxuICAgIE1POiAnTWFjYW8nLFxuICAgIE1LOiAnTWFjZWRvbmlhJyxcbiAgICBNRzogJ01hZGFnYXNjYXInLFxuICAgIE1XOiAnTWFsYXdpJyxcbiAgICBNWTogJ01hbGF5c2lhJyxcbiAgICBNVjogJ01hbGRpdmVzJyxcbiAgICBNTDogJ01hbGknLFxuICAgIE1UOiAnTWFsdGEnLFxuICAgIE1IOiAnTWFyc2hhbGwgSXNsYW5kcycsXG4gICAgTVE6ICdNYXJ0aW5pcXVlJyxcbiAgICBNUjogJ01hdXJpdGFuaWEnLFxuICAgIE1VOiAnTWF1cml0aXVzJyxcbiAgICBZVDogJ01heW90dGUnLFxuICAgIE1YOiAnTWV4aWNvJyxcbiAgICBGTTogJ01pY3JvbmVzaWEsIEZlZGVyYXRlZCBTdGF0ZXMgT2YnLFxuICAgIE1EOiAnTW9sZG92YScsXG4gICAgTUM6ICdNb25hY28nLFxuICAgIE1OOiAnTW9uZ29saWEnLFxuICAgIE1FOiAnTW9udGVuZWdybycsXG4gICAgTVM6ICdNb250c2VycmF0JyxcbiAgICBNQTogJ01vcm9jY28nLFxuICAgIE1aOiAnTW96YW1iaXF1ZScsXG4gICAgTU06ICdNeWFubWFyJyxcbiAgICBOQTogJ05hbWliaWEnLFxuICAgIE5SOiAnTmF1cnUnLFxuICAgIE5QOiAnTmVwYWwnLFxuICAgIE5MOiAnTmV0aGVybGFuZHMnLFxuICAgIEFOOiAnTmV0aGVybGFuZHMgQW50aWxsZXMnLFxuICAgIE5DOiAnTmV3IENhbGVkb25pYScsXG4gICAgTlo6ICdOZXcgWmVhbGFuZCcsXG4gICAgTkk6ICdOaWNhcmFndWEnLFxuICAgIE5FOiAnTmlnZXInLFxuICAgIE5HOiAnTmlnZXJpYScsXG4gICAgTlU6ICdOaXVlJyxcbiAgICBORjogJ05vcmZvbGsgSXNsYW5kJyxcbiAgICBNUDogJ05vcnRoZXJuIE1hcmlhbmEgSXNsYW5kcycsXG4gICAgTk86ICdOb3J3YXknLFxuICAgIE9NOiAnT21hbicsXG4gICAgUEs6ICdQYWtpc3RhbicsXG4gICAgUFc6ICdQYWxhdScsXG4gICAgUFM6ICdQYWxlc3RpbmlhbiBUZXJyaXRvcnksIE9jY3VwaWVkJyxcbiAgICBQQTogJ1BhbmFtYScsXG4gICAgUEc6ICdQYXB1YSBOZXcgR3VpbmVhJyxcbiAgICBQWTogJ1BhcmFndWF5JyxcbiAgICBQRTogJ1BlcnUnLFxuICAgIFBIOiAnUGhpbGlwcGluZXMnLFxuICAgIFBOOiAnUGl0Y2Fpcm4nLFxuICAgIFBMOiAnUG9sYW5kJyxcbiAgICBQVDogJ1BvcnR1Z2FsJyxcbiAgICBQUjogJ1B1ZXJ0byBSaWNvJyxcbiAgICBRQTogJ1FhdGFyJyxcbiAgICBSRTogJ1JldW5pb24nLFxuICAgIFJPOiAnUm9tYW5pYScsXG4gICAgUlU6ICdSdXNzaWFuIEZlZGVyYXRpb24nLFxuICAgIFJXOiAnUndhbmRhJyxcbiAgICBCTDogJ1NhaW50IEJhcnRoZWxlbXknLFxuICAgIFNIOiAnU2FpbnQgSGVsZW5hJyxcbiAgICBLTjogJ1NhaW50IEtpdHRzIEFuZCBOZXZpcycsXG4gICAgTEM6ICdTYWludCBMdWNpYScsXG4gICAgTUY6ICdTYWludCBNYXJ0aW4nLFxuICAgIFBNOiAnU2FpbnQgUGllcnJlIEFuZCBNaXF1ZWxvbicsXG4gICAgVkM6ICdTYWludCBWaW5jZW50IEFuZCBHcmVuYWRpbmVzJyxcbiAgICBXUzogJ1NhbW9hJyxcbiAgICBTTTogJ1NhbiBNYXJpbm8nLFxuICAgIFNUOiAnU2FvIFRvbWUgQW5kIFByaW5jaXBlJyxcbiAgICBTQTogJ1NhdWRpIEFyYWJpYScsXG4gICAgU046ICdTZW5lZ2FsJyxcbiAgICBSUzogJ1NlcmJpYScsXG4gICAgU0M6ICdTZXljaGVsbGVzJyxcbiAgICBTTDogJ1NpZXJyYSBMZW9uZScsXG4gICAgU0c6ICdTaW5nYXBvcmUnLFxuICAgIFNLOiAnU2xvdmFraWEnLFxuICAgIFNJOiAnU2xvdmVuaWEnLFxuICAgIFNCOiAnU29sb21vbiBJc2xhbmRzJyxcbiAgICBTTzogJ1NvbWFsaWEnLFxuICAgIFpBOiAnU291dGggQWZyaWNhJyxcbiAgICBHUzogJ1NvdXRoIEdlb3JnaWEgQW5kIFNhbmR3aWNoIElzbC4nLFxuICAgIEVTOiAnU3BhaW4nLFxuICAgIExLOiAnU3JpIExhbmthJyxcbiAgICBTRDogJ1N1ZGFuJyxcbiAgICBTUjogJ1N1cmluYW1lJyxcbiAgICBTSjogJ1N2YWxiYXJkIEFuZCBKYW4gTWF5ZW4nLFxuICAgIFNaOiAnU3dhemlsYW5kJyxcbiAgICBTRTogJ1N3ZWRlbicsXG4gICAgQ0g6ICdTd2l0emVybGFuZCcsXG4gICAgU1k6ICdTeXJpYW4gQXJhYiBSZXB1YmxpYycsXG4gICAgVFc6ICdUYWl3YW4nLFxuICAgIFRKOiAnVGFqaWtpc3RhbicsXG4gICAgVFo6ICdUYW56YW5pYScsXG4gICAgVEg6ICdUaGFpbGFuZCcsXG4gICAgVEw6ICdUaW1vci1MZXN0ZScsXG4gICAgVEc6ICdUb2dvJyxcbiAgICBUSzogJ1Rva2VsYXUnLFxuICAgIFRPOiAnVG9uZ2EnLFxuICAgIFRUOiAnVHJpbmlkYWQgQW5kIFRvYmFnbycsXG4gICAgVE46ICdUdW5pc2lhJyxcbiAgICBUUjogJ1R1cmtleScsXG4gICAgVE06ICdUdXJrbWVuaXN0YW4nLFxuICAgIFRDOiAnVHVya3MgQW5kIENhaWNvcyBJc2xhbmRzJyxcbiAgICBUVjogJ1R1dmFsdScsXG4gICAgVUc6ICdVZ2FuZGEnLFxuICAgIFVBOiAnVWtyYWluZScsXG4gICAgQUU6ICdVbml0ZWQgQXJhYiBFbWlyYXRlcycsXG4gICAgR0I6ICdVbml0ZWQgS2luZ2RvbScsXG4gICAgVVM6ICdVbml0ZWQgU3RhdGVzJyxcbiAgICBVTTogJ1VuaXRlZCBTdGF0ZXMgT3V0bHlpbmcgSXNsYW5kcycsXG4gICAgVVk6ICdVcnVndWF5JyxcbiAgICBVWjogJ1V6YmVraXN0YW4nLFxuICAgIFZVOiAnVmFudWF0dScsXG4gICAgVkU6ICdWZW5lenVlbGEnLFxuICAgIFZOOiAnVmlldCBOYW0nLFxuICAgIFZHOiAnVmlyZ2luIElzbGFuZHMsIEJyaXRpc2gnLFxuICAgIFZJOiAnVmlyZ2luIElzbGFuZHMsIFUuUy4nLFxuICAgIFdGOiAnV2FsbGlzIEFuZCBGdXR1bmEnLFxuICAgIEVIOiAnV2VzdGVybiBTYWhhcmEnLFxuICAgIFlFOiAnWWVtZW4nLFxuICAgIFpNOiAnWmFtYmlhJyxcbiAgICBaVzogJ1ppbWJhYndlJ1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi8uLi8uLi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL2pxdWVyeS10aW1lYWdvL2pxdWVyeS50aW1lYWdvJyk7XG5cbnJlcXVpcmUoJy4vLi4vLi4vLi4vLi4vYm93ZXJfY29tcG9uZW50cy9wcmlzbS9wcmlzbScpO1xuXG5yZXF1aXJlKCcuLy4uLy4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvcHJpc20vY29tcG9uZW50cy9wcmlzbS1waHAnKTtcblxucmVxdWlyZSgnLi8uLi8uLi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL3ByaXNtL2NvbXBvbmVudHMvcHJpc20tZ2l0Jyk7XG5cbnJlcXVpcmUoJy4vLi4vLi4vLi4vLi4vYm93ZXJfY29tcG9uZW50cy9wcmlzbS9jb21wb25lbnRzL3ByaXNtLWJhc2gnKTtcblxucmVxdWlyZSgnLi8uLi8uLi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL3ByaXNtL2NvbXBvbmVudHMvcHJpc20taHR0cCcpO1xuXG5yZXF1aXJlKCcuLy4uLy4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvcHJpc20vY29tcG9uZW50cy9wcmlzbS1qYXZhc2NyaXB0Jyk7XG5cbnJlcXVpcmUoJy4vLi4vLi4vLi4vLi4vYm93ZXJfY29tcG9uZW50cy9wcmlzbS9jb21wb25lbnRzL3ByaXNtLW1hcmtkb3duJyk7XG5cbnJlcXVpcmUoJy4vLi4vLi4vLi4vLi4vYm93ZXJfY29tcG9uZW50cy9wcmlzbS9jb21wb25lbnRzL3ByaXNtLWNzcycpO1xuXG5yZXF1aXJlKCcuLy4uLy4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvcHJpc20vY29tcG9uZW50cy9wcmlzbS1zY3NzJyk7XG4iXX0=
