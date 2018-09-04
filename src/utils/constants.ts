export const regex = {
  EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  NUMBER: /^[0-9]*$/,
  PATTERN_COMMAND_NAME: /^[a-z]{2,10}\??$/,
  PATTERN_COMMAND_PARAM: /^(\{(?:[a-z]{2,10}:?(?![a-z])\|?)*(?<!\|)\})$/,
  PATTERN_MATCH: /^(?:[a-z]{2,10}(?: \{(?:[a-z]{2,10}:?(?![a-z])\|?)*(?<!\|)\})?)(?: [a-z]{2,10}\??(?: \{(?:[a-z]{2,10}:?(?![a-z])\|?)*?(?<!\|)\})?)*$/i,
  PHONE: /^\+[0-9]{1,4}([s/0-9]{8})$/,
  STRING: /.*/
};

export const errorMessages = {
  COMMAND_INVALIDE: "command name is invalid",
  COMMAND_NULL: "command is empty or null",
  PATTERN_NOT_DEFINED : (pattern : string) => "the pattern " + pattern + " is not defined",
  SYNTAX_ERROR: "there is a syntax error in the command",
};
