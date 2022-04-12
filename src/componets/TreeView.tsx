import { tree } from './TreeView.module.css';

type TreeNodeT<T> = {
  name: string;
  id: number;
  childNodes?: T[];
};

type TreeNodeCallback<T> = (item: T) => void;

type TreeNodeProps<T> = {
  node: T;
  onChange?: TreeNodeCallback<T>;
};

const TreeNode = <T extends TreeNodeT<T>,>({ node, onChange }: TreeNodeProps<T>) => {
  const { name, childNodes } = node;
  if (!childNodes) {
    return <span onClick={() => onChange?.(node)}>{name}</span>;
  }
  return (
    <details open>
      <summary>{name}</summary>
      <TreeList nodes={childNodes} onChange={onChange}/>
    </details>
  );
};


type TreeList<T> = Array<TreeNodeT<T>>;

type TreeListProps<T> = {
  nodes: Array<T>;
  onChange?: TreeNodeCallback<T>;
};

const TreeList = <T extends TreeNodeT<T>,>({ nodes, onChange }: TreeListProps<T>) => {
  return (
    <ul>
      {nodes.map((node) => {
        return (
          <li key={node.id}>
            <TreeNode node={node} onChange={onChange} />
          </li>
        );
      })}
    </ul>
  );
};

type TreeViewProps<T> = {
  data: Array<T>;
  onChange?: TreeNodeCallback<T>;
};

const TreeView = <T extends TreeNodeT<T>,>({ data, onChange }: TreeViewProps<T>) => {
  return (
    <div className={tree}>
      <TreeList nodes={data} onChange={onChange}/>
    </div>
  );
};

export type { TreeNodeT };

export { TreeView };
