////////////////////////////////////////////////
//                 PARSER                     /
////////////////////////////////////////////////
import util from "util";
import Lexer, { tokens } from "./lexer.mjs";

class AST {}

class BinOp extends AST {
  constructor(left, op, right) {
    super();
    this.left = left;
    this.token = op;
    this.op = op;
    this.right = right;
  }

  [util.inspect.custom]() {
    return `BinOp(${this.left}, ${this.op}, ${this.right})`;
  }
}

class Num extends AST {
  constructor(token) {
    super();
    this.token = token;
    this.value = token.value;
  }
}

class UnaryOp extends AST {
  constructor(op, expr) {
    super();
    this.token = op;
    this.op = op;
    this.expr = expr;
  }
}

class Compound extends AST {
  // `BEGIN...END` block
  constructor() {
    super();
    this.children = [];
  }
}

class Assign extends AST {
  constructor(left, op, right) {
    super();
    this.left = left;
    this.token = op;
    this.op = op;
    this.right = right;
  }
}

class Var extends AST {
  // holding variables
  constructor(token) {
    super();
    this.token = token;
    this.value = token.value;
  }
}

class NoOp extends AST {}

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
  }

  error(message) {
    throw new Error(`Invalid syntax: ${message}`);
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      this.error();
    }
  }

  // program: compound_statement DOT
  program() {
    const node = this.compoundStatement();
    this.eat(tokens.dot);
    return node;
  }

  // compound_statement: BEGIN statement_list END
  compoundStatement() {
    this.eat(tokens.BEGIN);

    const nodes = this.statementList();
    this.eat(tokens.END);

    const root = new Compound();
    for (const node of nodes) {
      root.children.push(node);
    }
    return root;
  }

  /**
   * statement_list: statement | statement SEMI statement_list
   */
  statementList() {
    const node = this.statement();

    const results = [node];

    while (this.currentToken.type === tokens.semi) {
      this.eat(tokens.semi);
      const node = this.statement();
      results.push(node);
    }

    if (this.currentToken.type === tokens.ID) this.error();
    return results;
  }

  statement() {
    let node;
    console.log("this here inside statement", this.currentToken.type);
    if (this.currentToken.type === tokens.BEGIN) {
      node = this.compoundStatement();
    } else if (this.currentToken.type === tokens.ID) {
      node = this.assignmentStatement();
    } else {
      node = this.empty();
    }

    return node;
  }

  factor() {
    const token = this.currentToken;

    if (token.type === tokens.plus) {
      this.eat(tokens.plus);
      return new UnaryOp(token, this.factor());
    }

    if (token.type === tokens.minus) {
      this.eat(tokens.minus);
      return new UnaryOp(token, this.factor());
    }

    if (token.type === tokens.integer) {
      this.eat(tokens.integer);
      return new Num(token);
    }

    if (token.type === tokens.lparen) {
      this.eat(tokens.lparen);
      const result = this.expr();
      this.eat(tokens.rparen);
      return result;
    }

    const node = this.variable();
    return node;
  }

  term() {
    let node = this.factor();
    while (
      this.currentToken.type === tokens.mul ||
      this.currentToken.type === tokens.div
    ) {
      const token = this.currentToken;
      if (token.type === tokens.mul) {
        this.eat(tokens.mul);
      } else if (token.type === tokens.div) {
        this.eat(tokens.div);
      }

      node = new BinOp(node, token, this.factor());
    }

    return node;
  }

  expr() {
    let node = this.term();
    while (
      this.currentToken.type === tokens.minus ||
      this.currentToken.type === tokens.plus
    ) {
      const token = this.currentToken;
      if (token.type === tokens.minus) {
        this.eat(tokens.minus);
      } else if (token.type === tokens.plus) {
        this.eat(tokens.plus);
      }
      node = new BinOp(node, token, this.term());
    }
    return node;
  }

  assignmentStatement() {
    const left = this.variable();
    const token = this.currentToken;
    this.eat(tokens.assign);
    const right = this.expr();
    const node = new Assign(left, token, right);
    return node;
  }

  variable() {
    const node = new Var(this.currentToken);
    this.eat(tokens.ID);
    return node;
  }

  empty() {
    return new NoOp();
  }

  parse() {
    const node = this.program();
    if (this.currentToken.type !== tokens.EOF) {
      this.error();
    }
    return node;
  }
}

export default Parser;
