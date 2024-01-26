import { useContext } from 'react';
import { Tray } from './Tray.tsx';
import { TrayContext, TrayContextProvider } from './TrayContext.tsx';
import { Entity, IsTray } from './Types.tsx';

function NewArrivals() {
  const { trays } = useContext(TrayContext);

  return (
    <div className="w-full">
      {trays.map((tray: Entity, index: number) => {
        if (index != 0) {
          return null;
        }
        return (
          <Tray
            cards={tray.get<IsTray>('IsTray').cards}
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
    <div className="w-full">
      {trays.map((tray: Entity, index: number) => {
        if (index == 0) {
          return null;
        }
        return (
          <Tray
            cards={tray.get<IsTray>('IsTray').cards}
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
  const { medicine, patients_lost } = useContext(TrayContext);

  return (
    <div>
      <div className="mb-2 text-xl font-bold">
        Medicine Supplies: {medicine}
      </div>
      <div className="mb-2 text-xl font-bold">
        Lost Patients: {patients_lost}
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className="mx-auto h-dvh w-10/12 overflow-scroll rounded border border-gray-200 p-4 dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-none">
      <h1 className="mb-4 text-4xl">Welcome</h1>
      <Supplies />
      <div className="grid grid-cols-3 gap-x-4">
        <div>
          <NewArrivals />
        </div>
        <div>
          <Doctors />
        </div>
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
