require.config({
    paths: {}
});

define(['cocos2d', 'dropzone'], function (cc, DropZone, _) {
    'use strict';

    var NumberBondDropZone = DropZone.extend({

        ctor: function() {
            this._super();
            
        },

    });

    return NumberBondDropZone;

});
