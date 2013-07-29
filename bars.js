require.config({
    paths: {}
});

define(['cocos2d'], function (cc) {
    'use strict';

    var Bar = Draggable.extend({

        _homePosition: undefined,
        _length: undefined,

    });

    return Draggable;

});
