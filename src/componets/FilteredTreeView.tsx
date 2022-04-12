import { useState, useEffect } from 'react';

import style from './FilteredTreeView.module.css';
import { TreeView, TreeNodeT } from './TreeView';

export type filterFn<T extends TreeNodeT<T>> = (test: RegExp, item: T) => boolean;

type FilteredTreeViewProps<T extends TreeNodeT<T>> = {
  data: T[];
  onChange: (arg: T) => void;
  filter: filterFn<T>;
  className: string;
};

function isNumber(item: number | null): item is number {
  return item !== null;
}

export const FilteredTreeView = <T extends TreeNodeT<T>,>({ data, onChange, className, filter }: FilteredTreeViewProps<T>) => {
  const [ displayList, setDisplayList ] = useState<number[] | null>(null);

  const getIndexList = (flags: boolean[]): number[] => {
    return flags.map((flag, i) => flag ? i : null).filter(isNumber);
  };

  useEffect(() => {
    setDisplayList(null);
  }, []);

  const filterNotes = (value: string) => {
    if (value) {
      const re = new RegExp(value);
      setDisplayList(getIndexList(data.map((item: T) => filter(re, item))));
    } else {
      setDisplayList(null);
    }
  };

  return (
    <div className={className}>
      <input className={style.filter} onChange={e => filterNotes(e.target.value)}/>
      <TreeView data={displayList ? displayList.map(i => data[i]) : data}
                onChange={(arg) => onChange(arg)} />
    </div>
  );
};
