import test from "tape";
import Lexer, { tokens } from "../lexer.mjs";

test("Lexer", function (t) {
  const lexer = new Lexer(`;BEGIN`);
  let token = lexer.getNextToken();
  t.equal(token.type, tokens.semi);
  token = lexer.getNextToken();
  t.equal(token.type, tokens.BEGIN);
  t.end();
});
