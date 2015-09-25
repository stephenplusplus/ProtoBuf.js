/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * ProtoBuf.js Test Suite.
 * @author Daniel Wirtz <dcode@dcode.io>
 */
(function(global) {

    var FILE = "ProtoBuf.min.js";
    var BROWSER = !!global.window;
    var StdOutFixture = require('fixture-stdout');
    var fixture = new StdOutFixture();
    var path = require('path');

    var ProtoBuf = BROWSER ? global.dcodeIO.ProtoBuf : require(__dirname+"/../dist/"+FILE),
        ByteBuffer = BROWSER ? global.dcodeIO.ByteBuffer : ByteBuffer || require("bytebuffer"),
        util = BROWSER ? null : require("util"),
        fs = BROWSER ? null : require("fs");

        if (typeof __dirname == 'undefined') {
            __dirname = document.location.href.replace(/[\/\\][^\/\\]*$/, "");
        }

    /**
     * Constructs a new Sandbox for module loaders and shim testing.
     * @param {Object.<string,*>} properties Additional properties to set
     * @constructor
     */
    var Sandbox = function(properties) {
        this.ByteBuffer = function() {};
        for (var i in properties) {
            this[i] = properties[i];
        }
        this.console = {
            log: function(s) {
                console.log(s);
            }
        };
    };

    function fail(e) {
        throw(e);
    }

    /**
     * Test suite.
     * @type {Object.<string,function>}
     */
    var suite = {

        "oneofs": function(test) {
            try {
                var builder = ProtoBuf.loadProtoFile({
                    root: path.join(__dirname, "../googleapis"),
                    file: "google/datastore/v1beta3/datastore.proto"
                });

                var CommitRequest = builder.build("google.datastore.v1beta3.CommitRequest");
                var bb2 = CommitRequest.encode({
                    mutations: [
                        {
                            upsert: {
                                properties: {
                                    isTrue: {
                                        boolean_value: true
                                    },
                                    isFalse: {
                                        boolean_value: false
                                    }
                                }
                            }
                        }
                    ]
                });

                var commit = CommitRequest.decode(bb2);
                var upsertProperties = commit.mutations[0].upsert.properties.map;

                // Passes
                test.strictEqual(upsertProperties.isTrue.value.value_type, "boolean_value");

                // Fails
                test.strictEqual(upsertProperties.isFalse.value.value_type, "boolean_value");
            } catch (e) {
                fail(e);
            }
            test.done();
        }
    };

    if (typeof module != 'undefined' && module.exports) {
        module.exports = suite;
    } else {
        global["suite"] = suite;
    }

})(this);
