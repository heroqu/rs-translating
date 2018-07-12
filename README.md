# Translating

a sub-project of [React i18n site](https://github.com/heroqu/react-i18n-site).

This sub-project is designed to facilitate the preparation of key phrase translation files for the main React site which uses [React-intl](https://www.npmjs.com/package/react-intl) package for i18n.

It uses the power of [Gulp](https://gulpjs.com) to automate all the routine procedures.

## Directory structure

Main files and directories to be dealt with here are looking like this:

```
translating
├── build
│  └── messages.json
├── edited
│  ├── en.json
│  ├── ru.json
│  └── ...
├── extracted
│  ├── Component1.json
│  ├── Component2.json
│  └── ...
├── sample
│  └── sample.json
│
├── config
│  ├── index.js
│  ├── external.js
│  └── internal.js
├── gulpfile.js
└── package.json
```

One can change the names of sub-directories in configuration file `config/internal.js`.

One can also change the final destination directory (that is outside of this project) by editing `config/external.js`

## The steps

Here are the steps one is supposed to do inside this sub-project to prepare the translations:

1. `gulp extract`

  Extracts key phrases from all `<FormattedMessage>` React components used inside the main site. The results are stored as json files inside /extracted directory.

2. `gulp sample`

  Collects the key phrases from all those files, dedupes them and put the result into a single `/sample/sample.json` file. This is the file that can be treated as a starting point for any particular language.

3. Now we need some human being to do actual translation. One has to make a separate copy of` sample.json` for each target language, rename it accordingly (`en.json`, `ru.json` etc.), put it into `/edited` directory and finally edit: translate all the key phrases

4. `gulp build`

  Merges all edited translation files into production ready file, namely `/build/messages.json`

5. `gulp deploy`

  Copies `/build/messages.json` file into a directory of the main React site.
