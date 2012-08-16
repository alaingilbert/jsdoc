/**
 * This class implements the JavaScript scanner.
 *
 * It is based on the C source files jsscan.c and jsscan.h
 * in the jsref package.
 *
 * @see org.mozilla.javascript.Parser
 *
 * @author Mike McCabe
 * @author Brendan Eich
 */
var Token = function() {
};

Token.CommentType = {
  LINE: 0, BLOCK_COMMENT: 1, JSDOC: 2, HTML: 3
};


// debug flags
Token.printTrees = false;
Token.printICode = false;
Token.printNames = Token.printTrees || Token.printICode;


    /**
     * Token types.  These values correspond to JSTokenType values in
     * jsscan.c.
     */

    // start enum
        Token.ERROR          = -1; // well-known as the only code < EOF
        Token.EOF            = 0;  // end of file token - (not EOF_CHAR)
        Token.EOL            = 1;  // end of line

        // Interpreter reuses the following as bytecodes
        Token.FIRST_BYTECODE_TOKEN    = 2;

        Token.ENTERWITH      = 2;
        Token.LEAVEWITH      = 3;
        Token.RETURN         = 4;
        Token.GOTO           = 5;
        Token.IFEQ           = 6;
        Token.IFNE           = 7;
        Token.SETNAME        = 8;
        Token.BITOR          = 9;
        Token.BITXOR         = 10;
        Token.BITAND         = 11;
        Token.EQ             = 12;
        Token.NE             = 13;
        Token.LT             = 14;
        Token.LE             = 15;
        Token.GT             = 16;
        Token.GE             = 17;
        Token.LSH            = 18;
        Token.RSH            = 19;
        Token.URSH           = 20;
        Token.ADD            = 21;
        Token.SUB            = 22;
        Token.MUL            = 23;
        Token.DIV            = 24;
        Token.MOD            = 25;
        Token.NOT            = 26;
        Token.BITNOT         = 27;
        Token.POS            = 28;
        Token.NEG            = 29;
        Token.NEW            = 30;
        Token.DELPROP        = 31;
        Token.TYPEOF         = 32;
        Token.GETPROP        = 33;
        Token.GETPROPNOWARN  = 34;
        Token.SETPROP        = 35;
        Token.GETELEM        = 36;
        Token.SETELEM        = 37;
        Token.CALL           = 38;
        Token.NAME           = 39;
        Token.NUMBER         = 40;
        Token.STRING         = 41;
        Token.NULL           = 42;
        Token.THIS           = 43;
        Token.FALSE          = 44;
        Token.TRUE           = 45;
        Token.SHEQ           = 46;   // shallow equality (===)
        Token.SHNE           = 47;   // shallow inequality (!==)
        Token.REGEXP         = 48;
        Token.BINDNAME       = 49;
        Token.THROW          = 50;
        Token.RETHROW        = 51; // rethrow caught exception: catch (e if ) use it
        Token.IN             = 52;
        Token.INSTANCEOF     = 53;
        Token.LOCAL_LOAD     = 54;
        Token.GETVAR         = 55;
        Token.SETVAR         = 56;
        Token.CATCH_SCOPE    = 57;
        Token.ENUM_INIT_KEYS = 58;
        Token.ENUM_INIT_VALUES = 59;
        Token.ENUM_INIT_ARRAY= 60;
        Token.ENUM_NEXT      = 61;
        Token.ENUM_ID        = 62;
        Token.THISFN         = 63;
        Token.RETURN_RESULT  = 64; // to return previously stored return result
        Token.ARRAYLIT       = 65; // array literal
        Token.OBJECTLIT      = 66; // object literal
        Token.GET_REF        = 67; // *reference
        Token.SET_REF        = 68; // *reference    = something
        Token.DEL_REF        = 69; // delete reference
        Token.REF_CALL       = 70; // f(args)    = something or f(args)++
        Token.REF_SPECIAL    = 71; // reference for special properties like __proto
        Token.YIELD          = 72;  // JS 1.7 yield pseudo keyword
        Token.STRICT_SETNAME = 73;

        // For XML support:
        Token.DEFAULTNAMESPACE = 74; // default xml namespace =
        Token.ESCXMLATTR     = 75;
        Token.ESCXMLTEXT     = 76;
        Token.REF_MEMBER     = 77; // Reference for x.@y, x..y etc.
        Token.REF_NS_MEMBER  = 78; // Reference for x.ns::y, x..ns::y etc.
        Token.REF_NAME       = 79; // Reference for @y, @[y] etc.
        Token.REF_NS_NAME    = 80; // Reference for ns::y, @ns::y@[y] etc.

        // End of interpreter bytecodes
        Token.LAST_BYTECODE_TOKEN    = Token.REF_NS_NAME;

        Token.TRY            = 81;
        Token.SEMI           = 82;  // semicolon
        Token.LB             = 83;  // left and right brackets
        Token.RB             = 84;
        Token.LC             = 85;  // left and right curlies (braces)
        Token.RC             = 86;
        Token.LP             = 87;  // left and right parentheses
        Token.RP             = 88;
        Token.COMMA          = 89;  // comma operator

        Token.ASSIGN         = 90;  // simple assignment  (=)
        Token.ASSIGN_BITOR   = 91;  // |=
        Token.ASSIGN_BITXOR  = 92;  // ^=
        Token.ASSIGN_BITAND  = 93;  // |=
        Token.ASSIGN_LSH     = 94;  // <<=
        Token.ASSIGN_RSH     = 95;  // >>=
        Token.ASSIGN_URSH    = 96;  // >>>=
        Token.ASSIGN_ADD     = 97;  // +=
        Token.ASSIGN_SUB     = 98;  // -=
        Token.ASSIGN_MUL     = 99;  // *=
        Token.ASSIGN_DIV     = 100;  // /=
        Token.ASSIGN_MOD     = 101;  // %=

        Token.FIRST_ASSIGN   = Token.ASSIGN;
        Token.LAST_ASSIGN    = Token.ASSIGN_MOD;

        Token.HOOK           = 102; // conditional (?:)
        Token.COLON          = 103;
        Token.OR             = 104; // logical or (||)
        Token.AND            = 105; // logical and (&&)
        Token.INC            = 106; // increment/decrement (++ --)
        Token.DEC            = 107;
        Token.DOT            = 108; // member operator (.)
        Token.FUNCTION       = 109; // function keyword
        Token.EXPORT         = 110; // export keyword
        Token.IMPORT         = 111; // import keyword
        Token.IF             = 112; // if keyword
        Token.ELSE           = 113; // else keyword
        Token.SWITCH         = 114; // switch keyword
        Token.CASE           = 115; // case keyword
        Token.DEFAULT        = 116; // default keyword
        Token.WHILE          = 117; // while keyword
        Token.DO             = 118; // do keyword
        Token.FOR            = 119; // for keyword
        Token.BREAK          = 120; // break keyword
        Token.CONTINUE       = 121; // continue keyword
        Token.VAR            = 122; // var keyword
        Token.WITH           = 123; // with keyword
        Token.CATCH          = 124; // catch keyword
        Token.FINALLY        = 125; // finally keyword
        Token.VOID           = 126; // void keyword
        Token.RESERVED       = 127; // reserved keywords

        Token.EMPTY          = 128;

        /* types used for the parse tree - these never get returned
         * by the scanner.
         */

        Token.BLOCK          = 129; // statement block
        Token.LABEL          = 130; // label
        Token.TARGET         = 131;
        Token.LOOP           = 132;
        Token.EXPR_VOID      = 133; // expression statement in functions
        Token.EXPR_RESULT    = 134; // expression statement in scripts
        Token.JSR            = 135;
        Token.SCRIPT         = 136; // top-level node for entire script
        Token.TYPEOFNAME     = 137; // for typeof(simple-name)
        Token.USE_STACK      = 138;
        Token.SETPROP_OP     = 139; // x.y op= something
        Token.SETELEM_OP     = 140; // x[y] op= something
        Token.LOCAL_BLOCK    = 141;
        Token.SET_REF_OP     = 142; // *reference op= something

        // For XML support:
        Token.DOTDOT         = 143;  // member operator (..)
        Token.COLONCOLON     = 144;  // namespace::name
        Token.XML            = 145;  // XML type
        Token.DOTQUERY       = 146;  // .() -- e.g., x.emps.emp.(name == "terry")
        Token.XMLATTR        = 147;  // @
        Token.XMLEND         = 148;

        // Optimizer-only-tokens
        Token.TO_OBJECT      = 149;
        Token.TO_DOUBLE      = 150;

        Token.GET            = 151;  // JS 1.5 get pseudo keyword
        Token.SET            = 152;  // JS 1.5 set pseudo keyword
        Token.LET            = 153;  // JS 1.7 let pseudo keyword
        Token.CONST          = 154;
        Token.SETCONST       = 155;
        Token.SETCONSTVAR    = 156;
        Token.ARRAYCOMP      = 157;  // array comprehension
        Token.LETEXPR        = 158;
        Token.WITHEXPR       = 159;
        Token.DEBUGGER       = 160;
        Token.COMMENT        = 161;
        Token.GENEXPR        = 162;
        Token.LAST_TOKEN     = 163;

    /**
     * Returns a name for the token.  If Rhino is compiled with certain
     * hardcoded debugging flags in this file, it calls {@code #typeToName};
     * otherwise it returns a string whose value is the token number.
     * @param {number} token
     * @return {string}
     */
    Token.name = function(token) {
      if (!Token.printNames) {
        return token.toString();
      }
      return Token.typeToName(token);
    };

    /**
     * Always returns a human-readable string for the token name.
     * For instance, {@link #FINALLY} has the name "FINALLY".
     * @param {number} token the token code
     * @return {string} the actual name for the token code
     */
    Token.typeToName = function(token) {
        switch (token) {
          case Token.ERROR:           return "ERROR";
          case Token.EOF:             return "EOF";
          case Token.EOL:             return "EOL";
          case Token.ENTERWITH:       return "ENTERWITH";
          case Token.LEAVEWITH:       return "LEAVEWITH";
          case Token.RETURN:          return "RETURN";
          case Token.GOTO:            return "GOTO";
          case Token.IFEQ:            return "IFEQ";
          case Token.IFNE:            return "IFNE";
          case Token.SETNAME:         return "SETNAME";
          case Token.BITOR:           return "BITOR";
          case Token.BITXOR:          return "BITXOR";
          case Token.BITAND:          return "BITAND";
          case Token.EQ:              return "EQ";
          case Token.NE:              return "NE";
          case Token.LT:              return "LT";
          case Token.LE:              return "LE";
          case Token.GT:              return "GT";
          case Token.GE:              return "GE";
          case Token.LSH:             return "LSH";
          case Token.RSH:             return "RSH";
          case Token.URSH:            return "URSH";
          case Token.ADD:             return "ADD";
          case Token.SUB:             return "SUB";
          case Token.MUL:             return "MUL";
          case Token.DIV:             return "DIV";
          case Token.MOD:             return "MOD";
          case Token.NOT:             return "NOT";
          case Token.BITNOT:          return "BITNOT";
          case Token.POS:             return "POS";
          case Token.NEG:             return "NEG";
          case Token.NEW:             return "NEW";
          case Token.DELPROP:         return "DELPROP";
          case Token.TYPEOF:          return "TYPEOF";
          case Token.GETPROP:         return "GETPROP";
          case Token.GETPROPNOWARN:   return "GETPROPNOWARN";
          case Token.SETPROP:         return "SETPROP";
          case Token.GETELEM:         return "GETELEM";
          case Token.SETELEM:         return "SETELEM";
          case Token.CALL:            return "CALL";
          case Token.NAME:            return "NAME";
          case Token.NUMBER:          return "NUMBER";
          case Token.STRING:          return "STRING";
          case Token.NULL:            return "NULL";
          case Token.THIS:            return "THIS";
          case Token.FALSE:           return "FALSE";
          case Token.TRUE:            return "TRUE";
          case Token.SHEQ:            return "SHEQ";
          case Token.SHNE:            return "SHNE";
          case Token.REGEXP:          return "REGEXP";
          case Token.BINDNAME:        return "BINDNAME";
          case Token.THROW:           return "THROW";
          case Token.RETHROW:         return "RETHROW";
          case Token.IN:              return "IN";
          case Token.INSTANCEOF:      return "INSTANCEOF";
          case Token.LOCAL_LOAD:      return "LOCAL_LOAD";
          case Token.GETVAR:          return "GETVAR";
          case Token.SETVAR:          return "SETVAR";
          case Token.CATCH_SCOPE:     return "CATCH_SCOPE";
          case Token.ENUM_INIT_KEYS:  return "ENUM_INIT_KEYS";
          case Token.ENUM_INIT_VALUES:return "ENUM_INIT_VALUES";
          case Token.ENUM_INIT_ARRAY: return "ENUM_INIT_ARRAY";
          case Token.ENUM_NEXT:       return "ENUM_NEXT";
          case Token.ENUM_ID:         return "ENUM_ID";
          case Token.THISFN:          return "THISFN";
          case Token.RETURN_RESULT:   return "RETURN_RESULT";
          case Token.ARRAYLIT:        return "ARRAYLIT";
          case Token.OBJECTLIT:       return "OBJECTLIT";
          case Token.GET_REF:         return "GET_REF";
          case Token.SET_REF:         return "SET_REF";
          case Token.DEL_REF:         return "DEL_REF";
          case Token.REF_CALL:        return "REF_CALL";
          case Token.REF_SPECIAL:     return "REF_SPECIAL";
          case Token.DEFAULTNAMESPACE:return "DEFAULTNAMESPACE";
          case Token.ESCXMLTEXT:      return "ESCXMLTEXT";
          case Token.ESCXMLATTR:      return "ESCXMLATTR";
          case Token.REF_MEMBER:      return "REF_MEMBER";
          case Token.REF_NS_MEMBER:   return "REF_NS_MEMBER";
          case Token.REF_NAME:        return "REF_NAME";
          case Token.REF_NS_NAME:     return "REF_NS_NAME";
          case Token.TRY:             return "TRY";
          case Token.SEMI:            return "SEMI";
          case Token.LB:              return "LB";
          case Token.RB:              return "RB";
          case Token.LC:              return "LC";
          case Token.RC:              return "RC";
          case Token.LP:              return "LP";
          case Token.RP:              return "RP";
          case Token.COMMA:           return "COMMA";
          case Token.ASSIGN:          return "ASSIGN";
          case Token.ASSIGN_BITOR:    return "ASSIGN_BITOR";
          case Token.ASSIGN_BITXOR:   return "ASSIGN_BITXOR";
          case Token.ASSIGN_BITAND:   return "ASSIGN_BITAND";
          case Token.ASSIGN_LSH:      return "ASSIGN_LSH";
          case Token.ASSIGN_RSH:      return "ASSIGN_RSH";
          case Token.ASSIGN_URSH:     return "ASSIGN_URSH";
          case Token.ASSIGN_ADD:      return "ASSIGN_ADD";
          case Token.ASSIGN_SUB:      return "ASSIGN_SUB";
          case Token.ASSIGN_MUL:      return "ASSIGN_MUL";
          case Token.ASSIGN_DIV:      return "ASSIGN_DIV";
          case Token.ASSIGN_MOD:      return "ASSIGN_MOD";
          case Token.HOOK:            return "HOOK";
          case Token.COLON:           return "COLON";
          case Token.OR:              return "OR";
          case Token.AND:             return "AND";
          case Token.INC:             return "INC";
          case Token.DEC:             return "DEC";
          case Token.DOT:             return "DOT";
          case Token.FUNCTION:        return "FUNCTION";
          case Token.EXPORT:          return "EXPORT";
          case Token.IMPORT:          return "IMPORT";
          case Token.IF:              return "IF";
          case Token.ELSE:            return "ELSE";
          case Token.SWITCH:          return "SWITCH";
          case Token.CASE:            return "CASE";
          case Token.DEFAULT:         return "DEFAULT";
          case Token.WHILE:           return "WHILE";
          case Token.DO:              return "DO";
          case Token.FOR:             return "FOR";
          case Token.BREAK:           return "BREAK";
          case Token.CONTINUE:        return "CONTINUE";
          case Token.VAR:             return "VAR";
          case Token.WITH:            return "WITH";
          case Token.CATCH:           return "CATCH";
          case Token.FINALLY:         return "FINALLY";
          case Token.VOID:            return "VOID";
          case Token.RESERVED:        return "RESERVED";
          case Token.EMPTY:           return "EMPTY";
          case Token.BLOCK:           return "BLOCK";
          case Token.LABEL:           return "LABEL";
          case Token.TARGET:          return "TARGET";
          case Token.LOOP:            return "LOOP";
          case Token.EXPR_VOID:       return "EXPR_VOID";
          case Token.EXPR_RESULT:     return "EXPR_RESULT";
          case Token.JSR:             return "JSR";
          case Token.SCRIPT:          return "SCRIPT";
          case Token.TYPEOFNAME:      return "TYPEOFNAME";
          case Token.USE_STACK:       return "USE_STACK";
          case Token.SETPROP_OP:      return "SETPROP_OP";
          case Token.SETELEM_OP:      return "SETELEM_OP";
          case Token.LOCAL_BLOCK:     return "LOCAL_BLOCK";
          case Token.SET_REF_OP:      return "SET_REF_OP";
          case Token.DOTDOT:          return "DOTDOT";
          case Token.COLONCOLON:      return "COLONCOLON";
          case Token.XML:             return "XML";
          case Token.DOTQUERY:        return "DOTQUERY";
          case Token.XMLATTR:         return "XMLATTR";
          case Token.XMLEND:          return "XMLEND";
          case Token.TO_OBJECT:       return "TO_OBJECT";
          case Token.TO_DOUBLE:       return "TO_DOUBLE";
          case Token.GET:             return "GET";
          case Token.SET:             return "SET";
          case Token.LET:             return "LET";
          case Token.YIELD:           return "YIELD";
          case Token.CONST:           return "CONST";
          case Token.SETCONST:        return "SETCONST";
          case Token.ARRAYCOMP:       return "ARRAYCOMP";
          case Token.WITHEXPR:        return "WITHEXPR";
          case Token.LETEXPR:         return "LETEXPR";
          case Token.DEBUGGER:        return "DEBUGGER";
          case Token.COMMENT:         return "COMMENT";
          case Token.GENEXPR:         return "GENEXPR";
        }

        // Token without name
        throw new Error(token.toString());
    };

    /**
     * Convert a keyword token to a name string for use with the
     * {@link Context.FEATURE_RESERVED_KEYWORD_AS_IDENTIFIER} feature.
     * @param {number} token A token
     * @return {string} the corresponding name string
     */
    Token.keywordToName = function(token) {
        switch (token) {
            case Token.BREAK:      return "break";
            case Token.CASE:       return "case";
            case Token.CONTINUE:   return "continue";
            case Token.DEFAULT:    return "default";
            case Token.DELPROP:    return "delete";
            case Token.DO:         return "do";
            case Token.ELSE:       return "else";
            case Token.FALSE:      return "false";
            case Token.FOR:        return "for";
            case Token.FUNCTION:   return "function";
            case Token.IF:         return "if";
            case Token.IN:         return "in";
            case Token.LET:        return "let";
            case Token.NEW:        return "new";
            case Token.NULL:       return "null";
            case Token.RETURN:     return "return";
            case Token.SWITCH:     return "switch";
            case Token.THIS:       return "this";
            case Token.TRUE:       return "true";
            case Token.TYPEOF:     return "typeof";
            case Token.VAR:        return "var";
            case Token.VOID:       return "void";
            case Token.WHILE:      return "while";
            case Token.WITH:       return "with";
            case Token.YIELD:      return "yield";
            case Token.CATCH:      return "catch";
            case Token.CONST:      return "const";
            case Token.DEBUGGER:   return "debugger";
            case Token.FINALLY:    return "finally";
            case Token.INSTANCEOF: return "instanceof";
            case Token.THROW:      return "throw";
            case Token.TRY:        return "try";
            default:               return null;
        }
    };

    /**
     * Return true if the passed code is a valid Token constant.
     * @param {number} code a potential token code
     * @return {boolean} true if it's a known token
     */
    Token.isValidToken = function(code) {
      return code >= Token.ERROR && code <= Token.LAST_TOKEN;
    };
