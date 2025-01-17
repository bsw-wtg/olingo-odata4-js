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
(function () {
  var init = function (exports, module, require) {
    '<% initFunction %>'
  };

  var datas = '<% filesAsFunctionList %>';

  var modules = {};

  var require = function (path) {
    var name = path.substring(path.lastIndexOf('/') + 1, path.length - 3).replace('-browser', '');
    if (modules[name]) { return modules[name].exports; }

    modules[name] = { exports: {} };
    datas[name].call(this, modules[name].exports, modules[name], require);
    return modules[name].exports;
  };

  window.odatajs = {};
  init.call(this, window.odatajs, window.odatajs, require);
})();
