(function(name,data){
 if(typeof onTileMapLoaded === 'undefined') {
  if(typeof TileMaps === 'undefined') TileMaps = {};
  TileMaps[name] = data;
 } else {
  onTileMapLoaded(name,data);
 }
 if(typeof module === 'object' && module && module.exports) {
  module.exports = data;
 }})("test_level",
{ "height":10,
 "layers":[
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 0, 0, 0, 4, 1, 1, 0, 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
         "height":10,
         "name":"Tile Layer 1",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":10,
         "x":0,
         "y":0
        }],
 "nextobjectid":1,
 "orientation":"orthogonal",
 "renderorder":"right-down",
 "tileheight":50,
 "tilesets":[
        {
         "columns":0,
         "firstgid":1,
         "grid":
            {
             "height":1,
             "orientation":"orthogonal",
             "width":1
            },
         "margin":0,
         "name":"rm",
         "spacing":0,
         "tilecount":1,
         "tileheight":50,
         "tiles":
            {
             "0":
                {
                 "image":"..\/img\/forest-stage\/forest block.png"
                }
            },
         "tilewidth":50
        },
        {
         "columns":0,
         "firstgid":2,
         "grid":
            {
             "height":1,
             "orientation":"orthogonal",
             "width":1
            },
         "margin":0,
         "name":"rm",
         "spacing":0,
         "tilecount":5,
         "tileheight":50,
         "tiles":
            {
             "0":
                {
                 "image":"..\/img\/forest-stage\/forest block.png"
                },
             "1":
                {
                 "image":"..\/img\/castle-stage\/switch1.png"
                },
             "2":
                {
                 "image":"..\/img\/castle-stage\/switch2.png"
                },
             "3":
                {
                 "image":"..\/img\/castle-stage\/switch3.png"
                },
             "4":
                {
                 "image":"..\/img\/castle-stage\/switch4.png"
                }
            },
         "tilewidth":50
        }],
 "tilewidth":50,
 "type":"map",
 "version":1,
 "width":10
});

console.log(TileMaps["test_level"]);
