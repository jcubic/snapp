import { Link } from 'react-router-dom';

import { tree } from './TreeView.module.css';

type TreeNodeT<T> = {
  name: string;
  id: number;
  childNodes?: T[];
};

export type RenderProp<T> = (arg: T) => JSX.Element;

type TreeNodeProps<T> = {
  node: T;
  link: RenderProp<T>;
};

const TreeNode = <T extends TreeNodeT<T>,>({ node, link }: TreeNodeProps<T>) => {
  const { name, childNodes } = node;
  if (!childNodes) {
    return link(node);
  }
  return (
    <details open>
      <summary>{name}</summary>
      <TreeList nodes={childNodes} link={link} />
    </details>
  );
};


type TreeList<T> = Array<TreeNodeT<T>>;

type TreeListProps<T> = {
  nodes: Array<T>;
  link: RenderProp<T>;
};

const TreeList = <T extends TreeNodeT<T>,>({ nodes, link}: TreeListProps<T>) => {
  return (
    <ul>
      {nodes.map((node) => {
        return (
          <li key={node.id}>
            <TreeNode node={node} link={link} />
          </li>
        );
      })}
    </ul>
  );
};

type TreeViewProps<T> = {
  data: Array<T>;
  link: RenderProp<T>
};

const TreeView = <T extends TreeNodeT<T>,>({ data, link }: TreeViewProps<T>) => {
  return (
    <div className={tree}>
      <TreeList nodes={data} link={link} />
    </div>
  );
};

export type { TreeNodeT };

export { TreeView };
