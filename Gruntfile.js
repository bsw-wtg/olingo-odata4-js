'use strict';
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
module.exports = function(grunt) {
  'use strict';
  var intUse = '-internal use only-';
  var pkg = grunt.file.readJSON('package.json');

  // Build artifact base name
  //<%= pkg.name %>-<%= pkg.version %>-<%= pkg.postfix %>-<%= pkg.releaseCandidate %>'
  var pkgName = pkg.name.split('-').pop();
  var artifactname = pkgName + '-' + pkg.version +
     (pkg.postfix.length > 0 ? "-" : "") + pkg.postfix +
     (pkg.releaseCandidate.length > 0 ? "-" : "") + pkg.releaseCandidate;

  //options
  var init = {
    pkg: pkg,
    pkgName: pkgName,
    banner: grunt.file.read('grunt-config/banner.txt'),
    artifactname : artifactname,

    "toBrowser" : {
      "release" : {
          options: { index : "index.js" },
          src: ["lib/**/*.js", '!**/*-node.*'],
          dest: "dist/<%= artifactname %>.js"
      }
    },
    "uglify": { // uglify and minify the lib
      options: {
        sourceMap : {
          includeSources: true
        },
        sourceMapName : "dist/<%= artifactname %>.map",
        banner : "<%= banner %>"
      },
      "browser": {
          src: "dist/<%= artifactname %>.js",
          dest: "dist/<%= artifactname %>.min.js"
      }
    },
    "jsdoc" : {
      "src" : {
          src: ["index.js","lib"],
          options: { destination: "doc", verbose : true, debug : true, pedantic : true }
      }
    },
    "nugetpack" : { // create nuget package
      "dist": {
          src: 'grunt-config/nugetpack.nuspec',
          dest: 'dist/'
      }
    },
    "copy" : {
      "to-latest" : {
          src :"dist/<%= artifactname %>.js",
          dest: "dist/<%= pkgName %>-latest.js"
      }
    },
    "priv-clean": {
      options: {force: true},
      "build": {
          src: [ "dist", "doc", "tmp" ]
      }
    }
  };
  
  //    Join local configuration for proxies and local test servers
  if (grunt.file.exists('localgrunt.config')) {
    console.log("merge localgrunt.config");
    var localGrundConfig = grunt.file.read('localgrunt.config');
    init.connect['test-browser'].proxies = init.connect['test-browser'].proxies.concat(JSON.parse(localGrundConfig).proxies);
  }

  //    Init config
  grunt.initConfig(init);

  //    Load tasks from npm modules ***/
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks("grunt-jsdoc");
  grunt.loadNpmTasks("grunt-nuget");

  //    Load the custom-* tasks from the grunt-config/custom-tasks directory
  grunt.loadTasks('grunt-config/custom-tasks'); //currently rat.js/sign.js/toBrowser.js

  //    Load the custom-* config from the grunt-config directory
  grunt.loadTasks('grunt-config'); //rat.js/sign.js/toBrowser.js

  //    Rename some tasks to avoid name clashes with the user tasks
  grunt.renameTask('clean','priv-clean'); //rat-config.js/sign-config.js/release-config.js

  //    Avoid problems with apache-rat tool
  grunt.registerTask('clearEnv', intUse, function() {
    delete process.env['JAVA_TOOL_OPTIONS']; 
  });


  //    E N D U S E R   T A S K S

  grunt.registerTask('default' , 'Show help', function() { grunt.log.write('Use grunt --help to get a list of tasks')});

  grunt.registerTask('clean', 'Clean the temporary build directories', ['priv-clean:build']);

  //    BUILD the odatajs library
  grunt.registerTask('build', 'Build the odatajs library', ['clean:build','toBrowser:release', 'uglify:browser', 'copy:to-latest']);
  grunt.registerTask('build:all', 'Build the odatajs library', ['clean:build','toBrowser:release', 'uglify:browser', 'copy:to-latest', 'nugetpack']);

  //    Create DOCumentation in /_build/doc
  grunt.registerTask('doc', 'Create documentation in folder ./doc',['clearEnv', 'jsdoc:src']);

  //    R E L E A S E    T A S K S ( tasts defined in release-config.js)
  grunt.registerTask('release','Build the odatajs library, run checks and package it in folder ./dist',[
    'priv-clean:release-dist',
    'build',
    'doc',
    'rat:dist', // check the license headers
    'compress:release-dist','compress:release-doc','compress:release-lib'
  ]);

  
  grunt.registerTask('release-sign','Sign the files which are released (run "grunt release" before"',[
    'sign:release','sign:asc','sign:asc-verify'
  ]);

  //    Runs the license header check to verify the any source file contains a license header
  grunt.registerTask('license-check','Check files for the existence of the license header', ['rat:manual','rat:dist']);
};

