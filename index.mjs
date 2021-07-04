import Lexer, { tokens } from "./lexer.mjs";
import Parser from "./parser.mjs";
import Interpreter from "./interpreter.mjs";
/**
 *  program : compound_statement DOT
 *  compound_statement : BEGIN statement_list END
 *  statement_list : statement
                   | statement SEMI statement_list
 * statement : compound_statement
              | assignment_statement
              | empty
 * assignment_statement : variable ASSIGN expr
 * empty :
 * expr: term ((PLUS | MINUS) term)*
 * term: factor ((MUL | DIV) factor)*
 * factor : PLUS factor
           | MINUS factor
           | INTEGER
           | LPAREN expr RPAREN
           | variable

 * variable: ID 
 */

const lexer = new Lexer(`BEGIN
    BEGIN
        number := 2;
        a := number;
        b := 10 * a + 10 * number / 4;
        c := a - - b
    END;
    x := 11;
END.`);

let parser = new Parser(lexer);
let intp = new Interpreter(parser);
