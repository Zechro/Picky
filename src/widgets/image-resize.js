


class Cropper{
    constructor(canvas, button){
        //set canvas and button elements
        this.canvas = canvas;
        this.button = button;
        this.context = canvas.getContext('2d');
        this.self = this;
        this.source = "https://i.imgur.com/U00REFb.jpg";
        
    }
    
    setSource(source){
        this.source = source;
        this.initialize();
    }
    
    addImageProcess(src){
        return new Promise((resolve, reject) => {

          let img = new Image()
          img.crossOrigin = "anonymous"

          img.onload = () => {
            resolve(img)
        }
          img.onerror = () => {
              return reject
          }
          img.src = src

        })
      }

    initialize(){

        let image = new Image();
        let canvas = this.canvas;
        let ctx = this.context;
        console.log(`canvas height is ${canvas.height} canvas width is ${canvas.width}`)

       //async function to wait for image load then promise chain
        this.addImageProcess(this.source).then(image => {
            let ratio = canvas.width/image.width;
            let height = image.height * ratio , width = canvas.width;

            this.trackTransforms(ctx);
            //draw function
            let redraw = (ctx,image) => {
                // Clear the entire canvas
                var p1 = ctx.transformedPoint(0, 0);
                var p2 = ctx.transformedPoint(canvas.width, canvas.height);
                ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
                
                //redraw image
                ctx.drawImage(image, 0,0,image.width , image.height, 0 , 0 , width, height);
                
            }
            ctx.drawImage(image, 0,0, image.width , image.height, 0 , 0 , width, height);

            var lastX = canvas.width / 2;
            var lastY = canvas.height / 2;
            var dragStart, dragged;
            

            canvas.addEventListener('mousedown', function(evt) {
                document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
                lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
                lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
                dragStart = ctx.transformedPoint(lastX, lastY);
                dragged = false;
            }, false);

            canvas.addEventListener('mousemove', function(evt) {
                lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
                lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
                dragged = true;
                if (dragStart) {
                    var pt = ctx.transformedPoint(lastX, lastY);
                    ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
                    redraw(ctx, image);
                }
            }, false);

            canvas.addEventListener('mouseup', function(evt) {
                dragStart = null;
                if (!dragged)
                    zoom(evt.shiftKey ? -1 : 1);
            }, false);

            let handleScroll = (evt) => {
                var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
                if (delta){
                    zoom(delta);
                }
                return evt.preventDefault() && false;
            };

            let zoom = (clicks, ctx = this.context) => {
                var scaleFactor = 1.1;
        
                var pt = ctx.transformedPoint(lastX, lastY);
                ctx.translate(pt.x, pt.y);
                var factor = Math.pow(scaleFactor, clicks);
                ctx.scale(factor, factor);
                ctx.translate(-pt.x, -pt.y);
                redraw(ctx, image);
            }
            
            
            canvas.addEventListener('DOMMouseScroll', handleScroll, false);
            canvas.addEventListener('mousewheel', handleScroll, false);

            
        })
    }


    trackTransforms(ctx) {
        
        var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        var xform = svg.createSVGMatrix();
        ctx.getTransform = function() {
            return xform;
        }
        
    
        var savedTransforms = [];
        var save = ctx.save;
        ctx.save = function() {

            savedTransforms.push(xform.translate(0, 0));
            return save.call(ctx);
        }
        
        var restore = ctx.restore;
        ctx.restore = function() {

            xform = savedTransforms.pop();
            return restore.call(ctx);
        }
        
    
        var scale = ctx.scale;
        ctx.scale = function(sx, sy) {

            xform = xform.scaleNonUniform(sx, sy);
            return scale.call(ctx, sx, sy);
        }
        
        var rotate = ctx.rotate;
        ctx.rotate = function(radians) {
            xform = xform.rotate(radians * 180 / Math.PI);
            return rotate.call(ctx, radians);
        }
        
        var translate = ctx.translate;
        ctx.translate = function(dx, dy) {

            xform = xform.translate(dx, dy);
            return translate.call(ctx, dx, dy);
        }
        
        var transform = ctx.transform;
        ctx.transform = function(a, b, c, d, e, f) {

            var m2 = svg.createSVGMatrix();
            m2.a = a;
            m2.b = b;
            m2.c = c;
            m2.d = d;
            m2.e = e;
            m2.f = f;
            xform = xform.multiply(m2);
            return transform.call(ctx, a, b, c, d, e, f);
        }
        
        var setTransform = ctx.setTransform;
        ctx.setTransform = function(a, b, c, d, e, f) {

            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx, a, b, c, d, e, f);
        }

        var pt = svg.createSVGPoint();
        ctx.transformedPoint = function(x, y) {
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(xform.inverse());
        }
    }

    crop(){
        var image = new Image();
        image.id = "pic";
        image.src = this.canvas.toDataURL();
        return image;
    }
    
    //crop where too and somewhere different if initing twice
    cropTo( where, button = this.button){
        
        button.onclick = e => {
            var image = new Image();
            image.id = "pic";
            image.src = this.canvas.toDataURL();
            where.appendChild(image);
        }
    }
    
}




/************************************************* */
// HOW TO USE PROPERLY
/************************************************* */

// window.onload = function() {
//     let cropper = new Cropper(document.querySelector("#canvas"), document.querySelector("#button"));
//     cropper.initialize();
//     cropper.cropTo(document.querySelector("#button"))
// }





export default Cropper;
