"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("@oclif/errors");
const errors_2 = require("./errors");
function validate(parse) {
    function validateArgs() {
        const maxArgs = parse.input.args.length;
        if (parse.input.strict && parse.output.argv.length > maxArgs) {
            const extras = parse.output.argv.slice(maxArgs);
            throw new errors_2.UnexpectedArgsError({ parse, args: extras });
        }
        const missingRequiredArgs = [];
        let hasOptional = false;
        parse.input.args.forEach((arg, index) => {
            if (!arg.required) {
                hasOptional = true;
            }
            else if (hasOptional) { // (required arg) check whether an optional has occured before
                // optionals should follow required, not before
                throw new errors_2.InvalidArgsSpecError({ parse, args: parse.input.args });
            }
            if (arg.required) {
                if (!parse.output.argv[index]) {
                    missingRequiredArgs.push(arg);
                }
            }
        });
        if (missingRequiredArgs.length > 0) {
            throw new errors_2.RequiredArgsError({ parse, args: missingRequiredArgs });
        }
    }
    function validateFlags() {
        for (const [name, flag] of Object.entries(parse.input.flags)) {
            if (parse.output.flags[name] !== undefined) {
                for (const also of flag.dependsOn || []) {
                    if (!parse.output.flags[also]) {
                        throw new errors_1.CLIError(`--${also}= must also be provided when using --${name}=`);
                    }
                }
                for (const also of flag.exclusive || []) {
                    // do not enforce exclusivity for flags that were defaulted
                    if (parse.output.metadata.flags[also] && parse.output.metadata.flags[also].setFromDefault)
                        continue;
                    if (parse.output.metadata.flags[name] && parse.output.metadata.flags[name].setFromDefault)
                        continue;
                    if (parse.output.flags[also]) {
                        throw new errors_1.CLIError(`--${also}= cannot also be provided when using --${name}=`);
                    }
                }
            }
            else if (flag.required)
                throw new errors_2.RequiredFlagError({ parse, flag });
        }
    }
    validateArgs();
    validateFlags();
}
exports.validate = validate;