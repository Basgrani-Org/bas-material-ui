# BasMaterial UI

[![Donate to this project using Paypal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VKV3GRW7R6MLW)

- Ready for Meteor!!
- Ready for reactive App's!!

**NOTE:** Coming soon available for production!! Meanwhile use only for test purpose.

## Introduction

BasMaterial UI, is a natural user interface based in Google's Material Design.

- View the [DEMO & DOC](http://bas-material-ui.basgrani.com)

- View the [CHANGELOG](https://github.com/Basgrani-Org/bas-material-ui/blob/master/CHANGELOG.md)

## Install

```
npm install bas-material-ui
```

or

```
bower install bas-material-ui
```

## HTML Setup

Use the files in the "dist" folder

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    
    <!-- BasMaterial UI CSS -->
    <link rel="stylesheet" href="css/bas-material-ui.min.css">
</head>
<body>
    
    <!-- Layout Header -->
    <header class="bas-ui-layout-header">

        <div class="bas-ui-app-bar">
             ...
        </div>

        <div class="bas-ui-tool-bar">
             ...
        </div>

    </header>

    <!-- Layout Side Nav -->
    <div class="bas-ui-side-nav">

        <div class="bas-ui-side-nav-wrapper">

            <div class="brand">
                ...
            </div>

            <div class="bas-ui-side-nav-content-wrapper">
                ...
            </div>

            <div class="footer">
                ...
            </div>

        </div>

    </div>

    <!-- Layout Body -->
    <main class="bas-ui-main bas-ui-scrollbar-y">
        ...
    </main>
    
    <!-- jQuery first, then BasMaterial JS. -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js"></script>
    <script src="js/bas-material-ui.min.js"></script>
</body>
</html>
```

## Package dependencies

No need to separately include the following libraries, are already included in this library:

- Material Design Icons
- Parsley (2.1.3)
- jQuery Easing (v1.3.0)
- jQuery Hammer (v2.0.0)
- jQuery Element Resize (v0.2.2)
- Ajax AutoComplete for jQuery (v1.2.24)
- Dropzone (v4.2.0)
- Autosize (v3.0.8)
- tether (v1.1.1)
- VelocityJS (v1.2.2)
- Waves (v0.7.2)
- Animate Sass (v0.6.4)

External dependencies, should be included separately:

- jQuery (v3.0.0)

## Tools Installation

Install the main tools (require sudo on certain systems):

```
npm install -g grunt
npm install -g grunt-cli
npm install -g bower
```

Install the project dependencies, change to the project's root directory (require sudo on certain systems):

```
bower install
npm install
```

Run Grunt:

```
grunt
```

Grunt will then watch concurrently for changes to src and hbs folders, scss and hbs files build each as required.

## Backers

### Maintainers

These amazing people are maintaining this project:

- [Basgrani](http://basgrani.com) - [view contributions](https://github.com/Basgrani-Org/bas-material-ui/commits?author=Basgrani)

### Sponsors

No sponsors yet! Will you be the first? [I want to be a sponsor...](mailto:dev@basgrani.com?subject=I want to be a sponsor to BasMaterial UI)

[![Donate to this project using Paypal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VKV3GRW7R6MLW)

### Contributors

These amazing people have contributed code to this project:

- [Basgrani](http://basgrani.com) - [view contributions](https://github.com/Basgrani-Org/bas-material-ui/commits?author=Basgrani)

### Contribute

If you wish you can contribute to the development of this project:

- Install tools and contribute with your code

- [Donate](http://bas-material-ui.basgrani.com/home/donate.html)

## Links

- [Google Material Design](https://material.io/guidelines)

## License

- View the [LICENSE](https://github.com/Basgrani-Org/bas-material-ui/blob/master/LICENSE.md)
