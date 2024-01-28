export function Header({ children }) {
  return (
    <h1 className="mb-4 text-4xl text-black dark:text-white">{children}</h1>
  );
}

export function TextXL({ children }) {
  return (
    <div className="mb-2 text-xl font-bold dark:text-white">{children}</div>
  );
}

export function BasicText({ children }) {
  return <p className={'dark:text-white'}>{children}</p>;
}
