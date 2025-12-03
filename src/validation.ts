import { NodeVisitor } from './ast/visit';
import {
    Declaration,
    FieldDefinition,
    FieldBuiltinDef,
    FieldNamedDef,
    FieldCurlyExprDef,
    Expression,
    NameExpr,
    Program,
    BuiltinOneArgExpr,
    BuiltinZeroArgs,
} from './ast/nodes';

/**
 * Validates that fields used in curly bracket expressions are integer types
 */
export function validate(program: Program): void {
    for (const decl of program.declarations) {
        validateDeclaration(decl);
    }
}

function validateDeclaration(decl: Declaration): void {
    const integerFields = new Set<string>();

    for (const field of decl.fields) {
        const fieldName = getFieldName(field);
        if (fieldName && isNatField(field)) {
            integerFields.add(fieldName);
        }
    }

    for (const field of decl.fields) {
        if (field instanceof FieldCurlyExprDef) {
            validateCurlyExpression(field.expr, integerFields);
        }
    }
}

function getFieldName(field: FieldDefinition): string | null {
    if (field instanceof FieldBuiltinDef) {
        return field.name;
    }
    if (field instanceof FieldNamedDef) {
        return field.name;
    }
    return null;
}

export function isNatField(field: FieldDefinition): boolean {
    if (field instanceof FieldBuiltinDef) {
        return field.type === '#';
    }

    if (field instanceof FieldNamedDef) {
        const expr = field.expr;
        if (expr instanceof BuiltinOneArgExpr) {
            // ##, #<, #<=
            return true;
        }
        if (expr instanceof BuiltinZeroArgs) {
            // #
            return true;
        }
    }

    return false;
}

class ValidationVisitor extends NodeVisitor {
    private integerFields: Set<string>;
    private errors: string[] = [];

    constructor(integerFields: Set<string>) {
        super();
        this.integerFields = integerFields;
    }

    visitNameExpr(node: NameExpr): void {
        const isTypeName = node.name[0] && node.name[0] === node.name[0].toUpperCase();
        const isIntegerField = this.integerFields.has(node.name);
        if (!isIntegerField && !isTypeName) {
            this.errors.push(
                `cannot use field '${node.name}' in an expression unless it is either an integer or a type`,
            );
        }
    }

    getErrors(): string[] {
        return this.errors;
    }
}

function validateCurlyExpression(expr: Expression, integerFields: Set<string>): void {
    const visitor = new ValidationVisitor(integerFields);
    visitor.visit(expr);

    const errors = visitor.getErrors();
    if (errors.length > 0) {
        throw new Error(errors.join('; '));
    }
}
