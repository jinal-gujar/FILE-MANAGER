module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'test/**/*.spec.js',
      './main.js'

    ],
    exclude: [],
    preprocessors: {
      './main.js': ['coverage']
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
            dir: 'coverage/',
            reporters: [
                { type: 'html', subdir: 'html' },
                { type: 'lcov', subdir: 'lcov' },
                { type: 'text-summary' }
            ]
        },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity
  });
};
