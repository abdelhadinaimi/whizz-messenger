import { compilePattern } from "../../src/utils/commandCompiler";
import { errorMessages, regex } from "../../src/utils/constants";

describe("commandCompiler", () => {
  describe("compilePattern", () => {
    it("should correctly compile", () => {
      compilePattern("send {sms|email}").then(pattern => {
        expect(pattern).toEqual({
          name: "send",
          pattern: [{ name: "send", pattern: /^sms$|^email$/, opional: false }]
        });
      });

      compilePattern("wait for {number:} in? {string:}").then(pattern => {
        expect(pattern).toEqual({
          name: "wait",
          pattern: [
            { name: "wait", opional: false },
            { name: "for", pattern: regex.NUMBER, opional: false },
            { name: "in", pattern: regex.STRING, opional: true }
          ]
        });

        expect(pattern).toEqual({
          name: "wait",
          pattern: [
            { name: "wait", opional: false },
            { name: "for", pattern: regex.NUMBER, opional: false },
            { name: "in", pattern: regex.STRING, opional: true }
          ]
        });
      });

      const combinedRegex = new RegExp(regex.STRING.source + "|^hello$");
      compilePattern("wait for {number:} in? {string:|hello}").then(pattern =>
        expect(pattern).toEqual({
          name: "wait",
          pattern: [
            { name: "wait", opional: false },
            { name: "for", pattern: regex.NUMBER, opional: false },
            { name: "in", pattern: combinedRegex, opional: true }
          ]
        })
      );
    });

    it("should throw SYNTAX_ERROR", () => {
      expect(compilePattern("send sms|email}")).rejects.toThrowError(
        errorMessages.SYNTAX_ERROR
      );
      expect(compilePattern("send sms|email?")).rejects.toThrowError(
        errorMessages.SYNTAX_ERROR
      );
      expect(compilePattern("send?")).rejects.toThrowError(
        errorMessages.SYNTAX_ERROR
      );
      expect(compilePattern("send 6")).rejects.toThrowError(
        errorMessages.SYNTAX_ERROR
      );
    });

    it("should throw COMMAND_NULL", () => {
      expect(compilePattern("")).rejects.toThrowError(
        errorMessages.COMMAND_NULL
      );
      expect(compilePattern(null)).rejects.toThrowError(
        errorMessages.COMMAND_NULL
      );
    });
    
    it("should throw PATTERN_NOT_DEFINED", () => {
      expect(compilePattern("hello {hello:}")).rejects.toThrowError(
        errorMessages.PATTERN_NOT_DEFINED("hello:")
      );
      expect(compilePattern("hello in {hello|helle|hellof:}")).rejects.toThrowError(
        errorMessages.PATTERN_NOT_DEFINED("hellof:")
      );
    });
  });
});
