{
    const chalk = require("chalk");
    const StopWatch = require("./stopwatch");
    const gradient = require("gradient-string");
    const animation = require("chalk-animation");

    function colorFactory(color, bold) {
        if (color) {
            if (color.startsWith("#")) {
                if (! bold) {
                    return chalk.hex(color);
                } else {
                    return chalk.hex(color).bold;
                }
            } else if (! bold) {
                return chalk[color];
            } else {
                return chalk[color].bold;
            }
        } else {
            return t => { return t }
        }
    }
   
    function konsole(name, color) {
        let _m_n = name;
        let _m_c = colorFactory(color, true);
        let _r_once = false;

        function logger(...args) {
            _r_once = false;
            console.log.apply(null, [`[${_m_c(_m_n)}]`].concat(args));
        }

        function replace(...args) {
            if (!_r_once) {
                logger.apply(null, args);
                _r_once = true;
            } else 
            console.log.apply(null, [`\u001B[1F\u001B[G\u001B[2K[${_m_c(_m_n)}]`].concat(args));
        }

        return {
            logger,
            replace,
            
            submodule(name, color) {
                let _s_c = colorFactory(color, false);
                let _sr_once = false;

                function s_logger(...args) {
                    _sr_once = false;
                    console.log.apply(null, [`[${_m_c(_m_n)}|${_s_c(name)}]`].concat(args));
                }

                function s_replace(...args) {
                    if (!_sr_once) {
                        s_logger.apply(null, args);
                        _sr_once = true;
                    } else 
                    console.log.apply(null, [`\u001B[1F\u001B[G\u001B[2K[${_m_c(_m_n)}|${_s_c(name)}]`].concat(args));
                }

                return {
                    logger: s_logger,
                    replace: s_replace
                }
            }
        }
    }

    module.exports = {
        konsole,
        chalk,
        StopWatch,
        gradient,
        animation
    }
}
