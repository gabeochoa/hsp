import { useState } from 'react';

const Link = (props: JSX.IntrinsicElements['a']) => (
  <a
    className="text-pink-500 underline hover:no-underline dark:text-pink-400"
    {...props}
  />
);

interface ICard {
  id: number;
  label: string;
}

export default function App() {
  const [items, setItems] = useState<ICard[]>([
    { id: 0, label: 'item 1' },
    { id: 1, label: 'item 2' },
    { id: 2, label: 'item 3' },
  ]);
  const [draggedList, setDraggedList] = useState<ICard[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const target = `mt-4 p-4 bg-white rounded-lg shadow-lg border-dashed border-2 min-h-60 ${isDragging ? 'border-black' : 'border-indigo-300'}`;

  return (
    <div className="mx-auto my-8 mt-10 w-8/12 rounded border border-gray-200 p-4 shadow-md dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-none">
      <h1 className="mb-4 text-4xl">Welcome</h1>
      <div className="grid grid-cols-2 gap-1">
        <div className="mt-5 rounded-lg bg-white p-4 shadow-lg">
          <ul className="m-0 min-h-40 list-none border border-indigo-600 bg-indigo-300 p-0">
            {items.map((item) => {
              return (
                <li
                  className="mb-2 cursor-move border border-indigo-300 bg-white p-4"
                  draggable={true}
                  id={`${item.id}`}
                  key={item.id}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('id', event.currentTarget.id);
                  }}
                >
                  {item.label}
                </li>
              );
            })}
          </ul>
        </div>
        <div
          className={target}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            const id = event.dataTransfer.getData('id');
            const item = items.find((x) => x.id == Number(id));
            if (item) {
              setDraggedList([...draggedList, item]);
              setIsDragging(false);
              setItems(
                items.filter((el) => {
                  return el.id != item.id;
                }),
              );
            }
          }}
        >
          <ul>
            {draggedList.map((item) => {
              return (
                <li
                  className="mb-2 cursor-move border border-indigo-300 bg-white p-4"
                  id={`{item.id}`}
                  key={item.id}
                >
                  {item.label}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
