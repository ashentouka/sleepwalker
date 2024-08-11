{
    function encode(data){
        let str = "";
        function addvalue(key,value){
            if (str.length > 0) str += "&";
            str += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
        for (let idx in data) {
            if (data.hasOwnProperty(idx)){
                let value = data[idx];
                if (value !== undefined) {
                    if (value instanceof Array){
                        for (let apos in value) {
                            addvalue(`${idx}[]`, value[apos]);
                        }
                    } else {
                        addvalue(idx,value);
                    }
                }
            }
        }
        return str;
    }

    function decode(qs) {
        let obj={};
        const pairs = qs.indexOf("&") < 0 ? [ qs ] : qs.split("&");
        for (const pdx in pairs){
            const pair = pairs[pdx];
            const key_value = pair.split("=");
            const key = decodeURIComponent(key_value[0]);
            const value = decodeURIComponent(key_value[1]);
            if (/\[\]$/.test(key)) {
                const akey = key.replace(/\[\]$/, "");
                if (!obj[akey]) {
                    obj[akey] = [ value ];
                } else {
                    obj[akey].push(value);
                }
            } else {
                obj[key] = value;
            }
        }
        return obj;
    }

    function params(qs) {
        let obj=[];
        const pairs = qs.indexOf("&") < 0 ? [ qs ] : qs.split("&");
        for (const pdx in pairs){
            const key = decodeURIComponent(pairs[pdx].split("=")[0]);
            if (/\[\]$/.test(key)) {
                obj.push(key.replace(/\[\]$/, ""));
            } else {
                obj.push(key);
            }
        }
        return obj;
    }

    module.exports = { 
        encode,
        decode,
        params
    }
}
