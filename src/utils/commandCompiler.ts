import { errorMessages, regex } from "./constants";

export interface IPattern {
  name: string;
  opional?: boolean;
  pattern: IPattern[] | IPattern | RegExp;
}
/**
 * Resolves a pattern string to a regex object, for example,
 * hello|hi will resolve to /^hello$|^hi$ and test: to
 * the according regex stored in constants
 */
export const resolvePattern = (pattern: string): RegExp => {
  const ePattern = pattern.substring(1, pattern.length - 1); // remove the { }
  let resolvedPatternString = "";
  ePattern.split("|").forEach(e => {
    if (e.endsWith(":")) {
      // if it is a parametered pattern name then get it from the regex object in constants
      const foundDefaultPattern = regex[e.substring(0, e.length - 1).toUpperCase()] as RegExp;
      if (!foundDefaultPattern) {
        throw new Error(errorMessages.PATTERN_NOT_DEFINED(e));
      }
      resolvedPatternString += foundDefaultPattern.source + "|";
    } else {
      resolvedPatternString += "^" + e + "$|";
    }
  });
  try {
    return new RegExp(resolvedPatternString.substring(0,resolvedPatternString.length - 1)); // remove the last |
  } catch (regexError) {
    throw new Error(errorMessages.SYNTAX_ERROR);
  }
};

/**
 * will split the command string and checks for errors
 */
export const tokenizer = (command: string): Promise<string[]> => {
  return new Promise((resolve,reject) =>{
    if (!command || command === "") {
      reject(new Error(errorMessages.COMMAND_NULL));
    }
    command = command.trim();

    if(!regex.PATTERN_MATCH.test(command)) {      
      reject(new Error(errorMessages.SYNTAX_ERROR));
    }
    
    resolve(command.split(" "));
  });
};

/**
 * makes an IPattern object from the tokenized command
 */
export const resolver = (tokens: string[]): Promise<IPattern> => {
  return new Promise((resolve,reject) => {
    const resolvedPattern: IPattern = {
      name: tokens[0],
      pattern: [] as IPattern[]
    };

    tokens.forEach((e, i) => {
      if (regex.PATTERN_COMMAND_NAME.test(e)) {
        let opional = false;
        if (e.endsWith("?")) {
          opional = true;
          e = e.substr(0, e.length - 1);
        }
        const ePattern = { name: e, opional } as IPattern;

        // if the token after the command name is a parameter then try to resolve it
        if (tokens[i + 1] && regex.PATTERN_COMMAND_PARAM.test(tokens[i + 1])) {
          try {
            ePattern.pattern = resolvePattern(tokens[i + 1]);
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

export const compilePattern = (command: string): Promise<IPattern | void> => {
  return tokenizer(command)
    .then(resolver)
    .catch(error => {
      throw error;
      // TODO send error back to facebook API
    });
};
