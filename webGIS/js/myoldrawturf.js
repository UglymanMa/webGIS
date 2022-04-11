var draw;
var map;
var vector;
var source;
var mybuffer_turf;
vector = new ol.layer.Vector()
window.onload = function () {
    map = new ol.Map({
//地图容器div的ID
        target: 'map',
        view: new ol.View({
            //地图初始中心点
            center: [112.929348, 28.158343],
            minZoom: 2,
            zoom: 17,
            projection: "EPSG:4326"
        })
    });
    //定义数据来源:天地图矢量地图
    var tdt_source = new ol.source.XYZ({
        url: "http://t0.tianditu.com/DataServer?T=vec_w&x=" +
            "{x}&y={y}&l={z}&tk=ec7a526f1963fc772620b0e5bf936b30",
    });
//定义数据图层:·天地图矢量地图
    var tdt_layer = new ol.layer.Tile({
        source: tdt_source
    });
    map.addLayer(tdt_layer);
//定义数据来源:天地图地名标注图层
    var tdt_source_marker = new ol.source.XYZ({
        url: "http://t0.tianditu.com/DataServer?T=cva_w&x=" +
            "{x}&y={y}&l={z}&tk=ec7a526f1963fc772620b0e5bf936b30",
    });
    var tdt_layer_marker = new ol.layer.Tile({
        source: tdt_source_marker
    });
    map.addLayer(tdt_layer_marker);
    var defaultStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffe8ee',
            width: 2
        }),
        image: new ol.style.circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffeeee'
            })
        })
    });
    var newstyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(144,238,144,0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#98FB98',
            width: 3
        })
    });
    source = new ol.source.Vector({wrapX: true});
    vector = new ol.layer.Vector({
        source: source,
// style : defaultStyle
        style: function (feature) {
            var fea_name = feature.get('name');
            if (fea_name === 'mybuffer') {
                return newstyle;
            } else {
                return defaultStyle;
            }
        }
    });
//将绘制层添加到地图容器中
    map.addLayer(vector);
    mybuffer_turf = {
        init: function () {
//初始化一个交互选择控件,并添加到地图容器中
            this.select = new ol.interaction.Select();
            map.addInteraction(this.select);
        },
        setActive: function (active) {
            //激活选择要素控件
            this.select.setActive(active);
        },
        removeInteraction: function () {
            map.removeInteraction(this.select);
        }
    };
};

function addInteration(typevalue) {
    if (typevalue !== 'None') {
        if (source == null) {
            source = new ol.source.Vector({wrapx: true});
            //添加绘制层数据源
            vector.setSource(source);
        }
        var geometryFunction, maxPoints;
        if (typevalue === 'Square') {
            typevalue = 'Circle';//正方形图形（圆)
            geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
        } else if (typevalue === 'Box') {
            typevalue = 'Circle';
            geometryFunction = new ol.interaction.Draw.createBox();
        } else if (typevalue === 'Star ') {
        }
        typevalue = 'Circle';
        geometryFunction = function (coordinates, geometry) {
            var center = coordinates[0];
            var last = coordinates[coordinates.length - 1];
            var dx = center[0] - last[0];
            var dy = center[1] - last[1];
            var radius = Math.sqrt(dx * dx + dy * dy);
            var rotation = Math.atan2(dy, dx);
            var newCoordinates = [];
            var numPoints = 12;
            for (var i = 0; i < numPoints; ++i) {
                var angle = rotation + (i * 2 * Math.PI) / numPoints;
                var fraction = i % 2 === 0 ? 1 : 0.5;
                var offsetX = radius * fraction * Math.cos(angle);
                var offsetY = radius * fraction * Math.sin(angle);
                newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
                newCoordinates.push(newCoordinates[0].slice());
                if (!geometry) {
                    geometry = new ol.geom.Polygon([newCoordinates]);
                } else {
                    geometry.setCoordinates([newCoordinates]);
                }
                return geometry;
            }
            ;
        }
        draw = new ol.interaction.Draw({
            //绘制层数据源
            source: source, type: typevalue,
//几何信息变更时调用函数
            geometryFunction: geometryFunction,//最大点数
            maxPoints: maxPoints
        });
        map.addInteraction(draw);
    } else {
        source = null;//清空绘制图形
        vector.setSource(source);
    }
    ;
}

var initDraw = function () {
//移除绘制图形
    map.removeInteraction(draw);//默认背景色
    document.getElementById("polygonBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("lineBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("circleBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("pointBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("eraserBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("squareBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("recBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("starBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("editBtn").style.background = "rgba(0,60,136,.5)";
};
//默认为画点
var drawPoint = function () {
    initDraw();
    //添加交互绘制功能控件
    addInteraction("Point");
    document.getElementById("pointBtn").style.background = "#22A6F2";
    document.getElementById("pointBtn").style.color = "#eee";
};
//画线
var drawLine = function () {
    initDraw();
    //添加交互绘制功能控件
    addInteraction("LineString");
    document.getElementById("lineBtn").style.background = "#22A6F2";
    document.getElementById("lineBtn").style.color = "#eee";
};
var drawPolygon = function () {
    initDraw();
//添加交互绘制功能控件
    addInteraction("Polygon");
    document.getElementById("polygonBtn").style.background = "#22A6F2";
    document.getElementById("polygonBtn").style.color = "#eee";
};
//画圆
var drawCircle = function () {
    initDraw();
//添加交互绘制功能控件
    addInteraction("Circle");
    document.getElementById("circleBtn").style.background = "#22A6F2";
    document.getElementById("circleBtn").style.color = "#eee";
};
//画正方形
var drawSquare = function () {
    initDraw();
//添加交互绘制功能控件
    addInteraction("Square");
    document.getElementById("squareBtn").style.background = "#22A6F2";
    document.getElementById("squareBtn").style.color = "#eee";
};
//画长方形
var drawRec = function () {
    initDraw();
    //添加交互绘制功能控件
    addInteraction("Box");
    document.getElementById("recBtn").style.background = "#22A6F2";
    document.getElementById("recBtn").style.color = "#eee";
};
//画长方形
var drawStar = function () {
    initDraw();
//添加交互绘制功能控件
    addInteraction("Star");
    document.getElementById("starBtn").style.background = "#22A6F2";
    document.getElementById("starBtn").style.color = "#eee";
};
//清空
var drawEraser = function () {
    initDraw();
    source.clear();
    document.getElementById("eraserBtn").style.background = "#22A6F2";
    document.getElementById("eraserBtn").style.color = "#eee";
};
var selectFea = function () {
    initDraw();
    selectTool.setActive(true);
    document.getElementById("selectBtn").style.background = "#22A6F2";
    document.getElementById("selectBtn").style.color = "#eee";
};
var editFea = function () {
    initDraw();
//初始化几何图形修改控件
    Modify.init();
//激活几何图形修改控件;
    Modify.setActive(true);
    document.getElementById("editBtn").style.background = "#22A6F2";
    document.getElementById("editBtn").style.color = "#eee";
};



