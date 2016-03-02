'use strict';

var jade = require('jade');
var _ = require('underscore');
var glob = require('glob');
var fs = require('fs');
var os = require('os');

// TODO: Implement async version
function compileJadeTemplates(options) {
    var options = _.defaults(options, {
        separator: os.EOL,
        processFileName: function (name) {
            return name.replace('.jade', '.js');
        },
        processContent: function (content) {
            return content;
        },
        utilityLib: 'jade',
        error: function() {}
    });

    glob.sync(options.src)
        .filter(function (filepath) {
            if (!fs.existsSync(filepath)) {
                console.error('Source file "' + filepath + '" not found.');
                return false;
            } else {
                return true;
            }
        })
        .forEach(function (filepath) {
            var src = options.processContent(fs.readFileSync(filepath));
            var compiled;
            var destFileName = options.processFileName(filepath);

            var jadeOptions = _.extend({}, options, {
                filename: filepath,
                amd: true,
                client: true
            });

            try {
                compiled = 'define([\'' + options.utilityLib + '\'], function(jade) { if(jade && jade[\'runtime\'] !== undefined) { jade = jade.runtime; }';
                compiled = compiled + ' return ';
                compiled = compiled + jade.compileClient(src, jadeOptions).toString();
                compiled = compiled + ('});');
                fs.writeFileSync(destFileName, compiled);
                console.log('Compiled file "' + filepath + '" to "' + destFileName + '"');
                return true;
            } catch (e) {
                options.error(e);
                console.log('Jade failed to compile "' + filepath + '".');
                console.error(e);
                return false;
            }
        });
}

module.exports = {
    compile: compileJadeTemplates
}