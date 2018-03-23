module.exports = {
  mode: process.env.NODE_ENV || 'development',

  entry: __dirname,

  resolve: {
    alias: {
      flyweight: `${__dirname}/../../src`
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
      }
    ]
  },
  serve: {
    content: __dirname
  }
}
