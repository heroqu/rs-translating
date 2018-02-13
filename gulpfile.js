const gulp = require('gulp')
const babel = require('gulp-babel')
const gulpReduce = require('gulp-reduce-async')
const gulpRename = require('gulp-rename')
const path = require('path')

const CONFIG = require('./config')

/**
 * 1. Extract all the key string from React components
 * that are subject for translation by react-intl
 */
gulp.task('extract', () =>
  gulp.src(`${path.resolve(CONFIG.src)}/**/*.js`).pipe(
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
 * use this task to combine them into a single file
 * to be loaded by react app.
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
 * 4. Export built traslations file to the main React site
 */
gulp.task('export', () => {
  gulp
    .src(`${path.resolve(CONFIG.build)}/messages.json`)
    .pipe(gulp.dest(CONFIG.dest))
})
