import Lexer, { tokens } from "./lexer.mjs";
import Parser from "./parser.mjs";
import Interpreter, { SymbolTableBuilder } from "./interpreter.mjs";
/* 
    program : PROGRAM variable SEMI block DOT

    block : declarations compound_statement

    declarations : VAR (variable_declaration SEMI)+
                 | empty

    variable_declaration : ID (COMMA ID)* COLON type_spec

    type_spec : INTEGER | REAL

    compound_statement : BEGIN statement_list END

    statement_list : statement
                   | statement SEMI statement_list

    statement : compound_statement
              | assignment_statement
              | empty

    assignment_statement : variable ASSIGN expr

    empty :

    expr : term ((PLUS | MINUS) term)*

    term : factor ((MUL | INTEGER_DIV | FLOAT_DIV) factor)*

    factor : PLUS factor
           | MINUS factor
           | INTEGER_CONST
           | REAL_CONST
           | LPAREN expr RPAREN
           | variable

    variable: ID
 */

const lexer = new Lexer(`
PROGRAM Part11;
VAR
   number : INTEGER;
   a, b   : INTEGER;
   y      : REAL;

BEGIN {Part11}
   number := 2;
   a := number ;
   b := 10 * a + 10 * number DIV 4;
   y := 20 / 7 + 3.14
END.  {Part11}
`);

let parser = new Parser(lexer);
const tree = parser.parse();
const symtabBuild = new SymbolTableBuilder();
symtabBuild.visit(tree);
console.log("----------------\n Symbtab contents");
console.log(symtabBuild.symtab);

const intp = new Interpreter(tree);
const result = intp.interpret();
console.log("\n\nglobal memory contents are\n\n", result);
console.log(intp.GLOBAL_MEMORY);
