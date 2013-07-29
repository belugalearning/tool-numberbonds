require.config({
    paths: {}
});

define(['cocos2d', 'bldrawnode', 'underscore'], function (cc, BLDrawNode, _) {
    'use strict';

    var DropZone = cc.Layer.extend({

        area: undefined,
        _stackDraggables: false,
        _filled: undefined,
        _length: undefined,
        _filledArray:undefined,

        ctor: function() {
            this._super();
            this.area = new BLDrawNode();
            this.area.setZOrder(1);
            this.hideArea();
            this.addChild(this.area);

            // Set the default anchor point
            this.ignoreAnchorPointForPosition(false);
            this.setAnchorPoint(cc.p(0.5, 0.5));
        },

        _getPolySize: function (poly) {
            var min = cc.p(999999,999999);
            var max = cc.p(0,0);
            _.map(poly, function (p) {
                min.x = Math.min(min.x, p.x);
                min.y = Math.min(min.y, p.y);
                max.x = Math.max(max.x, p.x);
                max.y = Math.max(max.y, p.y);
            });
            return cc.SizeMake(max.x - min.x, max.y - min.y);
        },

        setShape: function (shape) {
            var size = {};

            if (_.isArray(shape)) {
                this.area.vertices = shape;
                this.area.drawPoly(shape, cc.c4f(255, 0, 0, 0.2), 1, cc.c4f(255,0,0,0.2));
                size = this._getPolySize(shape);
                this.setContentSize(size);
            }

            if (cc.SPRITE_DEBUG_DRAW > 0) {
                this.area.drawPoly([cc.p(0,0), cc.p(0, size.height), cc.p(size.width, size.height), cc.p(size.width, 0)], cc.c4f(0, 1, 0, 0), 1, cc.c4f(0,1,0,0.2));
            }

        },

        _label: undefined,
        setLabel: function (text) {
            text = text || '';
            if (_.isUndefined(this._label)) {
                this._label = cc.LabelTTF.create(text, "mikadoBold", 30);
                this.addChild(this._label);  
            }
            this._label.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));
        },

        _isPointInsideArea: function (point, area) {
            var self = this;

            var nCross = 0;

            _.each(area, function (p1, i) {
                p1 = {
                    x: p1.x + (self.getPosition().x),
                    y: p1.y + (self.getPosition().y)
                };
                var p2 = area[(i + 1) % area.length];
                p2 = {
                    x: p2.x + (self.getPosition().x),
                    y: p2.y + (self.getPosition().y)
                };

                if (p1.y == p2.y) {
                    return;
                }

                if (point.y < Math.min(p1.y, p2.y)) {
                    return;
                }

                if (point.y >= Math.max(p1.y, p2.y)) {
                    return;
                }

                var x = (point.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;


                if (x > point.x) {
                    nCross++;
                }
            });

            if (nCross % 2 == 1) {
                return true;
            }
            return false;
        },

        isPointInsideArea: function (point) {
            return this._isPointInsideArea(point, this.area.vertices);
        },

        showArea: function () {
            this.area.setVisible(true);
        },

        hideArea: function () {
            this.area.setVisible(false);
        },

        findPositionFor: function (draggable) {
            // draggable.setPositionX(this.getPositionX() + 60);
            if (this._stackDraggables) {
                // set it's position
                // rotate an angle
                // update label count
            }
        }

    });

    return DropZone;

});
