const gulp = require('gulp')
const babel = require('gulp-babel')
const gulpReduce = require('gulp-reduce-async')
const gulpRename = require('gulp-rename')
const gulpFileChange = require('gulp-filechange')
const path = require('path')
const del = require('del')

const CONFIG = require('./config')

const SRC_PATTERN = `${path.resolve(CONFIG.src)}/**/*.js`

gulp.task('extract:clean', () => del([CONFIG.extracted]))

/**
 * 1. Extract all the react-intl key string from React components
 */
gulp.task('extract', ['extract:clean'], () =>
  gulp
    .src(SRC_PATTERN)
    .pipe(
      gulpFileChange(file => {
        /**
        * The goal of this step is to keep this project decoupled
        * from main React site. The point is that babel
        * does lookup of its own plugins based on file (vinyl object)
        * location, and we get a problem here as this location is
        * currently inside React app, which is 'external' to this project
        * and we don't like to install all the react-intl plugins there, we
        * want them to be here.
        * This is why we modify the path and base of each file on the fly
        * to be inside CWD, thus babel will lookup the plugins here.
        */
        const src = path.resolve(CONFIG.src)
        file.base = file.base.replace(src, file.cwd)
        file.path = file.path.replace(src, file.cwd)
      })
    )
    .pipe(
      babel({
        babelrc: false,
        presets: ['react-app'],
        plugins: [
          [
            'react-intl',
            {
              messagesDir: CONFIG.extracted,
              enforceDescriptions: false
            }
          ]
        ]
      })
    )
)

/**
 * 2. Combine all the extracted keys into a sample translation file.
 * This sample can be copied for each locale, translated and stored
 * manually in the `/edited` directory
 */
gulp.task('sample', () =>
  gulp
    .src(`${path.resolve(CONFIG.extracted)}/**/*.json`)
    .pipe(
      gulpReduce((acc, content, file, cb) => {
        const accObj = JSON.parse(acc)
        const descriptors = JSON.parse(content)

        const collection = descriptors.reduce(
          (coll, { id, defaultMessage }) => {
            if (coll.hasOwnProperty(id)) {
              throw new Error(`Duplicate message id: ${id}`)
            }
            coll[id] = defaultMessage
            return coll
          },
          accObj
        )

        cb(null, JSON.stringify(collection, null, 2))
      }, '{}')
    )
    .pipe(gulpRename('sample.json'))
    .pipe(gulp.dest(CONFIG.sample))
)

/**
 * 3. After all translation files for all the locales are ready
 * combine them into a single file
 */
gulp.task('build', () =>
  gulp
    .src(`${path.resolve(CONFIG.edited)}/**/*.json`)
    .pipe(
      gulpReduce((acc, content, file, cb) => {
        const obj = JSON.parse(acc)
        const key = path.basename(file.path, path.extname(file.path))
        obj[key] = JSON.parse(content)
        cb(null, JSON.stringify(obj, null, 2))
      }, '{}')
    )
    .pipe(gulpRename('messages.json'))
    .pipe(gulp.dest(CONFIG.build))
)

/**
 * 4. Send traslations file to the main React site
 */
gulp.task('deploy', () => {
  gulp
    .src(`${path.resolve(CONFIG.build)}/messages.json`)
    .pipe(gulp.dest(CONFIG.dest))
})

gulp.task('watch', function(){
  gulp.watch(SRC_PATTERN, ['extract'])
})
