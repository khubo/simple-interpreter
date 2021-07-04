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

test("#parses real and integers", function (t) {
  const lexer = new Lexer(`123 123.54`);
  let token = lexer.getNextToken();
  t.equal(token.type, tokens.integerConst);
  token = lexer.getNextToken();
  t.equal(token.type, tokens.realConst);
  t.equal(token.value, 123.54);
  t.end();
});

test("#skips comment", function (t) {
  const lexer = new Lexer(`{test comment} 123`);
  let token = lexer.getNextToken();
  t.equal(token.type, tokens.integerConst);
  t.end();
});

test("# colon, comma, and divs", function (t) {
  const lexer = new Lexer(`123:123,123/DIV`);
  let token = lexer.getNextToken();
  t.equal(token.type, tokens.integerConst);
  token = lexer.getNextToken();
  t.equal(token.type, tokens.colon);
  token = lexer.getNextToken();
  t.equal(token.type, tokens.integerConst);
  token = lexer.getNextToken();
  t.equal(token.type, tokens.comma);
  token = lexer.getNextToken();
  t.equal(token.type, tokens.integerConst);
  token = lexer.getNextToken();
  t.equal(token.type, tokens.floatDiv);
  token = lexer.getNextToken();
  t.equal(token.type, tokens.DIV);
  t.end();
});
