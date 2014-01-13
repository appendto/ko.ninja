/*global require, define */

require.config({
    paths: {
        'underscore': '../bower_components/underscore/underscore',
        'knockout': '../bower_components/knockout.js/knockout'
    },
    shim: {
        'underscore': {
            exports: '_'
        }
    },
    packages: [{
        'name': 'esperanto',
        'location': '../bower_components/esperanto/src'
    }]
});

define([
    'underscore',
    'knockout',
    'ko.ninja.viewModel',
    'ko.ninja.model'
], function (_, ko, ViewModel, Model) {
    'use strict';
    ko.ViewModel = ViewModel;
    ko.Model = Model;
    return ko;
});