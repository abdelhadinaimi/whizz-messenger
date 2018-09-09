import { commands, errorMessages, regex } from "./constants";

export interface IPattern {
  name: string;
  opional?: boolean;
  pattern?: IPattern[] | IPattern | RegExp;
}
export interface IParam {
  name: string;
  value: string;
}



/**
 * Resolves a pattern string to a regex object, for example,
 * hello|hi will resolve to /^hello$|^hi$ and test: to
 * the according regex stored in constants
 */
const resolvePattern = (pattern: string): RegExp => {
  const ePattern = pattern.substring(1, pattern.length - 1); // remove the { }
  let resolvedPatternString = "";
  ePattern.split("|").forEach(e => {
    if (e.endsWith(":")) {
      // if it is a parametered pattern name then get it from the regex object in constants
      const foundDefaultPattern = regex[
        e.substring(0, e.length - 1).toUpperCase()
      ] as RegExp;
      if (!foundDefaultPattern) {
        throw new Error(errorMessages.PATTERN_NOT_DEFINED(e));
      }
      resolvedPatternString += foundDefaultPattern.source + "|";
    } else {
      resolvedPatternString += "^" + e + "$|";
    }
  });
  try {
    return new RegExp(
      resolvedPatternString.substring(0, resolvedPatternString.length - 1)
    ); // remove the last |
  } catch (regexError) {
    throw new Error(errorMessages.SYNTAX_ERROR);
  }
};

/**
 * will split the command string and checks for errors
 */
const tokenizer = (command: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (!command || command === "") {
      reject(new Error(errorMessages.COMMAND_NULL));
    }
    command = command.trim();

    if (!regex._PATTERN_MATCH.test(command)) {
      reject(new Error(errorMessages.SYNTAX_ERROR));
    }

    resolve(command.split(" "));
  });
};

/**
 * makes an IPattern object from the tokenized command
 */
const resolver = (tokens: string[]): Promise<IPattern> => {
  return new Promise((resolve, reject) => {
    const resolvedPattern: IPattern = {
      name: tokens[0],
      pattern: [] as IPattern[]
    };

    tokens.forEach((e, i) => {
      if (regex._PATTERN_COMMAND_NAME.test(e)) {
        let opional = false;
        if (e.endsWith("?")) {
          opional = true;
          e = e.substr(0, e.length - 1);
        }
        const ePattern = { name: e, opional } as IPattern;
        const nextToken = tokens[i + 1];
        // if the token after the command name is a parameter then try to resolve it
        if (nextToken && regex._PATTERN_COMMAND_PARAM.test(nextToken)) {
          try {
            ePattern.pattern = resolvePattern(nextToken);
          } catch (resolveError) {
            reject(resolveError);
          }
        }
        (resolvedPattern.pattern as IPattern[]).push(ePattern);
      }
    });
    resolve(resolvedPattern);
  });
};

export const compileCommand = (command: string): Promise<IPattern | void> => {
  return tokenizer(command)
    .then(resolver)
    .catch(error => {
      throw error;
    });
};

/**
 * extracts the parameters from command according to the provided compiled command
 */
const extractParamsFromCommand = (compiledCommand: IPattern, command: string): Promise<IParam[]> => {
  return Promise.resolve().then(() => {
    // tslint:disable-next-line:no-shadowed-variable
    const commands = command.split(" ");
    const patterns = compiledCommand.pattern as IPattern[];
    const params: IParam[] = [];
    let commandIndex = 0;
    // for each pattern in the compiled command check if it matches with the provided command
    patterns.forEach(pattern => {
      if (!pattern.opional || pattern.name === commands[commandIndex]) {
        if (commands[commandIndex] !== pattern.name) {
          throw new Error(errorMessages.SYNTAX_ERROR);
        }
        if (pattern.pattern) {
          const nextCommand = commands[commandIndex + 1];
          if (!(pattern.pattern as RegExp).test(nextCommand)) {
            throw new Error(errorMessages.PARAM_SYNTAX_ERROR(nextCommand));
          }
          // we have a command with a parameterd pattern, skip the parameter
          params.push({ name: pattern.name, value: nextCommand });
          commandIndex += 2;
        } else {
          // we have no pattern, skip only the pattern
          params.push({ name: pattern.name, value: "" });
          commandIndex++;
        }
      }
    });
    return params;
  });
};

/**
 * it tries to find the correct compiledCommand and resolves the command, it returns the paramters
 */
export const getParams = (command: string): Promise<IParam[]> => {
  return compiledCommandsPromise
    .then(compiledCommands => {
      if (!compiledCommands) {
        throw new Error(errorMessages.COMMAND_COMPILATION);
      }
      const compiledCommand = compiledCommands.find(c => !!c && command.startsWith(c.name));
      if(!compiledCommand){
        throw new Error(errorMessages.COMMAND_INVALIDE);
      }
      return compiledCommand;
    })
    .then(compiledCommand => {
      return extractParamsFromCommand(compiledCommand, command);
    })
    .catch(error =>{
      throw error;
    });
};

export const compiledCommandsPromise = Promise.all(
  commands.map(command => compileCommand(command))
).catch(error => {
  console.error(error);
});