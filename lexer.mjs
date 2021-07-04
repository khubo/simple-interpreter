import util from "util";

export const tokens = {
  integer: "INTEGER",
  plus: "PLUS",
  minus: "MINUS",
  EOF: "EOF",
  div: "DIV",
  mul: "MUL",
  lparen: "(",
  rparen: ")",
  ID: "ID",
  assign: "ASSIGN",
  semi: "SEMI",
  dot: "DOT",
  BEGIN: "BEGIN",
  END: "END",
};

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  [util.inspect.custom]() {
    return `Token(${this.type}, ${this.value})`;
  }
}

const RESERVED_KEYWORDS = {
  BEGIN: "BEGIN",
  END: "END",
};

////////////////////////////////////////////////
//                 LEXER                       /
////////////////////////////////////////////////
class Lexer {
  constructor(text) {
    this.text = text;
    this.pos = 0;
    this.currentChar = this.text[this.pos];
  }

  error(msg) {
    throw new Error(`invalid character ${msg}`);
  }

  peek() {
    const peekPos = this.pos + 1;
    if (peekPos > this.text.length - 1) {
      return null;
    }
    return this.text[peekPos];
  }

  // handle identifiers and reserved keywords
  _id() {
    let result = "";
    while (this.currentChar && this.currentChar.match(/[a-zA-Z_0-9]/)) {
      result += this.currentChar;
      this.advance();
    }

    // if the identifier is a reserved keyword, return that token instead
    const token = RESERVED_KEYWORDS[result]
      ? new Token(RESERVED_KEYWORDS[result], result)
      : new Token(tokens.ID, result);
    return token;
  }
  advance() {
    this.pos += 1;
    if (this.pos > this.text.length - 1) {
      this.currentChar = null;
    } else {
      this.currentChar = this.text[this.pos];
    }
  }
  skipWhitespace() {
    while (this.currentChar && this.currentChar.match(/\s/)) {
      this.advance();
    }
  }
  integer() {
    let result = "";
    while (this.currentChar && this.currentChar.match(/[0-9]/)) {
      result += this.currentChar;
      this.advance();
    }
    return new Token(tokens.integer, parseInt(result));
  }
  getNextToken() {
    while (this.currentChar) {
      // remove white spaces
      if (this.currentChar.match(/\s/)) {
        this.skipWhitespace();
        continue;
      }

      // check for identifiers or reserved keywords
      if (this.currentChar.match(/[a-zA-Z_]/)) {
        return this._id();
      }

      // check for assignment keywords
      if (this.currentChar == ":" && this.peek() == "=") {
        this.advance();
        this.advance();
        return new Token(tokens.assign, ":=");
      }

      // semicolon
      if (this.currentChar === ";") {
        this.advance();
        return new Token(tokens.semi, ";");
      }

      if (this.currentChar === ".") {
        this.advance();
        return new Token(tokens.dot, ".");
      }

      if (this.currentChar.match(/[0-9]/)) {
        return this.integer();
      }

      if (this.currentChar === "/") {
        this.advance();
        return new Token(tokens.div, "/");
      }

      if (this.currentChar === "*") {
        this.advance();
        return new Token(tokens.mul, "*");
      }

      if (this.currentChar === "+") {
        this.advance();
        return new Token(tokens.plus, "+");
      }

      if (this.currentChar === "-") {
        this.advance();
        return new Token(tokens.minus, "-");
      }

      if (this.currentChar === "(") {
        this.advance();
        return new Token(tokens.lparen, "(");
      }

      if (this.currentChar === ")") {
        this.advance();
        return new Token(tokens.rparen, ")");
      }

      this.error();
    }

    return new Token(tokens.EOF, null);
  }
}

export default Lexer;
