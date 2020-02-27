"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Lint = require("tslint");
var typescript_1 = require("typescript");
var ruleHelpers_1 = require("./ruleHelpers");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.filePattern = '^.*.(effects|reducer|actions).ts$';
        return _this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var _this = this;
        return this.applyWithFunction(sourceFile, function (ctx) {
            sourceFile.statements
                .filter(function (stm) { return stm.kind === typescript_1.SyntaxKind.ImportDeclaration; })
                .forEach(function (node) {
                _this.visitImportDeclaration(ctx, node);
            });
        });
    };
    Rule.prototype.visitImportDeclaration = function (ctx, importStatement) {
        var fromStringToken = ruleHelpers_1.RuleHelpers.getNextChildTokenOfKind(importStatement, typescript_1.SyntaxKind.StringLiteral);
        var fromStringText = fromStringToken.getText().substring(1, fromStringToken.getText().length - 1);
        if (new RegExp(this.filePattern).test(importStatement.getSourceFile().fileName) &&
            importStatement.getChildAt(1).getChildAt(0).kind === typescript_1.SyntaxKind.NamespaceImport) {
            ctx.addFailureAtNode(importStatement, "Star imports in ngrx store files are banned.");
        }
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
