////////////////////////////////////////////////
//                INTERPRETER                 /
////////////////////////////////////////////////
import { tokens } from "./lexer.mjs";

class NodeVisitor {
  visit(node) {
    const methodName = `visit${node.constructor.name}`;
    return this[methodName] ? this[methodName](node) : this.genericVisit();
  }

  genericVisit(node) {
    throw new Error(`No visit method for node ${node.constructor.name}`);
  }
}

///////////////////////////////////
//   Symbol Table                //
//////////////////////////////////
class Symbol {
  constructor(name, type = null) {
    this.name = name;
    this.type = type;
  }
}

class BuiltinTypeSymbol extends Symbol {
  constructor(name) {
    super(name);
  }
}

class VarSymbol extends Symbol {
  constructor(name, type) {
    super(name, type);
  }
}

class SymbolTable {
  constructor() {
    this._symbols = {};
    this._init_builtins();
  }

  _init_builtins() {
    this.define(new BuiltinTypeSymbol("INTEGER"));
    this.define(new BuiltinTypeSymbol("REAL"));
  }

  define(symbol) {
    this._symbols[symbol.name] = symbol;
  }

  lookup(name) {
    const symbol = this._symbols[name];
    return symbol;
  }
}

export class SymbolTableBuilder extends NodeVisitor {
  constructor() {
    super();
    this.symtab = new SymbolTable();
  }

  visitBlock(node) {
    for (const declaration of node.declarations) {
      this.visit(declaration);
    }

    this.visit(node.compoundStatement);
  }

  visitProcedureDecl(node) {}

  visitProgram(node) {
    this.visit(node.block);
  }

  visitBinOp(node) {
    this.visit(node.left);
    this.visit(node.right);
  }

  visitNum(node) {}

  visitUnaryOp(node) {
    this.visit(node.expr);
  }

  visitCompound(node) {
    for (const child of node.children) {
      this.visit(child);
    }
  }

  visitAssign(node) {
    const varName = node.left.value;
    const varSymbol = this.symtab.lookup(varName);
    if (!varSymbol) {
      throw new Error(`${varName} not declared before use`);
    }

    this.visit(node.right);
  }

  visitVar(node) {
    const varName = node.value;
    const varSymbol = this.symtab.lookup(varName);

    if (!varSymbol) {
      throw new Error(`${varName} is not defined`);
    }
  }

  visitNoOp(node) {}

  visitVarDecl(node) {
    const typeName = node.type.value;
    const typeSymbol = this.symtab.lookup(typeName);
    const varName = node.varNode.value;
    const varSymbol = new VarSymbol(varName, typeSymbol);
    this.symtab.define(varSymbol);
  }
}

class Interpreter extends NodeVisitor {
  constructor(tree) {
    super();
    this.tree = tree;
    this.GLOBAL_MEMORY = {};
  }

  visitProgram(node) {
    this.visit(node.block);
  }

  visitBlock(node) {
    for (const declaration of node.declarations) {
      this.visit(declaration);
    }
    this.visit(node.compoundStatement);
  }

  visitVarDecl(node) {}
  visitType(node) {}

  visitCompound(node) {
    for (const child of node.children) {
      this.visit(child);
    }
  }

  visitNoOp(node) {}

  visitAssign(node) {
    const varName = node.left.value;
    this.GLOBAL_MEMORY[varName] = this.visit(node.right);
  }

  visitBinOp(node) {
    const op = node.op.type;
    if (op === tokens.plus) {
      return this.visit(node.left) + this.visit(node.right);
    } else if (op === tokens.minus) {
      return this.visit(node.left) - this.visit(node.right);
    } else if (op === tokens.mul) {
      return this.visit(node.left) * this.visit(node.right);
    } else if (op === tokens.DIV) {
      return Math.floor(this.visit(node.left) / this.visit(node.right));
    } else if (op === tokens.floatDiv) {
      return this.visit(node.left) / this.visit(node.right);
    }
  }

  visitUnaryOp(node) {
    const op = node.op.type;
    if (op === tokens.plus) {
      return this.visit(node.expr);
    } else if (op === tokens.minus) {
      return -this.visit(node.expr);
    }
  }

  visitVar(node) {
    const varName = node.value;
    const val = this.GLOBAL_MEMORY[varName];
    if (!val) {
      throw new Error(`Variable ${varName} is not defined`);
    }
    return val;
  }
  visitProcedureDecl(node) {}

  visitNum(node) {
    return node.value;
  }

  interpret() {
    return this.tree ? this.visit(this.tree) : "";
  }
}

export default Interpreter;
