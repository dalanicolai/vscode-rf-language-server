import * as _ from "lodash";

import * as Models from "../parser/models";

export const VisitorOption = {
  Skip: {},
  Break: {}
};

const NodeSettings = {
  TestSuite: {
    orderEnsured: false,
    children: ["settingsTable", "variablesTable", "keywordsTable", "testCasesTable"]
  },
  SettingsTable: {
    orderEnsured: false,
    children: [
      "suiteSetup", "suiteTeardown",
      "testSetup", "testTeardown",
      "libraryImports", "resourceImports", "variableImports"
    ]
  },
  SuiteSetting: {
    orderEnsured: true,
    children: ["name", "value"]
  },
  LibraryImport: {
    orderEnsured: true,
    children: ["target", "args"]
  },
  ResourceImport: {
    orderEnsured: true,
    children: ["target"]
  },
  VariableImport: {
    orderEnsured: true,
    children: ["target"]
  },
  VariablesTable: {
    orderEnsured: true,
    children: ["variables"]
  },
  ScalarDeclaration: {
    orderEnsured: true,
    children: ["id", "value"]
  },
  ListDeclaration: {
    orderEnsured: true,
    children: ["id", "values"]
  },
  DictionaryDeclaration: {
    orderEnsured: true,
    children: ["id", "values"]
  },
  TestCasesTable: {
    orderEnsured: true,
    children: ["testCases"]
  },
  TestCase: {
    orderEnsured: true,
    children: ["id", "steps"]
  },
  Step: {
    orderEnsured: true,
    children: ["body"]
  },
  CallExpression: {
    orderEnsured: true,
    children: ["callee", "args"]
  },
  VariableExpression: {
    orderEnsured: true,
    children: ["id"]
  },
  Literal: {
    orderEnsured: true,
    children: []
  },
  TemplateLiteral: {
    orderEnsured: false,
    children: ["quasis", "expressions"]
  }
};

export interface Visitor {
  enter: Function;
  leave: Function;
};

function visit(node, parent, visitor) {
  if (visitor.enter) {
    return visitor.enter(node, parent);
  } else {
    return null;
  }
}

function leave(node, parent, visitor) {
  if (visitor.leave) {
    return visitor.leave(node, parent);
  } else {
    return null;
  }
}

export function traverse(parent: Models.Node, node: Models.Node, visitor) {
  // Naive recursive implementation
  // TODO: Remove recursivity
  if (!node) {
    return;
  }

  const visitResult = visit(node, parent, visitor);

  if (visitResult !== VisitorOption.Skip) {
    const nodeSettings = NodeSettings[node.type];

    if (nodeSettings && !_.isEmpty(nodeSettings.children)) {
      // TODO: Check order

      nodeSettings.children.forEach(propertyName => {
        const childNode = node[propertyName];

        if (_.isArray(childNode)) {
          childNode.forEach(item => traverse(node, <Models.Node>item, visitor));
        } else {
          traverse(node, childNode, visitor);
        }
      });
    }
  }

  leave(node, parent, visitor);
}
