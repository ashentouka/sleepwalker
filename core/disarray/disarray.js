{
	class DisArray extends Array {

        constructor(...args) {
            super(...args);

            let _base = this;
            
            DisArray.prototype.displace = function (item) {
                let pos = this.length < 2 ? 0 : Math.floor(Math.random() * this.length);

                if (!this.includes(item)) {
                    this.splice(pos, 0, item);
                    return true;
                }
                return false;
            };

            const disarrange = function(array){
                array.sort((a, b) => {
                    return Math.random() > 0.5 ? 1 : -1;
                })
            };

            DisArray.prototype.disarrange = function() {
                return disarrange(this);
            }

            DisArray.prototype.push = DisArray.prototype.displace;

            DisArray.prototype.concat = function(...args){
                let output = Array.prototype.concat(...args);
                disarrange(output);
                return output;
            }

            if (args) {
                this.disarrange();
            }
        }
    }

    module.exports = DisArray;
}