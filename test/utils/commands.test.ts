import {
  compileCommand,
  getParams
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

  describe("getParams", () => {
  
    it("should return a promise with the the correct parameters", () => {
      expect(getParams("send sms to 555444888 msg hello")).resolves.toEqual([
        { name: "send", value: "sms" },
        { name: "to", value: "555444888" },
        { name: "msg", value: "hello"}
      ]);
    });

    it("should throw PARAM_SYNTAX_ERROR", () => {
      expect(getParams("send hello")).rejects.toThrowError(
        errorMessages.PARAM_SYNTAX_ERROR("hello")
      );
      expect(getParams("send no")).rejects.toThrowError(
        errorMessages.PARAM_SYNTAX_ERROR("no")
      );

      expect(getParams("hello no")).rejects.toThrowError(
        errorMessages.COMMAND_INVALIDE
      );
      expect(getParams("this command doesn't exist no")).rejects.toThrowError(
        errorMessages.COMMAND_INVALIDE
      );

      expect(getParams("send sms ki hello msg hello")).rejects.toThrowError(
        errorMessages.SYNTAX_ERROR
      );
      expect(getParams("send sms to john@gmail.com mssg hello")).rejects.toThrowError(
        errorMessages.SYNTAX_ERROR
      );

    });
  });
});
