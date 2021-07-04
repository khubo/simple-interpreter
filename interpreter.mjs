////////////////////////////////////////////////
//                INTERPRETER                 /
////////////////////////////////////////////////
import { tokens } from "./lexer.mjs";

class NodeVisitor {
  visit(node) {
    const methodName = `visit${node.constructor.name}`;
    return this[methodName] ? this[methodName](node) : this.genericVisit();
  }

  genericVisit() {
    throw new Error(`No visit method for node ${node.constructor.name}`);
  }
}
class Interpreter extends NodeVisitor {
  constructor(parser) {
    super();
    this.parser = parser;
    this.GLOBAL_SCOPE = {};
  }

  visitCompound(node) {
    for (const child of node.children) {
      this.visit(child);
    }
  }

  visitNoOp(node) {}

  visitAssign(node) {
    const varName = node.left.value;
    this.GLOBAL_SCOPE[varName] = this.visit(node.right);
  }

  visitBinOp(node) {
    const op = node.op.type;
    if (op === tokens.plus) {
      return this.visit(node.left) + this.visit(node.right);
    } else if (op === tokens.minus) {
      return this.visit(node.left) - this.visit(node.right);
    } else if (op === tokens.mul) {
      return this.visit(node.left) * this.visit(node.right);
    } else if (op === tokens.div) {
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
    const val = this.GLOBAL_SCOPE[varName];
    if (!val) {
      throw new Error(`Variable ${varName} is not defined`);
    }
    return val;
  }

  visitNum(node) {
    return node.value;
  }

  interpret() {
    return this.visit(this.parser.parse());
  }
}

export default Interpreter;
