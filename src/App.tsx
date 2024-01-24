import { useContext } from 'react';
import { Tray } from './Tray.tsx';
import { TrayContext, TrayContextProvider } from './TrayContext.tsx';

function NewArrivals() {
  const { trays } = useContext(TrayContext);

  return (
    <div className="break-after-column">
      {trays.map((tray: ITray, index: number) => {
        if (index != 0) {
          return null;
        }
        return (
          <Tray
            cards={tray.cards}
            horizontal={false}
            key={tray.id}
            max_cards={5}
            tray={tray}
          />
        );
      })}
    </div>
  );
}

function Doctors() {
  const { trays } = useContext(TrayContext);

  return (
    <div className="">
      {trays.map((tray: ITray, index: number) => {
        if (index == 0) {
          return null;
        }
        return (
          <Tray
            cards={tray.cards}
            horizontal={true}
            key={tray.id}
            max_cards={3}
            tray={tray}
          />
        );
      })}
    </div>
  );
}

function Supplies() {
  const { medicine } = useContext(TrayContext);

  return (
    <div className="mb-2 text-xl font-bold">Medicine Supplies: {medicine}</div>
  );
}

function Main() {
  return (
    <div className="mx-auto my-8 mt-10 w-8/12 rounded border border-gray-200 p-4 shadow-md dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-none">
      <h1 className="mb-4 text-4xl">Welcome</h1>
      <div className="columns-2 gap-8">
        <Supplies />
        <NewArrivals />
        <Doctors />
      </div>
    </div>
  );
}
export default function App() {
  return (
    <TrayContextProvider>
      <Main />
    </TrayContextProvider>
  );
}
