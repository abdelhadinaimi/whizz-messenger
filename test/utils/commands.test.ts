import {
  compileCommand,
  execCommand,
  IPattern
} from "../../src/utils/commands";
import { errorMessages, regex } from "../../src/utils/constants";

describe("commandCompiler", () => {
  describe("compileCommand", () => {
    it("should correctly compile", () => {
      compileCommand("send {sms|email}").then(pattern => {
        expect(pattern).toEqual({
          name: "send",
          pattern: [{ name: "send", pattern: /^sms$|^email$/, opional: false }]
        });
      });

      compileCommand("wait for {number:} in? {string:}").then(pattern => {
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
      compileCommand("wait for {number:} in? {string:|hello}").then(pattern =>
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
      expect(compileCommand("send sms|email}")).rejects.toThrowError(
        errorMessages.SYNTAX_ERROR
      );
      expect(compileCommand("send sms|email?")).rejects.toThrowError(
        errorMessages.SYNTAX_ERROR
      );
      expect(compileCommand("send?")).rejects.toThrowError(
        errorMessages.SYNTAX_ERROR
      );
      expect(compileCommand("send 6")).rejects.toThrowError(
        errorMessages.SYNTAX_ERROR
      );
    });

    it("should throw COMMAND_NULL", () => {
      expect(compileCommand("")).rejects.toThrowError(
        errorMessages.COMMAND_NULL
      );
      expect(compileCommand(null)).rejects.toThrowError(
        errorMessages.COMMAND_NULL
      );
    });

    it("should throw PATTERN_NOT_DEFINED", () => {
      expect(compileCommand("hello {hello:}")).rejects.toThrowError(
        errorMessages.PATTERN_NOT_DEFINED("hello:")
      );
      expect(
        compileCommand("hello in {hello|helle|hellof:}")
      ).rejects.toThrowError(errorMessages.PATTERN_NOT_DEFINED("hellof:"));
    });
  });

  describe("execCommand", () => {
    const compiledCommand: IPattern = {
      name: "send",
      pattern: [
        { name: "send", pattern: /^sms$|^email$/, opional: false },
        { name: "for", pattern: regex.NUMBER, opional: true },
        { name: "in", opional: true }
      ]
    };

    it("should return a promise with the the correct parameters", () => {
      expect(execCommand(compiledCommand, "send sms for 5")).resolves.toEqual([
        { name: "send", value: "sms" },
        { name: "for", value: "5" }
      ]);

      expect(execCommand(compiledCommand, "send email")).resolves.toEqual([
        { name: "send", value: "email" }
      ]);

      expect(execCommand(compiledCommand, "send sms")).resolves.toEqual([
        { name: "send", value: "sms" }
      ]);

      expect(execCommand(compiledCommand, "send sms in")).resolves.toEqual([
        { name: "send", value: "sms" },
        { name: "in", value: "" }
      ]);
    });

    it("should throw PARAM_SYNTAX_ERROR", () => {
      expect(execCommand(compiledCommand, "send hello")).rejects.toThrowError(
        errorMessages.PARAM_SYNTAX_ERROR("hello")
      );
      expect(execCommand(compiledCommand, "send no")).rejects.toThrowError(
        errorMessages.PARAM_SYNTAX_ERROR("no")
      );
      expect(execCommand(compiledCommand, "send sms for me")).rejects.toThrowError(
        errorMessages.PARAM_SYNTAX_ERROR("me")
      );

      expect(execCommand(compiledCommand, "send for for in")).rejects.toThrowError(
        errorMessages.PARAM_SYNTAX_ERROR("for")
      );
    });

    // it("should throw PARAM_TOO_FEW_ARGS", () => {
    //   expect(execCommand(compiledCommand, "send")).rejects.toThrowError(
    //     errorMessages.PARAM_TOO_FEW_ARGS
    //   );
    // });

    // it("should throw PARAM_TOO_MANY_ARGS", () => {
    //   expect(
    //     execCommand(compiledCommand, "send sms email")
    //   ).rejects.toThrowError(errorMessages.PARAM_TOO_MANY_ARGS);
    // });
  });
});
