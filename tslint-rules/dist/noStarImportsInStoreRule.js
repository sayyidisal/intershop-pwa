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
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        if (sourceFile.fileName.includes('.effects.ts' || '.actions.ts' || '.reducer.ts' || '.selectors.ts')) {
            return this.applyWithWalker(new NoStarImportsInStoreRule(sourceFile, this.getOptions()));
        }
        else {
            return [];
        }
    };
    Rule.FAILURE_STRING = 'star import in ngrx store files is forbidden';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
// The walker takes care of all the work.
var NoStarImportsInStoreRule = /** @class */ (function (_super) {
    __extends(NoStarImportsInStoreRule, _super);
    function NoStarImportsInStoreRule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoStarImportsInStoreRule.prototype.visitNamespaceImport = function (node) {
        // create a failure at the current position
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        // call the base version of this visitor to actually parse this node
        _super.prototype.visitNamespaceImport.call(this, node);
    };
    return NoStarImportsInStoreRule;
}(Lint.RuleWalker));
