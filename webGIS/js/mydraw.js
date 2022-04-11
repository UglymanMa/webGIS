var layer = new Array(); //map中的图层数组
var layerName = new Array(); //图层名称数组
var layerVisibility = new Array(); //图层可见属性数组
var draw;
var map;
var vector;
var source;
var selectTool, menu_overlay;
var my_buffer_turf;

function loadLayersControl(map, id) {
    var treeContent = document.getElementById(id); //图层目录容器
    var layers = map.getLayers(); //获取地图中所有图层
    for (var i = 0; i < layers.getLength(); i++) {
        //获取每个图层的名称、是否可见属性
        layer[i] = layers.item(i);
        layerName[i] = layer[i].get('name');
        layerVisibility[i] = layer[i].getVisible();

        //新增li元素，用来承载图层项
        var elementLi = document.createElement('li');
        treeContent.appendChild(elementLi); // 添加子节点
        //创建复选框元素
        var elementInput = document.createElement('input');
        elementInput.type = "checkbox";
        elementInput.name = "layers";
        elementLi.appendChild(elementInput);
        //创建label元素
        var elementLable = document.createElement('label');
        elementLable.className = "layer";
        //设置图层名称
        setInnerText(elementLable, layerName[i]);
        elementLi.appendChild(elementLable);

        if (layerVisibility[i]) {
            elementInput.checked = true;
        }
        addChangeEvent(elementInput, layer[i]); //为checkbox添加变更事件
    }
}

function addChangeEvent(element, layer) {
    element.onclick = function () {
        if (element.checked) {
            layer.setVisible(true); //显示图层
        } else {
            layer.setVisible(false); //不显示图层
        }
    };
}

function setInnerText(element, text) {
    if (typeof element.textContent == "string") {
        element.textContent = text;
    } else {
        element.innerText = text;
    }
}

window.onload = function () {
    //实例化Map对象加载地图
    var mybuffer_turf;
    var mousePositionControl = new ol.control.MousePosition({
        //样式类名称
        className: 'mouse-position',
        //投影坐标格式，显示小数点后边多少位
        coordinateFormat: ol.coordinate.createStringXY(6),
        //指定投影
        projection: 'EPSG:4326',
        //目标容器
        target: document.getElementById('my-mouse-position')
    });
    map = new ol.Map({
        target: 'map', //地图容器div的ID
        //地图容器中加载的图层
        layers: [
            //加载瓦片图层数据
            new ol.layer.Tile({
                source: new ol.source.OSM(),
                name: '世界地图(OSM瓦片)'
            }),
            new ol.layer.Tile({
                title: "天地图矢量图层", source: new ol.source.XYZ({
                    url: "http://t0.tianditu.com/DataServer?T=vec_w&x=" +
                        "{x}&y={y}&l={z}&tk=ec7a526f1963fc772620b0e5bf936b30",
                }),
                name: '天地图矢量图层'
            }),
            new ol.layer.Tile({
                title: "天地图矢量图层注记", source: new ol.source.XYZ({
                    url: "http://t0.tianditu.com/DataServer?T=cva_w&x=" +
                        "{x}&y={y}&l={z}&tk=ec7a526f1963fc772620b0e5bf936b30",

                }),
                name: '天地图矢量图层注记'
            }),
            new ol.layer.Tile({
                title: "天地图影像图层", source: new ol.source.XYZ({
                    url: "http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&" +
                        "tk=ec7a526f1963fc772620b0e5bf936b30",
                }),
                name: "天地图影像图层"
            }),
            new ol.layer.Tile({
                title: "天地图影像图层注记", source: new ol.source.XYZ({
                    url: "http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&" +
                        "tk=ec7a526f1963fc772620b0e5bf936b30",
                }),
                name: "天地图影像图层注记",
            }),
            new ol.layer.Tile({
                title: "天地图地形渲染", source: new ol.source.XYZ({
                    url: "http://t0.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&" +
                        "tk=ec7a526f1963fc772620b0e5bf936b30",
                    wrapX: true
                }),
                name: "天地图地形渲染"
            }),

            <!--
                                new ol.layer.Vector({
                                    source: new ol.source.Vector({
                                        url: 'Desktop/geojson/china.geojson',
                                        format: new ol.format.GeoJSON()
                                    }),
                                    name: '中国(Json格式矢量图)'
                                }),
                                new ol.layer.Vector({
                                    source: new ol.source.Vector({
                                        url: 'Desktop/kml/2012-02-10.kml',
                                        format: new ol.format.KML({
                                            extractStyles: false
                                        })
                                    }),
                                    name: '点(KML格式矢量图)'
                                })
                            -->
        ],
        //地图视图设置
        view: new ol.View({
            //地图初始中心点
            center: [112.929348, 28.158343],
            minZoom: 2,
            zoom: 17,
            projection: "EPSG:4326"
        })
        //controls:ol.control.default().extend([mousePositionControl])
    });
    map.addControl(mousePositionControl);
    //实例化ZoomSlider控件并加载到地图容器中
    var zoomslider = new ol.control.ZoomSlider();
    map.addControl(zoomslider);
    //实例化zoomToExent控件并加载到地图容器中
    var zoomToExent = new ol.control.ZoomToExtent({
        extend: [13100000, 4290000,
            13200000, 5210000
        ]
    });
    map.addControl(zoomToExent);
    //加载图层列表数据
    loadLayersControl(map, "layerTree");
    var defaultStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffe8ee',
            width: 2
        }),
        image: new ol.style.Circle({
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
    window['vector'] = new ol.layer.Vector({
        source: source,
// style : defaultStyle
        style: function (feature) {
            var customStyle = feature.get('customStyle');
            var fea_name = feature.get('name');
            if (fea_name === 'mybuffer') {
                return newstyle;
            } else {
                return customStyle || defaultStyle;
            }
        }
    });
    /*vector({
        source: source,
        style: function (feature) {
            var fea_name = feature.get('name');
            if (fea_name === 'mybuffer') {
                return newstyle;
            } else {
                return defaultStyle;
            }
        }
    });*/
    map.addLayer(vector);
    my_buffer_turf = {
        init: function () {
            this.select = new ol.interaction.Select();
            map.addInteraction(this.select);

            this.modify = new ol.interaction.Modify({
                features: this.select.getFeatures()
            });
            map.addInteraction(this.modify);
        },
        setActive: function (active) {
            this.select.setActive(active);
            this.modify.setActive(active);
        },
        removeInteraction: function () {
            map.removeInteraction(this.modify);
            map.removeInteraction(this.select);
        }
    };

    Modify = {
        init: function () {
            //初始化一个交互选择控件,并添加到地图容器中
            this.select = new ol.interaction.Select();
            map.addInteraction(this.select);
            //初始化一个交互编辑控件，并添加到地图容器中
            this.modify = new ol.interaction.Modify({
                //选中的要素
                features: this.select.getFeatures()
            });
            map.addInteraction(this.modify);
        },
        setActive: function (active) {
            //激活选择要素控件
            this.select.setActive(active);//激活修改要素控件
            this.modify.setActive(active);
        },
        removeInteraction: function () {
            map.removeInteraction(this.modify);
            map.removeInteraction(this.select);
        }
    };
    menu_overlay = new ol.Overlay({
        element: document.getElementById("popup"),
        positioning: 'center-center'
    });
    menu_overlay.setMap(map);
    //取消默认的右键
    map.getViewport().oncontextmenu = function (e) {
        e.preventDefault();
        var coordinate = map.getEventCoordinate(event);
        if (selectTool.getFeatures().getLength() != 0) {
            menu_overlay.setPosition(coordinate);
        }
    };
    selectTool = new ol.interaction.Select({
        layers: [vector]
    });
    map.addInteraction(selectTool);
    selectTool.setActive(false);
}
;

function addInteraction(typevalue) {
    //vector = new ol.layer.Vector;
    if (typevalue !== 'None') {
        if (source == null) {
            source = new ol.source.Vector({wrapX: true});
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
        } else if (typevalue === 'Star') {
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
                }
                newCoordinates.push(newCoordinates[0].slice());
                if (!geometry) {
                    geometry = new ol.geom.Polygon([newCoordinates]);
                } else {
                    geometry.setCoordinates([newCoordinates]);
                }
                return geometry;
                ;
            }
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
    map.removeInteraction(my_buffer_turf.removeInteraction());
    document.getElementById("polygonBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("lineBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("circleBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("pointBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("eraserBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("squareBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("recBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("starBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("editBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("selectBtn").style.background = "rgba(0,60,136,.5)";
    document.getElementById("bufferBtn").style.background = "rgba(0,60,136,.5)";
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
    my_buffer_turf.init();
    my_buffer_turf.setActive(true);
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
//激活几何图形修改控件;
    document.getElementById("editBtn").style.background = "#22A6F2";
    document.getElementById("editBtn").style.color = "#eee";
};
var bufferFea = function () {
    initDraw();
    document.getElementById("bufferBtn").style.background = "#22A6F2";
    document.getElementById("bufferBtn").style.color = "#eee";
    var ol_fea = my_buffer_turf.select.getFeatures().getArray();
    var geoJSONFormat = new ol.format.GeoJSON();
    if (ol_fea.length === 0) {
        console.log("未选择绘制的要素! ");
    } else {
        var ol_json;
        console.log(ol_fea[0].getGeometry().getType());
        if (ol_fea[0].getGeometry().getType() === 'Circle') {
            var circle_polygon = new ol.geom.Polygon.fromCircle(ol_fea[0].getGeometry());
            ol_json = geoJSONFormat.writeGeometryObject(circle_polygon);
            console.log(JSON.stringify(ol_json, null, "\t"));
        } else {
            ol_json = geoJSONFormat.writeFeaturesObject(ol_fea);
            console.log(JSON.stringify(ol_json, null, "\t"
            ));
        }
        var turf_buffered = turf.buffer(ol_json, 50, {units: 'meters'});
        var bufferFeature = geoJSONFormat.readFeatures(turf_buffered);
        console.log(bufferFeature);
        bufferFeature[0].setProperties({name: "mybuffer"});
        console.log(bufferFeature);
        console.log(bufferFeature.name);
        vector.getSource().addFeatures(bufferFeature);
        console.log("缓冲器分析结束");
    }
};
var changeFeatureStyle = function () {
    var newcolor = document.getElementById("linecolor").value;
    var fillcolor = document.getElementById("fillcolor").value;
    var linewidth = document.getElementById("linewidth").value;
    var new_style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: fillcolor
        }),
        stroke: new ol.style.Stroke({
            color: newcolor,
            width: eval(linewidth)
        }),
        image: new ol.style.Circle({
            radius: 7,
            fi1l: new ol.style.Fill({
                color: '#ff0000'
            })
        })
    });
    selectTool.getFeatures().item(0).set('customStyle', new_style);
//selectTool.getFeatures( ) .getArray()[0].setStyle(newstyle);
    menu_overlay.setPosition(undefined);
};
var popupClose = function () {
    menu_overlay.setPosition(undefined);
}