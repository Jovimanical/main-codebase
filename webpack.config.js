var AngularPlugin = require('angular-webpack-plugin');
var BowerWebpackPlugin = require("bower-webpack-plugin");
var commonResourcePlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var DashboardPlugin = require('webpack-dashboard/plugin');
var tuteria = './tuteria/';
var src_dir = './frontend/src/scripts/tuteria/';
var skill_static = tuteria + 'static/js/';
var bowerRooot = __dirname + "/bower_components";
module.exports = {
  entry: {
    request_tutor: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "request_tutor.js"],
    request_parent: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "request_parent.js"],
    pricing_form: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "pricing_form.js"],
    request_form1: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "request_form.js"],
    subject_update: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "subject/subject_update.js"],
    subject_create: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "subject/subject_create.js"],
    subject_create_mini: [src_dir + "subject/subject_create_mini.js"],
    tutor_skill_profile: [src_dir + "auth.js",src_dir+"mobile.js", 'angular-bootstrap/ui-bootstrap-tpls.min.js', src_dir + "ts_profile/default.js"],
    featured: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "ts_profile/featured.js"],
    booking_page: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "booking/booking_page.js"],
    booking_summary: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "booking/booking_summary.js"],
    booking_summary_tutor: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "booking/booking_summary_tutor.js"],
    home: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "home.js"],
    category_featured: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "search/category_featured.js"],
    category_smart: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "search/category_smart.js"],
    tutor_profile_update: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "user/tutor_profile_update.js"],
    tutor_profile_create: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "user/tutor_profile_create.js"],
    static_pages: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "static_pages.js"],
    user_profile: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "user/user_profile.js"],
    //tutor_profile_create: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "user/tutor_profile_create.js"],
    //static_pages: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "static_pages.js"],
    news: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "news.js"],
    //user_profile: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "user/user_profile.js"],
    dashboard: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "user/dashboard.js"],
    public_profile:[src_dir+"auth.js",src_dir+"mobile.js",src_dir+"user/public_profile.js"],
    tutor_quiz: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "registration/tutor-quiz.js"],
    help: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "help.js"],
    jobs: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "jobs.js"],
    job_details: [src_dir + "auth.js",src_dir+"mobile.js", src_dir + "job_details.js"],
    update_address: [src_dir + "auth.js", src_dir+"mobile.js",src_dir + "update_address.js"],
    sampler:src_dir+"sampler.js",
    mobile2:[src_dir+"mobile.js"],
    // typeahead:src_dir+"typeahead.bundle.min.js",
    // bootstrap:src_dir+"bootstrap.min.js"
    // vendor: ['moment', 'lodash']
    //bowerRooot + "/angular/angular.min.js",
  },
  output: {
    path: __dirname,
    filename: skill_static + "[name].bundle.js",
    chunkFilename: skill_static + "[chunkhash].js"
  },
  module: {
    loaders: [
      {test: /\.json$/, loader: "json"},
      {test: /\.css$/, loader: "style-loader!css-loader"},
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          // activate source maps via loader query
          'css?sourceMap!' +
          'sass?sourceMap'
        )
      },

      // required for bootstrap icons
      {test: /\.woff$/, loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff"},
      {test: /\.ttf$/, loader: "file-loader?prefix=font/"},
      {test: /\.eot$/, loader: "file-loader?prefix=font/"},
      {test: /\.svg$/, loader: "file-loader?prefix=font/"},

      {test: /\.js$/, loaders: ['babel'], exclude: [/node_modules/]},
      // required for react jsx
      // {test: /\.js$/, loader: "jsx-loader"},
      // {test: /\.jsx$/, loader: "jsx-loader?insertPragma=React.DOM"},
      // {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}

    ],
    
  },
  resolve: {
    root: [process.cwd(), path.resolve('bower_components/'),
    ],
    // root:[process.cwd())],
    extensions: ['', '.js'],
    alias: {
      'raty$': 'raty/lib/jquery.raty.js',
      'ui-bootstrap$': 'angular-bootstrap',
      'readmore$': 'readmore',
      // 'flexslider$': 'FlexSlider/jquery.flexslider.js',
      //'typeahead$': 'typeahead.js/dist/typeahead.bundle.js',
      'parsley$': 'parsleyjs/dist/parsley.js',
      'parsley.remote$': 'parsleyjs/dist/parsley.remote.js',
      'bootstrap-tagsinput$': 'bootstrap-tagsinput/dist/bootstrap-tagsinput.js',
      'bootstrap-fileinput$': 'bootstrap-fileinput/js/fileinput.js',
      'bootstrap-timepicker$': 'bootstrap-3-timepicker/js/bootstrap-timepicker.js',
      'jquery.formset$': 'django-dynamic-formset/src/jquery.formset.js',
      'int_tel_input$': 'intl-tel-input/build/js/intlTelInput.js',
      'utilScript': 'intl-tel-input/lib/libphonenumber/build/utils.js',
      'time_picker$': 'jt.timepicker/jquery.timepicker.min.js',
      'jquery-mmenu$': 'jQuery.mmenu/src/js/jquery.mmenu.min.all.js',
      'bootstrap-sidebar':'bootstrap-sidebar/dist/js/sidebar.js',
      // 'spin.js':'spin.js/spin.js',
      // 'ladda':'ladda/dist/ladda.min.js',
      // 'cloudinary_ng':"cloudinary_ng/js/angular.cloudinary.js",
      // 'jquery.cloudinary':"cloudinary_js/js/jquery.cloudinary.js",
      // 'jquery.iframe-transport':"cloudinary_js/js/jquery.iframe-transport.js",
      // 'jquery.ui.widget':"cloudinary_js/js/jquery.ui.widget.js",
      // 'jquery.fileupload':"cloudinary_js/js/jquery.fileupload.js",
      'hello':'hello/dist/hello.all.js',
      // 'hello_google':'hello/src/modules/google.js'
    }
  },
  plugins: [
    // new AngularPlugin(),
    // new commonResourcePlugin("vendor", skill_static + "vendor.bundle.js", Infinity),
    // new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.UglifyJsPlugin({minimize:true})
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "windows.jQuery": "jquery",
    }),
    new ExtractTextPlugin("style.css"),
    new DashboardPlugin(),
    // new webpack.ResolverPlugin(
    //  new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
    // )
  ],
  externals: {
    "angular": "angular",
    "jquery": "jQuery",
    "Urls": "Urls",
    "cloudinary": "cloudinary",
    "MathJax": "MathJax",
    "Bloodhound":"Bloodhound",
    "Spinner":"Spinner",
    "mixpanel":"mixpanel"
  }

};
