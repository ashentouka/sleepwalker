{
    const chalk = require("chalk");
    const StopWatch = require("./stopwatch");
    const gradient = require("gradient-string");
    const animation = require("chalk-animation");
    const colors = require("chalk-css-colors");

    function colorFactory(color, bold) {
        if (color) {
            if (color.startsWith("#")) {
                return chalk.hex(color);
            } else  {
                let c = colors[color];
                if (!c) c = chalk(color);
                if (c) return c;
            }
        } 
        return t => { return t }
    }
    
    let _r_once = false;
    let _r_mod;

    const ANSI = "\u001B[1F\u001B[G\u001B[2K";

    function factory(prefix){
        
        function komponent(name, color, brackets) {
            brackets = brackets || "[]";
            let _m_n = name;
            let _m_c = colorFactory(color);
            let bracket_b = brackets.substr(Math.ceil(brackets.length / 2));
            let bracket_a = brackets.substr(0, Math.ceil(brackets.length / 2));

            return factory(`${prefix||""}${bracket_a}${_m_c(_m_n)}${bracket_b}`);
        }

        function logger(...args) {
            _r_once = false;
            _r_mod = prefix;
            console.log.apply(null, [prefix].concat(args));
        }

        function replace(...args) {
            if (_r_once && _r_mod === prefix) {
                console.log.apply(null, [ANSI + prefix].concat(args));
            } else {
                _r_once = true;
                _r_mod = prefix;
                console.log.apply(null, [prefix].concat(args));
            }
        }

        return {
            komponent, logger, replace
        }
    }

    module.exports = {
        komponent: factory().komponent,
        chalk,
        colors,
        StopWatch,
        gradient,
        animation
    }
}
