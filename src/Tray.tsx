import { useContext } from 'react';
import { TrayContext } from './TrayContext.tsx';
import { Card, TrayType } from './Types.tsx';

export function Tray({
  cards,
  extra,
  horizontal,
  id,
  max_cards,
  name,
  type,
}: {
  cards: Card[];
  extra: ITray['extra'];
  horizontal: boolean;
  id: string;
  max_cards: number;
  name: string;
  type: ITray['type'];
}) {
  const { moveCard } = useContext(TrayContext);
  const size = 100;
  const tray_height = !horizontal ? size * 1.1 * max_cards : 110;
  const tray_width = horizontal ? size * 1.1 * max_cards : 110;
  const num_placeholders = max_cards - cards.length;

  let extra_component = null;
  switch (type) {
    case TrayType.Hold:
      extra_component = null;
      break;
    case TrayType.Doctor:
      extra_component = <div>{extra.energy}</div>;
      break;
  }

  return (
    <div
      className="mt-5 rounded-lg p-4 shadow-lg"
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (cards.length == max_cards) {
          return;
        }

        const data = JSON.parse(event.dataTransfer.getData('data'));
        const { card_id, tray_id } = data;
        moveCard(Number(tray_id), Number(id), Number(card_id));
      }}
    >
      <div className="mb-2 text-xl font-bold">
        {name}
        {extra_component}
      </div>
      <ul
        className={`m-0 list-none border border-indigo-600 bg-indigo-100 p-0 px-1 ${horizontal ? 'flex flex-wrap' : ''}`}
        style={{
          height: tray_height,
          width: tray_width,
        }}
      >
        {cards.map((item: Card) => {
          return (
            <li
              className="mb-2 cursor-move border border-indigo-300 bg-white p-4"
              draggable={true}
              id={`${item.id}`}
              key={item.id}
              onDragStart={(event) => {
                const data = {
                  card_id: event.currentTarget.id,
                  tray_id: id,
                };
                event.dataTransfer.setData('data', JSON.stringify(data));
              }}
              style={{
                height: size,
                width: size,
              }}
            >
              {item.label}({item.ticks_remaining})
            </li>
          );
        })}
        {num_placeholders > 0 &&
          new Array(num_placeholders).map((x, index) => {
            return (
              <li
                className="mb-2 cursor-move border border-indigo-300 bg-white p-4"
                key={index}
                style={{
                  height: size,
                  width: size,
                }}
              ></li>
            );
          })}
      </ul>
    </div>
  );
}
