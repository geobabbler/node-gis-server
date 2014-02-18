var domain=require("domain");
module.exports = function(func){
    var F = function(){};
    var dom = domain.create();
    F.prototype.catch = function(errHandle){
        var args = arguments;
        dom.on("error",function(err){
            return errHandle(err);
        }).run(function(){
            func.call(null,args);
        });
        return this;
    }
    return new F();
};
